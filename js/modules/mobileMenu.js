/**
 * Mobile Menu Module
 * Maneja el menú hamburguesa y la búsqueda móvil
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
    categoriesToggle: null,
    categoriesSubmenu: null
  },

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
    this.elements.categoriesToggle = document.getElementById('mobile-categories-toggle');
    this.elements.categoriesSubmenu = document.getElementById('mobile-categories-submenu');

    // Verificar que existan los elementos principales
    if (!this.elements.menuToggle || !this.elements.mobileMenu) {
      console.log('📱 MobileMenu: Elementos no encontrados, saltando inicialización');
      return;
    }

    this.bindEvents();
    this.loadCategories();
    console.log('📱 MobileMenu inicializado');
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

    // Buscar al presionar Enter
    this.elements.searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch();
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

  async loadCategories() {
    try {
      const response = await fetch('data/categories.json');
      const categories = await response.json();
      
      if (this.elements.categoriesSubmenu && categories.length > 0) {
        this.elements.categoriesSubmenu.innerHTML = categories.map(cat => 
          `<a href="search.html?category=${encodeURIComponent(cat.id)}" class="mobile-menu__submenu-link" data-category="${cat.id}">
            ${cat.icon || '📦'} ${cat.name}
          </a>`
        ).join('');

        // Agregar evento para cerrar menú al seleccionar categoría
        const categoryLinks = this.elements.categoriesSubmenu.querySelectorAll('.mobile-menu__submenu-link');
        categoryLinks.forEach(link => {
          link.addEventListener('click', () => this.closeMenu());
        });
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  },

  toggleCategories() {
    const dropdown = this.elements.categoriesToggle?.closest('.mobile-menu__item--dropdown');
    if (dropdown) {
      dropdown.classList.toggle('open');
    }
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
    document.body.style.overflow = 'hidden'; // Prevenir scroll
  },

  closeMenu() {
    this.elements.mobileMenu?.classList.remove('active');
    this.elements.menuOverlay?.classList.remove('active');
    this.elements.menuToggle?.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
    
    // Cerrar submenú de categorías
    const dropdown = document.querySelector('.mobile-menu__item--dropdown');
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
    // Cerrar menú si está abierto
    this.closeMenu();
  },

  closeSearch() {
    this.elements.mobileSearch?.classList.remove('active');
    if (this.elements.searchInput) {
      this.elements.searchInput.value = '';
    }
  },

  performSearch() {
    const query = this.elements.searchInput?.value.trim();
    if (query) {
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  MobileMenu.init();
});

// Exportar para uso global
window.MobileMenu = MobileMenu;
