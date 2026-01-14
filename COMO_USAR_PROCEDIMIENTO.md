# 🚀 CÓMO USAR EL PROCEDIMIENTO - Guía Rápida

## ✅ Estado: 100% Validado y Listo

---

## 📋 ¿QUÉ HACE?

Convierte productos de la base SQLite a la tienda web con:
- ✅ Validación de duplicados (no repite productos)
- ✅ Descuentos REALES desde la base de datos
- ✅ Imágenes extraídas automáticamente
- ✅ Tags, especificaciones y características generadas

---

## 🎯 USO BÁSICO

### 1️⃣ VERIFICAR PRIMERO (Recomendado)
```bash
node convertir-productos-sqlite.js --check 250 10 simple
```
**Resultado:** Te muestra qué productos se agregarían y cuáles ya existen (duplicados)

### 2️⃣ AGREGAR PRODUCTOS
```bash
node convertir-productos-sqlite.js 250 10 simple
```
**Resultado:** Agrega 10 productos simples de la categoría 250 a la tienda

---

## 📊 PARÁMETROS

```
node convertir-productos-sqlite.js [--check] [categoria] [limite] [tipo]
```

| Parámetro | Qué es | Ejemplos |
|-----------|--------|----------|
| `--check` | Solo verificar, NO agregar | `--check` |
| `categoria` | ID de categoría (ver tabla abajo) | `250`, `263`, `null` |
| `limite` | Cuántos productos | `10`, `50`, `1000` |
| `tipo` | Tipo de producto | `simple`, `variantes`, `todos` |

---

## 🏷️ CATEGORÍAS DISPONIBLES

| ID | Nombre | Qué incluye |
|----|--------|-------------|
| **250** | HIGIENE Y CUIDADO | Shampoos, productos de limpieza |
| **261** | COLCHONETAS Y MOISES | Camas, colchonetas |
| **262** | BOLSOS Y CASITAS | Casitas, transportadoras |
| **263** | RASCADORES | Rascadores para gatos |
| **264** | JUGUETES | Juguetes interactivos |
| **275** | ROPA VERANO | Ropa ligera |
| **316** | ROPA INVIERNO | Ropa abrigada |
| **317** | COLLARES Y CORREAS | Accesorios de paseo |
| **409** | COMEDEROS Y BEBEDEROS | Alimentación |

---

## 🔢 TIPOS DE PRODUCTO

### `simple` (Recomendado empezar por estos)
- Productos sin variantes
- Un solo precio y stock
- **608 productos disponibles (92.7%)**
- Ejemplo: "SHAMPOO DOUBLE 2 EN 1"

### `variantes`
- Productos con tallas, colores, etc.
- Múltiples combinaciones
- **48 productos disponibles (7.3%)**
- Ejemplo: "ROPA VERANO" (S, M, L, XL)

### `todos`
- Incluye simples y variantes
- **656 productos totales**

---

## 💡 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Agregar 10 Shampoos
```bash
# Paso 1: Verificar
node convertir-productos-sqlite.js --check 250 10 simple

# Paso 2: Si todo está bien, agregar
node convertir-productos-sqlite.js 250 10 simple
```

### Ejemplo 2: Agregar Todos los Rascadores
```bash
# Paso 1: Ver cuántos hay
node convertir-productos-sqlite.js --check 263 1000 simple

# Paso 2: Agregar todos
node convertir-productos-sqlite.js 263 1000 simple
```

### Ejemplo 3: Agregar 20 Juguetes
```bash
# Verificar y agregar
node convertir-productos-sqlite.js --check 264 20 simple
node convertir-productos-sqlite.js 264 20 simple
```

### Ejemplo 4: Agregar Productos Aleatorios
```bash
# 15 productos de cualquier categoría
node convertir-productos-sqlite.js null 15 simple
```

---

## 📊 QUÉ VAS A VER

### Cuando verificas (`--check`):
```
🔍 VERIFICANDO DUPLICADOS...

📊 ANÁLISIS:
✅ 8 productos nuevos para agregar
🚫 2 productos duplicados (se omitirán)

🚫 DUPLICADOS:
   - prod_222: CAMA VICTORIA (Ya existe)

✨ PRODUCTOS NUEVOS:
   - prod_871: ANTEOJOS PARA GATO
   - prod_102: SHAMPOO DOUBLE 2 EN 1
```

