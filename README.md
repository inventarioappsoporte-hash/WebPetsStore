# 🐾 Pets Store - Tienda Online Estática

Tienda online moderna y escalable de productos para mascotas, construida con HTML, CSS y JavaScript puro. Diseño inspirado en Netflix (exploración visual) y Amazon (claridad y precios).

## ✨ Características

- ✅ **100% Estático** - Sin backend, funciona en GitHub Pages
- ✅ **Datos desacoplados** - Productos en JSON, fácil de mantener
- ✅ **Responsive** - Mobile first, funciona en todos los dispositivos
- ✅ **Búsqueda en tiempo real** - Filtrado por nombre, categoría y tags
- ✅ **Carruseles Netflix-style** - Exploración visual fluida
- ✅ **Soporte de videos** - Autoplay en hover, modal fullscreen
- ✅ **Rendimiento** - Lazy loading, caché de datos
- ✅ **Escalable** - Estructura modular y fácil de extender

## 📁 Estructura del Proyecto

```
pets-store/
├── index.html              # Home
├── search.html             # Búsqueda
├── product.html            # Ficha de producto
│
├── assets/
│   ├── images/
│   │   ├── products/       # Imágenes de productos
│   │   ├── ui/             # Logos, backgrounds
│   │   └── placeholders/   # Imágenes por defecto
│   └── videos/             # Videos de productos
│
├── data/
│   ├── products.json       # Catálogo de productos
│   ├── home.json           # Configuración de home
│   ├── categories.json     # Categorías
│   └── config.json         # Configuración global
│
├── js/
│   ├── core/
│   │   ├── constants.js    # Constantes
│   │   ├── utils.js        # Utilidades
│   │   └── dataLoader.js   # Cargador de datos
│   ├── modules/
│   │   ├── homeRenderer.js # Renderizador home
│   │   ├── searchEngine.js # Motor de búsqueda
│   │   ├── productPage.js  # Página de producto
│   │   ├── carousel.js     # Carruseles
│   │   └── videoPlayer.js  # Reproductor de videos
│   └── app.js              # Aplicación principal
│
└── css/
    ├── reset.css           # Reset/normalize
    ├── variables.css       # Variables CSS
    ├── typography.css      # Tipografía
    ├── layout.css          # Grid y flexbox
    ├── components.css      # Componentes
    ├── home.css            # Estilos home
    ├── search.css          # Estilos búsqueda
    ├── product.css         # Estilos producto
    └── animations.css      # Animaciones
```

## 🚀 Cómo Usar

### 1. Agregar Productos

Edita `data/products.json` y agrega nuevos productos:

```json
{
  "id": "prod_009",
  "name": "Nuevo Producto",
  "category": "Perros",
  "price": 19990,
  "discount": 20,
  "rating": 4.5,
  "reviews": 100,
  "featured": true,
  "topDiscount": true,
  "hasVideo": true,
  "tags": ["tag1", "tag2"],
  "description": "Descripción corta",
  "longDescription": "Descripción larga",
  "images": {
    "cover": "assets/images/products/prod_009/cover.jpg",
    "thumb": "assets/images/products/prod_009/thumb.jpg",
    "gallery": ["assets/images/products/prod_009/1.jpg"]
  },
  "video": {
    "url": "assets/videos/prod_009.mp4",
    "duration": 8,
    "autoplay": true,
    "muted": true,
    "loop": true
  },
  "specs": {
    "material": "Valor",
    "size": "Valor"
  },
  "shipping": {
    "free": true,
    "days": "2-3"
  }
}
```

### 2. Organizar Imágenes

```
assets/images/products/prod_009/
├── cover.jpg      # Imagen principal (hero)
├── thumb.jpg      # Thumbnail (carruseles)
├── 1.jpg
├── 2.jpg
└── 3.jpg
```

### 3. Agregar Videos

Coloca videos MP4 en `assets/videos/`:

