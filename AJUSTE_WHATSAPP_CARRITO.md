# 🔄 Ajuste: Integración WhatsApp con Carrito de Compras

## 📊 Análisis de Implementación Actual

### ✅ Sistema Actual (Compra Directa)

**Ubicación:** `js/core/utils.js` - Función `sendWhatsAppMessage()`

**Flujo actual:**
1. Usuario ve producto en `product.html`
2. Selecciona variante (si aplica)
3. Click en "💬 COMPRAR POR WHATSAPP"
4. Se abre WhatsApp con mensaje pre-formateado
5. Compra individual de UN producto

**Mensaje actual:**
```
¡Hola! 👋

Me interesa comprar:

📦 *Colchón Fantasía*
🔄 Variante: Talla: M
💰 Precio: 17.000
🏷️ Precio original: 20.000
📉 Descuento: 15%
🔖 SKU: COL-M
🎨 Colores disponibles: Gris, Beige

🖼️ Ver imagen: [URL]

¿Cuál es el siguiente paso para comprar?
```

**Archivos involucrados:**
- `js/core/utils.js` - Función `sendWhatsAppMessage()`
- `js/core/constants.js` - Configuración `WHATSAPP.PHONE`
- `js/modules/productPage.js` - Botón "COMPRAR POR WHATSAPP"
- `js/app.js` - Event listener para botón de compra

---

## 🎯 Sistema Propuesto (Con Carrito)

### Nuevo Flujo:

```
Usuario navega → Agrega productos al carrito → Revisa carrito → 
Completa datos → Envía pedido completo por WhatsApp
```

### Cambios Necesarios:

#### 1. **Modificar Botón en `product.html`**

**ANTES:**
```html
<button onclick="Utils.sendWhatsAppMessage(window.currentProduct, window.currentVariant)">
  💬 COMPRAR POR WHATSAPP
</button>
```

**DESPUÉS:**
```html
<button onclick="Cart.addItem(window.currentProduct, 1, window.currentVariant)">
  🛒 AGREGAR AL CARRITO
</button>
```

#### 2. **Crear Nuevo Módulo: `whatsappSender.js`**

**Responsabilidad:** Generar mensaje de pedido completo (múltiples productos)

**Diferencias con función actual:**

| Aspecto | Actual | Nuevo |
|---------|--------|-------|
| Productos | 1 producto | Múltiples productos |
| Datos cliente | No incluye | Nombre, teléfono, observaciones |
| Formato | Simple | Estructurado con totales |
| Origen | Desde página producto | Desde carrito |

**Nuevo formato de mensaje:**
```
🛒 *NUEVO PEDIDO*

👤 *Cliente:* Juan Pérez
📱 *Teléfono:* +54 9 11 1234-5678
📝 *Observaciones:* Entregar por la tarde

---
🛍️ *PRODUCTOS:*

1. Colchón Fantasía (Talla: M)
   Cantidad: 2
   Precio: $17.000 c/u
   Subtotal: $34.000

2. Shampoo Máximo (Color: Blanco)
   Cantidad: 1
   Precio: $10.800
   Subtotal: $10.800

---
💰 *TOTAL: $44.800*

¡Gracias por tu compra! 🐾
```

#### 3. **Mantener Función Original (Opcional)**

**Opción A: Eliminar compra directa**
- Solo carrito, flujo único
- Más simple, menos confusión

**Opción B: Mantener ambas opciones**
- Botón "Comprar Ahora" → WhatsApp directo (actual)
- Botón "Agregar al Carrito" → Flujo con carrito
- Más flexible, pero más complejo

---

## 🔧 Plan de Ajustes

### Fase 1: Crear Infraestructura del Carrito

**Archivos nuevos:**
```
js/modules/cart.js           → Lógica del carrito
js/modules/cartUI.js         → Interfaz visual
js/modules/whatsappSender.js → Generador de mensajes (NUEVO)
css/cart.css                 → Estilos
```

**Función `whatsappSender.js`:**
```javascript
class WhatsAppSender {
  static sendOrder(cartItems, customerData) {
    const phone = CONSTANTS.WHATSAPP.PHONE;
    const message = this.formatOrderMessage(cartItems, customerData);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
  
  static formatOrderMessage(items, customer) {
    // Generar mensaje estructurado con múltiples productos
    let message = `🛒 *NUEVO PEDIDO*\n\n`;
    message += `👤 *Cliente:* ${customer.name}\n`;
    message += `📱 *Teléfono:* ${customer.phone}\n`;
    
    if (customer.notes) {
      message += `📝 *Observaciones:* ${customer.notes}\n`;
    }
    
    message += `\n---\n🛍️ *PRODUCTOS:*\n\n`;
    
    let total = 0;
    items.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      
      message += `${index + 1}. ${item.name}`;
      
      if (item.variant) {
        const attrs = Object.entries(item.variant.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        message += ` (${attrs})`;
      }
      
      message += `\n   Cantidad: ${item.quantity}\n`;
      message += `   Precio: $${item.price.toLocaleString('es-AR')} c/u\n`;
      message += `   Subtotal: $${subtotal.toLocaleString('es-AR')}\n\n`;
    });
    
    message += `---\n💰 *TOTAL: $${total.toLocaleString('es-AR')}*\n\n`;
    message += `¡Gracias por tu compra! 🐾`;
    
    return message;
  }
}
```

