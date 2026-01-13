# 📋 Resumen Visual de Secciones del Index

## Tabla Rápida de Referencia

| Sección | Tipo | Imágenes | Videos | Configuración | Renderizado |
|---------|------|----------|--------|---------------|-------------|
| **Header** | Estático | ❌ No | ❌ No | HTML directo | Estático |
| **Hero** | Dinámico | 📸 1 (1200x500) | ❌ No | `data/home.json` | JS |
| **Promos** | Dinámico | ❌ No | ❌ No | `data/home.json` | JS |
| **Top Descuentos** | Dinámico | 📸 8+ (cover+thumb) | 🎥 Opcional | `data/products.json` | JS |
| **Con Video** | Dinámico | 📸 8+ (cover+thumb) | 🎥 4+ | `data/products.json` | JS |
| **Mejor Valorados** | Dinámico | 📸 8+ (cover+thumb) | ❌ No | `data/products.json` | JS |
| **Recomendado** | Dinámico | 📸 8+ (cover+thumb) | ❌ No | `data/products.json` | JS |
| **Testimonials** | Estático | ❌ No | ❌ No | HTML directo | Estático |
| **Footer** | Estático | ❌ No | ❌ No | HTML directo | Estático |

---

## 🎯 Guía Visual por Sección

### 1. HEADER
```
┌─────────────────────────────────────────────────────┐
│  🐾 Pets Store    Home  Buscar  Categorías  Contacto │
│                   [Buscar productos...]             │
└─────────────────────────────────────────────────────┘
```
- **Imágenes:** ❌ Ninguna
- **Configuración:** HTML directo
- **Cambiar:** Edita el texto en `index.html`

---

### 2. HERO SECTION
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [IMAGEN GRANDE 1200x500px]                        │
│                                                     │
│  LO MÁS VENDIDO DE ESTA SEMANA                     │
│  40% OFF    $5.990                                 │
│  [VER PRODUCTO]  [COMPRAR AHORA]                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- **Imágenes:** 📸 1 imagen (1200x500px)
- **Ubicación:** `assets/images/ui/hero-bg.jpg`
- **Configuración:** `data/home.json` (productId)
- **Cambiar:** 
  1. Prepara imagen 1200x500px
  2. Copia a `assets/images/ui/hero-bg.jpg`
  3. Edita ruta en `index.html` línea 50

---

### 3. PROMOS BAR
```
┌─────────────────────────────────────────────────────┐
│  ⚡ OFERTA FLASH  │  🎁 2x1 IRRESISTIBLE  │  🚚 ENVÍO GRATIS  │  💳 6 CUOTAS  │
└─────────────────────────────────────────────────────┘
```
- **Imágenes:** ❌ Ninguna (solo emojis)
- **Configuración:** `data/home.json` (promos array)
- **Cambiar:**
  1. Edita `data/home.json`
  2. Cambia emojis y textos en `promos[]`

---

### 4. TOP DESCUENTOS HOY (Carrusel)
```
┌─────────────────────────────────────────────────────┐
│  🔥 TOP DESCUENTOS HOY                              │
│  ◀ [CARD] [CARD] [CARD] [CARD] [CARD] ▶            │
│     ↓      ↓      ↓      ↓      ↓                   │
│   Cover  Cover  Cover  Cover  Cover                 │
│   Thumb  Thumb  Thumb  Thumb  Thumb                │
│   (300x300px cada una)                             │
└─────────────────────────────────────────────────────┘
```
- **Imágenes:** 📸 Cover (1200x1200px) + Thumb (300x300px)
- **Videos:** 🎥 Opcional (mostrados en hover)
- **Ubicación:** `assets/images/products/prod_XXX/`
- **Configuración:** `data/products.json` (topDiscount: true)
- **Cambiar:**
  1. Prepara 8+ productos
  2. Copia imágenes a carpetas
  3. Edita `data/products.json`

---

