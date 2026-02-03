// Selector de Variantes de Productos
class VariantSelector {
  constructor(product, containerId) {
    this.product = product;
    this.container = document.getElementById(containerId);
    this.selectedVariant = null;
    this.selectedAttributes = {};
    
    if (!this.container) {
      console.error('Container not found:', containerId);
      return;
    }
    
    if (!product.hasVariants || !product.variants) {
      console.warn('Product does not have variants');
      return;
    }
    
    this.init();
  }
  
  init() {
    // Seleccionar la primera variante disponible por defecto
    const firstAvailable = this.product.variants.combinations.find(v => v.available);
    if (firstAvailable) {
      this.selectedVariant = firstAvailable;
      this.selectedAttributes = { ...firstAvailable.attributes };
    }
    
    this.render();
    this.updateProductDisplay();
  }
  
  render() {
    const { attributes, combinations } = this.product.variants;
    
    let html = '<div class="variant-selector">';
    
    // Renderizar selector para cada atributo
    attributes.forEach(attribute => {
      html += this.renderAttributeSelector(attribute, combinations);
    });
    
    // Mostrar información de la variante seleccionada
    html += this.renderVariantInfo();
    
    html += '</div>';
    
    this.container.innerHTML = html;
    this.attachEventListeners();
  }
  
  renderAttributeSelector(attribute, combinations) {
    const { id, name, type } = attribute;
    
    // Obtener valores únicos para este atributo
    const values = [...new Set(combinations.map(c => c.attributes[name]))];
    
    let html = `
      <div class="variant-attribute" data-attribute="${name}">
        <label class="variant-attribute__label">${name}:</label>
        <div class="variant-attribute__options">
    `;
    
    values.forEach(value => {
      const isSelected = this.selectedAttributes[name] === value;
      const isAvailable = this.isVariantAvailable(name, value);
      const classes = [
        'variant-option',
        isSelected ? 'variant-option--selected' : '',
        !isAvailable ? 'variant-option--unavailable' : ''
      ].filter(Boolean).join(' ');
      
      if (type === 'color') {
        // Renderizar como círculo de color
        html += `
          <button 
            class="${classes} variant-option--color" 
            data-attribute="${name}" 
            data-value="${value}"
            ${!isAvailable ? 'disabled' : ''}
            title="${value}">
            <span class="variant-option__color" style="background-color: ${this.getColorValue(value)}"></span>
            <span class="variant-option__label">${value}</span>
          </button>
        `;
      } else {
        // Renderizar como botón de texto
        html += `
          <button 
            class="${classes}" 
            data-attribute="${name}" 
            data-value="${value}"
            ${!isAvailable ? 'disabled' : ''}>
            ${value}
          </button>
        `;
      }
    });
    
    html += `
        </div>
      </div>
    `;
    
    return html;
  }
  
  renderVariantInfo() {
    if (!this.selectedVariant) return '';
    
    const { sku, stock, available } = this.selectedVariant;
    
    return `
      <div class="variant-info">
        <div class="variant-info__item">
          <span class="variant-info__label">SKU:</span>
          <span class="variant-info__value">${sku}</span>
        </div>
        <div class="variant-info__item">
          <span class="variant-info__label">Stock:</span>
          <span class="variant-info__value ${stock < 5 ? 'variant-info__value--low' : ''}">
            ${stock} ${stock === 1 ? 'unidad' : 'unidades'}
          </span>
        </div>
        ${!available ? '<div class="variant-info__unavailable">⚠️ No disponible</div>' : ''}
      </div>
    `;
  }
  
