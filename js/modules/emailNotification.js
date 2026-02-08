/**
 * 📧 Módulo EmailNotification - Notificaciones por Email con EmailJS
 * Envía notificaciones al admin cuando llega un nuevo pedido
 */

class EmailNotification {
  // Configuración de EmailJS
  static SERVICE_ID = 'service_8ibe1y9';
  static TEMPLATE_ID = 'template_uikg23c';
  static PUBLIC_KEY = 'lbiLHhBbO_-lzOR3L';
  static initialized = false;

  /**
   * Inicializar EmailJS
   */
  static async init() {
    if (this.initialized) return true;

    try {
      // Cargar script de EmailJS si no está cargado
      if (typeof emailjs === 'undefined') {
        await this.loadEmailJSScript();
      }
      
      emailjs.init(this.PUBLIC_KEY);
      this.initialized = true;
      console.log('📧 EmailNotification initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing EmailJS:', error);
      return false;
    }
  }

  /**
   * Cargar script de EmailJS dinámicamente
   */
  static loadEmailJSScript() {
    return new Promise((resolve, reject) => {
      if (typeof emailjs !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Enviar notificación de nuevo pedido
   * @param {Object} orderData - Datos del pedido
   */
  static async sendOrderNotification(orderData) {
    try {
      // Inicializar si no está listo
      if (!this.initialized) {
        const success = await this.init();
        if (!success) {
          console.warn('⚠️ EmailJS not initialized, skipping notification');
          return false;
        }
      }

      // Formatear lista de productos
      const productsList = orderData.items.map(item => {
        const variant = item.variant ? ` (${Object.values(item.variant.attributes || {}).join(', ')})` : '';
        return `• ${item.name}${variant} x${item.quantity} - $${item.price.toLocaleString('es-AR')}`;
      }).join('\n');

      // Preparar datos para el template
      const templateParams = {
        order_number: orderData.orderNumber,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        products_list: productsList,
        total: orderData.total.toLocaleString('es-AR')
      };

      // Enviar email
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Email notification sent:', response.status);
      return true;

    } catch (error) {
      console.error('❌ Error sending email notification:', error);
      // No bloquear el pedido si falla el email
      return false;
    }
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.EmailNotification = EmailNotification;
}
