/**
 * Mobile Menu Module
 * Maneja el menú hamburguesa y la búsqueda móvil con resultados en tiempo real
 */

const MobileMenu = {
  elements: {
    menuToggle: null,
    mobileMenu: null,
    menuOverlay: null,
    menuClose: null,
    searchToggle: null,
    mobileSearch: null,
    searchClose: null,
    searchInput: null,
    searchResults: null,
    categoriesToggle: null,
    categoriesSubmenu: null
  },
  
  products: [],

  init() {
    // Obtener elementos
    this.elements.menuToggle = document.getElementById('menu-toggle');
    this.elements.mobileMenu = document.getElementById('mobile-menu');
    this.elements.menuOverlay = document.getElementById('mobile-menu-overlay');
    this.elements.menuClose = document.getElementById('mobile-menu-close');
    this.elements.searchToggle = document.getElementById('header-search-toggle-mobile');
    this.elements.mobileSearch = document.getElementById('mobile-search');
    this.elements.searchClose = document.getElementById('mobile-search-close');
    this.elements.searchInput = document.getElementById('mobile-search-input');
    this.elements.searchResults = document.getElementById('mobile-search-results');
    this.elements.categoriesToggle = document.getElementById('mobile-categories-toggle');
    this.elements.categoriesSubmenu = document.getElementById('mobile-categories-submenu');

    // Verificar que existan los elementos principales
    if (!this.elements.menuToggle || !this.elements.mobileMenu) {
      console.log('📱 MobileMenu: Elementos no encontrados, saltando inicialización');
      return;
    }

    this.bindEvents();
    this.loadCategories();
    this.loadProducts();
    console.log('📱 MobileMenu inicializado');
  },

  async loadProducts() {
    try {
      const response = await fetch('data/products.json');
      const allProducts = await response.json();
      
      // Filtrar productos sin stock
      this.products = allProducts.filter(p => {
        if (p.stock === undefined || p.stock === null) return true;
        return p.stock > 0;
      });
      
      console.log('📱 MobileMenu: Productos cargados:', this.products.length, '(filtrados de', allProducts.length, ')');
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  },

  bindEvents() {
    // Toggle del menú hamburguesa
    this.elements.menuToggle?.addEventListener('click', () => this.toggleMenu());
    
    // Cerrar menú con botón X
    this.elements.menuClose?.addEventListener('click', () => this.closeMenu());
    
    // Cerrar menú al hacer click en overlay
    this.elements.menuOverlay?.addEventListener('click', () => this.closeMenu());
    
    // Cerrar menú al seleccionar una opción (excepto el toggle de categorías)
    const menuLinks = this.elements.mobileMenu?.querySelectorAll('.mobile-menu__link:not(.mobile-menu__link--toggle)');
    menuLinks?.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Toggle de categorías
    this.elements.categoriesToggle?.addEventListener('click', () => this.toggleCategories());

    // Toggle de búsqueda móvil
    this.elements.searchToggle?.addEventListener('click', () => this.toggleSearch());
    
    // Cerrar búsqueda
    this.elements.searchClose?.addEventListener('click', () => this.closeSearch());

    // Búsqueda en tiempo real al escribir
    this.elements.searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length >= 2) {
        this.performLiveSearch(query);
      } else {
        this.hideSearchResults();
      }
    });

    // Buscar al presionar Enter
    this.elements.searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.goToSearchPage();
      }
    });

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMenu();
        this.closeSearch();
      }
    });
  },

  performLiveSearch(query) {
    const normalizedQuery = this.normalizeText(query);
    
    const results = this.products.filter(product => {
      const matchName = product.name ? this.normalizeText(product.name).includes(normalizedQuery) : false;
      const matchCategory = product.category ? this.normalizeText(product.category).includes(normalizedQuery) : false;
      const matchSubcategory = product.subcategory ? this.normalizeText(product.subcategory).includes(normalizedQuery) : false;
      const matchDescription = product.description ? this.normalizeText(product.description).includes(normalizedQuery) : false;
      
      return matchName || matchCategory || matchSubcategory || matchDescription;
    });

    this.displaySearchResults(results, query);
  },

  normalizeText(text) {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  },

  displaySearchResults(results, query) {
    if (!this.elements.searchResults) return;

    if (results.length === 0) {
      this.elements.searchResults.innerHTML = `
        <div class="mobile-search__no-results">
          <p>No encontramos productos para "<strong>${query}</strong>"</p>
        </div>
      `;
    } else {
      const itemsHtml = results.slice(0, 6).map(p => this.renderSearchItem(p)).join('');
      const moreHtml = results.length > 6 
        ? `<div class="mobile-search__more"><a href="search.html?q=${encodeURIComponent(query)}">Ver todos (${results.length})</a></div>` 
        : '';
      
      this.elements.searchResults.innerHTML = `
        <div class="mobile-search__count">
          <p>Se encontraron <strong>${results.length}</strong> producto${results.length !== 1 ? 's' : ''}</p>
        </div>
        <div class="mobile-search__items">
          ${itemsHtml}
        </div>
        ${moreHtml}
      `;
    }
    
    this.elements.searchResults.classList.add('active');
  },

  renderSearchItem(product) {
    let price = product.price || product.basePrice || 0;
    if (product.variants?.combinations?.length > 0) {
      price = product.variants.combinations[0].price || price;
    }
    
    const formattedPrice = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);

    const thumb = product.images?.thumb || product.images?.main || 'assets/images/placeholder.jpg';

    return `
      <div class="mobile-search__item" onclick="window.location.href='product.html?id=${product.id}'">
        <img src="${thumb}" alt="${product.name}" class="mobile-search__item-img">
        <div class="mobile-search__item-info">
          <h4>${product.name}</h4>
          <p>${formattedPrice}</p>
        </div>
      </div>
    `;
  },

  hideSearchResults() {
    if (this.elements.searchResults) {
      this.elements.searchResults.classList.remove('active');
      this.elements.searchResults.innerHTML = '';
    }
  },

  goToSearchPage() {
    const query = this.elements.searchInput?.value.trim();
    if (query) {
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
  },

  async loadCategories() {
    try {
      const response = await fetch('data/categories.json');
      const data = await response.json();
      // El JSON tiene estructura { categories: [...] }
      const categories = data.categories || data;
      
      if (this.elements.categoriesSubmenu && categories.length > 0) {
        const html = categories.map(cat => {
          // Usar el ID de la categoría, igual que en desktop
          return `<a href="search.html?category=${cat.id}" class="mobile-menu__sublink">${cat.name}</a>`;
        }).join('');
        
        this.elements.categoriesSubmenu.innerHTML = html;
        
        // Agregar evento para cerrar menú al seleccionar categoría
        const sublinks = this.elements.categoriesSubmenu.querySelectorAll('.mobile-menu__sublink');
        sublinks.forEach(link => {
          link.addEventListener('click', () => this.closeMenu());
        });
        
        console.log('📱 MobileMenu: Categorías cargadas:', categories.length);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  },

  getCategoryIcon(name) {
    const icons = {
      'ropa': '👕',
      'juguetes': '🎾',
      'comederos': '🍽️',
      'colchonetas': '🛏️',
      'accesorios': '🎀',
      'higiene': '🧴',
      'alimentos': '🦴',
      'transportadoras': '🧳',
      'correas': '🦮'
    };
    const key = name.toLowerCase();
    return icons[key] || '📦';
  },

  toggleMenu() {
    const isOpen = this.elements.mobileMenu?.classList.contains('active');
    if (isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  },

  openMenu() {
    this.elements.mobileMenu?.classList.add('active');
    this.elements.menuOverlay?.classList.add('active');
    this.elements.menuToggle?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeMenu() {
    this.elements.mobileMenu?.classList.remove('active');
    this.elements.menuOverlay?.classList.remove('active');
    this.elements.menuToggle?.classList.remove('active');
    document.body.style.overflow = '';
    this.closeCategories();
  },

  toggleCategories() {
    const dropdown = this.elements.categoriesToggle?.closest('.mobile-menu__item--dropdown');
    if (dropdown) {
      dropdown.classList.toggle('open');
    }
  },

  closeCategories() {
    const dropdown = this.elements.categoriesToggle?.closest('.mobile-menu__item--dropdown');
    if (dropdown) {
      dropdown.classList.remove('open');
    }
  },

  toggleSearch() {
    const isOpen = this.elements.mobileSearch?.classList.contains('active');
    if (isOpen) {
      this.closeSearch();
    } else {
      this.openSearch();
    }
  },

  openSearch() {
    this.elements.mobileSearch?.classList.add('active');
    this.elements.searchInput?.focus();
    this.closeMenu();
  },

  closeSearch() {
    this.elements.mobileSearch?.classList.remove('active');
    if (this.elements.searchInput) {
      this.elements.searchInput.value = '';
    }
    this.hideSearchResults();
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  MobileMenu.init();
});

// Exportar para uso global
window.MobileMenu = MobileMenu;
