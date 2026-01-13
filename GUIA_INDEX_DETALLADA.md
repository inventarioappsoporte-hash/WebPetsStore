# 📖 Guía Detallada del Index - Pets Store

## Estructura Completa del index.html

El index.html tiene 7 secciones principales. Aquí te explico cada una, qué necesitas y cómo configurarla.

---

## 1️⃣ HEADER (Encabezado)

### ¿Qué es?
La barra superior con logo, menú y búsqueda.

### Código HTML
```html
<header class="header">
  <div class="container">
    <div class="header__content">
      <div class="header__logo">
        <h1>🐾 Pets Store</h1>
      </div>
      <nav class="header__nav">
        <a href="index.html" class="nav__link nav__link--active">Home</a>
        <a href="search.html" class="nav__link">Buscar</a>
        <a href="#" class="nav__link">Categorías</a>
        <a href="#" class="nav__link">Contacto</a>
      </nav>
      <div class="header__search">
        <input type="text" class="header__search-input" placeholder="Buscar productos...">
      </div>
    </div>
  </div>
</header>
```

### ¿Qué necesitas?
- ✅ **Logo:** El emoji 🐾 (ya está)
- ✅ **Menú:** Links a las páginas (ya está)
- ✅ **Búsqueda:** Input de texto (ya está)

### ¿Cómo configurarlo?

**Cambiar el nombre/logo:**
```html
<h1>🐾 Pets Store</h1>
<!-- Cambia a: -->
<h1>🐾 Mi Tienda de Mascotas</h1>
<!-- O agrega una imagen: -->
<img src="assets/images/ui/logo.png" alt="Logo">
```

**Cambiar links del menú:**
```html
<a href="index.html" class="nav__link nav__link--active">Home</a>
<!-- Cambia "Home" por lo que quieras -->
```

### Imágenes/Videos Necesarios
- ❌ **Ninguno** - El header no necesita imágenes

### Renderizado
- ✅ **Estático** - Se renderiza directamente en HTML

---

## 2️⃣ HERO SECTION (Sección Principal)

### ¿Qué es?
La imagen grande con el producto destacado, título, precio y botones.

### Código HTML
```html
<section class="hero">
  <div class="hero__content">
    <img src="assets/images/ui/hero-placeholder.jpg" alt="Producto destacado" class="hero__image">
    <div class="hero__overlay">
      <h2 class="hero__title">LO MÁS VENDIDO DE ESTA SEMANA</h2>
      <div class="hero__price">
        <span class="hero__discount">40% OFF</span>
        <span class="hero__price-value">$5.990</span>
      </div>
      <div class="hero__cta">
        <button class="btn btn--secondary">VER PRODUCTO</button>
        <button class="btn btn--primary">COMPRAR AHORA</button>
      </div>
    </div>
  </div>
</section>
```

### ¿Qué necesitas?
- 📸 **1 imagen grande** (1200x500px recomendado)
- 📝 **Título** (ya está: "LO MÁS VENDIDO DE ESTA SEMANA")
- 💰 **Precio y descuento** (se actualiza automáticamente desde JSON)

### ¿Cómo configurarlo?

**Paso 1: Prepara la imagen**
```
Tamaño: 1200x500px (mínimo)
Formato: JPG o PNG
Nombre: hero-bg.jpg
Ubicación: assets/images/ui/
```

**Paso 2: Actualiza la ruta en HTML**
```html
<img src="assets/images/ui/hero-bg.jpg" alt="Producto destacado" class="hero__image">
```

**Paso 3: El precio se actualiza automáticamente**
El JavaScript lee el archivo `data/home.json` y obtiene:
- El producto destacado (productId)
- El precio
- El descuento

### Archivo de Configuración: data/home.json
```json
{
  "hero": {
    "productId": "prod_001",
    "title": "LO MÁS VENDIDO DE ESTA SEMANA",
    "cta": "COMPRAR AHORA",
    "ctaSecondary": "VER PRODUCTO"
  }
}
```

