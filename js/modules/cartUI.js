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

    // Registrar listener para cambios de zona de envío
    if (typeof ShippingSelector !== 'undefined') {
      ShippingSelector.addListener((zone) => {
        if (this.isOpen) {
          this.updateTotals(Cart.getTotal());
          this.toggleShippingFields(zone);
        }
      });
    }

    // Mostrar/ocultar campos de dirección según zona inicial
    setTimeout(() => {
      if (typeof ShippingSelector !== 'undefined' && ShippingSelector.isEnabled()) {
        this.toggleShippingFields(ShippingSelector.getSelectedZone());
      }
    }, 100);

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
          <div class="cart-modal__totals">
            <div class="cart-modal__subtotal">
              <span>Subtotal:</span>
              <span id="cart-subtotal">$0</span>
            </div>
            <div id="cart-shipping-selector-container"></div>
            <div class="cart-modal__shipping" id="cart-shipping-row">
              <span>Envío:</span>
              <span id="cart-shipping-cost">$0</span>
            </div>
            <div class="cart-modal__total-final">
              <span>Total:</span>
              <span id="cart-total">$0</span>
            </div>
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
              placeholder="Teléfono / WhatsApp *" 
              required
            />
            
            <!-- Datos de envío (se muestran según la zona seleccionada) -->
            <div id="shipping-address-fields" class="shipping-address-fields" style="display: none;">
              <h4>📍 Dirección de envío</h4>
              <input 
                type="text" 
                id="customer-address" 
                placeholder="Calle y número *"
              />
              <div class="address-row">
                <input 
                  type="text" 
                  id="customer-floor" 
                  placeholder="Piso/Depto (opcional)"
                  class="address-field-small"
                />
                <input 
                  type="text" 
                  id="customer-zipcode" 
                  placeholder="Código Postal *"
                  class="address-field-small"
                />
              </div>
              <input 
                type="text" 
                id="customer-city" 
                placeholder="Localidad / Barrio *"
              />
              <input 
                type="text" 
                id="customer-between" 
                placeholder="Entre calles (opcional)"
              />
              <input 
                type="text" 
                id="customer-province" 
                placeholder="Provincia *"
              />
            </div>
            
            <textarea 
              id="customer-notes" 
              placeholder="Observaciones (opcional)"
              rows="2"
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
    this.badge = document.getElementById('cart-badge-count');
    
    if (!this.badge) {
      console.warn('Cart badge not found in header, creating floating badge');
      this.createFloatingBadge();
    }
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
      if (count > 0) {
        this.badge.style.display = 'inline-flex';
      } else {
        this.badge.style.display = 'none';
      }
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
      const subtotalEl = document.getElementById('cart-subtotal');
      const shippingEl = document.getElementById('cart-shipping-cost');
      const totalEl = document.getElementById('cart-total');
      const selectorContainer = document.getElementById('cart-shipping-selector-container');
      
      if (subtotalEl) subtotalEl.textContent = '$0';
      if (shippingEl) shippingEl.textContent = '$0';
      if (totalEl) totalEl.textContent = '$0';
      if (selectorContainer) selectorContainer.innerHTML = '';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item__image">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.svg'">
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
              <span class="cart-item__original-price">${this.formatPrice(item.originalPrice)}</span>
            ` : ''}
            <span class="cart-item__current-price">${this.formatPrice(item.price)}</span>
          </div>
        </div>
        
        <div class="cart-item__controls">
          <div class="cart-item__quantity">
            <button onclick="CartUI.decrementQuantity('${item.id}')">−</button>
            <span>${item.quantity}</span>
            <button onclick="CartUI.incrementQuantity('${item.id}')">+</button>
          </div>
          
          <div class="cart-item__subtotal">
            ${this.formatPrice(item.subtotal)}
          </div>
          
          <button class="cart-item__remove" onclick="CartUI.removeItem('${item.id}')">
            🗑️
          </button>
        </div>
      </div>
    `).join('');

    this.updateTotals(total);
  }

  /**
   * Actualizar totales incluyendo envío
   */
  static updateTotals(subtotal) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const shippingContainer = document.getElementById('cart-shipping-selector-container');
    const shippingRow = document.getElementById('cart-shipping-row');
    const shippingCostEl = document.getElementById('cart-shipping-cost');
    const totalEl = document.getElementById('cart-total');
    
    if (subtotalEl) subtotalEl.textContent = `${this.formatPrice(subtotal)}`;
    
    if (typeof ShippingSelector !== 'undefined' && ShippingSelector.isEnabled()) {
      if (shippingContainer) {
        shippingContainer.innerHTML = ShippingSelector.renderCartSelector(subtotal);
      }
      
      const shipping = ShippingSelector.calculateShipping(subtotal);
      
      if (shippingCostEl) {
        if (shipping.isCargo) {
          shippingCostEl.innerHTML = `<span class="shipping-cargo">Pago en destino</span>`;
        } else if (shipping.isFree) {
          shippingCostEl.innerHTML = `<span class="shipping-free">GRATIS</span>`;
        } else {
          shippingCostEl.textContent = this.formatPrice(shipping.cost);
        }
      }
      
      const totalFinal = subtotal + shipping.cost;
      if (totalEl) totalEl.textContent = `${this.formatPrice(totalFinal)}`;
      
      if (shippingRow) shippingRow.style.display = 'flex';
      
      // Mostrar/ocultar campos de dirección según zona
      this.toggleShippingFields(shipping.zone);
    } else {
      if (shippingContainer) shippingContainer.innerHTML = '';
      if (shippingRow) shippingRow.style.display = 'none';
      if (totalEl) totalEl.textContent = `${this.formatPrice(subtotal)}`;
      this.toggleShippingFields(null);
    }
  }

  /**
   * Mostrar/ocultar campos de dirección según zona de envío
   */
  static toggleShippingFields(zone) {
    const fieldsContainer = document.getElementById('shipping-address-fields');
    if (!fieldsContainer) return;

    // Mostrar campos solo si es envío a domicilio (fixed o cargo)
    // Ocultar si es retiro en tienda (free) o no hay zona
    const requiresAddress = zone && (zone.type === 'fixed' || zone.type === 'cargo');
    
    if (requiresAddress) {
      fieldsContainer.style.display = 'block';
      fieldsContainer.classList.add('shipping-fields-visible');
    } else {
      fieldsContainer.style.display = 'none';
      fieldsContainer.classList.remove('shipping-fields-visible');
    }
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
      
      const items = Cart.getItems();
      const total = Cart.getTotal();
      this.renderCartItems(items, total);
      
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
    if (Cart.isEmpty()) {
      alert('El carrito está vacío');
      return;
    }

    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const notes = document.getElementById('customer-notes').value.trim();

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

    // Obtener datos de envío si es necesario
    const customerData = {
      name: name,
      phone: phone,
      notes: notes
    };

    // Verificar si se requiere dirección de envío
    if (typeof ShippingSelector !== 'undefined' && ShippingSelector.isEnabled()) {
      const zone = ShippingSelector.getSelectedZone();
      const requiresAddress = zone && (zone.type === 'fixed' || zone.type === 'cargo');
      
      if (requiresAddress) {
        const address = document.getElementById('customer-address').value.trim();
        const floor = document.getElementById('customer-floor').value.trim();
        const zipcode = document.getElementById('customer-zipcode').value.trim();
        const city = document.getElementById('customer-city').value.trim();
        const between = document.getElementById('customer-between').value.trim();
        const province = document.getElementById('customer-province').value.trim();

        // Validar campos requeridos
        if (!address) {
          alert('Por favor ingresa la dirección de envío');
          document.getElementById('customer-address').focus();
          return;
        }

        if (!city) {
          alert('Por favor ingresa la localidad o barrio');
          document.getElementById('customer-city').focus();
          return;
        }

        if (!province) {
          alert('Por favor ingresa la provincia');
          document.getElementById('customer-province').focus();
          return;
        }

        // Agregar datos de envío
        customerData.shipping = {
          address: address,
          floor: floor,
          zipcode: zipcode,
          city: city,
          between: between,
          province: province
        };
      }
    }

    const success = WhatsAppSender.sendOrder(Cart.getItems(), customerData);

    if (success) {
      // Limpiar formulario
      document.getElementById('customer-name').value = '';
      document.getElementById('customer-phone').value = '';
      document.getElementById('customer-notes').value = '';
      
      // Limpiar campos de envío si existen
      const addressField = document.getElementById('customer-address');
      if (addressField) addressField.value = '';
      const floorField = document.getElementById('customer-floor');
      if (floorField) floorField.value = '';
      const zipcodeField = document.getElementById('customer-zipcode');
      if (zipcodeField) zipcodeField.value = '';
      const cityField = document.getElementById('customer-city');
      if (cityField) cityField.value = '';
      const betweenField = document.getElementById('customer-between');
      if (betweenField) betweenField.value = '';
      const provinceField = document.getElementById('customer-province');
      if (provinceField) provinceField.value = '';
      
      Cart.clearCart();
      this.close();
      alert('¡Pedido enviado! Te contactaremos pronto por WhatsApp 🐾');
    }
  }

  /**
   * Adjuntar event listeners
   */
  static attachEventListeners() {
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
    
    setTimeout(() => {
      notification.classList.add('cart-notification--show');
    }, 10);
    
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
