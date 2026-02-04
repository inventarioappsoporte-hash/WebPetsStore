/**
 * 🔥 Módulo FirebaseStock - Gestión de Stock desde Firebase
 * Lee el stock en tiempo real desde Firestore (colección inventory)
 */

class FirebaseStock {
  static app = null;
  static db = null;
  static initialized = false;
  static STORE_ID = 'petsstore-b0516';
  static stockCache = new Map(); // id -> stock
  static listeners = [];
  static unsubscribe = null;

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
   * Inicializar Firebase y escuchar cambios de inventario
   */
  static async init() {
    if (this.initialized) return true;

    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getFirestore, collection, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      // Reusar app si ya existe (de FirebaseOrders)
      if (typeof FirebaseOrders !== 'undefined' && FirebaseOrders.app) {
        this.app = FirebaseOrders.app;
        this.db = FirebaseOrders.db;
      } else {
        this.app = initializeApp(this.firebaseConfig, 'stock-app');
        this.db = getFirestore(this.app);
      }
      
      // Escuchar cambios en inventario
      const inventoryRef = collection(this.db, 'tiendas', this.STORE_ID, 'inventory');
      
      this.unsubscribe = onSnapshot(inventoryRef, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          const data = change.doc.data();
          if (change.type === 'added' || change.type === 'modified') {
            this.stockCache.set(change.doc.id, data.stock || 0);
          } else if (change.type === 'removed') {
            this.stockCache.delete(change.doc.id);
          }
        });
        
        console.log(`📦 Stock updated: ${this.stockCache.size} items`);
        this.notifyListeners();
        this.applyStockIndicators();
      }, (error) => {
        console.warn('⚠️ Could not load inventory:', error.message);
      });
      
      this.initialized = true;
      console.log('📦 FirebaseStock initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing FirebaseStock:', error);
      return false;
    }
  }

  /**
   * Obtener stock de un producto o variante
   * @param {string} id - ID del producto o variante
   * @returns {number|null} - Stock o null si no está en Firebase
   */
  static getStock(id) {
    if (!this.initialized || this.stockCache.size === 0) return null;
    return this.stockCache.has(id) ? this.stockCache.get(id) : null;
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
      
      if (this.isOutOfStock(productId)) {
        this.markAsOutOfStock(card);
      } else if (this.isLowStock(productId)) {
        this.markAsLowStock(card);
      } else {
        this.markAsInStock(card);
      }
    });
  }

  /**
   * Marcar un elemento como sin stock
   */
  static markAsOutOfStock(element) {
    element.classList.add('card--out-of-stock');
    element.classList.remove('card--low-stock');
    
    // Agregar badge si no existe
    let badge = element.querySelector('.card__stock-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'card__stock-badge';
      const imageContainer = element.querySelector('.card__image-container');
      if (imageContainer) {
        imageContainer.appendChild(badge);
      }
    }
    badge.innerHTML = '<span class="stock-badge stock-badge--out">Sin Stock</span>';
    
    // Deshabilitar botón de agregar
    const addBtn = element.querySelector('.card__add-btn');
    if (addBtn) {
      addBtn.disabled = true;
      addBtn.setAttribute('data-original-text', addBtn.textContent);
      addBtn.textContent = 'Sin Stock';
    }
  }

  /**
   * Marcar un elemento como stock bajo
   */
  static markAsLowStock(element) {
    element.classList.remove('card--out-of-stock');
    element.classList.add('card--low-stock');
    
    const productId = element.dataset.productId;
    const stock = this.getStock(productId);
    
    let badge = element.querySelector('.card__stock-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'card__stock-badge';
      const imageContainer = element.querySelector('.card__image-container');
      if (imageContainer) {
        imageContainer.appendChild(badge);
      }
    }
    badge.innerHTML = `<span class="stock-badge stock-badge--low">¡Últimas ${stock}!</span>`;
    
    // Habilitar botón
    const addBtn = element.querySelector('.card__add-btn');
    if (addBtn && addBtn.disabled) {
      addBtn.disabled = false;
      const originalText = addBtn.getAttribute('data-original-text');
      if (originalText) addBtn.textContent = originalText;
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
    const addBtn = element.querySelector('.card__add-btn');
    if (addBtn && addBtn.disabled) {
      addBtn.disabled = false;
      const originalText = addBtn.getAttribute('data-original-text');
      if (originalText) addBtn.textContent = originalText;
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
    document.addEventListener('DOMContentLoaded', () => FirebaseStock.init());
  } else {
    FirebaseStock.init();
  }
}
