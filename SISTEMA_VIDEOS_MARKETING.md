# 🎬 SISTEMA DE VIDEOS DE MARKETING

## 🎯 Concepto Extendido

Extensión del sistema dual de imágenes para incluir **videos de marketing** en TOP DESCUENTOS HOY.

## 🔧 Estructura JSON

### Nuevo campo `marketing`:

```json
"marketing": {
  "type": "video",                                           // "image" o "video"
  "url": "assets/videos/marketing/cama-victoria-demo.mp4",   // Video de marketing
  "poster": "assets/images/ui/cama-victoria.jpeg",           // Imagen de respaldo/poster
  "autoplay": true,
  "muted": true,
  "loop": true,
  "duration": 8
}
```

### Para imágenes de marketing:

```json
"marketing": {
  "type": "image",
  "url": "assets/images/marketing/producto-ambiente.jpg"
}
```

## 📍 Lógica de Uso Extendida

| Contexto | Media Usado | Comportamiento |
|----------|-------------|----------------|
| **TOP DESCUENTOS** | `marketing.video` → `marketing.poster` → `thumb` | Video autoplay muted con fallback |
| **Página Producto** | `images.cover` | Siempre imagen estática (fondo blanco) |
| **Búsquedas** | `images.thumb` | Siempre imagen estática |
| **Otras secciones** | `images.thumb` | Siempre imagen estática |

## 🎬 Características del Video

### Configuración automática:
- **Autoplay**: Sí (muted para cumplir políticas del navegador)
- **Loop**: Sí (reproducción continua)
- **Muted**: Sí (requerido para autoplay)
- **Poster**: Imagen de respaldo mientras carga
- **Preload**: metadata (optimización)

### Fallbacks:
1. **Video no disponible** → Muestra poster
2. **Error de carga** → Muestra poster
3. **No marketing** → Muestra thumb normal

## 🛠️ Implementación Técnica

### 1. Renderizado condicional:
```javascript
if (product.marketing?.type === 'video') {
  // Renderizar video con poster
} else if (product.marketing?.type === 'image') {
  // Renderizar imagen de marketing
} else {
  // Fallback a thumb normal
}
```

### 2. Estilos CSS:
- Videos responsive con `object-fit: cover`
- Badge identificador "🎬 VIDEO"
- Hover effects suaves
- Pointer events disabled (no interfiere con clicks)

### 3. Manejo de errores:
- Console logs para debugging
- Fallback automático a poster
- Graceful degradation

## 📁 Estructura de Archivos

```
assets/
├── videos/
│   ├── marketing/           # Videos de marketing
│   │   ├── cama-victoria-demo.mp4
│   │   └── producto-X-demo.mp4
│   └── products/           # Videos de productos (existente)
├── images/
│   ├── marketing/          # Imágenes de marketing
│   ├── products/           # Imágenes de productos
│   └── ui/                 # Imágenes de interfaz
```

## 🎯 Ventajas

1. **Impacto visual**: Videos llaman más la atención que imágenes estáticas
2. **Demostración**: Mostrar el producto en uso/contexto
3. **Engagement**: Mayor tiempo de permanencia en la sección
4. **Flexibilidad**: Soporte tanto para videos como imágenes
5. **Performance**: Fallbacks garantizan carga rápida

## 🚀 Próximos Pasos

1. **Crear videos de marketing** para productos destacados
2. **Optimizar videos** (formato, tamaño, duración)
3. **A/B testing** para medir impacto en conversiones
4. **Expandir** a otras secciones si es exitoso

## 📊 Métricas a Monitorear

- Tiempo de permanencia en TOP DESCUENTOS
- Click-through rate en productos con video
- Tasa de conversión
- Tiempo de carga de la página

## 🔍 Ejemplo de Uso

```javascript
// En TOP DESCUENTOS HOY
renderProductCard(product, showVideo, true)  // useMarketingMedia = true

// En otras secciones  
renderProductCard(product, showVideo, false) // useMarketingMedia = false
```

El sistema es completamente retrocompatible y degrada graciosamente.