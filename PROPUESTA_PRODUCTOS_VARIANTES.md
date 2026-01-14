# Propuesta: Sistema de Productos con Variantes

## 📋 Análisis de la Base de Datos SQLite

### Estructura Actual en SQLite:

**Tabla `productos`:**
- `tiene_variantes`: Flag (0 o 1) que indica si el producto tiene variantes
- Contiene información base del producto (nombre, descripción, categoría, etc.)

**Tabla `variantes`:**
- Define los tipos de variantes disponibles (Talla, Color, Tamaño, Sabor, Tipo, Modelo)
- Cada variante tiene valores posibles en formato JSON

**Tabla `producto_variantes`:**
- Relaciona productos con sus variantes específicas
- `combinacion_variantes`: JSON con la combinación (ej: `{"Color":"Blanco"}` o `{"Talla":"M"}`)
- `precio_final`: Precio específico de esta variante
- `stock_actual`: Stock específico de esta variante
- `sku_variante`: SKU único de la variante
- `foto`: Ruta de imagen específica de la variante (puede ser NULL)

### Ejemplos Encontrados:

1. **SHAMPOO MAXIMO 250 cm3** (ID: 106)
   - Variantes por Color: Blanco, Negro, Bronce
   - Precio: $12,000 para todas
   - Cada una con SKU diferente

2. **Pipetas pulguicida Gato** (ID: 125)
   - Variantes por Tamaño: "GATO 4 KG", "GATO 4 A 8 KG"
   - Precios diferentes: $4,500 y $4,800

3. **COLCHON FANTASIA ESPUMA** (ID: 145)
   - Variantes por Talla: S, M, L, XL
   - Precios escalonados: $20,000, $22,000, $24,000, $26,000

---

## 🎯 Propuesta de Estructura JSON para products.json

### Opción 1: Estructura Inspirada en Mercado Libre (RECOMENDADA)

```json
{
  "id": "prod_106",
  "name": "SHAMPOO MAXIMO 250 cm3",
  "category": "higiene-cuidado",
  "subcategory": "Higiene",
  "hasVariants": true,
  "basePrice": 12000,
  "baseOriginalPrice": 14000,
  "discount": 15,
  "stock": 18,
  "rating": 4.2,
  "reviews": 45,
  "featured": false,
  "topDiscount": false,
  "hasVideo": false,
  "tags": ["shampoo", "higiene", "limpieza", "baño"],
  "description": "Shampoo de alta calidad para el cuidado del pelaje de tu mascota",
  "longDescription": "Shampoo profesional que limpia profundamente y deja el pelaje suave y brillante. Disponible en diferentes colores.",
  
  "variants": {
    "attributes": [
      {
        "id": "color",
        "name": "Color",
        "type": "color"
      }
    ],
    "combinations": [
      {
        "id": "var_106_1",
        "attributes": {
          "color": "Blanco"
        },
        "price": 12000,
        "originalPrice": 14000,
        "stock": 6,
        "sku": "SHA005-BLA",
        "images": {
          "cover": "assets/images/products/prod_106/var_blanco_cover.jpg",
          "thumb": "assets/images/products/prod_106/var_blanco_thumb.jpg",
          "gallery": [
            "assets/images/products/prod_106/var_blanco_1.jpg"
          ]
        },
        "available": true
      },
      {
        "id": "var_106_2",
        "attributes": {
          "color": "Negro"
        },
        "price": 12000,
        "originalPrice": 14000,
        "stock": 6,
        "sku": "SHA005-NEG",
        "images": {
          "cover": "assets/images/products/prod_106/var_negro_cover.jpg",
          "thumb": "assets/images/products/prod_106/var_negro_thumb.jpg",
          "gallery": [
            "assets/images/products/prod_106/var_negro_1.jpg"
          ]
        },
        "available": true
      },
      {
        "id": "var_106_3",
        "attributes": {
          "color": "Bronce"
        },
        "price": 12000,
        "originalPrice": 14000,
        "stock": 6,
        "sku": "SHA005-BRO",
        "images": {
          "cover": "assets/images/products/prod_106/var_bronce_cover.jpg",
          "thumb": "assets/images/products/prod_106/var_bronce_thumb.jpg",
          "gallery": [
            "assets/images/products/prod_106/var_bronce_1.jpg"
          ]
        },
        "available": true
      }
    ]
  },
  
  "images": {
    "cover": "assets/images/products/prod_106/cover.jpg",
    "thumb": "assets/images/products/prod_106/thumb.jpg",
    "gallery": [
      "assets/images/products/prod_106/1.jpg"
    ]
  },
  "specs": {
    "SKU": "SHA005",
    "Volumen": "250 cm3"
  },
  "shipping": {
    "free": false,
    "days": 2
  },
  "badge": "🧼 Higiene",
  "brand": "Maximo",
  "sku": "SHA005",
  "features": [
    "Limpieza profunda",
    "Suaviza el pelaje",
    "Aroma agradable",
    "Fácil enjuague"
  ]
}
```

