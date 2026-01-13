# 🔍 Diagnóstico: ¿Por Qué No Se Ve la Imagen?

## Checklist de Verificación

### 1. ¿La Imagen Existe en la Carpeta Correcta?

```
Verifica que el archivo esté en:
pets-store/assets/images/ui/hero-placeholder.jpg

Pasos:
1. Abre el explorador de archivos
2. Ve a: pets-store/assets/images/ui/
3. Busca: hero-placeholder.jpg
4. ¿Está ahí? ✅ Continúa al paso 2
5. ¿No está? ❌ Copia el archivo a esa ubicación
```

### 2. ¿El Archivo Tiene la Extensión Correcta?

```
Verifica que sea: hero-placeholder.jpg (no .JPG, no .jpeg)

Pasos:
1. Haz clic derecho en el archivo
2. Selecciona "Propiedades" o "Get Info"
3. Verifica la extensión
4. ¿Es .jpg? ✅ Continúa al paso 3
5. ¿Es otra? ❌ Renombra a .jpg
```

### 3. ¿El HTML Referencia la Imagen Correctamente?

```
Verifica que index.html diga:
<img src="assets/images/ui/hero-placeholder.jpg" ...>

Pasos:
1. Abre index.html en un editor de texto
2. Busca: "hero-placeholder"
3. Verifica que diga: src="assets/images/ui/hero-placeholder.jpg"
4. ¿Es correcto? ✅ Continúa al paso 4
5. ¿Es incorrecto? ❌ Corrige la ruta
```

### 4. ¿Recargaste la Página Correctamente?

```
Verifica que hayas recargado sin caché:

Pasos:
1. Abre index.html en el navegador
2. Presiona: Ctrl+F5 (Windows) o Cmd+Shift+R (Mac)
3. Espera a que cargue completamente
4. ¿Aparece la imagen? ✅ ¡Problema resuelto!
5. ¿No aparece? ❌ Continúa al paso 5
```

### 5. ¿Hay Errores en la Consola?

```
Verifica que no haya errores:

Pasos:
1. Abre index.html en el navegador
2. Presiona: F12 (Abrir Consola)
3. Ve a la pestaña "Console"
4. ¿Hay errores rojos? 
   - Si dice: "Failed to load resource: assets/images/ui/hero-placeholder.jpg"
     ❌ La ruta es incorrecta o el archivo no existe
   - Si no hay errores: ✅ Continúa al paso 6
```

### 6. ¿El Archivo Está Corrupto?

```
Verifica que la imagen sea válida:

Pasos:
1. Intenta abrir el archivo directamente
2. ¿Se abre en un visor de imágenes? ✅ El archivo es válido
3. ¿No se abre? ❌ El archivo está corrupto
   - Solución: Vuelve a crear la imagen
```

---

## Soluciones Rápidas

### Solución 1: Limpiar Caché del Navegador

```
Windows:
1. Presiona: Ctrl+Shift+Delete
2. Selecciona: "Imágenes y archivos en caché"
3. Haz clic en: "Borrar datos"
4. Recarga la página: Ctrl+F5

Mac:
1. Presiona: Cmd+Shift+Delete
2. Selecciona: "Imágenes en caché"
3. Haz clic en: "Borrar datos"
4. Recarga la página: Cmd+Shift+R
```

### Solución 2: Usar un Servidor Local

```
En lugar de abrir index.html directamente, usa un servidor:

Python 3:
1. Abre terminal en la carpeta pets-store
2. Ejecuta: python -m http.server 8000
3. Ve a: http://localhost:8000
4. Abre: index.html

Python 2:
1. Abre terminal en la carpeta pets-store
2. Ejecuta: python -m SimpleHTTPServer 8000
3. Ve a: http://localhost:8000
4. Abre: index.html

Node.js:
1. Instala: npm install -g http-server
2. Abre terminal en la carpeta pets-store
3. Ejecuta: http-server
4. Ve a: http://localhost:8080
```

### Solución 3: Verificar la Ruta Exacta

```
Pasos:
1. Abre index.html en un editor
2. Busca la línea con <img src=
3. Verifica que diga exactamente:
   src="assets/images/ui/hero-placeholder.jpg"
   
   NO debe decir:
   - src="./assets/images/ui/hero-placeholder.jpg"
   - src="/assets/images/ui/hero-placeholder.jpg"
   - src="assets/images/ui/hero-placeholder.JPG"
   - src="assets/images/ui/hero-placeholder.jpeg"
```

---

## Árbol de Decisión

```
¿La imagen no se ve?
│
├─ ¿Existe el archivo en assets/images/ui/hero-placeholder.jpg?
│  ├─ NO → Copia el archivo a esa ubicación
│  └─ SÍ → Continúa
│
├─ ¿El HTML dice src="assets/images/ui/hero-placeholder.jpg"?
│  ├─ NO → Corrige la ruta en index.html
│  └─ SÍ → Continúa
│
├─ ¿Recargaste con Ctrl+F5?
│  ├─ NO → Recarga con Ctrl+F5
│  └─ SÍ → Continúa
│
├─ ¿Hay errores en la consola (F12)?
│  ├─ SÍ → Verifica la ruta
│  └─ NO → Continúa
│
├─ ¿El archivo se abre en un visor de imágenes?
│  ├─ NO → El archivo está corrupto, vuelve a crear la imagen
│  └─ SÍ → Continúa
│
└─ ¿Estás usando un servidor local (http://localhost)?
   ├─ NO → Usa un servidor local
   └─ SÍ → ¡Debería funcionar! Contacta soporte
```

