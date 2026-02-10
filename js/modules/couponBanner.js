/**
 * CouponBanner - Banner inteligente de cupón
 * Detecta usuarios nuevos y muestra cupón de primera compra
 */

console.log('CouponBanner module loaded v4');

class CouponBanner {
  static config = null;
  static container = null;
  static STORAGE_KEY = 'coupon_banner_dismissed';
  static STORE_ID = 'petsstore-b0516';

  /**
   * Inicializar el banner
   */
  static async init() {
    console.log('CouponBanner.init() starting...');
    
    // Cargar configuración desde home.json
    await this.loadConfig();
    
    if (!this.config || !this.config.enabled) {
      console.log('CouponBanner: deshabilitado en config', this.config);
      return;
    }

    console.log('CouponBanner: config cargada, verificando elegibilidad...');

    // Verificar si debe mostrarse
    const shouldShow = await this.shouldShowBanner();
    
    if (shouldShow) {
      this.render();
    } else {
      console.log('CouponBanner: no se muestra (usuario no elegible)');
    }
  }

  /**
   * Cargar configuración
   */
  static async loadConfig() {
    try {
      const pathname = window.location.pathname;
      let baseUrl = 'data/';
      
      if (pathname.includes('/pets-store/')) {
        baseUrl = '/pets-store/data/';
      }
      
      console.log('CouponBanner: cargando config desde', baseUrl + 'home.json');
      
      const response = await fetch(baseUrl + 'home.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      this.config = data.couponBanner || null;
      console.log('CouponBanner config loaded:', this.config);
    } catch (error) {
      console.error('CouponBanner: Error cargando config:', error);
      this.config = null;
    }
  }

  /**
   * Determinar si debe mostrarse el banner
   */
  static async shouldShowBanner() {
    const dismissed = localStorage.getItem(this.STORAGE_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        console.log('CouponBanner: cerrado hace menos de 24h');
        return false;
      }
    }

    const audience = this.config.audience || 'new_users';
    
    if (audience === 'all') {
      return true;
    }

    if (audience === 'new_users' || audience === 'first_purchase') {
      return await this.isEligibleUser();
    }

    return true;
  }

