/**
 * 🎨 Módulo CartUI - Interfaz Visual del Carrito
 * Maneja la visualización y interacción con el carrito
 */

class CartUI {
  static isOpen = false;
  static modal = null;
  static badge = null;
  static stickyBar = null;

  /**
   * Inicializar la interfaz del carrito
   */
  static init() {
    this.createCartModal();
    this.createCartBadge();
    this.createStickyBar();
    this.attachEventListeners();
    
    // Registrar listener para actualizaciones del carrito
    Cart.addListener((items, count, total, wholesaleStatus) => {
      this.updateBadge(count);
      this.updateStickyBar(count, total, wholesaleStatus);
      if (this.isOpen) {
        this.renderCartItems(items, total, wholesaleStatus);
      }
    });

    // Registrar listener para cambios de zona de envío
    if (typeof ShippingSelector !== 'undefined') {
      ShippingSelector.addListener((zone) => {
        if (this.isOpen) {
          // Solo actualizar costos de envío y total, NO re-renderizar el selector
          this.updateShippingCost(Cart.getTotal());
          this.toggleShippingFields(zone);
        }
      });
    }

    // Registrar listener para cambios de usuario (login/logout)
    if (typeof UserAuth !== 'undefined') {
      UserAuth.addListener((user) => {
        if (this.isOpen) {
          this.autoFillUserData();
        }
      });
    }

    // Registrar listener para cambios de cupón (aplicar/remover)
    if (typeof CouponValidator !== 'undefined') {
      CouponValidator.addListener((coupon, discount, freeShipping) => {
        if (this.isOpen) {
          this.updateCouponDisplay(coupon, discount, freeShipping);
          // Solo actualizar totales si hay un cambio real de cupón
          // El recálculo ya se hace en updateTotals, no necesitamos llamarlo de nuevo
        }
      });
    }

    // Registrar listener para cambios de forma de pago
    if (typeof PaymentSelector !== 'undefined') {
      PaymentSelector.addListener((method) => {
        if (this.isOpen) {
          // Solo actualizar la comisión y total, NO re-renderizar todo
          this.updatePaymentCommission(Cart.getTotal());
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
    this.updateStickyBar(Cart.getItemCount(), Cart.getTotal(), Cart.getWholesaleStatus());
    
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
          <div id="wholesale-progress-container"></div>
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
            <div id="cart-payment-selector-container"></div>
            <div id="cart-payment-commission-row" class="cart-modal__payment-commission" style="display: none;">
              <span>💳 Recargo:</span>
              <span id="cart-payment-commission">+$0</span>
            </div>
            <div id="cart-coupon-row" class="cart-modal__coupon-discount" style="display: none;">
              <span>🎟️ Cupón:</span>
              <span id="cart-coupon-discount">-$0</span>
            </div>
            <div class="cart-modal__total-final">
              <span>Total:</span>
              <span id="cart-total">$0</span>
            </div>
          </div>
          
          <!-- Sección de Cupón -->
          <div class="cart-coupon-section">
            <div class="cart-coupon-input-wrapper">
              <input 
                type="text" 
                id="coupon-code" 
                placeholder="Código de cupón"
                maxlength="20"
              />
              <button type="button" id="apply-coupon-btn" onclick="CartUI.applyCoupon()">
                Aplicar
              </button>
            </div>
            <div id="coupon-message" class="cart-coupon-message"></div>
            <div id="coupon-applied" class="cart-coupon-applied" style="display: none;">
              <span class="coupon-tag">
                <span id="coupon-applied-code"></span>
                <span id="coupon-applied-desc"></span>
              </span>
              <button type="button" class="coupon-remove" onclick="CartUI.removeCoupon()">✕</button>
            </div>
          </div>
          
          <button class="cart-modal__clear" onclick="CartUI.clearCart()">
            🗑️ Vaciar Carrito
          </button>
          
          <div class="cart-modal__form">
            <h3>📝 Datos para el pedido</h3>
            
            <!-- Sección de usuario logueado -->
            <div id="cart-user-section" class="cart-user-section" style="display: none;">
              <div class="cart-user-info">
                <span class="cart-user-avatar" id="cart-user-avatar">👤</span>
                <span class="cart-user-name" id="cart-user-name">Usuario</span>
                <button type="button" class="cart-user-change" onclick="CartUI.clearUserData()">Cambiar</button>
              </div>
            </div>
            
            <!-- Botón para iniciar sesión (solo si no está logueado) -->
            <div id="cart-login-prompt" class="cart-login-prompt" style="display: none;">
              <p>¿Ya tenés cuenta? <a href="#" onclick="UserAuth.showAuthModal(); return false;">Iniciá sesión</a> para autocompletar tus datos</p>
            </div>
            
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
            
            <!-- Selector de direcciones guardadas -->
            <div id="saved-addresses-selector" class="saved-addresses-selector" style="display: none;">
              <label>📍 Usar dirección guardada:</label>
              <select id="saved-address-select" onchange="CartUI.fillSavedAddress()">
                <option value="">-- Seleccionar dirección --</option>
              </select>
            </div>
            
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
              
              <!-- Opción para guardar dirección -->
              <div id="save-address-option" class="save-address-option" style="display: none;">
                <label>
                  <input type="checkbox" id="save-new-address">
                  Guardar esta dirección para futuras compras
                </label>
              </div>
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
   * Crear barra sticky del carrito (solo móvil)
   */
  static createStickyBar() {
    const stickyBar = document.createElement('div');
    stickyBar.id = 'cart-sticky-bar';
    stickyBar.className = 'cart-sticky-bar';
    stickyBar.innerHTML = `
      <div class="cart-sticky-bar__info">
        <div class="cart-sticky-bar__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span class="cart-sticky-bar__badge" id="sticky-bar-badge">0</span>
        </div>
        <div class="cart-sticky-bar__text">
          <span class="cart-sticky-bar__count" id="sticky-bar-count">0 productos</span>
          <span class="cart-sticky-bar__total" id="sticky-bar-total">$0</span>
        </div>
      </div>
      <button class="cart-sticky-bar__button" onclick="CartUI.open()">
        Ver carrito
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    `;
    
    document.body.appendChild(stickyBar);
    this.stickyBar = stickyBar;
  }

  /**
   * Actualizar barra sticky del carrito
   */
  static updateStickyBar(count, total) {
    if (!this.stickyBar) return;
    
    const badgeEl = document.getElementById('sticky-bar-badge');
    const countEl = document.getElementById('sticky-bar-count');
    const totalEl = document.getElementById('sticky-bar-total');
    
    if (badgeEl) badgeEl.textContent = count;
    if (countEl) countEl.textContent = count === 1 ? '1 producto' : `${count} productos`;
    if (totalEl) totalEl.textContent = `$${this.formatPrice(total)}`;
    
    // Mostrar/ocultar barra según si hay items
    if (count > 0) {
      this.stickyBar.classList.add('cart-sticky-bar--visible');
      document.body.classList.add('has-cart-items');
      
      // Animación de pulso al agregar producto
      this.stickyBar.classList.remove('cart-sticky-bar--pulse');
      void this.stickyBar.offsetWidth; // Trigger reflow
      this.stickyBar.classList.add('cart-sticky-bar--pulse');
    } else {
      this.stickyBar.classList.remove('cart-sticky-bar--visible');
      document.body.classList.remove('has-cart-items');
    }
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
  static renderCartItems(items, total, wholesaleStatus = null) {
    const container = document.getElementById('cart-items-container');
    const wholesaleContainer = document.getElementById('wholesale-progress-container');
    
    if (!container) return;

    // Renderizar progreso mayorista
    if (wholesaleContainer) {
      wholesaleContainer.innerHTML = this.renderWholesaleProgress(wholesaleStatus);
    }

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

    container.innerHTML = items.map(item => {
      // Obtener precio efectivo según condiciones mayoristas
      const effectivePrice = Cart.getItemEffectivePrice(item);
      const effectiveSubtotal = Cart.getItemEffectiveSubtotal(item);
      const isWholesaleItem = item.priceDisplayMode === 'wholesale';
      
      // Verificar si ESTE producto específico califica para mayorista
      // (cumple monto mínimo del carrito Y tiene cantidad mínima del mismo producto)
      const productQualifies = Cart.productQualifiesForWholesale(item.productId);
      
      // Determinar qué precios mostrar
      // Verificar si tiene descuento real
      const hasDiscount = item.originalPrice && item.originalPrice > item.price;
      
      let priceHtml = '';
      if (isWholesaleItem && hasDiscount) {
        if (productQualifies) {
          // Este producto califica para mayorista: mostrar precio lista tachado y precio mayorista
          priceHtml = `
            <span class="cart-item__original-price">${this.formatPrice(item.originalPrice)}</span>
            <span class="cart-item__current-price cart-item__wholesale-price">${this.formatPrice(item.price)}</span>
            <span class="cart-item__wholesale-badge">💰 Mayorista</span>
          `;
        } else {
          // Este producto NO califica: mostrar precio lista y precio mayorista como referencia
          priceHtml = `
            <span class="cart-item__current-price">${this.formatPrice(item.originalPrice)}</span>
            <span class="cart-item__wholesale-hint">(Mayorista: ${this.formatPrice(item.price)})</span>
          `;
        }
      } else if (isWholesaleItem && !hasDiscount) {
        // Producto mayorista SIN descuento: solo mostrar precio actual
        priceHtml = `<span class="cart-item__current-price">${this.formatPrice(effectivePrice)}</span>`;
      } else if (hasDiscount) {
        // Producto con descuento normal
        priceHtml = `
          <span class="cart-item__original-price">${this.formatPrice(item.originalPrice)}</span>
          <span class="cart-item__current-price">${this.formatPrice(item.price)}</span>
        `;
      } else {
        // Precio normal sin descuento
        priceHtml = `<span class="cart-item__current-price">${this.formatPrice(effectivePrice)}</span>`;
      }
      
      return `
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
              ${priceHtml}
            </div>
          </div>
          
          <div class="cart-item__controls">
            <div class="cart-item__quantity">
              <button onclick="CartUI.decrementQuantity('${item.id}')">−</button>
              <span>${item.quantity}</span>
              <button onclick="CartUI.incrementQuantity('${item.id}')">+</button>
            </div>
            
            <div class="cart-item__subtotal">
              ${this.formatPrice(effectiveSubtotal)}
            </div>
            
            <button class="cart-item__remove" onclick="CartUI.removeItem('${item.id}')">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.updateTotals(total);
  }

  /**
   * Actualizar totales incluyendo envío y cupón
   */
  static updateTotals(subtotal) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const shippingContainer = document.getElementById('cart-shipping-selector-container');
    const shippingRow = document.getElementById('cart-shipping-row');
    const shippingCostEl = document.getElementById('cart-shipping-cost');
    const totalEl = document.getElementById('cart-total');
    const couponRow = document.getElementById('cart-coupon-row');
    const couponDiscountEl = document.getElementById('cart-coupon-discount');
    
    if (subtotalEl) subtotalEl.textContent = `${this.formatPrice(subtotal)}`;
    
    // Obtener descuento de cupón
    let couponDiscount = 0;
    let couponFreeShipping = false;
    if (typeof CouponValidator !== 'undefined') {
      CouponValidator.recalculate(subtotal);
      couponDiscount = CouponValidator.getDiscount();
      couponFreeShipping = CouponValidator.hasFreeShipping();
      
      // Actualizar fila de cupón
      if (couponRow) {
        const coupon = CouponValidator.getAppliedCoupon();
        if (coupon && (couponDiscount > 0 || couponFreeShipping)) {
          couponRow.style.display = 'flex';
          if (couponDiscountEl) {
            if (couponFreeShipping && couponDiscount === 0) {
              couponDiscountEl.innerHTML = '<span class="shipping-free">Envío GRATIS</span>';
            } else {
              couponDiscountEl.textContent = `-$${this.formatPrice(couponDiscount)}`;
            }
          }
        } else {
          couponRow.style.display = 'none';
        }
      }
    }
    
    // Subtotal después de cupón
    const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
    
    // Calcular comisión de forma de pago (NO re-renderizar el selector aquí)
    let paymentFee = 0;
    const paymentCommissionRow = document.getElementById('cart-payment-commission-row');
    const paymentCommissionEl = document.getElementById('cart-payment-commission');
    
    if (typeof PaymentSelector !== 'undefined' && PaymentSelector.getMethods().length > 0) {
      paymentFee = PaymentSelector.calculateCommission(subtotalAfterCoupon);
      
      // Mostrar fila de comisión
      if (paymentCommissionRow) {
        if (paymentFee > 0) {
          paymentCommissionRow.style.display = 'flex';
          if (paymentCommissionEl) {
            paymentCommissionEl.textContent = `+${this.formatPrice(paymentFee)}`;
          }
        } else {
          paymentCommissionRow.style.display = 'none';
        }
      }
    } else {
      if (paymentCommissionRow) paymentCommissionRow.style.display = 'none';
    }
    
    if (typeof ShippingSelector !== 'undefined' && ShippingSelector.isEnabled()) {
      // Solo renderizar el selector si está vacío (evitar re-renders costosos)
      if (shippingContainer && shippingContainer.innerHTML === '') {
        shippingContainer.innerHTML = ShippingSelector.renderCartSelector(subtotalAfterCoupon);
      }
      
      const shipping = ShippingSelector.calculateShipping(subtotalAfterCoupon);
      
      // Aplicar envío gratis del cupón
      let shippingCost = shipping.cost;
      if (couponFreeShipping && !shipping.isCargo) {
        shippingCost = 0;
      }
      
      if (shippingCostEl) {
        if (shipping.isCargo) {
          shippingCostEl.innerHTML = `<span class="shipping-cargo">Pago en destino</span>`;
        } else if (shipping.isFree || couponFreeShipping) {
          shippingCostEl.innerHTML = `<span class="shipping-free">GRATIS</span>`;
        } else {
          shippingCostEl.textContent = this.formatPrice(shippingCost);
        }
      }
      
      const totalFinal = subtotalAfterCoupon + shippingCost + paymentFee;
      if (totalEl) totalEl.textContent = `${this.formatPrice(totalFinal)}`;
      
      if (shippingRow) shippingRow.style.display = 'flex';
      
      // Mostrar/ocultar campos de dirección según zona
      this.toggleShippingFields(shipping.zone);
    } else {
      if (shippingContainer) shippingContainer.innerHTML = '';
      if (shippingRow) shippingRow.style.display = 'none';
      if (totalEl) totalEl.textContent = `${this.formatPrice(subtotalAfterCoupon + paymentFee)}`;
      this.toggleShippingFields(null);
    }
  }

  /**
   * Actualizar solo la comisión de pago y total (sin re-renderizar selectores)
   */
  static updatePaymentCommission(subtotal) {
    const totalEl = document.getElementById('cart-total');
    const paymentCommissionRow = document.getElementById('cart-payment-commission-row');
    const paymentCommissionEl = document.getElementById('cart-payment-commission');
    
    // Obtener descuento de cupón
    let couponDiscount = 0;
    let couponFreeShipping = false;
    if (typeof CouponValidator !== 'undefined') {
      couponDiscount = CouponValidator.getDiscount();
      couponFreeShipping = CouponValidator.hasFreeShipping();
    }
    
    const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
    
    // Calcular comisión de pago
    let paymentFee = 0;
    if (typeof PaymentSelector !== 'undefined') {
      paymentFee = PaymentSelector.calculateCommission(subtotalAfterCoupon);
    }
    
    // Actualizar fila de comisión
    if (paymentCommissionRow) {
      if (paymentFee > 0) {
        paymentCommissionRow.style.display = 'flex';
        if (paymentCommissionEl) {
          paymentCommissionEl.textContent = `+${this.formatPrice(paymentFee)}`;
        }
      } else {
        paymentCommissionRow.style.display = 'none';
      }
    }
    
    // Calcular envío actual (sin re-renderizar)
    let shippingCost = 0;
    if (typeof ShippingSelector !== 'undefined' && ShippingSelector.isEnabled()) {
      const shipping = ShippingSelector.calculateShipping(subtotalAfterCoupon);
      shippingCost = (shipping.isFree || couponFreeShipping) ? 0 : (shipping.cost || 0);
    }
    
    // Actualizar total
    const totalFinal = subtotalAfterCoupon + shippingCost + paymentFee;
    if (totalEl) totalEl.textContent = `${this.formatPrice(totalFinal)}`;
  }

  /**
   * Actualizar solo el costo de envío y total (sin re-renderizar selectores)
   */
  static updateShippingCost(subtotal) {
    const shippingCostEl = document.getElementById('cart-shipping-cost');
    const totalEl = document.getElementById('cart-total');
    
    // Obtener descuento de cupón
    let couponDiscount = 0;
    let couponFreeShipping = false;
    if (typeof CouponValidator !== 'undefined') {
      couponDiscount = CouponValidator.getDiscount();
      couponFreeShipping = CouponValidator.hasFreeShipping();
    }
    
    const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
    
    // Calcular comisión de pago
    let paymentFee = 0;
    if (typeof PaymentSelector !== 'undefined') {
      paymentFee = PaymentSelector.calculateCommission(subtotalAfterCoupon);
    }
    
    // Calcular envío
    let shippingCost = 0;
    if (typeof ShippingSelector !== 'undefined' && ShippingSelector.isEnabled()) {
      const shipping = ShippingSelector.calculateShipping(subtotalAfterCoupon);
      
      // Aplicar envío gratis del cupón
      shippingCost = shipping.cost;
      if (couponFreeShipping && !shipping.isCargo) {
        shippingCost = 0;
      }
      
      if (shippingCostEl) {
        if (shipping.isCargo) {
          shippingCostEl.innerHTML = `<span class="shipping-cargo">Pago en destino</span>`;
        } else if (shipping.isFree || couponFreeShipping) {
          shippingCostEl.innerHTML = `<span class="shipping-free">GRATIS</span>`;
        } else {
          shippingCostEl.textContent = this.formatPrice(shippingCost);
        }
      }
    }
    
    // Actualizar total
    const totalFinal = subtotalAfterCoupon + shippingCost + paymentFee;
    if (totalEl) totalEl.textContent = `${this.formatPrice(totalFinal)}`;
  }

  /**
   * Mostrar/ocultar campos de dirección según zona de envío
   */
  static toggleShippingFields(zone) {
    const fieldsContainer = document.getElementById('shipping-address-fields');
    const addressSelector = document.getElementById('saved-addresses-selector');

    // Mostrar campos solo si es envío a domicilio (fixed o cargo)
    // Ocultar si es retiro en tienda (free) o no hay zona
    const requiresAddress = zone && (zone.type === 'fixed' || zone.type === 'cargo');
    
    if (fieldsContainer) {
      if (requiresAddress) {
        fieldsContainer.style.display = 'block';
        fieldsContainer.classList.add('shipping-fields-visible');
      } else {
        fieldsContainer.style.display = 'none';
        fieldsContainer.classList.remove('shipping-fields-visible');
      }
    }
    
    // También ocultar/mostrar selector de direcciones guardadas según si se requiere dirección
    if (addressSelector) {
      // Solo mostrar si requiere dirección Y el usuario está logueado con direcciones
      if (requiresAddress && typeof UserAuth !== 'undefined' && UserAuth.isLoggedIn()) {
        const user = UserAuth.getUser();
        if (user && user.addresses && user.addresses.length > 0) {
          addressSelector.style.display = 'block';
        } else {
          addressSelector.style.display = 'none';
        }
      } else {
        addressSelector.style.display = 'none';
      }
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
      const wholesaleStatus = Cart.getWholesaleStatus();
      this.renderCartItems(items, total, wholesaleStatus);
      
      // Renderizar selector de pagos UNA SOLA VEZ al abrir
      const paymentContainer = document.getElementById('cart-payment-selector-container');
      if (typeof PaymentSelector !== 'undefined' && PaymentSelector.getMethods().length > 0) {
        if (paymentContainer && paymentContainer.innerHTML === '') {
          PaymentSelector.render('cart-payment-selector-container');
        }
      }
      
      // Auto-completar datos si hay usuario logueado
      this.autoFillUserData();
      
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Auto-completar datos del usuario logueado
   */
  static autoFillUserData() {
    const userSection = document.getElementById('cart-user-section');
    const loginPrompt = document.getElementById('cart-login-prompt');
    const addressSelector = document.getElementById('saved-addresses-selector');
    const saveAddressOption = document.getElementById('save-address-option');
    const nameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('customer-phone');
    
    // Verificar si la zona de envío requiere dirección
    const requiresAddress = this.shippingRequiresAddress();
    
    // Verificar si UserAuth está disponible y el usuario está logueado
    if (typeof UserAuth !== 'undefined' && UserAuth.isLoggedIn()) {
      const user = UserAuth.getUser();
      
      console.log('🛒 autoFillUserData - Usuario:', user, 'Requiere dirección:', requiresAddress);
      
      if (!user) {
        console.log('🛒 autoFillUserData - No hay datos de usuario aún');
        return;
      }
      
      // Mostrar sección de usuario logueado
      if (userSection) {
        userSection.style.display = 'flex';
        const avatarEl = document.getElementById('cart-user-avatar');
        const nameEl = document.getElementById('cart-user-name');
        if (avatarEl) avatarEl.textContent = user.photoURL ? '' : '👤';
        if (nameEl) nameEl.textContent = user.displayName || user.email?.split('@')[0] || 'Usuario';
      }
      
      // Ocultar prompt de login
      if (loginPrompt) loginPrompt.style.display = 'none';
      
      // Ocultar campos de nombre y teléfono (ya tenemos los datos del usuario)
      if (nameInput) nameInput.style.display = 'none';
      if (phoneInput) phoneInput.style.display = 'none';
      
      // Auto-completar nombre y teléfono (aunque estén ocultos, los necesitamos para el pedido)
      if (nameInput && user.displayName) {
        nameInput.value = user.displayName;
      }
      if (phoneInput && user.phone) {
        phoneInput.value = user.phone;
      }
      
      // Mostrar selector de direcciones SOLO si:
      // 1. Tiene direcciones guardadas
      // 2. La zona de envío requiere dirección (no es retiro en tienda)
      if (user.addresses && user.addresses.length > 0 && addressSelector) {
        if (requiresAddress) {
          addressSelector.style.display = 'block';
          const select = document.getElementById('saved-address-select');
          if (select) {
            select.innerHTML = '<option value="">-- Seleccionar dirección --</option>' +
              user.addresses.map(addr => {
                // Construir texto descriptivo de la dirección
                const label = addr.label || 'Dirección';
                const addressText = addr.address || '';
                const cityText = addr.city || '';
                const displayText = addressText 
                  ? `${label}: ${addressText}${cityText ? ', ' + cityText : ''}`
                  : `${label}${cityText ? ' - ' + cityText : ''}`;
                return `<option value="${addr.id}" ${addr.isDefault ? 'selected' : ''}>${displayText}</option>`;
              }).join('');
            
            // Si hay dirección por defecto, llenarla automáticamente
            const defaultAddr = user.addresses.find(a => a.isDefault);
            if (defaultAddr) {
              select.value = defaultAddr.id;
              this.fillAddressFields(defaultAddr);
            }
          }
        } else {
          // Retiro en tienda - ocultar selector de direcciones
          addressSelector.style.display = 'none';
        }
      } else if (addressSelector) {
        addressSelector.style.display = 'none';
      }
      
      // Ocultar opción de guardar dirección (ya está logueado)
      if (saveAddressOption) saveAddressOption.style.display = 'none';
    } else {
      // Usuario no logueado - mostrar campos de nombre y teléfono
      if (userSection) userSection.style.display = 'none';
      if (loginPrompt) loginPrompt.style.display = 'block';
      if (addressSelector) addressSelector.style.display = 'none';
      // Mostrar opción de guardar dirección solo si requiere dirección
      if (saveAddressOption) saveAddressOption.style.display = requiresAddress ? 'block' : 'none';
      if (nameInput) nameInput.style.display = 'block';
      if (phoneInput) phoneInput.style.display = 'block';
    }
  }

  /**
   * Verificar si la zona de envío actual requiere dirección
   * Retorna false para "Retiro en Tienda" (type: 'free')
   */
  static shippingRequiresAddress() {
    if (typeof ShippingSelector === 'undefined' || !ShippingSelector.isEnabled()) {
      return false;
    }
    const zone = ShippingSelector.getSelectedZone();
    // Requiere dirección solo si es envío a domicilio (fixed o cargo)
    return zone && (zone.type === 'fixed' || zone.type === 'cargo');
  }

  /**
   * Llenar campos con dirección guardada seleccionada
   */
  static fillSavedAddress() {
    const select = document.getElementById('saved-address-select');
    if (!select || !select.value) return;
    
    const user = UserAuth.getUser();
    if (!user || !user.addresses) return;
    
    const address = user.addresses.find(a => a.id === select.value);
    if (address) {
      this.fillAddressFields(address);
    }
  }

  /**
   * Llenar campos de dirección
   * Mapeo de campos guardados en cuenta.html a campos del carrito
   */
  static fillAddressFields(address) {
    console.log('🏠 fillAddressFields - Dirección recibida:', address);
    
    // Mapeo robusto: soporta tanto el formato nuevo como posibles variaciones
    const fields = {
      'customer-address': address.address || address.street || '',
      'customer-floor': address.floor || address.apartment || '',
      'customer-zipcode': address.zipcode || address.postalCode || address.cp || '',
      'customer-city': address.city || address.locality || address.barrio || '',
      'customer-between': address.between || address.betweenStreets || '',
      'customer-province': address.province || address.state || ''
    };
    
    console.log('🏠 fillAddressFields - Campos a llenar:', fields);
    
    Object.entries(fields).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) {
        input.value = value || '';
        console.log(`  → ${id}: "${value}"`);
      }
    });
  }

  /**
   * Limpiar datos de usuario (para cambiar)
   */
  static clearUserData() {
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-address').value = '';
    document.getElementById('customer-floor').value = '';
    document.getElementById('customer-zipcode').value = '';
    document.getElementById('customer-city').value = '';
    document.getElementById('customer-between').value = '';
    document.getElementById('customer-province').value = '';
    
    const userSection = document.getElementById('cart-user-section');
    const loginPrompt = document.getElementById('cart-login-prompt');
    const addressSelector = document.getElementById('saved-addresses-selector');
    
    if (userSection) userSection.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'block';
    if (addressSelector) addressSelector.style.display = 'none';
  }

    /**
   * Renderizar progreso hacia precio mayorista
   * Nueva lógica: monto mínimo + cantidad mínima POR PRODUCTO
   */
  static renderWholesaleProgress(status) {
    if (!status || !status.config || !status.config.enabled) {
      return '';
    }

    const config = status.config;
    const minItemsPerProduct = config.min_items_per_product || config.min_items || 2;
    const productsWithWholesale = status.productsWithWholesale || [];
    const totalAtListPrice = status.totalAtListPrice || Cart.getTotal();
    
    if (status.unlocked && productsWithWholesale.length > 0) {
      return `
        <div class="wholesale-progress wholesale-progress--unlocked">
          <div class="wholesale-progress__icon">🎉</div>
          <div class="wholesale-progress__text">
            <strong>¡Precio mayorista activo!</strong>
            <span>${productsWithWholesale.length} producto${productsWithWholesale.length > 1 ? 's aplican' : ' aplica'} precio mayorista</span>
          </div>
        </div>
      `;
    }

    let progressHtml = '';
    
    if (!status.meetsAmount) {
      const amountProgress = Math.min(100, (totalAtListPrice / config.min_amount) * 100);
      progressHtml = `
        <div class="wholesale-progress__bar">
          <div class="wholesale-progress__fill" style="width: ${amountProgress}%"></div>
        </div>
        <div class="wholesale-progress__info">
          <p class="wholesale-progress__hint">
            Te faltan <strong>${this.formatPrice(status.remainingAmount)}</strong> para activar precios mayoristas
          </p>
          <p class="wholesale-progress__policy">
            📋 <strong>Política:</strong> Monto mínimo ${this.formatPrice(config.min_amount)} + mínimo ${minItemsPerProduct} unidades del mismo producto
          </p>
        </div>
      `;
    } else {
      progressHtml = `
        <div class="wholesale-progress__requirements">
          <div class="wholesale-progress__req met">
            <span class="wholesale-progress__check">✓</span>
            <span>Monto mínimo alcanzado: ${this.formatPrice(totalAtListPrice)}</span>
          </div>
          <div class="wholesale-progress__req pending">
            <span class="wholesale-progress__check">○</span>
            <span>Necesitás ${minItemsPerProduct}+ unidades del mismo producto</span>
          </div>
        </div>
        <p class="wholesale-progress__policy">
          💡 Agregá más unidades de un mismo producto (ej: ${minItemsPerProduct} del mismo artículo, pueden ser tallas diferentes)
        </p>
      `;
    }

    return `
      <div class="wholesale-progress">
        <div class="wholesale-progress__header">
          <span class="wholesale-progress__icon">💰</span>
          <span class="wholesale-progress__title">Precio Mayorista</span>
        </div>
        ${progressHtml}
      </div>
    `;
  }

  /**
   * Aplicar cupón de descuento
   */
  static async applyCoupon() {
    const input = document.getElementById('coupon-code');
    const btn = document.getElementById('apply-coupon-btn');
    const messageEl = document.getElementById('coupon-message');
    
    if (!input || !btn) return;
    
    const code = input.value.trim();
    if (!code) {
      this.showCouponMessage('Ingresa un código de cupón', 'error');
      return;
    }

    // Deshabilitar mientras valida
    btn.disabled = true;
    btn.textContent = '...';
    
    try {
      const cartTotal = Cart.getTotal();
      const wholesaleStatus = Cart.getWholesaleStatus();
      const priceType = wholesaleStatus?.unlocked ? 'wholesale' : 'retail';
      
      const result = await CouponValidator.validate(code, cartTotal, priceType);
      
      if (result.valid) {
        this.showCouponMessage('¡Cupón aplicado!', 'success');
        input.value = '';
        this.updateCouponDisplay(result.coupon, result.discount, result.freeShipping);
        this.updateTotals(cartTotal);
      } else {
        // Si requiere login, mostrar mensaje especial con botón
        if (result.requiresLogin) {
          this.showCouponLoginRequired(result.error);
        } else {
          this.showCouponMessage(result.error, 'error');
        }
      }
    } catch (error) {
      this.showCouponMessage('Error al validar cupón', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Aplicar';
    }
  }

  /**
   * Mostrar mensaje de login requerido para cupones
   */
  static showCouponLoginRequired(message) {
    const el = document.getElementById('coupon-message');
    if (!el) return;
    
    el.innerHTML = `
      <div class="coupon-login-required">
        <span class="coupon-login-icon">🔐</span>
        <span class="coupon-login-text">${message}</span>
        <button type="button" class="coupon-login-btn" onclick="UserAuth.showAuthModal(); return false;">
          Iniciar sesión
        </button>
      </div>
    `;
    el.className = 'cart-coupon-message cart-coupon-message--login';
  }

  /**
   * Remover cupón aplicado
   */
  static removeCoupon() {
    CouponValidator.remove();
    this.updateCouponDisplay(null, 0, false);
    this.updateTotals(Cart.getTotal());
    this.showCouponMessage('', '');
  }

  /**
   * Mostrar mensaje de cupón
   */
  static showCouponMessage(message, type) {
    const el = document.getElementById('coupon-message');
    if (!el) return;
    
    el.textContent = message;
    el.className = 'cart-coupon-message';
    if (type) el.classList.add(`cart-coupon-message--${type}`);
    
    // Auto-ocultar después de 3 segundos
    if (message) {
      setTimeout(() => {
        if (el.textContent === message) {
          el.textContent = '';
          el.className = 'cart-coupon-message';
        }
      }, 3000);
    }
  }

  /**
   * Actualizar visualización del cupón aplicado
   */
  static updateCouponDisplay(coupon, discount, freeShipping) {
    const inputWrapper = document.querySelector('.cart-coupon-input-wrapper');
    const appliedEl = document.getElementById('coupon-applied');
    const codeEl = document.getElementById('coupon-applied-code');
    const descEl = document.getElementById('coupon-applied-desc');
    const discountRow = document.getElementById('cart-coupon-row');
    const discountEl = document.getElementById('cart-coupon-discount');
    
    if (coupon) {
      // Ocultar input, mostrar cupón aplicado
      if (inputWrapper) inputWrapper.style.display = 'none';
      if (appliedEl) {
        appliedEl.style.display = 'flex';
        if (codeEl) codeEl.textContent = coupon.code;
        if (descEl) descEl.textContent = CouponValidator.formatDescription(coupon);
      }
      
      // Mostrar fila de descuento
      if (discountRow && discount > 0) {
        discountRow.style.display = 'flex';
        if (discountEl) discountEl.textContent = `-$${this.formatPrice(discount)}`;
      }
      if (freeShipping && discountRow) {
        discountRow.style.display = 'flex';
        if (discountEl) discountEl.innerHTML = '<span class="shipping-free">Envío GRATIS</span>';
      }
    } else {
      // Mostrar input, ocultar cupón aplicado
      if (inputWrapper) inputWrapper.style.display = 'flex';
      if (appliedEl) appliedEl.style.display = 'none';
      if (discountRow) discountRow.style.display = 'none';
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
      
      // Limpiar contenedores para que se re-rendericen al abrir
      const paymentContainer = document.getElementById('cart-payment-selector-container');
      if (paymentContainer) paymentContainer.innerHTML = '';
      
      const shippingContainer = document.getElementById('cart-shipping-selector-container');
      if (shippingContainer) shippingContainer.innerHTML = '';
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
  static async checkout() {
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

    // Agregar userId si está logueado
    if (typeof UserAuth !== 'undefined' && UserAuth.isLoggedIn()) {
      const user = UserAuth.getUser();
      if (user?.uid) {
        customerData.userId = user.uid;
      }
    }

    // Agregar datos de cupón si hay uno aplicado
    if (typeof CouponValidator !== 'undefined') {
      const coupon = CouponValidator.getAppliedCoupon();
      if (coupon) {
        customerData.coupon = {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discount: CouponValidator.getDiscount(),
          freeShipping: CouponValidator.hasFreeShipping()
        };
      }
    }

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

    // Deshabilitar botón mientras procesa
    const checkoutBtn = document.querySelector('.cart-modal__checkout');
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = '⏳ Procesando...';
    }

    try {
      // Enviar por WhatsApp + Firebase (integrado en WhatsAppSender)
      const success = await WhatsAppSender.sendOrder(Cart.getItems(), customerData);

      if (success) {
        // Registrar uso del cupón si hay uno aplicado
        if (typeof CouponValidator !== 'undefined' && CouponValidator.getAppliedCoupon()) {
          await CouponValidator.registerUse();
          CouponValidator.remove();
        }
        
        // Limpiar formulario
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-phone').value = '';
        document.getElementById('customer-notes').value = '';
        
        // Limpiar campo de cupón
        const couponInput = document.getElementById('coupon-code');
        if (couponInput) couponInput.value = '';
        
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
    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Hubo un error al procesar el pedido. Por favor intenta nuevamente.');
    } finally {
      // Restaurar botón
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '📱 Enviar por WhatsApp';
      }
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
