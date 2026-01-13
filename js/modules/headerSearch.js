// Header Search Module - Netflix style search
class HeaderSearch {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.searchInput = document.getElementById('header-search-input');
    this.searchBtn = document.getElementById('header-search-toggle');
    this.isOpen = false;
    this.products = [];
    this.init();
  }

  async init() {
    console.log('🔍 HeaderSearch.init() - Inicializando...');
    this.products = await this.dataLoader.getProducts();
    console.log('🔍 HeaderSearch.init() - Productos cargados:', this.products?.length || 0);
    
    if (!this.searchInput || !this.searchBtn) {
      console.log('🔍 HeaderSearch - Elementos no encontrados');
      return;
    }

    this.setupListeners();
  }

  setupListeners() {
    // Click en el botón de búsqueda
    this.searchBtn.addEventListener('click', () => this.toggleSearch());

    // Input en el campo de búsqueda
    const debouncedSearch = Utils.debounce((e) => {
      const query = e.target.value.toLowerCase().trim();
      console.log('🔍 HeaderSearch - Query:', query);
      if (query.length >= 2) {
        this.performSearch(query);
      }
    }, CONSTANTS.DEBOUNCE_DELAY);

    this.searchInput.addEventListener('input', debouncedSearch);

    // Cerrar búsqueda al presionar Escape
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSearch();
      }
    });

    // Cerrar búsqueda al perder el foco
    this.searchInput.addEventListener('blur', () => {
      setTimeout(() => this.closeSearch(), 200);
    });
  }

  toggleSearch() {
    if (this.isOpen) {
      this.closeSearch();
    } else {
      this.openSearch();
    }
  }

  openSearch() {
    this.isOpen = true;
    this.searchInput.classList.remove('collapsed');
    this.searchInput.focus();
    console.log('🔍 HeaderSearch - Abierto');
  }

  closeSearch() {
    this.isOpen = false;
    this.searchInput.classList.add('collapsed');
    this.searchInput.value = '';
    console.log('🔍 HeaderSearch - Cerrado');
  }

  performSearch(query) {
    const normalizedQuery = Utils.normalizeText(query);
    
    const results = this.products.filter(product => {
      const matchName = Utils.normalizeText(product.name).includes(normalizedQuery);
      const matchCategory = Utils.normalizeText(product.category).includes(normalizedQuery);
      const matchTags = product.tags.some(tag => Utils.normalizeText(tag).includes(normalizedQuery));
      const matchDescription = Utils.normalizeText(product.description).includes(normalizedQuery);

      return matchName || matchCategory || matchTags || matchDescription;
    });

    console.log('🔍 HeaderSearch - Resultados encontrados:', results.length);
    
    if (results.length > 0) {
      // Redirigir a la página de búsqueda con el query
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
  }
}
