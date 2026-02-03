// Página de producto
class ProductPage {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.isPreviewMode = false;
    this.wholesaleConfig = null;
    this.init();
  }

  async init() {
    const productId = Utils.getUrlParam('id');
    const previewMode = Utils.getUrlParam('preview');
    
    console.log('🔍 ProductPage - Looking for product ID:', productId);
    console.log('👁️ ProductPage - Preview mode:', previewMode);
    
    if (!productId) {
      this.showError('Producto no encontrado');
      return;
    }

    // Detectar si estamos en modo preview (viene del admin)
    this.isPreviewMode = previewMode === 'true' || previewMode === '1';
    
    // Cargar configuración mayorista
    await this.loadWholesaleConfig();
    
    let product = null;
    
    if (this.isPreviewMode) {
      // En modo preview, cargar desde la API del admin
      console.log('📡 ProductPage - Loading from admin API (preview mode)');
      product = await this.loadFromAdminAPI(productId);
    } else {
      // Modo normal: cargar desde JSON
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

      product = await this.dataLoader.getProductById(productId);
    }
    
    console.log('🎯 ProductPage - Found product:', product);
    
    if (!product) {
      this.showError('Producto no encontrado');
      return;
    }

    // Actualizar SEO dinámicamente
    this.updateSEO(product);
    
    this.render(product);
  }

  /**
   * Carga la configuración mayorista
   */
  async loadWholesaleConfig() {
    try {
      const config = await this.dataLoader.getWholesaleConfig();
      this.wholesaleConfig = config;
      window.wholesaleConfig = config; // Para acceso global
      console.log('💰 Wholesale config loaded:', config);
    } catch (error) {
      console.error('Error loading wholesale config:', error);
      this.wholesaleConfig = { enabled: false, min_amount: 50000, min_items: 5 };
    }
  }

  /**
   * Genera el texto de condiciones mayoristas según la configuración
   */
  getWholesaleConditionText() {
    const config = this.wholesaleConfig || { min_amount: 50000, min_items: 5, condition_mode: 'any' };
    const minItems = config.min_items || 5;
    const minAmount = config.min_amount || 50000;
    const mode = config.condition_mode || 'any';
    
    const itemsText = `+${minItems} artículos`;
    const amountText = `+${Utils.formatPrice(minAmount)}`;
    
    if (mode === 'items') {
      return `Comprando ${itemsText}`;
    } else if (mode === 'amount') {
      return `Comprando ${amountText}`;
    } else {
      // mode === 'any' o 'both'
      const connector = mode === 'both' ? 'y' : 'o';
      return `Comprando ${itemsText} ${connector} ${amountText}`;
    }
  }

  /**
   * Carga el producto desde la API del admin (modo preview)
   */
  async loadFromAdminAPI(productId) {
    try {
      // Intentar cargar desde el admin server (puerto 3000)
      const adminUrl = `/api/productos/${productId}/preview`;
      console.log('📡 Fetching from:', adminUrl);
      
      const response = await fetch(adminUrl);
      
      if (!response.ok) {
        console.error('❌ Error loading from admin API:', response.status);
        return null;
      }
      
      const product = await response.json();
      console.log('✅ Product loaded from admin API:', product);
      console.log('📊 priceDisplayMode:', product.priceDisplayMode);
      console.log('💰 price:', product.price);
      console.log('💰 originalPrice:', product.originalPrice);
      return product;
    } catch (error) {
      console.error('❌ Error connecting to admin API:', error);
      // Si falla la conexión al admin, mostrar mensaje
      this.showPreviewError();
      return null;
    }
  }

  /**
   * Muestra error específico de preview
   */
  showPreviewError() {
    const container = document.getElementById('product-container');
    container.innerHTML = `
      <div class="product__error">
        <h2>⚠️ Error de Vista Previa</h2>
        <p>No se pudo conectar con el servidor del admin.</p>
        <p>Asegúrate de que el servidor esté corriendo en el puerto 3000.</p>
        <a href="index.html" class="btn btn--primary">Volver al inicio</a>
      </div>
    `;
  }

  // Actualizar meta tags para SEO
  updateSEO(product) {
    const baseUrl = 'https://pets-store-arg.com';
    const productUrl = `${baseUrl}/product.html?id=${product.id}`;
    const imageUrl = product.images?.cover ? `${baseUrl}/${product.images.cover}` : `${baseUrl}/assets/images/ui/og-image.jpg`;
    
    // Título
    document.title = `${product.name} | Pets Store Argentina`;
    
    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = product.description || `${product.name} - Producto de calidad para tu mascota. Envío gratis en CABA desde $30.000.`;
    }
    
    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.href = productUrl;
    }
    
    // Open Graph
    this.updateMetaTag('og:title', `${product.name} | Pets Store Argentina`);
    this.updateMetaTag('og:description', product.description || product.longDescription);
    this.updateMetaTag('og:image', imageUrl);
    this.updateMetaTag('og:url', productUrl);
    this.updateMetaTag('og:price:amount', product.price);
    this.updateMetaTag('og:price:currency', 'ARS');
    
    // Schema.org Product (JSON-LD)
    this.addProductSchema(product, productUrl, imageUrl);
  }
  
  updateMetaTag(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  }
  
  addProductSchema(product, productUrl, imageUrl) {
    // Remover schema anterior si existe
    const existingSchema = document.getElementById('product-schema');
    if (existingSchema) existingSchema.remove();
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.longDescription || product.description,
      "image": imageUrl,
      "url": productUrl,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "Pets Store"
      },
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "ARS",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Pets Store Argentina"
        }
      }
    };
    
    if (product.rating) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviews || 1
      };
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'product-schema';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  render(product) {
    const container = document.getElementById('product-container');
    
    // Guardar producto en variable global para acceso desde botones
    window.currentProduct = product;
    
    // Determinar si el producto tiene variantes
    const hasVariants = product.hasVariants && product.variants;
    
    // Si tiene variantes, usar el precio base (con fallback a price/originalPrice)
    const displayPrice = hasVariants ? (product.basePrice || product.price) : product.price;
    const displayOriginalPrice = hasVariants ? (product.baseOriginalPrice || product.originalPrice) : product.originalPrice;
    
    // Determinar modo de visualización de precios
    const priceDisplayMode = product.priceDisplayMode || 'discount';
    
    // Verificar si tiene descuento real (originalPrice > price)
    const hasDiscount = displayOriginalPrice && displayOriginalPrice > displayPrice;
    
    // DEBUG: Log de precios
    console.log('🎨 RENDER - priceDisplayMode:', priceDisplayMode);
    console.log('🎨 RENDER - displayPrice:', displayPrice);
    console.log('🎨 RENDER - displayOriginalPrice:', displayOriginalPrice);
    console.log('🎨 RENDER - hasDiscount:', hasDiscount);
    console.log('🎨 RENDER - Condición wholesale:', priceDisplayMode === 'wholesale' && hasDiscount);
    
    // Banner de preview deshabilitado
    const previewBanner = '';
    
    // Solo mostrar badge de descuento en modo 'discount' y si tiene descuento real
    const discount = product.discount && priceDisplayMode !== 'wholesale' && hasDiscount ? `<span class="product__discount-badge">-${product.discount}%</span>` : '';
    
    // Video de marketing solo se muestra en la portada, no en la página de producto

    const specsHtml = Object.entries(product.specs || {})
      .map(([key, value]) => `
        <div class="product__spec">
          <span class="product__spec-label">${this.formatLabel(key)}:</span>
          <span class="product__spec-value">${Array.isArray(value) ? value.join(', ') : value}</span>
        </div>
      `)
      .join('');

    // Para productos con variantes, no renderizar miniaturas aquí
    // El VariantSelector se encargará de eso
    let thumbnailsHtml = '';
    
    // Usar getImageUrl para obtener rutas correctas según el contexto
    const coverUrl = window.getImageUrl ? window.getImageUrl(product.images.cover) : product.images.cover;
    const placeholderUrl = window.getImageUrl ? window.getImageUrl('assets/images/placeholder.svg') : 'assets/images/placeholder.svg';
    
    if (!hasVariants) {
      const galleryHtml = product.images.gallery
        .map((img, idx) => {
          const imgUrl = window.getImageUrl ? window.getImageUrl(img) : img;
          return `
          <img 
            src="${imgUrl}" 
            alt="${product.name} - Imagen ${idx + 1}" 
            class="product__gallery-img"
            onclick="document.querySelector('.product__main-image').src = this.src"
            onerror="this.src='${placeholderUrl}'"
          >
        `;
        })
        .join('');

      // Agregar imagen cover al inicio de la galería para que también sea clickeable
      const coverThumbHtml = `
        <img 
          src="${coverUrl}" 
          alt="${product.name} - Principal" 
          class="product__gallery-img product__gallery-img--active"
          onclick="document.querySelector('.product__main-image').src = this.src"
          onerror="this.src='${placeholderUrl}'"
        >
      `;
      
      thumbnailsHtml = coverThumbHtml + galleryHtml;
    }

    container.innerHTML = `
      ${previewBanner}
      <div class="product__breadcrumb">
        <a href="index.html">Home</a> / 
        ${product.category ? `<a href="search.html?q=${product.category}">${product.category}</a> / ` : ''}
        <span>${product.name}</span>
      </div>

      <div class="product__content">
        <div class="product__gallery">
          <div class="product__main">
            ${discount}
            <img src="${coverUrl}" alt="${product.name}" class="product__main-image product__image-main" onerror="this.src='${placeholderUrl}'">
          </div>
          <div class="product__thumbnails">
            ${thumbnailsHtml}
          </div>
        </div>

        <div class="product__info">
          <h1 class="product__title">${product.name}</h1>
          
          <div class="product__rating">
            <span class="product__stars">⭐ ${product.rating}</span>
            <span class="product__reviews">${product.reviews} reseñas</span>
          </div>

          <div class="product__price-section">
            ${priceDisplayMode === 'wholesale' && hasDiscount ? `
              <div class="product__price product__price--wholesale-compact">
                <div class="product__price-comparison">
                  <div class="product__price-item product__price-item--list">
                    <span class="product__price-value product__price-list-value">${Utils.formatPrice(displayOriginalPrice)}</span>
                    <span class="product__price-label">Lista</span>
                  </div>
                  <span class="product__price-arrow">→</span>
                  <div class="product__price-item product__price-item--wholesale">
                    <span class="product__price-value product__price-wholesale-value">${Utils.formatPrice(displayPrice)}</span>
                    <span class="product__price-label">Mayorista</span>
                  </div>
                </div>
                <div class="product__wholesale-footer">
                  <span class="product__savings">✅ Ahorras ${Utils.formatPrice(displayOriginalPrice - displayPrice)}</span>
                  <span class="product__wholesale-separator">|</span>
                  <span class="product__wholesale-conditions">💡 ${this.getWholesaleConditionText()}</span>
                </div>
              </div>
            ` : priceDisplayMode === 'wholesale' && !hasDiscount ? `
              <div class="product__price">
                <span class="product__price-current">${Utils.formatPrice(displayPrice)}</span>
              </div>
            ` : `
              <div class="product__price">
                <span class="product__price-current">${Utils.formatPrice(displayPrice)}</span>
                ${hasDiscount ? `
                  <span class="product__price-original">${Utils.formatPrice(displayOriginalPrice)}</span>
                  <span class="product__savings">Ahorras ${Utils.formatPrice(displayOriginalPrice - displayPrice)}</span>
                ` : ''}
              </div>
            `}
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
            <button class="btn btn--secondary btn--large btn--buy-now" onclick="ProductPage.buyNow()" ${!hasVariants && product.stock === 0 ? 'disabled' : ''}>
              ${!hasVariants && product.stock === 0 ? 'AGOTADO' : '⚡ COMPRAR AHORA'}
            </button>
          </div>

          ${product.badge ? `<div class="product__badge">${product.badge}</div>` : ''}
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

  /**
   * Comprar ahora - Agrega al carrito y lo abre
   */
  static buyNow() {
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
      // Abrir el carrito directamente
      CartUI.open();
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
