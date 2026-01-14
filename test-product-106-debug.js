const fs = require('fs');

const products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
const prod106 = products.find(p => p.id === 'prod_106');

console.log('🔍 Debugging Producto 106\n');
console.log('ID:', prod106.id);
console.log('Name:', prod106.name);
console.log('hasVariants:', prod106.hasVariants);
console.log('basePrice:', prod106.basePrice, typeof prod106.basePrice);
console.log('price:', prod106.price, typeof prod106.price);
console.log('baseOriginalPrice:', prod106.baseOriginalPrice, typeof prod106.baseOriginalPrice);
console.log('originalPrice:', prod106.originalPrice, typeof prod106.originalPrice);
console.log('discount:', prod106.discount);

console.log('\n📊 Lógica de displayPrice:');
const hasVariants = prod106.hasVariants && prod106.variants;
console.log('hasVariants:', hasVariants);
const displayPrice = hasVariants ? prod106.basePrice : prod106.price;
console.log('displayPrice:', displayPrice, typeof displayPrice);

console.log('\n🔢 Formato de precio:');
if (displayPrice !== undefined && !isNaN(displayPrice)) {
    const formatted = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(displayPrice);
    console.log('Formatted:', formatted);
} else {
    console.log('❌ displayPrice es undefined o NaN');
}

console.log('\n🎨 Variantes:');
if (prod106.variants) {
    console.log('Attributes:', prod106.variants.attributes);
    console.log('Combinations:', prod106.variants.combinations.length);
    prod106.variants.combinations.forEach((v, i) => {
        console.log(`  ${i + 1}. ${JSON.stringify(v.attributes)} - $${v.price}`);
    });
}
