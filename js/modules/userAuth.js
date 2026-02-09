/**
 * 🔐 Módulo UserAuth - Sistema de Autenticación de Usuarios
 * Maneja registro, login y gestión de sesión con Firebase
 * Incluye caché local para optimizar lecturas
 */

class UserAuth {
  static app = null;
  static auth = null;
  static db = null;
  static currentUser = null;
  static userProfile = null;
  static initialized = false;
  static listeners = [];
  static STORE_ID = 'petsstore-b0516';
  static CACHE_KEY = 'petsstore_user_profile';
  static CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutos

  static firebaseConfig = {
    apiKey: "AIzaSyDHWTTs1J108hiBeib4d6E5i-HLoDRoDCA",
    authDomain: "petsstore-b0516.firebaseapp.com",
    projectId: "petsstore-b0516",
    storageBucket: "petsstore-b0516.appspot.com"
  };

  /**
   * Guardar perfil en caché local
   */
  static saveToCache(profile) {
    if (!profile) return;
    try {
      const cacheData = {
        profile,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Perfil guardado en caché local');
    } catch (e) {
      console.warn('⚠️ No se pudo guardar en caché:', e);
    }
  }

  /**
   * Cargar perfil desde caché local
   */
  static loadFromCache(uid) {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;
      
      const { profile, timestamp } = JSON.parse(cached);
      
      // Verificar que sea el mismo usuario y no haya expirado
      if (profile.uid !== uid) {
        this.clearCache();
        return null;
      }
      
      if (Date.now() - timestamp > this.CACHE_EXPIRY) {
        console.log('⏰ Caché expirado, recargando desde Firebase');
        return null;
      }
      
      console.log('📦 Perfil cargado desde caché local');
      return profile;
    } catch (e) {
      return null;
    }
  }

  /**
   * Limpiar caché local
   */
  static clearCache() {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (e) {}
  }

  static async init() {
    if (this.initialized) return true;
    try {
      const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const apps = getApps();
      this.app = apps.length > 0 ? apps[0] : initializeApp(this.firebaseConfig);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      onAuthStateChanged(this.auth, async (user) => {
        this.currentUser = user;
        if (user) {
          const profile = await this.loadUserProfile(user.uid);
          // Si no hay perfil, crearlo automáticamente
          if (!profile) {
            console.log('📝 Creando perfil de usuario...');
            await this.createUserProfile(user.uid, {
              email: user.email,
              displayName: user.displayName || '',
              phone: '',
              photoURL: user.photoURL || ''
            });
          }
        } else {
          this.userProfile = null;
        }
        this.notifyListeners();
        this.updateHeaderUI();
      });

      this.initialized = true;
      console.log('🔐 UserAuth initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing UserAuth:', error);
      return false;
    }
  }

