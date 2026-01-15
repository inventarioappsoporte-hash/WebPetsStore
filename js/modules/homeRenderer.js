// Renderizador de Home
class HomeRenderer {
  static allProducts = []; // Guardar productos para acceso desde métodos estáticos

  constructor(dataLoader) {
    this.dataLoader = dataLoader;
  }

  async render() {
    try {
      console.log('🏠 HomeRenderer.render() - Starting...');
      
      // NO limpiar cache por ahora para debug
      // this.dataLoader.clearCache();
      console.log('🔄 Skipping cache clear for debug');
      
      const homeConfig = await this.dataLoader.getHomeConfig();
      const products = await this.dataLoader.getProducts();

      console.log('📋 Home config loaded:', !!homeConfig);
      console.log('📦 Products loaded:', !!products, products?.length);

      if (!homeConfig || !products) {
        console.error('❌ Error loading home data - homeConfig:', !!homeConfig, 'products:', !!products);
        return;
      }

      console.log('📦 Total products loaded:', products.length);
      
      // Guardar productos para acceso desde métodos estáticos
      HomeRenderer.allProducts = products;

      // Renderizar hero
      this.renderHero(homeConfig.hero, products);

      // Renderizar promos
      this.renderPromos(homeConfig.promos);

      // Renderizar secciones
      console.log('🔄 Starting to render sections...');
      for (const section of homeConfig.sections) {
        console.log(`🔄 Rendering section: ${section.id}`);
        await this.renderSection(section, products);
      }

      // Renderizar testimonios
      if (homeConfig.testimonials.show) {
        this.renderTestimonials(homeConfig.testimonials);
      }
      
      console.log('✅ HomeRenderer.render() - Completed');
    } catch (error) {
      console.error('❌ Error rendering home:', error);
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
    if (!container) {
      console.error(`❌ Container not found for section: ${section.id}`);
      return;
    }

    // Debug: Log para TOP DESCUENTOS
    if (section.id === 'top-discounts') {
      console.log('🔥 TOP DESCUENTOS - Total products:', products.length);
      console.log('🔥 TOP DESCUENTOS - Filter criteria:', section.filter);
      
      // Buscar específicamente nuestro producto
      const camaVictoria = products.find(p => p.id === 'prod_222');
      console.log('🔥 CAMA VICTORIA found:', camaVictoria);
      if (camaVictoria) {
        console.log('🔥 CAMA VICTORIA topDiscount:', camaVictoria.topDiscount);
        console.log('🔥 CAMA VICTORIA marketing image:', camaVictoria.images.marketing);
      }
      
      // Debug: Mostrar todos los productos con topDiscount
      const allTopDiscount = products.filter(p => p.topDiscount === true);
      console.log('🔥 ALL products with topDiscount:', allTopDiscount.length);
      console.log('🔥 ALL topDiscount names:', allTopDiscount.map(p => p.name));
    }

    // Filtrar productos
    let filtered = this.filterProducts(products, section.filter);

    // Debug: Log productos filtrados
    if (section.id === 'top-discounts') {
      console.log('🔥 TOP DESCUENTOS - Filtered products:', filtered.length);
      console.log('🔥 TOP DESCUENTOS - Filtered list:', filtered.map(p => p.name));
      
      if (filtered.length === 0) {
        console.error('❌ NO PRODUCTS FILTERED FOR TOP DESCUENTOS!');
        console.log('🔍 Debug filter function with CAMA VICTORIA...');
        const camaVictoria = products.find(p => p.id === 'prod_222');
        if (camaVictoria) {
          const testFilter = this.filterProducts([camaVictoria], section.filter);
          console.log('🧪 CAMA VICTORIA filter test result:', testFilter);
        }
      }
    }

    // Ordenar
    if (section.sortBy) {
      filtered = this.dataLoader.sortProducts(filtered, section.sortBy);
    }

    // Limitar
    const limited = filtered.slice(0, section.limit);

    if (limited.length === 0) {
      console.warn(`⚠️ No products found for section: ${section.id}`);
      container.style.display = 'none';
      return;
    }

    const contentClass = section.type === 'carousel' ? 'carousel' : 'grid';
    
    // Determinar si usar medios de marketing (para TOP DESCUENTOS y CON VIDEO)
    const useMarketingMedia = section.id === 'top-discounts' || section.id === 'with-video';
    
    const html = `
      <h2 class="section__title">${section.title}</h2>
      <div class="section__content ${contentClass}">
        ${limited.map(p => this.renderProductCard(p, section.showVideo, useMarketingMedia)).join('')}
      </div>
    `;

    container.innerHTML = html;
    container.classList.add(CONSTANTS.CLASSES.ANIMATE_FADE_IN);

    // Agregar event listeners a las tarjetas
    this.attachCardListeners(container);
  }

  renderProductCard(product, showVideo = false, useMarketingMedia = false) {
    const discount = product.discount ? `<span class="card__discount">-${product.discount}%</span>` : '';
    const video = showVideo && product.hasVideo ? `
      <div class="card__video-overlay">
        <button class="card__play-btn" onclick="event.stopPropagation()">▶</button>
      </div>
    ` : '';

    // Sistema dual de medios (imágenes + videos)
    let mediaHtml = '';
    let imageUrl = product.images.thumb; // Por defecto usar thumb
    
    if (useMarketingMedia && product.marketing) {
      if (product.marketing.type === 'video') {
        // Usar video de marketing
        mediaHtml = `
          <video 
            class="card__image card__marketing-video" 
            ${product.marketing.autoplay ? 'autoplay' : ''} 
            ${product.marketing.muted ? 'muted' : ''} 
            ${product.marketing.loop ? 'loop' : ''}
            poster="${product.marketing.poster}"
            preload="metadata"
            onloadstart="console.log('🎬 Video marketing cargando:', '${product.name}')"
            oncanplay="console.log('🎬 Video marketing listo:', '${product.name}')"
            onerror="console.error('❌ Error video marketing:', '${product.name}'); this.style.display='none'; this.nextElementSibling.style.display='block';"
          >
            <source src="${product.marketing.url}" type="video/mp4">
            Tu navegador no soporta videos.
          </video>
          <img 
            src="${product.marketing.poster}" 
            alt="${product.name}" 
            class="card__image card__marketing-fallback" 
            style="display: none;"
            loading="lazy"
          >
        `;
      } else if (product.marketing.type === 'image') {
        // Usar imagen de marketing
        imageUrl = product.marketing.url;
        mediaHtml = `<img src="${imageUrl}" alt="${product.name}" class="card__image" loading="lazy" onerror="this.src='assets/images/placeholder.svg'">`;
      }
    }
    
    // Fallback a imagen normal si no hay marketing media
    if (!mediaHtml) {
      mediaHtml = `<img src="${imageUrl}" alt="${product.name}" class="card__image" loading="lazy" onerror="this.src='assets/images/placeholder.svg'">`;
    }

    return `
      <div class="card" data-product-id="${product.id}" onclick="window.location.href='product.html?id=${product.id}'">
        <div class="card__image-wrapper">
          ${mediaHtml}
          ${video}
          ${discount}
          ${useMarketingMedia && product.marketing && product.marketing.type === 'video' ? `
            <div class="card__media-badge">🎬 VIDEO</div>
          ` : ''}
        </div>
        <div class="card__content">
          <h3 class="card__title">${product.name}</h3>
          <div class="card__rating">
            <span class="card__stars">⭐ ${product.rating}</span>
            <span class="card__reviews">(${product.reviews})</span>
          </div>
          <div class="card__price">
            <span class="card__price-current">${Utils.formatPrice(product.hasVariants ? product.basePrice : product.price)}</span>
            ${(product.hasVariants ? product.baseOriginalPrice : product.originalPrice) ? `<span class="card__price-original">${Utils.formatPrice(product.hasVariants ? product.baseOriginalPrice : product.originalPrice)}</span>` : ''}
          </div>
          <div class="card__actions">
            <button class="btn btn--small btn--primary" onclick="event.stopPropagation(); window.location.href='product.html?id=${product.id}'">VER PRODUCTO</button>
            <button class="btn btn--small btn--secondary add-to-cart-btn" data-product-id="${product.id}" onclick="event.stopPropagation()">🛒 AGREGAR</button>
          </div>
        </div>
      </div>
    `;
  }

  filterProducts(products, criteria) {
    console.log('🔍 filterProducts called with criteria:', criteria);
    console.log('🔍 filterProducts - products count:', products.length);
    
    const result = products.filter(p => {
      const matches = Object.keys(criteria).every(key => {
        const value = criteria[key];
        const productValue = p[key];
        
        console.log(`🔍 Checking ${p.name} - ${key}: ${productValue} === ${value} ?`, productValue === value);
        
        if (typeof value === 'object' && value.$gte) {
          return productValue >= value.$gte;
        }
        
        return productValue === value;
      });
      
      if (matches) {
        console.log(`✅ Product ${p.name} matches criteria`);
      }
      
      return matches;
    });
    
    console.log('🔍 filterProducts result count:', result.length);
    return result;
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

    // Agregar listeners a los botones de agregar al carrito
    const addToCartButtons = container.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const productId = button.getAttribute('data-product-id');
        await this.handleAddToCart(productId);
      });
    });
  }

  /**
   * Manejar agregar producto al carrito
   */
  async handleAddToCart(productId) {
    try {
      console.log('🛒 handleAddToCart called with productId:', productId);
      
      // Obtener el producto del array estático
      const product = HomeRenderer.allProducts.find(p => p.id === productId);
      
      if (!product) {
        console.error('❌ Producto no encontrado:', productId);
        alert('Producto no encontrado');
        return;
      }

      console.log('✅ Producto encontrado:', product.name);

      // Si tiene variantes, redirigir a página de producto
      if (product.hasVariants) {
        console.log('📦 Producto con variantes, redirigiendo...');
        window.location.href = `product.html?id=${product.id}`;
        return;
      }

      // Si no tiene variantes, agregar directamente
      console.log('➕ Agregando producto al carrito...');
      const success = Cart.addItem(product, 1, null);
      
      if (success) {
        console.log('✅ Producto agregado exitosamente');
        // Mostrar notificación
        if (typeof CartUI !== 'undefined' && CartUI.showAddedNotification) {
          CartUI.showAddedNotification(product.name);
        } else {
          alert(`✅ ${product.name} agregado al carrito`);
        }
      } else {
        console.error('❌ Error al agregar producto');
        alert('Error al agregar el producto al carrito');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar el producto al carrito');
    }
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
