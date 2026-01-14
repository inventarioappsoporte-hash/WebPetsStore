/**
 * 📬 Módulo ContactForm - Formulario de Contacto con WhatsApp
 * Reutiliza la integración existente de WhatsApp
 */

class ContactForm {
  static init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => this.handleSubmit(e));
    console.log('✅ ContactForm initialized');
  }

  /**
   * Manejar envío del formulario
   */
  static handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    // Validar campos
    if (!this.validateFields(name, phone, message)) {
      return;
    }

    // Enviar por WhatsApp
    this.sendToWhatsApp(name, phone, message);
  }

  /**
   * Validar que todos los campos estén completos
   */
  static validateFields(name, phone, message) {
    if (!name) {
      this.showError('Por favor ingresá tu nombre completo');
      document.getElementById('contact-name').focus();
      return false;
    }

    if (!phone) {
      this.showError('Por favor ingresá tu teléfono');
      document.getElementById('contact-phone').focus();
      return false;
    }

    if (!message) {
      this.showError('Por favor escribí tu mensaje o consulta');
      document.getElementById('contact-message').focus();
      return false;
    }

    return true;
  }

  /**
   * Construir mensaje y abrir WhatsApp
   */
  static sendToWhatsApp(name, phone, message) {
    try {
      const whatsappPhone = CONSTANTS.WHATSAPP.PHONE;
      const formattedMessage = this.formatMessage(name, phone, message);
      const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(formattedMessage)}`;

      window.open(url, '_blank');
      
      // Limpiar formulario después de enviar
      this.clearForm();
      
      console.log('✅ Contact message sent to WhatsApp');
    } catch (error) {
      console.error('❌ Error sending contact message:', error);
      this.showError('Error al enviar el mensaje. Intentá de nuevo.');
    }
  }

  /**
   * Formatear mensaje con estructura clara
   */
  static formatMessage(name, phone, message) {
    let text = '📬 *NUEVA CONSULTA*\n\n';
    text += '---\n';
    text += `👤 *Nombre:* ${name}\n`;
    text += `📱 *Teléfono:* ${phone}\n`;
    text += '---\n\n';
    text += `💬 *Mensaje:*\n${message}\n\n`;
    text += '---\n';
    text += '🐾 Enviado desde Pets Store';
    
    return text;
  }

  /**
   * Limpiar formulario
   */
  static clearForm() {
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-phone').value = '';
    document.getElementById('contact-message').value = '';
  }

  /**
   * Mostrar mensaje de error
   */
  static showError(message) {
    alert(message);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  ContactForm.init();
});