### Ejemplo con Variantes de Talla y Precios Diferentes:

```json
{
  "id": "prod_145",
  "name": "COLCHON FANTASIA ESPUMA",
  "category": "casa-descanso",
  "subcategory": "Colchonetas",
  "hasVariants": true,
  "basePrice": 20000,
  "baseOriginalPrice": 25000,
  "discount": 20,
  "stock": 40,
  "rating": 4.5,
  "reviews": 89,
  "featured": true,
  "topDiscount": false,
  "hasVideo": false,
  "tags": ["colchon", "descanso", "cama", "espuma"],
  "description": "Colchón de espuma con diseño fantasía para el descanso de tu mascota",
  "longDescription": "Colchón de espuma de alta densidad con diseños divertidos. Disponible en diferentes tallas para adaptarse a tu mascota.",
  
  "variants": {
    "attributes": [
      {
        "id": "size",
        "name": "Talla",
        "type": "size"
      }
    ],
    "combinations": [
      {
        "id": "var_145_1",
        "attributes": {
          "size": "S"
        },
        "price": 20000,
        "originalPrice": 25000,
        "stock": 10,
        "sku": "COL005-S",
        "images": {
          "cover": "assets/images/products/prod_145/var_s_cover.jpg",
          "thumb": "assets/images/products/prod_145/var_s_thumb.jpg",
          "gallery": [
            "assets/images/products/prod_145/var_s_1.jpg"
          ]
        },
        "specs": {
          "Dimensiones": "40x50 cm"
        },
        "available": true
      },
      {
        "id": "var_145_2",
        "attributes": {
          "size": "M"
        },
        "price": 22000,
        "originalPrice": 27500,
        "stock": 10,
        "sku": "COL005-M",
        "images": {
          "cover": "assets/images/products/prod_145/var_m_cover.jpg",
          "thumb": "assets/images/products/prod_145/var_m_thumb.jpg",
          "gallery": [
            "assets/images/products/prod_145/var_m_1.jpg"
          ]
        },
        "specs": {
          "Dimensiones": "50x60 cm"
        },
        "available": true
      },
      {
        "id": "var_145_3",
        "attributes": {
          "size": "L"
        },
        "price": 24000,
        "originalPrice": 30000,
        "stock": 10,
        "sku": "COL005-L",
        "images": {
          "cover": "assets/images/products/prod_145/var_l_cover.jpg",
          "thumb": "assets/images/products/prod_145/var_l_thumb.jpg",
          "gallery": [
            "assets/images/products/prod_145/var_l_1.jpg"
          ]
        },
        "specs": {
          "Dimensiones": "60x70 cm"
        },
        "available": true
      },
      {
        "id": "var_145_4",
        "attributes": {
          "size": "XL"
        },
        "price": 26000,
        "originalPrice": 32500,
        "stock": 10,
        "sku": "COL005-XL",
        "images": {
          "cover": "assets/images/products/prod_145/var_xl_cover.jpg",
          "thumb": "assets/images/products/prod_145/var_xl_thumb.jpg",
          "gallery": [
            "assets/images/products/prod_145/var_xl_1.jpg"
          ]
        },
        "specs": {
          "Dimensiones": "70x90 cm"
        },
        "available": true
      }
    ]
  },
  
  "images": {
    "cover": "assets/images/products/prod_145/cover.jpg",
    "thumb": "assets/images/products/prod_145/thumb.jpg",
    "gallery": [
      "assets/images/products/prod_145/1.jpg"
    ]
  },
  "specs": {
    "SKU": "COL005",
    "Material": "Espuma de alta densidad"
  },
  "shipping": {
    "free": true,
    "days": 3
  },
  "badge": "🛏️ Colchonetas",
  "brand": "Sin marca",
  "sku": "COL005",
  "features": [
    "Espuma de alta densidad",
    "Diseño fantasía",
    "Fácil de limpiar",
    "Antideslizante"
  ]
}
```

