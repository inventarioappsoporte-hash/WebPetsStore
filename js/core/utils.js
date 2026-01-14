// Utilidades globales
const Utils = {
  // Formatear precio
  formatPrice: (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  },

  // Debounce
  debounce: (func, delay) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  // Throttle
  throttle: (func, limit) => {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Normalizar texto para búsqueda
  normalizeText: (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  },

  // Truncar texto
  truncateText: (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // Generar ID único
  generateId: () => {
    return `_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Verificar si elemento está en viewport
  isInViewport: (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Scroll suave a elemento
  smoothScroll: (element) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  // Copiar al portapapeles
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Error al copiar:', err);
      return false;
    }
  },

  // Esperar (para promesas)
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Obtener parámetro de URL
  getUrlParam: (param) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  },

  // Establecer parámetro de URL
  setUrlParam: (param, value) => {
    const params = new URLSearchParams(window.location.search);
    params.set(param, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  },

  // Enviar mensaje por WhatsApp
  sendWhatsAppMessage: (product, variant = null) => {
    const phone = CONSTANTS.WHATSAPP.PHONE;
    const productName = product.name;
    
    // Si hay variante, usar sus datos
    const price = variant ? variant.price : product.price;
    const originalPrice = variant ? variant.originalPrice : product.originalPrice;
    const discount = product.discount;
    const sku = variant ? variant.sku : product.sku;
    
    // Información de variante
    let variantInfo = '';
    if (variant && variant.attributes) {
      const attrs = Object.entries(variant.attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      variantInfo = `\n🔄 Variante: ${attrs}`;
    }
    
    const colors = product.specs?.colors?.join(', ') || 'No especificado';
    
    // Construir URL de imagen correctamente para GitHub Pages
    let imageUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    imageUrl += variant && variant.images ? variant.images.cover : product.images.cover;
    // Limpiar dobles slashes
    imageUrl = imageUrl.replace(/([^:]\/)\/+/g, '$1');
    
    const priceFormatted = price.toLocaleString('es-AR');
    const originalPriceFormatted = originalPrice ? originalPrice.toLocaleString('es-AR') : priceFormatted;
    
    const message = `¡Hola! 👋\n\nMe interesa comprar:\n\n📦 *${productName}*${variantInfo}\n💰 Precio: $${priceFormatted}\n🏷️ Precio original: $${originalPriceFormatted}\n📉 Descuento: ${discount}%\n🔖 SKU: ${sku}\n🎨 Colores disponibles: ${colors}\n\n🖼️ Ver imagen: ${imageUrl}\n\n¿Cuál es el siguiente paso para comprar?`;
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  },
};