### 5. CON VIDEO (Carrusel)
```
┌─────────────────────────────────────────────────────┐
│  🎥 CON VIDEO                                       │
│  ◀ [CARD▶] [CARD▶] [CARD▶] [CARD▶] [CARD▶] ▶     │
│     ↓       ↓       ↓       ↓       ↓              │
│   Cover   Cover   Cover   Cover   Cover           │
│   Video   Video   Video   Video   Video           │
│   (5-8s MP4)                                       │
└─────────────────────────────────────────────────────┘
```
- **Imágenes:** 📸 Cover (1200x1200px) + Thumb (300x300px)
- **Videos:** 🎥 4+ videos (5-8 segundos, MP4, muted)
- **Ubicación:** `assets/videos/prod_XXX.mp4`
- **Configuración:** `data/products.json` (hasVideo: true)
- **Cambiar:**
  1. Prepara 4+ videos cortos
  2. Copia a `assets/videos/`
  3. Edita `data/products.json` (video object)

---

### 6. MEJOR VALORADOS (Grid)
```
┌─────────────────────────────────────────────────────┐
│  ⭐ MEJOR VALORADOS                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │CARD  │  │CARD  │  │CARD  │  │CARD  │           │
│  │Cover │  │Cover │  │Cover │  │Cover │           │
│  │Thumb │  │Thumb │  │Thumb │  │Thumb │           │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │CARD  │  │CARD  │  │CARD  │  │CARD  │           │
│  │Cover │  │Cover │  │Cover │  │Cover │           │
│  │Thumb │  │Thumb │  │Thumb │  │Thumb │           │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
└─────────────────────────────────────────────────────┘
```
- **Imágenes:** 📸 Cover (1200x1200px) + Thumb (300x300px)
- **Videos:** ❌ No
- **Configuración:** `data/products.json` (rating >= 4.5)
- **Cambiar:**
  1. Asegúrate que tus productos tengan rating >= 4.5
  2. Edita `data/products.json`

---

### 7. RECOMENDADO PARA TI (Grid)
```
┌─────────────────────────────────────────────────────┐
│  RECOMENDADO PARA TI                                │
│  ┌──────┐  ┌──────┐  ┌──────┐                      │
│  │CARD  │  │CARD  │  │CARD  │                      │
│  │Cover │  │Cover │  │Cover │                      │
│  │Thumb │  │Thumb │  │Thumb │                      │
│  └──────┘  └──────┘  └──────┘                      │
└─────────────────────────────────────────────────────┘
```
- **Imágenes:** 📸 Cover (1200x1200px) + Thumb (300x300px)
- **Videos:** ❌ No
- **Configuración:** `data/products.json` (featured: true)
- **Cambiar:**
  1. Marca productos como featured: true
  2. Edita `data/products.json`

---

### 8. TESTIMONIALS
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  MÁS DE 10.000 CLIENTES FELICES                    │
│  Ver historias reales →                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- **Imágenes:** ❌ Ninguna
- **Configuración:** HTML directo
- **Cambiar:** Edita el texto en `index.html`

---

### 9. FOOTER
```
┌─────────────────────────────────────────────────────┐
│  Sobre Pets Store  │  Categorías  │  Contacto      │
│  Descripción       │  • Perros    │  Email: ...    │
│                    │  • Gatos     │  Tel: ...      │
│                    │  • Otros     │                │
├─────────────────────────────────────────────────────┤
│  © 2024 Pets Store. Todos los derechos reservados. │
└─────────────────────────────────────────────────────┘
```
- **Imágenes:** ❌ Ninguna
- **Configuración:** HTML directo
- **Cambiar:** Edita el texto en `index.html`

---

## 📦 Estructura de Carpetas Necesaria