  static async registerWithEmail(email, password, displayName, phone) {
    try {
      await this.init();
      const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await this.createUserProfile(userCredential.user.uid, { email, displayName, phone });
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  static async loginWithEmail(email, password) {
    try {
      await this.init();
      const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  static async loginWithGoogle() {
    try {
      await this.init();
      const { signInWithPopup, GoogleAuthProvider } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      const provider = new GoogleAuthProvider();
      
      console.log('🔐 Iniciando login con Google...');
      const userCredential = await signInWithPopup(this.auth, provider);
      const user = userCredential.user;
      console.log('✅ Login con Google exitoso:', user.email);
      
      const profile = await this.loadUserProfile(user.uid);
      if (!profile) {
        await this.createUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
          phone: '',
          photoURL: user.photoURL
        });
      }
      return { success: true, user };
    } catch (error) {
      console.error('❌ Error en loginWithGoogle:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      
      // Mensajes más específicos para errores de Google
      let errorMsg = this.getErrorMessage(error.code);
      if (error.code === 'auth/unauthorized-domain') {
        errorMsg = 'Este dominio no está autorizado. Agrega localhost a los dominios autorizados en Firebase Console.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMsg = 'El inicio de sesión con Google no está habilitado. Habilítalo en Firebase Console > Authentication > Sign-in method.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMsg = 'El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio.';
      }
      
      return { success: false, error: errorMsg };
    }
  }

  static async logout() {
    try {
      const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      await signOut(this.auth);
      this.clearCache(); // Limpiar caché al cerrar sesión
      this.userProfile = null;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async resetPassword(email) {
    try {
      await this.init();
      const { sendPasswordResetEmail } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  static async createUserProfile(uid, data) {
    try {
      const { doc, setDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const userRef = doc(this.db, 'tiendas', this.STORE_ID, 'users', uid);
      const profileData = {
        ...data,
        role: 'user', // Siempre crear con rol 'user'
        createdAt: Timestamp.now(),
        addresses: []
      };
      await setDoc(userRef, profileData);
      this.userProfile = { uid, ...profileData };
      this.saveToCache(this.userProfile); // Guardar en caché
      console.log('✅ Perfil de usuario creado con rol:', profileData.role);
      return true;
    } catch (error) {
      console.error('Error creando perfil:', error);
      return false;
    }
  }

  static async loadUserProfile(uid) {
    // Validación de seguridad: solo cargar el perfil del usuario actual
    if (this.currentUser && this.currentUser.uid !== uid) {
      console.error('🚫 Intento de acceder a perfil de otro usuario bloqueado');
      return null;
    }
    
    // Si ya tenemos el perfil cacheado en memoria, no recargar
    if (this.userProfile && this.userProfile.uid === uid) {
      console.log('🔐 Using cached user profile (memory)');
      return this.userProfile;
    }
    
    // Intentar cargar desde caché local (localStorage)
    const cachedProfile = this.loadFromCache(uid);
    if (cachedProfile) {
      this.userProfile = cachedProfile;
      return this.userProfile;
    }
    
    // Cargar desde Firebase
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const userRef = doc(this.db, 'tiendas', this.STORE_ID, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        this.userProfile = { uid, ...userDoc.data() };
        this.saveToCache(this.userProfile); // Guardar en caché
        console.log('🔥 Perfil cargado desde Firebase');
        return this.userProfile;
      }
      
      // Si no existe el perfil, crearlo con datos de Auth
      if (this.currentUser && this.currentUser.uid === uid) {
        const newProfile = {
          email: this.currentUser.email || '',
          displayName: this.currentUser.displayName || '',
          phone: '',
          photoURL: this.currentUser.photoURL || ''
        };
        await this.createUserProfile(uid, newProfile);
        return this.userProfile;
      }
      return null;
    } catch (error) {
      console.error('Error cargando perfil:', error);
      // Si hay error de permisos, usar datos de Auth directamente
      if (this.currentUser && this.currentUser.uid === uid) {
        this.userProfile = {
          uid,
          email: this.currentUser.email || '',
          displayName: this.currentUser.displayName || '',
          phone: '',
          photoURL: this.currentUser.photoURL || '',
          role: 'user',
          addresses: []
        };
        return this.userProfile;
      }
      return null;
    }
  }

  static async updateProfile(data) {
    if (!this.currentUser) return { success: false, error: 'No hay sesión' };
    
    // Validación: no permitir cambiar el rol desde el cliente
    if (data.role) {
      console.warn('🚫 Intento de cambiar rol bloqueado');
      delete data.role;
    }
    
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const userRef = doc(this.db, 'tiendas', this.STORE_ID, 'users', this.currentUser.uid);
      await updateDoc(userRef, data);
      this.userProfile = { ...this.userProfile, ...data };
      this.saveToCache(this.userProfile); // Actualizar caché
      this.notifyListeners();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async addAddress(address) {
    if (!this.currentUser) return { success: false, error: 'No hay sesión' };
    try {
      const { doc, updateDoc, arrayUnion } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const addressWithId = { ...address, id: 'addr_' + Date.now() };
      const userRef = doc(this.db, 'tiendas', this.STORE_ID, 'users', this.currentUser.uid);
      await updateDoc(userRef, { addresses: arrayUnion(addressWithId) });
      if (!this.userProfile.addresses) this.userProfile.addresses = [];
      this.userProfile.addresses.push(addressWithId);
      this.saveToCache(this.userProfile); // Actualizar caché
      this.notifyListeners();
      return { success: true, address: addressWithId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async removeAddress(addressId) {
    if (!this.currentUser || !this.userProfile) return { success: false, error: 'No hay sesión' };
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const updated = this.userProfile.addresses.filter(a => a.id !== addressId);
      const userRef = doc(this.db, 'tiendas', this.STORE_ID, 'users', this.currentUser.uid);
      await updateDoc(userRef, { addresses: updated });
      this.userProfile.addresses = updated;
      this.saveToCache(this.userProfile); // Actualizar caché
      this.notifyListeners();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async setDefaultAddress(addressId) {
    if (!this.currentUser || !this.userProfile) return { success: false, error: 'No hay sesión' };
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const updated = this.userProfile.addresses.map(a => ({ ...a, isDefault: a.id === addressId }));
      const userRef = doc(this.db, 'tiendas', this.STORE_ID, 'users', this.currentUser.uid);
      await updateDoc(userRef, { addresses: updated });
      this.userProfile.addresses = updated;
      this.saveToCache(this.userProfile); // Actualizar caché
      this.notifyListeners();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static isLoggedIn() { return !!this.currentUser; }
  
  static getUser() {
    if (!this.currentUser) return null;
    // Priorizar: userProfile.displayName > currentUser.displayName > email username
    const profileName = this.userProfile?.displayName;
    const authName = this.currentUser.displayName;
    const emailName = this.currentUser.email?.split('@')[0] || '';
    
    const displayName = (profileName && profileName.trim()) 
      ? profileName 
      : (authName && authName.trim()) 
        ? authName 
        : emailName;
    
    console.log('🔍 getUser displayName sources:', { profileName, authName, emailName, final: displayName });
    
    return {
      uid: this.currentUser.uid,
      email: this.currentUser.email,
      displayName: displayName,
      phone: this.userProfile?.phone || '',
      photoURL: this.currentUser.photoURL || '',
      addresses: this.userProfile?.addresses || []
    };
  }

  // Crear perfil si no existe
  static async ensureUserProfile() {
    if (!this.currentUser) return false;
    if (this.userProfile) return true;
    
    // Crear perfil con datos de Firebase Auth
    const created = await this.createUserProfile(this.currentUser.uid, {
      email: this.currentUser.email,
      displayName: this.currentUser.displayName || '',
      phone: '',
      photoURL: this.currentUser.photoURL || ''
    });
    
    return created;
  }

  static getDefaultAddress() {
    const addrs = this.userProfile?.addresses || [];
    return addrs.find(a => a.isDefault) || addrs[0] || null;
  }

  static addListener(cb) { this.listeners.push(cb); }
  
  static notifyListeners() {
    const user = this.getUser();
    this.listeners.forEach(cb => { try { cb(user); } catch(e) {} });
  }

  static updateHeaderUI() {
    const btn = document.getElementById('user-account-btn');
    const txt = document.getElementById('user-account-text');
    if (!btn) return;
    if (this.currentUser) {
      // Usar la misma lógica que getUser para consistencia
      const profileName = this.userProfile?.displayName;
      const authName = this.currentUser.displayName;
      const emailName = this.currentUser.email?.split('@')[0] || 'Cuenta';
      
      const name = (profileName && profileName.trim()) 
        ? profileName 
        : (authName && authName.trim()) 
          ? authName 
          : emailName;
      
      if (txt) txt.textContent = name.split(' ')[0];
      btn.classList.add('logged-in');
    } else {
      if (txt) txt.textContent = 'Mi Cuenta';
      btn.classList.remove('logged-in');
    }
  }

  static showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) { modal.classList.add('auth-modal--open'); document.body.style.overflow = 'hidden'; }
  }

  static hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) { modal.classList.remove('auth-modal--open'); document.body.style.overflow = ''; }
  }

  static switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById('auth-tab-' + tab)?.classList.add('active');
    document.getElementById('auth-form-' + tab)?.classList.add('active');
  }

  static getErrorMessage(code) {
    const msgs = {
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/popup-closed-by-user': 'Se cerró la ventana de login',
      'auth/network-request-failed': 'Error de conexión'
    };
    return msgs[code] || 'Error. Intenta nuevamente';
  }
}

// Inicializar
if (typeof window !== 'undefined') {
  window.UserAuth = UserAuth;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UserAuth.init());
  } else {
    UserAuth.init();
  }
}
