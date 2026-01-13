// Constantes globales
const CONSTANTS = {
  API_BASE: '/data/',
  CACHE_DURATION: 3600000, // 1 hora en ms
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  CAROUSEL_SCROLL_AMOUNT: 300,
  
  // WhatsApp Configuration
  WHATSAPP: {
    PHONE: '541150192474', // Número sin + ni espacios
    COUNTRY_CODE: '+54',
  },
  
  SELECTORS: {
    HERO: '.hero',
    PROMOS: '.promos__grid',
    SECTIONS: '.section',
    CARDS: '.card',
    SEARCH_INPUT: '.header__search-input',
    SEARCH_RESULTS: '.search__results',
  },
  
  CLASSES: {
    ACTIVE: 'active',
    LOADING: 'loading',
    ERROR: 'error',
    HIDDEN: 'hidden',
    ANIMATE_FADE_IN: 'animate-fade-in',
  },
  
  MESSAGES: {
    LOADING: 'Cargando...',
    ERROR: 'Error al cargar los datos',
    NO_RESULTS: 'No se encontraron resultados',
  }
};
