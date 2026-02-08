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
      this.renderPromos(homeConfig.promos, homeConfig.promosConfig);

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
    const heroSection = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero__image');
    
    // Determinar qué imagen usar según el tamaño de pantalla
    const isMobile = window.innerWidth <= 768;
    const imageToUse = (isMobile && heroConfig.imageMobile) ? heroConfig.imageMobile : heroConfig.image;
    const fallbackImage = heroConfig.image; // Siempre usar desktop como fallback
    
    console.log('🎬 renderHero - isMobile:', isMobile, 'imageToUse:', imageToUse, 'fallback:', fallbackImage);
    
    // Actualizar imagen del hero si está configurada
    if (heroImage && imageToUse) {
      // Precargar la imagen antes de mostrarla para evitar flash
      const newImage = new Image();
      newImage.onload = () => {
        console.log('✅ Hero image loaded:', imageToUse);
        heroImage.src = imageToUse;
        heroImage.alt = heroConfig.title || 'Producto destacado';
        // Mostrar el hero una vez cargada la imagen
        if (heroSection) heroSection.style.opacity = '1';
      };
      newImage.onerror = () => {
        console.log('❌ Hero image failed:', imageToUse, '- trying fallback:', fallbackImage);
        // Si falla la imagen móvil, intentar con la desktop
        if (imageToUse !== fallbackImage && fallbackImage) {
          heroImage.src = fallbackImage;
        }
        // Mostrar el hero de todos modos
        if (heroSection) heroSection.style.opacity = '1';
      };
      newImage.src = imageToUse;
    } else {
      console.log('⚠️ No hero image configured');
      // Si no hay imagen configurada, mostrar el hero con la imagen por defecto
      if (heroSection) heroSection.style.opacity = '1';
    }
    
    // Escuchar cambios de tamaño de ventana para cambiar imagen
    if (heroConfig.imageMobile && heroConfig.image) {
      let currentIsMobile = isMobile;
      window.addEventListener('resize', () => {
        const nowMobile = window.innerWidth <= 768;
        if (nowMobile !== currentIsMobile && heroImage) {
          currentIsMobile = nowMobile;
          const newSrc = nowMobile ? heroConfig.imageMobile : heroConfig.image;
          console.log('📱 Resize detected - switching to:', newSrc);
          if (newSrc) heroImage.src = newSrc;
        }
      });
    }
    
    // Actualizar título si existe el elemento
    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle && heroConfig.title) {
      heroTitle.textContent = heroConfig.title;
    }
    
    // Ocultar/mostrar botones según configuración
    const heroCta = document.querySelector('.hero__cta--desktop');
    const heroCtaMobile = document.querySelector('.hero__cta-mobile');
    
    if (heroConfig.hideButtons) {
      // Ocultar botones
      if (heroCta) heroCta.style.display = 'none';
      if (heroCtaMobile) heroCtaMobile.style.display = 'none';
      console.log('🎬 renderHero - Botones ocultos por configuración');
    } else {
      // Mostrar botones
      if (heroCta) heroCta.style.display = '';
      if (heroCtaMobile) heroCtaMobile.style.display = '';
      
      // Configurar botones del hero
      const productId = heroConfig.productId;
      if (productId) {
        const productUrl = `product.html?id=${productId}`;
        
        // Botones desktop
        const viewBtn = document.getElementById('hero-view-btn');
        const buyBtn = document.getElementById('hero-buy-btn');
        // Botones mobile
        const viewBtnMobile = document.getElementById('hero-view-btn-mobile');
        const buyBtnMobile = document.getElementById('hero-buy-btn-mobile');
        
        if (viewBtn) {
          viewBtn.textContent = heroConfig.ctaSecondary || 'VER PRODUCTO';
          viewBtn.onclick = () => window.location.href = productUrl;
        }
        if (buyBtn) {
          buyBtn.textContent = heroConfig.cta || 'COMPRAR AHORA';
          buyBtn.onclick = () => window.location.href = productUrl;
        }
        if (viewBtnMobile) {
          viewBtnMobile.textContent = heroConfig.ctaSecondary || 'VER PRODUCTO';
          viewBtnMobile.onclick = () => window.location.href = productUrl;
        }
        if (buyBtnMobile) {
          buyBtnMobile.textContent = heroConfig.cta || 'COMPRAR AHORA';
          buyBtnMobile.onclick = () => window.location.href = productUrl;
        }
      }
    }
    
    console.log('🎬 renderHero - image:', heroConfig.image, 'imageMobile:', heroConfig.imageMobile, 'using:', imageToUse, 'productId:', heroConfig.productId, 'hideButtons:', heroConfig.hideButtons);
  }

  renderPromos(promos, promosConfig) {
    const container = document.querySelector(CONSTANTS.SELECTORS.PROMOS);
    if (!container) return;
    
    // Obtener la sección padre (.promos)
    const promosSection = container.closest('section.promos');

    // Verificar si la sección debe mostrarse
    if (promosConfig && promosConfig.show === false) {
      if (promosSection) promosSection.style.display = 'none';
      console.log('🏷️ Sección de promos oculta por configuración');
      return;
    }
    
    // Filtrar solo promos visibles
    const visiblePromos = promos.filter(promo => promo.visible !== false);
    
    if (visiblePromos.length === 0) {
      if (promosSection) promosSection.style.display = 'none';
      console.log('🏷️ Sección de promos oculta (ninguna promo visible)');
      return;
    }
    
    // Asegurar que la sección esté visible
    if (promosSection) promosSection.style.display = '';

    container.innerHTML = visiblePromos
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
    
    // Ordenamiento especial para TOP DESCUENTOS: 
    // Primero por descuento (mayor a menor), luego por tipo de marketing (video > imagen > sin marketing)
    if (section.id === 'top-discounts') {
      filtered = this.sortByDiscountAndMarketing(filtered);
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
    
    // Aplicar indicadores de stock desde Firebase
    if (typeof FirebaseStock !== 'undefined' && FirebaseStock.initialized) {
      FirebaseStock.applyStockIndicators();
    }
  }

  renderProductCard(product, showVideo = false, useMarketingMedia = false) {
    const discount = product.discount && product.priceDisplayMode !== 'wholesale' ? `<span class="card__discount">-${product.discount}%</span>` : '';
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
            autoplay
            muted
            loop
            playsinline
            poster="${product.marketing.poster}"
            preload="auto"
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

    // Determinar precios según modo de visualización
    const displayPrice = product.hasVariants 
      ? (product.basePrice || product.price) 
      : product.price;
    const displayOriginalPrice = product.hasVariants 
      ? (product.baseOriginalPrice || product.originalPrice) 
      : product.originalPrice;
    const priceDisplayMode = product.priceDisplayMode || 'discount';
    
    // Generar HTML de precios según el modo
    // Verificar si tiene descuento real (originalPrice > price)
    const hasDiscount = displayOriginalPrice && displayOriginalPrice > displayPrice;
    
    let priceHtml = '';
    if (priceDisplayMode === 'wholesale' && hasDiscount) {
      // Modo Mayorista CON descuento: mostrar Precio Lista y Precio Mayorista
      priceHtml = `
        <div class="card__price card__price--wholesale">
          <div class="card__price-list">
            <span class="card__price-label">Lista:</span>
            <span class="card__price-value">${Utils.formatPrice(displayOriginalPrice)}</span>
          </div>
          <div class="card__price-wholesale">
            <span class="card__price-label">Mayorista:</span>
            <span class="card__price-value card__price-highlight">${Utils.formatPrice(displayPrice)}</span>
          </div>
        </div>
      `;
    } else if (priceDisplayMode === 'wholesale' && !hasDiscount) {
      // Modo Mayorista SIN descuento: solo mostrar precio lista
      priceHtml = `
        <div class="card__price">
          <span class="card__price-current">${Utils.formatPrice(displayPrice)}</span>
        </div>
      `;
    } else {
      // Modo Descuento (default): mostrar precio actual y tachado
      priceHtml = `
        <div class="card__price">
          <span class="card__price-current">${Utils.formatPrice(displayPrice)}</span>
          ${product.discount && product.discount > 0 && displayOriginalPrice ? `<span class="card__price-original">${Utils.formatPrice(displayOriginalPrice)}</span>` : ''}
        </div>
      `;
    }

    return `
      <div class="card" data-product-id="${product.id}">
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
          ${priceHtml}
          <div class="card__actions">
            <button class="btn btn--small btn--primary btn-view-product" data-product-id="${product.id}">VER PRODUCTO</button>
            <button class="btn btn--small btn--secondary add-to-cart-btn" data-product-id="${product.id}">🛒 AGREGAR</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Ordenar productos por descuento y tipo de marketing
   * Prioridad: 1) Mayor descuento, 2) Video marketing, 3) Imagen marketing, 4) Sin marketing
   */
  sortByDiscountAndMarketing(products) {
    return [...products].sort((a, b) => {
      // Primero ordenar por descuento (mayor a menor)
      const discountA = a.discount || 0;
      const discountB = b.discount || 0;
      
      if (discountB !== discountA) {
        return discountB - discountA;
      }
      
      // Si tienen el mismo descuento, ordenar por tipo de marketing
      const marketingPriorityA = this.getMarketingPriority(a);
      const marketingPriorityB = this.getMarketingPriority(b);
      
      return marketingPriorityB - marketingPriorityA;
    });
  }

  /**
   * Obtener prioridad de marketing de un producto
   * 3 = video, 2 = imagen, 1 = sin marketing
   */
  getMarketingPriority(product) {
    if (!product.marketing) return 1;
    if (product.marketing.type === 'video') return 3;
    if (product.marketing.type === 'image') return 2;
    return 1;
  }

  filterProducts(products, criteria) {
    console.log('🔍 filterProducts called with criteria:', criteria);
    console.log('🔍 filterProducts - products count:', products.length);
    
    // Si criteria es un string, convertirlo a objeto de filtro
    if (typeof criteria === 'string') {
      const filterMap = {
        'featured': { featured: true },
        'topDiscount': { topDiscount: true },
        'hasVideo': { hasVideo: true },
        'bestRated': { rating: { $gte: 4.5 } },
        'recent': {} // Sin filtro específico, solo ordenar por fecha
      };
      criteria = filterMap[criteria] || { featured: true };
      console.log('🔍 Converted string filter to:', criteria);
    }
    
    const result = products.filter(p => {
      // Si no hay criterios (ej: "recent"), incluir todos
      if (Object.keys(criteria).length === 0) return true;
      
      const matches = Object.keys(criteria).every(key => {
        const value = criteria[key];
        const productValue = p[key];
        
        if (typeof value === 'object' && value.$gte) {
          return productValue >= value.$gte;
        }
        
        return productValue === value;
      });
      
      return matches;
    });
    
    console.log('🔍 filterProducts result count:', result.length);
    return result;
  }

  /**
   * Ordenar productos por descuento y tipo de marketing
   * Prioridad: 1) Mayor descuento, 2) Video marketing, 3) Imagen marketing, 4) Sin marketing
   */
  sortByDiscountAndMarketing(products) {
    return [...products].sort((a, b) => {
      // Primero ordenar por descuento (mayor a menor)
      const discountDiff = (b.discount || 0) - (a.discount || 0);
      if (discountDiff !== 0) return discountDiff;
      
      // Si tienen el mismo descuento, ordenar por tipo de marketing
      const getMarketingPriority = (product) => {
        if (product.marketing && product.marketing.type === 'video') return 3; // Mayor prioridad
        if (product.marketing && product.marketing.type === 'image') return 2;
        if (product.marketing) return 1; // Tiene marketing pero sin tipo definido
        return 0; // Sin marketing
      };
      
      const priorityA = getMarketingPriority(a);
      const priorityB = getMarketingPriority(b);
      
      return priorityB - priorityA; // Mayor prioridad primero
    });
  }

  attachCardListeners(container) {
    // PRIMERO: Agregar listeners a los botones con capture para que se ejecuten antes
    const addToCartButtons = container.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        const productId = button.getAttribute('data-product-id');
        console.log('🛒 AGREGAR clicked for:', productId);
        HomeRenderer.handleAddToCartStatic(productId);
        return false;
      }, true); // capture: true
    });

    // Listeners para botones "VER PRODUCTO"
    const viewButtons = container.querySelectorAll('.btn-view-product');
    viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        const productId = button.getAttribute('data-product-id');
        window.location.href = `product.html?id=${productId}`;
        return false;
      }, true); // capture: true
    });

    // DESPUÉS: Listeners para las tarjetas
    const cards = container.querySelectorAll(CONSTANTS.SELECTORS.CARDS);
    cards.forEach(card => {
      // Hover para videos
      card.addEventListener('mouseenter', () => {
        const video = card.querySelector('video');
        if (video) video.play();
      });
      
      card.addEventListener('mouseleave', () => {
        const video = card.querySelector('video');
        if (video) video.pause();
      });

      // Click en la tarjeta (excepto botones)
      card.addEventListener('click', (e) => {
        // Si el click fue en un botón, no hacer nada
        if (e.target.closest('.add-to-cart-btn') || 
            e.target.closest('.btn-view-product') ||
            e.target.closest('.card__actions') ||
            e.target.tagName === 'BUTTON') {
          console.log('🚫 Card click ignored - button clicked');
          return;
        }
        // Navegar a la página del producto
        const productId = card.getAttribute('data-product-id');
        console.log('📦 Card clicked, navigating to:', productId);
        window.location.href = `product.html?id=${productId}`;
      });
    });

    // Forzar reproducción de videos de marketing
    const videos = container.querySelectorAll('.card__marketing-video');
    videos.forEach(video => {
      video.play().catch(err => {
        console.log('Video autoplay bloqueado, esperando interacción del usuario');
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

      let success = false;
      let itemName = product.name;

      // Si tiene variantes, agregar la primera variante por defecto
      if (product.hasVariants && product.variants && product.variants.length > 0) {
        console.log('📦 Producto con variantes, agregando primera variante...');
        const defaultVariant = product.variants[0];
        success = Cart.addItem(product, 1, defaultVariant);
        
        // Construir nombre con variante para la notificación
        if (defaultVariant.attributes) {
          const variantDesc = Object.values(defaultVariant.attributes).join(' / ');
          itemName = `${product.name} - ${variantDesc}`;
        }
      } else {
        // Si no tiene variantes, agregar directamente
        console.log('➕ Agregando producto al carrito...');
        success = Cart.addItem(product, 1, null);
      }
      
      if (success) {
        console.log('✅ Producto agregado exitosamente');
        // Mostrar notificación
        if (typeof CartUI !== 'undefined' && CartUI.showAddedNotification) {
          CartUI.showAddedNotification(itemName);
        } else {
          alert(`✅ ${itemName} agregado al carrito`);
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

  /**
   * Método estático para manejar agregar al carrito desde onclick inline
   */
  static handleAddToCartStatic(productId) {
    try {
      console.log('🛒 handleAddToCartStatic called with productId:', productId);
      
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
}