---

## 🎨 Comportamiento en la Interfaz de Usuario

### 1. **Vista de Listado (Catálogo/Búsqueda)**
- Mostrar el producto UNA SOLA VEZ
- Usar `basePrice` o el precio de la variante más barata
- Imagen principal del producto (no de variantes)
- Badge indicando "Variantes disponibles" o mostrar rango de precios

### 2. **Vista de Detalle del Producto**
- **Selector de Variantes**: Botones o dropdown para elegir (Color, Talla, etc.)
- **Actualización Dinámica**:
  - Precio cambia según variante seleccionada
  - Imagen cambia a la imagen específica de la variante
  - Stock se muestra de la variante seleccionada
  - SKU se actualiza
- **Indicador Visual**: Mostrar qué variantes están disponibles/agotadas
- **Galería de Imágenes**: Cambiar según la variante seleccionada

### 3. **Carrito de Compras**
- Guardar: `productId` + `variantId`
- Mostrar: "SHAMPOO MAXIMO 250 cm3 - Color: Blanco"
- Precio específico de la variante

---

## 🔧 Modificaciones Necesarias

### 1. **Script de Conversión** (`convertir-productos-sqlite.js`)
- Detectar productos con `tiene_variantes = 1`
- Consultar `producto_variantes` para obtener todas las combinaciones
- Generar estructura JSON con variantes
- Manejar imágenes de variantes (si existen en backup)

### 2. **Componente de Producto** (JavaScript)
- Nuevo componente `VariantSelector.js`
- Lógica para cambiar precio/imagen/stock según selección
- Validación de disponibilidad

### 3. **Vista de Detalle** (`product.html`)
- Agregar UI para selector de variantes
- Actualizar precio dinámicamente
- Cambiar imágenes según variante

### 4. **CSS**
- Estilos para selector de variantes
- Estados: seleccionado, disponible, agotado
- Responsive para móviles

---

## 📊 Ventajas de esta Propuesta

1. ✅ **Compatible con SQLite**: Mapea directamente la estructura existente
2. ✅ **Flexible**: Soporta múltiples tipos de variantes (color, talla, tamaño, etc.)
3. ✅ **Escalable**: Fácil agregar nuevos atributos de variantes
4. ✅ **Precios Independientes**: Cada variante puede tener su propio precio
5. ✅ **Imágenes Específicas**: Cada variante puede tener sus propias fotos
6. ✅ **Stock Individual**: Control de inventario por variante
7. ✅ **SEO Friendly**: Un solo producto con variantes (no duplicados)
8. ✅ **UX Similar a Mercado Libre**: Experiencia familiar para usuarios

---

## 🚀 Plan de Implementación (Propuesto)

### Fase 1: Estructura de Datos
1. Modificar `convertir-productos-sqlite.js` para detectar y convertir productos con variantes
2. Crear script de prueba con 2-3 productos con variantes

### Fase 2: Backend/Lógica
1. Crear `VariantSelector.js` para manejar la lógica de selección
2. Actualizar `dataLoader.js` para cargar productos con variantes

### Fase 3: Frontend/UI
1. Diseñar componente visual de selector de variantes
2. Implementar cambio dinámico de precio/imagen/stock
3. Agregar CSS responsive

### Fase 4: Integración
1. Integrar en `product.html`
2. Actualizar carrito de compras para manejar variantes
3. Testing completo

---

## ❓ Preguntas para Validar

1. ¿Te parece correcta esta estructura JSON?
2. ¿Prefieres que las imágenes de variantes sean obligatorias o opcionales?
3. ¿Quieres que en el listado se muestre el rango de precios (ej: "$20,000 - $26,000")?
4. ¿Algún tipo de variante adicional que debamos considerar?
5. ¿Quieres implementar esto de inmediato o prefieres hacer más ajustes?

---

**Fecha de Propuesta**: 13 de Enero, 2026
