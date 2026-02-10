/**
 * 🔥 Módulo FirebaseStock - Gestión de Stock desde Firebase
 * Lee el stock desde Firestore (colección inventory) con CACHE para reducir lecturas
 * 
 * ⚠️ DESACTIVADO TEMPORALMENTE para reducir lecturas de Firebase
 * El stock ahora se maneja de forma estática via JSON publicado en GitHub Pages
 * Para reactivar, cambiar ENABLED = true
 */

class FirebaseStock {
  // ⚠️ DESACTIVADO - Cambiar a true para reactivar lecturas de Firebase
  static ENABLED = false;
  
  static app = null;
  static db = null;
  static initialized = false;
  static STORE_ID = 'petsstore-b0516';
  static stockCache = new Map(); // id -> stock
  static listeners = [];
  static unsubscribe = null;
  static lastFetch = 0;
  static CACHE_DURATION = 5 * 60 * 1000; // 5 minutos de cache
  static isRealTimeEnabled = false; // Desactivar tiempo real por defecto

  // Configuración de Firebase (misma que FirebaseOrders)
  static firebaseConfig = {
    apiKey: "AIzaSyDHWTTs1J108hiBeib4d6E5i-HLoDRoDCA",
    authDomain: "petsstore-b0516.firebaseapp.com",
    projectId: "petsstore-b0516",
    storageBucket: "petsstore-b0516.appspot.com",
    messagingSenderId: "",
    appId: ""
  };

  /**
   * Inicializar Firebase y cargar inventario UNA SOLA VEZ
   */
  static async init() {
    // ⚠️ Si está desactivado, no hacer nada
    if (!this.ENABLED) {
      this.initialized = true;
      return true;
    }
    
    if (this.initialized) return true;

    try {
      const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      // Reusar app si ya existe
      const apps = getApps();
      if (apps.length > 0) {
        this.app = apps[0];
      } else if (typeof FirebaseOrders !== 'undefined' && FirebaseOrders.app) {
        this.app = FirebaseOrders.app;
      } else {
        this.app = initializeApp(this.firebaseConfig);
      }
      this.db = getFirestore(this.app);
      
      // Cargar inventario UNA SOLA VEZ (no en tiempo real)
      await this.loadInventoryOnce();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Error initializing FirebaseStock:', error);
      return false;
    }
  }