### Fase 2: Modificar Páginas Existentes

#### A. `product.html` (productPage.js)

**Cambio en el botón:**
```javascript
// ANTES
<button onclick="Utils.sendWhatsAppMessage(window.currentProduct, window.currentVariant)">
  💬 COMPRAR POR WHATSAPP
</button>

// DESPUÉS - Opción A (Solo carrito)
<button onclick="Cart.addItem(window.currentProduct, 1, window.currentVariant)">
  🛒 AGREGAR AL CARRITO
</button>

// DESPUÉS - Opción B (Ambos botones)
<button onclick="Cart.addItem(window.currentProduct, 1, window.currentVariant)">
  🛒 AGREGAR AL CARRITO
</button>
<button onclick="Utils.sendWhatsAppMessage(window.currentProduct, window.currentVariant)">
  ⚡ COMPRAR AHORA
</button>
```

#### B. `index.html` y `search.html`

**Agregar botón en cards:**
```javascript
// En homeRenderer.js y searchEngine.js
<button onclick="Cart.addItem(product, 1)" class="card__add-to-cart">
  🛒 Agregar
</button>
```

#### C. Header (todas las páginas)

**Agregar badge del carrito:**
```html
<div class="header__cart" onclick="CartUI.toggle()">
  🛒 <span class="cart-badge">0</span>
</div>
```

### Fase 3: Mantener Compatibilidad

**Decisión requerida:**

**¿Qué prefieres?**

1. **Solo Carrito** (Recomendado)
   - ✅ Flujo único, más simple
   - ✅ Mejor experiencia de usuario
   - ✅ Pedidos más organizados
   - ❌ Elimina compra rápida

2. **Carrito + Compra Directa**
   - ✅ Máxima flexibilidad
   - ✅ Mantiene compra rápida
   - ❌ Dos flujos diferentes
   - ❌ Puede confundir usuarios

---

## 📝 Configuración

### Reutilizar configuración existente:

**`js/core/constants.js`** (Ya existe)
```javascript
WHATSAPP: {
  PHONE: '541150192474',
  COUNTRY_CODE: '+54',
}
```

No se requiere `data/config.json` adicional, usamos la configuración existente.

---

## ✅ Resumen de Cambios

### Archivos a CREAR:
1. `js/modules/cart.js` - Lógica del carrito
2. `js/modules/cartUI.js` - Interfaz visual
3. `js/modules/whatsappSender.js` - Mensajes de pedido
4. `css/cart.css` - Estilos

### Archivos a MODIFICAR:
1. `js/modules/productPage.js` - Cambiar botón
2. `js/modules/homeRenderer.js` - Agregar botón en cards
3. `js/modules/searchEngine.js` - Agregar botón en resultados
4. `index.html` - Agregar badge del carrito
5. `product.html` - Agregar badge del carrito
6. `search.html` - Agregar badge del carrito

### Archivos a MANTENER (sin cambios):
1. `js/core/utils.js` - Función `sendWhatsAppMessage()` (opcional)
2. `js/core/constants.js` - Configuración WhatsApp

---

## 🎯 Decisión Requerida

**Antes de continuar, necesito que decidas:**

### Opción 1: Solo Carrito (Recomendado)
- Eliminar botón "COMPRAR POR WHATSAPP"
- Solo botón "AGREGAR AL CARRITO"
- Flujo único y simple

### Opción 2: Carrito + Compra Directa
- Mantener ambos botones
- "AGREGAR AL CARRITO" (principal)
- "COMPRAR AHORA" (secundario, compra directa)

**¿Cuál prefieres?**

---

## 📊 Comparación de Mensajes

### Mensaje Actual (1 producto):
```
¡Hola! 👋
Me interesa comprar:
📦 *Colchón Fantasía*
💰 Precio: 17.000
¿Cuál es el siguiente paso para comprar?
```

### Mensaje Nuevo (Carrito):
```
🛒 *NUEVO PEDIDO*
👤 Cliente: Juan Pérez
📱 Teléfono: +54 9 11 1234-5678

🛍️ PRODUCTOS:
1. Colchón Fantasía (M) x2 = $34.000
2. Shampoo Máximo x1 = $10.800

💰 TOTAL: $44.800
```

**Ventajas del nuevo formato:**
- ✅ Incluye datos del cliente
- ✅ Múltiples productos en un pedido
- ✅ Totales calculados
- ✅ Más profesional
- ✅ Más fácil de procesar

---

## 🚀 Próximos Pasos

Una vez que decidas la opción (1 o 2), procederé a:

1. ✅ Crear módulos del carrito
2. ✅ Crear `whatsappSender.js` con nuevo formato
3. ✅ Modificar páginas según opción elegida
4. ✅ Agregar badge del carrito en header
5. ✅ Testing completo
6. ✅ Documentación

**¿Cuál opción prefieres? (1 o 2)**