```
pets-store/
├── assets/
│   ├── images/
│   │   ├── ui/
│   │   │   └── hero-bg.jpg          ← 1 imagen (1200x500px)
│   │   └── products/
│   │       ├── prod_001/
│   │       │   ├── cover.jpg        ← 1200x1200px
│   │       │   ├── thumb.jpg        ← 300x300px
│   │       │   ├── 1.jpg            ← 800x800px
│   │       │   └── 2.jpg            ← 800x800px
│   │       ├── prod_002/
│   │       │   ├── cover.jpg
│   │       │   ├── thumb.jpg
│   │       │   └── 1.jpg
│   │       └── ... (más productos)
│   └── videos/
│       ├── prod_001.mp4             ← 5-8 segundos
│       ├── prod_002.mp4
│       └── ... (más videos)
└── data/
    ├── products.json                ← Edita aquí
    ├── home.json                    ← Edita aquí
    └── categories.json
```

---

## 🔄 Flujo de Datos

```
index.html (estructura vacía)
    ↓
app.js (inicia)
    ↓
dataLoader.js (carga JSON)
    ├─ data/products.json
    ├─ data/home.json
    └─ data/categories.json
    ↓
homeRenderer.js (renderiza secciones)
    ├─ Lee home.json
    ├─ Lee products.json
    ├─ Filtra productos según criterios
    ├─ Renderiza HTML dinámicamente
    └─ Inserta imágenes desde assets/
    ↓
carousel.js (inicializa carruseles)
    ├─ Agrega botones ◀ ▶
    └─ Habilita scroll horizontal
    ↓
videoPlayer.js (inicializa videos)
    ├─ Detecta videos en hover
    └─ Abre modal fullscreen
    ↓
✅ Página completa y funcional
```

---

## 📝 Checklist de Configuración

### Paso 1: Prepara Imágenes
- [ ] 1 imagen hero (1200x500px) → `assets/images/ui/hero-bg.jpg`
- [ ] 8+ imágenes cover (1200x1200px) → `assets/images/products/prod_XXX/cover.jpg`
- [ ] 8+ imágenes thumb (300x300px) → `assets/images/products/prod_XXX/thumb.jpg`
- [ ] 16+ imágenes galería (800x800px) → `assets/images/products/prod_XXX/1.jpg`

### Paso 2: Prepara Videos
- [ ] 4+ videos (5-8 segundos, MP4) → `assets/videos/prod_XXX.mp4`

### Paso 3: Edita JSON
- [ ] Edita `data/products.json` con tus productos
- [ ] Edita `data/home.json` si quieres cambiar secciones
- [ ] Edita `data/categories.json` si quieres agregar categorías

### Paso 4: Verifica
- [ ] Recarga `index.html`
- [ ] Verifica que aparezcan las imágenes
- [ ] Verifica que aparezcan los productos
- [ ] Verifica que funcionen los carruseles
- [ ] Verifica que funcionen los videos

---

## 🎯 Ejemplo Completo: Agregar 1 Producto

### 1. Prepara las imágenes
```
Toma una foto de tu producto
├─ Redimensiona a 1200x1200px → cover.jpg
├─ Redimensiona a 300x300px → thumb.jpg
└─ Redimensiona a 800x800px → 1.jpg
```

### 2. Crea la carpeta
```
mkdir assets/images/products/prod_001
```

### 3. Copia las imágenes
```
assets/images/products/prod_001/
├── cover.jpg
├── thumb.jpg
└── 1.jpg
```

### 4. Edita data/products.json
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
  "tags": ["nuevo", "destacado"],
  "images": {
    "cover": "assets/images/products/prod_001/cover.jpg",
    "thumb": "assets/images/products/prod_001/thumb.jpg",
    "gallery": ["assets/images/products/prod_001/1.jpg"]
  }
}
```

### 5. Recarga index.html
¡Tu producto aparecerá automáticamente en todas las secciones!

---

## 🚀 Próximos Pasos

1. **Lee esta guía** (5 min)
2. **Prepara tus imágenes** (30 min)
3. **Prepara tus videos** (20 min)
4. **Edita data/products.json** (15 min)
5. **Recarga index.html** (1 min)
6. **¡Listo!** 🎉

---

**¡Ahora sabes exactamente qué necesitas para cada sección!** 📋
