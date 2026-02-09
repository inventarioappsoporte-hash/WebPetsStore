/**
 * 📱 Módulo SocialFloat - Botones flotantes de redes sociales + Usuario
 * Muestra botones de Instagram, TikTok y Usuario en la esquina inferior derecha
 */

class SocialFloat {
  constructor(config = {}) {
    this.config = {
      instagramUser: config.instagramUser || 'petsstore2026',
      tiktokUser: config.tiktokUser || 'pets.store795',
      showInstagram: config.showInstagram !== false,
      showTiktok: config.showTiktok !== false,
      showUser: config.showUser !== false
    };
    this.userButton = null;
    this.userMenu = null;
    this.menuOpen = false;
  }

  /**
   * Inicializar y renderizar los botones
   */
  init() {
    this.render();
    this.renderUserMenu();
    this.attachEvents();
    
    // Escuchar cambios de autenticación
    if (typeof UserAuth !== 'undefined') {
      UserAuth.addListener((user) => this.updateUserButton(user));
      setTimeout(() => {
        if (UserAuth.isLoggedIn()) {
          this.updateUserButton(UserAuth.getUser());
        }
      }, 500);
    }
    
    console.log('📱 SocialFloat initialized');
  }

  /**
   * Renderizar los botones flotantes
   */
  render() {
    if (document.getElementById('social-float-container')) return;

    const container = document.createElement('div');
    container.id = 'social-float-container';
    container.className = 'social-float-container';

    let buttonsHtml = '';

    if (this.config.showUser) {
      buttonsHtml += `
        <button id="social-float-user" class="social-float social-float--user" title="Mi Cuenta">
          <span class="social-float__user-initials">👤</span>
        </button>
      `;
    }

    if (this.config.showInstagram) {
      buttonsHtml += `
        <a href="#" id="social-float-instagram" class="social-float social-float--instagram" 
           title="Seguinos en Instagram @${this.config.instagramUser}">
          <svg class="social-float__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      `;
    }

    if (this.config.showTiktok) {
      buttonsHtml += `
        <a href="https://www.tiktok.com/@${this.config.tiktokUser}" target="_blank" rel="noopener noreferrer"
           class="social-float social-float--tiktok" title="Seguinos en TikTok @${this.config.tiktokUser}">
          <svg class="social-float__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </a>
      `;
    }

    container.innerHTML = buttonsHtml;
    document.body.appendChild(container);
    this.userButton = document.getElementById('social-float-user');
  }

  /**
   * Renderizar menú de usuario elegante
   */
  renderUserMenu() {
    if (document.getElementById('user-float-menu')) return;

    const menu = document.createElement('div');
    menu.id = 'user-float-menu';
    menu.className = 'user-float-menu';
    menu.innerHTML = `
      <div class="user-float-menu__header" id="user-menu-header">
        <span class="user-float-menu__greeting">¡Hola!</span>
        <span class="user-float-menu__name" id="user-menu-name"></span>
      </div>
      <div class="user-float-menu__items">
        <button class="user-float-menu__item user-menu-guest" onclick="socialFloat.menuAction('login')">
          <span class="ufm-icon">🔑</span>
          <span>Ingresar</span>
        </button>
        <button class="user-float-menu__item user-menu-guest" onclick="socialFloat.menuAction('register')">
          <span class="ufm-icon">✨</span>
          <span>Crear cuenta</span>
        </button>
        <button class="user-float-menu__item user-menu-logged" onclick="socialFloat.menuAction('profile')">
          <span class="ufm-icon">👤</span>
          <span>Mi perfil</span>
        </button>
        <button class="user-float-menu__item user-menu-logged" onclick="socialFloat.menuAction('addresses')">
          <span class="ufm-icon">📍</span>
          <span>Mis direcciones</span>
        </button>
        <div class="user-float-menu__divider user-menu-logged"></div>
        <button class="user-float-menu__item user-float-menu__item--danger user-menu-logged" onclick="socialFloat.menuAction('logout')">
          <span class="ufm-icon">🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    `;

    document.body.appendChild(menu);
    this.userMenu = menu;
  }

