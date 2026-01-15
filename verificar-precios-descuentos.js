const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

console.log('=== VERIFICACIÓN DE PRECIOS Y DESCUENTOS ===\n');

const errores = [];

products.forEach(product => {
    // Productos con variantes usan basePrice/baseOriginalPrice
    const price = product.basePrice || product.price;
    const originalPrice = product.baseOriginalPrice || product.originalPrice;
    const discount = product.discount;
    
    if (originalPrice && discount && price) {
        // Calcular el precio esperado con el descuento
        const precioEsperado = Math.round(originalPrice * (1 - discount / 100));
        const ahorroReal = originalPrice - price;
        const ahorroEsperado = originalPrice - precioEsperado;
        
        // Tolerancia de $10 por redondeos
        if (Math.abs(price - precioEsperado) > 10) {
            errores.push({
                id: product.id,
                nombre: product.name,
                precioOriginal: originalPrice,
                descuento: discount + '%',
                precioActual: price,
                precioEsperado: precioEsperado,
                diferencia: price - precioEsperado,
                ahorroMostrado: ahorroReal,
                ahorroReal: ahorroEsperado
            });
        }
    }
});

if (errores.length === 0) {
    console.log('✅ Todos los productos tienen precios correctos según su descuento.\n');
} else {
    console.log(`❌ Se encontraron ${errores.length} productos con precios inconsistentes:\n`);
    errores.forEach((e, i) => {
        console.log(`${i + 1}. ${e.nombre} (${e.id})`);
        console.log(`   Precio original: $${e.precioOriginal.toLocaleString()}`);
        console.log(`   Descuento: ${e.descuento}`);
        console.log(`   Precio actual: $${e.precioActual.toLocaleString()} ❌`);
        console.log(`   Precio esperado: $${e.precioEsperado.toLocaleString()} ✓`);
        console.log(`   Ahorro mostrado: $${e.ahorroMostrado.toLocaleString()}`);
        console.log(`   Ahorro real debería ser: $${e.ahorroReal.toLocaleString()}`);
        console.log('');
    });
}
