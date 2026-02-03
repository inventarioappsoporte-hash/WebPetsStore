/**
 * 🔥 Módulo FirebaseOrders - Gestión de Pedidos en Firebase
 * Envía y gestiona pedidos en Firestore para sincronización con admin online
 */

class FirebaseOrders {
  static app = null;
  static db = null;
  static initialized = false;
  static STORE_ID = 'petsstore-b0516';

  // Configuración de Firebase (misma que admin.html)
  static firebaseConfig = {
    apiKey: "AIzaSyDHWTTs1J108hiBeib4d6E5i-HLoDRoDCA",
    authDomain: "petsstore-b0516.firebaseapp.com",
    projectId: "petsstore-b0516",
    storageBucket: "petsstore-b0516.appspot.com",
    messagingSenderId: "",
    appId: ""
  };

  /**
   * Inicializar Firebase
   */
  static async init() {
    if (this.initialized) return true;

    try {
      // Importar Firebase dinámicamente
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      this.app = initializeApp(this.firebaseConfig);
      this.db = getFirestore(this.app);
      this.initialized = true;
      
      console.log('🔥 FirebaseOrders initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      return false;
    }
  }

  /**
   * Generar número de pedido único
   */
  static generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PED-${year}${month}${day}-${random}`;
  }

  /**
   * Crear pedido en Firebase
   * @param {Array} cartItems - Items del carrito
   * @param {Object} customerData - Datos del cliente
   * @param {Object} shippingInfo - Información de envío
   * @returns {Object} - Resultado con orderId y orderNumber
   */
  static async createOrder(cartItems, customerData, shippingInfo = null) {
    try {
      // Inicializar si no está listo
      if (!this.initialized) {
        const success = await this.init();
        if (!success) {
          throw new Error('No se pudo conectar con Firebase');
        }
      }

      // Importar funciones de Firestore
      const { collection, addDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      // Verificar estado mayorista
      const wholesaleStatus = typeof Cart !== 'undefined' ? Cart.getWholesaleStatus() : null;
      const wholesaleUnlocked = wholesaleStatus?.unlocked || false;
      
      // Calcular totales considerando precios mayoristas
      let subtotal = 0;
      const items = cartItems.map(item => {
        const isWholesaleItem = item.priceDisplayMode === 'wholesale';
        const hasDiscount = item.originalPrice && item.originalPrice > item.price;
        
        // Calcular precio efectivo según modo
        let effectivePrice;
        if (isWholesaleItem && hasDiscount) {
          effectivePrice = wholesaleUnlocked ? item.price : item.originalPrice;
        } else {
          effectivePrice = item.price;
        }
        
        const itemTotal = effectivePrice * item.quantity;
        subtotal += itemTotal;
        
        return {
          productId: item.productId || item.id,
          name: item.name,
          price: effectivePrice,
          originalPrice: item.originalPrice || item.price,
          wholesalePrice: isWholesaleItem && hasDiscount ? item.price : null,
          priceDisplayMode: item.priceDisplayMode || 'discount',
          wholesaleApplied: isWholesaleItem && hasDiscount && wholesaleUnlocked,
          quantity: item.quantity,
          subtotal: itemTotal,
          image: item.image || '',
          variant: item.variant ? {
            id: item.variant.id || '',
            attributes: item.variant.attributes || {}
          } : null
        };
      });

      // Calcular envío
      let shippingCost = 0;
      let shippingZone = null;
      
      if (typeof ShippingSelector !== 'undefined' && ShippingSelector.isEnabled()) {
        const shipping = ShippingSelector.calculateShipping(subtotal);
        shippingCost = shipping.cost || 0;
        shippingZone = shipping.zone ? {
          id: shipping.zone.id,
          name: shipping.zone.name,
          type: shipping.zone.type
        } : null;
      }

      const total = subtotal + shippingCost;
      const orderNumber = this.generateOrderNumber();

      // Crear documento del pedido
      const hasWholesaleItems = cartItems.some(item => item.priceDisplayMode === 'wholesale');
      
      const orderData = {
        orderNumber: orderNumber,
        status: 'pending',
        
        // Tipo de pedido
        isWholesaleOrder: hasWholesaleItems && wholesaleUnlocked,
        wholesaleUnlocked: wholesaleUnlocked,
        
        // Cliente
        customerName: customerData.name,
        customerPhone: customerData.phone,
        customerNotes: customerData.notes || '',
        
        // Dirección de envío
        shippingAddress: customerData.shipping ? {
          address: customerData.shipping.address,
          floor: customerData.shipping.floor || '',
          zipcode: customerData.shipping.zipcode || '',
          city: customerData.shipping.city,
          between: customerData.shipping.between || '',
          province: customerData.shipping.province
        } : null,
        
        // Productos
        items: items,
        itemsCount: cartItems.length,
        
        // Totales
        subtotal: subtotal,
        shippingCost: shippingCost,
        shippingZone: shippingZone,
        total: total,
        
        // Timestamps
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        
        // Metadata
        source: 'web',
        userAgent: navigator.userAgent.substring(0, 200)
      };

      // Guardar en Firestore: /tiendas/{storeId}/orders
      const ordersRef = collection(this.db, 'tiendas', this.STORE_ID, 'orders');
      const docRef = await addDoc(ordersRef, orderData);

      console.log('✅ Order created in Firebase:', docRef.id);
      
      return {
        success: true,
        orderId: docRef.id,
        orderNumber: orderNumber
      };

    } catch (error) {
      console.error('❌ Error creating order in Firebase:', error);
      
      // No bloquear el pedido si Firebase falla
      return {
        success: false,
        error: error.message,
        orderNumber: this.generateOrderNumber() // Generar número igual para WhatsApp
      };
    }
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FirebaseOrders = FirebaseOrders;
}
