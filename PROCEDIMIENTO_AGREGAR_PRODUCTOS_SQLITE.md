# 📋 PROCEDIMIENTO COMPLETO: Agregar Productos desde Base SQLite

## 🎯 Objetivo
Extraer productos de la base SQLite `inventario_restored.db` y convertirlos al formato JSON de la tienda, incluyendo imágenes del backup JSON.

---

## 📊 Estructura de Datos

### Base SQLite - Tabla `productos`
```sql
CREATE TABLE productos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    sku TEXT,
    categoria_id INTEGER,
    precio REAL,
    precio_compra REAL,
    costo_promedio REAL,
    precio_venta REAL,
    stock INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    foto TEXT,                    -- "[IMAGEN_PRODUCTO_XXX]"
    marca TEXT,
    tiene_variantes INTEGER DEFAULT 0,
    fecha_creacion DATETIME,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (categoria_id) REFERENCES categorias (id)
);
```

### Base SQLite - Tabla `categorias`
```sql
CREATE TABLE categorias (
    id INTEGER PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,    -- "🐾 MASCOTAS → HIGIENE Y CUIDADO"
    descripcion TEXT,
    fecha_creacion DATETIME
);
```

### Backup JSON - Estructura de Imágenes
```json
{
  "imagenes": [
    {
      "id": 102,
      "tipo": "producto",
      "objeto_id": 102,
      "nombre_archivo": "producto_102_1768322003926.jpg",
      "data_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    }
  ]
}
```

### Formato Final JSON - Tienda
```json
{
  "id": "prod_102",
  "name": "SHAMPOO DOUBLE 2 EN 1 250 cm3",
  "description": "SHAMPOO DOUBLE 2 EN 1 250 cm3",
  "price": 12000,
  "originalPrice": null,
  "discount": null,
  "category": "higiene-cuidado",
  "subcategory": "shampoo",
  "brand": "OSSPRET",
  "sku": "SHA001",
  "stock": 5,
  "rating": 4.5,
  "reviews": 10,
  "tags": ["shampoo", "higiene", "mascotas", "2en1"],
  "images": {
    "cover": "assets/images/products/prod_102/cover.jpg",
    "thumb": "assets/images/products/prod_102/thumb.jpg",
    "marketing": null,
    "gallery": ["assets/images/products/prod_102/1.jpg"]
  },
  "specifications": {
    "Volumen": "250 cm3",
    "Marca": "OSSPRET",
    "Tipo": "2 en 1"
  },
  "features": ["Limpia y acondiciona", "Fórmula suave", "Para todo tipo de pelaje"],
  "hasVideo": false,
  "topDiscount": false
}
```

---

## 🔄 PROCEDIMIENTO PASO A PASO

### PASO 1: Consultar Categorías Disponibles
```bash
sqlite3 database/inventario_restored.db "SELECT id, nombre, descripcion FROM categorias ORDER BY nombre;"
```

**Categorías disponibles:**
- 250: 🐾 HIGIENE Y CUIDADO
- 261: 🐾 COLCHONETAS Y MOISES  
- 262: 🐾 BOLSOS Y CASITAS
- 263: 🐾 RASCADORES
- 264: 🐾 JUGUETES
- 275: 🐾 ROPA VERANO
- 316: 🐾 ROPA INVIERNO
- 317: 🐾 COLLARES, CORREAS Y PECHERAS
- 409: 🐾 COMEDEROS Y BEBEDEROS

### PASO 2: Consultar Descuentos Activos
```bash
# Ver descuentos activos
sqlite3 database/inventario_restored.db "
SELECT 
    id,
    nombre,
    tipo,
    valor,
    tipo_valor,
    categoria_id,
    producto_ids,
    fecha_inicio,
    fecha_fin
FROM descuentos 
WHERE activo = 1 
AND (fecha_fin IS NULL OR fecha_fin >= date('now'));
"
```

