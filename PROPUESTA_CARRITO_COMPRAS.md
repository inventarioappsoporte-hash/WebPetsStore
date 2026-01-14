# 🛒 Propuesta: Sistema de Carrito de Compras con WhatsApp

## 📋 Análisis de Requisitos

### Requisitos Técnicos ✅
- JavaScript puro (sin frameworks)
- localStorage para persistencia
- Funciona en GitHub Pages (estático)
- Sin backend ni base de datos

### Funcionalidades Requeridas
1. ✅ Agregar productos al carrito
2. ✅ Mostrar listado con nombre, precio, cantidad, subtotal
3. ✅ Calcular total del pedido
4. ✅ Vaciar carrito
5. ✅ Formulario de datos del cliente
6. ✅ Envío por WhatsApp
7. ✅ Persistencia en localStorage
8. ✅ Validaciones completas

## 🎯 Arquitectura Propuesta

### 1. Estructura de Archivos

```
pets-store/
├── js/
│   ├── modules/
│   │   ├── cart.js              # Módulo principal del carrito
│   │   ├── cartUI.js            # Interfaz visual del carrito
│   │   └── whatsappSender.js    # Generador de mensajes WhatsApp
│   └── core/
│       └── storage.js           # Manejo de localStorage (ya existe)
├── css/
│   └── cart.css                 # Estilos del carrito
├── cart.html                    # Página del carrito (opcional)
└── data/
    └── config.json              # Configuración (número WhatsApp)
```

### 2. Componentes del Sistema

#### A. Módulo Cart (cart.js)
**Responsabilidades:**
- Gestión del estado del carrito
- Operaciones CRUD sobre items
- Cálculo de totales
- Persistencia en localStorage

**Métodos principales:**
```javascript
- addItem(product, quantity, variant)
- removeItem(itemId)
- updateQuantity(itemId, quantity)
- clearCart()
- getItems()
- getTotal()
- getItemCount()
```

#### B. Módulo CartUI (cartUI.js)
**Responsabilidades:**
- Renderizado visual del carrito
- Badge con contador de items
- Modal/sidebar del carrito
- Formulario de checkout

**Elementos UI:**
- Badge flotante en header (contador)
- Modal/sidebar deslizable
- Lista de productos con controles
- Formulario de datos del cliente
- Botón de envío a WhatsApp

#### C. Módulo WhatsAppSender (whatsappSender.js)
**Responsabilidades:**
- Formatear mensaje del pedido
- Generar URL de WhatsApp
- Abrir WhatsApp con mensaje pre-cargado

**Formato del mensaje:**
```
🛒 *NUEVO PEDIDO*

👤 *Cliente:* Juan Pérez
📱 *Teléfono:* +54 9 11 1234-5678
📝 *Observaciones:* Entregar por la tarde

---
🛍️ *PRODUCTOS:*

1. Colchón Fantasía Espuma (Talla: M)
   Cantidad: 2
   Precio: $17.000 c/u
   Subtotal: $34.000

2. Shampoo Máximo 250cm3 (Color: Blanco)
   Cantidad: 1
   Precio: $10.800
   Subtotal: $10.800

---
💰 *TOTAL: $44.800*

¡Gracias por tu compra! 🐾
```

### 3. Integración con Sistema Existente

#### Modificaciones Necesarias:

**A. product.html**
- Agregar botón "Agregar al Carrito"
- Integrar con selector de variantes
- Validar variante seleccionada antes de agregar

**B. index.html / search.html**
- Agregar botón "Agregar al Carrito" en cards
- Para productos con variantes: redirigir a página de producto
- Para productos sin variantes: agregar directamente

**C. Header (todas las páginas)**
- Agregar icono de carrito con badge
- Badge muestra cantidad de items
- Click abre modal/sidebar del carrito

### 4. Estructura de Datos

#### Item del Carrito
```javascript
{
  id: "cart_item_1",           // ID único del item en carrito
  productId: "prod_145",        // ID del producto
  name: "Colchón Fantasía",     // Nombre del producto
  price: 17000,                 // Precio unitario (con descuento si aplica)
  originalPrice: 20000,         // Precio original (si hay descuento)
  quantity: 2,                  // Cantidad
  variant: {                    // Variante seleccionada (si aplica)
    id: "var_145_2",
    attributes: { "Talla": "M" },
    sku: "COL-M"
  },
  image: "assets/images/...",   // Imagen del producto
  subtotal: 34000               // Calculado: price * quantity
}
```

