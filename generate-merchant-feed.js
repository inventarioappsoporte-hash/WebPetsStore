const fs = require('fs');
const products = require('./data/products.json');

const baseUrl = 'https://pets-store-arg.com';

// Mapeo de categorías a Google Product Category
const categoryMapping = {
  '🐾 COLCHONETAS Y MOISES': 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Beds',
  '🐾 ACCESORIOS': 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Apparel',
  '🐾 JUGUETES': 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Toys',
  '🐾 COMEDEROS Y BEBEDEROS': 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Feeding & Watering Supplies',
  '🐾 ROPA VERANO': 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Apparel',
  '🐾 ROPA INVIERNO': 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Apparel',
  '🐾 COLLARES, CORREAS Y PECHERAS': 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Collars & Leashes',
  '🐾 BOLSOS Y CASITAS': 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Houses',
  '🐾 RASCADORES': 'Animals & Pet Supplies > Pet Supplies > Cat Supplies > Cat Furniture',
  '🐾 HIGIENE Y CUIDADO': 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Grooming Supplies',
  '🐾 ALIMENTOS Y SNACKS': 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Food'
};

// Limpiar texto para TSV
function cleanText(text) {
  if (!text) return '';
  return text.replace(/[\t\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Encabezados requeridos por Google Merchant
const headers = [
  'id',
  'title',
  'description',
  'link',
  'image_link',
  'availability',
  'price',
  'brand',
  'condition',
  'google_product_category',
  'product_type'
];

let tsv = headers.join('\t') + '\n';

products.forEach(product => {
  // Solo productos con stock
  if (product.stock <= 0) return;
  
  const imageUrl = product.images?.cover 
    ? `${baseUrl}/${product.images.cover}`
    : `${baseUrl}/assets/images/placeholder.svg`;
  
  const row = [
    product.id,
    cleanText(product.name),
    cleanText(product.description || product.longDescription || product.name),
    `${baseUrl}/product.html?id=${product.id}`,
    imageUrl,
    product.stock > 0 ? 'in_stock' : 'out_of_stock',
    `${product.price} ARS`,
    cleanText(product.brand || 'Pets Store'),
    'new',
    categoryMapping[product.category] || 'Animals & Pet Supplies > Pet Supplies',
    cleanText(product.category?.replace('🐾 ', '') || 'Mascotas')
  ];
  
  tsv += row.join('\t') + '\n';
});

fs.writeFileSync('./merchant-feed.tsv', tsv);

console.log(`Feed generado: merchant-feed.tsv`);
console.log(`Total productos: ${products.filter(p => p.stock > 0).length}`);
