// Test de Validación de Duplicados - CAMA VICTORIA
const fs = require('fs');
const path = require('path');

// Configuración
const PRODUCTS_JSON = 'data/products.json';
const BACKUP_PATH = '../backupInventario/backup_owner_2026-01-13T16-26-46-405.json';

console.log('🧪 TEST DE VALIDACIÓN DE DUPLICADOS');
console.log('=====================================\n');

// Simular datos de la CAMA VICTORIA desde SQLite
const camaVictoriaSQLite = {
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
};

console.log('📋 DATOS DE PRUEBA:');
console.log('SQLite ID:', camaVictoriaSQLite.id);
console.log('SQLite Nombre:', camaVictoriaSQLite.nombre);
console.log('SQLite SKU:', camaVictoriaSQLite.sku);
console.log('Producto ID esperado:', `prod_${camaVictoriaSQLite.id}`);
console.log('');

// 1. Cargar productos existentes
console.log('🔍 PASO 1: Cargando productos existentes...');
let productosExistentes = [];
if (fs.existsSync(PRODUCTS_JSON)) {
    productosExistentes = JSON.parse(fs.readFileSync(PRODUCTS_JSON));
    console.log(`✅ ${productosExistentes.length} productos cargados`);
} else {
    console.log('❌ Archivo products.json no encontrado');
    process.exit(1);
}

// 2. Buscar CAMA VICTORIA existente
console.log('\n🔍 PASO 2: Buscando CAMA VICTORIA existente...');
const camaExistente = productosExistentes.find(p => p.name === "CAMA VICTORIA");
if (camaExistente) {
    console.log('✅ CAMA VICTORIA encontrada en la tienda:');
    console.log('   ID:', camaExistente.id);
    console.log('   SKU:', camaExistente.sku || 'No tiene SKU');
    console.log('   Categoría:', camaExistente.category);
} else {
    console.log('❌ CAMA VICTORIA no encontrada en la tienda');
}

// 3. Simular validación de duplicados
console.log('\n🧪 PASO 3: Simulando validación de duplicados...');

const productoId = `prod_${camaVictoriaSQLite.id}`;
console.log(`Verificando ID: ${productoId}`);

// Validación por ID
const yaExistePorId = productosExistentes.some(p => p.id === productoId);
console.log(`Validación por ID: ${yaExistePorId ? '🚫 DUPLICADO' : '✅ NUEVO'}`);

// Validación por SKU
const yaExistePorSku = camaVictoriaSQLite.sku && 
    productosExistentes.some(p => p.sku === camaVictoriaSQLite.sku);
console.log(`Validación por SKU (${camaVictoriaSQLite.sku}): ${yaExistePorSku ? '🚫 DUPLICADO' : '✅ NUEVO'}`);

// Validación por nombre (adicional)
const yaExistePorNombre = productosExistentes.some(p => 
    p.name.toLowerCase() === camaVictoriaSQLite.nombre.toLowerCase()
);
console.log(`Validación por Nombre: ${yaExistePorNombre ? '🚫 DUPLICADO' : '✅ NUEVO'}`);

// 4. Resultado final
console.log('\n📊 RESULTADO FINAL:');
const esDuplicado = yaExistePorId || yaExistePorSku;

if (esDuplicado) {
    console.log('🚫 PRODUCTO DUPLICADO - SE OMITIRÁ');
    console.log('Razones:');
    if (yaExistePorId) console.log('   - ID ya existe en la tienda');
    if (yaExistePorSku) console.log('   - SKU ya existe en la tienda');
    if (yaExistePorNombre) console.log('   - Nombre ya existe en la tienda');
} else {
    console.log('✅ PRODUCTO NUEVO - SE AGREGARÁ');
}

// 5. Test de la función completa
console.log('\n🔧 PASO 4: Test de función completa...');

function validarDuplicado(productoSQLite, productosExistentes) {
    const productoId = `prod_${productoSQLite.id}`;
    const yaExiste = productosExistentes.some(p => p.id === productoId);
    const existePorSku = productoSQLite.sku && 
        productosExistentes.some(p => p.sku === productoSQLite.sku);
    
    return {
        esDuplicado: yaExiste || existePorSku,
        razon: yaExiste ? 'ID ya existe' : (existePorSku ? 'SKU ya existe' : null),
        productoId: productoId
    };
}

const resultado = validarDuplicado(camaVictoriaSQLite, productosExistentes);

console.log('Función validarDuplicado():');
console.log(`   Resultado: ${resultado.esDuplicado ? '🚫 DUPLICADO' : '✅ NUEVO'}`);
console.log(`   Razón: ${resultado.razon || 'Ninguna'}`);
console.log(`   ID generado: ${resultado.productoId}`);

// 6. Verificación cruzada
console.log('\n🔍 PASO 5: Verificación cruzada...');
console.log('Comparando datos:');
console.log(`SQLite: prod_${camaVictoriaSQLite.id} vs Tienda: ${camaExistente?.id}`);
console.log(`SQLite: ${camaVictoriaSQLite.sku} vs Tienda: ${camaExistente?.sku || 'Sin SKU'}`);

const coincideId = camaExistente && camaExistente.id === `prod_${camaVictoriaSQLite.id}`;
const coincideSku = camaExistente && camaExistente.sku === camaVictoriaSQLite.sku;

console.log(`Coincide ID: ${coincideId ? '✅ SÍ' : '❌ NO'}`);
console.log(`Coincide SKU: ${coincideSku ? '✅ SÍ' : '❌ NO'}`);

// 7. Conclusión del test
console.log('\n🎯 CONCLUSIÓN DEL TEST:');
console.log('======================');

if (resultado.esDuplicado && (coincideId || coincideSku)) {
    console.log('✅ TEST EXITOSO: La validación funciona correctamente');
    console.log('   - El producto fue detectado como duplicado');
    console.log('   - La razón es correcta');
    console.log('   - Los datos coinciden entre SQLite y la tienda');
} else if (!resultado.esDuplicado && !camaExistente) {
    console.log('✅ TEST EXITOSO: Producto nuevo detectado correctamente');
} else {
    console.log('❌ TEST FALLIDO: Hay inconsistencias en la validación');
    console.log('   Revisar la lógica de validación');
}

console.log('\n🚀 Test completado');