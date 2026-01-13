# 💡 Ejemplos Avanzados - Pets Store

## Ejemplos de Uso

### 1. Filtrar Productos por Categoría

```javascript
// En la consola del navegador
const perros = await dataLoader.filterProducts({ category: 'Perros' });
console.log(perros);
```

### 2. Buscar Productos por Tag

```javascript
const juguetes = await dataLoader.filterProducts({ tags: ['juguete'] });
console.log(juguetes);
```

### 3. Obtener Top 5 Productos Mejor Valorados

```javascript
const products = await dataLoader.getProducts();
const topRated = dataLoader.sortProducts(products, 'rating').slice(0, 5);
console.log(topRated);
```

### 4. Calcular Ahorro Total

```javascript
const products = await dataLoader.getProducts();
const totalSavings = products.reduce((sum, p) => {
  const savings = (p.originalPrice || p.price) - p.price;
  return sum + savings;
}, 0);
console.log(`Ahorro total: $${totalSavings.toLocaleString()}`);
```

### 5. Contar Productos por Categoría

```javascript
const products = await dataLoader.getProducts();
const byCategory = {};
products.forEach(p => {
  byCategory[p.category] = (byCategory[p.category] || 0) + 1;
});
console.log(byCategory);
```

---

## Ejemplos de Personalización

### Agregar Sección de "Flash Sale"

**En `data/home.json`:**

```json
{
  "id": "flash-sale",
  "title": "⚡ FLASH SALE - 1 HORA",
  "type": "carousel",
  "filter": { "discount": { "$gte": 50 } },
  "sortBy": "discount",
  "limit": 5,
  "showVideo": true
}
```

### Agregar Sección de "Nuevos Productos"

**En `data/products.json`, agrega a cada producto nuevo:**

```json
"isNew": true,
"dateAdded": "2024-01-13"
```

**En `data/home.json`:**

```json
{
  "id": "new-products",
  "title": "✨ NUEVOS PRODUCTOS",
  "type": "grid",
  "filter": { "isNew": true },
  "sortBy": "dateAdded",
  "limit": 6
}
```

### Agregar Sección de "Ofertas por Categoría"

**En `data/home.json`:**

```json
{
  "id": "cat-perros",
  "title": "🐕 OFERTAS PARA PERROS",
  "type": "carousel",
  "filter": { "category": "Perros", "topDiscount": true },
  "sortBy": "discount",
  "limit": 8
}
```

---

## Ejemplos de JavaScript Personalizado

### Agregar Contador de Productos

**Archivo: `js/modules/productCounter.js`**

```javascript
class ProductCounter {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.init();
  }

  async init() {
    const products = await this.dataLoader.getProducts();
    this.displayCounter(products.length);
  }

  displayCounter(count) {
    const header = document.querySelector('.header');
    const counter = document.createElement('div');
    counter.className = 'product-counter';
    counter.innerHTML = `
      <span>📦 ${count} productos disponibles</span>
    `;
    header.appendChild(counter);
  }
}

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProductCounter(dataLoader);
  });
} else {
  new ProductCounter(dataLoader);
}
```

**Agrega en `index.html`:**

```html
<script src="js/modules/productCounter.js"></script>
```

### Agregar Filtro por Precio

**Archivo: `js/modules/priceFilter.js`**

```javascript
class PriceFilter {
  constructor(dataLoader, searchEngine) {
    this.dataLoader = dataLoader;
    this.searchEngine = searchEngine;
    this.init();
  }

  async init() {
    const products = await this.dataLoader.getProducts();
    const prices = products.map(p => p.price).sort((a, b) => a - b);
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];

    this.createFilterUI(minPrice, maxPrice);
  }

  createFilterUI(minPrice, maxPrice) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'price-filter';
    filterContainer.innerHTML = `
      <h3>Filtrar por Precio</h3>
      <input type="range" id="minPrice" min="${minPrice}" max="${maxPrice}" value="${minPrice}">
      <input type="range" id="maxPrice" min="${minPrice}" max="${maxPrice}" value="${maxPrice}">
      <p>$<span id="minDisplay">${minPrice}</span> - $<span id="maxDisplay">${maxPrice}</span></p>
    `;

    document.querySelector('.search').insertBefore(filterContainer, document.querySelector('.search__box'));

    document.getElementById('minPrice').addEventListener('input', (e) => {
      document.getElementById('minDisplay').textContent = e.target.value;
      this.filterByPrice();
    });

    document.getElementById('maxPrice').addEventListener('input', (e) => {
      document.getElementById('maxDisplay').textContent = e.target.value;
      this.filterByPrice();
    });
  }

  async filterByPrice() {
    const minPrice = parseInt(document.getElementById('minPrice').value);
    const maxPrice = parseInt(document.getElementById('maxPrice').value);
    const products = await this.dataLoader.getProducts();

    const filtered = products.filter(p => p.price >= minPrice && p.price <= maxPrice);
    this.displayResults(filtered);
  }

  displayResults(products) {
    const container = document.querySelector('.search__results');
    container.innerHTML = `
      <div class="search__count">
        <p>Se encontraron <strong>${products.length}</strong> productos</p>
      </div>
      <div class="search__grid">
        ${products.map(p => this.renderCard(p)).join('')}
      </div>
    `;
  }

  renderCard(product) {
    return `
      <div class="search-card" onclick="window.location.href='product.html?id=${product.id}'">
        <img src="${product.images.thumb}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="search-card__category">${product.category}</p>
        <div class="search-card__price">
          <span>${Utils.formatPrice(product.price)}</span>
        </div>
      </div>
    `;
  }
}
```

