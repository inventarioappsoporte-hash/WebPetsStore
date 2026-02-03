/**
 * 📱 Módulo WhatsAppSender - Generador de Mensajes para WhatsApp
 * Formatea y envía pedidos del carrito por WhatsApp
 * Integrado con Firebase para registro de pedidos en admin online
 */

class WhatsAppSender {
  /**
   * Enviar pedido completo por WhatsApp + Firebase
   * @param {Array} cartItems - Items del carrito
   * @param {Object} customerData - Datos del cliente
   */
  static async sendOrder(cartItems, customerData) {
    try {
      // Validar datos
      if (!cartItems || cartItems.length === 0) {
        throw new Error('El carrito está vacío');
      }

      if (!customerData.name || !customerData.phone) {
        throw new Error('Faltan datos del cliente');
      }

      // 1. Primero guardar en Firebase (no bloquea si falla)
      let orderNumber = null;
      let firebaseResult = { success: false };
      
      if (typeof FirebaseOrders !== 'undefined') {
        try {
          firebaseResult = await FirebaseOrders.createOrder(cartItems, customerData);
          orderNumber = firebaseResult.orderNumber;
          
          if (firebaseResult.success) {
            console.log('✅ Pedido registrado en Firebase:', orderNumber);
          } else {
            console.warn('⚠️ Firebase no disponible, continuando con WhatsApp');
          }
        } catch (fbError) {
          console.warn('⚠️ Error Firebase (no crítico):', fbError);
        }
      }

      // 2. Obtener número de WhatsApp desde configuración
      const phone = CONSTANTS.WHATSAPP.PHONE;
      
      // 3. Obtener estado mayorista antes de formatear
      const wholesaleStatus = typeof Cart !== 'undefined' ? Cart.getWholesaleStatus() : null;
      
      // 4. Generar mensaje formateado (incluir número de pedido y estado mayorista)
      const message = this.formatOrderMessage(cartItems, customerData, orderNumber, wholesaleStatus);
      
      // 5. Crear URL de WhatsApp
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      // 5. Abrir WhatsApp en nueva ventana
      window.open(url, '_blank');
      
      console.log('✅ Order sent to WhatsApp');
      return true;
    } catch (error) {
      console.error('❌ Error sending order:', error);
      alert('Error al enviar el pedido: ' + error.message);
      return false;
    }
  }

