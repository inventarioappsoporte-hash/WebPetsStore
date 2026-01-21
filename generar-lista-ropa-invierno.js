/**
 * Script para generar lista de productos de Ropa de Invierno
 * Incluye variantes con sus precios
 */

const fs = require('fs');
const path = require('path');

// Leer productos
const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Filtrar productos de ropa de invierno
// Buscar por subcategoría "Ropa Invierno" o tag "invierno"
const ropaInvierno = products.filter(p => {
    const subcategory = (p.subcategory || '').toLowerCase();
    const tags = (p.tags || []).map(t => t.toLowerCase());
    
    // Subcategoría "Ropa Invierno" o tag "invierno"
    const esRopaInvierno = subcategory.includes('ropa invierno') || 
                           subcategory === 'ropa invierno' ||
                           tags.includes('invierno');
    
    return esRopaInvierno;
});

console.log(`\n📦 Encontrados ${ropaInvierno.length} productos de Ropa de Invierno\n`);

// Generar filas para el CSV
const rows = [];

// Header
rows.push('Producto|Variante|Precio Original|Precio Final|Descuento %|Ahorro');

ropaInvierno.forEach(product => {
    if (product.hasVariants && product.variants && product.variants.combinations) {
        // Producto con variantes
        product.variants.combinations.forEach(variant => {
            // Construir nombre de variante desde atributos
            let variantName = '-';
            if (variant.attributes && typeof variant.attributes === 'object') {
                variantName = Object.entries(variant.attributes)
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(' / ');
            }
            if (!variantName || variantName === '-') {
                variantName = variant.sku || variant.id || '-';
            }
            
            const originalPrice = variant.originalPrice || variant.price;
            const finalPrice = variant.price;
            const discount = originalPrice > finalPrice ? Math.round((1 - finalPrice / originalPrice) * 100) : 0;
            const savings = originalPrice - finalPrice;
            
            rows.push(`${product.name}|${variantName}|${originalPrice}|${finalPrice}|${discount}%|${savings}`);
        });
    } else {
        // Producto sin variantes
        const originalPrice = product.originalPrice || product.price;
        const finalPrice = product.price;
        const discount = product.discount || (originalPrice > finalPrice ? Math.round((1 - finalPrice / originalPrice) * 100) : 0);
        const savings = originalPrice - finalPrice;
        
        rows.push(`${product.name}|-|${originalPrice}|${finalPrice}|${discount}%|${savings}`);
    }
});

// Guardar CSV
const csvContent = rows.join('\n');
const outputPath = path.join(__dirname, 'lista-ropa-invierno.csv');
fs.writeFileSync(outputPath, csvContent, 'utf8');

console.log('✅ Archivo generado: lista-ropa-invierno.csv');
console.log(`📊 Total de filas: ${rows.length - 1} (sin contar header)\n`);

// Mostrar preview
console.log('--- PREVIEW ---');
rows.slice(0, 20).forEach(row => console.log(row));
if (rows.length > 20) {
    console.log(`... y ${rows.length - 20} filas más`);
}
