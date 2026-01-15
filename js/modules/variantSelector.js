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
    
    // Actualizar precio
    const priceElement = document.querySelector('.product__price-current');
    if (priceElement) {
      priceElement.textContent = Utils.formatPrice(price);
    }
    
    const originalPriceElement = document.querySelector('.product__price-original');
    if (originalPriceElement && originalPrice) {
      originalPriceElement.textContent = Utils.formatPrice(originalPrice);
    }
    
    // Actualizar ahorro
    const savingsElement = document.querySelector('.product__savings');
    if (savingsElement && originalPrice && price) {
      const savings = originalPrice - price;
      savingsElement.textContent = `Ahorras ${Utils.formatPrice(savings)}`;
    }
    
    // Actualizar imagen principal
    const mainImage = document.querySelector('.product__image-main');
    if (mainImage && images && images.cover) {
      mainImage.src = images.cover;
      mainImage.alt = `${this.product.name} - ${Object.values(this.selectedAttributes).join(' ')}`;
    }
    
    // Actualizar galería
    if (images && images.gallery) {
      this.updateGallery(images.gallery);
    }
    
    // Actualizar botón de compra
    this.updateBuyButton();
    
    // Actualizar especificaciones de la variante
    this.updateVariantSpecs();
  }
  
  updateVariantSpecs() {
    if (!this.selectedVariant) return;
    
    const specsContainer = document.querySelector('.product__specs');
    if (!specsContainer) return;
    
    // Combinar specs del producto base con specs de la variante
    const baseSpecs = this.product.specs || {};
    const variantSpecs = this.selectedVariant.specs || {};
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
  
  updateGallery(variantImages) {
    const thumbnailsContainer = document.querySelector('.product__thumbnails');
    if (!thumbnailsContainer) return;
    
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
    
    // 1. Cover de la variante seleccionada (primera imagen)
    if (this.selectedVariant?.images?.cover) {
      addImage(this.selectedVariant.images.cover);
    }
    
    // 2. Galería del producto principal (las imágenes adicionales del producto)
    if (this.product.images?.gallery && this.product.images.gallery.length > 0) {
      this.product.images.gallery.forEach(img => addImage(img));
    }
    
    // 3. Galería de la variante (si tiene imágenes adicionales diferentes)
    if (variantImages && variantImages.length > 0) {
      variantImages.forEach(img => addImage(img));
    }
    
    // Renderizar todas las miniaturas
    thumbnailsContainer.innerHTML = allImages.map((img, index) => `
      <img 
        src="${img}" 
        alt="Imagen ${index + 1}"
        class="product__gallery-img ${index === 0 ? 'product__gallery-img--active' : ''}"
        onclick="document.querySelector('.product__main-image').src = this.src"
        onerror="this.src='assets/images/placeholder.svg'">
    `).join('');
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
