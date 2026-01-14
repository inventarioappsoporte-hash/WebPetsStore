# Corrección de Cálculo de Descuentos en Productos con Variantes

## Problema Detectado

El script `convertir-productos-variantes.js` tenía el descuento **hardcodeado** en la línea 229:

```javascript
const descuento = 20; // ❌ HARDCODEADO
const precioOriginal = Math.round(precioBase * 1.25);
```

Esto significaba que:
- NO se consultaba la tabla `descuentos` de SQLite
- Todos los productos tenían 20% de descuento sin importar su categoría
- No se respetaban los descuentos configurados en la base de datos

## Solución Implementada

### 1. Función `cargarDescuentos()`

Se agregó una función que consulta la tabla `descuentos` de SQLite:

```javascript
function cargarDescuentos() {
    const queryDescuentos = `SELECT id, nombre, tipo, valor, 
        COALESCE(categoria_id, '') as categoria_id, 
        COALESCE(producto_ids, '') as producto_ids 
        FROM descuentos 
        WHERE activo = 1 
        AND (fecha_fin IS NULL OR fecha_fin >= date('now'));`;
    
    // Parsea los resultados y retorna array de descuentos
}
```

### 2. Función `aplicarDescuento()`

Se agregó una función que aplica la lógica de descuentos con prioridad:

1. **Descuentos específicos por producto** (mayor prioridad)
2. **Descuentos por categoría**
3. **Descuentos globales** (menor prioridad)

Si hay múltiples descuentos aplicables, se toma el **mayor**.

### 3. Cálculo Correcto de Precios

Ahora el cálculo es:

```javascript
// Si hay descuento:
// precioBase = precioOriginal * (1 - descuento/100)
// Por lo tanto:
precioOriginal = Math.round(precioBase / (1 - descuentoPorcentaje / 100));

// Para cada variante:
variante.originalPrice = Math.round(variante.price / (1 - descuentoPorcentaje / 100));
```

### 4. Cambio de Separador en SQLite

Para evitar problemas con caracteres especiales (como emojis en nombres de descuentos), se cambió el separador de `|` a `|||`:

```javascript
function ejecutarQuery(query) {
    const result = execSync(`sqlite3 -separator "|||" "${DB_PATH}" "${query}"`, {
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024
    });
    return result.trim();
}
```

## Resultados de Prueba

### Producto 106 - SHAMPOO MAXIMO 250 cm3
- **Categoría**: 250 (Higiene y Cuidado)
- **Descuento aplicado**: 10% (Summer Sale 😎)
- **Precio base**: $12,000
- **Precio original**: $13,333
- **Variantes**: 3 colores (Blanco, Negro, Bronce)
- **originalPrice por variante**: $13,333

### Producto 145 - COLCHON FANTASIA ESPUMA
- **Categoría**: 261 (Colchonetas y Moisés)
- **Descuento aplicado**: 15% (Summer Sale 😎)
- **Precio base**: $20,000 (talla S)
- **Precio original base**: $23,529
- **Variantes**: 4 tallas con precios diferentes
  - S: $20,000 → $23,529
  - M: $22,000 → $25,882
  - L: $24,000 → $28,235
  - XL: $26,000 → $30,588

## Descuentos Activos en la Base de Datos

```
- Por Bulto: 15% (quantity, sin categoría)
- Summer Sale 😎: 30% (Categoría 275 - Ropa Verano)
- Summer Sale 😎: 15% (Categoría 261 - Colchonetas)
- Summer Sale 😎: 15% (Categoría 264 - Juguetes)
- Summer Sale 😎: 15% (Categoría 317 - Collares/Correas)
- Summer Sale 😎: 15% (Categoría 262 - Bolsos)
- Summer Sale 😎: 15% (Categoría 263 - Rascadores)
- Summer Sale 😎: 10% (Categoría 250 - Higiene)
- Summer Sale 😎: 15% (Categoría 409 - Comederos)
- Summer Sale 😎: 20% (Global, sin categoría)
```

## Validación

✅ Los descuentos ahora se consultan desde la base de datos
✅ Se aplica el descuento correcto según la categoría del producto
✅ Los precios originales se calculan correctamente
✅ Cada variante tiene su `originalPrice` calculado según su precio específico
✅ Si no hay descuento, los campos quedan en `null` (comportamiento correcto)

## Archivos Modificados

- `pets-store/convertir-productos-variantes.js`
  - Agregada función `cargarDescuentos()`
  - Agregada función `aplicarDescuento()`
  - Modificada función `ejecutarQuery()` para usar separador `|||`
  - Actualizado parsing de resultados para usar nuevo separador
  - Corregido cálculo de precios originales basado en descuentos reales

## Próximos Pasos

1. ✅ Validar que los descuentos se calculan correctamente (COMPLETADO)
2. Agregar productos con variantes a `data/products.json`
3. Probar en navegador visitando `product.html?id=prod_106` y `product.html?id=prod_145`
