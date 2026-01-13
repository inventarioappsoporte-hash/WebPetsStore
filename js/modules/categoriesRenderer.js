// Renderizador de categorías
class CategoriesRenderer {
  constructor() {
    this.categories = [];
  }

  async init() {
    try {
      this.categories = await dataLoader.getCategories();
      this.renderFooterCategories();
    } catch (error) {
      console.error('Error initializing categories:', error);
    }
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
