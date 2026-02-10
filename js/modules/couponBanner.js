/**
 * CouponBanner - Banner inteligente de cupón
 * Detecta usuarios nuevos y muestra cupón de primera compra
 */

console.log('CouponBanner module loaded');

class CouponBanner {
  static config = null;
  static container = null;
  static STORAGE_KEY = 'coupon_banner_dismissed';
  static STORE_ID = 'petsstore-b0516';

  /**
   * Inicializar el banner
   */
  static async init() {
    console.log('CouponBanner.init()');
    
    // Cargar configuración desde home.json
    await this.loadConfig();
    
    if (!this.config || !this.config.enabled) {
      console.log('CouponBanner: deshabilitado en config');
      return;
    }

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
      const response = await fetch(DataLoader.getBaseUrl() + 'home.json');
      const data = await response.json();
      this.config = data.couponBanner || null;
      console.log('CouponBanner config:', this.config);
    } catch (error) {
      console.error('Error cargando config de CouponBanner:', error);
    }
  }

  /**
   * Determinar si debe mostrarse el banner
   */
  static async shouldShowBanner() {
    // Si fue cerrado manualmente, no mostrar por 24h
    const dismissed = localStorage.getItem(this.STORAGE_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        console.log('CouponBanner: cerrado hace menos de 24h');
        return false;
      }
    }

    // Verificar tipo de audiencia configurada
    const audience = this.config.audience || 'new_users';
    
    if (audience === 'all') {
      return true;
    }

    // Para usuarios nuevos o sin compras
    if (audience === 'new_users' || audience === 'first_purchase') {
      return await this.isEligibleUser();
    }

    return true;
  }

  /**
   * Verificar si el usuario es elegible (nuevo o sin compras)
   */
  static async isEligibleUser() {
    // Si no está logueado, mostrar para incentivar registro
    if (typeof UserAuth === 'undefined' || !UserAuth.isLoggedIn()) {
      console.log('CouponBanner: usuario no logueado - mostrar para incentivar registro');
      return true;
    }

    // Si está logueado, verificar si tiene compras
    const user = UserAuth.getUser();
    if (!user || !user.uid) {
      return true;
    }

    try {
      // Verificar pedidos en Firebase
      const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getFirestore, collection, query, where, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      let db;
      const apps = getApps();
      if (apps.length > 0) {
        db = getFirestore(apps[0]);
      } else {
        return true; // Si no hay Firebase, mostrar
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
      console.error('Error verificando elegibilidad:', error);
      return true; // En caso de error, mostrar
    }
  }

  /**
   * Renderizar el banner
   */
  static render() {
    const config = this.config;
    
    // Buscar el contenedor donde insertar (después del hero)
    const heroSection = document.querySelector('.hero') || document.querySelector('[class*="hero"]');
    const insertPoint = heroSection ? heroSection.nextElementSibling : document.querySelector('main');
    
    if (!insertPoint) {
      console.error('CouponBanner: no se encontró punto de inserción');
      return;
    }

    // Crear el HTML del banner
    const bannerHTML = `
      <section class="coupon-banner coupon-banner--animate-in" id="coupon-banner">
        <div class="coupon-banner__container">
          <!-- Sparkles de fondo -->
          <div class="coupon-banner__sparkles">
            <div class="coupon-banner__sparkle"></div>
            <div class="coupon-banner__sparkle"></div>
            <div class="coupon-banner__sparkle"></div>
            <div class="coupon-banner__sparkle"></div>
            <div class="coupon-banner__sparkle"></div>
            <div class="coupon-banner__sparkle"></div>
          </div>
          
          <!-- Patita decorativa -->
          <div class="coupon-banner__paw">🐾</div>
          
          <!-- Botón cerrar -->
          <button class="coupon-banner__close" onclick="CouponBanner.dismiss()" title="Cerrar">✕</button>
          
          <div class="coupon-banner__content">
            <!-- Texto -->
            <div class="coupon-banner__text">
              <div class="coupon-banner__badge">
                <span class="coupon-banner__badge-icon">${config.badgeIcon || '🎁'}</span>
                <span>${config.badgeText || 'OFERTA ESPECIAL'}</span>
              </div>
              <h2 class="coupon-banner__title">
                ${config.title || '¡Registrate y obtené un <span>5%</span> de descuento!'}
              </h2>
              <p class="coupon-banner__subtitle">
                ${config.subtitle || 'Válido para tu primera compra'}
              </p>
            </div>
            
            <!-- Código del cupón -->
            <div class="coupon-banner__code-wrapper">
              <div class="coupon-banner__code-label">Cupón:</div>
              <div class="coupon-banner__code" onclick="CouponBanner.copyCode()">
                <span class="coupon-banner__code-text">${config.code || 'BIENVENIDO'}</span>
                <span class="coupon-banner__code-copy">¡Copiado!</span>
              </div>
            </div>
            
            <!-- CTA -->
            <div class="coupon-banner__cta">
              <button class="coupon-banner__button" onclick="CouponBanner.handleCTA()">
                <span class="coupon-banner__button-icon">${config.ctaIcon || '🛒'}</span>
                <span>${config.ctaText || 'REGISTRATE AHORA'}</span>
              </button>
            </div>
          </div>
          
          <!-- Términos -->
          <div class="coupon-banner__terms">
            ${config.terms || 'Válido para tu primera compra registrándote en www.pets-store-arg.com'}
          </div>
        </div>
      </section>
    `;

    // Insertar el banner
    insertPoint.insertAdjacentHTML('beforebegin', bannerHTML);
    this.container = document.getElementById('coupon-banner');
    
    console.log('CouponBanner: renderizado');
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
   * Manejar click en CTA
   */
  static handleCTA() {
    // Si no está logueado, abrir modal de registro
    if (typeof UserAuth === 'undefined' || !UserAuth.isLoggedIn()) {
      // Buscar y abrir el modal de auth
      const authModal = document.getElementById('auth-modal');
      if (authModal) {
        authModal.classList.add('active');
        // Cambiar a tab de registro
        const registerTab = document.querySelector('[data-tab="register"]');
        if (registerTab) registerTab.click();
      } else {
        // Si no hay modal, ir a página de cuenta
        window.location.href = 'cuenta.html';
      }
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
    // Guardar en localStorage para no mostrar por 24h
    localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
  }
}

// Exportar
if (typeof window !== 'undefined') {
  window.CouponBanner = CouponBanner;
}
