// Cargador de datos
class DataLoader {
  constructor() {
    this.cache = {};
    // Detectar la ruta base correcta para GitHub Pages y local
    const pathname = window.location.pathname;
    const hostname = window.location.hostname;
    
    // Si estamos en GitHub Pages (github.io), la ruta incluye el repo name
    const isGitHubPages = hostname.includes('github.io');
    
    // En GitHub Pages: /WebPetsStore/index.html -> /WebPetsStore/data/
    // En local: /index.html -> /data/
    let baseUrl;
    if (isGitHubPages) {
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
    console.log('🔍 DataLoader - hostname:', hostname);
    console.log('🔍 DataLoader - pathname:', pathname);
    console.log('🔍 DataLoader - isGitHubPages:', isGitHubPages);
    console.log('🔍 DataLoader - baseUrl:', this.baseUrl);
  }

  async load(filename) {
    if (this.cache[filename]) {
      return this.cache[filename];
    }

    try {
      const response = await fetch(`${this.baseUrl}${filename}`);
      if (!response.ok) throw new Error(`Error loading ${filename}`);
      const data = await response.json();
      this.cache[filename] = data;
      return data;
    } catch (error) {
      console.error(`Failed to load ${filename}:`, error);
      return null;
    }
  }

  async getProducts() {
    return this.load('products.json');
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
