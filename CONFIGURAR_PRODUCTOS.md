# 🛍️ Cómo Configurar Productos en Pets Store

## Estado Actual
✅ Ya tienes **8 productos configurados** en `data/products.json`
✅ El hero está configurado para mostrar `prod_001` (Juguete Mordillo)
✅ Las secciones se renderizan automáticamente desde los datos

## Estructura de un Producto

Cada producto en `data/products.json` tiene esta estructura:

```json
{
  "id": "prod_001",                    // ID único
  "name": "Juguete Mordillo Resistente Premium",
  "category": "Perros",                // Categoría principal
  "subcategory": "Juguetes",           // Subcategoría
  "price": 5990,                       // Precio actual
  "originalPrice": 9990,               // Precio original (para descuento)
  "discount": 40,                      // % de descuento
  "stock": 15,                         // Cantidad disponible
  "rating": 4.8,                       // Calificación (0-5)
  "reviews": 342,                      // Cantidad de reseñas
  "featured": true,                    // ¿Aparece en "Recomendado"?
  "topDiscount": true,                 // ¿Aparece en "Top Descuentos"?
  "hasVideo": true,                    // ¿Tiene video?
  "tags": ["juguete", "perros", "mordillo"],  // Para búsqueda
  "description": "Descripción corta",
  "longDescription": "Descripción larga",
  "images": {
    "cover": "assets/images/products/prod_001/cover.jpg",      // Imagen principal
    "thumb": "assets/images/products/prod_001/thumb.jpg",      // Miniatura
    "gallery": [                                                 // Galería
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
  },
  "specs": {
    "material": "Goma natural",
    "size": "Mediano",
    "weight": "250g",
    "colors": ["Azul", "Naranja"]
  },
  "shipping": {
    "free": true,
    "days": "2-3"
  },
  "badge": "🔥 Lo más vendido",
  "promoText": "40% OFF"
}
```

## Cómo Funciona el Flujo

### 1️⃣ Hero Section
- El botón "VER PRODUCTO" lleva al producto configurado en `home.json`
- Actualmente: `prod_001` (Juguete Mordillo)
- Cuando hagas clic, irá a `product.html?id=prod_001`

### 2️⃣ Secciones Dinámicas
Las secciones se renderizan automáticamente según los filtros en `home.json`:

| Sección | Filtro | Resultado |
|---------|--------|-----------|
| 🔥 TOP DESCUENTOS | `topDiscount: true` | Muestra productos con descuento |
| 🎥 CON VIDEO | `hasVideo: true` | Muestra productos con video |
| ⭐ MEJOR VALORADOS | `rating >= 4.5` | Muestra productos mejor calificados |
| RECOMENDADO | `featured: true` | Muestra productos destacados |

### 3️⃣ Búsqueda
- Busca por nombre, categoría y tags
- Funciona en tiempo real en `search.html`

## Cómo Agregar un Nuevo Producto

### Paso 1: Crear la carpeta de imágenes
```
assets/images/products/prod_009/
├── cover.jpg      (1200x1200px - imagen principal)
├── thumb.jpg      (300x300px - miniatura)
├── 1.jpg          (800x800px - galería)
└── 2.jpg          (800x800px - galería)
```

### Paso 2: Agregar video (opcional)
```
assets/videos/prod_009.mp4  (5-8 segundos, MP4)
```

### Paso 3: Agregar el producto a `data/products.json`
Copia este template y modifica:

```json
{
  "id": "prod_009",
  "name": "TU PRODUCTO AQUÍ",
  "category": "Perros",
  "subcategory": "Juguetes",
  "price": 9990,
  "originalPrice": 14990,
  "discount": 33,
  "stock": 20,
  "rating": 4.7,
  "reviews": 150,
  "featured": true,
  "topDiscount": true,
  "hasVideo": false,
  "tags": ["tag1", "tag2", "tag3"],
  "description": "Descripción corta del producto",
  "longDescription": "Descripción larga con más detalles",
  "images": {
    "cover": "assets/images/products/prod_009/cover.jpg",
    "thumb": "assets/images/products/prod_009/thumb.jpg",
    "gallery": [
      "assets/images/products/prod_009/1.jpg",
      "assets/images/products/prod_009/2.jpg"
    ]
  },
  "specs": {
    "material": "Material",
    "size": "Tamaño",
    "weight": "Peso"
  },
  "shipping": {
    "free": true,
    "days": "2-3"
  },
  "badge": "🆕 Nuevo",
  "promoText": "33% OFF"
}
```

### Paso 4: Commit y Push
```bash
git add -A
git commit -m "Add new product: prod_009"
git push origin main
```

## Cómo Cambiar el Producto del Hero

Edita `data/home.json`:

```json
{
  "hero": {
    "productId": "prod_002",  // Cambia a otro producto
    "title": "LO MÁS VENDIDO DE ESTA SEMANA",
    "cta": "COMPRAR AHORA",
    "ctaSecondary": "VER PRODUCTO"
  }
}
```

## Campos Importantes

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| `id` | string | ✅ | Debe ser único (prod_XXX) |
| `name` | string | ✅ | Nombre del producto |
| `price` | number | ✅ | Precio en pesos |
| `images.cover` | string | ✅ | Ruta a imagen principal |
| `category` | string | ✅ | Perros, Gatos, Otros |
| `featured` | boolean | ✅ | Para sección "Recomendado" |
| `topDiscount` | boolean | ✅ | Para sección "Top Descuentos" |
| `hasVideo` | boolean | ✅ | Si tiene video |
| `video` | object | ❌ | Solo si `hasVideo: true` |
| `rating` | number | ✅ | 0-5 estrellas |
| `tags` | array | ✅ | Para búsqueda |

## Qué Ves en la Home

Con los 8 productos actuales:

1. **Hero**: Juguete Mordillo (prod_001)
2. **🔥 TOP DESCUENTOS**: 8 productos con descuento
3. **🎥 CON VIDEO**: 6 productos con video
4. **⭐ MEJOR VALORADOS**: Productos con rating >= 4.5
5. **RECOMENDADO**: Productos con `featured: true`

## Próximos Pasos

1. ✅ Verifica que ves los productos en la home
2. ✅ Haz clic en "VER PRODUCTO" del hero
3. ✅ Navega a `search.html` y busca productos
4. ✅ Cuando tengas imágenes reales, reemplaza las rutas en `products.json`

## Troubleshooting

### No veo productos en la home
- Abre DevTools (F12) → Console
- ¿Hay errores? Cópialo aquí
- Verifica que `data/products.json` esté bien formado (JSON válido)

### El botón "VER PRODUCTO" no funciona
- Verifica que `prod_001` existe en `products.json`
- Verifica que `product.html` existe
- Abre la consola (F12) para ver errores

### Las imágenes no se ven
- Verifica que las rutas en `products.json` sean correctas
- Verifica que los archivos existan en `assets/images/products/`
- Usa rutas relativas: `assets/images/products/prod_001/cover.jpg`

---

**Nota**: Todo funciona sin backend. Los datos se cargan desde JSON y se renderizan con JavaScript.