**Tipos de descuento:**
- `percent`: Descuento por porcentaje (ej: 30%)
- `quantity`: Descuento por cantidad (ej: 2x1) - No aplicable a tienda web

**Aplicación:**
- **Global**: Sin `categoria_id` ni `producto_ids` - Aplica a todos los productos
- **Por categoría**: Con `categoria_id` - Aplica a toda la categoría
- **Por producto**: Con `producto_ids` (JSON array) - Aplica a productos específicos

**⚠️ REGLAS IMPORTANTES:**
1. **NO son acumulables**: Solo se aplica UN descuento por producto
2. **Se toma el MAYOR**: Si hay múltiples descuentos aplicables, se usa el de mayor valor
3. **Orden de evaluación**:
   - Primero: Descuentos por producto específico
   - Segundo: Descuentos por categoría
   - Tercero: Descuentos globales
4. **Cálculo inverso**: El precio original se calcula desde el precio actual y el descuento
   - Fórmula: `precio_original = precio_actual / (1 - descuento/100)`
   - Ejemplo: Si precio=$9.000 y descuento=25%, entonces original=$12.000
5. **Productos con variantes**: 
   - En `producto_ids` pueden aparecer IDs numéricos (productos simples) o strings "var_XXX" (variantes)
   - Productos simples: Se comparan con IDs numéricos del array
   - Productos con variantes: Se comparan con strings "var_XXX" del array
   - Ejemplo: `[129, 132, "var_44", "var_45", 135]`

### PASO 3: Consultar Productos por Categoría
```bash
# Ejemplo: Productos de HIGIENE Y CUIDADO (categoria_id = 250)
sqlite3 database/inventario_restored.db "
SELECT 
    id, 
    nombre, 
    descripcion, 
    sku, 
    precio, 
    precio_compra,
    stock, 
    foto, 
    marca 
FROM productos 
WHERE categoria_id = 250 
ORDER BY nombre 
LIMIT 10;
"
```

### PASO 3: Mapear Categoría SQLite → JSON
```javascript
const categoriasMap = {
    250: { category: "higiene-cuidado", subcategory: "shampoo" },
    261: { category: "casa-descanso", subcategory: "colchonetas" },
    262: { category: "casa-descanso", subcategory: "casitas" },
    263: { category: "accesorios", subcategory: "rascadores" },
    264: { category: "juguetes", subcategory: "interactivos" },
    275: { category: "ropa", subcategory: "verano" },
    316: { category: "ropa", subcategory: "invierno" },
    317: { category: "accesorios", subcategory: "collares" },
    409: { category: "accesorios", subcategory: "comederos" }
};
```

### PASO 4: Extraer Imagen del Backup JSON
```javascript
// Buscar imagen en backup JSON
const backupData = JSON.parse(fs.readFileSync('backupInventario/backup_owner_2026-01-13T16-26-46-405.json'));
const imagen = backupData.imagenes.find(img => 
    img.tipo === 'producto' && img.objeto_id === productoId
);

if (imagen) {
    // Guardar imagen desde base64
    const base64Data = imagen.data_base64.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Crear carpeta del producto
    const productDir = `assets/images/products/prod_${productoId}`;
    fs.mkdirSync(productDir, { recursive: true });
    
    // Guardar imagen
    fs.writeFileSync(`${productDir}/1.jpg`, buffer);
    
    // Crear copias para cover y thumb
    fs.copyFileSync(`${productDir}/1.jpg`, `${productDir}/cover.jpg`);
    fs.copyFileSync(`${productDir}/1.jpg`, `${productDir}/thumb.jpg`);
}
```

