/**
 * 🎟️ Módulo CouponValidator - Validación de Cupones de Descuento
 * Valida cupones directamente contra Firebase (sin servidor local)
 */

class CouponValidator {
  static appliedCoupon = null;
  static discount = 0;
  static freeShipping = false;
  static listeners = [];
  
  // Firebase config - se obtiene de firebaseConfig global
  static getDb() {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      return firebase.firestore();
    }
    return null;
  }

  static getStoreId() {
    // Usar el projectId de Firebase como storeId
    if (typeof firebaseConfig !== 'undefined' && firebaseConfig.projectId) {
      return firebaseConfig.projectId;
    }
    return 'petstoreprueba';
  }

  /**
   * Validar un cupón directamente contra Firebase
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

    const user = UserAuth.getUser();
    const userId = user?.uid || null;
    
    if (!userId) {
      return { 
        valid: false, 
        error: 'Error al obtener datos de usuario. Intentá cerrar sesión y volver a entrar.',
        requiresLogin: true
      };
    }

    const db = this.getDb();
    if (!db) {
      return { valid: false, error: 'Error de conexión con Firebase' };
    }

    try {
      const couponCode = code.toUpperCase().trim();
      
      // 1. Buscar el cupón en Firebase
      const couponDoc = await db.collection('coupons').doc(couponCode).get();
      
      if (!couponDoc.exists) {
        return { valid: false, error: 'Cupón no encontrado' };
      }

      const coupon = couponDoc.data();
      const now = new Date();

      // 2. Validaciones básicas
      if (!coupon.active) {
        return { valid: false, error: 'Este cupón está inactivo' };
      }

      if (coupon.validFrom && now < new Date(coupon.validFrom)) {
        return { valid: false, error: 'Este cupón aún no es válido' };
      }

      if (coupon.validUntil && now > new Date(coupon.validUntil)) {
        return { valid: false, error: 'Este cupón ha vencido' };
      }

      if (coupon.usageLimit > 0 && (coupon.usageCount || 0) >= coupon.usageLimit) {
        return { valid: false, error: 'Este cupón ha alcanzado su límite de uso' };
      }

      // 3. Validar tipo de precio (minorista/mayorista)
      if (coupon.priceType !== 'both' && coupon.priceType !== priceType) {
        const msg = coupon.priceType === 'retail' ? 'Solo para compras minoristas' : 'Solo para compras mayoristas';
        return { valid: false, error: msg };
      }

      // 4. Validar compra mínima
      if (coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
        return { valid: false, error: `Compra mínima: $${coupon.minPurchase.toLocaleString('es-AR')}` };
      }

      // 5. Validar primera compra si aplica
      if (coupon.firstPurchaseOnly) {
        const storeId = this.getStoreId();
        const ordersSnapshot = await db.collection('tiendas').doc(storeId).collection('orders')
          .where('userId', '==', userId)
          .limit(1)
          .get();
        
        if (!ordersSnapshot.empty) {
          return { valid: false, error: 'Este cupón es solo para tu primera compra' };
        }
      }

      // 6. Calcular descuento
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = Math.round(cartTotal * coupon.value / 100);
        if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else if (coupon.type === 'fixed') {
        discount = coupon.value;
      }

      // Cupón válido - guardar datos
      this.appliedCoupon = {
        code: couponCode,
        type: coupon.type,
        value: coupon.value,
        priceType: coupon.priceType,
        maxDiscount: coupon.maxDiscount || 0,
        firstPurchaseOnly: coupon.firstPurchaseOnly || false
      };
      this.discount = discount;
      this.freeShipping = coupon.type === 'freeShipping';
      
      this.notifyListeners();
      
      return {
        valid: true,
        coupon: this.appliedCoupon,
        discount: discount,
        freeShipping: this.freeShipping
      };

    } catch (error) {
      console.error('Error validando cupón:', error);
      return { valid: false, error: 'Error al validar cupón. Intentá de nuevo.' };
    }
  }

  /**
   * Registrar uso del cupón (incrementar contador en Firebase)
   */
  static async registerUse() {
    if (!this.appliedCoupon) return false;

    const db = this.getDb();
    if (!db) return false;

    try {
      const couponRef = db.collection('coupons').doc(this.appliedCoupon.code);
      await couponRef.update({
        usageCount: firebase.firestore.FieldValue.increment(1),
        lastUsedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
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
   * Recalcular descuento con nuevo total
   */
  static recalculate(newTotal) {
    if (!this.appliedCoupon) return;

    if (this.appliedCoupon.type === 'percentage') {
      this.discount = Math.round(newTotal * this.appliedCoupon.value / 100);
      if (this.appliedCoupon.maxDiscount && this.discount > this.appliedCoupon.maxDiscount) {
        this.discount = this.appliedCoupon.maxDiscount;
      }
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
