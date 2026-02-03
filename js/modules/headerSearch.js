// Header Search Module - Netflix style search with dropdown results
class HeaderSearch {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.searchInput = document.getElementById('header-search-input');
    this.searchBtn = document.getElementById('header-search-toggle');
    this.isOpen = false;
    this.products = [];
    this.resultsDropdown = null;
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

    this.createResultsDropdown();
    this.setupListeners();
  }

  createResultsDropdown() {
    this.resultsDropdown = document.createElement('div');
    this.resultsDropdown.className = 'header__search-results';
    this.resultsDropdown.style.display = 'none';
    this.searchInput.parentElement.appendChild(this.resultsDropdown);
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
      } else {
        this.hideResults();
      }
    }, CONSTANTS.DEBOUNCE_DELAY);

    this.searchInput.addEventListener('input', debouncedSearch);

    // Cerrar búsqueda al presionar Escape
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSearch();
      }
    });

    // Cerrar resultados al perder el foco
    this.searchInput.addEventListener('blur', () => {
      setTimeout(() => this.hideResults(), 200);
    });

    // Mostrar resultados al hacer focus
    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.length >= 2) {
        this.resultsDropdown.style.display = 'block';
      }
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
    this.hideResults();
    console.log('🔍 HeaderSearch - Cerrado');
  }

  performSearch(query) {
    const normalizedQuery = Utils.normalizeText(query);
    
    const results = this.products.filter(product => {
      // Manejar campos que pueden ser null o undefined
      const matchName = product.name ? Utils.normalizeText(product.name).includes(normalizedQuery) : false;
      const matchCategory = product.category ? Utils.normalizeText(product.category).includes(normalizedQuery) : false;
      const matchSubcategory = product.subcategory ? Utils.normalizeText(product.subcategory).includes(normalizedQuery) : false;
      const matchTags = product.tags && Array.isArray(product.tags) ? product.tags.some(tag => Utils.normalizeText(tag).includes(normalizedQuery)) : false;
      const matchDescription = product.description ? Utils.normalizeText(product.description).includes(normalizedQuery) : false;

      return matchName || matchCategory || matchSubcategory || matchTags || matchDescription;
    });

    console.log('🔍 HeaderSearch - Resultados encontrados:', results.length);
    this.displayResults(results, query);
  }

  displayResults(results, query) {
    if (results.length === 0) {
      this.resultsDropdown.innerHTML = `
        <div class="header__search-no-results">
          <p>No encontramos productos para "<strong>${Utils.truncateText(query, 30)}</strong>"</p>
        </div>
      `;
      this.resultsDropdown.style.display = 'block';
      return;
    }

    this.resultsDropdown.innerHTML = `
      <div class="header__search-count">
        <p>Se encontraron <strong>${results.length}</strong> producto${results.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="header__search-items">
        ${results.slice(0, 5).map(p => this.renderResultItem(p)).join('')}
        ${results.length > 5 ? `<div class="header__search-more"><a href="search.html?q=${encodeURIComponent(query)}">Ver todos (${results.length})</a></div>` : ''}
      </div>
    `;
    this.resultsDropdown.style.display = 'block';
  }

  renderResultItem(product) {
    // Determinar el precio a mostrar con validación robusta
    let displayPrice = null;
    let displayOriginalPrice = null;
    
    // 1. Intentar con basePrice si tiene variantes
    if (product.hasVariants && product.basePrice) {
      displayPrice = product.basePrice;
      displayOriginalPrice = product.baseOriginalPrice;
    }
    
    // 2. Si no, intentar con price directo
    if (!displayPrice && product.price) {
      displayPrice = product.price;
      displayOriginalPrice = product.originalPrice;
    }
    
    // 3. Si no, buscar en variants.combinations
    if (!displayPrice && product.variants?.combinations?.length > 0) {
      displayPrice = product.variants.combinations[0].price;
      displayOriginalPrice = product.variants.combinations[0].originalPrice;
    }
    
    // 4. Si no, buscar en variants.options (para productos con variantes simples)
    if (!displayPrice && product.variants?.options?.length > 0) {
      const firstOption = product.variants.options[0];
      if (firstOption.price) {
        displayPrice = firstOption.price;
        displayOriginalPrice = firstOption.originalPrice;
      }
    }
    
    // 5. Validación final: asegurar que displayPrice es un número válido
    displayPrice = parseFloat(displayPrice);
    displayOriginalPrice = parseFloat(displayOriginalPrice) || null;
    if (isNaN(displayPrice) || displayPrice <= 0) {
      displayPrice = 0;
    }
    
    // Determinar modo de visualización de precios
    const priceDisplayMode = product.priceDisplayMode || 'discount';
    
    // Verificar si tiene descuento real (originalPrice > price)
    const hasDiscount = displayOriginalPrice && displayOriginalPrice > displayPrice;
    
    // Generar HTML de precios según el modo
    let priceHtml = '';
    if (priceDisplayMode === 'wholesale' && hasDiscount) {
      // Modo Mayorista CON descuento: compacto para el dropdown
      priceHtml = `
        <div class="header__search-item-price header__search-item-price--wholesale">
          <span class="header__search-price-list">${Utils.formatPrice(displayOriginalPrice)}</span>
          <span class="header__search-price-arrow">→</span>
          <span class="header__search-price-wholesale">${Utils.formatPrice(displayPrice)}</span>
        </div>
      `;
    } else {
      // Modo normal o mayorista sin descuento: solo precio
      priceHtml = `<p>${Utils.formatPrice(displayPrice)}</p>`;
    }
    
    return `
      <div class="header__search-item" onclick="window.location.href='product.html?id=${product.id}'">
        <img src="${product.images.thumb}" alt="${product.name}" class="header__search-item-img">
        <div class="header__search-item-info">
          <h4>${product.name}</h4>
          ${priceHtml}
        </div>
      </div>
    `;
  }

  hideResults() {
    this.resultsDropdown.style.display = 'none';
  }
}