  /**
   * Formatear mensaje del pedido
   * @param {Array} items - Items del carrito
   * @param {Object} customer - Datos del cliente
   * @param {string} orderNumber - Número de pedido (opcional)
   * @param {Object} wholesaleStatusParam - Estado mayorista (opcional, se obtiene de Cart si no se pasa)
   */
  static formatOrderMessage(items, customer, orderNumber = null, wholesaleStatusParam = null) {
    let message = '🛒 *NUEVO PEDIDO*';
    
    // Agregar número de pedido si existe
    if (orderNumber) {
      message += ` #${orderNumber}`;
    }
    message += '\n\n';
    
    // Datos del cliente
    message += `👤 *Cliente:* ${customer.name}\n`;
    message += `📱 *Teléfono:* ${customer.phone}\n`;
    
    if (customer.notes && customer.notes.trim()) {
      message += `📝 *Observaciones:* ${customer.notes}\n`;
    }
    
    // Obtener estado mayorista de múltiples fuentes para mayor confiabilidad
    const wholesaleStatus = wholesaleStatusParam || (typeof Cart !== 'undefined' ? Cart.getWholesaleStatus() : null);
    
    // Calcular totales para verificar condiciones mayoristas
    // IMPORTANTE: Usar originalPrice (precio lista) para calcular si cumple condiciones
    const cartTotal = items.reduce((sum, item) => {
      const priceForCalc = item.originalPrice || item.price;
      return sum + (priceForCalc * item.quantity);
    }, 0);
    const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Config mayorista por defecto (fallback si no se cargó desde JSON)
    const defaultWholesaleConfig = {
      enabled: true,
      min_amount: 50000,
      min_items: 10,
      condition_mode: 'any'
    };
    
    // Usar config de Cart si existe, sino usar default
    const wsConfig = (typeof Cart !== 'undefined' && Cart.wholesaleConfig) || defaultWholesaleConfig;
    
    // Calcular si cumple condiciones mayoristas
    let wholesaleUnlocked = false;
    if (wsConfig && wsConfig.enabled) {
      const meetsAmount = cartTotal >= wsConfig.min_amount;
      const meetsItems = cartItemCount >= wsConfig.min_items;
      
      if (wsConfig.condition_mode === 'any') {
        wholesaleUnlocked = meetsAmount || meetsItems;
      } else {
        wholesaleUnlocked = meetsAmount && meetsItems;
      }
    }
    
    // También verificar la propiedad estática de Cart como respaldo
    if (!wholesaleUnlocked && typeof Cart !== 'undefined' && Cart.wholesaleUnlocked) {
      wholesaleUnlocked = true;
    }
    
    // Y verificar el status pasado como parámetro
    if (!wholesaleUnlocked && wholesaleStatus?.unlocked) {
      wholesaleUnlocked = true;
    }
    
    const hasWholesaleItems = items.some(item => item.priceDisplayMode === 'wholesale');
    
    // DEBUG: Log para verificar estado mayorista
    console.log('🔍 WhatsApp - wholesaleStatus:', wholesaleStatus);
    console.log('🔍 WhatsApp - Cart.wholesaleUnlocked (static):', typeof Cart !== 'undefined' ? Cart.wholesaleUnlocked : 'Cart not defined');
    console.log('🔍 WhatsApp - Cart.wholesaleConfig:', typeof Cart !== 'undefined' ? Cart.wholesaleConfig : 'Cart not defined');
    console.log('🔍 WhatsApp - wsConfig used:', wsConfig);
    console.log('🔍 WhatsApp - cartTotal:', cartTotal, 'cartItemCount:', cartItemCount);
    console.log('🔍 WhatsApp - wholesaleUnlocked (calculated):', wholesaleUnlocked);
    console.log('🔍 WhatsApp - hasWholesaleItems:', hasWholesaleItems);
    
    // Indicar tipo de pedido
    if (hasWholesaleItems && wholesaleUnlocked) {
      message += `\n💰 *Tipo:* PEDIDO MAYORISTA\n`;
    }
    
    message += '\n---\n🛍️ *PRODUCTOS:*\n\n';
    
    // Lista de productos
    let subtotal = 0;
    items.forEach((item, index) => {
      const isWholesaleItem = item.priceDisplayMode === 'wholesale';
      const hasDiscount = item.originalPrice && item.originalPrice > item.price;
      
      // DEBUG: Log por item
      console.log(`🔍 Item ${index}: ${item.name}`, {
        priceDisplayMode: item.priceDisplayMode,
        price: item.price,
        originalPrice: item.originalPrice,
        isWholesaleItem,
        hasDiscount,
        wholesaleUnlocked
      });
      
      // Calcular precio efectivo según modo
      let effectivePrice;
      
      if (isWholesaleItem && hasDiscount) {
        if (wholesaleUnlocked) {
          // Mayorista desbloqueado: usar precio mayorista (item.price)
          effectivePrice = item.price;
        } else {
          // Mayorista NO desbloqueado: usar precio lista (item.originalPrice)
          effectivePrice = item.originalPrice;
        }
      } else {
        // Modo normal o sin descuento
        effectivePrice = item.price;
      }
      
      const effectiveSubtotal = effectivePrice * item.quantity;
      subtotal += effectiveSubtotal;
      
      console.log(`🔍 Item ${index} - effectivePrice: ${effectivePrice}, effectiveSubtotal: ${effectiveSubtotal}`);
      
      message += `${index + 1}. *${item.name}*`;
      
      // Agregar variante si existe
      if (item.variant && item.variant.attributes) {
        const attrs = Object.entries(item.variant.attributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        message += ` (${attrs})`;
      }
      
      message += '\n';
      message += `   Cantidad: ${item.quantity}\n`;
      
      // Mostrar precios según el modo
      if (isWholesaleItem && hasDiscount) {
        if (wholesaleUnlocked) {
          // Mayorista desbloqueado: mostrar precio mayorista como principal
          message += `   💰 Precio Mayorista: ${this.formatPrice(item.price)} c/u\n`;
          message += `   ~(Lista: ${this.formatPrice(item.originalPrice)})~\n`;
        } else {
          // Mayorista NO desbloqueado: mostrar precio lista
          message += `   Precio Lista: ${this.formatPrice(item.originalPrice)} c/u\n`;
          message += `   (Mayorista: ${this.formatPrice(item.price)} c/u)\n`;
        }
      } else if (hasDiscount) {
        // Descuento normal
        message += `   Precio: ${this.formatPrice(item.price)} c/u\n`;
        const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
        message += `   💚 Descuento: ${discount}%\n`;
      } else {
        // Sin descuento
        message += `   Precio: ${this.formatPrice(effectivePrice)} c/u\n`;
      }
      
      message += `   Subtotal: ${this.formatPrice(effectiveSubtotal)}\n`;
      message += '\n';
    });
    
    console.log('🔍 WhatsApp - subtotal final:', subtotal);
    
    message += '---\n';
    message += `📦 *Subtotal productos:* ${this.formatPrice(subtotal)}\n`;
    
    // Agregar información de envío si está disponible
    if (typeof ShippingSelector !== 'undefined' && ShippingSelector.isEnabled()) {
      const shipping = ShippingSelector.calculateShipping(subtotal);
      const zone = shipping.zone;
      
      if (zone) {
        message += `\n🚚 *Envío:*\n`;
        message += `   Zona: ${zone.name}\n`;
        
        if (shipping.isCargo) {
          message += `   Costo: Pago en destino\n`;
          if (zone.cargoMessage) {
            message += `   📌 ${zone.cargoMessage}\n`;
          }
        } else if (shipping.isFree && zone.type === 'free') {
          message += `   Retiro en tienda: GRATIS\n`;
          if (zone.pickupAddress) {
            message += `   📍 ${zone.pickupAddress}\n`;
          }
        } else if (shipping.isFree) {
          message += `   Costo: ¡GRATIS! 🎉\n`;
        } else {
          message += `   Costo: ${this.formatPrice(shipping.cost)}\n`;
        }
        
        if (zone.days) {
          message += `   Entrega: ${zone.days} días\n`;
        }
        
        // Agregar dirección de envío si existe
        if (customer.shipping) {
          message += `\n📍 *Dirección de envío:*\n`;
          message += `   ${customer.shipping.address}\n`;
          if (customer.shipping.floor) {
            message += `   Piso/Depto: ${customer.shipping.floor}\n`;
          }
          message += `   ${customer.shipping.city}`;
          if (customer.shipping.zipcode) {
            message += ` (CP: ${customer.shipping.zipcode})`;
          }
          message += `\n`;
          if (customer.shipping.between) {
            message += `   Entre: ${customer.shipping.between}\n`;
          }
          message += `   ${customer.shipping.province}\n`;
        }
        
        const total = subtotal + shipping.cost;
        message += `\n💰 *TOTAL: ${this.formatPrice(total)}*\n`;
      } else {
        message += `\n💰 *TOTAL: ${this.formatPrice(subtotal)}*\n`;
      }
    } else {
      message += `\n💰 *TOTAL: ${this.formatPrice(subtotal)}*\n`;
    }
    
    message += '\n¡Gracias por tu compra! 🐾';
    
    return message;
  }

  /**
   * Formatear precio con separadores de miles
   */
  static formatPrice(price) {
    return price.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Enviar producto individual (compra directa - mantiene funcionalidad original)
   * @param {Object} product - Producto
   * @param {Object} variant - Variante seleccionada
   */
  static sendDirectPurchase(product, variant = null) {
    try {
      const phone = CONSTANTS.WHATSAPP.PHONE;
      const message = this.formatDirectPurchaseMessage(product, variant);
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      window.open(url, '_blank');
      console.log('✅ Direct purchase sent to WhatsApp');
      return true;
    } catch (error) {
      console.error('❌ Error sending direct purchase:', error);
      alert('Error al enviar el mensaje: ' + error.message);
      return false;
    }
  }

  /**
   * Formatear mensaje de compra directa (mantiene formato original)
   */
  static formatDirectPurchaseMessage(product, variant) {
    let message = '¡Hola! 👋\n\n';
    message += 'Me interesa comprar:\n\n';
    message += `📦 *${product.name}*\n`;
    
    // Variante
    if (variant && variant.attributes) {
      const attrs = Object.entries(variant.attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      message += `🔄 Variante: ${attrs}\n`;
    }
    
    // Precio
    const price = product.discountPrice || product.price;
    message += `💰 Precio: ${this.formatPrice(price)}\n`;
    
    // Precio original y descuento
    if (product.discountPrice && product.price > product.discountPrice) {
      message += `🏷️ Precio original: ${this.formatPrice(product.price)}\n`;
      const discount = Math.round(((product.price - product.discountPrice) / product.price) * 100);
      message += `📉 Descuento: ${discount}%\n`;
    }
    
    // SKU
    if (variant && variant.sku) {
      message += `🔖 SKU: ${variant.sku}\n`;
    }
    
    // Colores disponibles
    if (product.colors && product.colors.length > 0) {
      message += `🎨 Colores disponibles: ${product.colors.join(', ')}\n`;
    }
    
    // Imagen
    if (product.image || product.images?.[0]) {
      const imageUrl = product.image || product.images[0];
      message += `\n🖼️ Ver imagen: ${imageUrl}\n`;
    }
    
    message += '\n¿Cuál es el siguiente paso para comprar?';
    
    return message;
  }
}
