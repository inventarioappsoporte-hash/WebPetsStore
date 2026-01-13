// Página de producto
class ProductPage {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.init();
  }

  async init() {
    const productId = Utils.getUrlParam('id');
    
    if (!productId) {
      this.showError('Producto no encontrado');
      return;
    }

    const product = await this.dataLoader.getProductById(productId);
    
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
            <img src="${product.images.cover}" alt="${product.name}" class="product__main-image">
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
              <span class="product__price-current">${Utils.formatPrice(product.price)}</span>
              ${product.originalPrice ? `
                <span class="product__price-original">${Utils.formatPrice(product.originalPrice)}</span>
                <span class="product__savings">Ahorras ${Utils.formatPrice(product.originalPrice - product.price)}</span>
              ` : ''}
            </div>
          </div>

          <p class="product__description">${product.longDescription}</p>

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

          <div class="product__stock">
            <p class="product__stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
              ${product.stock > 0 ? `✅ ${product.stock} en stock` : '❌ Agotado'}
            </p>
          </div>

          <div class="product__actions">
            <button class="btn btn--primary btn--large" onclick="Utils.sendWhatsAppMessage(window.currentProduct)" ${product.stock === 0 ? 'disabled' : ''}>
              ${product.stock > 0 ? '💬 COMPRAR POR WHATSAPP' : 'AGOTADO'}
            </button>
            <button class="btn btn--secondary btn--large">
              ❤️ AGREGAR A FAVORITOS
            </button>
          </div>

          <div class="product__badge">
            ${product.badge}
          </div>
        </div>
      </div>
    `;
  }

  formatLabel(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
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
}

// Inicializar página de producto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ProductPage(dataLoader));
} else {
  new ProductPage(dataLoader);
}