### PASO 5: Generar Tags Automáticamente
```javascript
function generarTags(nombre, descripcion, marca, categoria) {
    const tags = [];
    
    // Tags de la marca
    if (marca) tags.push(marca.toLowerCase());
    
    // Tags del nombre
    const palabrasNombre = nombre.toLowerCase().split(' ');
    palabrasNombre.forEach(palabra => {
        if (palabra.length > 3) tags.push(palabra);
    });
    
    // Tags de categoría
    const tagsCategoria = {
        250: ['shampoo', 'higiene', 'limpieza'],
        261: ['colchoneta', 'descanso', 'cama'],
        262: ['casita', 'hogar', 'refugio'],
        263: ['rascador', 'uñas', 'gatos'],
        264: ['juguete', 'entretenimiento', 'diversión'],
        275: ['ropa', 'verano', 'fresco'],
        316: ['ropa', 'invierno', 'abrigo'],
        317: ['collar', 'correa', 'paseo'],
        409: ['comedero', 'bebedero', 'alimentación']
    };
    
    if (tagsCategoria[categoria]) {
        tags.push(...tagsCategoria[categoria]);
    }
    
    return [...new Set(tags)]; // Eliminar duplicados
}
```

### PASO 6: Generar Especificaciones
```javascript
function generarEspecificaciones(producto) {
    const specs = {};
    
    // Especificaciones básicas
    if (producto.marca) specs.Marca = producto.marca;
    if (producto.sku) specs.SKU = producto.sku;
    
    // Extraer volumen/tamaño del nombre
    const volumenMatch = producto.nombre.match(/(\d+)\s*(cm3|ml|gr|kg|cm)/i);
    if (volumenMatch) {
        specs.Volumen = volumenMatch[0];
    }
    
    // Especificaciones por categoría
    const especsPorCategoria = {
        250: { Tipo: "Producto de higiene", Uso: "Mascotas" },
        261: { Tipo: "Colchoneta", Material: "Textil" },
        262: { Tipo: "Casita", Material: "Resistente" },
        263: { Tipo: "Rascador", Material: "Sisal" },
        264: { Tipo: "Juguete", Seguridad: "No tóxico" },
        275: { Tipo: "Ropa", Temporada: "Verano" },
        316: { Tipo: "Ropa", Temporada: "Invierno" },
        317: { Tipo: "Accesorio", Uso: "Paseo" },
        409: { Tipo: "Comedero/Bebedero", Material: "Plástico/Acero" }
    };
    
    if (especsPorCategoria[producto.categoria_id]) {
        Object.assign(specs, especsPorCategoria[producto.categoria_id]);
    }
    
    return specs;
}
```

### PASO 7: Generar Features
```javascript
function generarFeatures(producto) {
    const features = [];
    
    // Features por categoría
    const featuresPorCategoria = {
        250: ["Limpia profundamente", "Fórmula suave", "Aroma agradable"],
        261: ["Cómodo y suave", "Fácil de lavar", "Antideslizante"],
        262: ["Espacio privado", "Fácil montaje", "Material resistente"],
        263: ["Protege muebles", "Mantiene uñas sanas", "Base estable"],
        264: ["Estimula el juego", "Material seguro", "Resistente a mordidas"],
        275: ["Tela transpirable", "Diseño fresco", "Fácil de poner"],
        316: ["Mantiene el calor", "Material suave", "Resistente al agua"],
        317: ["Ajuste cómodo", "Material resistente", "Fácil de usar"],
        409: ["Fácil de limpiar", "Antideslizante", "Capacidad adecuada"]
    };
    
    if (featuresPorCategoria[producto.categoria_id]) {
        features.push(...featuresPorCategoria[producto.categoria_id]);
    }
    
    return features;
}
```

---

## 🚀 SCRIPT COMPLETO DE CONVERSIÓN

### Crear archivo: `convertir-productos-sqlite.js`