### Imágenes/Videos Necesarios
- 📸 **1 imagen** (hero-bg.jpg o similar)
  - Tamaño: 1200x500px
  - Ubicación: `assets/images/ui/`

### Renderizado
- 🔄 **Dinámico** - JavaScript actualiza precio y descuento desde `data/home.json`

---

## 3️⃣ PROMOS BAR (Barra de Promociones)

### ¿Qué es?
Barra con 4 promociones (Oferta Flash, 2x1, Envío Gratis, 6 Cuotas).

### Código HTML
```html
<section class="promos">
  <div class="container">
    <div class="promos__grid">
      <!-- Renderizado por JS -->
    </div>
  </div>
</section>
```

### ¿Qué necesitas?
- ✅ **Nada** - Se renderiza automáticamente desde JSON

### ¿Cómo configurarlo?

**Archivo: data/home.json**
```json
{
  "promos": [
    {
      "icon": "⚡",
      "text": "OFERTA FLASH"
    },
    {
      "icon": "🎁",
      "text": "2x1 IRRESISTIBLE"
    },
    {
      "icon": "🚚",
      "text": "ENVÍO GRATIS"
    },
    {
      "icon": "💳",
      "text": "6 CUOTAS SIN INTERÉS"
    }
  ]
}
```

**Para cambiar las promociones:**
1. Edita `data/home.json`
2. Cambia los emojis y textos
3. Guarda y recarga la página

### Imágenes/Videos Necesarios
- ❌ **Ninguno** - Solo usa emojis

### Renderizado
- 🔄 **Dinámico** - JavaScript lee `data/home.json` y renderiza

---

## 4️⃣ SECCIONES DE PRODUCTOS (4 Carruseles/Grids)

### ¿Qué es?
4 secciones con productos:
1. 🔥 TOP DESCUENTOS HOY (Carrusel)
2. 🎥 CON VIDEO (Carrusel)
3. ⭐ MEJOR VALORADOS (Grid)
4. RECOMENDADO PARA TI (Grid)

### Código HTML
```html
<section class="section" data-section="top-discounts">
  <h2 class="section__title">🔥 TOP DESCUENTOS HOY</h2>
  <div class="section__content carousel">
    <!-- Renderizado por JS -->
  </div>
</section>

<section class="section" data-section="with-video">
  <h2 class="section__title">🎥 CON VIDEO</h2>
  <div class="section__content carousel">
    <!-- Renderizado por JS -->
  </div>
</section>

<section class="section" data-section="best-rated">
  <h2 class="section__title">⭐ MEJOR VALORADOS</h2>
  <div class="section__content grid">
    <!-- Renderizado por JS -->
  </div>
</section>

<section class="section" data-section="featured">
  <h2 class="section__title">RECOMENDADO PARA TI</h2>
  <div class="section__content grid">
    <!-- Renderizado por JS -->
  </div>
</section>
```

### ¿Qué necesitas?
- 📸 **Imágenes de productos** (cover + thumb)
- 🎥 **Videos** (opcional, solo para sección "CON VIDEO")
- 📝 **Datos en JSON**

### ¿Cómo configurarlo?

**Paso 1: Prepara las imágenes**

Para cada producto necesitas:
```
assets/images/products/prod_001/
├── cover.jpg      (1200x1200px) - Imagen principal
├── thumb.jpg      (300x300px)   - Thumbnail para carrusel
└── 1.jpg, 2.jpg   (800x800px)   - Galería
```

**Paso 2: Prepara los videos (opcional)**

```
assets/videos/
├── prod_001.mp4   (5-8 segundos, muted)
└── prod_002.mp4
```

**Paso 3: Configura en data/products.json**