#### Configuración WhatsApp
```javascript
{
  whatsapp: {
    countryCode: "54",          // Argentina
    phoneNumber: "9111234567",  // Número del vendedor
    message: {
      greeting: "🛒 *NUEVO PEDIDO*",
      footer: "¡Gracias por tu compra! 🐾"
    }
  }
}
```

## 🎨 Diseño de Interfaz

### 1. Badge del Carrito (Header)
```
┌─────────────────────────────────────┐
│  🏠 Inicio  🔍 Buscar  🛒 (3) ←─────┤ Badge con contador
└─────────────────────────────────────┘
```

### 2. Modal/Sidebar del Carrito
```
┌─────────────────────────────────────┐
│  🛒 Mi Carrito              [X]     │
├─────────────────────────────────────┤
│                                     │
│  📦 Colchón Fantasía (M)            │
│     $17.000 x 2 = $34.000           │
│     [−] 2 [+]  🗑️                   │
│                                     │
│  📦 Shampoo Máximo (Blanco)         │
│     $10.800 x 1 = $10.800           │
│     [−] 1 [+]  🗑️                   │
│                                     │
├─────────────────────────────────────┤
│  💰 Total: $44.800                  │
├─────────────────────────────────────┤
│  [Vaciar Carrito]                   │
│                                     │
│  📝 Datos para el pedido:           │
│  Nombre: [____________]             │
│  Teléfono: [____________]           │
│  Observaciones: [____________]      │
│                                     │
│  [📱 Enviar por WhatsApp]           │
└─────────────────────────────────────┘
```

### 3. Botón "Agregar al Carrito"
```
En product.html:
┌─────────────────────────────────────┐
│  Selecciona variante: [Talla: M ▼]  │
│  Cantidad: [−] 1 [+]                │
│  [🛒 Agregar al Carrito]            │
└─────────────────────────────────────┘

En cards (index/search):
┌──────────────────┐
│   [Imagen]       │
│   Producto       │
│   $17.000        │
│   [🛒 Agregar]   │
└──────────────────┘
```

## 🔧 Funcionalidades Detalladas

### 1. Agregar al Carrito

**Productos SIN variantes:**
- Click en "Agregar" → Agrega directamente con cantidad 1
- Muestra notificación: "✅ Producto agregado"
- Actualiza badge del carrito

**Productos CON variantes:**
- Desde card: Redirige a product.html
- Desde product.html: 
  - Valida que se haya seleccionado variante
  - Valida cantidad > 0
  - Agrega al carrito
  - Muestra notificación

**Productos duplicados:**
- Si el mismo producto+variante ya existe: incrementa cantidad
- Si es variante diferente: agrega como item separado

### 2. Gestión del Carrito

**Modificar cantidad:**
- Botones [−] [+] para incrementar/decrementar
- Mínimo: 1 (si llega a 0, eliminar item)
- Máximo: stock disponible (validación opcional)
- Actualiza subtotal y total en tiempo real

**Eliminar item:**
- Botón 🗑️ elimina el item
- Confirmación opcional: "¿Eliminar este producto?"
- Actualiza totales

**Vaciar carrito:**
- Botón "Vaciar Carrito"
- Confirmación: "¿Vaciar todo el carrito?"
- Limpia localStorage

### 3. Checkout y WhatsApp

**Validaciones:**
- Carrito no vacío
- Nombre completo (mínimo 3 caracteres)
- Teléfono válido (formato flexible)
- Observaciones: opcional

**Proceso de envío:**
1. Validar formulario
2. Generar mensaje formateado
3. Crear URL de WhatsApp: `https://wa.me/549111234567?text=...`
4. Abrir en nueva ventana
5. Mostrar confirmación: "Pedido enviado, te contactaremos pronto"
6. Limpiar carrito
7. Cerrar modal

### 4. Persistencia

**localStorage:**
- Key: `pets-store-cart`
- Formato: JSON array de items
- Se guarda en cada operación
- Se carga al iniciar la página

**Sincronización:**
- Al cargar página: restaurar carrito desde localStorage
- Al agregar/modificar/eliminar: guardar en localStorage
- Al enviar pedido: limpiar localStorage