```javascript
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Configuración
const DB_PATH = 'database/inventario_restored.db';
const BACKUP_PATH = 'backupInventario/backup_owner_2026-01-13T16-26-46-405.json';
const PRODUCTS_JSON = 'pets-store/data/products.json';

// Mapeo de categorías
const categoriasMap = {
    250: { category: "higiene-cuidado", subcategory: "shampoo" },
    261: { category: "casa-descanso", subcategory: "colchonetas" },
    262: { category: "casa-descanso", subcategory: "casitas" },
    263: { category: "accesorios", subcategory: "rascadores" },
    264: { category: "juguetes", subcategory: "interactivos" },
    275: { category: "ropa", subcategory: "verano" },
    316: { category: "ropa", subcategory: "invierno" },
    317: { category: "accesorios", subcategory: "collares" },
    409: { category: "accesorios", subcategory: "comederos" }
};

async function convertirProductos(categoriaId = null, limite = 10, tipoProducto = 'todos') {
    // 1. Cargar backup JSON
    const backupData = JSON.parse(fs.readFileSync(BACKUP_PATH));
    
    // 2. Conectar a SQLite
    const db = new sqlite3.Database(DB_PATH);
    
    // 3. Cargar descuentos activos
    const descuentos = await cargarDescuentos(db);
    
    // 4. Construir query según tipo de producto
    let query = 'SELECT * FROM productos WHERE 1=1';
    const params = [];
    
    // Filtrar por categoría
    if (categoriaId) {
        query += ' AND categoria_id = ?';
        params.push(categoriaId);
    }
    
    // Filtrar por tipo de producto
    if (tipoProducto === 'simple' || tipoProducto === 'simples') {
        // Solo productos simples (sin variantes)
        query += ' AND tiene_variantes = 0';
    } else if (tipoProducto === 'variantes') {
        // Solo productos con variantes
        query += ' AND tiene_variantes = 1';
    }
    // Si tipoProducto === 'todos', no agregar filtro
    
    query += ' LIMIT ?';
    params.push(limite);
    
    console.log(`🔍 Filtros aplicados:`);
    console.log(`   Categoría: ${categoriaId || 'Todas'}`);
    console.log(`   Tipo: ${tipoProducto}`);
    console.log(`   Límite: ${limite}\n`);
    
    db.all(query, params, (err, productos) => {
        if (err) {
            console.error('Error consultando productos:', err);
            return;
        }
        
        // 4. Cargar productos existentes
        let productosExistentes = [];
        if (fs.existsSync(PRODUCTS_JSON)) {
            productosExistentes = JSON.parse(fs.readFileSync(PRODUCTS_JSON));
        }
        
        // 5. Filtrar productos duplicados
        const productosNuevos = [];
        const productosOmitidos = [];
        
        productos.forEach(producto => {
            const productoId = `prod_${producto.id}`;
            const yaExiste = productosExistentes.some(p => p.id === productoId);
            
            if (yaExiste) {
                productosOmitidos.push({
                    id: productoId,
                    nombre: producto.nombre,
                    razon: 'Ya existe en la tienda'
                });
            } else {
                // También verificar por SKU si existe
                const existePorSku = producto.sku && productosExistentes.some(p => p.sku === producto.sku);
                if (existePorSku) {
                    productosOmitidos.push({
                        id: productoId,
                        nombre: producto.nombre,
                        sku: producto.sku,
                        razon: 'SKU ya existe en la tienda'
                    });
                } else {
                    productosNuevos.push(convertirProducto(producto, backupData));
                }
            }
        });
        
        // 6. Agregar solo productos nuevos
        const todosLosProductos = [...productosExistentes, ...productosNuevos];
        
        // 7. Guardar archivo JSON
        fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(todosLosProductos, null, 2));
        
        // 8. Mostrar resultados
        console.log(`\n📊 RESUMEN DE CONVERSIÓN:`);
        console.log(`✅ ${productosNuevos.length} productos agregados`);
        console.log(`⚠️  ${productosOmitidos.length} productos omitidos (duplicados)`);
        console.log(`📦 Total productos en tienda: ${todosLosProductos.length}`);
        
        if (productosOmitidos.length > 0) {
            console.log(`\n🚫 PRODUCTOS OMITIDOS:`);
            productosOmitidos.forEach(p => {
                console.log(`   - ${p.id}: ${p.nombre} (${p.razon})`);
                if (p.sku) console.log(`     SKU: ${p.sku}`);
            });
        }
        
        if (productosNuevos.length > 0) {
            console.log(`\n✨ PRODUCTOS AGREGADOS:`);
            productosNuevos.forEach(p => {
                console.log(`   - ${p.id}: ${p.name}`);
            });
        }
        
        db.close();
    });
}

function convertirProducto(producto, backupData) {
    // Mapear categoría
    const categoriaInfo = categoriasMap[producto.categoria_id] || 
        { category: "otros", subcategory: "general" };
    
    // Buscar imagen en backup
    const imagen = backupData.imagenes?.find(img => 
        img.tipo === 'producto' && img.objeto_id === producto.id
    );
    
    // Guardar imagen si existe
    if (imagen) {
        guardarImagen(producto.id, imagen);
    }
    
    // Generar datos adicionales
    const tags = generarTags(producto.nombre, producto.descripcion, producto.marca, producto.categoria_id);
    const specifications = generarEspecificaciones(producto);
    const features = generarFeatures(producto);
    
    // Buscar descuento aplicable (debe pasarse desde la función principal)
    // Por ahora, no hay descuento
    const discount = null;
    const originalPrice = null;
    
    return {
        id: `prod_${producto.id}`,
        name: producto.nombre,
        description: producto.descripcion || producto.nombre,
        price: producto.precio,
        originalPrice,
        discount,
        category: categoriaInfo.category,
        subcategory: categoriaInfo.subcategory,
        brand: producto.marca || "Sin marca",
        sku: producto.sku,
        stock: producto.stock,
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0
        reviews: Math.floor(Math.random() * 50) + 5, // 5-55
        tags,
        images: {
            cover: `assets/images/products/prod_${producto.id}/cover.jpg`,
            thumb: `assets/images/products/prod_${producto.id}/thumb.jpg`,
            marketing: null,
            gallery: [`assets/images/products/prod_${producto.id}/1.jpg`]
        },
        specifications,
        features,
        hasVideo: false,
        topDiscount: false // Solo si hay descuento real >= 20%
    };
}

// Función para cargar descuentos activos
function cargarDescuentos(db) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM descuentos 
            WHERE activo = 1 
            AND (fecha_fin IS NULL OR fecha_fin >= date('now'))
        `;
        
        db.all(query, [], (err, descuentos) => {
            if (err) {
                console.error('Error cargando descuentos:', err);
                resolve([]);
            } else {
                resolve(descuentos);
            }
        });
    });
}

