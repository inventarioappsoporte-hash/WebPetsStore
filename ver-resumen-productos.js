const fs = require('fs');

const products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('📦 RESUMEN DE PRODUCTOS EN LA TIENDA\n');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(`📊 Total productos: ${products.length}`);

const rascadores = products.filter(p => p.subcategory === 'Rascadores');
console.log(`🛏️  Productos de Rascadores: ${rascadores.length}`);

const conDescuento = products.filter(p => p.discount);
console.log(`💰 Productos con descuento: ${conDescuento.length}`);

console.log('\n═══════════════════════════════════════════════════════════\n');
console.log('✅ ÚLTIMOS 10 PRODUCTOS AGREGADOS:\n');

const ultimos = products.slice(-10);
ultimos.forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Precio: $${p.price.toLocaleString()}`);
    if (p.discount) {
        console.log(`   Descuento: ${p.discount}%`);
    }
    console.log(`   Stock: ${p.stock} unidades`);
    console.log('');
});

console.log('═══════════════════════════════════════════════════════════\n');

// Agrupar por categoría
const porCategoria = {};
products.forEach(p => {
    if (!porCategoria[p.subcategory]) {
        porCategoria[p.subcategory] = 0;
    }
    porCategoria[p.subcategory]++;
});

console.log('📊 PRODUCTOS POR SUBCATEGORÍA:\n');
Object.keys(porCategoria).sort().forEach(cat => {
    console.log(`   ${cat}: ${porCategoria[cat]} productos`);
});
console.log('');
