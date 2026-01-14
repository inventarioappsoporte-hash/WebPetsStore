const fs = require('fs');

const productsPath = 'data/products.json';
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const productosNuevos = ['prod_223', 'prod_230', 'prod_231', 'prod_232'];

products.forEach(product => {
    if (productosNuevos.includes(product.id)) {
        // Actualizar subcategoría de minúscula a mayúscula
        if (product.subcategory === 'rascadores') {
            product.subcategory = 'Rascadores';
            console.log(`✅ Actualizado ${product.id} - ${product.name}`);
            console.log(`   Subcategoría: rascadores → Rascadores`);
        }
    }
});

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log('\n✅ Productos actualizados con subcategoría correcta');