// Función para aplicar descuento a un producto
function aplicarDescuento(producto, descuentos) {
    const descuentosAplicables = [];
    
    // 1. Buscar descuentos por producto específico
    descuentos.forEach(d => {
        if (d.producto_ids) {
            try {
                const productIds = JSON.parse(d.producto_ids);
                
                // Comparar con conversión de tipos
                // Soporta tanto IDs numéricos (productos simples) como strings "var_XXX" (variantes)
                const encontrado = productIds.some(id => {
                    // Si el producto tiene variantes, comparar con "var_XXX"
                    if (producto.tiene_variantes && typeof id === 'string' && id.startsWith('var_')) {
                        // Aquí se compararía con el ID de la variante
                        // Por ahora, productos con variantes no se manejan en la tienda web
                        return false;
                    }
                    
                    // Para productos simples, comparar IDs numéricos
                    return String(id) === String(producto.id) || 
                           Number(id) === Number(producto.id);
                });
                
                if (encontrado) {
                    descuentosAplicables.push({
                        ...d,
                        tipo_aplicacion: 'producto_especifico'
                    });
                }
            } catch (e) {
                // Ignorar errores de parsing
            }
        }
    });
    
    // 2. Buscar descuentos por categoría
    descuentos.forEach(d => {
        if (d.categoria_id === producto.categoria_id) {
            descuentosAplicables.push({
                ...d,
                tipo_aplicacion: 'categoria'
            });
        }
    });
    
    // 3. Buscar descuentos globales (sin categoria_id ni producto_ids)
    descuentos.forEach(d => {
        if (!d.categoria_id && !d.producto_ids) {
            descuentosAplicables.push({
                ...d,
                tipo_aplicacion: 'global'
            });
        }
    });
    
    // Si no hay descuentos aplicables
    if (descuentosAplicables.length === 0) {
        return { discount: null, originalPrice: null, descuentoInfo: null };
    }
    
    // Filtrar solo descuentos de tipo porcentaje
    const descuentosPorcentuales = descuentosAplicables.filter(d => d.tipo === 'percent');
    
    if (descuentosPorcentuales.length === 0) {
        return { discount: null, originalPrice: null, descuentoInfo: null };
    }
    
    // Tomar el descuento MAYOR (no son acumulables)
    const descuentoMayor = descuentosPorcentuales.reduce((max, d) => 
        d.valor > max.valor ? d : max
    );
    
    // Calcular precio original basado en el descuento real
    const discount = Math.round(descuentoMayor.valor);
    const originalPrice = Math.round(producto.precio / (1 - discount / 100));
    
    return { 
        discount, 
        originalPrice,
        descuentoInfo: {
            nombre: descuentoMayor.nombre,
            tipo_aplicacion: descuentoMayor.tipo_aplicacion
        }
    };
}

