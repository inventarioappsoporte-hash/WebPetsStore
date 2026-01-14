/**
 * 📱 Módulo WhatsAppSender - Generador de Mensajes para WhatsApp
 * Formatea y envía pedidos del carrito por WhatsApp
 */

class WhatsAppSender {
  /**
   * Enviar pedido completo por WhatsApp
   * @param {Array} cartItems - Items del carrito
   * @param {Object} customerData - Datos del cliente
   */
  static sendOrder(cartItems, customerData) {
    try {
      // Validar datos
      if (!cartItems || cartItems.length === 0) {
        throw new Error('El carrito está vacío');
      }

      if (!customerData.name || !customerData.phone) {
        throw new Error('Faltan datos del cliente');
      }

      // Obtener número de WhatsApp desde configuración
      const phone = CONSTANTS.WHATSAPP.PHONE;
      
      // Generar mensaje formateado
      const message = this.formatOrderMessage(cartItems, customerData);
      
      // Crear URL de WhatsApp
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      // Abrir WhatsApp en nueva ventana
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
   */
  static formatOrderMessage(items, customer) {
    let message = '🛒 *NUEVO PEDIDO*\n\n';
    
    // Datos del cliente
    message += `👤 *Cliente:* ${customer.name}\n`;
    message += `📱 *Teléfono:* ${customer.phone}\n`;
    
    if (customer.notes && customer.notes.trim()) {
      message += `📝 *Observaciones:* ${customer.notes}\n`;
    }
    
    message += '\n---\n🛍️ *PRODUCTOS:*\n\n';
    
    // Lista de productos
    let total = 0;
    items.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      
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
      message += `   Precio: $${this.formatPrice(item.price)} c/u\n`;
      message += `   Subtotal: $${this.formatPrice(subtotal)}\n`;
      
      // Mostrar descuento si aplica
      if (item.originalPrice && item.originalPrice > item.price) {
        const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
        message += `   💚 Descuento: ${discount}%\n`;
      }
      
      message += '\n';
    });
    
    message += '---\n';
    message += `💰 *TOTAL: $${this.formatPrice(total)}*\n\n`;
    message += '¡Gracias por tu compra! 🐾';
    
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
    message += `💰 Precio: $${this.formatPrice(price)}\n`;
    
    // Precio original y descuento
    if (product.discountPrice && product.price > product.discountPrice) {
      message += `🏷️ Precio original: $${this.formatPrice(product.price)}\n`;
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
