# ⚡ Inicio Rápido - Pets Store

## 5 Minutos para Empezar

### 1. Clonar/Descargar

```bash
git clone https://github.com/TU_USUARIO/pets-store.git
cd pets-store
```

### 2. Abrir en Navegador

```bash
# Opción 1: Abre directamente
open index.html

# Opción 2: Con servidor local (Python)
python -m http.server 8000
# Luego ve a http://localhost:8000
```

### 3. Ver el Sitio

✅ Home con productos destacados
✅ Búsqueda en tiempo real
✅ Carruseles Netflix-style
✅ Fichas de producto
✅ Responsive en mobile

---

## Agregar Tu Primer Producto

### Paso 1: Edita `data/products.json`

Agrega este objeto al final del array:

```json
{
  "id": "prod_009",
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
  "description": "Descripción corta",
  "longDescription": "Descripción larga",
  "images": {
    "cover": "assets/images/products/prod_009/cover.jpg",
    "thumb": "assets/images/products/prod_009/thumb.jpg",
    "gallery": ["assets/images/products/prod_009/1.jpg"]
  },
  "specs": {
    "material": "Plástico",
    "size": "Mediano"
  },
  "shipping": {
    "free": true,
    "days": "2-3"
  }
}
```

### Paso 2: Agrega Imágenes

```bash
mkdir -p assets/images/products/prod_009
# Copia tus imágenes aquí:
# - cover.jpg (1200x1200px)
# - thumb.jpg (300x300px)
# - 1.jpg (800x800px)
```

### Paso 3: Recarga el Navegador

¡Tu producto aparecerá automáticamente en la home!

---

## Personalizar Home

Edita `data/home.json`:

```json
{
  "hero": {
    "productId": "prod_001"  // Cambia el producto destacado
  },
  "sections": [
    {
      "id": "top-discounts",
      "title": "🔥 TOP DESCUENTOS",
      "filter": { "topDiscount": true },
      "limit": 8
    }
    // Agrega más secciones aquí
  ]
}
```

---

## Cambiar Colores

Edita `css/variables.css`:

```css
:root {
  --color-primary: #FF6B35;      /* Naranja → Cambia aquí */
  --color-secondary: #004E89;    /* Azul */
  --color-accent: #F7B801;       /* Amarillo */
}
```

---

## Desplegar en GitHub Pages

```bash
# 1. Crea repositorio en GitHub
# 2. Sube los archivos
git add .
git commit -m "Pets Store v1.0"
git push origin main

# 3. Ve a Settings > Pages
# 4. Selecciona "main" branch
# 5. ¡Listo! Tu sitio estará en:
# https://TU_USUARIO.github.io/pets-store
```

---

## Estructura de Carpetas

```
pets-store/
├── index.html              ← Home
├── search.html             ← Búsqueda
├── product.html            ← Ficha de producto
│
├── data/
│   ├── products.json       ← Tus productos aquí
│   ├── home.json           ← Configuración home
│   └── categories.json
│
├── assets/
│   ├── images/products/    ← Imágenes de productos
│   └── videos/             ← Videos de productos
│
├── js/
│   ├── core/               ← Funciones base
│   └── modules/            ← Módulos principales
│
└── css/
    └── *.css               ← Estilos
```

---

## Comandos Útiles

```bash
# Validar JSON
python -m json.tool data/products.json

# Servir localmente
python -m http.server 8000

# Comprimir imágenes (macOS)
sips -Z 1200 assets/images/products/prod_*/cover.jpg

# Contar productos
grep -c '"id"' data/products.json
```

---

## Checklist Inicial

- [ ] Descargué/cloné el proyecto
- [ ] Abrí `index.html` en navegador
- [ ] Agregué mi primer producto
- [ ] Cambié colores en `variables.css`
- [ ] Personalicé `home.json`
- [ ] Probé búsqueda
- [ ] Probé en mobile
- [ ] Creé repositorio en GitHub
- [ ] Desplegué en GitHub Pages

---

## Próximos Pasos

1. **Agregar más productos** → Edita `data/products.json`
2. **Cambiar diseño** → Edita `css/variables.css`
3. **Agregar funcionalidades** → Crea módulos en `js/modules/`
4. **Integrar backend** → Reemplaza `fetch()` en `dataLoader.js`

---

## Ayuda Rápida

**¿Cómo agrego un video?**
- Coloca MP4 en `assets/videos/prod_XXX.mp4`
- Agrega `"hasVideo": true` en el producto
- Listo, aparecerá automáticamente

**¿Cómo cambio el logo?**
- Edita `index.html` línea 30: `<h1>🐾 Pets Store</h1>`
- Reemplaza el emoji o agrega una imagen

**¿Cómo agrego más categorías?**
- Edita `data/categories.json`
- Agrega nuevas categorías al array

**¿Cómo hago que un producto sea destacado?**
- Cambia `"featured": true` en `products.json`
- Aparecerá en la sección "Recomendado para ti"

---

## Recursos

- 📖 [README.md](README.md) - Documentación completa
- 📈 [ESCALABILIDAD.md](ESCALABILIDAD.md) - Cómo crecer
- 🚀 [DESPLIEGUE.md](DESPLIEGUE.md) - Cómo desplegar

---

**¡Bienvenido a Pets Store! 🐾**

Cualquier duda, revisa los archivos `.md` o abre un issue en GitHub.