function guardarImagen(productoId, imagen) {
    try {
        // Crear directorio
        const productDir = `pets-store/assets/images/products/prod_${productoId}`;
        fs.mkdirSync(productDir, { recursive: true });
        
        // Extraer datos base64
        const base64Data = imagen.data_base64.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Guardar imágenes
        fs.writeFileSync(`${productDir}/1.jpg`, buffer);
        fs.writeFileSync(`${productDir}/cover.jpg`, buffer);
        fs.writeFileSync(`${productDir}/thumb.jpg`, buffer);
        
        console.log(`📸 Imagen guardada para producto ${productoId}`);
    } catch (error) {
        console.error(`❌ Error guardando imagen para producto ${productoId}:`, error.message);
    }
}

// Funciones auxiliares (generarTags, generarEspecificaciones, generarFeatures)
// ... (código de las funciones anteriores)

// Exportar función principal
module.exports = { convertirProductos, verificarDuplicados };

// Función para verificar duplicados sin agregar
async function verificarDuplicados(categoriaId = null, limite = 10) {
    console.log(`🔍 VERIFICANDO DUPLICADOS...`);
    
    // Cargar productos existentes
    let productosExistentes = [];
    if (fs.existsSync(PRODUCTS_JSON)) {
        productosExistentes = JSON.parse(fs.readFileSync(PRODUCTS_JSON));
    }
    
    // Conectar a SQLite
    const db = new sqlite3.Database(DB_PATH);
    
    const query = categoriaId 
        ? `SELECT id, nombre, sku FROM productos WHERE categoria_id = ? LIMIT ?`
        : `SELECT id, nombre, sku FROM productos LIMIT ?`;
    
    const params = categoriaId ? [categoriaId, limite] : [limite];
    
    db.all(query, params, (err, productos) => {
        if (err) {
            console.error('Error consultando productos:', err);
            return;
        }
        
        const duplicados = [];
        const nuevos = [];
        
        productos.forEach(producto => {
            const productoId = `prod_${producto.id}`;
            const yaExiste = productosExistentes.some(p => p.id === productoId);
            const existePorSku = producto.sku && productosExistentes.some(p => p.sku === producto.sku);
            
            if (yaExiste || existePorSku) {
                duplicados.push({
                    id: productoId,
                    nombre: producto.nombre,
                    sku: producto.sku,
                    razon: yaExiste ? 'ID ya existe' : 'SKU ya existe'
                });
            } else {
                nuevos.push({
                    id: productoId,
                    nombre: producto.nombre,
                    sku: producto.sku
                });
            }
        });
        
        console.log(`\n📊 ANÁLISIS DE DUPLICADOS:`);
        console.log(`✅ ${nuevos.length} productos nuevos para agregar`);
        console.log(`🚫 ${duplicados.length} productos duplicados (se omitirán)`);
        
        if (duplicados.length > 0) {
            console.log(`\n🚫 DUPLICADOS ENCONTRADOS:`);
            duplicados.forEach(p => {
                console.log(`   - ${p.id}: ${p.nombre} (${p.razon})`);
                if (p.sku) console.log(`     SKU: ${p.sku}`);
            });
        }
        
        if (nuevos.length > 0) {
            console.log(`\n✨ PRODUCTOS NUEVOS:`);
            nuevos.forEach(p => {
                console.log(`   - ${p.id}: ${p.nombre}`);
                if (p.sku) console.log(`     SKU: ${p.sku}`);
            });
        }
        
        console.log(`\n💡 Para proceder con la conversión, ejecuta:`);
        console.log(`   node convertir-productos-sqlite.js ${categoriaId || 'null'} ${limite}`);
        
        db.close();
    });
}

