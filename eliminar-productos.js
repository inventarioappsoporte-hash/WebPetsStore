const fs = require('fs');

const products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('📦 Total productos antes: ' + products.length);
console.log('\n🗑️  Productos a eliminar (posiciones 2-8):\n');

// Mostrar productos a eliminar (índices 1-7)
products.slice(1, 8).forEach((p, i) => {
    console.log(`${i+2}. ${p.name} (${p.id})`);
});

// Eliminar productos (mantener el primero, eliminar del 2 al 8, mantener el resto)
const productosActualizados = [
    products[0],  // Mantener el primero
    ...products.slice(8)  // Mantener desde el 9 en adelante
];

console.log('\n📊 Total productos después: ' + productosActualizados.length);
console.log('✅ Productos eliminados: ' + (products.length - productosActualizados.length));

// Guardar
fs.writeFileSync('data/products.json', JSON.stringify(productosActualizados, null, 2));

console.log('\n✅ Archivo actualizado: data/products.json');
