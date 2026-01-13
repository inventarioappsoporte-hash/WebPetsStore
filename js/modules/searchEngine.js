// Motor de búsqueda
class SearchEngine {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.products = [];
    this.init();
  }

  async init() {
    this.products = await this.dataLoader.getProducts();
    this.setupSearchListeners();
  }

  setupSearchListeners() {
    const searchInput = document.querySelector(CONSTANTS.SELECTORS.SEARCH_INPUT);
    if (!searchInput) return;

    const debouncedSearch = Utils.debounce((e) => {
      const query = e.target.value.toLowerCase().trim();
      if (query.length < 2) {
        this.clearResults();
        return;
      }
      this.search(query);
    }, CONSTANTS.DEBOUNCE_DELAY);

    searchInput.addEventListener('input', debouncedSearch);
  }

  search(query) {
    const normalizedQuery = Utils.normalizeText(query);
    
    const results = this.products.filter(product => {
      const matchName = Utils.normalizeText(product.name).includes(normalizedQuery);
      const matchCategory = Utils.normalizeText(product.category).includes(normalizedQuery);
      const matchTags = product.tags.some(tag => Utils.normalizeText(tag).includes(normalizedQuery));
      const matchDescription = Utils.normalizeText(product.description).includes(normalizedQuery);

      return matchName || matchCategory || matchTags || matchDescription;
    });

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
