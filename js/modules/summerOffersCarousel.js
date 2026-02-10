// Carrusel de Ofertas de Verano - Version simplificada
class SummerOffersCarousel {
  constructor() {
    this.container = null;
    this.track = null;
    this.products = [];
    this.autoplayInterval = null;
    this.autoplayDelay = 3500;
    this.isHovered = false;
    this.scrollAmount = 220;
  }

  async init() {
    this.container = document.querySelector('.summer-offers');
    if (!this.container) {
      return;
    }

    try {
      const response = await fetch('data/products.json');
      const allProducts = await response.json();
      
      this.products = this.filterSummerProducts(allProducts);
      
      if (this.products.length === 0) {
        this.container.style.display = 'none';
        return;
      }

      this.render();
      this.setupEvents();
      this.startAutoplay();
      
    } catch (error) {
      console.error('❌ Error loading summer offers:', error);
    }
  }

  filterSummerProducts(products) {
    const filtered = products.filter(p => {
      const isRopa = p.category === 'ropa' || p.subcategory === 'Ropa';
      const hasVeranoTag = p.tags && p.tags.includes('verano');
      const hasDiscount = p.discount && p.discount > 0;
      const hasStock = p.stock > 0;
      return isRopa && hasVeranoTag && hasDiscount && hasStock;
    });
    
    return filtered
      .sort((a, b) => (b.discount || 0) - (a.discount || 0))
      .slice(0, 15);
  }

  render() {
    const html = `
      <div class="summer-offers__header">
        <h2 class="summer-offers__title">OFERTAS DE VERANO ☀️ PARA TU MASCOTA</h2>
        <p class="summer-offers__subtitle">Ropa fresca y comoda con descuentos por tiempo limitado</p>
      </div>
      <div class="summer-offers__video-container">
        <video 
          class="summer-offers__video" 
          autoplay 
          muted 
          loop 
          playsinline
          poster="assets/images/products/prod_448/cover.jpg"
        >
          <source src="assets/videos/marketing/verano.mp4" type="video/mp4">
        </video>
      </div>
      <div class="summer-offers__wrapper">
        <button class="summer-nav summer-nav--prev">‹</button>
        <div class="summer-offers__track-container">
          <div class="summer-offers__track">
            ${this.products.map(p => this.renderCard(p)).join('')}
          </div>
        </div>
        <button class="summer-nav summer-nav--next">›</button>
      </div>
    `;
    
    this.container.innerHTML = html;
    this.track = this.container.querySelector('.summer-offers__track');
  }

  renderCard(product) {
    const price = product.price || product.basePrice || 0;
    const originalPrice = product.originalPrice || product.baseOriginalPrice || price;
    const imageUrl = product.images?.cover || product.images?.thumb || 'assets/images/placeholder.svg';
    const shortName = product.name.length > 22 ? product.name.substring(0, 20) + '...' : product.name;
    
    // Verificar modo de precio y si tiene descuento real
    const priceDisplayMode = product.priceDisplayMode || 'discount';
    const hasDiscount = originalPrice && originalPrice > price;
    const isWholesaleMode = priceDisplayMode === 'wholesale' && hasDiscount;
    
    let pricesHtml = '';
    let badgeHtml = '';
    
    if (isWholesaleMode) {
      // Modo mayorista: Lista -> Mayorista con badge "OFERTA"
      pricesHtml = `
        <div class="summer-card__prices summer-card__prices--wholesale">
          <div class="summer-card__price-item">
            <span class="summer-card__price-value">$${originalPrice.toLocaleString('es-AR')}</span>
            <span class="summer-card__price-label">Lista</span>
          </div>
          <span class="summer-card__price-arrow">→</span>
          <div class="summer-card__price-item">
            <span class="summer-card__price-value summer-card__price-value--wholesale">$${price.toLocaleString('es-AR')}</span>
            <span class="summer-card__price-label">Mayorista</span>
          </div>
        </div>
      `;
      badgeHtml = `<span class="summer-card__badge summer-card__badge--oferta">☀️ OFERTA</span>`;
    } else {
      // Modo descuento: precio tachado + badge
      pricesHtml = `
        <div class="summer-card__prices">
          <span class="summer-card__old">$${originalPrice.toLocaleString('es-AR')}</span>
          <span class="summer-card__new">$${price.toLocaleString('es-AR')}</span>
        </div>
      `;
      badgeHtml = `<span class="summer-card__badge">🔥 ${product.discount}% OFF</span>`;
    }
    
    return `
      <a href="product.html?id=${product.id}" class="summer-card">
        <div class="summer-card__img">
          <img src="${imageUrl}" alt="${product.name}" loading="lazy" onerror="this.src='assets/images/placeholder.svg'">
          ${badgeHtml}
        </div>
        <div class="summer-card__info">
          <p class="summer-card__name">${shortName}</p>
          ${pricesHtml}
        </div>
      </a>
    `;
  }

  setupEvents() {
    const prevBtn = this.container.querySelector('.summer-nav--prev');
    const nextBtn = this.container.querySelector('.summer-nav--next');
    const trackContainer = this.container.querySelector('.summer-offers__track-container');
    
    prevBtn?.addEventListener('click', () => this.scroll(-1));
    nextBtn?.addEventListener('click', () => this.scroll(1));
    
    trackContainer?.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.stopAutoplay();
    });
    
    trackContainer?.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.startAutoplay();
    });

    let startX = 0;
    trackContainer?.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      this.stopAutoplay();
    }, { passive: true });
    
    trackContainer?.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        this.scroll(diff > 0 ? 1 : -1);
      }
      if (!this.isHovered) this.startAutoplay();
    }, { passive: true });
  }

  scroll(direction) {
    if (!this.track) return;
    const container = this.track.parentElement;
    const scrollAmount = this.scrollAmount * 2 * direction;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  startAutoplay() {
    if (this.autoplayInterval) return;
    this.autoplayInterval = setInterval(() => {
      if (!this.isHovered && this.track) {
        const container = this.track.parentElement;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (container.scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: this.scrollAmount, behavior: 'smooth' });
        }
      }
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const carousel = new SummerOffersCarousel();
  carousel.init();
});
