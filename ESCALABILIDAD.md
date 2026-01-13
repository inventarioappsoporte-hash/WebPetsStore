# 📈 Guía de Escalabilidad - Pets Store

## Cómo Escalar el Proyecto

### 1. Agregar Nuevos Productos

**Paso 1:** Edita `data/products.json`

```json
{
  "id": "prod_XXX",
  "name": "Nombre del Producto",
  "category": "Categoría",
  "price": 29990,
  "originalPrice": 49990,
  "discount": 40,
  "stock": 10,
  "rating": 4.8,
  "reviews": 150,
  "featured": true,
  "topDiscount": true,
  "hasVideo": true,
  "tags": ["tag1", "tag2", "tag3"],
  "description": "Descripción corta",
  "longDescription": "Descripción larga con detalles",
  "images": {
    "cover": "assets/images/products/prod_XXX/cover.jpg",
    "thumb": "assets/images/products/prod_XXX/thumb.jpg",
    "gallery": [
      "assets/images/products/prod_XXX/1.jpg",
      "assets/images/products/prod_XXX/2.jpg"
    ]
  },
  "video": {
    "url": "assets/videos/prod_XXX.mp4",
    "duration": 8,
    "autoplay": true,
    "muted": true,
    "loop": true
  },
  "specs": {
    "material": "Valor",
    "size": "Valor",
    "weight": "Valor"
  },
  "shipping": {
    "free": true,
    "days": "2-3"
  },
  "badge": "🔥 Destacado",
  "promoText": "40% OFF"
}
```

**Paso 2:** Crea carpeta de imágenes

```bash
mkdir -p assets/images/products/prod_XXX
```

**Paso 3:** Agrega imágenes

- `cover.jpg` - Imagen principal (1200x1200px recomendado)
- `thumb.jpg` - Thumbnail (300x300px)
- `1.jpg`, `2.jpg`, etc. - Galería

**Paso 4:** Agrega video (opcional)

```bash
# Coloca el video en:
assets/videos/prod_XXX.mp4
```

### 2. Agregar Nuevas Categorías

Edita `data/categories.json`:

```json
{
  "id": "nueva-categoria",
  "name": "Nueva Categoría",
  "icon": "🎯",
  "subcategories": [
    { "id": "subcategoria-1", "name": "Subcategoría 1" },
    { "id": "subcategoria-2", "name": "Subcategoría 2" }
  ]
}
```

### 3. Personalizar Home

Edita `data/home.json` para agregar/quitar secciones:

```json
{
  "id": "nueva-seccion",
  "title": "🎯 Mi Nueva Sección",
  "type": "carousel",
  "filter": {
    "category": "Perros",
    "featured": true
  },
  "sortBy": "rating",
  "limit": 8,
  "showVideo": true
}
```

**Tipos de sección:**
- `carousel` - Carrusel horizontal
- `grid` - Grid responsivo

**Filtros disponibles:**
- `category` - Por categoría
- `featured` - Destacados
- `topDiscount` - Top descuentos
- `hasVideo` - Con video
- `rating` - Por calificación (usa `{ "$gte": 4.5 }`)

**Ordenamiento:**
- `discount` - Mayor descuento primero
- `rating` - Mayor calificación primero
- `price` - Menor precio primero
- `reviews` - Más reseñas primero

### 4. Agregar Nuevas Funcionalidades

#### Ejemplo: Filtro por Rango de Precio

**Archivo:** `js/modules/priceFilter.js`

```javascript
class PriceFilter {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.init();
  }

  async init() {
    const products = await this.dataLoader.getProducts();
    this.setupPriceSlider(products);
  }

  setupPriceSlider(products) {
    const minPrice = Math.min(...products.map(p => p.price));
    const maxPrice = Math.max(...products.map(p => p.price));
    
    // Crear controles de precio
    const filterContainer = document.querySelector('.price-filter');
    filterContainer.innerHTML = `
      <input type="range" min="${minPrice}" max="${maxPrice}" value="${minPrice}">
      <input type="range" min="${minPrice}" max="${maxPrice}" value="${maxPrice}">
    `;
  }
}
```

