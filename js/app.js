// Aplicación principal
// Updated: 2026-02-08 - Header scroll effect moved to headerScroll.js
class App {
  constructor() {
    this.dataLoader = dataLoader;
    this.init();
  }

  async init() {
    try {
      // IMPORTANTE: Agregar listener global para botones de agregar al carrito
      // Esto captura el click ANTES de que llegue a la tarjeta
      this.initGlobalAddToCartListener();

      // Inicializar categorías
      await categoriesRenderer.init();

      // Renderizar home
      const homeRenderer = new HomeRenderer(this.dataLoader);
      await homeRenderer.render();

      // Inicializar banner de cupón inteligente
      if (typeof CouponBanner !== 'undefined') {
        CouponBanner.init();
      }
      
      // Inicializar selector de formas de pago
      if (typeof PaymentSelector !== 'undefined') {
        PaymentSelector.init();
      }

      // Inicializar búsqueda del header
      new HeaderSearch(this.dataLoader);

      // Inicializar búsqueda
      new SearchEngine(this.dataLoader);

      // Inicializar carruseles
      new Carousel();

      // Inicializar reproductor de videos
      new VideoPlayer();

      // Inicializar botones del hero (DESPUÉS de renderizar con delay más largo)
      setTimeout(() => this.initHeroButtons(), 500);

      // Inicializar stock desde Firebase (en segundo plano)
      this.initFirebaseStock();
    } catch (error) {
      console.error('❌ Error inicializando la aplicación:', error);
    }
  }

  /**
   * Inicializar stock desde Firebase
   */
  async initFirebaseStock() {
    try {
      if (typeof FirebaseStock !== 'undefined') {
        // FirebaseStock.init() ya se auto-ejecuta al cargar el módulo
        // Solo aplicar indicadores si está habilitado y tiene datos
        if (FirebaseStock.ENABLED && FirebaseStock.stockCache.size > 0) {
          FirebaseStock.applyStockIndicators();
        }
      }
    } catch (error) {
      console.warn('⚠️ No se pudo cargar stock de Firebase:', error.message);
    }
  }

  /**
   * Listener global para botones de agregar al carrito
   * Usa delegación de eventos en fase de captura para interceptar antes que otros listeners
   */
  initGlobalAddToCartListener() {
    document.addEventListener('click', (e) => {
      // Verificar si el click fue en un botón de agregar al carrito
      const addToCartBtn = e.target.closest('.add-to-cart-btn');
      if (addToCartBtn) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        
        const productId = addToCartBtn.getAttribute('data-product-id');
        
        if (productId && typeof HomeRenderer !== 'undefined') {
          HomeRenderer.handleAddToCartStatic(productId);
        }
        return false;
      }
    }, true); // true = fase de captura
  }

  initHeroButtons() {
    // Botones desktop
    const viewBtn = document.getElementById('hero-view-btn');
    const buyBtn = document.getElementById('hero-buy-btn');
    
    // Botones móvil
    const viewBtnMobile = document.getElementById('hero-view-btn-mobile');
    const buyBtnMobile = document.getElementById('hero-buy-btn-mobile');

    // Handler para VER PRODUCTO
    const handleViewProduct = async () => {
      const productId = await this.dataLoader.getHeroProductId();
      if (productId) {
        window.location.href = `product.html?id=${productId}`;
      }
    };

    // Handler para COMPRAR AHORA - Agrega al carrito y lo abre
    const handleBuyNow = async () => {
      const productId = await this.dataLoader.getHeroProductId();
      const product = await this.dataLoader.getProductById(productId);
      if (product) {
        // Agregar al carrito
        if (window.Cart) {
          window.Cart.addItem(product);
        }
        // Abrir el carrito
        if (window.CartUI) {
          window.CartUI.open();
        }
      }
    };

    // Asignar eventos a botones desktop
    if (viewBtn) {
      viewBtn.addEventListener('click', handleViewProduct);
    }
    if (buyBtn) {
      buyBtn.addEventListener('click', handleBuyNow);
    }

    // Asignar eventos a botones móvil
    if (viewBtnMobile) {
      viewBtnMobile.addEventListener('click', handleViewProduct);
    }
    if (buyBtnMobile) {
      buyBtnMobile.addEventListener('click', handleBuyNow);
    }
  }
}

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