```json
{
  "id": "prod_001",
  "name": "Juguete Mordillo Resistente Premium",
  "category": "Perros",
  "price": 5990,
  "discount": 40,
  "rating": 4.8,
  "reviews": 342,
  "featured": true,
  "topDiscount": true,
  "hasVideo": true,
  "tags": ["juguete", "perros"],
  "images": {
    "cover": "assets/images/products/prod_001/cover.jpg",
    "thumb": "assets/images/products/prod_001/thumb.jpg",
    "gallery": [
      "assets/images/products/prod_001/1.jpg",
      "assets/images/products/prod_001/2.jpg"
    ]
  },
  "video": {
    "url": "assets/videos/prod_001.mp4",
    "duration": 8,
    "autoplay": true,
    "muted": true,
    "loop": true
  }
}
```

**Paso 4: Configura qué aparece en cada sección (data/home.json)**

```json
{
  "sections": [
    {
      "id": "top-discounts",
      "title": "🔥 TOP DESCUENTOS HOY",
      "type": "carousel",
      "filter": { "topDiscount": true },
      "sortBy": "discount",
      "limit": 8,
      "showVideo": true
    },
    {
      "id": "with-video",
      "title": "🎥 CON VIDEO",
      "type": "carousel",
      "filter": { "hasVideo": true },
      "sortBy": "rating",
      "limit": 6
    },
    {
      "id": "best-rated",
      "title": "⭐ MEJOR VALORADOS",
      "type": "grid",
      "filter": { "rating": { "$gte": 4.5 } },
      "sortBy": "rating",
      "limit": 12
    },
    {
      "id": "featured",
      "title": "RECOMENDADO PARA TI",
      "type": "grid",
      "filter": { "featured": true },
      "limit": 6
    }
  ]
}
```

### Explicación de Filtros

| Filtro | Significado | Ejemplo |
|--------|-------------|---------|
| `topDiscount: true` | Productos con descuento | Aparecen en "TOP DESCUENTOS" |
| `hasVideo: true` | Productos con video | Aparecen en "CON VIDEO" |
| `featured: true` | Productos destacados | Aparecen en "RECOMENDADO" |
| `rating: { "$gte": 4.5 }` | Calificación >= 4.5 | Aparecen en "MEJOR VALORADOS" |

### Imágenes/Videos Necesarios

**Mínimo para empezar:**
- 📸 **8 productos** con:
  - cover.jpg (1200x1200px)
  - thumb.jpg (300x300px)
- 🎥 **4 videos** (5-8 segundos, MP4)

**Estructura de carpetas:**
```
assets/
├── images/
│   └── products/
│       ├── prod_001/
│       │   ├── cover.jpg
│       │   ├── thumb.jpg
│       │   └── 1.jpg
│       ├── prod_002/
│       ├── prod_003/
│       └── ...
└── videos/
    ├── prod_001.mp4
    ├── prod_002.mp4
    └── ...
```

### Renderizado
- 🔄 **Dinámico** - JavaScript lee `data/products.json` y `data/home.json`

---

## 5️⃣ TESTIMONIALS (Sección de Testimonios)

### ¿Qué es?
Sección que dice "MÁS DE 10.000 CLIENTES FELICES".

### Código HTML
```html
<section class="testimonials">
  <div class="container">
    <h2 class="testimonials__title">MÁS DE 10.000 CLIENTES FELICES</h2>
    <p class="testimonials__subtitle">Ver historias reales →</p>
  </div>
</section>
```

### ¿Qué necesitas?
- ✅ **Nada** - Es solo texto

### ¿Cómo configurarlo?

**Cambiar el texto:**
```html
<h2 class="testimonials__title">MÁS DE 10.000 CLIENTES FELICES</h2>
<!-- Cambia a: -->
<h2 class="testimonials__title">MÁS DE 50.000 CLIENTES SATISFECHOS</h2>
```

### Imágenes/Videos Necesarios
- ❌ **Ninguno**

### Renderizado
- ✅ **Estático** - Se renderiza directamente en HTML

---

## 6️⃣ FOOTER (Pie de Página)

### ¿Qué es?
Información de contacto, categorías y copyright.

