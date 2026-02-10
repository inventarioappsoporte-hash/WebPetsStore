/**
 * CouponValidator v4 - Validacion de Cupones contra Firebase
 * Conexion DIRECTA a Firebase (sin depender de UserAuth.db)
 */

class CouponValidator {
  static appliedCoupon = null;
  static discount = 0;
  static freeShipping = false;
  static listeners = [];
  static app = null;
  static db = null;
  static initialized = false;
  static STORE_ID = 'petsstore-b0516';

  static firebaseConfig = {
    apiKey: "AIzaSyDHWTTs1J108hiBeib4d6E5i-HLoDRoDCA",
    authDomain: "petsstore-b0516.firebaseapp.com",
    projectId: "petsstore-b0516",
    storageBucket: "petsstore-b0516.appspot.com"
  };

  static async init() {
    if (this.initialized && this.db) return true;
    try {
      const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const apps = getApps();
      if (apps.length > 0) {
        this.app = apps[0];
        this.db = getFirestore(this.app);
      } else {
        this.app = initializeApp(this.firebaseConfig, 'coupon-validator');
        this.db = getFirestore(this.app);
      }
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error inicializando CouponValidator:', error);
      return false;
    }
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
    const initOk = await this.init();
    if (!initOk || !this.db) {
      return { valid: false, error: 'Error de conexion. Recarga la pagina.' };
    }
    try {
      const { doc, getDoc, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const couponCode = code.toUpperCase().trim();
      const couponRef = doc(this.db, 'coupons', couponCode);
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
        return { valid: false, error: coupon.priceType === 'retail' ? 'Solo para minoristas' : 'Solo para mayoristas' };
      }
      if (coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
        return { valid: false, error: 'Compra minima: $' + coupon.minPurchase.toLocaleString('es-AR') };
      }
      if (coupon.firstPurchaseOnly) {
        const ordersRef = collection(this.db, 'tiendas', this.STORE_ID, 'orders');
        const q = query(ordersRef, where('userId', '==', userId));
        const ordersSnap = await getDocs(q);
        if (!ordersSnap.empty) {
          return { valid: false, error: 'Este cupon es solo para tu primera compra' };
        }
      }
      if (coupon.perUserLimit && coupon.perUserLimit > 0) {
        const ordersRef = collection(this.db, 'tiendas', this.STORE_ID, 'orders');
        const q = query(ordersRef, where('userId', '==', userId));
        const userOrdersSnap = await getDocs(q);
        let usageCount = 0;
        userOrdersSnap.forEach(docSnap => {
          const order = docSnap.data();
          if (order.coupon && order.coupon.code === couponCode) {
            usageCount++;
          }
        });
        if (usageCount >= coupon.perUserLimit) {
          return { valid: false, error: 'Ya usaste este cupon' };
        }
      }
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = Math.round(cartTotal * coupon.value / 100);
        if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
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
    if (!this.appliedCoupon || !this.db) return false;
    try {
      const { doc, updateDoc, increment, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const couponRef = doc(this.db, 'coupons', this.appliedCoupon.code);
      await updateDoc(couponRef, { usageCount: increment(1), lastUsedAt: serverTimestamp() });
      return true;
    } catch (e) { 
      console.error('Error registrando uso de cupon:', e); 
      return false; 
    }
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

if (typeof window !== 'undefined') window.CouponValidator = CouponValidator;
