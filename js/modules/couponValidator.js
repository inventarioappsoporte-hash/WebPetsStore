/**
 * 🎟️ Módulo CouponValidator - Validación de Cupones de Descuento
 * Valida cupones contra Firebase a través del API del admin
 */

class CouponValidator {
  static appliedCoupon = null;
  static discount = 0;
  static freeShipping = false;
  static listeners = [];
  
  // URL del API (pets-admin server)
  static API_URL = 'http://localhost:3000/api/cupones';

  /**
   * Validar un cupón
   * @param {string} code - Código del cupón
   * @param {number} cartTotal - Total del carrito
   * @param {string} priceType - 'retail' o 'wholesale'
   * @returns {Object} Resultado de validación
   */
  static async validate(code, cartTotal, priceType = 'retail') {
    if (!code || code.trim() === '') {
      return { valid: false, error: 'Ingresa un código de cupón' };
    }

    // VALIDACIÓN: Requerir login para usar cupones
    if (typeof UserAuth === 'undefined' || !UserAuth.isLoggedIn()) {
      return { 
        valid: false, 
        error: 'Iniciá sesión para usar cupones de descuento',
        requiresLogin: true
      };
    }

    // Obtener userId del usuario logueado
    const user = UserAuth.getUser();
    const userId = user?.uid || null;
    
    if (!userId) {
      return { 
        valid: false, 
        error: 'Error al obtener datos de usuario. Intentá cerrar sesión y volver a entrar.',
        requiresLogin: true
      };
    }

    try {

      const response = await fetch(`${this.API_URL}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          cartTotal: cartTotal,
          priceType: priceType,
          userId: userId
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        return { valid: false, error: data.error || 'Error al validar cupón' };
      }

      if (!data.valid) {
        return { valid: false, error: data.error || 'Cupón no válido' };
      }

      // Cupón válido - guardar datos
      this.appliedCoupon = data.coupon;
      this.discount = data.discount || 0;
      this.freeShipping = data.freeShipping || false;
      
      this.notifyListeners();
      
      return {
        valid: true,
        coupon: data.coupon,
        discount: data.discount,
        freeShipping: data.freeShipping
      };

    } catch (error) {
      console.error('Error validando cupón:', error);
      return { valid: false, error: 'Error de conexión. Verifica que el servidor esté activo.' };
    }
  }

  /**
   * Registrar uso del cupón (llamar al confirmar pedido)
   */
  static async registerUse() {
    if (!this.appliedCoupon) return false;

    try {
      const response = await fetch(`${this.API_URL}/${this.appliedCoupon.code}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error registrando uso de cupón:', error);
      return false;
    }
  }

  /**
   * Remover cupón aplicado
   */
  static remove() {
    this.appliedCoupon = null;
    this.discount = 0;
    this.freeShipping = false;
    this.notifyListeners();
  }

  /**
   * Obtener cupón aplicado
   */
  static getAppliedCoupon() {
    return this.appliedCoupon;
  }

  /**
   * Obtener descuento actual
   */
  static getDiscount() {
    return this.discount;
  }

  /**
   * Verificar si tiene envío gratis
   */
  static hasFreeShipping() {
    return this.freeShipping;
  }

  /**
   * Recalcular descuento con nuevo total (sin notificar para evitar loops)
   */
  static recalculate(newTotal) {
    if (!this.appliedCoupon) return;

    if (this.appliedCoupon.type === 'percentage') {
      this.discount = Math.round(newTotal * this.appliedCoupon.value / 100);
      if (this.appliedCoupon.maxDiscount && this.discount > this.appliedCoupon.maxDiscount) {
        this.discount = this.appliedCoupon.maxDiscount;
      }
    }
    // fixed y freeShipping no cambian con el total
    // NO llamar notifyListeners aquí para evitar loop infinito
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
    this.listeners.forEach(cb => cb(this.appliedCoupon, this.discount, this.freeShipping));
  }

  /**
   * Formatear descripción del cupón
   */
  static formatDescription(coupon) {
    if (!coupon) return '';
    
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% de descuento`;
      case 'fixed':
        return `$${coupon.value.toLocaleString('es-AR')} de descuento`;
      case 'freeShipping':
        return 'Envío gratis';
      default:
        return 'Descuento aplicado';
    }
  }
}
