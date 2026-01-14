const fs = require('fs');

const productsPath = 'data/products.json';
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const productosNuevos = ['prod_223', 'prod_230', 'prod_231', 'prod_232'];

products.forEach(product => {
    if (productosNuevos.includes(product.id)) {
        if (!product.badge) {
            // Para categoría 263 (Rascadores)
            product.badge = '🛏️ Rascadores';
            console.log(`✅ Agregado badge a ${product.id} - ${product.name}`);
            console.log(`   Badge: ${product.badge}`);
        }
    }
});

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log('\n✅ Productos actualizados con badge');
