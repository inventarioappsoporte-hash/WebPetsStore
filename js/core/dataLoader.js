// Cargador de datos
class DataLoader {
  constructor() {
    this.cache = {};
    // Detectar la ruta base correcta para GitHub Pages, local y admin
    const pathname = window.location.pathname;
    const hostname = window.location.hostname;
    
    console.log('🔍 DataLoader - hostname:', hostname);
    console.log('🔍 DataLoader - pathname:', pathname);
    console.log('🔍 DataLoader - protocol:', window.location.protocol);
    
    // Si estamos en GitHub Pages (github.io), la ruta incluye el repo name
    const isGitHubPages = hostname.includes('github.io');
    const isLocalFile = window.location.protocol === 'file:';
    // Detectar si estamos siendo servidos desde /pets-store/ (admin server)
    const isFromAdmin = pathname.startsWith('/pets-store/');
    
    console.log('🔍 DataLoader - isGitHubPages:', isGitHubPages);
    console.log('🔍 DataLoader - isLocalFile:', isLocalFile);
    console.log('🔍 DataLoader - isFromAdmin:', isFromAdmin);
    
    // Para archivos locales, usar ruta relativa
    let baseUrl;
    if (isLocalFile) {
      baseUrl = 'data/';
    } else if (isFromAdmin) {
      // Servido desde el admin en /pets-store/
      baseUrl = '/pets-store/data/';
    } else if (isGitHubPages) {
      // Extraer el nombre del repo del pathname
      const pathParts = pathname.split('/').filter(p => p);
      if (pathParts.length > 0 && pathParts[0] !== 'index.html') {
        baseUrl = `/${pathParts[0]}/data/`;
      } else {
        baseUrl = '/WebPetsStore/data/';
      }
    } else {
      baseUrl = '/data/';
    }
    
    this.baseUrl = baseUrl;
    console.log('🔍 DataLoader - Final baseUrl:', this.baseUrl);
  }

  async load(filename) {
    console.log(`🔍 DataLoader.load() - Loading: ${filename}`);
    console.log(`🔍 DataLoader.load() - Full URL: ${this.baseUrl}${filename}`);
    
    if (this.cache[filename]) {
      console.log(`📋 DataLoader.load() - Using cached data for: ${filename}`);
      return this.cache[filename];
    }

    try {
      const fullUrl = `${this.baseUrl}${filename}`;
      console.log(`📡 DataLoader.load() - Fetching: ${fullUrl}`);
      
      const response = await fetch(fullUrl);
      console.log(`📡 DataLoader.load() - Response status: ${response.status} for ${filename}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ DataLoader.load() - Data loaded successfully for ${filename}:`, data?.length || 'object');
      
      this.cache[filename] = data;
      return data;
    } catch (error) {
      console.error(`❌ DataLoader.load() - Failed to load ${filename}:`, error);
      console.error(`❌ DataLoader.load() - URL attempted: ${this.baseUrl}${filename}`);
      return null;
    }
  }

  async getProducts() {
    // Forzar recarga sin cache para debug
    const timestamp = Date.now();
    console.log('🔄 Loading products with timestamp:', timestamp);
    return this.load(`products.json?v=${timestamp}`);
  }

  async getHomeConfig() {
    return this.load('home.json');
  }

  async getCategories() {
    return this.load('categories.json');
  }

  async getConfig() {
    return this.load('config.json');
  }

  async getWholesaleConfig() {
    return this.load('wholesale.json');
  }

  // Obtener producto por ID
  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === id);
  }

  // Obtener ID del producto del hero
  async getHeroProductId() {
    const homeConfig = await this.getHomeConfig();
    const productId = homeConfig?.hero?.productId;
    if (!productId) {
      console.warn('⚠️ No hero productId found in home.json');
    }
    return productId;
  }

  // Filtrar productos
  async filterProducts(criteria) {
    const products = await this.getProducts();
    return products.filter(p => {
      return Object.keys(criteria).every(key => {
        const value = criteria[key];
        
        if (typeof value === 'object' && value.$gte) {
          return p[key] >= value.$gte;
        }
        
        if (Array.isArray(value)) {
          return value.includes(p[key]);
        }
        
        return p[key] === value;
      });
    });
  }

  // Ordenar productos
  sortProducts(products, sortBy, order = 'desc') {
    const sorted = [...products];
    
    sorted.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
    
    return sorted;
  }

  // Limpiar caché
  clearCache() {
    this.cache = {};
  }
}

const dataLoader = new DataLoader();

/**
 * Helper para obtener la ruta correcta de una imagen
 * Considera si estamos en GitHub Pages, local o servido desde el admin
 */
function getImageUrl(imagePath) {
  if (!imagePath) return 'assets/images/placeholder.svg';
  
  // Si ya es una URL absoluta, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Detectar el contexto
  const pathname = window.location.pathname;
  const hostname = window.location.hostname;
  const isFromAdmin = pathname.startsWith('/pets-store/');
  const isGitHubPages = hostname.includes('github.io');
  
  // Si estamos siendo servidos desde /pets-store/ (admin), agregar el prefijo
  if (isFromAdmin) {
    // Asegurarse de que la ruta no tenga doble /pets-store/
    if (imagePath.startsWith('/pets-store/')) {
      return imagePath;
    }
    return `/pets-store/${imagePath}`;
  }
  
  // Para GitHub Pages
  if (isGitHubPages) {
    const pathParts = pathname.split('/').filter(p => p);
    if (pathParts.length > 0 && pathParts[0] !== 'index.html') {
      return `/${pathParts[0]}/${imagePath}`;
    }
  }
  
  // Para otros casos, devolver la ruta tal cual
  return imagePath;
}

// Exportar globalmente para uso en otros módulos
window.getImageUrl = getImageUrl;
