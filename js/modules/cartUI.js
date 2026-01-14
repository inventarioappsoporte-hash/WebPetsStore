/**
 * 🎨 Módulo CartUI - Interfaz Visual del Carrito
 * Maneja la visualización y interacción con el carrito
 */

class CartUI {
  static isOpen = false;
  static modal = null;
  static badge = null;

  /**
   * Inicializar la interfaz del carrito
   */
  static init() {
    this.createCartModal();
    this.createCartBadge();
    this.attachEventListeners();
    
    // Registrar listener para actualizaciones del carrito
    Cart.addListener((items, count, total) => {
      this.updateBadge(count);
      if (this.isOpen) {
        this.renderCartItems(items, total);
      }
    });

    // Actualizar badge inicial
    this.updateBadge(Cart.getItemCount());
    
    console.log('🎨 CartUI initialized');
  }

  /**
   * Crear modal del carrito
   */
  static createCartModal() {
    const modal = document.createElement('div');
    modal.id = 'cart-modal';
    modal.className = 'cart-modal';
    modal.innerHTML = `
      <div class="cart-modal__overlay" onclick="CartUI.close()"></div>
      <div class="cart-modal__content">
        <div class="cart-modal__header">
          <h2>🛒 Mi Carrito</h2>
          <button class="cart-modal__close" onclick="CartUI.close()">✕</button>
        </div>
        
        <div class="cart-modal__body">
          <div id="cart-items-container"></div>
        </div>
        
        <div class="cart-modal__footer">
          <div class="cart-modal__total">
            <span>Total:</span>
            <span id="cart-total">$0</span>
          </div>
          
          <button class="cart-modal__clear" onclick="CartUI.clearCart()">
            🗑️ Vaciar Carrito
          </button>
          
          <div class="cart-modal__form">
            <h3>📝 Datos para el pedido</h3>
            <input 
              type="text" 
              id="customer-name" 
              placeholder="Nombre completo *" 
              required
            />
            <input 
              type="tel" 
              id="customer-phone" 
              placeholder="Teléfono *" 
              required
            />
            <textarea 
              id="customer-notes" 
              placeholder="Observaciones (opcional)"
              rows="3"
            ></textarea>
          </div>
          
          <button class="cart-modal__checkout" onclick="CartUI.checkout()">
            📱 Enviar por WhatsApp
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modal = modal;
  }

  /**
   * Crear badge del carrito en el header
   */
  static createCartBadge() {
    // Buscar el header
    const header = document.querySelector('.header') || document.querySelector('header');
    
    if (!header) {
      console.warn('Header not found, creating floating badge');
      this.createFloatingBadge();
      return;
    }

    // Crear badge
    const badge = document.createElement('div');
    badge.className = 'cart-badge-container';
    badge.innerHTML = `
      <button class="cart-badge" onclick="CartUI.toggle()">
        🛒 <span class="cart-badge__count">0</span>
      </button>
    `;
    
    header.appendChild(badge);
    this.badge = badge.querySelector('.cart-badge__count');
  }

  /**
   * Crear badge flotante (fallback)
   */
  static createFloatingBadge() {
    const badge = document.createElement('div');
    badge.className = 'cart-badge-floating';
    badge.innerHTML = `
      <button class="cart-badge" onclick="CartUI.toggle()">
        🛒 <span class="cart-badge__count">0</span>
      </button>
    `;
    
    document.body.appendChild(badge);
    this.badge = badge.querySelector('.cart-badge__count');
  }

  /**
   * Actualizar contador del badge
   */
  static updateBadge(count) {
    if (this.badge) {
      this.badge.textContent = count;
      this.badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  /**
   * Renderizar items del carrito
   */
  static renderCartItems(items, total) {
    const container = document.getElementById('cart-items-container');
    
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <p>🛒 Tu carrito está vacío</p>
          <p>¡Agrega productos para comenzar!</p>
        </div>
      `;
      document.getElementById('cart-total').textContent = '$0';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item__image">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.jpg'">
        </div>
        
        <div class="cart-item__details">
          <h4>${item.name}</h4>
          ${item.variant ? `
            <p class="cart-item__variant">
              ${Object.entries(item.variant.attributes)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')}
            </p>
          ` : ''}
          
          <div class="cart-item__price">
            ${item.originalPrice > item.price ? `
              <span class="cart-item__original-price">$${this.formatPrice(item.originalPrice)}</span>
            ` : ''}
            <span class="cart-item__current-price">$${this.formatPrice(item.price)}</span>
          </div>
        </div>
        
        <div class="cart-item__controls">
          <div class="cart-item__quantity">
            <button onclick="CartUI.decrementQuantity('${item.id}')">−</button>
            <span>${item.quantity}</span>
            <button onclick="CartUI.incrementQuantity('${item.id}')">+</button>
          </div>
          
          <div class="cart-item__subtotal">
            $${this.formatPrice(item.subtotal)}
          </div>
          
          <button class="cart-item__remove" onclick="CartUI.removeItem('${item.id}')">
            🗑️
          </button>
        </div>
      </div>
    `).join('');

    document.getElementById('cart-total').textContent = `$${this.formatPrice(total)}`;
  }

  /**
   * Formatear precio
   */
  static formatPrice(price) {
    return price.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Abrir modal del carrito
   */
  static open() {
    if (this.modal) {
      this.modal.classList.add('cart-modal--open');
      this.isOpen = true;
      
      // Renderizar items actuales
      const items = Cart.getItems();
      const total = Cart.getTotal();
      this.renderCartItems(items, total);
      
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Cerrar modal del carrito
   */
  static close() {
    if (this.modal) {
      this.modal.classList.remove('cart-modal--open');
      this.isOpen = false;
      
      // Restaurar scroll del body
      document.body.style.overflow = '';
    }
  }

  /**
   * Toggle modal del carrito
   */
  static toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Incrementar cantidad de un item
   */
  static incrementQuantity(itemId) {
    const item = Cart.items.find(i => i.id === itemId);
    if (item) {
      Cart.updateQuantity(itemId, item.quantity + 1);
    }
  }

  /**
   * Decrementar cantidad de un item
   */
  static decrementQuantity(itemId) {
    const item = Cart.items.find(i => i.id === itemId);
    if (item) {
      Cart.updateQuantity(itemId, item.quantity - 1);
    }
  }

  /**
   * Eliminar item del carrito
   */
  static removeItem(itemId) {
    if (confirm('¿Eliminar este producto del carrito?')) {
      Cart.removeItem(itemId);
    }
  }

  /**
   * Vaciar carrito completo
   */
  static clearCart() {
    if (confirm('¿Vaciar todo el carrito?')) {
      Cart.clearCart();
    }
  }

  /**
   * Procesar checkout
   */
  static checkout() {
    // Validar que el carrito no esté vacío
    if (Cart.isEmpty()) {
      alert('El carrito está vacío');
      return;
    }

    // Obtener datos del formulario
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const notes = document.getElementById('customer-notes').value.trim();

    // Validar datos
    if (!name || name.length < 3) {
      alert('Por favor ingresa tu nombre completo');
      document.getElementById('customer-name').focus();
      return;
    }

    if (!phone || phone.length < 8) {
      alert('Por favor ingresa un teléfono válido');
      document.getElementById('customer-phone').focus();
      return;
    }

    // Preparar datos del cliente
    const customerData = {
      name: name,
      phone: phone,
      notes: notes
    };

    // Enviar por WhatsApp
    const success = WhatsAppSender.sendOrder(Cart.getItems(), customerData);

    if (success) {
      // Limpiar formulario
      document.getElementById('customer-name').value = '';
      document.getElementById('customer-phone').value = '';
      document.getElementById('customer-notes').value = '';

      // Limpiar carrito
      Cart.clearCart();

      // Cerrar modal
      this.close();

      // Mostrar confirmación
      alert('¡Pedido enviado! Te contactaremos pronto por WhatsApp 🐾');
    }
  }

  /**
   * Adjuntar event listeners
   */
  static attachEventListeners() {
    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Mostrar notificación de producto agregado
   */
  static showAddedNotification(productName) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <span>✅ ${productName} agregado al carrito</span>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
      notification.classList.add('cart-notification--show');
    }, 10);
    
    // Ocultar y eliminar después de 3 segundos
    setTimeout(() => {
      notification.classList.remove('cart-notification--show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Inicializar CartUI cuando el DOM esté listo
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CartUI.init());
  } else {
    CartUI.init();
  }
}
