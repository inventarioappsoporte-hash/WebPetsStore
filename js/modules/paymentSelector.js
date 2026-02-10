/**
 * 💳 PaymentSelector - Selector de Forma de Pago
 * Permite al cliente elegir forma de pago y calcula comisiones
 * Los datos se cargan desde pagos.json (generado por admin local)
 */

class PaymentSelector {
  static methods = [];
  static selectedMethod = null;
  static listeners = [];
  static initialized = false;
  static loading = false;

  /**
   * Inicializar el selector (no bloquea)
   */
  static async init() {
    if (this.initialized || this.loading) return;
    this.loading = true;
    
    try {
      await this.loadMethods();
      this.initialized = true;
    } catch (e) {
      console.warn('💳 PaymentSelector: Error loading config', e);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Cargar métodos de pago desde pagos.json (estático)
   */
  static async loadMethods() {
    try {
      // Determinar URL base
      const pathname = window.location.pathname;
      let baseUrl = 'data/';
      if (pathname.includes('/pets-store/')) {
        baseUrl = '/pets-store/data/';
      }

      const response = await fetch(baseUrl + 'pagos.json', {
        cache: 'default' // Usar cache del navegador
      });
      
      if (response.ok) {
        const data = await response.json();
        this.methods = (data.methods || []).filter(m => m.enabled !== false);
        
        // Cargar selección guardada o usar el primero por defecto
        this.loadSelectedMethod();
      } else {
        this.setDefaultMethods();
      }
    } catch (error) {
      console.log('💳 PaymentSelector: Using default methods');
      this.setDefaultMethods();
    }
  }

  /**
   * Métodos por defecto si no hay config
   */
  static setDefaultMethods() {
    this.methods = [
      { id: 'efectivo', name: 'Efectivo', icon: '💵', commission: 0 },
      { id: 'transferencia', name: 'Transferencia', icon: '🏦', commission: 0 }
    ];
    this.loadSelectedMethod();
  }

  /**
   * Cargar método seleccionado desde localStorage
   */
  static loadSelectedMethod() {
    if (this.methods.length === 0) return;
    
    const savedMethodId = localStorage.getItem('pets-store-payment-method');
    
    if (savedMethodId) {
      const savedMethod = this.methods.find(m => m.id === savedMethodId);
      if (savedMethod) {
        this.selectedMethod = savedMethod;
        return;
      }
    }
    // Si no hay guardado o no existe, usar el primero
    this.selectedMethod = this.methods[0];
  }

  /**
   * Guardar método seleccionado en localStorage
   */
  static saveSelectedMethod() {
    if (this.selectedMethod) {
      localStorage.setItem('pets-store-payment-method', this.selectedMethod.id);
    }
  }

  /**
   * Obtener métodos disponibles
   */
  static getMethods() {
    return this.methods;
  }

  /**
   * Obtener método seleccionado
   */
  static getSelected() {
    return this.selectedMethod;
  }

  /**
   * Seleccionar un método
   */
  static select(methodId) {
    const method = this.methods.find(m => m.id === methodId);
    if (method) {
      this.selectedMethod = method;
      this.saveSelectedMethod();
      this.notifyListeners();
    }
  }

  /**
   * Calcular comisión sobre un monto
   */
  static calculateCommission(subtotal) {
    if (!this.selectedMethod || !this.selectedMethod.commission) {
      return 0;
    }
    return Math.round(subtotal * (this.selectedMethod.commission / 100));
  }

  /**
   * Obtener total con comisión
   */
  static getTotalWithCommission(subtotal) {
    return subtotal + this.calculateCommission(subtotal);
  }

  /**
   * Renderizar selector en un contenedor
   */
  static render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.methods.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="payment-selector" data-payment-selector>
        <div class="payment-selector__header">
          <span class="payment-selector__icon">💳</span>
          <span class="payment-selector__title">Forma de Pago</span>
        </div>
        <div class="payment-selector__options">
          ${this.methods.map(method => `
            <label class="payment-option ${this.selectedMethod?.id === method.id ? 'selected' : ''}" 
                   data-method-id="${method.id}">
              <input type="radio" name="payment-method" value="${method.id}" 
                     ${this.selectedMethod?.id === method.id ? 'checked' : ''}>
              <span class="payment-option__icon">${method.icon}</span>
              <span class="payment-option__info">
                <span class="payment-option__name">${method.name}</span>
                <span class="payment-option__commission ${method.commission > 0 ? 'has-fee' : ''}">
                  ${method.commission > 0 ? `+${method.commission}% recargo` : 'Sin recargo'}
                </span>
              </span>
              <span class="payment-option__check">✓</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;

    // Un solo event listener con delegation (más eficiente)
    const optionsContainer = container.querySelector('.payment-selector__options');
    if (optionsContainer) {
      optionsContainer.onclick = (e) => {
        const option = e.target.closest('.payment-option');
        if (option) {
          const methodId = option.dataset.methodId;
          // Actualizar visual
          optionsContainer.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
          option.classList.add('selected');
          option.querySelector('input').checked = true;
          // Actualizar estado
          this.select(methodId);
        }
      };
    }
  }

  /**
   * Agregar listener para cambios
   */
  static addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notificar a listeners
   */
  static notifyListeners() {
    const method = this.selectedMethod;
    this.listeners.forEach(cb => cb(method));
  }

  /**
   * Obtener datos para el pedido
   */
  static getOrderData() {
    if (!this.selectedMethod) return null;
    
    return {
      methodId: this.selectedMethod.id,
      methodName: this.selectedMethod.name,
      methodIcon: this.selectedMethod.icon,
      commission: this.selectedMethod.commission || 0
    };
  }

  /**
   * Verificar si el selector está habilitado
   */
  static isEnabled() {
    return this.methods.length > 0;
  }
}

// Exportar
if (typeof window !== 'undefined') {
  window.PaymentSelector = PaymentSelector;
}

// Auto-inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PaymentSelector.init());
  } else {
    PaymentSelector.init();
  }
}
