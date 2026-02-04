/**
 * 🎨 Módulo AuthUI - Interfaz de Usuario para Autenticación
 * Maneja modales, botones y UI del sistema de login
 */

class AuthUI {
  static modal = null;
  static accountBtn = null;
  static dropdown = null;
  static initialized = false;

  /**
   * Inicializar UI de autenticación
   */
  static async init() {
    if (this.initialized) return;

    // Inicializar UserAuth primero
    await UserAuth.init();

    // Crear elementos UI
    this.createModal();
    this.createAccountButton();

    // Escuchar cambios de autenticación
    UserAuth.addListener((user) => this.updateUI(user));

    // Actualizar UI inicial
    this.updateUI(UserAuth.getCurrentUser());

    this.initialized = true;
    console.log('🎨 AuthUI initialized');
  }

  /**
   * Crear modal de autenticación
   */
  static createModal() {
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'auth-modal';
    modal.innerHTML = `
      <div class="auth-modal__overlay" onclick="AuthUI.closeModal()"></div>
      <div class="auth-modal__content">
        <div class="auth-modal__header">
          <h2>👤 Mi Cuenta</h2>
          <button class="auth-modal__close" onclick="AuthUI.closeModal()">✕</button>
        </div>
        
        <div class="auth-modal__tabs">
          <button class="auth-tab active" data-tab="login" onclick="AuthUI.switchTab('login')">
            Iniciar Sesión
          </button>
          <button class="auth-tab" data-tab="register" onclick="AuthUI.switchTab('register')">
            Crear Cuenta
          </button>
        </div>
        
        <div class="auth-modal__body">
          <div id="auth-message"></div>
          
          <!-- Login Form -->
          <form class="auth-form active" id="login-form" onsubmit="AuthUI.handleLogin(event)">
            <button type="button" class="auth-btn auth-btn--google" onclick="AuthUI.handleGoogleLogin()">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>
            
            <div class="auth-divider"><span>o con email</span></div>
            
            <div class="auth-form__group">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" placeholder="tu@email.com" required>
            </div>
            
            <div class="auth-form__group">
              <label for="login-password">Contraseña</label>
              <input type="password" id="login-password" placeholder="••••••••" required>
            </div>
            
            <div class="auth-forgot">
              <a class="auth-link" onclick="AuthUI.showForgotPassword()">¿Olvidaste tu contraseña?</a>
            </div>
            
            <button type="submit" class="auth-btn auth-btn--primary" id="login-btn">
              Iniciar Sesión
            </button>
          </form>
          
          <!-- Register Form -->
          <form class="auth-form" id="register-form" onsubmit="AuthUI.handleRegister(event)">
            <button type="button" class="auth-btn auth-btn--google" onclick="AuthUI.handleGoogleLogin()">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Registrarse con Google
            </button>
            
            <div class="auth-divider"><span>o con email</span></div>
            
            <div class="auth-form__group">
              <label for="register-name">Nombre completo</label>
              <input type="text" id="register-name" placeholder="Juan Pérez" required>
            </div>
            
            <div class="auth-form__group">
              <label for="register-email">Email</label>
              <input type="email" id="register-email" placeholder="tu@email.com" required>
            </div>
            
            <div class="auth-form__group">
              <label for="register-phone">Teléfono / WhatsApp</label>
              <input type="tel" id="register-phone" placeholder="11 5555-5555" required>
            </div>
            
            <div class="auth-form__group">
              <label for="register-password">Contraseña</label>
              <input type="password" id="register-password" placeholder="Mínimo 6 caracteres" required minlength="6">
            </div>
            
            <button type="submit" class="auth-btn auth-btn--primary" id="register-btn">
              Crear Cuenta
            </button>
            
            <p style="font-size: 0.8rem; color: #6b7280; margin-top: 1rem; text-align: center;">
              Al crear una cuenta, aceptas nuestras 
              <a href="politicas.html" class="auth-link" target="_blank">políticas de privacidad</a>
            </p>
          </form>
          
          <!-- Forgot Password Form -->
          <form class="auth-form" id="forgot-form" onsubmit="AuthUI.handleForgotPassword(event)">
            <p style="margin-bottom: 1rem; color: #6b7280;">
              Ingresa tu email y te enviaremos un link para restablecer tu contraseña.
            </p>
            
            <div class="auth-form__group">
              <label for="forgot-email">Email</label>
              <input type="email" id="forgot-email" placeholder="tu@email.com" required>
            </div>
            
            <button type="submit" class="auth-btn auth-btn--primary" id="forgot-btn">
              Enviar Email
            </button>
            
            <p style="text-align: center; margin-top: 1rem;">
              <a class="auth-link" onclick="AuthUI.switchTab('login')">← Volver al login</a>
            </p>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;
  }


  /**
   * Crear botón de cuenta en el header
   */
  static createAccountButton() {
    // Buscar el contenedor de acciones del header
    const headerActions = document.querySelector('.header__actions');
    if (!headerActions) {
      console.warn('Header actions not found');
      return;
    }

    // Crear contenedor dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML = `
      <button class="header__account-btn" onclick="AuthUI.toggleDropdown()">
        <span class="account-icon">👤</span>
        <span class="account-name">Mi Cuenta</span>
      </button>
      <div class="user-dropdown__menu">
        <div class="user-dropdown__header">
          <div class="user-dropdown__name">Usuario</div>
          <div class="user-dropdown__email">email@ejemplo.com</div>
        </div>
        <a href="cuenta.html" class="user-dropdown__item">
          <span>👤</span> Mi Perfil
        </a>
        <a href="cuenta.html#direcciones" class="user-dropdown__item">
          <span>📍</span> Mis Direcciones
        </a>
        <button class="user-dropdown__item user-dropdown__item--danger" onclick="AuthUI.handleLogout()">
          <span>🚪</span> Cerrar Sesión
        </button>
      </div>
    `;

    // Insertar antes del botón del carrito
    const cartBtn = headerActions.querySelector('.header__cart-btn, [onclick*="CartUI"]');
    if (cartBtn) {
      headerActions.insertBefore(dropdown, cartBtn);
    } else {
      headerActions.appendChild(dropdown);
    }

    this.dropdown = dropdown;
    this.accountBtn = dropdown.querySelector('.header__account-btn');

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  }

  /**
   * Actualizar UI según estado de autenticación
   */
  static updateUI(user) {
    if (!this.accountBtn || !this.dropdown) return;

    if (user) {
      // Usuario logueado
      this.accountBtn.classList.add('logged-in');
      
      const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Usuario';
      
      if (user.photoURL) {
        this.accountBtn.innerHTML = `
          <img src="${user.photoURL}" alt="" class="account-avatar">
          <span class="account-name">${firstName}</span>
        `;
      } else {
        this.accountBtn.innerHTML = `
          <span class="account-icon">👤</span>
          <span class="account-name">${firstName}</span>
        `;
      }

      // Actualizar dropdown
      const nameEl = this.dropdown.querySelector('.user-dropdown__name');
      const emailEl = this.dropdown.querySelector('.user-dropdown__email');
      if (nameEl) nameEl.textContent = user.displayName || 'Usuario';
      if (emailEl) emailEl.textContent = user.email;

    } else {
      // Usuario no logueado
      this.accountBtn.classList.remove('logged-in');
      this.accountBtn.innerHTML = `
        <span class="account-icon">👤</span>
        <span class="account-name">Mi Cuenta</span>
      `;
    }
  }

  /**
   * Toggle dropdown de usuario
   */
  static toggleDropdown() {
    if (!UserAuth.isLoggedIn()) {
      this.openModal();
      return;
    }
    this.dropdown.classList.toggle('open');
  }

  /**
   * Abrir modal de autenticación
   */
  static openModal(tab = 'login') {
    if (this.modal) {
      this.modal.classList.add('open');
      this.switchTab(tab);
      this.clearMessage();
    }
  }

  /**
   * Cerrar modal
   */
  static closeModal() {
    if (this.modal) {
      this.modal.classList.remove('open');
      this.clearForms();
    }
  }

  /**
   * Cambiar tab (login/register/forgot)
   */
  static switchTab(tab) {
    // Actualizar tabs
    document.querySelectorAll('.auth-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    // Actualizar forms
    document.querySelectorAll('.auth-form').forEach(f => {
      f.classList.remove('active');
    });

    const form = document.getElementById(`${tab}-form`);
    if (form) form.classList.add('active');

    this.clearMessage();
  }

  /**
   * Mostrar formulario de recuperar contraseña
   */
  static showForgotPassword() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById('forgot-form').classList.add('active');
  }

  /**
   * Manejar login con email
   */
  static async handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    btn.disabled = true;
    btn.textContent = 'Iniciando...';

    const result = await UserAuth.loginWithEmail(email, password);

    if (result.success) {
      this.showMessage('¡Bienvenido de vuelta! 🎉', 'success');
      setTimeout(() => this.closeModal(), 1500);
    } else {
      this.showMessage(result.error, 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Iniciar Sesión';
  }

  /**
   * Manejar registro
   */
  static async handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const btn = document.getElementById('register-btn');

    btn.disabled = true;
    btn.textContent = 'Creando cuenta...';

    const result = await UserAuth.registerWithEmail(email, password, name, phone);

    if (result.success) {
      this.showMessage('¡Cuenta creada exitosamente! 🎉', 'success');
      setTimeout(() => this.closeModal(), 1500);
    } else {
      this.showMessage(result.error, 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Crear Cuenta';
  }

  /**
   * Manejar login con Google
   */
  static async handleGoogleLogin() {
    const result = await UserAuth.loginWithGoogle();

    if (result.success) {
      this.showMessage('¡Bienvenido! 🎉', 'success');
      setTimeout(() => this.closeModal(), 1500);
    } else {
      this.showMessage(result.error, 'error');
    }
  }

  /**
   * Manejar recuperación de contraseña
   */
  static async handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    const btn = document.getElementById('forgot-btn');

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const result = await UserAuth.resetPassword(email);

    if (result.success) {
      this.showMessage('Email enviado. Revisa tu bandeja de entrada.', 'success');
    } else {
      this.showMessage(result.error, 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Enviar Email';
  }

  /**
   * Manejar logout
   */
  static async handleLogout() {
    this.dropdown.classList.remove('open');
    await UserAuth.logout();
  }

  /**
   * Mostrar mensaje
   */
  static showMessage(text, type) {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
      messageEl.className = `auth-message auth-message--${type}`;
      messageEl.textContent = text;
      messageEl.style.display = 'block';
    }
  }

  /**
   * Limpiar mensaje
   */
  static clearMessage() {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
      messageEl.style.display = 'none';
      messageEl.textContent = '';
    }
  }

  /**
   * Limpiar formularios
   */
  static clearForms() {
    document.querySelectorAll('.auth-form input').forEach(input => {
      input.value = '';
    });
    this.clearMessage();
  }
}

// Inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
  window.AuthUI = AuthUI;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthUI.init());
  } else {
    AuthUI.init();
  }
}
