# 🔄 Cómo la Página Toma la Imagen del HERO

## Flujo Completo: De la Imagen al Navegador

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. TÚ COLOCAS LA IMAGEN                                   │
│     assets/images/ui/hero-bg.jpg                           │
│                                                             │
│  2. index.html HACE REFERENCIA A LA IMAGEN                 │
│     <img src="assets/images/ui/hero-placeholder.jpg">      │
│                                                             │
│  3. CSS ESTILIZA LA IMAGEN                                 │
│     .hero__image { width: 100%; height: 100%; }            │
│                                                             │
│  4. NAVEGADOR CARGA Y MUESTRA LA IMAGEN                    │
│     ✅ La imagen aparece en la página                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Paso 1: La Imagen en la Carpeta

### Ubicación Actual
```
pets-store/
└── assets/
    └── images/
        └── ui/
            └── hero-bg.jpg  ← TU IMAGEN AQUÍ
```

### Verificar que la Imagen Existe
```
✅ Archivo: hero-bg.jpg
✅ Ubicación: assets/images/ui/
✅ Formato: JPG
✅ Tamaño: 1200x500px
✅ Peso: < 200 KB
```

---

## Paso 2: El HTML Hace Referencia a la Imagen

### Código en index.html (Línea 42)

```html
<!-- Hero Section -->
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

### La Línea Clave
```html
<img src="assets/images/ui/hero-placeholder.jpg" alt="Producto destacado" class="hero__image">
```

**Desglose:**
- `<img>` = Etiqueta de imagen
- `src="assets/images/ui/hero-placeholder.jpg"` = Ruta a la imagen
- `alt="Producto destacado"` = Texto alternativo
- `class="hero__image"` = Clase CSS para estilos

---

## ⚠️ IMPORTANTE: Cambiar la Ruta

### Actualmente dice:
```html
src="assets/images/ui/hero-placeholder.jpg"
```

### Pero TÚ COLOCASTE:
```
assets/images/ui/hero-bg.jpg
```

### NECESITAS CAMBIAR A:
```html
src="assets/images/ui/hero-bg.jpg"
```

---

## Cómo Cambiar la Ruta

### Opción 1: Editar en el Editor de Código

1. Abre `index.html`
2. Busca la línea 42 (o busca "hero-placeholder")
3. Cambia:
   ```html
   <img src="assets/images/ui/hero-placeholder.jpg" ...>
   ```
   Por:
   ```html
   <img src="assets/images/ui/hero-bg.jpg" ...>
   ```
4. Guarda el archivo
5. Recarga la página en el navegador

### Opción 2: Renombrar la Imagen

Si no quieres editar el HTML, simplemente:
1. Renombra tu imagen de `hero-bg.jpg` a `hero-placeholder.jpg`
2. Colócala en `assets/images/ui/`
3. Recarga la página

---

## Paso 3: CSS Estiliza la Imagen

### Código en css/home.css

```css
.hero {
  position: relative;
  height: 500px;
  margin-bottom: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.hero__content {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

**Qué hace:**
- `.hero` = Contenedor principal (500px de alto)
- `.hero__content` = Contenedor de la imagen (100% ancho y alto)
- `.hero__image` = La imagen (ocupa 100% del contenedor)
- `object-fit: cover` = La imagen se adapta sin distorsionarse

---

## Paso 4: El Navegador Carga y Muestra

### Flujo en el Navegador

```
1. Navegador lee index.html
   ↓
2. Encuentra: <img src="assets/images/ui/hero-bg.jpg">
   ↓
3. Busca el archivo en: assets/images/ui/hero-bg.jpg
   ↓
4. Descarga la imagen
   ↓
5. Aplica los estilos CSS
   ↓
6. Muestra la imagen en la página
   ↓
✅ ¡La imagen aparece!
```

---

## Diagrama Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    TU COMPUTADORA                           │
│                                                             │
│  pets-store/                                                │
│  ├── index.html                                             │
│  │   └─ Línea 42: <img src="assets/images/ui/hero-bg.jpg"> │
│  │                                                          │
│  ├── css/                                                   │
│  │   └── home.css                                           │
│  │       └─ .hero__image { width: 100%; }                  │
│  │                                                          │
│  └── assets/                                                │
│      └── images/                                            │
│          └── ui/                                            │
│              └── hero-bg.jpg  ← TU IMAGEN                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    (Navegador carga)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR DEL USUARIO                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🐾 Pets Store    Home  Buscar  Categorías         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              [TU IMAGEN HERO AQUÍ]                 │   │
│  │                                                     │   │
│  │  LO MÁS VENDIDO DE ESTA SEMANA                     │   │
│  │  40% OFF    $5.990                                 │   │
│  │  [VER PRODUCTO]  [COMPRAR AHORA]                   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist: ¿Está Todo Correcto?

- [ ] Imagen colocada en `assets/images/ui/hero-bg.jpg`
- [ ] Imagen es JPG
- [ ] Imagen mide 1200x500px
- [ ] Imagen pesa menos de 200 KB
- [ ] HTML referencia la imagen correctamente
- [ ] Ruta en HTML es: `src="assets/images/ui/hero-bg.jpg"`
- [ ] Archivo index.html está guardado
- [ ] Página recargada en navegador
- [ ] Imagen aparece en la página

---

## Solucionar Problemas

### Problema 1: La Imagen No Aparece

**Causa:** La ruta es incorrecta

**Solución:**
1. Verifica que la imagen esté en: `assets/images/ui/hero-bg.jpg`
2. Verifica que el HTML diga: `src="assets/images/ui/hero-bg.jpg"`
3. Recarga la página (Ctrl+F5 para limpiar caché)

### Problema 2: La Imagen Aparece Distorsionada

**Causa:** La imagen no es 1200x500px

**Solución:**
1. Redimensiona la imagen a 1200x500px
2. Guarda como JPG
3. Reemplaza el archivo
4. Recarga la página

### Problema 3: La Página Carga Lenta

**Causa:** La imagen pesa demasiado

**Solución:**
1. Comprime la imagen (máximo 200 KB)
2. Usa TinyPNG (tinypng.com)
3. Reemplaza el archivo
4. Recarga la página

---

## Cómo Verificar en el Navegador

### Paso 1: Abre la Página
```
1. Abre index.html en el navegador
2. Deberías ver la imagen HERO
```

### Paso 2: Abre la Consola (F12)
```
1. Presiona F12
2. Ve a la pestaña "Elements" o "Inspector"
3. Busca: <img src="assets/images/ui/hero-bg.jpg">
4. Verifica que la ruta sea correcta
```

### Paso 3: Verifica la Imagen
```
1. Haz clic derecho en la imagen
2. Selecciona "Inspeccionar elemento"
3. Verifica que diga: src="assets/images/ui/hero-bg.jpg"
4. Verifica que el tamaño sea 1200x500px
```

---

## Resumen del Flujo

```
1. TÚ COLOCAS LA IMAGEN
   └─ assets/images/ui/hero-bg.jpg

2. HTML HACE REFERENCIA
   └─ <img src="assets/images/ui/hero-bg.jpg">

3. CSS ESTILIZA
   └─ .hero__image { width: 100%; height: 100%; }

4. NAVEGADOR CARGA
   └─ Descarga la imagen desde la carpeta

5. NAVEGADOR MUESTRA
   └─ ✅ La imagen aparece en la página
```

---

## Próximos Pasos

1. ✅ Coloca la imagen en `assets/images/ui/hero-bg.jpg`
2. ✅ Verifica que el HTML diga: `src="assets/images/ui/hero-bg.jpg"`
3. ✅ Recarga la página
4. ✅ ¡La imagen debe aparecer!

Si no aparece, verifica:
- [ ] La ruta es correcta
- [ ] La imagen existe en esa ubicación
- [ ] El navegador está actualizado (Ctrl+F5)
- [ ] No hay errores en la consola (F12)

---

**¿La imagen aparece? ¡Excelente! Ahora puedes agregar más productos.** 🎉
