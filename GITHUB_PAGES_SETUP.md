# 🚀 Activar GitHub Pages - Pets Store

## Pasos para Activar GitHub Pages

### Opción 1: Desde la Web (Recomendado - 2 minutos)

1. **Ve a tu repositorio:**
   https://github.com/inventarioappsoporte-hash/WebPetsStore

2. **Haz clic en "Settings"** (arriba a la derecha)

3. **En el menú izquierdo, busca "Pages"**

4. **En "Source", selecciona:**
   - Branch: `main`
   - Folder: `/ (root)`

5. **Haz clic en "Save"**

6. **Espera 1-2 minutos** (GitHub está procesando)

7. **Tu sitio estará en:**
   ```
   https://inventarioappsoporte-hash.github.io/WebPetsStore
   ```

---

## Opción 2: Usando GitHub CLI

Si tienes GitHub CLI instalado:

```bash
gh repo edit inventarioappsoporte-hash/WebPetsStore \
  --enable-issues \
  --enable-wiki \
  --enable-projects
```

Luego ve a Settings → Pages y configura manualmente.

---

## Opción 3: Usando cURL (Avanzado)

```bash
curl -X POST \
  -H "Authorization: token TU_TOKEN_GITHUB" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/inventarioappsoporte-hash/WebPetsStore/pages \
  -d '{"source":{"branch":"main","path":"/"}}'
```

Reemplaza `TU_TOKEN_GITHUB` con tu token personal.

---

## Verificar que GitHub Pages está Activo

1. Ve a: https://github.com/inventarioappsoporte-hash/WebPetsStore/settings/pages

2. Deberías ver:
   ```
   ✅ Your site is published at https://inventarioappsoporte-hash.github.io/WebPetsStore
   ```

---

## Solucionar Problemas

### "404 - There isn't a GitHub Pages site here"

**Causa:** GitHub Pages no está activado

**Solución:**
1. Ve a Settings → Pages
2. Selecciona Branch: `main`
3. Selecciona Folder: `/ (root)`
4. Haz clic en Save
5. Espera 2-3 minutos

### "Página en blanco"

**Causa:** Archivos no se cargaron correctamente

**Solución:**
1. Verifica que `index.html` esté en la raíz
2. Verifica que los archivos CSS y JS estén en las carpetas correctas
3. Abre la consola del navegador (F12) y busca errores

### "Recursos no se cargan (CSS, JS, imágenes)"

**Causa:** Rutas relativas incorrectas

**Solución:**
En `index.html`, verifica que las rutas sean:
```html
<link rel="stylesheet" href="css/reset.css">
<script src="js/app.js"></script>
```

---

## Después de Activar GitHub Pages

Tu sitio estará disponible en:
```
https://inventarioappsoporte-hash.github.io/WebPetsStore
```

### Próximos Pasos:

1. **Personaliza con tus productos:**
   - Edita `data/products.json`
   - Agrega imágenes en `assets/images/products/`

2. **Cambia colores:**
   - Edita `css/variables.css`

3. **Personaliza home:**
   - Edita `data/home.json`

4. **Haz commit y push:**
   ```bash
   git add .
   git commit -m "Personalización de Pets Store"
   git push origin main
   ```

5. **Tu sitio se actualizará automáticamente en 1-2 minutos**

---

## Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio (ej: petsstore.com):

1. Ve a Settings → Pages
2. En "Custom domain", ingresa tu dominio
3. Configura los DNS de tu dominio:
   - A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - O CNAME: `inventarioappsoporte-hash.github.io`

---

## Verificar Configuración

Ejecuta este comando para verificar:

```bash
git -C pets-store remote -v
```

Deberías ver:
```
origin  https://github.com/inventarioappsoporte-hash/WebPetsStore.git (fetch)
origin  https://github.com/inventarioappsoporte-hash/WebPetsStore.git (push)
```

---

## ¿Necesitas Ayuda?

- **Documentación oficial:** https://docs.github.com/en/pages
- **Troubleshooting:** https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-common-issues-with-github-pages

---

**¡Tu tienda online estará en línea en 2-3 minutos!** 🚀
