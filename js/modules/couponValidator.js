/**
 * CouponValidator - Validacion de Cupones contra Firebase
 * Usa el SDK modular de Firebase v9+
 */

class CouponValidator {
  static appliedCoupon = null;
  static discount = 0;
  static freeShipping = false;
  static listeners = [];
  static db = null;
  static STORE_ID = 'petstorepk';

  static async getDb() {
    if (this.db) return this.db;
    
    // Esperar a que UserAuth inicialice su db
    for (let i = 0; i < 20; i++) {
      if (typeof UserAuth !== 'undefined' && UserAuth.db) {
        this.db = UserAuth.db;
        console.log('CouponValidator: usando UserAuth.db');
        return this.db;
      }
      if (typeof FirebaseOrders !== 'undefined' && FirebaseOrders.db) {
        this.db = FirebaseOrders.db;
        console.log('CouponValidator: usando FirebaseOrders.db');
        return this.db;
      }
      await new Promise(r => setTimeout(r, 200));
    }
    return null;
  }

  static async validate(code, cartTotal, priceType = 'retail') {
    if (!code || code.trim() === '') {
      return { valid: false, error: 'Ingresa un codigo de cupon' };
    }

    if (typeof UserAuth === 'undefined' || !UserAuth.isLoggedIn()) {
      return { valid: false, error: 'Inicia sesion para usar cupones', requiresLogin: true };
    }

    const user = UserAuth.getUser();
    const userId = user?.uid || null;
    if (!userId) {
      return { valid: false, error: 'Error de usuario. Cierra sesion y vuelve a entrar.', requiresLogin: true };
    }

    const db = await this.getDb();
    if (!db) {
      console.error('CouponValidator: Firebase DB no disponible despues de esperar');
      return { valid: false, error: 'Error de conexion. Recarga la pagina.' };
    }

    try {
      const { doc, getDoc, collection, query, where, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      
      const couponCode = code.toUpperCase().trim();
      const couponRef = doc(db, 'coupons', couponCode);
      const couponSnap = await getDoc(couponRef);
      
      if (!couponSnap.exists()) {
        return { valid: false, error: 'Cupon no encontrado' };
      }

      const coupon = couponSnap.data();
      const now = new Date();

      if (!coupon.active) return { valid: false, error: 'Cupon inactivo' };
      if (coupon.validFrom && now < new Date(coupon.validFrom)) return { valid: false, error: 'Cupon aun no valido' };
      if (coupon.validUntil && now > new Date(coupon.validUntil)) return { valid: false, error: 'Cupon vencido' };
      if (coupon.usageLimit > 0 && (coupon.usageCount || 0) >= coupon.usageLimit) return { valid: false, error: 'Cupon agotado' };
      
      if (coupon.priceType !== 'both' && coupon.priceType !== priceType) {
        return { valid: false, error: coupon.priceType === 'retail' ? 'Solo minoristas' : 'Solo mayoristas' };
      }
      
      if (coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
        return { valid: false, error: 'Compra minima: $' + coupon.minPurchase.toLocaleString('es-AR') };
      }

      if (coupon.firstPurchaseOnly) {
        const ordersRef = collection(db, 'tiendas', this.STORE_ID, 'orders');
        const q = query(ordersRef, where('userId', '==', userId), limit(1));
        const ordersSnap = await getDocs(q);
        if (!ordersSnap.empty) {
          return { valid: false, error: 'Solo para primera compra' };
        }
      }

      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = Math.round(cartTotal * coupon.value / 100);
        if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
      } else if (coupon.type === 'fixed') {
        discount = coupon.value;
      }

      this.appliedCoupon = { code: couponCode, type: coupon.type, value: coupon.value, maxDiscount: coupon.maxDiscount || 0 };
      this.discount = discount;
      this.freeShipping = coupon.type === 'freeShipping';
      this.notifyListeners();
      
      return { valid: true, coupon: this.appliedCoupon, discount, freeShipping: this.freeShipping };
    } catch (error) {
      console.error('Error validando cupon:', error);
      return { valid: false, error: 'Error al validar. Intenta de nuevo.' };
    }
  }

  static async registerUse() {
    if (!this.appliedCoupon) return false;
    const db = await this.getDb();
    if (!db) return false;
    try {
      const { doc, updateDoc, increment, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const couponRef = doc(db, 'coupons', this.appliedCoupon.code);
      await updateDoc(couponRef, { usageCount: increment(1), lastUsedAt: serverTimestamp() });
      return true;
    } catch (e) { console.error(e); return false; }
  }

  static remove() {
    this.appliedCoupon = null;
    this.discount = 0;
    this.freeShipping = false;
    this.notifyListeners();
  }

  static getAppliedCoupon() { return this.appliedCoupon; }
  static getDiscount() { return this.discount; }
  static hasFreeShipping() { return this.freeShipping; }

  static recalculate(newTotal) {
    if (!this.appliedCoupon) return;
    if (this.appliedCoupon.type === 'percentage') {
      this.discount = Math.round(newTotal * this.appliedCoupon.value / 100);
      if (this.appliedCoupon.maxDiscount && this.discount > this.appliedCoupon.maxDiscount) {
        this.discount = this.appliedCoupon.maxDiscount;
      }
    }
  }

  static addListener(cb) { this.listeners.push(cb); }
  static notifyListeners() { this.listeners.forEach(cb => cb(this.appliedCoupon, this.discount, this.freeShipping)); }

  static formatDescription(coupon) {
    if (!coupon) return '';
    if (coupon.type === 'percentage') return coupon.value + '% de descuento';
    if (coupon.type === 'fixed') return '$' + coupon.value.toLocaleString('es-AR') + ' de descuento';
    if (coupon.type === 'freeShipping') return 'Envio gratis';
    return 'Descuento aplicado';
  }
}
