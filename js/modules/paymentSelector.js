/**
 * 💳 PaymentSelector - Selector de Forma de Pago
 * Permite al cliente elegir forma de pago y calcula comisiones
 */

class PaymentSelector {
  static methods = [];
  static selectedMethod = null;
  static listeners = [];
  static initialized = false;

  /**
   * Inicializar el selector
   */
  static async init() {
    if (this.initialized) return;
    
    await this.loadMethods();
    this.initialized = true;
    console.log('💳 PaymentSelector initialized');
  }

  /**
   * Cargar métodos de pago desde config
   */
  static async loadMethods() {
    try {
      const pathname = window.location.pathname;
      let baseUrl = 'data/';
      if (pathname.includes('/pets-store/')) {
        baseUrl = '/pets-store/data/';
      }

      const response = await fetch(baseUrl + 'pagos.json');
      if (response.ok) {
        const data = await response.json();
        this.methods = data.methods || [];
        
        // Seleccionar el primero por defecto
        if (this.methods.length > 0 && !this.selectedMethod) {
          this.selectedMethod = this.methods[0];
        }
      }
    } catch (error) {
      console.log('💳 PaymentSelector: No hay config de pagos, usando default');
      // Métodos por defecto si no hay config
      this.methods = [
        { id: 'efectivo', name: 'Efectivo', icon: '💵', commission: 0 },
        { id: 'transferencia', name: 'Transferencia', icon: '🏦', commission: 0 }
      ];
      this.selectedMethod = this.methods[0];
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
      this.notifyListeners();
      console.log('💳 Método seleccionado:', method.name, method.commission + '%');
    }
  }

  /**
   * Calcular comisión sobre un monto
   */
  static calculateCommission(subtotal) {
    if (!this.selectedMethod || this.selectedMethod.commission === 0) {
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
      <div class="payment-selector">
        <div class="payment-selector__header">
          <span class="payment-selector__icon">💳</span>
          <span class="payment-selector__title">Forma de Pago</span>
        </div>
        <div class="payment-selector__options">
          ${this.methods.map(method => `
            <label class="payment-option ${this.selectedMethod?.id === method.id ? 'selected' : ''}" 
                   data-method-id="${method.id}">
              <input type="radio" name="payment-method" value="${method.id}" 
                     ${this.selectedMethod?.id === method.id ? 'checked' : ''}
                     onchange="PaymentSelector.select('${method.id}')">
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

    // Agregar event listeners para actualizar visual
    container.querySelectorAll('.payment-option').forEach(option => {
      option.addEventListener('click', () => {
        container.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
      });
    });
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
      commission: this.selectedMethod.commission,
      commissionPercent: this.selectedMethod.commission
    };
  }

  /**
   * Verificar si el selector está habilitado (tiene métodos)
   */
  static isEnabled() {
    return this.methods.length > 0;
  }

  /**
   * Formatear para mensaje de WhatsApp
   */
  static formatForWhatsApp(subtotal) {
    if (!this.selectedMethod) return '';
    
    const commission = this.calculateCommission(subtotal);
    let text = `💳 *Forma de Pago:* ${this.selectedMethod.icon} ${this.selectedMethod.name}`;
    
    if (commission > 0) {
      text += `\n   Recargo (${this.selectedMethod.commission}%): $${commission.toLocaleString('es-AR')}`;
    }
    
    return text;
  }
}

// Exportar
if (typeof window !== 'undefined') {
  window.PaymentSelector = PaymentSelector;
}
