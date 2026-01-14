// Página de producto
class ProductPage {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.init();
  }

  async init() {
    const productId = Utils.getUrlParam('id');
    console.log('🔍 ProductPage - Looking for product ID:', productId);
    
    if (!productId) {
      this.showError('Producto no encontrado');
      return;
    }

    // Limpiar cache para asegurar datos frescos
    this.dataLoader.clearCache();
    console.log('🔄 ProductPage - Cache cleared');

    const products = await this.dataLoader.getProducts();
    console.log('📦 ProductPage - Total products loaded:', products?.length);
    
    if (products) {
      const productIds = products.map(p => p.id);
      console.log('🆔 ProductPage - Available product IDs:', productIds);
      console.log('🔍 ProductPage - Looking for:', productId);
      console.log('✅ ProductPage - Product exists:', productIds.includes(productId));
    }

    const product = await this.dataLoader.getProductById(productId);
    console.log('🎯 ProductPage - Found product:', product);
    
    if (!product) {
      this.showError('Producto no encontrado');
      return;
    }

    this.render(product);
  }

  render(product) {
    const container = document.getElementById('product-container');
    
    // Guardar producto en variable global para acceso desde botones
    window.currentProduct = product;
    
    // Determinar si el producto tiene variantes
    const hasVariants = product.hasVariants && product.variants;
    
    // Si tiene variantes, usar el precio base
    const displayPrice = hasVariants ? product.basePrice : product.price;
    const displayOriginalPrice = hasVariants ? product.baseOriginalPrice : product.originalPrice;
    
    const discount = product.discount ? `<span class="product__discount-badge">-${product.discount}%</span>` : '';
    const video = product.hasVideo ? `
      <div class="product__video-section">
        <video 
          class="product__video" 
          controls 
          muted
          src="${product.video.url}">
        </video>
      </div>
    ` : '';

    const specsHtml = Object.entries(product.specs || {})
      .map(([key, value]) => `
        <div class="product__spec">
          <span class="product__spec-label">${this.formatLabel(key)}:</span>
          <span class="product__spec-value">${Array.isArray(value) ? value.join(', ') : value}</span>
        </div>
      `)
      .join('');

    const galleryHtml = product.images.gallery
      .map((img, idx) => `
        <img 
          src="${img}" 
          alt="Imagen ${idx + 1}" 
          class="product__gallery-img"
          onclick="document.querySelector('.product__main-image').src = this.src"
        >
      `)
      .join('');

    container.innerHTML = `
      <div class="product__breadcrumb">
        <a href="index.html">Home</a> / 
        <a href="search.html?q=${product.category}">${product.category}</a> / 
        <span>${product.name}</span>
      </div>

      <div class="product__content">
        <div class="product__gallery">
          <div class="product__main">
            ${discount}
            <img src="${product.images.cover}" alt="${product.name}" class="product__main-image product__image-main">
            ${video}
          </div>
          <div class="product__thumbnails">
            ${galleryHtml}
          </div>
        </div>

        <div class="product__info">
          <h1 class="product__title">${product.name}</h1>
          
          <div class="product__rating">
            <span class="product__stars">⭐ ${product.rating}</span>
            <span class="product__reviews">${product.reviews} reseñas</span>
          </div>

          <div class="product__price-section">
            <div class="product__price">
              <span class="product__price-current">${Utils.formatPrice(displayPrice)}</span>
              ${displayOriginalPrice ? `
                <span class="product__price-original">${Utils.formatPrice(displayOriginalPrice)}</span>
                <span class="product__savings">Ahorras ${Utils.formatPrice(displayOriginalPrice - displayPrice)}</span>
              ` : ''}
            </div>
          </div>

          <p class="product__description">${product.longDescription}</p>

          ${hasVariants ? '<div id="variant-selector-container"></div>' : ''}

          <div class="product__specs">
            <h3>Especificaciones</h3>
            ${specsHtml}
          </div>

          <div class="product__shipping">
            <h3>Envío</h3>
            <p>
              ${product.shipping.free ? '✅ Envío gratis' : '📦 Envío disponible'} 
              - Entrega en ${product.shipping.days} días
            </p>
          </div>

          ${!hasVariants ? `
          <div class="product__stock">
            <p class="product__stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
              ${product.stock > 0 ? `✅ ${product.stock} en stock` : '❌ Agotado'}
            </p>
          </div>
          ` : ''}

          <div class="product__actions">
            <button class="btn btn--primary btn--large btn--add-to-cart" onclick="ProductPage.addToCart()" ${!hasVariants && product.stock === 0 ? 'disabled' : ''}>
              ${!hasVariants && product.stock === 0 ? 'AGOTADO' : '🛒 AGREGAR AL CARRITO'}
            </button>
            <button class="btn btn--secondary btn--large btn--buy-now" onclick="Utils.sendWhatsAppMessage(window.currentProduct, window.currentVariant)" ${!hasVariants && product.stock === 0 ? 'disabled' : ''}>
              ${!hasVariants && product.stock === 0 ? 'AGOTADO' : '⚡ COMPRAR AHORA'}
            </button>
          </div>

          <div class="product__badge">
            ${product.badge}
          </div>
        </div>
      </div>
    `;
    
    // Si el producto tiene variantes, inicializar el selector
    if (hasVariants) {
      this.initVariantSelector(product);
    }
  }

  formatLabel(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
  
  initVariantSelector(product) {
    // Esperar a que el DOM esté listo
    setTimeout(() => {
      if (typeof VariantSelector !== 'undefined') {
        const selector = new VariantSelector(product, 'variant-selector-container');
        
        // Guardar la variante seleccionada globalmente
        window.currentVariant = selector.getSelectedVariant();
        
        // Escuchar cambios de variante
        document.addEventListener('variantChanged', (e) => {
          window.currentVariant = e.detail.variant;
          console.log('Variante seleccionada:', window.currentVariant);
        });
      } else {
        console.error('VariantSelector no está disponible');
      }
    }, 100);
  }

  showError(message) {
    const container = document.getElementById('product-container');
    container.innerHTML = `
      <div class="product__error">
        <h2>${message}</h2>
        <p>El producto que buscas no existe o ha sido eliminado.</p>
        <a href="index.html" class="btn btn--primary">Volver al inicio</a>
      </div>
    `;
  }

  /**
   * Agregar producto al carrito
   */
  static addToCart() {
    const product = window.currentProduct;
    const variant = window.currentVariant;

    if (!product) {
      alert('Error: Producto no encontrado');
      return;
    }

    // Validar variante si el producto tiene variantes
    if (product.hasVariants && !variant) {
      alert('Por favor selecciona una variante');
      return;
    }

    // Validar stock
    if (!product.hasVariants && product.stock === 0) {
      alert('Producto agotado');
      return;
    }

    // Agregar al carrito
    const success = Cart.addItem(product, 1, variant);
    
    if (success) {
      CartUI.showAddedNotification(product.name);
    } else {
      alert('Error al agregar el producto al carrito');
    }
  }
}

// Inicializar página de producto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ProductPage(dataLoader));
} else {
  new ProductPage(dataLoader);
}