  attachEventListeners() {
    const buttons = this.container.querySelectorAll('.variant-option:not([disabled])');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const attribute = e.currentTarget.dataset.attribute;
        const value = e.currentTarget.dataset.value;
        this.selectAttribute(attribute, value);
      });
    });
  }
  
  selectAttribute(attribute, value) {
    // Actualizar atributo seleccionado
    this.selectedAttributes[attribute] = value;
    
    // Buscar la variante que coincida con los atributos seleccionados
    const variant = this.findVariant(this.selectedAttributes);
    
    if (variant) {
      this.selectedVariant = variant;
      this.render();
      this.updateProductDisplay();
      this.notifyChange();
    }
  }
  
  findVariant(attributes) {
    return this.product.variants.combinations.find(variant => {
      return Object.keys(attributes).every(key => 
        variant.attributes[key] === attributes[key]
      );
    });
  }
  
  isVariantAvailable(attribute, value) {
    // Verificar si existe alguna variante disponible con este valor de atributo
    const testAttributes = { ...this.selectedAttributes, [attribute]: value };
    const variant = this.findVariant(testAttributes);
    return variant && variant.available;
  }
  
  updateProductDisplay() {
    if (!this.selectedVariant) return;
    
    const { price, originalPrice, images } = this.selectedVariant;
    
    // Determinar el modo de visualización de precios del producto
    const priceDisplayMode = this.product.priceDisplayMode || 'discount';
    
    // Verificar si tiene descuento real
    const hasDiscount = originalPrice && originalPrice > price;
    
    // Actualizar precios según el modo
    if (priceDisplayMode === 'wholesale' && hasDiscount) {
      // Modo mayorista CON descuento: actualizar Precio Lista y Precio Mayorista
      const listPriceElement = document.querySelector('.product__price-list-value');
      const wholesalePriceElement = document.querySelector('.product__price-wholesale-value');
      const savingsElement = document.querySelector('.product__wholesale-footer .product__savings');
      
      if (listPriceElement) {
        listPriceElement.textContent = Utils.formatPrice(originalPrice);
      }
      
      if (wholesalePriceElement) {
        wholesalePriceElement.textContent = Utils.formatPrice(price);
      }
      
      if (savingsElement) {
        const savings = originalPrice - price;
        savingsElement.textContent = `✅ Ahorras ${Utils.formatPrice(savings)}`;
      }
    } else if (priceDisplayMode === 'wholesale' && !hasDiscount) {
      // Modo mayorista SIN descuento: solo actualizar precio actual
      const priceElement = document.querySelector('.product__price-current');
      if (priceElement) {
        priceElement.textContent = Utils.formatPrice(price);
      }
    } else {
      // Modo descuento: actualizar precio actual y original
      const priceElement = document.querySelector('.product__price-current');
      if (priceElement) {
        priceElement.textContent = Utils.formatPrice(price);
      }
      
      const originalPriceElement = document.querySelector('.product__price-original');
      const savingsElement = document.querySelector('.product__savings');
      
      // Solo mostrar precio original y ahorro si hay descuento real
      if (hasDiscount) {
        if (originalPriceElement) {
          originalPriceElement.textContent = Utils.formatPrice(originalPrice);
          originalPriceElement.style.display = '';
        }
        if (savingsElement) {
          const savings = originalPrice - price;
          savingsElement.textContent = `Ahorras ${Utils.formatPrice(savings)}`;
          savingsElement.style.display = '';
        }
      } else {
        // Ocultar si no hay descuento
        if (originalPriceElement) {
          originalPriceElement.style.display = 'none';
        }
        if (savingsElement) {
          savingsElement.style.display = 'none';
        }
      }
    }
    
    // Actualizar imagen principal - usar imagen de variante o fallback a producto base
    const mainImage = document.querySelector('.product__image-main');
    if (mainImage) {
      const getImgUrl = window.getImageUrl || ((path) => path);
      // Usar imagen de la variante, o fallback a imagen del producto base
      const coverImage = (images && images.cover) ? images.cover : 
                         (this.product.images?.cover || this.product.images?.gallery?.[0]);
      
      if (coverImage) {
        const imgUrl = getImgUrl(coverImage);
        mainImage.src = imgUrl;
        mainImage.alt = `${this.product.name} - ${Object.values(this.selectedAttributes).join(' ')}`;
        
        // Fallback si la imagen de variante falla - usar imagen del producto base
        mainImage.onerror = () => {
          const baseImage = this.product.images?.cover || this.product.images?.gallery?.[0];
          if (baseImage && baseImage !== coverImage) {
            mainImage.src = getImgUrl(baseImage);
          } else {
            mainImage.src = getImgUrl('assets/images/placeholder.svg');
          }
        };
      }
    }
    
    // Actualizar galería - pasar también las imágenes del producto base como fallback
    this.updateGallery(images?.gallery || [], images?.cover);
    
    // Actualizar botón de compra
    this.updateBuyButton();
    
    // Actualizar especificaciones de la variante
    this.updateVariantSpecs();
  }
  
  updateVariantSpecs() {
    if (!this.selectedVariant) return;
    
    const specsContainer = document.querySelector('.product__specs');
    if (!specsContainer) return;
    
    // Obtener specs del producto base
    const baseSpecs = this.product.specs ? { ...this.product.specs } : {};
    const variantSpecs = this.selectedVariant.specs || {};
    
    // Si la variante tiene specs propias, eliminar las specs generales que se sobrescriben
    // Por ejemplo, si la variante tiene "medida", eliminar "medidas" del producto base
    if (variantSpecs.medida) {
      delete baseSpecs.medidas;
    }
    
    // Combinar specs: las de la variante sobrescriben las del producto base
    const combinedSpecs = { ...baseSpecs, ...variantSpecs };
    
    // Generar HTML de especificaciones
    const specsHtml = Object.entries(combinedSpecs)
      .map(([key, value]) => `
        <div class="product__spec">
          <span class="product__spec-label">${this.formatLabel(key)}:</span>
          <span class="product__spec-value">${Array.isArray(value) ? value.join(', ') : value}</span>
        </div>
      `)
      .join('');
    
    specsContainer.innerHTML = `
      <h3>Especificaciones</h3>
      ${specsHtml}
    `;
  }
  
  formatLabel(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
  
  updateGallery(variantImages, variantCover) {
    const thumbnailsContainer = document.querySelector('.product__thumbnails');
    if (!thumbnailsContainer) return;
    
    const getImgUrl = window.getImageUrl || ((path) => path);
    const placeholderUrl = getImgUrl('assets/images/placeholder.svg');
    
    // Usar Set para evitar duplicados (comparando por nombre de archivo sin extensión)
    const addedImages = new Set();
    const allImages = [];
    
    // Función para extraer nombre base del archivo (sin extensión y sin path)
    const getBaseName = (path) => {
      const fileName = path.split('/').pop().toLowerCase();
      // Remover extensión
      return fileName.replace(/\.(jpg|jpeg|png|gif|webp|svg)$/i, '');
    };
    
    // Función para agregar imagen si no es duplicada
    const addImage = (img) => {
      if (!img) return;
      const baseName = getBaseName(img);
      // Considerar "cover", "thumb", "1" como potencialmente la misma imagen
      // Si ya tenemos cover o 1, no agregar el otro
      const normalizedName = (baseName === 'cover' || baseName === '1' || baseName === 'thumb') 
        ? 'main_image' 
        : baseName;
      
      if (!addedImages.has(normalizedName)) {
        addedImages.add(normalizedName);
        allImages.push(img);
      }
    };
    
    // 1. Primero intentar con imagen del producto base (más confiable)
    if (this.product.images?.cover) {
      addImage(this.product.images.cover);
    } else if (this.product.images?.gallery && this.product.images.gallery.length > 0) {
      addImage(this.product.images.gallery[0]);
    }
    
    // 2. Galería del producto principal (las imágenes adicionales del producto)
    if (this.product.images?.gallery && this.product.images.gallery.length > 0) {
      this.product.images.gallery.forEach(img => addImage(img));
    }
    
    // 3. Galería de la variante (si tiene imágenes adicionales diferentes)
    if (variantImages && variantImages.length > 0) {
      variantImages.forEach(img => addImage(img));
    }
    
    // Renderizar todas las miniaturas usando getImageUrl para resolver rutas
    thumbnailsContainer.innerHTML = allImages.map((img, index) => {
      const imgUrl = getImgUrl(img);
      // Usar imagen del producto base como fallback en onerror
      const fallbackImg = this.product.images?.cover || this.product.images?.gallery?.[0] || 'assets/images/placeholder.svg';
      const fallbackUrl = getImgUrl(fallbackImg);
      return `
      <img 
        src="${imgUrl}" 
        alt="Imagen ${index + 1}"
        class="product__gallery-img ${index === 0 ? 'product__gallery-img--active' : ''}"
        onclick="document.querySelector('.product__main-image').src = this.src"
        onerror="this.onerror=null; this.src='${index === 0 ? fallbackUrl : placeholderUrl}'">
    `;
    }).join('');
  }
  
  updateBuyButton() {
    const buyButton = document.querySelector('.btn--buy');
    if (!buyButton) return;
    
    if (this.selectedVariant && this.selectedVariant.available) {
      buyButton.disabled = false;
      buyButton.textContent = 'Agregar al Carrito';
    } else {
      buyButton.disabled = true;
      buyButton.textContent = 'No Disponible';
    }
  }
  
  notifyChange() {
    // Emitir evento personalizado para que otros componentes puedan reaccionar
    const event = new CustomEvent('variantChanged', {
      detail: {
        product: this.product,
        variant: this.selectedVariant,
        attributes: this.selectedAttributes
      }
    });
    document.dispatchEvent(event);
  }
  
  getSelectedVariant() {
    return this.selectedVariant;
  }
  
  getSelectedAttributes() {
    return this.selectedAttributes;
  }
  
  // Mapeo de nombres de colores a valores CSS
  getColorValue(colorName) {
    const colorMap = {
      'Blanco': '#FFFFFF',
      'Negro': '#000000',
      'Azul': '#0066CC',
      'Rojo': '#CC0000',
      'Verde': '#00CC00',
      'Amarillo': '#FFCC00',
      'Bronce': '#CD7F32',
      'Rosa': '#FF69B4',
      'Gris': '#808080',
      'Marrón': '#8B4513',
      'Naranja': '#FF8800',
      'Morado': '#800080',
      'Celeste': '#87CEEB'
    };
    
    return colorMap[colorName] || '#CCCCCC';
  }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VariantSelector;
}
