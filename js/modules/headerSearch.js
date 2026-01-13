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
      const matchName = Utils.normalizeText(product.name).includes(normalizedQuery);
      const matchCategory = Utils.normalizeText(product.category).includes(normalizedQuery);
      const matchTags = product.tags.some(tag => Utils.normalizeText(tag).includes(normalizedQuery));
      const matchDescription = Utils.normalizeText(product.description).includes(normalizedQuery);

      return matchName || matchCategory || matchTags || matchDescription;
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
    return `
      <div class="header__search-item" onclick="window.location.href='product.html?id=${product.id}'">
        <img src="${product.images.thumb}" alt="${product.name}" class="header__search-item-img">
        <div class="header__search-item-info">
          <h4>${product.name}</h4>
          <p>${Utils.formatPrice(product.price)}</p>
        </div>
      </div>
    `;
  }

  hideResults() {
    this.resultsDropdown.style.display = 'none';
  }
}
