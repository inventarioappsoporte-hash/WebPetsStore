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

      console.log('✅ Pets Store cargado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando la aplicación:', error);
    }
  }
}

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
