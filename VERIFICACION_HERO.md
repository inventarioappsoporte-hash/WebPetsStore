# ✅ Verificación: Hero Image Working

## Estado Actual
- ✅ Imagen creada: `hero-placeholder.jpg` (1200x500px, 10KB)
- ✅ Ubicación correcta: `assets/images/ui/hero-placeholder.jpg`
- ✅ HTML referencia correcta: línea 42 de `index.html`
- ✅ CSS styling correcto: `home.css` (object-fit: cover)
- ✅ Committed a Git: commit `a495659`
- ✅ Pushed a GitHub: ✓

## Cómo Verificar Localmente

### Opción 1: Python (Recomendado)
```bash
cd C:\WebPetsStore\pets-store
python -m http.server 8000
```
Luego abre: **http://localhost:8000/index.html**

### Opción 2: Node.js
```bash
npx http-server
```

### Opción 3: Live Server (VS Code)
- Click derecho en `index.html` → "Open with Live Server"

## Qué Deberías Ver
- Header con logo "🐾 Pets Store"
- **Imagen naranja grande** (hero section) con overlay oscuro
- Texto "LO MÁS VENDIDO DE ESTA SEMANA"
- Botones "VER PRODUCTO" y "COMPRAR AHORA"

## Si No Ves la Imagen

### Paso 1: Verifica la consola del navegador
- Abre DevTools: **F12**
- Ve a la pestaña **Console**
- ¿Hay errores rojos? Cópialo aquí

### Paso 2: Verifica la pestaña Network
- En DevTools, ve a **Network**
- Recarga la página (Ctrl+F5)
- Busca `hero-placeholder.jpg`
- ¿Qué status code tiene? (200 = OK, 404 = No encontrado)

### Paso 3: Verifica la ruta
- Abre: **http://localhost:8000/assets/images/ui/hero-placeholder.jpg**
- ¿Se ve la imagen naranja directamente?

## En GitHub Pages

Una vez que GitHub Pages esté activado:
1. Ve a: **https://github.com/inventarioappsoporte-hash/WebPetsStore/settings/pages**
2. Verifica que esté en: Branch `main`, Folder `/`
3. Espera 1-2 minutos
4. Abre: **https://inventarioappsoporte-hash.github.io/WebPetsStore/**
5. Recarga con **Ctrl+F5** (hard refresh)

## Próximos Pasos
Una vez confirmado que el hero funciona:
1. Reemplaza `hero-placeholder.jpg` con tu imagen real (1200x500px)
2. Agrega imágenes de productos en `assets/images/products/`
3. Configura `data/products.json` con tus productos
4. Las secciones se renderizarán automáticamente

---
**Nota**: El archivo `.png` que estaba en la carpeta fue eliminado. Solo debe haber `.jpg`