## 📱 Responsive Design

### Desktop
- Modal centrado (max-width: 500px)
- Badge en header superior derecha

### Mobile
- Sidebar deslizable desde la derecha
- Ocupa 90% del ancho
- Badge flotante en esquina inferior derecha (alternativa)

## ⚠️ Consideraciones Especiales

### 1. Productos con Variantes
- Cada combinación de producto+variante es un item separado
- Mostrar atributos de variante en el carrito
- Usar imagen de la variante si está disponible

### 2. Descuentos
- Mostrar precio original tachado si hay descuento
- Calcular subtotal con precio con descuento
- Incluir en mensaje de WhatsApp

### 3. Stock (Opcional)
- Validar stock disponible al agregar
- Mostrar "Sin stock" si no hay disponibilidad
- Limitar cantidad máxima al stock disponible

### 4. Formato de Teléfono
- Aceptar múltiples formatos
- Limpiar caracteres especiales
- Agregar código de país automáticamente

## 🚀 Plan de Implementación

### Fase 1: Core del Carrito (Día 1)
1. ✅ Crear módulo cart.js
2. ✅ Implementar operaciones básicas
3. ✅ Integrar con localStorage
4. ✅ Tests unitarios

### Fase 2: Interfaz Visual (Día 1-2)
1. ✅ Crear cartUI.js
2. ✅ Diseñar modal/sidebar
3. ✅ Implementar badge con contador
4. ✅ Agregar botones en product.html
5. ✅ Agregar botones en cards

### Fase 3: WhatsApp Integration (Día 2)
1. ✅ Crear whatsappSender.js
2. ✅ Formatear mensaje
3. ✅ Generar URL
4. ✅ Implementar formulario
5. ✅ Validaciones

### Fase 4: Testing y Refinamiento (Día 3)
1. ✅ Pruebas en diferentes navegadores
2. ✅ Pruebas responsive
3. ✅ Ajustes de UX
4. ✅ Documentación

## 📊 Métricas de Éxito

- ✅ Carrito persiste al recargar página
- ✅ Todos los productos se pueden agregar
- ✅ Variantes se manejan correctamente
- ✅ Mensaje de WhatsApp se genera correctamente
- ✅ Validaciones funcionan
- ✅ Responsive en mobile y desktop
- ✅ Sin errores en consola

## 🔒 Seguridad y Privacidad

- No se almacenan datos sensibles
- localStorage es local al navegador
- No hay transmisión de datos a servidores
- WhatsApp maneja la comunicación segura
- Número de teléfono del vendedor en config (no hardcoded)

## 📝 Configuración Requerida

**data/config.json:**
```json
{
  "store": {
    "name": "Pets Store",
    "whatsapp": {
      "countryCode": "54",
      "phoneNumber": "9111234567"
    }
  }
}
```

## ✅ Ventajas de esta Propuesta

1. **Simple y Efectivo**: No requiere backend
2. **Escalable**: Fácil agregar funcionalidades
3. **Mantenible**: Código modular y documentado
4. **Compatible**: Funciona en GitHub Pages
5. **UX Moderna**: Modal/sidebar intuitivo
6. **Integración Natural**: Se integra con sistema existente
7. **Variantes Soportadas**: Maneja productos con variantes
8. **Persistente**: No se pierde al recargar

## 🎯 Resultado Final

El cliente podrá:
1. Navegar la tienda
2. Agregar productos (con o sin variantes)
3. Ver su carrito en tiempo real
4. Modificar cantidades
5. Completar sus datos
6. Enviar pedido por WhatsApp
7. El vendedor recibe mensaje formateado
8. Confirma pago manualmente por WhatsApp

---

## 🤔 ¿Aprobación para Implementar?

**Punto de restauración creado:** ✅ Commit realizado

**Archivos a crear:**
- `js/modules/cart.js`
- `js/modules/cartUI.js`
- `js/modules/whatsappSender.js`
- `css/cart.css`
- `data/config.json`

**Archivos a modificar:**
- `index.html` (agregar botones y badge)
- `product.html` (agregar botón de carrito)
- `search.html` (agregar botones)
- Posiblemente otros archivos HTML

**Tiempo estimado:** 2-3 días de desarrollo

**¿Procedo con la implementación?**