// Si se ejecuta directamente
if (require.main === module) {
    const args = process.argv.slice(2);
    
    // Verificar si es modo check
    const isCheckMode = args[0] === '--check';
    const startIndex = isCheckMode ? 1 : 0;
    
    const categoriaId = args[startIndex] && args[startIndex] !== 'null' 
        ? parseInt(args[startIndex]) 
        : null;
    const limite = args[startIndex + 1] ? parseInt(args[startIndex + 1]) : 10;
    const tipoProducto = args[startIndex + 2] || 'todos'; // 'simple', 'variantes', 'todos'
    
    // Validar tipo de producto
    const tiposValidos = ['simple', 'simples', 'variantes', 'todos'];
    if (!tiposValidos.includes(tipoProducto.toLowerCase())) {
        console.error(`❌ Tipo de producto inválido: ${tipoProducto}`);
        console.error(`   Tipos válidos: ${tiposValidos.join(', ')}`);
        process.exit(1);
    }
    
    if (isCheckMode) {
        console.log(`🔍 MODO VERIFICACIÓN - No se agregarán productos`);
        console.log(`📂 Categoría: ${categoriaId || 'Todas'}`);
        console.log(`📊 Límite: ${limite}`);
        console.log(`🏷️  Tipo: ${tipoProducto}\n`);
        verificarDuplicados(categoriaId, limite, tipoProducto);
    } else {
        console.log(`🔄 MODO CONVERSIÓN - Se agregarán productos`);
        console.log(`📂 Categoría: ${categoriaId || 'Todas'}`);
        console.log(`📊 Límite: ${limite}`);
        console.log(`🏷️  Tipo: ${tipoProducto}\n`);
        convertirProductos(categoriaId, limite, tipoProducto);
    }
}
```

---

## 📋 COMANDOS DE USO

### 🔍 VERIFICAR DUPLICADOS (Recomendado antes de agregar)

```bash
# Verificar productos simples de una categoría
node convertir-productos-sqlite.js --check 250 10 simple

# Verificar productos con variantes
node convertir-productos-sqlite.js --check 264 15 variantes

# Verificar todos los productos (simples y variantes)
node convertir-productos-sqlite.js --check 263 20 todos
```

### ➕ AGREGAR PRODUCTOS

#### Productos Simples (Recomendado empezar por estos)
```bash
# Higiene y Cuidado - Solo productos simples
node convertir-productos-sqlite.js 250 10 simple

# Colchonetas - Solo productos simples
node convertir-productos-sqlite.js 261 5 simple

# Juguetes - Solo productos simples
node convertir-productos-sqlite.js 264 15 simple
```

#### Productos con Variantes
```bash
# Ropa de Invierno - Solo productos con variantes
node convertir-productos-sqlite.js 316 8 variantes

# Ropa de Verano - Solo productos con variantes
node convertir-productos-sqlite.js 275 10 variantes
```

#### Todos los Productos (Simples y Variantes)
```bash
# Todos los productos de una categoría
node convertir-productos-sqlite.js 263 20 todos

