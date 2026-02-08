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
    searchInput: null
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

    // Verificar que existan los elementos principales
    if (!this.elements.menuToggle || !this.elements.mobileMenu) {
      console.log('📱 MobileMenu: Elementos no encontrados, saltando inicialización');
      return;
    }

    this.bindEvents();
    console.log('📱 MobileMenu inicializado');
  },

  bindEvents() {
    // Toggle del menú hamburguesa
    this.elements.menuToggle?.addEventListener('click', () => this.toggleMenu());
    
    // Cerrar menú con botón X
    this.elements.menuClose?.addEventListener('click', () => this.closeMenu());
    
    // Cerrar menú al hacer click en overlay
    this.elements.menuOverlay?.addEventListener('click', () => this.closeMenu());
    
    // Cerrar menú al seleccionar una opción
    const menuLinks = this.elements.mobileMenu?.querySelectorAll('.mobile-menu__link');
    menuLinks?.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

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