### Agregar Carrito de Compras

**Archivo: `js/modules/cart.js`**

```javascript
class Cart {
  constructor() {
    this.items = this.loadCart();
    this.init();
  }

  init() {
    this.setupCartButtons();
    this.displayCartCount();
  }

  addItem(productId, quantity = 1) {
    const item = this.items.find(i => i.id === productId);
    if (item) {
      item.quantity += quantity;
    } else {
      this.items.push({ id: productId, quantity });
    }
    this.saveCart();
    this.displayCartCount();
  }

  removeItem(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.saveCart();
    this.displayCartCount();
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  loadCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  displayCartCount() {
    const count = this.getTotal();
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
    }
  }

  setupCartButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-add-to-cart')) {
        const productId = e.target.dataset.productId;
        this.addItem(productId);
        alert('✅ Producto agregado al carrito');
      }
    });
  }
}

const cart = new Cart();
```

### Agregar Favoritos

**Archivo: `js/modules/favorites.js`**

```javascript
class Favorites {
  constructor() {
    this.favorites = this.loadFavorites();
    this.init();
  }

  init() {
    this.setupFavoriteButtons();
  }

  addFavorite(productId) {
    if (!this.favorites.includes(productId)) {
      this.favorites.push(productId);
      this.saveFavorites();
    }
  }

  removeFavorite(productId) {
    this.favorites = this.favorites.filter(id => id !== productId);
    this.saveFavorites();
  }

  isFavorite(productId) {
    return this.favorites.includes(productId);
  }

  saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  loadFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  }

  setupFavoriteButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-favorite')) {
        const productId = e.target.dataset.productId;
        if (this.isFavorite(productId)) {
          this.removeFavorite(productId);
          e.target.textContent = '🤍 Agregar a Favoritos';
        } else {
          this.addFavorite(productId);
          e.target.textContent = '❤️ Agregado a Favoritos';
        }
      }
    });
  }
}

const favorites = new Favorites();
```

---

## Ejemplos de Estilos Personalizados

### Agregar Animación de Entrada

**En `css/animations.css`:**

```css
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slideInDown 0.5s ease-in-out;
}
```

### Agregar Efecto Hover en Cards

**En `css/components.css`:**

```css
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(255, 107, 53, 0.3);
}
```

### Agregar Tema Oscuro/Claro

**En `css/variables.css`:**

```css
/* Tema claro */
@media (prefers-color-scheme: light) {
  :root {
    --color-bg: #FFFFFF;
    --color-text: #000000;
    --color-border: #EEEEEE;
  }
}

/* Tema oscuro (por defecto) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0F0F0F;
    --color-text: #FFFFFF;
    --color-border: #333333;
  }
}
```

---

## Ejemplos de Integración

### Integrar con Stripe

```javascript
// En product.html, agregar:
<script src="https://js.stripe.com/v3/"></script>

// En js/modules/payment.js:
class StripePayment {
  constructor() {
    this.stripe = Stripe('pk_test_YOUR_KEY');
  }

  async checkout(productId) {
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    const session = await response.json();
    await this.stripe.redirectToCheckout({ sessionId: session.id });
  }
}
```

### Integrar con WhatsApp

```javascript
class WhatsAppIntegration {
  sendMessage(productId, productName) {
    const message = `Hola, me interesa el producto: ${productName}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/56912345678?text=${encoded}`);
  }
}
```

---

## Conclusión

Estos ejemplos te muestran cómo:
- ✅ Filtrar y buscar productos
- ✅ Agregar nuevas funcionalidades
- ✅ Personalizar el diseño
- ✅ Integrar servicios externos

¡Combina estos ejemplos para crear tu tienda perfecta! 🚀
