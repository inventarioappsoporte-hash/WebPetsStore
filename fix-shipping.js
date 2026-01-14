const fs = require('fs');

const productsPath = 'data/products.json';
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const productosNuevos = ['prod_223', 'prod_230', 'prod_231', 'prod_232'];

products.forEach(product => {
    if (productosNuevos.includes(product.id)) {
        if (!product.shipping) {
            product.shipping = {
                free: product.price >= 15000,
                days: Math.floor(Math.random() * 3) + 2
            };
            console.log(`✅ Agregado shipping a ${product.id} - ${product.name}`);
        }
    }
});

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log('\n✅ Productos actualizados con propiedad shipping');
