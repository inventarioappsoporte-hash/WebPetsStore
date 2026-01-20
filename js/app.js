// Aplicación principal
// Updated: 2026-01-13 - WhatsApp integration
class App {
  constructor() {
    this.dataLoader = dataLoader;
    this.init();
  }

  async init() {
    try {
      // Inicializar categorías
      await categoriesRenderer.init();

      // Renderizar home
      const homeRenderer = new HomeRenderer(this.dataLoader);
      await homeRenderer.render();

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

      console.log('✅ Pets Store cargado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando la aplicación:', error);
    }
  }

  initHeroButtons() {
    console.log('🔍 Buscando botones del hero...');
    
    // Botones desktop
    const viewBtn = document.getElementById('hero-view-btn');
    const buyBtn = document.getElementById('hero-buy-btn');
    
    // Botones móvil
    const viewBtnMobile = document.getElementById('hero-view-btn-mobile');
    const buyBtnMobile = document.getElementById('hero-buy-btn-mobile');

    console.log('✅ hero-view-btn found:', !!viewBtn);
    console.log('✅ hero-buy-btn found:', !!buyBtn);
    console.log('✅ hero-view-btn-mobile found:', !!viewBtnMobile);
    console.log('✅ hero-buy-btn-mobile found:', !!buyBtnMobile);

    // Handler para VER PRODUCTO
    const handleViewProduct = async () => {
      console.log('🖱️ Click en VER PRODUCTO');
      const productId = await this.dataLoader.getHeroProductId();
      console.log('Product ID:', productId);
      if (productId) {
        window.location.href = `product.html?id=${productId}`;
      }
    };

    // Handler para COMPRAR AHORA - Agrega al carrito y lo abre
    const handleBuyNow = async () => {
      console.log('🖱️ Click en COMPRAR AHORA');
      const productId = await this.dataLoader.getHeroProductId();
      const product = await this.dataLoader.getProductById(productId);
      console.log('Product:', product);
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
