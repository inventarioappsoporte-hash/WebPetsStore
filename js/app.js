// Aplicación principal
// Updated: 2026-01-13 - WhatsApp integration
class App {
  constructor() {
    this.dataLoader = dataLoader;
    this.init();
  }

  async init() {
    try {
      // Renderizar home
      const homeRenderer = new HomeRenderer(this.dataLoader);
      await homeRenderer.render();

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
    
    const viewBtn = document.getElementById('hero-view-btn');
    const buyBtn = document.getElementById('hero-buy-btn');

    console.log('✅ hero-view-btn found:', !!viewBtn);
    console.log('✅ hero-buy-btn found:', !!buyBtn);

    if (viewBtn) {
      viewBtn.addEventListener('click', async () => {
        console.log('🖱️ Click en VER PRODUCTO');
        const productId = await this.dataLoader.getHeroProductId();
        console.log('Product ID:', productId);
        if (productId) {
          window.location.href = `product.html?id=${productId}`;
        }
      });
    } else {
      console.log('❌ Botón VER PRODUCTO NO encontrado');
    }

    if (buyBtn) {
      buyBtn.addEventListener('click', async () => {
        console.log('🖱️ Click en COMPRAR AHORA');
        const productId = await this.dataLoader.getHeroProductId();
        const product = await this.dataLoader.getProductById(productId);
        console.log('Product:', product);
        if (product) {
          Utils.sendWhatsAppMessage(product);
        }
      });
    } else {
      console.log('❌ Botón COMPRAR AHORA NO encontrado');
    }
  }
}

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
