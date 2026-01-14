/**
 * Script para analizar productos candidatos a unificación como variantes
 * Busca productos similares que podrían agruparse (mismo nombre base, diferentes tamaños/colores)
 */

const fs = require('fs');
const path = require('path');

// Cargar productos
const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log(`\n📦 Total de productos: ${products.length}`);
console.log('='.repeat(80));

// Separar productos con y sin variantes
const productosConVariantes = products.filter(p => p.hasVariants);
const productosSinVariantes = products.filter(p => !p.hasVariants);

console.log(`\n✅ Productos YA con variantes: ${productosConVariantes.length}`);
console.log(`📋 Productos SIN variantes: ${productosSinVariantes.length}`);

// Función para normalizar nombres y extraer nombre base
function normalizarNombre(nombre) {
    return nombre
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();
}

// Función para extraer nombre base (sin tamaños, colores, números)
function extraerNombreBase(nombre) {
    return nombre
        .toUpperCase()
        .replace(/\d+\s*(KG|G|CM|CM3|ML|LT|L|X|N°|TALLE|T\d|S|M|L|XL|XXL)\b/gi, '')
        .replace(/\b(PEQUEÑO|MEDIANO|GRANDE|CHICO|MINI|MAXI)\b/gi, '')
        .replace(/\b(BLANCO|NEGRO|ROJO|AZUL|VERDE|AMARILLO|ROSA|MARRON|GRIS|BRONCE)\b/gi, '')
        .replace(/\b(N°\d+|NUMERO\s*\d+|#\d+)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Agrupar productos sin variantes por nombre base similar
const grupos = {};

productosSinVariantes.forEach(producto => {
    const nombreBase = extraerNombreBase(producto.name);
    
    if (!grupos[nombreBase]) {
        grupos[nombreBase] = [];
    }
    grupos[nombreBase].push(producto);
});

// Filtrar solo grupos con más de 1 producto (candidatos a unificar)
const candidatos = Object.entries(grupos)
    .filter(([_, productos]) => productos.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

console.log('\n' + '='.repeat(80));
console.log('🔍 CANDIDATOS A UNIFICACIÓN (productos similares sin variantes)');
console.log('='.repeat(80));

if (candidatos.length === 0) {
    console.log('\n✨ No se encontraron productos candidatos a unificar.');
} else {
    let totalCandidatos = 0;
    
    candidatos.forEach(([nombreBase, productos], index) => {
        totalCandidatos += productos.length;
        
        console.log(`\n📦 GRUPO ${index + 1}: "${nombreBase}"`);
        console.log(`   Cantidad de productos: ${productos.length}`);
        console.log('   Productos:');
        
        productos.forEach(p => {
            const precio = p.price || p.basePrice || 'N/A';
            const descuento = p.discount ? `(${p.discount}% OFF)` : '';
            console.log(`   - ID: ${p.id} | "${p.name}" | $${precio} ${descuento}`);
            console.log(`     Categoría: ${p.category} > ${p.subcategory || 'N/A'}`);
        });
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`📊 RESUMEN:`);
    console.log(`   - Grupos candidatos: ${candidatos.length}`);
    console.log(`   - Total productos a revisar: ${totalCandidatos}`);
    console.log('='.repeat(80));
}

// También buscar productos que podrían tener variantes por patrones en el nombre
console.log('\n' + '='.repeat(80));
console.log('🔎 PRODUCTOS CON PATRONES DE VARIANTES EN EL NOMBRE');
console.log('   (contienen tamaños, colores o números que sugieren variantes)');
console.log('='.repeat(80));

const patronesVariantes = [
    /\b(\d+\s*(KG|G|CM3|ML|LT))\b/i,
    /\b(TALLE|TALLA)\s*(S|M|L|XL|XXL|\d+)\b/i,
    /\bN°\s*\d+\b/i,
    /\b(PEQUEÑO|MEDIANO|GRANDE|CHICO|MINI|MAXI)\b/i,
];

const productosConPatrones = productosSinVariantes.filter(p => {
    return patronesVariantes.some(patron => patron.test(p.name));
});

if (productosConPatrones.length > 0) {
    console.log(`\nEncontrados ${productosConPatrones.length} productos con patrones de variantes:\n`);
    
    productosConPatrones.forEach(p => {
        const precio = p.price || p.basePrice || 'N/A';
        console.log(`- ID: ${p.id} | "${p.name}" | $${precio}`);
    });
}

// Guardar reporte en JSON
const reporte = {
    fecha: new Date().toISOString(),
    totalProductos: products.length,
    productosConVariantes: productosConVariantes.length,
    productosSinVariantes: productosSinVariantes.length,
    gruposCandidatos: candidatos.map(([nombreBase, productos]) => ({
        nombreBase,
        cantidad: productos.length,
        productos: productos.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price || p.basePrice,
            category: p.category,
            subcategory: p.subcategory
        }))
    })),
    productosConPatronesVariantes: productosConPatrones.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price || p.basePrice,
        category: p.category
    }))
};

fs.writeFileSync(
    path.join(__dirname, 'reporte-candidatos-unificacion.json'),
    JSON.stringify(reporte, null, 2),
    'utf8'
);

console.log('\n✅ Reporte guardado en: reporte-candidatos-unificacion.json');
