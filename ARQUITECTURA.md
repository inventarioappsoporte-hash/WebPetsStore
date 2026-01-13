# 🏗️ Arquitectura Técnica - Pets Store

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR DEL USUARIO                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      HTML (Estructura)                       │
│  ├── index.html (Home)                                       │
│  ├── search.html (Búsqueda)                                  │
│  └── product.html (Ficha de Producto)                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    CSS (Presentación)                        │
│  ├── variables.css (Colores, espacios)                       │
│  ├── layout.css (Grid, flexbox)                              │
│  ├── components.css (Botones, cards)                         │
│  └── animations.css (Transiciones)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  JAVASCRIPT (Lógica)                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              CORE (Funciones Base)                   │   │
│  │  ├── dataLoader.js (Carga JSON)                      │   │
│  │  ├── utils.js (Utilidades)                           │   │
│  │  └── constants.js (Constantes)                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                              ↓                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            MODULES (Funcionalidades)                 │   │
│  │  ├── homeRenderer.js (Renderiza home)                │   │
│  │  ├── searchEngine.js (Búsqueda)                      │   │
│  │  ├── productPage.js (Ficha de producto)              │   │
│  │  ├── carousel.js (Carruseles)                        │   │
│  │  └── videoPlayer.js (Reproductor de videos)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                              ↓                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              APP.JS (Orquestador)                    │   │
│  │  Inicializa todos los módulos                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATOS (JSON)                              │
│  ├── products.json (Catálogo)                                │
│  ├── home.json (Configuración home)                          │
│  ├── categories.json (Categorías)                            │
│  └── config.json (Configuración global)                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    ASSETS (Multimedia)                       │
│  ├── images/products/ (Imágenes de productos)                │
│  ├── images/ui/ (Logos, backgrounds)                         │
│  └── videos/ (Videos de productos)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos

### 1. Carga Inicial

```
Usuario abre index.html
        ↓
HTML carga CSS
        ↓
HTML carga JavaScript
        ↓
app.js inicializa
        ↓
dataLoader carga products.json
        ↓
homeRenderer renderiza home
        ↓
searchEngine inicializa búsqueda
        ↓
carousel inicializa carruseles
        ↓
videoPlayer inicializa videos
        ↓
✅ Sitio listo
```

### 2. Búsqueda

```
Usuario escribe en buscador
        ↓
searchEngine.search() se ejecuta
        ↓
Normaliza texto (minúsculas, sin acentos)
        ↓
Filtra products.json por:
  - Nombre
  - Categoría
  - Tags
  - Descripción
        ↓
Renderiza resultados
        ↓
Usuario ve resultados en tiempo real
```

### 3. Navegación a Producto

```
Usuario hace click en card
        ↓
Redirige a product.html?id=prod_001
        ↓
productPage.js obtiene ID de URL
        ↓
dataLoader.getProductById(id)
        ↓
Renderiza ficha completa
        ↓
videoPlayer inicializa video (si existe)
        ↓
Usuario ve detalles del producto
```

---

## Estructura de Datos

### products.json

```
Array de objetos
    ↓
Cada objeto = 1 producto
    ↓
Propiedades:
  - id: Identificador único
  - name: Nombre
  - category: Categoría
  - price: Precio actual
  - discount: % descuento
  - rating: Calificación
  - reviews: # reseñas
  - featured: ¿Destacado?
  - topDiscount: ¿Top descuento?
  - hasVideo: ¿Tiene video?
  - tags: Array de etiquetas
  - images: Objeto con URLs
  - video: Objeto con configuración
  - specs: Especificaciones
  - shipping: Información de envío
```

### home.json

```
Objeto con:
  - hero: Producto destacado
  - promos: Array de promociones
  - sections: Array de secciones
  - testimonials: Configuración testimonios
```

---

## Componentes Principales

### DataLoader

```javascript
class DataLoader {
  // Carga archivos JSON
  load(filename)
  
  // Obtiene productos
  getProducts()
  
  // Obtiene configuración
  getHomeConfig()
  
  // Filtra productos
  filterProducts(criteria)
  
  // Ordena productos
  sortProducts(products, sortBy)
}
```

### HomeRenderer

```javascript
class HomeRenderer {
  // Renderiza home completa
  render()
  
  // Renderiza hero
  renderHero(config, products)
  
  // Renderiza secciones
  renderSection(section, products)
  
  // Renderiza tarjeta de producto
  renderProductCard(product)
}
```

### SearchEngine

