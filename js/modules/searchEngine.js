// Motor de búsqueda
class SearchEngine {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.products = [];
    this.init();
  }

  async init() {
    console.log('🔍 SearchEngine.init() - Cargando productos...');
    this.products = await this.dataLoader.getProducts();
    console.log('🔍 SearchEngine.init() - Productos cargados:', this.products?.length || 0);
    console.log('🔍 SearchEngine.init() - Llamando setupSearchListeners...');
    this.setupSearchListeners();
    
    // Verificar si hay parámetros de URL para filtrar
    this.checkUrlParams();
    
    console.log('🔍 SearchEngine.init() - setupSearchListeners completado');
  }

  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const query = urlParams.get('q');

    console.log('🔍 SearchEngine - URL params - category:', category, 'query:', query);

    if (category) {
      this.filterByCategory(category);
    } else if (query) {
      this.search(query);
      // Llenar el input con la query
      const searchInput = document.querySelector('.search__input') || document.querySelector(CONSTANTS.SELECTORS.SEARCH_INPUT);
      if (searchInput) {
        searchInput.value = query;
      }
    }
  }

  filterByCategory(categoryId) {
    console.log('🔍 SearchEngine.filterByCategory() - Category ID:', categoryId);
    
    // Mapear IDs de categorías a filtros específicos
    const categoryFilters = {
      '250': { // HIGIENE Y CUIDADO
        name: 'HIGIENE Y CUIDADO',
        filter: (product) => {
          return product.tags && product.tags.some(tag => 
            ['higiene', 'cuidado', 'limpieza', 'baño'].includes(tag.toLowerCase())
          );
        }
      },
      '261': { // COLCHONETAS Y MOISES
        name: 'COLCHONETAS Y MOISES',
        filter: (product) => {
          return (product.subcategory && product.subcategory.toLowerCase().includes('cama')) ||
                 (product.tags && product.tags.some(tag => 
                   ['cama', 'colchoneta', 'moisés', 'descanso'].includes(tag.toLowerCase())
                 ));
        }
      },
      '262': { // BOLSOS Y CASITAS
        name: 'BOLSOS Y CASITAS',
        filter: (product) => {
          return (product.subcategory && (
                   product.subcategory.toLowerCase().includes('casa') ||
                   product.subcategory.toLowerCase().includes('bolso') ||
                   product.subcategory.toLowerCase().includes('transportín')
                 )) ||
                 (product.tags && product.tags.some(tag => 
                   ['casa', 'bolso', 'transportín', 'viaje', 'casita'].includes(tag.toLowerCase())
                 ));
        }
      },
      '263': { // RASCADORES
        name: 'RASCADORES',
        filter: (product) => {
          return (product.subcategory && product.subcategory.toLowerCase().includes('rascador')) ||
                 (product.tags && product.tags.some(tag => tag.toLowerCase().includes('rascador'))) ||
                 (product.name && product.name.toLowerCase().includes('rascador'));
        }
      },
      '264': { // JUGUETES
        name: 'JUGUETES',
        filter: (product) => {
          return (product.subcategory && product.subcategory.toLowerCase().includes('juguete')) ||
                 (product.tags && product.tags.some(tag => 
                   ['juguete', 'juego', 'diversión', 'interactivo'].includes(tag.toLowerCase())
                 ));
        }
      },
      '275': { // ROPA VERANO
        name: 'ROPA VERANO',
        filter: (product) => {
          return product.tags && product.tags.some(tag => 
            ['ropa', 'verano', 'vestimenta', 'accesorio'].includes(tag.toLowerCase())
          );
        }
      },
      '316': { // ROPA INVIERNO
        name: 'ROPA INVIERNO',
        filter: (product) => {
          return product.tags && product.tags.some(tag => 
            ['ropa', 'invierno', 'abrigo', 'vestimenta'].includes(tag.toLowerCase())
          );
        }
      },
      '317': { // COLLARES, CORREAS Y PECHERAS
        name: 'COLLARES, CORREAS Y PECHERAS',
        filter: (product) => {
          return (product.subcategory && (
                   product.subcategory.toLowerCase().includes('collar') ||
                   product.subcategory.toLowerCase().includes('correa') ||
                   product.subcategory.toLowerCase().includes('pechera')
                 )) ||
                 (product.tags && product.tags.some(tag => 
                   ['collar', 'correa', 'pechera', 'paseo'].includes(tag.toLowerCase())
                 ));
        }
      },
      '409': { // COMEDEROS Y BEBEDEROS
        name: 'COMEDEROS Y BEBEDEROS',
        filter: (product) => {
          return (product.subcategory && (
                   product.subcategory.toLowerCase().includes('comedero') ||
                   product.subcategory.toLowerCase().includes('bebedero') ||
                   product.subcategory.toLowerCase().includes('alimentación')
                 )) ||
                 (product.tags && product.tags.some(tag => 
                   ['comedero', 'bebedero', 'alimentación', 'comida', 'agua'].includes(tag.toLowerCase())
                 ));
        }
      },
      '500': { // ACCESORIOS
        name: 'ACCESORIOS',
        filter: (product) => {
          return (product.subcategory && product.subcategory.toLowerCase().includes('accesorio')) ||
                 (product.tags && product.tags.some(tag => 
                   ['anteojos', 'accesorio', 'moda', 'estilo', 'complemento'].includes(tag.toLowerCase())
                 ));
        }
      }
    };

    const categoryConfig = categoryFilters[categoryId];
    
    if (!categoryConfig) {
      console.warn('🔍 SearchEngine.filterByCategory() - Category ID not found:', categoryId);
      this.displayCategoryResults([], categoryId, 'Categoría no encontrada');
      return;
    }
    
    console.log('🔍 SearchEngine.filterByCategory() - Filtering by:', categoryConfig.name);

    const results = this.products.filter(categoryConfig.filter);

    console.log('🔍 SearchEngine.filterByCategory() - Resultados encontrados:', results.length);
    console.log('🔍 SearchEngine.filterByCategory() - Productos:', results.map(p => `${p.name} (${p.subcategory})`));

    this.displayCategoryResults(results, categoryId, categoryConfig.name);
    
    // Mostrar botón de limpiar cuando hay filtro activo
    this.showClearButton();
  }

  displayCategoryResults(results, categoryId, categoryName) {
    const container = document.querySelector(CONSTANTS.SELECTORS.SEARCH_RESULTS);
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search__no-results">
          <p>No encontramos productos en la categoría "<strong>${categoryName}</strong>"</p>
          <p>Intenta con otra categoría</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="search__count">
        <p>Categoría: <strong>🐾 ${categoryName}</strong></p>
        <p>Se encontraron <strong>${results.length}</strong> producto${results.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="search__grid">
        ${results.map(p => this.renderResultCard(p)).join('')}
      </div>
    `;
  }

  setupSearchListeners() {
    console.log('🔍 SearchEngine.setupSearchListeners() - Buscando inputs...');
    console.log('🔍 Todos los inputs en la página:', document.querySelectorAll('input').length);
    document.querySelectorAll('input').forEach((input, idx) => {
      console.log(`  Input ${idx}:`, input.className, input.type, input.placeholder);
    });
    
    // Intentar encontrar el input en la página de búsqueda primero
    let searchInput = document.querySelector('.search__input');
    console.log('🔍 Buscando .search__input:', !!searchInput);
    
    // Si no lo encuentra, intentar con el selector del header
    if (!searchInput) {
      searchInput = document.querySelector(CONSTANTS.SELECTORS.SEARCH_INPUT);
      console.log('🔍 Buscando', CONSTANTS.SELECTORS.SEARCH_INPUT, ':', !!searchInput);
    }
    
    console.log('🔍 SearchEngine.setupSearchListeners() - searchInput encontrado:', !!searchInput);
    if (!searchInput) return;

    const debouncedSearch = Utils.debounce((e) => {
      const query = e.target.value.toLowerCase().trim();
      console.log('🔍 SearchEngine - Input event, query:', query, 'length:', query.length);
      if (query.length < 2) {
        this.clearResults();
        this.hideClearButton();
        return;
      }
      this.search(query);
      this.showClearButton();
    }, CONSTANTS.DEBOUNCE_DELAY);

    searchInput.addEventListener('input', debouncedSearch);
    console.log('🔍 SearchEngine - Event listener agregado');
    
    // Configurar botón de limpiar filtro
    this.setupClearButton();
  }

  setupClearButton() {
    const clearBtn = document.getElementById('clear-filter-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        console.log('🔍 SearchEngine - Limpiando filtros...');
        this.clearFilters();
      });
    }
  }

  showClearButton() {
    const clearBtn = document.getElementById('clear-filter-btn');
    if (clearBtn) {
      clearBtn.style.display = 'inline-block';
    }
  }

  hideClearButton() {
    const clearBtn = document.getElementById('clear-filter-btn');
    if (clearBtn) {
      clearBtn.style.display = 'none';
    }
  }

  clearFilters() {
    // Limpiar input de búsqueda
    const searchInput = document.querySelector('.search__input') || document.querySelector(CONSTANTS.SELECTORS.SEARCH_INPUT);
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Limpiar URL params
    const url = new URL(window.location);
    url.searchParams.delete('category');
    url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    
    // Mostrar todos los productos
    this.showAllProducts();
    
    // Ocultar botón de limpiar
    this.hideClearButton();
  }

  async showAllProducts() {
    console.log('🔍 SearchEngine.showAllProducts() - Mostrando todos los productos...');
    
    const container = document.querySelector(CONSTANTS.SELECTORS.SEARCH_RESULTS);
    if (!container) return;

    container.innerHTML = `
      <div class="search__count">
        <p><strong>Todos los productos</strong></p>
        <p>Se encontraron <strong>${this.products.length}</strong> producto${this.products.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="search__grid">
        ${this.products.map(p => this.renderResultCard(p)).join('')}
      </div>
    `;
  }

  search(query) {
    console.log('🔍 SearchEngine.search() - Query:', query, 'Productos disponibles:', this.products?.length || 0);
    const normalizedQuery = Utils.normalizeText(query);
    
    const results = this.products.filter(product => {
      const matchName = Utils.normalizeText(product.name).includes(normalizedQuery);
      const matchCategory = Utils.normalizeText(product.category).includes(normalizedQuery);
      const matchTags = product.tags.some(tag => Utils.normalizeText(tag).includes(normalizedQuery));
      const matchDescription = Utils.normalizeText(product.description).includes(normalizedQuery);

      return matchName || matchCategory || matchTags || matchDescription;
    });

    console.log('🔍 SearchEngine.search() - Resultados encontrados:', results.length);
    this.displayResults(results, query);
  }

  displayResults(results, query) {
    const container = document.querySelector(CONSTANTS.SELECTORS.SEARCH_RESULTS);
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search__no-results">
          <p>No encontramos productos para "<strong>${Utils.truncateText(query, 50)}</strong>"</p>
          <p>Intenta con otras palabras clave</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="search__count">
        <p>Se encontraron <strong>${results.length}</strong> producto${results.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="search__grid">
        ${results.map(p => this.renderResultCard(p)).join('')}
      </div>
    `;
  }

  renderResultCard(product) {
    return `
      <div class="search-card" onclick="window.location.href='product.html?id=${product.id}'">
        <img src="${product.images.thumb}" alt="${product.name}" loading="lazy">
        <h3>${product.name}</h3>
        <p class="search-card__category">${product.category}</p>
        <div class="search-card__price">
          <span>${Utils.formatPrice(product.price)}</span>
          ${product.discount ? `<span class="search-card__discount">-${product.discount}%</span>` : ''}
        </div>
      </div>
    `;
  }

  clearResults() {
    const container = document.querySelector(CONSTANTS.SELECTORS.SEARCH_RESULTS);
    if (container) container.innerHTML = '';
  }
}
