// Test Completo de Conversión con Validación de Duplicados
const fs = require('fs');

console.log('🧪 TEST COMPLETO DE CONVERSIÓN CON DUPLICADOS');
console.log('==============================================\n');

// Simular productos de SQLite (incluyendo CAMA VICTORIA y otros)
const productosSQLite = [
    {
        id: 222,
        nombre: "CAMA VICTORIA",
        descripcion: "CAMA VICTORIA",
        sku: "CAM001",
        categoria_id: 263,
        precio: 18500.0,
        precio_compra: 12000.0,
        stock: 3,
        foto: "[IMAGEN_PRODUCTO_222]",
        marca: "PUIPE"
    },
    {
        id: 102,
        nombre: "SHAMPOO DOUBLE 2 EN 1 250 cm3",
        descripcion: "SHAMPOO DOUBLE 2 EN 1 250 cm3",
        sku: "SHA001",
        categoria_id: 250,
        precio: 12000.0,
        precio_compra: 8555.0,
        stock: 5,
        foto: "[IMAGEN_PRODUCTO_102]",
        marca: "OSSPRET"
    },
    {
        id: 999,
        nombre: "PRODUCTO NUEVO TEST",
        descripcion: "Un producto que no existe en la tienda",
        sku: "TEST999",
        categoria_id: 264,
        precio: 15000.0,
        precio_compra: 10000.0,
        stock: 10,
        foto: "[IMAGEN_PRODUCTO_999]",
        marca: "TEST"
    }
];

// Cargar productos existentes
const PRODUCTS_JSON = 'data/products.json';
let productosExistentes = [];
if (fs.existsSync(PRODUCTS_JSON)) {
    productosExistentes = JSON.parse(fs.readFileSync(PRODUCTS_JSON));
    console.log(`📦 ${productosExistentes.length} productos existentes cargados\n`);
}

// Función de validación (copiada del procedimiento)
function validarDuplicados(productosSQLite, productosExistentes) {
    const productosNuevos = [];
    const productosOmitidos = [];
    
    productosSQLite.forEach(producto => {
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
                productosNuevos.push(producto);
            }
        }
    });
    
    return { productosNuevos, productosOmitidos };
}

// Ejecutar validación
console.log('🔍 EJECUTANDO VALIDACIÓN...\n');
const resultado = validarDuplicados(productosSQLite, productosExistentes);

// Mostrar resultados
console.log('📊 RESUMEN DE VALIDACIÓN:');
console.log(`✅ ${resultado.productosNuevos.length} productos nuevos para agregar`);
console.log(`🚫 ${resultado.productosOmitidos.length} productos omitidos (duplicados)\n`);

if (resultado.productosOmitidos.length > 0) {
    console.log('🚫 PRODUCTOS OMITIDOS:');
    resultado.productosOmitidos.forEach(p => {
        console.log(`   - ${p.id}: ${p.nombre} (${p.razon})`);
        if (p.sku) console.log(`     SKU: ${p.sku}`);
    });
    console.log('');
}

if (resultado.productosNuevos.length > 0) {
    console.log('✅ PRODUCTOS NUEVOS:');
    resultado.productosNuevos.forEach(p => {
        console.log(`   - prod_${p.id}: ${p.nombre}`);
        if (p.sku) console.log(`     SKU: ${p.sku}`);
    });
    console.log('');
}

// Verificaciones específicas
console.log('🔍 VERIFICACIONES ESPECÍFICAS:\n');

// 1. CAMA VICTORIA debe ser omitida
const camaOmitida = resultado.productosOmitidos.find(p => p.nombre === "CAMA VICTORIA");
if (camaOmitida) {
    console.log('✅ CAMA VICTORIA correctamente omitida como duplicado');
    console.log(`   Razón: ${camaOmitida.razon}`);
} else {
    console.log('❌ ERROR: CAMA VICTORIA no fue detectada como duplicado');
}

// 2. Producto nuevo debe ser incluido
const productoNuevo = resultado.productosNuevos.find(p => p.nombre === "PRODUCTO NUEVO TEST");
if (productoNuevo) {
    console.log('✅ PRODUCTO NUEVO TEST correctamente incluido');
} else {
    console.log('❌ ERROR: PRODUCTO NUEVO TEST no fue incluido');
}

// 3. Verificar que no se agreguen duplicados
const totalOriginal = productosExistentes.length;
const totalNuevos = resultado.productosNuevos.length;
const totalEsperado = totalOriginal + totalNuevos;

console.log(`\n📊 CONTADORES:`);
console.log(`   Productos originales: ${totalOriginal}`);
console.log(`   Productos nuevos: ${totalNuevos}`);
console.log(`   Total esperado: ${totalEsperado}`);

// Simular agregado (sin guardar archivo)
const todosLosProductos = [...productosExistentes];
resultado.productosNuevos.forEach(p => {
    todosLosProductos.push({
        id: `prod_${p.id}`,
        name: p.nombre,
        sku: p.sku,
        // ... otros campos
    });
});

console.log(`   Total después de agregar: ${todosLosProductos.length}`);

// Verificar que no hay IDs duplicados
const ids = todosLosProductos.map(p => p.id);
const idsUnicos = [...new Set(ids)];
const hayDuplicados = ids.length !== idsUnicos.length;

console.log(`\n🔍 VERIFICACIÓN DE DUPLICADOS:`);
console.log(`   IDs totales: ${ids.length}`);
console.log(`   IDs únicos: ${idsUnicos.length}`);
console.log(`   Hay duplicados: ${hayDuplicados ? '❌ SÍ' : '✅ NO'}`);

// Conclusión final
console.log('\n🎯 CONCLUSIÓN FINAL:');
console.log('====================');

const testExitoso = camaOmitida && productoNuevo && !hayDuplicados;

if (testExitoso) {
    console.log('✅ TEST COMPLETAMENTE EXITOSO');
    console.log('   ✓ Duplicados detectados correctamente');
    console.log('   ✓ Productos nuevos incluidos');
    console.log('   ✓ No se generaron duplicados');
    console.log('   ✓ La validación funciona perfectamente');
} else {
    console.log('❌ TEST FALLIDO');
    if (!camaOmitida) console.log('   ✗ CAMA VICTORIA no detectada como duplicado');
    if (!productoNuevo) console.log('   ✗ Producto nuevo no incluido');
    if (hayDuplicados) console.log('   ✗ Se generaron IDs duplicados');
}

console.log('\n🚀 Test de conversión completa finalizado');