```javascript
class SearchEngine {
  // Busca productos
  search(query)
  
  // Muestra resultados
  displayResults(results)
  
  // Renderiza tarjeta de resultado
  renderResultCard(product)
}
```

### ProductPage

```javascript
class ProductPage {
  // Renderiza ficha de producto
  render(product)
  
  // Muestra error
  showError(message)
}
```

### Carousel

```javascript
class Carousel {
  // Inicializa carruseles
  init()
  
  // Configura carrusel
  setupCarousel(carousel)
  
  // Desplaza carrusel
  scroll(carousel, amount)
}
```

### VideoPlayer

```javascript
class VideoPlayer {
  // Inicializa reproductor
  init()
  
  // Abre modal de video
  openVideoModal(productId)
}
```

---

## Flujo de Renderizado

### Home

```
1. Carga home.json
2. Obtiene hero.productId
3. Busca producto en products.json
4. Renderiza imagen + overlay
5. Renderiza promos
6. Para cada sección:
   - Filtra productos según criteria
   - Ordena según sortBy
   - Limita según limit
   - Renderiza tarjetas
7. Renderiza testimonios
```

### Búsqueda

```
1. Usuario escribe en input
2. Debounce 300ms
3. Normaliza texto
4. Filtra products.json
5. Renderiza resultados
6. Usuario ve cambios en tiempo real
```

### Producto

```
1. Obtiene ID de URL
2. Busca en products.json
3. Renderiza:
   - Breadcrumb
   - Galería de imágenes
   - Información del producto
   - Especificaciones
   - Envío
   - Stock
   - Botones de acción
4. Inicializa video (si existe)
```

---

## Caché y Rendimiento

### Caché de Datos

```javascript
// dataLoader cachea JSON
this.cache = {
  'products.json': [...],
  'home.json': {...},
  'categories.json': {...}
}

// Segunda carga es instantánea
```

### Lazy Loading

```javascript
// Imágenes se cargan bajo demanda
<img src="..." loading="lazy">
```

### Debounce en Búsqueda

```javascript
// Espera 300ms después de escribir
// Evita búsquedas innecesarias
```

---

## Escalabilidad

### Agregar Nuevo Módulo

```
1. Crea js/modules/nuevoModulo.js
2. Define clase NuevoModulo
3. Importa en index.html
4. Inicializa en app.js
```

### Agregar Nueva Sección

```
1. Edita data/home.json
2. Agrega objeto a sections[]
3. Define filter, sortBy, limit
4. homeRenderer renderiza automáticamente
```

### Agregar Nuevo Producto

```
1. Edita data/products.json
2. Agrega objeto al array
3. Crea carpeta de imágenes
4. Sitio se actualiza automáticamente
```

---

## Seguridad

### Validación

```javascript
// Valida JSON al cargar
if (!response.ok) throw new Error()

// Valida datos antes de renderizar
if (!product) return
```

### Sanitización

```javascript
// Normaliza búsqueda
Utils.normalizeText(query)

// Evita inyección de código
// (No usamos innerHTML con datos del usuario)
```

### Sin Backend

```
// Sin servidor = sin vulnerabilidades de servidor
// Todo se ejecuta en el cliente
// Datos públicos en JSON
```

---

## Optimizaciones

### CSS

- Variables para reutilización
- Mobile-first responsive
- Transiciones suaves
- Sin frameworks pesados

### JavaScript

- Modular y reutilizable
- Debounce en búsqueda
- Caché de datos
- Event delegation

### Imágenes

- Lazy loading
- Thumbnails pequeños
- Formato optimizado
- Responsive srcset (opcional)

---

## Extensiones Futuras

### Backend

```
Reemplaza fetch() en dataLoader.js
GET /api/products → products.json
GET /api/home → home.json
```

### Base de Datos

```
SQLite → JSON (script)
PostgreSQL → JSON (API)
MongoDB → JSON (API)
```

### Carrito y Checkout

```
localStorage → Carrito temporal
Stripe/PayPal → Pagos
SendGrid → Emails
```

### Autenticación

```
JWT → Tokens
OAuth → Google/Facebook
Sesiones → Cookies
```

---

## Conclusión

Pets Store es una arquitectura:
- ✅ **Modular** - Fácil de extender
- ✅ **Escalable** - Crece sin refactorización
- ✅ **Performante** - Rápido y eficiente
- ✅ **Mantenible** - Código limpio y organizado
- ✅ **Segura** - Sin vulnerabilidades comunes

**Diseñada para crecer de 10 a 10,000 productos sin cambios.** 🚀
