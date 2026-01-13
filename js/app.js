// Aplicación principal
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

      // Inicializar botones del hero
      this.initHeroButtons();

      console.log('✅ Pets Store cargado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando la aplicación:', error);
    }
  }

  initHeroButtons() {
    const viewBtn = document.getElementById('hero-view-btn');
    const buyBtn = document.getElementById('hero-buy-btn');

    if (viewBtn) {
      viewBtn.addEventListener('click', async () => {
        const productId = await this.dataLoader.getHeroProductId();
        if (productId) {
          window.location.href = `product.html?id=${productId}`;
        }
      });
    }

    if (buyBtn) {
      buyBtn.addEventListener('click', async () => {
        const productId = await this.dataLoader.getHeroProductId();
        const product = await this.dataLoader.getProductById(productId);
        if (product) {
          Utils.sendWhatsAppMessage(product);
        }
      });
    }
  }
}

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
