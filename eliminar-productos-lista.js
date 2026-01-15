/**
 * Script para eliminar productos específicos por nombre
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Lista de productos a eliminar (nombres exactos o parciales)
const productosAEliminar = [
    "GALLETA OREO CHIIFLE",
    "HUISITOS CHIFLES 003",
    "GASEOSA CHIFLE",
    "PELOTA ESPINA CHIFLE",
    "CHIFLE CANGREO MEDIANO",
    "CHIFLE PERRO Y VACA",
    "CHIFLE PELOTA, CON RELIEVES DE /CORAZON/HUESO/PUNTOS",
    "MORDILLO PESA CON CASCABEL GRANDE, COLORES PASTEL",
    "MORDILLO PESA CON CASCABEL GRNDE",
    "Colchon liso comun",
    "COLCHON FANTASIA COMUN",
    "RASCADOR PANEL ESQUINERO CON ALFOMBRA 60 X 9,5 X 11CM",
    "RASCADOR MADERA CARTÓN Y ALFOMBRA DOS POSICIONES 50X20",
    "RASCADOR MEDIO CIRCULO",
    "COLLAR LONA FANTASIA"
];

console.log(`\n📦 Productos antes: ${products.length}`);
console.log(`\n🔍 Buscando productos a eliminar...`);

// Encontrar productos que coincidan
const productosEncontrados = products.filter(p => {
    return productosAEliminar.some(nombre => 
        p.name.toLowerCase().includes(nombre.toLowerCase()) ||
        nombre.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase() === nombre.toLowerCase()
    );
});

console.log(`\n📋 Productos encontrados para eliminar: ${productosEncontrados.length}`);
productosEncontrados.forEach(p => {
    console.log(`   - ${p.id}: ${p.name}`);
});

// Filtrar productos (eliminar los encontrados)
const idsAEliminar = productosEncontrados.map(p => p.id);
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

console.log(`\n📊 Productos después: ${productosActualizados.length}`);
console.log(`📊 Productos eliminados: ${products.length - productosActualizados.length}`);

// Guardar
fs.writeFileSync(productsPath, JSON.stringify(productosActualizados, null, 2), 'utf8');

console.log('\n✅ Archivo products.json actualizado correctamente');
