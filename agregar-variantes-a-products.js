const fs = require('fs');
const path = require('path');

const PRODUCTS_JSON_PATH = path.join(__dirname, 'data/products.json');
const BACKUP_PATH = path.join(__dirname, 'data/products.backup.json');

console.log('📦 AGREGAR PRODUCTOS CON VARIANTES A PRODUCTS.JSON');
console.log('==================================================\n');

// Leer resumen de conversión
const resumenPath = path.join(__dirname, 'resumen-conversion-variantes.json');
if (!fs.existsSync(resumenPath)) {
    console.error('❌ No se encontró resumen-conversion-variantes.json');
    console.log('   Ejecuta primero: node convertir-todos-variantes.js');
    process.exit(1);
}

const resumen = JSON.parse(fs.readFileSync(resumenPath, 'utf-8'));
console.log(`📊 Resumen de conversión:`);
console.log(`   Total procesados: ${resumen.total_procesados}`);
console.log(`   Exitosos: ${resumen.exitosos}`);
console.log(`   Errores: ${resumen.errores}\n`);

if (resumen.exitosos === 0) {
    console.error('❌ No hay productos exitosos para agregar');
    process.exit(1);
}

// Leer products.json actual
console.log('📖 Leyendo products.json actual...');
let productosActuales = [];
if (fs.existsSync(PRODUCTS_JSON_PATH)) {
    productosActuales = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));
    console.log(`   Productos actuales: ${productosActuales.length}`);
    
    // Crear backup
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(productosActuales, null, 2));
    console.log(`   ✅ Backup creado: products.backup.json\n`);
} else {
    console.log('   ⚠️  products.json no existe, se creará nuevo\n');
}

// Leer productos convertidos
console.log('📥 Cargando productos convertidos...');
const productosNuevos = [];
const productosExistentes = new Set(productosActuales.map(p => p.id));

resumen.productos_exitosos.forEach(({ id }) => {
    const productoId = id.replace('prod_', '');
    const filePath = path.join(__dirname, `producto_variante_${productoId}.json`);
    
    if (fs.existsSync(filePath)) {
        const producto = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Verificar si ya existe
        if (productosExistentes.has(producto.id)) {
            console.log(`   ⚠️  ${producto.id} ya existe en products.json, se omitirá`);
        } else {
            productosNuevos.push(producto);
            console.log(`   ✅ ${producto.id} - ${producto.name}`);
        }
    } else {
        console.log(`   ❌ No se encontró archivo: ${filePath}`);
    }
});

console.log(`\n📊 Productos a agregar: ${productosNuevos.length}`);

if (productosNuevos.length === 0) {
    console.log('\n⚠️  No hay productos nuevos para agregar');
    process.exit(0);
}

// Combinar productos
console.log('\n🔄 Combinando productos...');
const productosCombinados = [...productosActuales, ...productosNuevos];

// Ordenar por ID
productosCombinados.sort((a, b) => {
    const idA = parseInt(a.id.replace('prod_', ''));
    const idB = parseInt(b.id.replace('prod_', ''));
    return idA - idB;
});

console.log(`   Total de productos: ${productosCombinados.length}`);

// Validar JSON antes de guardar
console.log('\n🔍 Validando JSON...');
const jsonStr = JSON.stringify(productosCombinados, null, 2);

if (jsonStr.includes('NaN')) {
    console.error('❌ ERROR: El JSON contiene valores NaN');
    console.log('   No se guardará el archivo para evitar corrupción');
    process.exit(1);
}

// Guardar
console.log('\n💾 Guardando products.json...');
fs.writeFileSync(PRODUCTS_JSON_PATH, jsonStr);
console.log('   ✅ Archivo guardado exitosamente');

// Estadísticas finales
console.log('\n\n📊 ESTADÍSTICAS FINALES');
console.log('='.repeat(50));
console.log(`Productos antes: ${productosActuales.length}`);
console.log(`Productos agregados: ${productosNuevos.length}`);
console.log(`Productos después: ${productosCombinados.length}`);

// Desglose por categoría
const porCategoria = {};
productosCombinados.forEach(p => {
    if (!porCategoria[p.category]) {
        porCategoria[p.category] = { total: 0, conVariantes: 0 };
    }
    porCategoria[p.category].total++;
    if (p.hasVariants) {
        porCategoria[p.category].conVariantes++;
    }
});

console.log('\n📁 Por categoría:');
Object.entries(porCategoria).sort().forEach(([cat, stats]) => {
    console.log(`   ${cat.padEnd(20)} | Total: ${stats.total.toString().padStart(3)} | Con variantes: ${stats.conVariantes.toString().padStart(2)}`);
});

console.log('\n\n✅ PROCESO COMPLETADO');
console.log('='.repeat(50));
console.log('\n💡 Próximos pasos:');
console.log('   1. Verifica que la web cargue correctamente');
console.log('   2. Prueba los productos con variantes');
console.log('   3. Si hay problemas, restaura desde products.backup.json');
console.log('\n🔧 Para restaurar el backup:');
console.log('   copy data\\products.backup.json data\\products.json');