  /**
   * Verificar si el usuario es elegible (nuevo o sin compras)
   */
  static async isEligibleUser() {
    if (typeof UserAuth === 'undefined' || !UserAuth.isLoggedIn()) {
      console.log('CouponBanner: usuario no logueado - mostrar para incentivar registro');
      return true;
    }

    const user = UserAuth.getUser();
    if (!user || !user.uid) {
      return true;
    }

    try {
      const { getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getFirestore, collection, query, where, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      let db;
      const apps = getApps();
      if (apps.length > 0) {
        db = getFirestore(apps[0]);
      } else {
        return true;
      }

      const ordersRef = collection(db, 'tiendas', this.STORE_ID, 'orders');
      const q = query(ordersRef, where('userId', '==', user.uid), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('CouponBanner: usuario sin compras - mostrar');
        return true;
      } else {
        console.log('CouponBanner: usuario ya tiene compras - ocultar');
        return false;
      }
    } catch (error) {
      console.error('CouponBanner: Error verificando elegibilidad:', error);
      return true;
    }
  }

  /**
   * Renderizar el banner
   */
  static render() {
    const config = this.config;
    
    console.log('CouponBanner: renderizando...');
    
    const heroSection = document.querySelector('.hero') || document.querySelector('[class*="hero"]');
    const insertPoint = heroSection ? heroSection.nextElementSibling : document.querySelector('main');
    
    if (!insertPoint) {
      console.error('CouponBanner: no se encontró punto de inserción');
      return;
    }

    const bannerHTML = `
      <section class="coupon-banner coupon-banner--animate-in" id="coupon-banner">
        <div class="coupon-banner__container">
          <div class="coupon-banner__sparkles">
            <div class="coupon-banner__sparkle"></div>
            <div class="coupon-banner__sparkle"></div>
            <div class="coupon-banner__sparkle"></div>
            <div class="coupon-banner__sparkle"></div>
            <div class="coupon-banner__sparkle"></div>
            <div class="coupon-banner__sparkle"></div>
          </div>
          
          <div class="coupon-banner__paw"></div>
          
          <button class="coupon-banner__close" onclick="CouponBanner.dismiss()" title="Cerrar"></button>
          
          <div class="coupon-banner__content">
            <div class="coupon-banner__text">
              <div class="coupon-banner__badge">
                <span class="coupon-banner__badge-icon">${config.badgeIcon || ''}</span>
                <span>${config.badgeText || 'OFERTA ESPECIAL'}</span>
              </div>
              <h2 class="coupon-banner__title">
                ${config.title || '¡Registrate y obtené un <span>5%</span> de descuento!'}
              </h2>
              <p class="coupon-banner__subtitle">
                ${config.subtitle || 'Válido para tu primera compra'}
              </p>
            </div>
            
            <div class="coupon-banner__code-wrapper">
              <div class="coupon-banner__code-label">Cupón:</div>
              <div class="coupon-banner__code" onclick="CouponBanner.copyCode()">
                <span class="coupon-banner__code-text">${config.code || 'BIENVENIDO'}</span>
                <span class="coupon-banner__code-copy">¡Copiado!</span>
              </div>
            </div>
            
            <div class="coupon-banner__cta">
              <button class="coupon-banner__button" onclick="CouponBanner.handleCTA()">
                <span class="coupon-banner__button-icon">${config.ctaIcon || ''}</span>
                <span>${config.ctaText || 'REGISTRATE AHORA'}</span>
              </button>
            </div>
          </div>
          
          <div class="coupon-banner__terms">
            ${config.terms || 'Válido para tu primera compra registrándote en www.pets-store-arg.com'}
          </div>
        </div>
      </section>
    `;

    insertPoint.insertAdjacentHTML('beforebegin', bannerHTML);
    this.container = document.getElementById('coupon-banner');
    
    console.log('CouponBanner: renderizado correctamente');
  }

  /**
   * Copiar código al portapapeles
   */
  static copyCode() {
    const code = this.config.code || 'BIENVENIDO';
    navigator.clipboard.writeText(code).then(() => {
      const codeEl = document.querySelector('.coupon-banner__code');
      if (codeEl) {
        codeEl.classList.add('copied');
        setTimeout(() => codeEl.classList.remove('copied'), 2000);
      }
    });
  }

  /**
   * Manejar click en CTA - Abrir modal de registro
   */
  static handleCTA() {
    console.log('CouponBanner: handleCTA clicked');
    console.log('CouponBanner: UserAuth exists?', typeof UserAuth !== 'undefined');
    console.log('CouponBanner: AuthUI exists?', typeof AuthUI !== 'undefined');
    
    // Si no está logueado, abrir modal de registro
    if (typeof UserAuth === 'undefined' || !UserAuth.isLoggedIn()) {
      
      // Método 1: Usar AuthUI.openModal
      if (typeof AuthUI !== 'undefined') {
        console.log('CouponBanner: AuthUI.openModal exists?', typeof AuthUI.openModal === 'function');
        if (typeof AuthUI.openModal === 'function') {
          console.log('CouponBanner: llamando AuthUI.openModal("register")');
          AuthUI.openModal('register');
          return;
        }
      }
      
      // Método 2: Abrir modal directamente por ID
      const authModal = document.getElementById('auth-modal');
      console.log('CouponBanner: auth-modal element?', authModal);
      if (authModal) {
        console.log('CouponBanner: abriendo modal manualmente con clase open');
        authModal.classList.add('open');
        // Cambiar a tab de registro
        const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
        if (registerTab) {
          registerTab.click();
        } else if (typeof AuthUI !== 'undefined' && typeof AuthUI.switchTab === 'function') {
          AuthUI.switchTab('register');
        }
        return;
      }
      
      // Método 3: Ir a página de cuenta
      console.log('CouponBanner: redirigiendo a cuenta.html');
      window.location.href = 'cuenta.html';
    } else {
      // Si ya está logueado, scroll a productos
      const productsSection = document.querySelector('.section') || document.querySelector('[class*="products"]');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  /**
   * Cerrar/ocultar el banner
   */
  static dismiss() {
    if (this.container) {
      this.container.style.animation = 'bannerSlideIn 0.3s ease-out reverse';
      setTimeout(() => {
        this.container.remove();
      }, 300);
    }
    localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
  }
}

// Exportar
if (typeof window !== 'undefined') {
  window.CouponBanner = CouponBanner;
}
