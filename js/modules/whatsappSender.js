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
            // Pedido registrado en Firebase
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
    
    // Nueva lógica mayorista: monto mínimo + cantidad por producto
    // Calcular total usando precios lista
    const cartTotal = items.reduce((sum, item) => {
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
    items.forEach(item => {
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
    
    const hasWholesaleItems = items.some(item => item.priceDisplayMode === 'wholesale');
    
    // Indicar tipo de pedido
    if (hasWholesaleItems && productsWithWholesale.length > 0) {
      message += `\n💰 *Tipo:* PEDIDO MAYORISTA (${productsWithWholesale.length} producto${productsWithWholesale.length > 1 ? 's' : ''} con precio mayorista)\n`;
    }
    
    message += '\n---\n🛍️ *PRODUCTOS:*\n\n';
    
    // Lista de productos
    let subtotal = 0;
    items.forEach((item, index) => {
      const isWholesaleItem = item.priceDisplayMode === 'wholesale';
      const hasDiscount = item.originalPrice && item.originalPrice > item.price;
      const productId = item.productId || item.id;
      
      // Verificar si ESTE producto específico califica para mayorista
      const thisProductQualifies = productQualifiesForWholesale(productId);
      
      // Calcular precio efectivo según modo
      let effectivePrice;
      
      if (isWholesaleItem && hasDiscount) {
        if (thisProductQualifies) {
          // Este producto califica: usar precio mayorista (item.price)
          effectivePrice = item.price;
        } else {
          // Este producto NO califica: usar precio lista (item.originalPrice)
          effectivePrice = item.originalPrice;
        }
      } else {
        // Modo normal o sin descuento
        effectivePrice = item.price;
      }
      
      const effectiveSubtotal = effectivePrice * item.quantity;
      subtotal += effectiveSubtotal;
      
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
        if (thisProductQualifies) {
          // Este producto califica: mostrar precio mayorista como principal
          message += `   💰 Precio Mayorista: ${this.formatPrice(item.price)} c/u\n`;
          message += `   ~(Lista: ${this.formatPrice(item.originalPrice)})~\n`;
        } else {
          // Este producto NO califica: mostrar precio lista
          message += `   Precio Lista: ${this.formatPrice(item.originalPrice)} c/u\n`;
          message += `   (Mayorista: ${this.formatPrice(item.price)} c/u - necesita ${minItemsPerProduct}+ unidades)\n`;
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
    
    message += '---\n';
    message += `📦 *Subtotal productos:* ${this.formatPrice(subtotal)}\n`;
    
    // Agregar información de cupón si existe
    if (customer.coupon) {
      const coupon = customer.coupon;
      message += `\n🎟️ *Cupón aplicado:* ${coupon.code}\n`;
      
      if (coupon.type === 'percentage') {
        message += `   Descuento: ${coupon.value}%\n`;
      } else if (coupon.type === 'fixed') {
        message += `   Descuento fijo\n`;
      } else if (coupon.type === 'freeShipping') {
        message += `   Envío gratis\n`;
      }
      
      if (coupon.discount > 0) {
        message += `   Ahorro: -${this.formatPrice(coupon.discount)}\n`;
        subtotal = subtotal - coupon.discount;
        message += `   *Subtotal con descuento:* ${this.formatPrice(subtotal)}\n`;
      }
    }
    
    // Agregar información de envío si está disponible
    if (typeof ShippingSelector !== 'undefined' && ShippingSelector.isEnabled()) {
      const shipping = ShippingSelector.calculateShipping(subtotal);
      const zone = shipping.zone;
      
      // Verificar si el cupón da envío gratis
      const couponFreeShipping = customer.coupon?.freeShipping || false;
      
      if (zone) {
        message += `\n🚚 *Envío:*\n`;
        message += `   Zona: ${zone.name}\n`;
        
        if (shipping.isCargo) {
          message += `   Costo: Pago en destino\n`;
          if (zone.cargoMessage) {
            message += `   📌 ${zone.cargoMessage}\n`;
          }
        } else if ((shipping.isFree && zone.type === 'free') || couponFreeShipping) {
          if (zone.type === 'free') {
            message += `   Retiro en tienda: GRATIS\n`;
          } else {
            message += `   Costo: ¡GRATIS! 🎉 (cupón)\n`;
          }
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
        
        // Calcular total considerando envío gratis del cupón
        let shippingCost = shipping.cost;
        if (couponFreeShipping && !shipping.isCargo) {
          shippingCost = 0;
        }
        
        // Agregar forma de pago si está configurada
        let paymentFee = 0;
        if (typeof PaymentSelector !== 'undefined' && PaymentSelector.getMethods().length > 0) {
          const paymentData = PaymentSelector.getOrderData();
          if (paymentData) {
            message += `\n*Forma de Pago:* ${paymentData.methodIcon} ${paymentData.methodName}\n`;
            if (paymentData.commission > 0) {
              paymentFee = PaymentSelector.calculateCommission(subtotal);
              message += `   Recargo (${paymentData.commission}%): +${this.formatPrice(paymentFee)}\n`;
            }
          }
        }
        
        const total = subtotal + shippingCost + paymentFee;
        message += `\n💰 *TOTAL: ${this.formatPrice(total)}*\n`;
      } else {
        // Sin envío pero con posible forma de pago
        let paymentFee = 0;
        if (typeof PaymentSelector !== 'undefined' && PaymentSelector.getMethods().length > 0) {
          const paymentData = PaymentSelector.getOrderData();
          if (paymentData) {
            message += `\n*Forma de Pago:* ${paymentData.methodIcon} ${paymentData.methodName}\n`;
            if (paymentData.commission > 0) {
              paymentFee = PaymentSelector.calculateCommission(subtotal);
              message += `   Recargo (${paymentData.commission}%): +${this.formatPrice(paymentFee)}\n`;
            }
          }
        }
        message += `\n💰 *TOTAL: ${this.formatPrice(subtotal + paymentFee)}*\n`;
      }
    } else {
      // Sin selector de envío pero con posible forma de pago
      let paymentFee = 0;
      if (typeof PaymentSelector !== 'undefined' && PaymentSelector.getMethods().length > 0) {
        const paymentData = PaymentSelector.getOrderData();
        if (paymentData) {
          message += `\n*Forma de Pago:* ${paymentData.methodIcon} ${paymentData.methodName}\n`;
          if (paymentData.commission > 0) {
            paymentFee = PaymentSelector.calculateCommission(subtotal);
            message += `   Recargo (${paymentData.commission}%): +${this.formatPrice(paymentFee)}\n`;
          }
        }
      }
      message += `\n💰 *TOTAL: ${this.formatPrice(subtotal + paymentFee)}*\n`;
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
