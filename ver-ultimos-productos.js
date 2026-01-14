const fs = require('fs');

const products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
const nuevos = products.slice(-5);

console.log('🎉 ÚLTIMOS 5 PRODUCTOS AGREGADOS:\n');
console.log('═══════════════════════════════════════════════════════════\n');

nuevos.forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   SKU: ${p.sku || 'Sin SKU'}`);
    console.log(`   Precio: $${p.price.toLocaleString()}`);
    if (p.originalPrice) {
        console.log(`   Precio original: $${p.originalPrice.toLocaleString()}`);
        console.log(`   Descuento: ${p.discount}%`);
    } else {
        console.log(`   Descuento: Sin descuento`);
    }
    console.log(`   Badge: ${p.badge}`);
    console.log(`   Category: ${p.category}`);
    console.log(`   Subcategory: ${p.subcategory}`);
    console.log(`   Stock: ${p.stock} unidades`);
    console.log(`   Brand: ${p.brand}`);
    console.log('');
});

console.log('═══════════════════════════════════════════════════════════\n');
console.log(`📦 Total productos en la tienda: ${products.length}`);
