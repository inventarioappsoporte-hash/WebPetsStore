/**
 * SmartCouponBanner - Banner inteligente de cupón
 * Muestra cupones de primera compra solo a usuarios elegibles
 * v1.0 - 2026-02-10
 */

console.log('🎫 SmartCouponBanner cargado');

class SmartCouponBanner {
  static config = null;
  static container = null;
  static STORE_ID = 'petsstore-b0516';

  /**
   * Inicializar el banner
   */
  static async init() {
    console.log('🎫 SmartCouponBanner.init()');
    
    // Cargar configuración
    this.config = await this.loadConfig();
    
    if (!this.config || !this.config.enabled) {
      console.log('🎫 Banner deshabilitado o sin configuración');
      return;
    }

    // Verificar elegibilidad del usuario
    const eligibility = await this.checkEligibility();
    console.log('🎫 Elegibilidad:', eligibility);

    if (!eligibility.eligible) {
      console.log('🎫 Usuario no elegible:', eligibility.reason);
      return;
    }

    // Renderizar banner
    this.render(eligibility);
  }

  /**
   * Cargar configuración desde home.json
   */
  static async loadConfig() {
    try {
      // Intentar cargar desde DataLoader si está disponible
      if (typeof DataLoader !== 'undefined') {
        const homeConfig = await DataLoader.getHomeConfig();
        return homeConfig?.smartCouponBanner || null;
      }
      
      // Fallback: cargar directamente
      const response = await fetch('data/home.json');
      const data = await response.json();
      return data.smartCouponBanner || null;
    } catch (error) {
      console.error('🎫 Error cargando config:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario es elegible para ver el banner
   */
  static async checkEligibility() {
    const result = {
      eligible: false,
      reason: '',
      userType: 'guest', // guest, new, returning
      userName: ''
    };

    // Si no hay UserAuth, mostrar para invitados
    if (typeof UserAuth === 'undefined') {
      result.eligible = true;
      result.reason = 'UserAuth no disponible';
      result.userType = 'guest';
      return result;
    }

    // Usuario no logueado = invitado, mostrar banner
    if (!UserAuth.isLoggedIn()) {
      result.eligible = true;
      result.reason = 'Usuario no logueado';
      result.userType = 'guest';
      return result;
    }

    // Usuario logueado - verificar si tiene compras
    const user = UserAuth.getUser();
    result.userName = user?.displayName || user?.email?.split('@')[0] || '';

    try {
      // Verificar pedidos en Firebase
      const hasOrders = await this.checkUserOrders(user.uid);
      
      if (hasOrders) {
        result.eligible = false;
        result.reason = 'Usuario ya tiene compras';
        result.userType = 'returning';
      } else {
        result.eligible = true;
        result.reason = 'Usuario sin compras';
        result.userType = 'new';
      }
    } catch (error) {
      console.error('🎫 Error verificando pedidos:', error);
      // En caso de error, mostrar el banner
      result.eligible = true;
      result.reason = 'Error verificando pedidos';
      result.userType = 'new';
    }

    return result;
  }

  /**
   * Verificar si el usuario tiene pedidos en Firebase
   */
  static async checkUserOrders(userId) {
    try {
      const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getFirestore, collection, query, where, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const firebaseConfig = {
        apiKey: "AIzaSyDHWTTs1J108hiBeib4d6E5i-HLoDRoDCA",
        authDomain: "petsstore-b0516.firebaseapp.com",
        projectId: "petsstore-b0516"
      };

      const apps = getApps();
      const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig, 'smart-coupon-check');
      const db = getFirestore(app);

      const ordersRef = collection(db, 'tiendas', this.STORE_ID, 'orders');
      const q = query(ordersRef, where('userId', '==', userId), limit(1));
      const snapshot = await getDocs(q);

      return !snapshot.empty;
    } catch (error) {
      console.error('🎫 Error consultando Firebase:', error);
      return false;
    }
  }

  /**
   * Renderizar el banner
   */
  static render(eligibility) {
    const config = this.config;
    
    // Encontrar el punto de inserción (después del hero, antes de top-discounts)
    const heroSection = document.querySelector('.hero');
    const topDiscountsSection = document.querySelector('[data-section="top-discounts"]');
    
    if (!heroSection) {
      console.error('🎫 No se encontró la sección hero');
      return;
    }

    // Crear contenedor del banner
    const banner = document.createElement('section');
    banner.className = 'smart-coupon-banner smart-coupon-banner--animate';
    
    if (eligibility.userType === 'new') {
      banner.classList.add('smart-coupon-banner--compact');
    }

    // Determinar textos según tipo de usuario
    let title, subtitle, ctaText, ctaAction;
    
    if (eligibility.userType === 'guest') {
      title = config.guestTitle || '¡Registrate y obtené un <span>{discount}% DESCUENTO</span> en tu primera compra!';
      subtitle = config.guestSubtitle || 'Usá el siguiente cupón al registrarte';
      ctaText = config.guestCta || 'REGISTRATE AHORA';
      ctaAction = 'register';
    } else {
      title = config.userTitle || '¡{name}, tenés un <span>{discount}% DESCUENTO</span> esperándote!';
      subtitle = config.userSubtitle || 'Usá este cupón en tu primera compra';
      ctaText = config.userCta || 'COMPRAR AHORA';
      ctaAction = 'shop';
    }

    // Reemplazar variables
    title = title
      .replace('{discount}', config.discountValue || '5')
      .replace('{name}', eligibility.userName || 'amigo');
    subtitle = subtitle.replace('{discount}', config.discountValue || '5');

    // Imagen por defecto (emoji de mascota o imagen personalizada)
    const imageUrl = config.image || 'assets/images/ui/coupon-pet.png';
    const imageHtml = config.image 
      ? `<img src="${imageUrl}" alt="Mascota" class="smart-coupon-banner__image">`
      : `<div class="smart-coupon-banner__image" style="font-size: 100px; line-height: 1;">🐕</div>`;

    banner.innerHTML = `
      <div class="smart-coupon-banner__container">
        <div class="smart-coupon-banner__tag">🎁 OFERTA ESPECIAL</div>
        <div class="smart-coupon-banner__content">
          <div class="smart-coupon-banner__visual">
            ${imageHtml}
          </div>
          <div class="smart-coupon-banner__text">
            <h2 class="smart-coupon-banner__title">${title}</h2>
            <p class="smart-coupon-banner__subtitle">${subtitle}</p>
            <div class="smart-coupon-banner__code-wrapper">
              <span class="smart-coupon-banner__code-label">Cupón:</span>
              <span class="smart-coupon-banner__code" id="coupon-code">${config.couponCode || 'BIENVENIDO'}</span>
              <button class="smart-coupon-banner__copy-btn" onclick="SmartCouponBanner.copyCode()">📋 Copiar</button>
            </div>
          </div>
          <div class="smart-coupon-banner__cta">
            <button class="smart-coupon-banner__btn" onclick="SmartCouponBanner.handleCta('${ctaAction}')">${ctaText}</button>
            <span class="smart-coupon-banner__terms">${config.terms || 'Válido para tu primera compra'}</span>
          </div>
        </div>
      </div>
    `;

    // Insertar después del hero
    heroSection.insertAdjacentElement('afterend', banner);
    this.container = banner;

    console.log('🎫 Banner renderizado');
  }

  /**
   * Copiar código al portapapeles
   */
  static copyCode() {
    const codeElement = document.getElementById('coupon-code');
    if (!codeElement) return;

    const code = codeElement.textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.querySelector('.smart-coupon-banner__copy-btn');
      if (btn) {
        btn.textContent = '✓ Copiado';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '📋 Copiar';
          btn.classList.remove('copied');
        }, 2000);
      }
    }).catch(err => {
      console.error('Error copiando:', err);
      // Fallback para navegadores sin clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Código copiado: ' + code);
    });
  }

  /**
   * Manejar click en CTA
   */
  static handleCta(action) {
    if (action === 'register') {
      // Abrir modal de registro
      if (typeof AuthUI !== 'undefined' && AuthUI.showModal) {
        AuthUI.showModal('register');
      } else {
        // Fallback: scroll al header donde está el botón de login
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Intentar abrir el modal de auth
        const authBtn = document.querySelector('.header__auth-btn');
        if (authBtn) authBtn.click();
      }
    } else {
      // Ir a comprar - scroll a productos
      const productsSection = document.querySelector('[data-section="top-discounts"]');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  /**
   * Ocultar banner
   */
  static hide() {
    if (this.container) {
      this.container.classList.add('smart-coupon-banner--hidden');
    }
  }

  /**
   * Mostrar banner
   */
  static show() {
    if (this.container) {
      this.container.classList.remove('smart-coupon-banner--hidden');
    }
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.SmartCouponBanner = SmartCouponBanner;
}
