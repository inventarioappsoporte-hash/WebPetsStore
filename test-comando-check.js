// Simulación del comando: node convertir-productos-sqlite.js --check 263 5
// Para verificar duplicados en la categoría de RASCADORES (donde está CAMA VICTORIA)

const fs = require('fs');

console.log('🧪 SIMULACIÓN: node convertir-productos-sqlite.js --check 263 5');
console.log('===============================================================');
console.log('🔍 MODO VERIFICACIÓN - No se agregarán productos');
console.log('📂 Categoría: 263 (🐾 RASCADORES)');
console.log('📊 Límite: 5\n');

// Simular consulta SQLite para categoría 263 (RASCADORES)
const productosSQLiteCategoria263 = [
    {
        id: 222,
        nombre: "CAMA VICTORIA",
        sku: "CAM001"
    },
    {
        id: 223,
        nombre: "RASCADOR TORRE GATOS",
        sku: "RAS001"
    },
    {
        id: 224,
        nombre: "RASCADOR HORIZONTAL",
        sku: "RAS002"
    },
    {
        id: 225,
        nombre: "POSTE RASCADOR SISAL",
        sku: "RAS003"
    },
    {
        id: 226,
        nombre: "RASCADOR CON JUGUETES",
        sku: "RAS004"
    }
];

console.log('🔍 VERIFICANDO DUPLICADOS...\n');

// Cargar productos existentes
const PRODUCTS_JSON = 'data/products.json';
let productosExistentes = [];
if (fs.existsSync(PRODUCTS_JSON)) {
    productosExistentes = JSON.parse(fs.readFileSync(PRODUCTS_JSON));
}

// Verificar cada producto
const duplicados = [];
const nuevos = [];

productosSQLiteCategoria263.forEach(producto => {
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

// Mostrar resultados como lo haría el comando real
console.log('📊 ANÁLISIS DE DUPLICADOS:');
console.log(`✅ ${nuevos.length} productos nuevos para agregar`);
console.log(`🚫 ${duplicados.length} productos duplicados (se omitirán)\n`);

if (duplicados.length > 0) {
    console.log('🚫 DUPLICADOS ENCONTRADOS:');
    duplicados.forEach(p => {
        console.log(`   - ${p.id}: ${p.nombre} (${p.razon})`);
        if (p.sku) console.log(`     SKU: ${p.sku}`);
    });
    console.log('');
}

if (nuevos.length > 0) {
    console.log('✨ PRODUCTOS NUEVOS:');
    nuevos.forEach(p => {
        console.log(`   - ${p.id}: ${p.nombre}`);
        if (p.sku) console.log(`     SKU: ${p.sku}`);
    });
    console.log('');
}

console.log('💡 Para proceder con la conversión, ejecuta:');
console.log('   node convertir-productos-sqlite.js 263 5\n');

// Verificación específica de CAMA VICTORIA
const camaVictoriaEnDuplicados = duplicados.find(p => p.nombre === "CAMA VICTORIA");
const camaVictoriaEnNuevos = nuevos.find(p => p.nombre === "CAMA VICTORIA");

console.log('🎯 VERIFICACIÓN ESPECÍFICA - CAMA VICTORIA:');
if (camaVictoriaEnDuplicados) {
    console.log('✅ CORRECTO: CAMA VICTORIA detectada como duplicado');
    console.log(`   Razón: ${camaVictoriaEnDuplicados.razon}`);
    console.log('   ✓ No se agregará a la tienda');
} else if (camaVictoriaEnNuevos) {
    console.log('❌ ERROR: CAMA VICTORIA detectada como nuevo producto');
    console.log('   ✗ Esto causaría un duplicado');
} else {
    console.log('❌ ERROR: CAMA VICTORIA no encontrada en los resultados');
}

console.log('\n🚀 Simulación de comando --check completada');