---

## Verificación Paso a Paso

### Paso 1: Verifica que el Archivo Existe

```bash
# En Windows (PowerShell):
Test-Path "pets-store/assets/images/ui/hero-placeholder.jpg"

# En Mac/Linux (Terminal):
ls -la pets-store/assets/images/ui/hero-placeholder.jpg
```

### Paso 2: Verifica la Ruta en HTML

```bash
# En Windows (PowerShell):
Select-String -Path "pets-store/index.html" -Pattern "hero-placeholder"

# En Mac/Linux (Terminal):
grep "hero-placeholder" pets-store/index.html
```

### Paso 3: Verifica el Tamaño de la Imagen

```bash
# En Windows (PowerShell):
(Get-Item "pets-store/assets/images/ui/hero-placeholder.jpg").Length

# En Mac/Linux (Terminal):
ls -lh pets-store/assets/images/ui/hero-placeholder.jpg
```

---

## Problemas Comunes y Soluciones

### Problema 1: "Failed to load resource"

```
Error en consola:
Failed to load resource: assets/images/ui/hero-placeholder.jpg

Causa: La ruta es incorrecta o el archivo no existe

Soluciones:
1. Verifica que el archivo esté en: assets/images/ui/hero-placeholder.jpg
2. Verifica que el HTML diga: src="assets/images/ui/hero-placeholder.jpg"
3. Verifica que no haya espacios en blanco en la ruta
4. Verifica que la extensión sea .jpg (no .JPG)
```

### Problema 2: La Imagen Aparece Pero Distorsionada

```
Causa: La imagen no es 1200x500px

Soluciones:
1. Redimensiona la imagen a 1200x500px
2. Guarda como JPG
3. Reemplaza el archivo
4. Recarga la página (Ctrl+F5)
```

### Problema 3: La Página Carga Lenta

```
Causa: La imagen pesa demasiado

Soluciones:
1. Comprime la imagen (máximo 200 KB)
2. Usa TinyPNG (tinypng.com)
3. Reemplaza el archivo
4. Recarga la página (Ctrl+F5)
```

### Problema 4: Abriendo index.html Directamente (file://)

```
Problema: Algunos navegadores no cargan imágenes cuando abres
          index.html directamente (file://...)

Solución: Usa un servidor local

Python 3:
1. Terminal en pets-store
2. Ejecuta: python -m http.server 8000
3. Ve a: http://localhost:8000/index.html

Node.js:
1. Terminal en pets-store
2. Ejecuta: npx http-server
3. Ve a: http://localhost:8080/index.html
```

---

## Verificación en el Navegador

### Paso 1: Abre la Consola (F12)

```
1. Presiona F12
2. Ve a la pestaña "Console"
3. Busca errores rojos
4. Si hay errores, anota el mensaje exacto
```

### Paso 2: Inspecciona la Imagen

```
1. Haz clic derecho en donde debería estar la imagen
2. Selecciona "Inspeccionar elemento"
3. Busca: <img src="assets/images/ui/hero-placeholder.jpg">
4. Verifica que la ruta sea correcta
5. Verifica que el tamaño sea 1200x500px
```

### Paso 3: Verifica la Pestaña Network

```
1. Presiona F12
2. Ve a la pestaña "Network"
3. Recarga la página (Ctrl+F5)
4. Busca: hero-placeholder.jpg
5. ¿Aparece en la lista?
   - SÍ → Verifica el estado (200 = OK, 404 = No encontrado)
   - NO → La ruta es incorrecta
```

---

## Checklist Final

- [ ] El archivo existe en: assets/images/ui/hero-placeholder.jpg
- [ ] El archivo es JPG (no .JPG, no .jpeg)
- [ ] El HTML dice: src="assets/images/ui/hero-placeholder.jpg"
- [ ] Recargaste con Ctrl+F5
- [ ] No hay errores en la consola (F12)
- [ ] El archivo se abre en un visor de imágenes
- [ ] Estás usando un servidor local (http://localhost)
- [ ] La imagen mide 1200x500px
- [ ] La imagen pesa menos de 200 KB

---

## ¿Aún No Funciona?

Si después de todo esto la imagen aún no aparece:

1. Verifica que estés usando un servidor local (http://localhost)
2. Abre la consola (F12) y copia el error exacto
3. Verifica que el archivo sea válido (abre en un visor de imágenes)
4. Intenta con una imagen diferente
5. Contacta soporte con el error exacto

---

**¿Necesitas ayuda? Dime qué ves en la consola (F12) y te ayudaré a resolver.** 🔍
