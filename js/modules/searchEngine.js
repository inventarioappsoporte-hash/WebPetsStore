// Motor de búsqueda
class SearchEngine {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.products = [];
    this.init();
  }

  async init() {
    console.log('🔍 SearchEngine.init() - Cargando productos...');
    this.products = await this.dataLoader.getProducts();
    console.log('🔍 SearchEngine.init() - Productos cargados:', this.products?.length || 0);
    console.log('🔍 SearchEngine.init() - Llamando setupSearchListeners...');
    this.setupSearchListeners();
    
    // Verificar si hay parámetros de URL para filtrar
    this.checkUrlParams();
    
    console.log('🔍 SearchEngine.init() - setupSearchListeners completado');
  }

  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const query = urlParams.get('q');

    console.log('🔍 SearchEngine - URL params - category:', category, 'query:', query);

    if (category) {
      this.filterByCategory(category);
    } else if (query) {
      this.search(query);
      // Llenar el input con la query
      const searchInput = document.querySelector('.search__input') || document.querySelector(CONSTANTS.SELECTORS.SEARCH_INPUT);
      if (searchInput) {
        searchInput.value = query;
      }
    }
  }

  filterByCategory(categoryId) {
    // Asegurar que categoryId sea string para comparar con las keys del objeto
    const categoryIdStr = String(categoryId);
    console.log('🔍 SearchEngine.filterByCategory() - Category ID:', categoryIdStr, 'tipo:', typeof categoryIdStr);
    
    // Mapear IDs de categorías a filtros específicos
    const categoryFilters = {
      '250': { // HIGIENE Y CUIDADO
        name: 'HIGIENE Y CUIDADO',
        filter: (product) => {
          return product.tags && product.tags.some(tag => 
            ['higiene', 'cuidado', 'limpieza', 'baño'].includes(tag.toLowerCase())
          );
        }
      },
      '261': { // COLCHONETAS Y MOISES
        name: 'COLCHONETAS Y MOISES',
        filter: (product) => {
          return (product.subcategory && product.subcategory.toLowerCase().includes('cama')) ||
                 (product.tags && product.tags.some(tag => 
                   ['cama', 'colchoneta', 'moisés', 'descanso'].includes(tag.toLowerCase())
                 ));
        }
      },
      '262': { // BOLSOS Y CASITAS
        name: 'BOLSOS Y CASITAS',
        filter: (product) => {
          return (product.subcategory && (
                   product.subcategory.toLowerCase().includes('casa') ||
                   product.subcategory.toLowerCase().includes('bolso') ||
                   product.subcategory.toLowerCase().includes('transportín')
                 )) ||
                 (product.tags && product.tags.some(tag => 
                   ['casa', 'bolso', 'transportín', 'viaje', 'casita'].includes(tag.toLowerCase())
                 ));
        }
      },
      '263': { // RASCADORES
        name: 'RASCADORES',
        filter: (product) => {
          return (product.subcategory && product.subcategory.toLowerCase().includes('rascador')) ||
                 (product.tags && product.tags.some(tag => tag.toLowerCase().includes('rascador'))) ||
                 (product.name && product.name.toLowerCase().includes('rascador'));
        }
      },
      '264': { // JUGUETES
        name: 'JUGUETES',
        filter: (product) => {
          // Excluir productos que son claramente accesorios
          const esAccesorio = product.tags && product.tags.some(tag => 
            ['anteojos', 'accesorio', 'moda', 'estilo'].includes(tag.toLowerCase())
          );
          
          if (esAccesorio) return false;
          
          return (product.subcategory && product.subcategory.toLowerCase().includes('juguete')) ||
                 (product.tags && product.tags.some(tag => 
                   ['juguete', 'juego', 'interactivo', 'pelota'].includes(tag.toLowerCase())
                 ));
        }
      },
      '275': { // ROPA VERANO
        name: 'ROPA VERANO',
        filter: (product) => {
          return product.tags && product.tags.some(tag => 
            ['verano', 'fresco', 'ligero'].includes(tag.toLowerCase())
          );
        }
      },
      '316': { // ROPA INVIERNO
        name: 'ROPA INVIERNO',
        filter: (product) => {
          return product.tags && product.tags.some(tag => 
            ['invierno', 'abrigo', 'abrigado', 'caliente'].includes(tag.toLowerCase())
          );
        }
      },
      '317': { // COLLARES, CORREAS Y PECHERAS
        name: 'COLLARES, CORREAS Y PECHERAS',
        filter: (product) => {
          return (product.subcategory && (
                   product.subcategory.toLowerCase().includes('collar') ||
                   product.subcategory.toLowerCase().includes('correa') ||
                   product.subcategory.toLowerCase().includes('pechera')
                 )) ||
                 (product.tags && product.tags.some(tag => 
                   ['collar', 'correa', 'pechera', 'paseo'].includes(tag.toLowerCase())
                 ));
        }
      },
      '409': { // COMEDEROS Y BEBEDEROS
        name: 'COMEDEROS Y BEBEDEROS',
        filter: (product) => {
          return (product.subcategory && (
                   product.subcategory.toLowerCase().includes('comedero') ||
                   product.subcategory.toLowerCase().includes('bebedero') ||
                   product.subcategory.toLowerCase().includes('alimentación')
                 )) ||
                 (product.tags && product.tags.some(tag => 
                   ['comedero', 'bebedero', 'alimentación', 'comida', 'agua'].includes(tag.toLowerCase())
                 ));
        }
      },
      '500': { // ACCESORIOS
        name: 'ACCESORIOS',
        filter: (product) => {
          return (product.subcategory && product.subcategory.toLowerCase().includes('accesorio')) ||
                 (product.tags && product.tags.some(tag => 
                   ['anteojos', 'accesorio', 'moda', 'estilo', 'complemento'].includes(tag.toLowerCase())
                 ));
        }
      },
      '501': { // ALIMENTOS Y SNACKS
        name: 'ALIMENTOS Y SNACKS',
        filter: (product) => {
          // Excluir productos que NO son alimentos (juguetes, accesorios, etc.)
          const categoryLower = product.category ? product.category.toLowerCase() : '';
          const subcategoryLower = product.subcategory ? product.subcategory.toLowerCase() : '';
          
          // Si la categoría es claramente otra cosa, excluir
          const categoriasExcluidas = ['juguete', 'accesorio', 'ropa', 'collar', 'correa', 'cama', 'casa', 'rascador', 'higiene'];
          const esOtraCategoria = categoriasExcluidas.some(cat => 
            categoryLower.includes(cat) || subcategoryLower.includes(cat)
          );
          
          if (esOtraCategoria) return false;
          
          // Solo incluir si es explícitamente alimentos
          return categoryLower === 'alimentos' ||
                 subcategoryLower === 'alimentos' ||
                 subcategoryLower === 'snacks' ||
                 (product.badge && (
                   product.badge.toLowerCase().includes('alimento') ||
                   product.badge.toLowerCase().includes('snack')
                 ));
        }
      }
    };

    const categoryConfig = categoryFilters[categoryIdStr];
    
    if (!categoryConfig) {
      console.warn('🔍 SearchEngine.filterByCategory() - Category ID not found:', categoryIdStr);
      this.displayCategoryResults([], categoryIdStr, 'Categoría no encontrada');
      return;
    }
    
    console.log('🔍 SearchEngine.filterByCategory() - Filtering by:', categoryConfig.name);

    const results = this.products.filter(categoryConfig.filter);

    console.log('🔍 SearchEngine.filterByCategory() - Resultados encontrados:', results.length);
    console.log('🔍 SearchEngine.filterByCategory() - Productos:', results.map(p => `${p.name} (${p.subcategory})`));

    this.displayCategoryResults(results, categoryIdStr, categoryConfig.name);
    
    // Mostrar botón de limpiar cuando hay filtro activo
    this.showClearButton();
  }

  displayCategoryResults(results, categoryId, categoryName) {
    const container = document.querySelector(CONSTANTS.SELECTORS.SEARCH_RESULTS);
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search__no-results">
          <p>No encontramos productos en la categoría "<strong>${categoryName}</strong>"</p>
          <p>Intenta con otra categoría</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="search__count">
        <p>Categoría: <strong>🐾 ${categoryName}</strong></p>
        <p>Se encontraron <strong>${results.length}</strong> producto${results.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="search__grid">
        ${results.map(p => this.renderResultCard(p)).join('')}
      </div>
    `;
    
    // Adjuntar listeners a los botones de agregar
    this.attachAddToCartListeners();
  }

  setupSearchListeners() {
    console.log('🔍 SearchEngine.setupSearchListeners() - Buscando inputs...');
    console.log('🔍 Todos los inputs en la página:', document.querySelectorAll('input').length);
    document.querySelectorAll('input').forEach((input, idx) => {
      console.log(`  Input ${idx}:`, input.className, input.type, input.placeholder);
    });
    
    // Intentar encontrar el input en la página de búsqueda primero
    let searchInput = document.querySelector('.search__input');
    console.log('🔍 Buscando .search__input:', !!searchInput);
    
    // Si no lo encuentra, intentar con el selector del header
    if (!searchInput) {
      searchInput = document.querySelector(CONSTANTS.SELECTORS.SEARCH_INPUT);
      console.log('🔍 Buscando', CONSTANTS.SELECTORS.SEARCH_INPUT, ':', !!searchInput);
    }
    
    console.log('🔍 SearchEngine.setupSearchListeners() - searchInput encontrado:', !!searchInput);
    if (!searchInput) return;

    const debouncedSearch = Utils.debounce((e) => {
      const query = e.target.value.toLowerCase().trim();
      console.log('🔍 SearchEngine - Input event, query:', query, 'length:', query.length);
      if (query.length < 2) {
        this.clearResults();
        this.hideClearButton();
        return;
      }
      this.search(query);
      this.showClearButton();
    }, CONSTANTS.DEBOUNCE_DELAY);

    searchInput.addEventListener('input', debouncedSearch);
    console.log('🔍 SearchEngine - Event listener agregado');
    
    // Configurar botón de limpiar filtro
    this.setupClearButton();
  }

  setupClearButton() {
    const clearBtn = document.getElementById('clear-filter-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        console.log('🔍 SearchEngine - Limpiando filtros...');
        this.clearFilters();
      });
    }
  }

  showClearButton() {
    const clearBtn = document.getElementById('clear-filter-btn');
    if (clearBtn) {
      clearBtn.style.display = 'inline-block';
    }
  }

  hideClearButton() {
    const clearBtn = document.getElementById('clear-filter-btn');
    if (clearBtn) {
      clearBtn.style.display = 'none';
    }
  }

  clearFilters() {
    // Limpiar input de búsqueda
    const searchInput = document.querySelector('.search__input') || document.querySelector(CONSTANTS.SELECTORS.SEARCH_INPUT);
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Limpiar URL params
    const url = new URL(window.location);
    url.searchParams.delete('category');
    url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    
    // Mostrar todos los productos
    this.showAllProducts();
    
    // Ocultar botón de limpiar
    this.hideClearButton();
  }

  async showAllProducts() {
    console.log('🔍 SearchEngine.showAllProducts() - Mostrando todos los productos...');
    
    const container = document.querySelector(CONSTANTS.SELECTORS.SEARCH_RESULTS);
    if (!container) return;

    container.innerHTML = `
      <div class="search__count">
        <p><strong>Todos los productos</strong></p>
        <p>Se encontraron <strong>${this.products.length}</strong> producto${this.products.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="search__grid">
        ${this.products.map(p => this.renderResultCard(p)).join('')}
      </div>
    `;
    
    // Adjuntar listeners a los botones de agregar
    this.attachAddToCartListeners();
  }

  search(query) {
    console.log('🔍 SearchEngine.search() - Query:', query, 'Productos disponibles:', this.products?.length || 0);
    const normalizedQuery = Utils.normalizeText(query);
    
    const results = this.products.filter(product => {
      // Manejar campos que pueden ser null o undefined
      const matchName = product.name ? Utils.normalizeText(product.name).includes(normalizedQuery) : false;
      const matchCategory = product.category ? Utils.normalizeText(product.category).includes(normalizedQuery) : false;
      const matchSubcategory = product.subcategory ? Utils.normalizeText(product.subcategory).includes(normalizedQuery) : false;
      const matchTags = product.tags && Array.isArray(product.tags) ? product.tags.some(tag => Utils.normalizeText(tag).includes(normalizedQuery)) : false;
      const matchDescription = product.description ? Utils.normalizeText(product.description).includes(normalizedQuery) : false;

      return matchName || matchCategory || matchSubcategory || matchTags || matchDescription;
    });

    console.log('🔍 SearchEngine.search() - Resultados encontrados:', results.length);
    this.displayResults(results, query);
  }

  displayResults(results, query) {
    const container = document.querySelector(CONSTANTS.SELECTORS.SEARCH_RESULTS);
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search__no-results">
          <p>No encontramos productos para "<strong>${Utils.truncateText(query, 50)}</strong>"</p>
          <p>Intenta con otras palabras clave</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="search__count">
        <p>Se encontraron <strong>${results.length}</strong> producto${results.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="search__grid">
        ${results.map(p => this.renderResultCard(p)).join('')}
      </div>
    `;
    
    // Adjuntar listeners a los botones de agregar
    this.attachAddToCartListeners();
  }

  renderResultCard(product) {
    // Determinar el precio a mostrar con validación robusta
    let displayPrice = null;
    let displayOriginalPrice = null;
    
    // 1. Intentar con basePrice si tiene variantes
    if (product.hasVariants && product.basePrice) {
      displayPrice = product.basePrice;
      // Buscar originalPrice en baseOriginalPrice o en originalPrice directo
      displayOriginalPrice = product.baseOriginalPrice || product.originalPrice;
    }
    
    // 2. Si no, intentar con price directo
    if (!displayPrice && product.price) {
      displayPrice = product.price;
      displayOriginalPrice = product.originalPrice;
    }
    
    // 3. Si no, buscar en variants.combinations
    if (!displayPrice && product.variants?.combinations?.length > 0) {
      displayPrice = product.variants.combinations[0].price;
      displayOriginalPrice = product.variants.combinations[0].originalPrice;
    }
    
    // 4. Si no, buscar en variants.options (para productos con variantes simples)
    if (!displayPrice && product.variants?.options?.length > 0) {
      const firstOption = product.variants.options[0];
      if (firstOption.price) {
        displayPrice = firstOption.price;
        displayOriginalPrice = firstOption.originalPrice;
      }
    }
    
    // 5. Validación final: asegurar que displayPrice es un número válido
    displayPrice = parseFloat(displayPrice);
    displayOriginalPrice = parseFloat(displayOriginalPrice);
    
    if (isNaN(displayPrice) || displayPrice <= 0) {
      displayPrice = 0;
    }
    if (isNaN(displayOriginalPrice)) {
      displayOriginalPrice = null;
    }
    
    // Determinar modo de visualización de precios
    const priceDisplayMode = product.priceDisplayMode || 'discount';
    
    // Verificar si tiene descuento real (originalPrice > price)
    const hasDiscount = displayOriginalPrice && displayOriginalPrice > displayPrice;
    
    // Generar HTML de precios según el modo
    let priceHtml = '';
    if (priceDisplayMode === 'wholesale' && hasDiscount) {
      // Modo Mayorista CON descuento: mostrar Precio Lista y Precio Mayorista
      priceHtml = `
        <div class="search-card__price search-card__price--wholesale">
          <div class="search-card__price-row">
            <span class="search-card__price-label">Lista:</span>
            <span class="search-card__price-value">${Utils.formatPrice(displayOriginalPrice)}</span>
          </div>
          <div class="search-card__price-row">
            <span class="search-card__price-label">Mayorista:</span>
            <span class="search-card__price-value search-card__price-highlight">${Utils.formatPrice(displayPrice)}</span>
          </div>
        </div>
      `;
    } else if (priceDisplayMode === 'wholesale' && !hasDiscount) {
      // Modo Mayorista SIN descuento: solo mostrar precio lista
      priceHtml = `
        <div class="search-card__price">
          <span>${Utils.formatPrice(displayPrice)}</span>
        </div>
      `;
    } else {
      // Modo Descuento (default): mostrar precio actual y badge de descuento
      priceHtml = `
        <div class="search-card__price">
          <span>${Utils.formatPrice(displayPrice)}</span>
          ${product.discount && product.discount > 0 ? `<span class="search-card__discount">-${product.discount}%</span>` : ''}
        </div>
      `;
    }
    
    // Manejar categoría null
    const categoryDisplay = product.category || product.subcategory || '';
    
    return `
      <div class="search-card card" data-product-id="${product.id}" onclick="window.location.href='product.html?id=${product.id}'">
        <div class="card__image-wrapper">
          <img src="${product.images.thumb}" alt="${product.name}" loading="lazy">
        </div>
        <h3>${product.name}</h3>
        ${categoryDisplay ? `<p class="search-card__category">${categoryDisplay}</p>` : ''}
        ${priceHtml}
        <button class="btn btn--small btn--secondary search-card__add-to-cart add-to-cart-btn" data-product-id="${product.id}" onclick="event.stopPropagation()">🛒 Agregar</button>
      </div>
    `;
  }

  /**
   * Agregar listeners a los botones de agregar al carrito
   */
  attachAddToCartListeners() {
    const buttons = document.querySelectorAll('.search-card__add-to-cart');
    buttons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const productId = button.getAttribute('data-product-id');
        await this.handleAddToCart(productId);
      });
    });
    
    // Aplicar indicadores de stock desde Firebase
    if (typeof FirebaseStock !== 'undefined' && FirebaseStock.initialized) {
      FirebaseStock.applyStockIndicators();
    }
  }

  /**
   * Manejar agregar producto al carrito
   */
  async handleAddToCart(productId) {
    try {
      const product = await this.dataLoader.getProductById(productId);
      
      if (!product) {
        alert('Producto no encontrado');
        return;
      }

      // Si tiene variantes, redirigir a página de producto
      if (product.hasVariants) {
        window.location.href = `product.html?id=${product.id}`;
        return;
      }

      // Si no tiene variantes, agregar directamente
      const success = Cart.addItem(product, 1, null);
      
      if (success) {
        if (typeof CartUI !== 'undefined' && CartUI.showAddedNotification) {
          CartUI.showAddedNotification(product.name);
        } else {
          alert(`✅ ${product.name} agregado al carrito`);
        }
      } else {
        alert('Error al agregar el producto al carrito');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar el producto al carrito');
    }
  }

  clearResults() {
    const container = document.querySelector(CONSTANTS.SELECTORS.SEARCH_RESULTS);
    if (container) container.innerHTML = '';
  }
}
