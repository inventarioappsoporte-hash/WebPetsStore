# 🚀 Guía de Despliegue - Pets Store

## Opción 1: GitHub Pages (Recomendado)

### Paso 1: Crear Repositorio

1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `pets-store`
3. Descripción: "Tienda online de productos para mascotas"
4. Público
5. Crea el repositorio

### Paso 2: Subir Archivos

```bash
# Clona el repositorio
git clone https://github.com/TU_USUARIO/pets-store.git
cd pets-store

# Copia todos los archivos del proyecto aquí
# (index.html, css/, js/, data/, assets/, etc.)

# Agrega los archivos
git add .

# Commit
git commit -m "Inicial: Pets Store v1.0"

# Push
git push origin main
```

### Paso 3: Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: main, folder: / (root)
5. Save

**Tu sitio estará en:** `https://TU_USUARIO.github.io/pets-store`

### Paso 4: Dominio Personalizado (Opcional)

1. Compra un dominio (GoDaddy, Namecheap, etc.)
2. En GitHub Pages settings, agrega tu dominio
3. Configura DNS:
   - A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - CNAME: `TU_USUARIO.github.io`

---

## Opción 2: Netlify

### Paso 1: Conectar Repositorio

1. Ve a [netlify.com](https://netlify.com)
2. Sign up con GitHub
3. Autoriza Netlify
4. Click "New site from Git"
5. Selecciona tu repositorio `pets-store`

### Paso 2: Configurar Build

- Build command: (dejar vacío)
- Publish directory: `/` (root)
- Click "Deploy site"

**Tu sitio estará en:** `https://pets-store-RANDOM.netlify.app`

### Paso 3: Dominio Personalizado

1. Site settings → Domain management
2. Add custom domain
3. Sigue las instrucciones de DNS

---

## Opción 3: Vercel

### Paso 1: Importar Proyecto

1. Ve a [vercel.com](https://vercel.com)
2. Sign up con GitHub
3. Click "New Project"
4. Selecciona `pets-store`
5. Click "Import"

### Paso 2: Configurar

- Framework: Other
- Root Directory: ./
- Click "Deploy"

**Tu sitio estará en:** `https://pets-store.vercel.app`

---

## Opción 4: Servidor Propio (VPS)

### Paso 1: Conectar por SSH

```bash
ssh root@TU_IP_SERVIDOR
```

### Paso 2: Instalar Nginx

```bash
apt update
apt install nginx -y
systemctl start nginx
```

### Paso 3: Desplegar Archivos

```bash
# Clona el repositorio
cd /var/www
git clone https://github.com/TU_USUARIO/pets-store.git

# Configura permisos
chown -R www-data:www-data /var/www/pets-store
chmod -R 755 /var/www/pets-store
```

### Paso 4: Configurar Nginx

Crea `/etc/nginx/sites-available/pets-store`:

```nginx
server {
    listen 80;
    server_name petsstore.com www.petsstore.com;

    root /var/www/pets-store;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
}
```

### Paso 5: Activar Sitio

```bash
ln -s /etc/nginx/sites-available/pets-store /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Paso 6: SSL (HTTPS)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d petsstore.com -d www.petsstore.com
```

---

## Opción 5: Docker

### Dockerfile

```dockerfile
FROM nginx:alpine

COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Construir y Ejecutar

```bash
# Construir imagen
docker build -t pets-store .

# Ejecutar contenedor
docker run -p 80:80 pets-store
```

---

## Checklist Pre-Despliegue

- ✅ Todos los productos tienen imágenes
- ✅ Imágenes están optimizadas
- ✅ Videos están en formato MP4
- ✅ `data/products.json` es válido
- ✅ `data/home.json` es válido
- ✅ Links internos funcionan
- ✅ Búsqueda funciona
- ✅ Responsive en mobile
- ✅ Sin errores en consola
- ✅ Meta tags configurados

---

## Monitoreo Post-Despliegue

### Google Analytics

```html
<!-- Agrega en index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_XXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_XXXX');
</script>
```

### Uptime Monitoring

- [UptimeRobot](https://uptimerobot.com) - Monitoreo gratis
- [Pingdom](https://www.pingdom.com) - Análisis de performance

### SEO

- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

---

## Actualizar Contenido

### Agregar Nuevo Producto

```bash
# 1. Edita data/products.json
# 2. Agrega imágenes en assets/images/products/
# 3. Commit y push

git add .
git commit -m "Agrega nuevo producto: Nombre"
git push origin main

# El sitio se actualiza automáticamente en 1-2 minutos
```

---

## Troubleshooting

### Sitio no carga

- Verifica que `index.html` esté en la raíz
- Revisa la consola del navegador (F12)
- Limpia caché (Ctrl+Shift+Delete)

### Imágenes no se ven

- Verifica rutas en `products.json`
- Asegúrate que las imágenes existan
- Revisa permisos de archivos

### Búsqueda no funciona

- Verifica que `data/products.json` sea válido
- Abre consola (F12) y busca errores
- Recarga la página

### Performance lenta

- Optimiza imágenes (TinyPNG)
- Habilita GZIP en servidor
- Usa CDN para imágenes (Cloudinary, Imgix)

---

## Backup y Recuperación

### Backup Automático

```bash
# Cron job diario
0 2 * * * cd /var/www/pets-store && git pull origin main
```

### Recuperar Versión Anterior

```bash
git log --oneline
git checkout COMMIT_HASH
git push origin main --force
```

---

## Escalabilidad

### Cuando Necesites Backend

1. Crea API en Node.js, Python o Go
2. Reemplaza `fetch()` en `dataLoader.js`
3. Mantén mismo formato JSON
4. Agrega autenticación si es necesario

### CDN para Imágenes

```javascript
// Reemplaza URLs en products.json
// De: assets/images/products/prod_001/cover.jpg
// A: https://cdn.petsstore.com/prod_001/cover.jpg
```

---

## Soporte

- 📧 Email: info@petsstore.com
- 🐛 Issues: GitHub Issues
- 💬 Comunidad: Discussions

---

**¡Tu tienda está lista para el mundo! 🌍**
