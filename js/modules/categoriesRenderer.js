// Renderizador de categorías
class CategoriesRenderer {
  constructor() {
    this.categories = [];
  }

  async init() {
    try {
      const data = await dataLoader.getCategories();
      this.categories = data.categories || [];
      this.renderHeaderDropdown();
      this.renderFooterCategories();
    } catch (error) {
      console.error('Error initializing categories:', error);
    }
  }

  renderHeaderDropdown() {
    const dropdown = document.getElementById('categories-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = this.categories
      .map(cat => `
        <li class="nav__dropdown-item">
          <a href="search.html?category=${cat.id}">
            <div class="nav__dropdown-item-name">${cat.name}</div>
          </a>
        </li>
      `)
      .join('');
  }

  renderFooterCategories() {
    const container = document.getElementById('footer-categories');
    if (!container) return;

    container.innerHTML = this.categories
      .map(cat => `<li><a href="search.html?category=${cat.id}">${cat.name}</a></li>`)
      .join('');
  }

  // Obtener categoría por ID
  getCategoryById(id) {
    return this.categories.find(cat => cat.id === id);
  }

  // Obtener todas las categorías
  getAll() {
    return this.categories;
  }
}

const categoriesRenderer = new CategoriesRenderer();
