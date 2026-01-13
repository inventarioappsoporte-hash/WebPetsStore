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
    
    // Buscar la categoría por ID en nuestro sistema de categorías
    let categoryName = '';
    
    // Mapear IDs de categorías de la BD a nombres del sistema
    const categoryMap = {
      '250': 'Gatos', // HIGIENE Y CUIDADO -> Gatos (productos de higiene)
      '261': 'Gatos', // COLCHONETAS Y MOISES -> Gatos
      '262': 'Gatos', // BOLSOS Y CASITAS -> Gatos  
      '263': 'Gatos', // RASCADORES -> Gatos
      '264': 'Gatos', // JUGUETES -> Gatos (aunque también hay para perros)
      '275': 'Gatos', // ROPA VERANO -> Gatos
      '316': 'Gatos', // ROPA INVIERNO -> Gatos
      '317': 'Perros', // COLLARES, CORREAS Y PECHERAS -> Perros
      '409': 'Gatos'  // COMEDEROS Y BEBEDEROS -> Gatos (aunque también hay para perros)
    };

    categoryName = categoryMap[categoryId] || 'Gatos';
    
    console.log('🔍 SearchEngine.filterByCategory() - Mapped to:', categoryName);

    const results = this.products.filter(product => {
      // Filtrar por categoría exacta o por subcategoría que contenga "rascador"
      const matchCategory = product.category === categoryName;
      const matchSubcategory = product.subcategory && product.subcategory.toLowerCase().includes('rascador');
      const matchTags = product.tags && product.tags.some(tag => tag.toLowerCase().includes('rascador'));
      
      return matchCategory || matchSubcategory || matchTags;
    });

    console.log('🔍 SearchEngine.filterByCategory() - Resultados encontrados:', results.length);
    console.log('🔍 SearchEngine.filterByCategory() - Productos:', results.map(p => p.name));

    this.displayCategoryResults(results, categoryId, categoryName);
  }

  displayCategoryResults(results, categoryId, categoryName) {
    const container = document.querySelector(CONSTANTS.SELECTORS.SEARCH_RESULTS);
    if (!container) return;

    // Obtener el nombre real de la categoría de la BD
    const categoryNames = {
      '250': '🐾 HIGIENE Y CUIDADO',
      '261': '🐾 COLCHONETAS Y MOISES', 
      '262': '🐾 BOLSOS Y CASITAS',
      '263': '🐾 RASCADORES',
      '264': '🐾 JUGUETES',
      '275': '🐾 ROPA VERANO',
      '316': '🐾 ROPA INVIERNO', 
      '317': '🐾 COLLARES, CORREAS Y PECHERAS',
      '409': '🐾 COMEDEROS Y BEBEDEROS'
    };

    const displayName = categoryNames[categoryId] || categoryName;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search__no-results">
          <p>No encontramos productos en la categoría "<strong>${displayName}</strong>"</p>
          <p>Intenta con otra categoría</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="search__count">
        <p>Categoría: <strong>${displayName}</strong></p>
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
        return;
      }
      this.search(query);
    }, CONSTANTS.DEBOUNCE_DELAY);

    searchInput.addEventListener('input', debouncedSearch);
    console.log('🔍 SearchEngine - Event listener agregado');
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
