# 📋 SISTEMA DUAL DE IMÁGENES

## 🎯 Concepto

El sistema dual permite usar diferentes tipos de imágenes según el contexto:

- **Portada (Marketing)**: Imágenes ambientadas, hogareñas, publicitarias
- **Página de Producto**: Imágenes específicas del producto con fondo blanco
- **Búsquedas**: Imágenes específicas del producto (thumbnails)

## 🔧 Estructura Técnica

### Campos de imagen por producto:

```json
"images": {
  "cover": "assets/images/products/prod_222/cover.jpg",        // Producto específico (fondo blanco)
  "thumb": "assets/images/products/prod_222/thumb.jpg",        // Producto específico (thumbnail)
  "marketing": "assets/images/ui/cama-victoria.jpeg",          // Imagen publicitaria (ambiente hogareño)
  "gallery": ["assets/images/products/prod_222/1.jpg"]        // Galería de imágenes
}
```

## 📍 Lógica de Uso

| Contexto | Campo Usado | Descripción |
|----------|-------------|-------------|
| **TOP DESCUENTOS HOY** | `marketing` (si existe) o `thumb` | Imágenes ambientadas para marketing |
| **Página de Producto** | `cover` | Siempre imagen con fondo blanco |
| **Búsquedas** | `thumb` | Imagen específica del producto |
| **Otras secciones** | `thumb` | Imagen específica del producto |

## 🚀 Implementación

### 1. Modificaciones en homeRenderer.js

- Agregado parámetro `useMarketingImage` al método `renderProductCard()`
- Lógica condicional para usar imagen de marketing en TOP DESCUENTOS
- Fallback automático a `thumb` si no hay imagen de marketing

### 2. Estructura de archivos

```
assets/images/
├── products/           # Imágenes específicas de productos
│   └── prod_222/
│       ├── cover.jpg   # Fondo blanco (página producto)
│       ├── thumb.jpg   # Thumbnail (búsquedas)
│       └── 1.jpg       # Galería
├── marketing/          # Imágenes publicitarias (futuro)
└── ui/                 # Imágenes de interfaz
    └── cama-victoria.jpeg  # Imagen de marketing actual
```

## ✅ Estado Actual

### FASE 1 - Estructura ✅ COMPLETADA
- [x] Campo `marketing` agregado al JSON
- [x] Lógica dual implementada en homeRenderer.js
- [x] Carpeta `assets/images/marketing/` creada
- [x] Sistema funcional con fallbacks

### FASE 2 - Contenido 🔄 EN PROGRESO
- [x] CAMA VICTORIA: Ambas imágenes disponibles
- [ ] Otros productos: Crear imágenes de marketing gradualmente
- [x] Productos sin marketing: Usan imagen del producto (fallback automático)

### FASE 3 - Funcionalidad ✅ COMPLETADA
- [x] Clicks llevan a página de producto específica
- [x] Página de producto usa imágenes con fondo blanco (`cover`)
- [x] Portada usa imágenes de marketing cuando están disponibles
- [x] Búsquedas usan thumbnails específicos (`thumb`)

## 🎯 Próximos Pasos

1. **Crear imágenes de marketing** para productos destacados
2. **Mover imágenes** de `ui/` a `marketing/` cuando sea apropiado
3. **Optimizar imágenes** para mejor rendimiento
4. **Agregar más productos** con imágenes de marketing

## 🔍 Ejemplo de Uso

```javascript
// En TOP DESCUENTOS HOY
renderProductCard(product, showVideo, true)  // useMarketingImage = true

// En otras secciones
renderProductCard(product, showVideo, false) // useMarketingImage = false
```

El sistema es completamente retrocompatible y funciona automáticamente con productos existentes.