### Cuando agregas (sin `--check`):
```
🔄 AGREGANDO PRODUCTOS...

📸 Imagen guardada para producto 102
📸 Imagen guardada para producto 871

📊 RESUMEN:
✅ 8 productos agregados
⚠️  2 productos omitidos (duplicados)
📦 Total en tienda: 45 productos
```

---

## 🛡️ VALIDACIONES AUTOMÁTICAS

El script valida automáticamente:

### 1. Duplicados
- ✅ Por ID: No repite `prod_222` si ya existe
- ✅ Por SKU: No repite código `SHA001` si ya existe

### 2. Descuentos
- ✅ Busca descuentos REALES en la base de datos
- ✅ Aplica el MAYOR descuento si hay varios
- ✅ Calcula correctamente el precio con descuento

**Ejemplo:**
- Producto: ANTEOJOS PARA GATO (ID: 871)
- Descuento encontrado: 20% específico
- Precio original: $8.500
- Precio con descuento: $6.800 ✅

### 3. Datos Completos
- ✅ Extrae todos los campos obligatorios
- ✅ Genera tags automáticamente
- ✅ Crea especificaciones técnicas
- ✅ Agrega características del producto

---

## ⚠️ IMPORTANTE SABER

### Sobre Descuentos
- El `precio_venta` en SQLite es el precio ORIGINAL (sin descuento)
- Los descuentos se buscan en la tabla `descuentos` de SQLite
- Solo se aplica UN descuento por producto (el mayor)
- Si no hay descuento, el producto se muestra a precio normal

### Sobre Productos con Variantes
- Se recomienda crear primero los productos simples
- Los productos con variantes requieren configuración adicional
- Usa `tipo: simple` para empezar

### Sobre Imágenes
- Se extraen automáticamente del backup JSON
- Se guardan en `assets/images/products/prod_XXX/`
- Si no hay imagen, se usa un placeholder

---

## 🎯 RECOMENDACIÓN DE USO

### Fase 1: Productos Simples (Empezar aquí)
```bash
# 1. Higiene (10 productos)
node convertir-productos-sqlite.js --check 250 10 simple
node convertir-productos-sqlite.js 250 10 simple

# 2. Rascadores (15 productos)
node convertir-productos-sqlite.js --check 263 15 simple
node convertir-productos-sqlite.js 263 15 simple

# 3. Juguetes (20 productos)
node convertir-productos-sqlite.js --check 264 20 simple
node convertir-productos-sqlite.js 264 20 simple
```

### Fase 2: Más Categorías
```bash
# Colchonetas
node convertir-productos-sqlite.js 261 10 simple

# Comederos
node convertir-productos-sqlite.js 409 15 simple

# Collares
node convertir-productos-sqlite.js 317 10 simple
```

### Fase 3: Productos con Variantes (Después)
```bash
# Ropa de invierno
node convertir-productos-sqlite.js 316 10 variantes

# Ropa de verano
node convertir-productos-sqlite.js 275 10 variantes
```

---

## 📚 DOCUMENTACIÓN COMPLETA

Para más detalles técnicos, consulta:
- `PROCEDIMIENTO_FINAL_VALIDADO.md` - Documentación completa
- `LOGICA_DESCUENTOS_CORREGIDA.md` - Cómo funcionan los descuentos
- `RESUMEN_FINAL_PROCEDIMIENTO.md` - Resumen de validaciones

---

## ✅ CHECKLIST

Antes de agregar productos:
- [ ] Verificar con `--check` primero
- [ ] Revisar el reporte de duplicados
- [ ] Confirmar que los productos son los correctos

Después de agregar:
- [ ] Verificar que se agregaron correctamente
- [ ] Probar la tienda en el navegador
- [ ] Verificar que las imágenes se ven bien
- [ ] Confirmar que los descuentos son correctos

---

## 🚀 ¡LISTO PARA USAR!

El procedimiento está 100% validado. Puedes empezar a agregar productos con confianza.

**Comando recomendado para empezar:**
```bash
node convertir-productos-sqlite.js --check 250 10 simple
```

¡Éxito! 🎉