**Importa en `index.html`:**

```html
<script src="js/modules/priceFilter.js"></script>
```

#### Ejemplo: Agregar Carrito de Compras

**Archivo:** `js/modules/cart.js`

```javascript
class Cart {
  constructor() {
    this.items = this.loadCart();
    this.init();
  }

  init() {
    this.setupCartButtons();
  }

  addItem(productId, quantity = 1) {
    const item = this.items.find(i => i.id === productId);
    if (item) {
      item.quantity += quantity;
    } else {
      this.items.push({ id: productId, quantity });
    }
    this.saveCart();
  }

  removeItem(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.saveCart();
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  loadCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  setupCartButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-add-to-cart')) {
        const productId = e.target.dataset.productId;
        this.addItem(productId);
        alert('Producto agregado al carrito');
      }
    });
  }
}
```

### 5. Optimizar Imágenes

**Herramientas recomendadas:**
- ImageOptim (Mac)
- FileOptimizer (Windows)
- TinyPNG (Online)

**Tamaños recomendados:**
- Cover: 1200x1200px (100-150KB)
- Thumb: 300x300px (20-30KB)
- Gallery: 800x800px (50-80KB)

### 6. Agregar Más Datos

Para manejar 1000+ productos sin problemas:

1. **Paginación:**

```javascript
class Pagination {
  constructor(items, itemsPerPage = 20) {
    this.items = items;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
  }

  getPage(page) {
    const start = (page - 1) * this.itemsPerPage;
    return this.items.slice(start, start + this.itemsPerPage);
  }

  getTotalPages() {
    return Math.ceil(this.items.length / this.itemsPerPage);
  }
}
```

2. **Lazy Loading:**

```javascript
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
      imageObserver.unobserve(entry.target);
    }
  });
});

images.forEach(img => imageObserver.observe(img));
```

### 7. Integración con Backend (Futuro)

Cuando necesites backend:

1. **Mantén la estructura JSON**
2. **Crea un endpoint:** `GET /api/products`
3. **Reemplaza en `dataLoader.js`:**

```javascript
async getProducts() {
  // Antes: return this.load('products.json');
  // Ahora:
  const response = await fetch('/api/products');
  return response.json();
}
```

### 8. Análisis y Métricas

Agrega Google Analytics:

```html
<!-- En index.html, antes de </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### 9. SEO

**Meta tags en cada página:**

```html
<meta name="description" content="Descripción del producto">
<meta name="keywords" content="perros, juguetes, mascotas">
<meta property="og:title" content="Título">
<meta property="og:description" content="Descripción">
<meta property="og:image" content="URL de imagen">
```

### 10. Performance

**Checklist:**

- ✅ Imágenes optimizadas
- ✅ CSS minificado
- ✅ JavaScript modular
- ✅ Lazy loading
- ✅ Caché de datos
- ✅ Compresión GZIP

**Herramientas:**
- Google PageSpeed Insights
- GTmetrix
- WebPageTest

## Estructura para Crecimiento

```
pets-store/
├── data/
│   ├── products.json       (1000+ productos)
│   ├── categories.json
│   ├── home.json
│   └── config.json
├── assets/
│   ├── images/products/    (1000+ carpetas)
│   └── videos/             (100+ videos)
└── js/
    ├── core/
    ├── modules/
    └── plugins/            (Nuevas funcionalidades)
```

## Migración a Backend

Cuando sea necesario:

1. Crea API REST
2. Mantén mismo formato JSON
3. Reemplaza `fetch()` en `dataLoader.js`
4. Agrega autenticación si es necesario
5. Implementa carrito y checkout

## Conclusión

Pets Store está diseñado para crecer:
- De 10 a 10,000 productos sin cambios
- De estático a dinámico sin refactorización
- De GitHub Pages a servidor propio sin problemas

¡Escala con confianza! 🚀
