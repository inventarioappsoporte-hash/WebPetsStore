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

      // Reusar app de FirebaseStock si existe
      if (typeof FirebaseStock !== 'undefined' && FirebaseStock.app) {
        this.app = FirebaseStock.app;
        this.db = FirebaseStock.db;
        console.log('🔥 FirebaseOrders reusing FirebaseStock instance');
      } else {
        this.app = initializeApp(this.firebaseConfig, 'orders-app');
        this.db = getFirestore(this.app);
      }
      
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

      // Nueva lógica mayorista: monto mínimo + cantidad por producto
      // Calcular total usando precios lista
      const cartTotal = cartItems.reduce((sum, item) => {
        const priceForCalc = item.originalPrice || item.price;
        return sum + (priceForCalc * item.quantity);
      }, 0);
      
      // Config mayorista
      const wsConfig = (typeof Cart !== 'undefined' && Cart.wholesaleConfig) || {
        enabled: true,
        min_amount: 150000,
        min_items_per_product: 2
      };
      
      // Verificar si cumple monto mínimo
      const meetsAmount = wsConfig.enabled && cartTotal >= wsConfig.min_amount;
      
      // Calcular cantidad por producto (sumando variantes)
      const productQuantities = {};
      cartItems.forEach(item => {
        const productId = item.productId || item.id;
        productQuantities[productId] = (productQuantities[productId] || 0) + item.quantity;
      });
      
      // Determinar qué productos califican para mayorista
      const minItemsPerProduct = wsConfig.min_items_per_product || wsConfig.min_items || 2;
      const productsWithWholesale = meetsAmount 
        ? Object.keys(productQuantities).filter(pid => productQuantities[pid] >= minItemsPerProduct)
        : [];
      
      // Función para verificar si un producto específico califica
      const productQualifiesForWholesale = (productId) => {
        return meetsAmount && productsWithWholesale.includes(productId);
      };
      
      console.log('🔥 Firebase - meetsAmount:', meetsAmount, 'productsWithWholesale:', productsWithWholesale);
      
      // Calcular totales considerando precios mayoristas por producto
      let subtotal = 0;
      const items = cartItems.map((item, idx) => {
        const isWholesaleItem = item.priceDisplayMode === 'wholesale';
        const hasDiscount = item.originalPrice && item.originalPrice > item.price;
        const productId = item.productId || item.id;
        
        // Verificar si ESTE producto específico califica para mayorista
        const thisProductQualifies = productQualifiesForWholesale(productId);
        
        // DEBUG: Log detallado de cada item
        console.log(`🔥 Firebase Item ${idx}:`, {
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          priceDisplayMode: item.priceDisplayMode,
          isWholesaleItem,
          hasDiscount,
          thisProductQualifies
        });
        
        // Calcular precio efectivo según modo
        let effectivePrice;
        if (isWholesaleItem && hasDiscount) {
          effectivePrice = thisProductQualifies ? item.price : item.originalPrice;
          console.log(`🔥 Firebase Item ${idx} - Mayorista: effectivePrice = ${effectivePrice} (califica: ${thisProductQualifies})`);
        } else {
          effectivePrice = item.price;
          console.log(`🔥 Firebase Item ${idx} - Normal: effectivePrice = ${effectivePrice}`);
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
          wholesaleApplied: isWholesaleItem && hasDiscount && thisProductQualifies,
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

      // Aplicar cupón si existe
      let couponDiscount = 0;
      let couponData = null;
      
      if (customerData.coupon) {
        couponData = {
          code: customerData.coupon.code,
          type: customerData.coupon.type,
          value: customerData.coupon.value,
          discount: customerData.coupon.discount || 0,
          freeShipping: customerData.coupon.freeShipping || false
        };
        couponDiscount = couponData.discount;
        
        // Si el cupón da envío gratis, anular costo de envío (excepto cargo)
        if (couponData.freeShipping && shippingZone && shippingZone.type !== 'cargo') {
          shippingCost = 0;
        }
        
        console.log('🎟️ Firebase - Cupón aplicado:', couponData);
      }

      const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
      const total = subtotalAfterCoupon + shippingCost;
      const orderNumber = this.generateOrderNumber();

      // Crear documento del pedido
      const hasWholesaleItems = cartItems.some(item => item.priceDisplayMode === 'wholesale');
      
      const orderData = {
        orderNumber: orderNumber,
        status: 'pending',
        
        // Tipo de pedido - nueva lógica por producto
        isWholesaleOrder: hasWholesaleItems && productsWithWholesale.length > 0,
        wholesaleUnlocked: meetsAmount,
        productsWithWholesale: productsWithWholesale,
        
        // Cliente
        customerName: customerData.name,
        customerPhone: customerData.phone,
        customerNotes: customerData.notes || '',
        userId: customerData.userId || null,
        
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
        coupon: couponData,
        couponDiscount: couponDiscount,
        subtotalAfterCoupon: subtotalAfterCoupon,
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
      
      // Reservar stock (descontar de inventario)
      await FirebaseOrders.reserveStock(items);

      // 📧 Enviar notificación por email al admin
      console.log('📧 Intentando enviar notificación por email...');
      console.log('📧 EmailNotification disponible:', typeof EmailNotification !== 'undefined');
      
      if (typeof EmailNotification !== 'undefined') {
        try {
          const emailResult = await EmailNotification.sendOrderNotification({
            orderNumber: orderNumber,
            customerName: customerData.name,
            customerPhone: customerData.phone,
            items: items,
            total: total
          });
          console.log('📧 Resultado del envío de email:', emailResult);
        } catch (emailErr) {
          console.warn('⚠️ Email notification failed:', emailErr);
        }
      } else {
        console.warn('⚠️ EmailNotification no está disponible');
      }

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

  /**
   * Reservar stock (descontar del inventario cuando se crea un pedido)
   * @param {Array} items - Items del pedido
   */
  static async reserveStock(items) {
    console.log('📦 Iniciando reserva de stock para', items.length, 'items');
    
    try {
      const { doc, getDoc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      
      for (const item of items) {
        // Determinar el ID del inventario
        let inventoryId;
        if (item.variant && item.variant.id) {
          inventoryId = `v_${item.variant.id}`;
        } else {
          inventoryId = `p_${item.productId}`;
        }
        
        console.log(`📦 Procesando item: ${item.name}, inventoryId: ${inventoryId}, cantidad: ${item.quantity}`);
        
        // Obtener documento de inventario
        const inventoryRef = doc(FirebaseOrders.db, 'tiendas', FirebaseOrders.STORE_ID, 'inventory', inventoryId);
        const inventoryDoc = await getDoc(inventoryRef);
        
        if (inventoryDoc.exists()) {
          const currentStock = inventoryDoc.data().stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          
          // Actualizar stock
          await updateDoc(inventoryRef, {
            stock: newStock,
            updatedAt: new Date()
          });
          
          console.log(`✅ Stock reservado: ${inventoryId} - ${currentStock} → ${newStock}`);
        } else {
          console.warn(`⚠️ Inventario no encontrado: ${inventoryId}`);
        }
      }
      
      console.log('✅ Stock reservado para todos los items del pedido');
    } catch (error) {
      console.error('❌ Error reservando stock:', error);
      // No bloquear el pedido si falla la reserva de stock
    }
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FirebaseOrders = FirebaseOrders;
}