  /**
   * Cargar inventario una sola vez (sin listener en tiempo real)
   */
  static async loadInventoryOnce() {
    // ⚠️ Si está desactivado, no hacer nada
    if (!this.ENABLED) return;
    
    // Si el cache es reciente, no recargar
    if (Date.now() - this.lastFetch < this.CACHE_DURATION && this.stockCache.size > 0) {
      return;
    }

    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      
      const inventoryRef = collection(this.db, 'tiendas', this.STORE_ID, 'inventory');
      const snapshot = await getDocs(inventoryRef);
      
      this.stockCache.clear();
      snapshot.forEach(doc => {
        const data = doc.data();
        this.stockCache.set(doc.id, data.stock || 0);
      });
      
      this.lastFetch = Date.now();
      
      this.notifyListeners();
      this.applyStockIndicators();
    } catch (error) {
      console.warn('⚠️ Could not load inventory:', error.message);
    }
  }

  /**
   * Forzar recarga del inventario (usar con moderación)
   */
  static async refresh() {
    this.lastFetch = 0; // Invalidar cache
    await this.loadInventoryOnce();
  }

  /**
   * Obtener stock de un producto o variante
   * @param {string} id - ID del producto o variante
   * @param {boolean} isVariant - Si es una variante (opcional)
   * @returns {number|null} - Stock o null si no está en Firebase
   */
  static getStock(id, isVariant = null) {
    if (!this.initialized || this.stockCache.size === 0) return null;
    
    const strId = String(id);
    
    // Si ya tiene prefijo, buscar directo
    if (strId.startsWith('p_') || strId.startsWith('v_')) {
      return this.stockCache.has(strId) ? this.stockCache.get(strId) : null;
    }
    
    // Buscar con prefijo p_ (producto)
    const productKey = `p_${strId}`;
    if (this.stockCache.has(productKey)) {
      return this.stockCache.get(productKey);
    }
    
    // Buscar con prefijo v_ (variante)
    const variantKey = `v_${strId}`;
    if (this.stockCache.has(variantKey)) {
      return this.stockCache.get(variantKey);
    }
    
    // Buscar sin prefijo (compatibilidad)
    if (this.stockCache.has(strId)) {
      return this.stockCache.get(strId);
    }
    
    return null;
  }

  /**
   * Verificar si un producto está disponible
   * @param {string} id - ID del producto o variante
   * @param {number} quantity - Cantidad requerida
   * @returns {boolean}
   */
  static isAvailable(id, quantity = 1) {
    const stock = this.getStock(id);
    // Si no está en Firebase, asumir disponible
    if (stock === null) return true;
    return stock >= quantity;
  }

  /**
   * Verificar si un producto está sin stock
   * @param {string} id - ID del producto o variante
   * @returns {boolean}
   */
  static isOutOfStock(id) {
    const stock = this.getStock(id);
    // Si no está en Firebase, asumir disponible
    if (stock === null) return false;
    return stock <= 0;
  }

  /**
   * Verificar si tiene stock bajo
   * @param {string} id - ID del producto o variante
   * @param {number} threshold - Umbral (default 5)
   * @returns {boolean}
   */
  static isLowStock(id, threshold = 5) {
    const stock = this.getStock(id);
    if (stock === null) return false;
    return stock > 0 && stock <= threshold;
  }

  /**
   * Agregar listener de cambios de stock
   */
  static addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notificar a todos los listeners
   */
  static notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(this.stockCache); } catch (e) { console.error(e); }
    });
  }

  /**
   * Detener escucha de cambios
   */
  static stopListening() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Aplicar indicadores de stock a productos en el DOM
   */
  static applyStockIndicators() {
    // Buscar todas las tarjetas de producto
    document.querySelectorAll('.card[data-product-id]').forEach(card => {
      const productId = card.dataset.productId;
      
      // Buscar stock con cualquier prefijo
      let stock = null;
      
      // Intentar con prefijo p_ (producto)
      if (this.stockCache.has(`p_${productId}`)) {
        stock = this.stockCache.get(`p_${productId}`);
      }
      // Intentar con prefijo v_ (variante)
      else if (this.stockCache.has(`v_${productId}`)) {
        stock = this.stockCache.get(`v_${productId}`);
      }
      // Intentar sin prefijo
      else if (this.stockCache.has(productId)) {
        stock = this.stockCache.get(productId);
      }
      
      // Si no encontramos stock, no hacer nada
      if (stock === null || stock === undefined) {
        this.markAsInStock(card);
        return;
      }
      
      if (stock <= 0) {
        this.markAsOutOfStock(card, stock);
      } else if (stock <= 5) {
        this.markAsLowStock(card, stock);
      } else {
        this.markAsInStock(card);
      }
    });
  }

  /**
   * Marcar un elemento como sin stock
   */
  static markAsOutOfStock(element, stock = 0) {
    element.classList.add('card--out-of-stock');
    element.classList.remove('card--low-stock');
    
    // Agregar badge si no existe
    let badge = element.querySelector('.card__stock-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'card__stock-badge';
      badge.style.cssText = 'position:absolute;top:8px;left:8px;z-index:10;';
      const imageContainer = element.querySelector('.card__image-wrapper') || element.querySelector('.card__image-container');
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(badge);
      }
    }
    badge.innerHTML = '<span style="background:#ef4444;color:white;padding:4px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;">Sin Stock</span>';
    
    // Deshabilitar botón de agregar
    const addBtn = element.querySelector('.add-to-cart-btn');
    if (addBtn) {
      addBtn.disabled = true;
      addBtn.style.opacity = '0.5';
      addBtn.style.cursor = 'not-allowed';
    }
  }

  /**
   * Marcar un elemento como stock bajo
   */
  static markAsLowStock(element, stock) {
    element.classList.remove('card--out-of-stock');
    element.classList.add('card--low-stock');
    
    let badge = element.querySelector('.card__stock-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'card__stock-badge';
      badge.style.cssText = 'position:absolute;top:8px;left:8px;z-index:10;';
      const imageContainer = element.querySelector('.card__image-wrapper') || element.querySelector('.card__image-container');
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(badge);
      }
    }
    badge.innerHTML = `<span style="background:#f59e0b;color:white;padding:4px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;">¡Últimas ${stock}!</span>`;
    
    // Habilitar botón
    const addBtn = element.querySelector('.add-to-cart-btn');
    if (addBtn) {
      addBtn.disabled = false;
      addBtn.style.opacity = '';
      addBtn.style.cursor = '';
    }
  }

  /**
   * Marcar un elemento como en stock
   */
  static markAsInStock(element) {
    element.classList.remove('card--out-of-stock', 'card--low-stock');
    
    // Remover badge
    const badge = element.querySelector('.card__stock-badge');
    if (badge) badge.remove();
    
    // Habilitar botón
    const addBtn = element.querySelector('.add-to-cart-btn');
    if (addBtn) {
      addBtn.disabled = false;
      addBtn.style.opacity = '';
      addBtn.style.cursor = '';
    }
  }

  /**
   * Generar HTML de badge de stock
   * @param {string} id - ID del producto
   * @returns {string} - HTML del badge
   */
  static getStockBadgeHTML(id) {
    const stock = this.getStock(id);
    if (stock === null) return '';
    
    if (stock === 0) {
      return '<div class="card__stock-badge"><span class="stock-badge stock-badge--out">Sin Stock</span></div>';
    } else if (stock <= 5) {
      return `<div class="card__stock-badge"><span class="stock-badge stock-badge--low">¡Últimas ${stock}!</span></div>`;
    }
    return '';
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FirebaseStock = FirebaseStock;
  
  // Auto-inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      FirebaseStock.init();
      FirebaseStock.observeDOM();
    });
  } else {
    FirebaseStock.init();
    FirebaseStock.observeDOM();
  }
}

/**
 * Observar cambios en el DOM para aplicar indicadores a nuevas tarjetas
 * OPTIMIZADO: usa debounce para evitar múltiples llamadas
 */
FirebaseStock.observeDOM = function() {
  let debounceTimer = null;
  
  const observer = new MutationObserver((mutations) => {
    let hasNewCards = false;
    
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.classList && node.classList.contains('card') && node.dataset.productId) {
            hasNewCards = true;
          } else if (node.querySelectorAll) {
            const cards = node.querySelectorAll('.card[data-product-id]');
            if (cards.length > 0) {
              hasNewCards = true;
            }
          }
        }
      });
    });
    
    // Usar debounce para evitar múltiples llamadas
    if (hasNewCards && FirebaseStock.initialized && FirebaseStock.stockCache.size > 0) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => FirebaseStock.applyStockIndicators(), 300);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};
