// Renderizador de Home
class HomeRenderer {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
  }

  async render() {
    try {
      // Limpiar cache para asegurar datos frescos
      this.dataLoader.clearCache();
      console.log('🔄 Cache cleared - loading fresh data');
      
      const homeConfig = await this.dataLoader.getHomeConfig();
      const products = await this.dataLoader.getProducts();

      if (!homeConfig || !products) {
        console.error('Error loading home data');
        return;
      }

      console.log('📦 Total products loaded:', products.length);

      // Renderizar hero
      this.renderHero(homeConfig.hero, products);

      // Renderizar promos
      this.renderPromos(homeConfig.promos);

      // Renderizar secciones
      for (const section of homeConfig.sections) {
        await this.renderSection(section, products);
      }

      // Renderizar testimonios
      if (homeConfig.testimonials.show) {
        this.renderTestimonials(homeConfig.testimonials);
      }
    } catch (error) {
      console.error('Error rendering home:', error);
    }
  }

  renderHero(heroConfig, products) {
    // Hero image is static in HTML, don't modify it
    // Buttons already have IDs in HTML
    console.log('🎬 renderHero called - hero is static');
    return;
  }

  renderPromos(promos) {
    const container = document.querySelector(CONSTANTS.SELECTORS.PROMOS);
    if (!container) return;

    container.innerHTML = promos
      .map(promo => `
        <div class="promo-badge">
          <span class="promo-badge__icon">${promo.icon}</span>
          <span class="promo-badge__text">${promo.text}</span>
        </div>
      `)
      .join('');
  }

  async renderSection(section, products) {
    const container = document.querySelector(`[data-section="${section.id}"]`);
    if (!container) return;

    // Debug: Log para TOP DESCUENTOS
    if (section.id === 'top-discounts') {
      console.log('🔥 TOP DESCUENTOS - Total products:', products.length);
      console.log('🔥 TOP DESCUENTOS - Filter criteria:', section.filter);
      
      // Buscar específicamente nuestro producto
      const camaVictoria = products.find(p => p.id === 'prod_222');
      console.log('🔥 CAMA VICTORIA found:', camaVictoria);
      if (camaVictoria) {
        console.log('🔥 CAMA VICTORIA topDiscount:', camaVictoria.topDiscount);
      }
    }

    // Filtrar productos
    let filtered = this.filterProducts(products, section.filter);

    // Debug: Log productos filtrados
    if (section.id === 'top-discounts') {
      console.log('🔥 TOP DESCUENTOS - Filtered products:', filtered.length);
      console.log('🔥 TOP DESCUENTOS - Filtered list:', filtered.map(p => p.name));
    }

    // Ordenar
    if (section.sortBy) {
      filtered = this.dataLoader.sortProducts(filtered, section.sortBy);
    }

    // Limitar
    const limited = filtered.slice(0, section.limit);

    if (limited.length === 0) {
      container.style.display = 'none';
      return;
    }

    const contentClass = section.type === 'carousel' ? 'carousel' : 'grid';
    const html = `
      <h2 class="section__title">${section.title}</h2>
      <div class="section__content ${contentClass}">
        ${limited.map(p => this.renderProductCard(p, section.showVideo)).join('')}
      </div>
    `;

    container.innerHTML = html;
    container.classList.add(CONSTANTS.CLASSES.ANIMATE_FADE_IN);

    // Agregar event listeners a las tarjetas
    this.attachCardListeners(container);
  }

  renderProductCard(product, showVideo = false) {
    const discount = product.discount ? `<span class="card__discount">-${product.discount}%</span>` : '';
    const video = showVideo && product.hasVideo ? `
      <div class="card__video-overlay">
        <button class="card__play-btn" onclick="event.stopPropagation()">▶</button>
      </div>
    ` : '';

    return `
      <div class="card" data-product-id="${product.id}" onclick="window.location.href='product.html?id=${product.id}'">
        <div class="card__image-wrapper">
          <img src="${product.images.thumb}" alt="${product.name}" class="card__image" loading="lazy">
          ${video}
          ${discount}
        </div>
        <div class="card__content">
          <h3 class="card__title">${product.name}</h3>
          <div class="card__rating">
            <span class="card__stars">⭐ ${product.rating}</span>
            <span class="card__reviews">(${product.reviews})</span>
          </div>
          <div class="card__price">
            <span class="card__price-current">${Utils.formatPrice(product.price)}</span>
            ${product.originalPrice ? `<span class="card__price-original">${Utils.formatPrice(product.originalPrice)}</span>` : ''}
          </div>
          <button class="btn btn--small btn--primary" onclick="event.stopPropagation()">Ver Producto</button>
        </div>
      </div>
    `;
  }

  filterProducts(products, criteria) {
    return products.filter(p => {
      return Object.keys(criteria).every(key => {
        const value = criteria[key];
        
        if (typeof value === 'object' && value.$gte) {
          return p[key] >= value.$gte;
        }
        
        return p[key] === value;
      });
    });
  }

  attachCardListeners(container) {
    const cards = container.querySelectorAll(CONSTANTS.SELECTORS.CARDS);
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const video = card.querySelector('video');
        if (video) video.play();
      });
      
      card.addEventListener('mouseleave', () => {
        const video = card.querySelector('video');
        if (video) video.pause();
      });
    });
  }

  renderTestimonials(config) {
    const container = document.querySelector('.testimonials');
    if (!container) return;

    container.innerHTML = `
      <h2 class="testimonials__title">${config.title}</h2>
      <p class="testimonials__subtitle">${config.subtitle}</p>
    `;
  }
}
