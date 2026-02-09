/**
 * 🏪 Módulo de Formulario Mayorista
 * Maneja la validación y envío a WhatsApp
 * Incluye autocompletado para usuarios logueados
 */

const MayoristaForm = {
  form: null,
  fields: {},

  init() {
    this.form = document.getElementById('mayorista-form');
    if (!this.form) return;

    this.fields = {
      nombre: document.getElementById('mayorista-nombre'),
      comercio: document.getElementById('mayorista-comercio'),
      ciudad: document.getElementById('mayorista-ciudad'),
      telefono: document.getElementById('mayorista-telefono'),
      email: document.getElementById('mayorista-email'),
      volumen: document.getElementById('mayorista-volumen'),
      mensaje: document.getElementById('mayorista-mensaje')
    };

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Limpiar errores al escribir
    Object.values(this.fields).forEach(field => {
      if (field) {
        field.addEventListener('input', () => this.clearError(field));
      }
    });
    
    // Autocompletar si el usuario está logueado
    this.autoFillUserData();
    
    // Escuchar cambios de autenticación
    if (typeof UserAuth !== 'undefined') {
      UserAuth.addListener(() => this.autoFillUserData());
    }
  },

  /**
   * Autocompletar datos del usuario logueado
   */
  autoFillUserData() {
    if (typeof UserAuth === 'undefined' || !UserAuth.isLoggedIn()) return;
    
    const user = UserAuth.getUser();
    if (!user) return;
    
    // Solo autocompletar si los campos están vacíos
    if (this.fields.nombre && !this.fields.nombre.value && user.displayName) {
      this.fields.nombre.value = user.displayName;
    }
    
    if (this.fields.telefono && !this.fields.telefono.value && user.phone) {
      this.fields.telefono.value = user.phone;
    }
    
    if (this.fields.email && !this.fields.email.value && user.email) {
      this.fields.email.value = user.email;
    }
    
    // Si tiene dirección guardada, autocompletar ciudad
    const defaultAddr = UserAuth.getDefaultAddress();
    if (defaultAddr && this.fields.ciudad && !this.fields.ciudad.value) {
      const city = defaultAddr.city || defaultAddr.localidad || '';
      if (city) this.fields.ciudad.value = city;
    }
    
    console.log('📝 MayoristaForm: datos autocompletados');
  },

  validate() {
    let isValid = true;
    const required = ['nombre', 'comercio', 'ciudad', 'telefono', 'volumen'];

    required.forEach(fieldName => {
      const field = this.fields[fieldName];
      if (!field) return;

      const value = field.value.trim();
      
      if (!value) {
        this.showError(field, 'Este campo es obligatorio');
        isValid = false;
      } else if (fieldName === 'telefono' && !/^[\d\s\-\+\(\)]{8,}$/.test(value)) {
        this.showError(field, 'Ingresá un teléfono válido');
        isValid = false;
      } else if (fieldName === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        this.showError(field, 'Ingresá un email válido');
        isValid = false;
      }
    });

    // Validar email si tiene valor
    const emailValue = this.fields.email?.value.trim();
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      this.showError(this.fields.email, 'Ingresá un email válido');
      isValid = false;
    }

    return isValid;
  },

  showError(field, message) {
    field.classList.add('is-invalid');
    const errorSpan = field.parentElement.querySelector('.mayorista-form__error');
    if (errorSpan) {
      errorSpan.textContent = message;
    }
  },

  clearError(field) {
    field.classList.remove('is-invalid');
    const errorSpan = field.parentElement.querySelector('.mayorista-form__error');
    if (errorSpan) {
      errorSpan.textContent = '';
    }
  },

  buildWhatsAppMessage() {
    const nombre = this.fields.nombre.value.trim();
    const comercio = this.fields.comercio.value.trim();
    const ciudad = this.fields.ciudad.value.trim();
    const telefono = this.fields.telefono.value.trim();
    const email = this.fields.email.value.trim();
    const volumen = this.fields.volumen.value;
    const mensaje = this.fields.mensaje.value.trim();

    let text = `🏪 *CONSULTA MAYORISTA*\n\n`;
    text += `👤 *Nombre:* ${nombre}\n`;
    text += `🏬 *Comercio:* ${comercio}\n`;
    text += `📍 *Ubicación:* ${ciudad}\n`;
    text += `📱 *Teléfono:* ${telefono}\n`;
    
    if (email) {
      text += `📧 *Email:* ${email}\n`;
    }
    
    text += `💰 *Inversión estimada:* ${volumen}\n`;
    
    if (mensaje) {
      text += `\n📝 *Consulta:*\n${mensaje}`;
    }

    return text;
  },

  handleSubmit(e) {
    e.preventDefault();

    if (!this.validate()) {
      return;
    }

    const message = this.buildWhatsAppMessage();
    const phoneNumber = '5491150192474'; // Número de WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  MayoristaForm.init();
});