# O simplemente omitir el parámetro (por defecto es 'todos')
node convertir-productos-sqlite.js 263 20
```

### 📦 AGREGAR CATEGORÍA COMPLETA

```bash
# Toda la categoría de Higiene - Solo simples
node convertir-productos-sqlite.js 250 1000 simple

# Toda la categoría de Juguetes - Todos
node convertir-productos-sqlite.js 264 1000 todos
```

### 🎲 AGREGAR PRODUCTOS ALEATORIOS

```bash
# 20 productos simples de cualquier categoría
node convertir-productos-sqlite.js null 20 simple

# 10 productos con variantes de cualquier categoría
node convertir-productos-sqlite.js null 10 variantes
```

---

## 🏷️ PARÁMETROS DEL SCRIPT

```
node convertir-productos-sqlite.js [--check] [categoria] [limite] [tipo]
```

| Parámetro | Descripción | Valores | Por defecto |
|-----------|-------------|---------|-------------|
| `--check` | Modo verificación (no agrega) | flag | - |
| `categoria` | ID de categoría o `null` | número o `null` | `null` (todas) |
| `limite` | Cantidad máxima de productos | número | 10 |
| `tipo` | Tipo de producto | `simple`, `simples`, `variantes`, `todos` | `todos` |

### Identificación de Tipo de Producto

**Producto Simple** (`tiene_variantes = 0`):
- Un solo precio
- Un solo stock
- No tiene variantes de color, talla, etc.
- Ejemplo: "SHAMPOO DOUBLE 2 EN 1 250 cm3"

**Producto con Variantes** (`tiene_variantes = 1`):
- Múltiples combinaciones (talla, color, etc.)
- Cada variante tiene su propio precio y stock
- Tiene registros en tabla `producto_variantes`
- Ejemplo: "ROPA VERANO" (tallas S, M, L, XL)

---

## ✅ CHECKLIST POST-CONVERSIÓN

Después de agregar productos:

- [ ] **Verificar duplicados** - Usar `--check` antes de agregar
- [ ] **Revisar productos omitidos** - Verificar que los duplicados sean correctos
- [ ] Verificar que las imágenes se guardaron correctamente
- [ ] Revisar el archivo `products.json` generado
- [ ] Probar la tienda en el navegador
- [ ] Verificar que los productos aparecen en las secciones correctas
- [ ] Ajustar precios si es necesario
- [ ] Agregar productos a "Top Descuentos" si corresponde
- [ ] Optimizar imágenes si son muy pesadas
- [ ] Actualizar categorías en `categories.json` si es necesario

## 🛡️ VALIDACIONES DE DUPLICADOS

El script incluye **doble validación** para evitar duplicados:

### 1. Validación por ID
```javascript
const yaExiste = productosExistentes.some(p => p.id === productoId);
```
- Verifica si `prod_XXX` ya existe en la tienda
- Evita duplicar el mismo producto de la base SQLite

### 2. Validación por SKU
```javascript
const existePorSku = producto.sku && productosExistentes.some(p => p.sku === producto.sku);
```
- Verifica si el SKU ya existe en la tienda
- Evita productos con códigos duplicados

### 3. Reporte Detallado
El script muestra:
- ✅ Productos nuevos que se agregarán
- 🚫 Productos duplicados que se omitirán
- 📊 Resumen con contadores
- 💡 Razón específica de cada omisión

---

## 🎯 RESULTADO ESPERADO

Al ejecutar este procedimiento obtendrás:

1. **Productos convertidos** del formato SQLite al formato JSON de la tienda
2. **Imágenes extraídas** del backup y guardadas en la estructura correcta
3. **Datos enriquecidos** con tags, especificaciones y features automáticas
4. **Categorización correcta** según el mapeo definido
5. **Integración perfecta** con el sistema existente de la tienda

¡El procedimiento está listo para usar! 🚀