  static getInitials(displayName) {
    if (!displayName) return '👤';
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0].length > 0) return parts[0].substring(0, 2).toUpperCase();
    return '👤';
  }

  updateUserButton(user) {
    const btn = document.getElementById('social-float-user');
    const menuHeader = document.getElementById('user-menu-header');
    const menuName = document.getElementById('user-menu-name');
    if (!btn) return;

    const initialsEl = btn.querySelector('.social-float__user-initials');
    
    if (user && user.displayName) {
      const initials = SocialFloat.getInitials(user.displayName);
      const firstName = user.displayName.split(' ')[0];
      
      btn.classList.add('logged-in');
      btn.title = `Mi Cuenta - ${user.displayName}`;
      if (initialsEl) initialsEl.textContent = initials;
      if (menuHeader) menuHeader.classList.add('logged-in');
      if (menuName) menuName.textContent = firstName;
      
      document.querySelectorAll('.user-menu-guest').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.user-menu-logged').forEach(el => el.style.display = 'flex');
    } else {
      btn.classList.remove('logged-in');
      btn.title = 'Mi Cuenta';
      if (initialsEl) initialsEl.textContent = '👤';
      if (menuHeader) menuHeader.classList.remove('logged-in');
      if (menuName) menuName.textContent = '';
      
      document.querySelectorAll('.user-menu-guest').forEach(el => el.style.display = 'flex');
      document.querySelectorAll('.user-menu-logged').forEach(el => el.style.display = 'none');
    }
  }

  toggleUserMenu() {
    if (!this.userMenu) return;
    this.menuOpen = !this.menuOpen;
    this.userMenu.classList.toggle('open', this.menuOpen);
    if (this.userButton) this.userButton.classList.toggle('menu-open', this.menuOpen);
  }

  closeUserMenu() {
    if (!this.userMenu) return;
    this.menuOpen = false;
    this.userMenu.classList.remove('open');
    if (this.userButton) this.userButton.classList.remove('menu-open');
  }

  menuAction(action) {
    this.closeUserMenu();
    switch (action) {
      case 'login':
        if (typeof UserAuth !== 'undefined') UserAuth.showAuthModal();
        break;
      case 'register':
        if (typeof UserAuth !== 'undefined') UserAuth.showAuthModal('register');
        break;
      case 'profile':
        window.location.href = 'cuenta.html';
        break;
      case 'addresses':
        window.location.href = 'cuenta.html#direcciones';
        break;
      case 'logout':
        if (typeof UserAuth !== 'undefined') UserAuth.logout();
        break;
    }
  }

  attachEvents() {
    const userBtn = document.getElementById('social-float-user');
    if (userBtn) {
      userBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleUserMenu();
      });
    }

    const igBtn = document.getElementById('social-float-instagram');
    if (igBtn) {
      igBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openInstagram();
      });
    }

    document.addEventListener('click', (e) => {
      if (this.menuOpen && !e.target.closest('#user-float-menu') && !e.target.closest('#social-float-user')) {
        this.closeUserMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.menuOpen) this.closeUserMenu();
    });
  }

  openInstagram() {
    const username = this.config.instagramUser;
    const webUrl = `https://www.instagram.com/${username}/`;
    const deepLink = `instagram://user?username=${username}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      const start = Date.now();
      window.location.href = deepLink;
      setTimeout(() => {
        if (Date.now() - start < 2000) window.open(webUrl, '_blank');
      }, 1500);
    } else {
      window.open(webUrl, '_blank');
    }
  }

  toggle(show) {
    const container = document.getElementById('social-float-container');
    if (container) container.style.display = show ? 'flex' : 'none';
  }
}

const socialFloat = new SocialFloat({
  instagramUser: 'petsstore2026',
  tiktokUser: 'pets.store795'
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => socialFloat.init());
} else {
  socialFloat.init();
}
