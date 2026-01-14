/**
 * Script para analizar productos y detectar posibles candidatos a unificar como variantes
 * Busca productos con nombres similares que solo difieren en talle/tamaño/número
 */

const fs = require('fs');

// Cargar productos
const products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('='.repeat(80));
console.log('ANÁLISIS DE PRODUCTOS CANDIDATOS A UNIFICAR COMO VARIANTES');
console.log('='.repeat(80));
console.log(`\nTotal de productos en el sistema: ${products.length}`);

// Filtrar productos que NO tienen variantes aún
const productsSinVariantes = products.filter(p => !p.hasVariants);
console.log(`Productos SIN variantes: ${productsSinVariantes.length}`);
console.log(`Productos CON variantes: ${products.length - productsSinVariantes.length}`);

// Función para extraer el nombre base (sin talle/número al final)
function extractBaseName(name) {
  // Patrones comunes de talles/tamaños al final del nombre
  const patterns = [
    /\s+T-?\d+$/i,           // T-1, T1, T-9
    /\s+TALLE\s*\d+$/i,      // TALLE 1, TALLE1
    /\s+N[°º]?\s*\d+$/i,     // N°1, Nº1, N1
    /\s+\d+\s*(KG|G|ML|CM|L)$/i,  // 2 KG, 500 ML
    /\s+\d+\s*X\s*\d+$/i,    // 60 X 40
    /\s+(XS|S|M|L|XL|XXL)$/i, // Talles de ropa
    /\s+\d+$/,               // Solo número al final
  ];
  
  let baseName = name.trim();
  for (const pattern of patterns) {
    baseName = baseName.replace(pattern, '');
  }
  return baseName.trim();
}

// Agrupar productos por nombre base y categoría
const grupos = {};

productsSinVariantes.forEach(product => {
  const baseName = extractBaseName(product.name);
  const key = `${product.category}|||${baseName}`;
  
  if (!grupos[key]) {
    grupos[key] = {
      baseName,
      category: product.category,
      subcategory: product.subcategory,
      products: []
    };
  }
  
  grupos[key].products.push({
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    discount: product.discount,
    stock: product.stock,
    image: product.images?.cover
  });
});

// Filtrar solo grupos con más de 1 producto (candidatos a variantes)
const candidatos = Object.values(grupos)
  .filter(g => g.products.length > 1)
  .sort((a, b) => b.products.length - a.products.length);

console.log(`\nGrupos de productos candidatos a unificar: ${candidatos.length}`);
console.log('\n' + '='.repeat(80));

// Organizar por categoría
const porCategoria = {};
candidatos.forEach(grupo => {
  const cat = grupo.category || 'sin-categoria';
  if (!porCategoria[cat]) {
    porCategoria[cat] = [];
  }
  porCategoria[cat].push(grupo);
});

// Mostrar resultados por categoría
let totalProductosAUnificar = 0;

Object.keys(porCategoria).sort().forEach(categoria => {
  const grupos = porCategoria[categoria];
  const totalEnCategoria = grupos.reduce((sum, g) => sum + g.products.length, 0);
  
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`📁 CATEGORÍA: ${categoria.toUpperCase()}`);
  console.log(`   ${grupos.length} grupos | ${totalEnCategoria} productos que podrían unificarse`);
  console.log('─'.repeat(80));
  
  grupos.forEach((grupo, idx) => {
    console.log(`\n  ${idx + 1}. "${grupo.baseName}"`);
    console.log(`     Subcategoría: ${grupo.subcategory || 'N/A'}`);
    console.log(`     Productos (${grupo.products.length}):`);
    
    // Ordenar por precio
    grupo.products.sort((a, b) => a.price - b.price);
    
    grupo.products.forEach(p => {
      const priceInfo = p.originalPrice 
        ? `$${p.price.toLocaleString()} (antes $${p.originalPrice.toLocaleString()}, -${p.discount}%)`
        : `$${p.price.toLocaleString()}`;
      console.log(`       • ${p.id}: "${p.name}" - ${priceInfo} - Stock: ${p.stock}`);
    });
    
    // Verificar si comparten imagen
    const imagenes = [...new Set(grupo.products.map(p => p.image))];
    if (imagenes.length === 1) {
      console.log(`     ✅ Todos comparten la misma imagen`);
    } else {
      console.log(`     ⚠️  ${imagenes.length} imágenes diferentes`);
    }
    
    totalProductosAUnificar += grupo.products.length;
  });
});

// Resumen final
console.log('\n' + '='.repeat(80));
console.log('RESUMEN DEL ANÁLISIS');
console.log('='.repeat(80));
console.log(`\nCategorías con candidatos: ${Object.keys(porCategoria).length}`);
console.log(`Total de grupos detectados: ${candidatos.length}`);
console.log(`Total de productos que podrían unificarse: ${totalProductosAUnificar}`);
console.log(`\nSi se unifican, se reducirían a: ${candidatos.length} productos con variantes`);
console.log(`Reducción potencial: ${totalProductosAUnificar - candidatos.length} productos menos en el catálogo`);

// Guardar reporte en JSON para referencia
const reporte = {
  fecha: new Date().toISOString(),
  totalProductos: products.length,
  productosSinVariantes: productsSinVariantes.length,
  gruposDetectados: candidatos.length,
  productosAUnificar: totalProductosAUnificar,
  porCategoria: Object.keys(porCategoria).map(cat => ({
    categoria: cat,
    grupos: porCategoria[cat].length,
    productos: porCategoria[cat].reduce((sum, g) => sum + g.products.length, 0)
  })),
  detalle: candidatos
};

fs.writeFileSync('reporte-posibles-variantes.json', JSON.stringify(reporte, null, 2));
console.log('\n📄 Reporte guardado en: reporte-posibles-variantes.json');
