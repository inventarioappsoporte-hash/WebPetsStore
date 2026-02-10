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

  static async init() {
    console.log('CouponBanner.init() starting...');
    await this.loadConfig();
    
    if (!this.config || !this.config.enabled) {
      console.log('CouponBanner: deshabilitado en config', this.config);
      return;
    }

    const shouldShow = await this.shouldShowBanner();
    if (shouldShow) {
      this.render();
    } else {
      console.log('CouponBanner: no se muestra (usuario no elegible)');
    }
  }

  static async loadConfig() {
    try {
      const pathname = window.location.pathname;
      let baseUrl = 'data/';
      if (pathname.includes('/pets-store/')) {
        baseUrl = '/pets-store/data/';
      }
      
      const response = await fetch(baseUrl + 'home.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      this.config = data.couponBanner || null;
      console.log('CouponBanner config loaded:', this.config);
    } catch (error) {
      console.error('CouponBanner: Error cargando config:', error);
      this.config = null;
    }
  }

  static async shouldShowBanner() {
    const dismissed = localStorage.getItem(this.STORAGE_KEY);
    if (dismissed) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) return false;
    }

    const audience = this.config.audience || 'new_users';
    if (audience === 'all') return true;
    if (audience === 'new_users' || audience === 'first_purchase') {
      return await this.isEligibleUser();
    }
    return true;
  }

  static async isEligibleUser() {
    if (typeof UserAuth === 'undefined' || !UserAuth.isLoggedIn()) {
      return true;
    }

    const user = UserAuth.getUser();
    if (!user || !user.uid) return true;

    try {
      const { getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getFirestore, collection, query, where, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const apps = getApps();
      if (apps.length === 0) return true;
      
      const db = getFirestore(apps[0]);
      const ordersRef = collection(db, 'tiendas', this.STORE_ID, 'orders');
      const q = query(ordersRef, where('userId', '==', user.uid), limit(1));
      const snapshot = await getDocs(q);

      return snapshot.empty;
    } catch (error) {
      console.error('CouponBanner: Error verificando elegibilidad:', error);
      return true;
    }
  }

  static render() {
    const config = this.config;
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
          <div class="coupon-banner__paw">🐾</div>
          <button class="coupon-banner__close" onclick="CouponBanner.dismiss()" title="Cerrar">✕</button>
          
          <div class="coupon-banner__content">
            <div class="coupon-banner__text">
              <div class="coupon-banner__badge">
                <span class="coupon-banner__badge-icon">${config.badgeIcon || '🎁'}</span>
                <span>${config.badgeText || 'OFERTA ESPECIAL'}</span>
              </div>
              <h2 class="coupon-banner__title">
                ${config.title || '¡Registrate y obtené un <span>5%</span> de descuento!'}
              </h2>
              <p class="coupon-banner__subtitle">${config.subtitle || 'Válido para tu primera compra'}</p>
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
                <span class="coupon-banner__button-icon">${config.ctaIcon || '🛒'}</span>
                <span>${config.ctaText || 'REGISTRATE AHORA'}</span>
              </button>
            </div>
          </div>
          
          <div class="coupon-banner__terms">${config.terms || 'Válido para tu primera compra'}</div>
        </div>
      </section>
    `;

    insertPoint.insertAdjacentHTML('beforebegin', bannerHTML);
    this.container = document.getElementById('coupon-banner');
    console.log('CouponBanner: renderizado correctamente');
  }

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

  static handleCTA() {
    console.log('CouponBanner: handleCTA clicked');
    
    if (typeof UserAuth === 'undefined' || !UserAuth.isLoggedIn()) {
      const authModal = document.getElementById('auth-modal');
      
      if (authModal) {
        console.log('CouponBanner: abriendo modal con clase auth-modal--open');
        authModal.classList.add('auth-modal--open');
        
        // Cambiar al tab de registro
        if (typeof UserAuth !== 'undefined' && typeof UserAuth.switchAuthTab === 'function') {
          UserAuth.switchAuthTab('register');
        } else {
          // Fallback manual
          const loginTab = document.getElementById('auth-tab-login');
          const registerTab = document.getElementById('auth-tab-register');
          const loginForm = document.getElementById('auth-form-login');
          const registerForm = document.getElementById('auth-form-register');
          
          if (loginTab) loginTab.classList.remove('active');
          if (registerTab) registerTab.classList.add('active');
          if (loginForm) loginForm.classList.remove('active');
          if (registerForm) registerForm.classList.add('active');
        }
        return;
      }
      
      window.location.href = 'cuenta.html';
    } else {
      const productsSection = document.querySelector('.section');
      if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  static dismiss() {
    if (this.container) {
      this.container.style.animation = 'bannerSlideIn 0.3s ease-out reverse';
      setTimeout(() => this.container.remove(), 300);
    }
    localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
  }
}

if (typeof window !== 'undefined') {
  window.CouponBanner = CouponBanner;
}
