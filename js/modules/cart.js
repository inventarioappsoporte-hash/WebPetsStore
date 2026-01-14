/**
 * 🛒 Módulo Cart - Gestión del Carrito de Compras
 * Maneja la lógica del carrito: agregar, eliminar, actualizar cantidades
 */

class Cart {
  static STORAGE_KEY = 'pets-store-cart';
  static items = [];
  static listeners = [];

  /**
   * Inicializar el carrito desde localStorage
   */
  static init() {
    this.loadFromStorage();
    console.log('🛒 Cart initialized with', this.items.length, 'items');
  }

  /**
   * Agregar producto al carrito
   * @param {Object} product - Producto a agregar
   * @param {number} quantity - Cantidad
   * @param {Object} variant - Variante seleccionada (opcional)
   */
  static addItem(product, quantity = 1, variant = null) {
    try {
      // Validar producto
      if (!product || !product.id) {
        throw new Error('Producto inválido');
      }

      // Validar cantidad
      if (quantity < 1) {
        throw new Error('Cantidad debe ser mayor a 0');
      }

      // Buscar si ya existe el mismo producto+variante
      const existingItem = this.findItem(product.id, variant);

      if (existingItem) {
        // Incrementar cantidad del item existente
        existingItem.quantity += quantity;
        existingItem.subtotal = existingItem.price * existingItem.quantity;
      } else {
        // Crear nuevo item
        const newItem = this.createCartItem(product, quantity, variant);
        this.items.push(newItem);
      }

      this.saveToStorage();
      this.notifyListeners();

      console.log('✅ Item added to cart:', product.name);
      return true;
    } catch (error) {
      console.error('❌ Error adding item to cart:', error);
      return false;
    }
  }

  /**
   * Crear objeto de item del carrito
   */
  static createCartItem(product, quantity, variant) {
    // Si tiene variante, usar precio de la variante
    let price, originalPrice, image;
    
    if (variant) {
      // Producto con variante seleccionada
      price = variant.price || product.basePrice || product.price;
      originalPrice = variant.originalPrice || product.baseOriginalPrice || price;
      
      // Imagen de la variante o del producto
      if (variant.images && variant.images.thumb) {
        image = variant.images.thumb;
      } else if (variant.images && variant.images.cover) {
        image = variant.images.cover;
      } else if (product.images) {
        image = product.images.thumb || product.images.cover || '';
      }
    } else {
      // Producto sin variantes
      price = product.discountPrice || product.price || product.basePrice;
      originalPrice = product.originalPrice || product.baseOriginalPrice || price;
      
      // Obtener imagen correcta del producto
      if (product.images) {
        if (typeof product.images === 'object') {
          image = product.images.thumb || product.images.cover || product.images.main || '';
        } else if (Array.isArray(product.images)) {
          image = product.images[0] || '';
        }
      } else if (product.image) {
        image = product.image;
      }
    }

    // Construir nombre con variante si aplica
    let itemName = product.name;
    if (variant && variant.attributes) {
      const variantDesc = Object.values(variant.attributes).join(' / ');
      itemName = `${product.name} - ${variantDesc}`;
    }

    return {
      id: this.generateItemId(product.id, variant),
      productId: product.id,
      name: itemName,
      price: price,
      originalPrice: originalPrice,
      quantity: quantity,
      variant: variant ? {
        id: variant.id,
        attributes: variant.attributes,
        sku: variant.sku
      } : null,
      image: image || '',
      subtotal: price * quantity,
      addedAt: new Date().toISOString()
    };
  }

  /**
   * Generar ID único para item del carrito
   */
  static generateItemId(productId, variant) {
    if (variant) {
      return `cart_${productId}_${variant.id}`;
    }
    return `cart_${productId}`;
  }

  /**
   * Buscar item en el carrito
   */
  static findItem(productId, variant) {
    const itemId = this.generateItemId(productId, variant);
    return this.items.find(item => item.id === itemId);
  }

  /**
   * Actualizar cantidad de un item
   */
  static updateQuantity(itemId, quantity) {
    const item = this.items.find(i => i.id === itemId);
    
    if (!item) {
      console.error('Item not found:', itemId);
      return false;
    }

    if (quantity < 1) {
      // Si la cantidad es 0, eliminar el item
      return this.removeItem(itemId);
    }

    item.quantity = quantity;
    item.subtotal = item.price * quantity;

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  /**
   * Eliminar item del carrito
   */
  static removeItem(itemId) {
    const index = this.items.findIndex(i => i.id === itemId);
    
    if (index === -1) {
      console.error('Item not found:', itemId);
      return false;
    }

    this.items.splice(index, 1);
    this.saveToStorage();
    this.notifyListeners();
    
    console.log('🗑️ Item removed from cart');
    return true;
  }

  /**
   * Vaciar el carrito completamente
   */
  static clearCart() {
    this.items = [];
    this.saveToStorage();
    this.notifyListeners();
    console.log('🗑️ Cart cleared');
  }

  /**
   * Obtener todos los items del carrito
   */
  static getItems() {
    return [...this.items];
  }

  /**
   * Obtener cantidad total de items
   */
  static getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Calcular total del carrito
   */
  static getTotal() {
    return this.items.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Verificar si el carrito está vacío
   */
  static isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Guardar carrito en localStorage
   */
  static saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  /**
   * Cargar carrito desde localStorage
   */
  static loadFromStorage() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.items = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.items = [];
    }
  }

  /**
   * Registrar listener para cambios en el carrito
   */
  static addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notificar a todos los listeners
   */
  static notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getItems(), this.getItemCount(), this.getTotal());
      } catch (error) {
        console.error('Error in cart listener:', error);
      }
    });
  }
}

// Inicializar carrito al cargar el módulo
if (typeof window !== 'undefined') {
  Cart.init();
}