```
assets/videos/
├── prod_001.mp4
├── prod_002.mp4
└── prod_009.mp4
```

### 4. Personalizar Home

Edita `data/home.json` para cambiar secciones, orden y filtros sin tocar código.

### 5. Desplegar en GitHub Pages

```bash
# 1. Crea un repositorio en GitHub
# 2. Sube los archivos
# 3. Ve a Settings > Pages
# 4. Selecciona "Deploy from a branch"
# 5. Elige "main" y "/root"
# 6. ¡Listo! Tu sitio estará en https://usuario.github.io/pets-store
```

## 🎨 Personalización

### Cambiar Colores

Edita `css/variables.css`:

```css
:root {
  --color-primary: #FF6B35;      /* Naranja */
  --color-secondary: #004E89;    /* Azul */
  --color-accent: #F7B801;       /* Amarillo */
  /* ... más colores */
}
```

### Cambiar Tipografía

Edita `css/typography.css` o importa Google Fonts en `index.html`.

### Agregar Secciones a Home

En `data/home.json`:

```json
{
  "id": "nueva-seccion",
  "title": "Mi Nueva Sección",
  "type": "carousel",
  "filter": { "category": "Gatos" },
  "sortBy": "rating",
  "limit": 8
}
```

## 🔍 Búsqueda

La búsqueda funciona en tiempo real filtrando por:
- Nombre del producto
- Categoría
- Tags
- Descripción

Ejemplo: Busca "perro" o "juguete" y verás resultados instantáneos.

## 📊 Formato de Datos

### products.json

Cada producto debe tener:
- `id`: Identificador único
- `name`: Nombre del producto
- `category`: Categoría principal
- `price`: Precio actual
- `discount`: Porcentaje de descuento (0-100)
- `rating`: Calificación (0-5)
- `reviews`: Número de reseñas
- `featured`: ¿Destacado?
- `topDiscount`: ¿Top descuento?
- `hasVideo`: ¿Tiene video?
- `tags`: Array de etiquetas
- `images`: Objeto con cover, thumb y gallery
- `video`: Objeto con URL y configuración
- `specs`: Especificaciones del producto
- `shipping`: Información de envío

### home.json

Define qué aparece en la home:
- `hero`: Producto destacado
- `promos`: Promociones en barra
- `sections`: Secciones dinámicas
- `testimonials`: Sección de testimonios

## ⚡ Rendimiento

- **Lazy loading** de imágenes
- **Caché** de datos JSON
- **Debounce** en búsqueda
- **CSS optimizado** sin frameworks
- **JavaScript modular** y ligero

## 🛠️ Desarrollo

### Agregar Nueva Funcionalidad

1. Crea un nuevo módulo en `js/modules/`
2. Importa en `index.html`
3. Inicializa en `js/app.js`

### Ejemplo: Agregar Filtro por Precio

```javascript
// En searchEngine.js
filterByPrice(minPrice, maxPrice) {
  return this.products.filter(p => 
    p.price >= minPrice && p.price <= maxPrice
  );
}
```

## 📱 Mobile First

El sitio está optimizado para mobile:
- Tipografía responsive
- Grid adaptativo
- Botones grandes y fáciles de tocar
- Menú optimizado para pantallas pequeñas

## 🔐 Seguridad

- Sin datos sensibles en el cliente
- Sin backend = sin vulnerabilidades de servidor
- Validación de datos en JSON
- Sanitización de entrada en búsqueda

## 📈 Escalabilidad

Para agregar más productos:
1. Simplemente agrega más objetos a `products.json`
2. Organiza imágenes en carpetas
3. El sitio se adapta automáticamente

Probado con 1000+ productos sin problemas de rendimiento.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -m 'Agrega mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

MIT - Libre para usar y modificar

## 📞 Soporte

Para preguntas o problemas:
- Abre un issue en GitHub
- Email: info@petsstore.com

---

**Hecho con ❤️ para amantes de las mascotas**