### Código HTML
```html
<footer class="footer">
  <div class="container">
    <div class="footer__content">
      <div class="footer__section">
        <h3>Sobre Pets Store</h3>
        <p>Tu tienda online de confianza para productos premium de mascotas.</p>
      </div>
      <div class="footer__section">
        <h3>Categorías</h3>
        <ul>
          <li><a href="#">Perros</a></li>
          <li><a href="#">Gatos</a></li>
          <li><a href="#">Otros Animales</a></li>
        </ul>
      </div>
      <div class="footer__section">
        <h3>Contacto</h3>
        <p>Email: info@petsstore.com</p>
        <p>Tel: +56 9 XXXX XXXX</p>
      </div>
    </div>
    <div class="footer__bottom">
      <p>&copy; 2024 Pets Store. Todos los derechos reservados.</p>
    </div>
  </div>
</footer>
```

### ¿Qué necesitas?
- ✅ **Nada** - Es solo texto

### ¿Cómo configurarlo?

**Cambiar información:**
```html
<p>Email: info@petsstore.com</p>
<!-- Cambia a: -->
<p>Email: tu-email@tudominio.com</p>

<p>Tel: +56 9 XXXX XXXX</p>
<!-- Cambia a: -->
<p>Tel: +56 9 1234 5678</p>
```

### Imágenes/Videos Necesarios
- ❌ **Ninguno**

### Renderizado
- ✅ **Estático** - Se renderiza directamente en HTML

---

## 📊 RESUMEN DE NECESIDADES

### Imágenes Necesarias

| Sección | Cantidad | Tamaño | Ubicación |
|---------|----------|--------|-----------|
| Hero | 1 | 1200x500px | `assets/images/ui/` |
| Productos (cover) | 8+ | 1200x1200px | `assets/images/products/prod_XXX/` |
| Productos (thumb) | 8+ | 300x300px | `assets/images/products/prod_XXX/` |
| Productos (galería) | 16+ | 800x800px | `assets/images/products/prod_XXX/` |

### Videos Necesarios

| Sección | Cantidad | Duración | Formato | Ubicación |
|---------|----------|----------|---------|-----------|
| Productos | 4+ | 5-8s | MP4 | `assets/videos/` |

### Archivos JSON a Editar

| Archivo | Qué editar |
|---------|-----------|
| `data/products.json` | Agregar tus productos |
| `data/home.json` | Configurar secciones |
| `data/categories.json` | Agregar categorías |

---

## 🚀 GUÍA RÁPIDA PARA EMPEZAR

### Paso 1: Prepara 1 Producto
```
1. Toma una foto (1200x1200px)
2. Crea thumbnail (300x300px)
3. Crea carpeta: assets/images/products/prod_001/
4. Copia las imágenes
```

### Paso 2: Edita data/products.json
```json
{
  "id": "prod_001",
  "name": "Mi Primer Producto",
  "category": "Perros",
  "price": 19990,
  "discount": 20,
  "rating": 4.5,
  "reviews": 50,
  "featured": true,
  "topDiscount": true,
  "hasVideo": false,
  "tags": ["nuevo"],
  "images": {
    "cover": "assets/images/products/prod_001/cover.jpg",
    "thumb": "assets/images/products/prod_001/thumb.jpg",
    "gallery": ["assets/images/products/prod_001/1.jpg"]
  }
}
```

### Paso 3: Recarga index.html
¡Tu producto aparecerá automáticamente!

---

## 📝 CHECKLIST

- [ ] Preparé imagen hero (1200x500px)
- [ ] Preparé 8 productos con imágenes
- [ ] Preparé 4 videos (5-8 segundos)
- [ ] Edité `data/products.json`
- [ ] Edité `data/home.json`
- [ ] Recargué la página
- [ ] Probé en mobile
- [ ] Probé búsqueda
- [ ] Probé carruseles

---

**¡Listo! Ahora sabes exactamente qué necesitas para configurar el index.** 🎉
