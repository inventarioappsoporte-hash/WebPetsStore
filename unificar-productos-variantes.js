/**
 * Script para unificar productos individuales en productos con variantes
 * Uso: node unificar-productos-variantes.js "NOMBRE BASE DEL PRODUCTO"
 * Ejemplo: node unificar-productos-variantes.js "CAMISETA ARGENTINA 3 ESTRELLA"
 */

const fs = require('fs');

// Obtener nombre base desde argumentos
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('❌ Uso: node unificar-productos-variantes.js "NOMBRE BASE"');
  console.log('   Ejemplo: node unificar-productos-variantes.js "CAMISETA ARGENTINA 3 ESTRELLA"');
  console.log('\n📋 Para ver productos candidatos, ejecuta: node analizar-posibles-variantes.js');
  process.exit(1);
}

const nombreBase = args[0].trim().toUpperCase();
console.log('='.repeat(70));
console.log(`UNIFICANDO PRODUCTOS: "${nombreBase}"`);
console.log('='.repeat(70));

// Cargar productos
const productsPath = 'data/products.json';
let products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
console.log(`\n📦 Total productos cargados: ${products.length}`);

// Función para extraer variante del nombre
function extractVariant(name, baseName) {
  const upperName = name.toUpperCase();
  const upperBase = baseName.toUpperCase();
  
  // Obtener la parte que difiere
  let variant = upperName.replace(upperBase, '').trim();
  
  // Limpiar prefijos comunes
  variant = variant.replace(/^[-\s]+/, '').trim();
  
  // Detectar tipo de variante
  if (/^T-?\d+$/i.test(variant)) {
    return { type: 'Talle', value: variant.replace('T-', 'T').replace('T', '') };
  }
  if (/^TALLE\s*\d+$/i.test(variant)) {
    return { type: 'Talle', value: variant.replace(/TALLE\s*/i, '') };
  }
  if (/^N[°º]?\s*\d+$/i.test(variant)) {
    return { type: 'Tamaño', value: variant.replace(/N[°º]?\s*/i, 'N°') };
  }
  if (/^\d+\s*(KG|G|ML|CM|L)$/i.test(variant)) {
    return { type: 'Tamaño', value: variant };
  }
  if (/^(XS|S|M|L|XL|XXL)$/i.test(variant)) {
    return { type: 'Talle', value: variant.toUpperCase() };
  }
  if (/^\d+$/i.test(variant)) {
    return { type: 'Talle', value: variant };
  }
  if (/^\d+\s*X\s*\d+$/i.test(variant)) {
    return { type: 'Medida', value: variant };
  }
  
  return { type: 'Variante', value: variant || 'Estándar' };
}

// Buscar productos que coincidan con el nombre base
const productosCoincidentes = products.filter(p => {
  if (p.hasVariants) return false; // Ignorar los que ya tienen variantes
  const upperName = p.name.toUpperCase();
  return upperName.startsWith(nombreBase) || upperName.includes(nombreBase);
});

if (productosCoincidentes.length === 0) {
  console.log(`\n❌ No se encontraron productos que coincidan con "${nombreBase}"`);
  console.log('   Verifica el nombre exacto en el reporte de análisis.');
  process.exit(1);
}

if (productosCoincidentes.length === 1) {
  console.log(`\n⚠️  Solo se encontró 1 producto. Se necesitan al menos 2 para crear variantes.`);
  console.log(`   Producto: ${productosCoincidentes[0].name}`);
  process.exit(1);
}

console.log(`\n✅ Encontrados ${productosCoincidentes.length} productos para unificar:`);
productosCoincidentes.forEach((p, i) => {
  const variant = extractVariant(p.name, nombreBase);
  console.log(`   ${i + 1}. ${p.id}: "${p.name}" → ${variant.type}: ${variant.value} - $${p.price?.toLocaleString()}`);
});


// Ordenar por precio para determinar el base
productosCoincidentes.sort((a, b) => (a.price || 0) - (b.price || 0));

// Tomar el primer producto como base
const productoBase = productosCoincidentes[0];
const variantType = extractVariant(productoBase.name, nombreBase).type;

console.log(`\n📝 Creando producto unificado...`);
console.log(`   Producto base: ${productoBase.id} - "${productoBase.name}"`);
console.log(`   Tipo de variante: ${variantType}`);

// Crear el nuevo producto con variantes
const nuevoProducto = {
  id: productoBase.id, // Mantener el ID del primer producto
  name: nombreBase.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' '), // Title case
  category: productoBase.category,
  subcategory: productoBase.subcategory,
  hasVariants: true,
  basePrice: Math.min(...productosCoincidentes.map(p => p.price || 0)),
  baseOriginalPrice: Math.min(...productosCoincidentes.filter(p => p.originalPrice).map(p => p.originalPrice)),
  discount: productoBase.discount || 0,
  stock: productosCoincidentes.reduce((sum, p) => sum + (p.stock || 0), 0),
  rating: productoBase.rating || 4.5,
  reviews: productoBase.reviews || Math.floor(Math.random() * 100) + 20,
  featured: productoBase.featured || false,
  topDiscount: productoBase.topDiscount || false,
  hasVideo: productoBase.hasVideo || false,
  tags: productoBase.tags || [],
  description: productoBase.description || nombreBase,
  longDescription: productoBase.longDescription || productoBase.description || nombreBase,
  variants: {
    attributes: [
      {
        id: variantType.toLowerCase(),
        name: variantType,
        type: variantType === 'Talle' ? 'size' : 'option'
      }
    ],
    combinations: []
  },
  images: {
    cover: productoBase.images?.cover || `assets/images/products/${productoBase.id}/cover.jpg`,
    thumb: productoBase.images?.thumb || `assets/images/products/${productoBase.id}/thumb.jpg`,
    gallery: productoBase.images?.gallery || []
  },
  specs: productoBase.specs || {},
  shipping: productoBase.shipping || { free: false, days: 3 },
  badge: productoBase.badge || '',
  brand: productoBase.brand || 'Sin marca',
  sku: productoBase.sku || productoBase.id.replace('prod_', 'SKU'),
  features: productoBase.features || []
};

// Crear las combinaciones de variantes
productosCoincidentes.forEach((p, index) => {
  const variant = extractVariant(p.name, nombreBase);
  
  const combination = {
    id: `var_${productoBase.id.replace('prod_', '')}_${index + 1}`,
    attributes: {
      [variantType]: variant.value
    },
    price: p.price || 0,
    originalPrice: p.originalPrice || p.price || 0,
    stock: p.stock || 0,
    sku: `${nuevoProducto.sku}-${variant.value.replace(/\s+/g, '').substring(0, 3).toUpperCase()}`,
    available: (p.stock || 0) > 0,
    images: {
      cover: p.images?.cover || nuevoProducto.images.cover,
      thumb: p.images?.thumb || nuevoProducto.images.thumb,
      gallery: p.images?.gallery || []
    }
  };
  
  nuevoProducto.variants.combinations.push(combination);
});

console.log(`\n📋 Variantes creadas: ${nuevoProducto.variants.combinations.length}`);
nuevoProducto.variants.combinations.forEach((v, i) => {
  console.log(`   ${i + 1}. ${v.attributes[variantType]} - $${v.price.toLocaleString()} - Stock: ${v.stock}`);
});

// IDs de productos a eliminar
const idsAEliminar = productosCoincidentes.map(p => p.id);
console.log(`\n🗑️  Productos a eliminar: ${idsAEliminar.length}`);

// Filtrar productos (eliminar los que se van a unificar)
const productosRestantes = products.filter(p => !idsAEliminar.includes(p.id));

// Agregar el nuevo producto unificado
productosRestantes.push(nuevoProducto);

console.log(`\n📊 Resumen:`);
console.log(`   Productos antes: ${products.length}`);
console.log(`   Productos eliminados: ${idsAEliminar.length}`);
console.log(`   Producto nuevo con variantes: 1`);
console.log(`   Productos después: ${productosRestantes.length}`);

// Guardar backup
const backupPath = `data/products_backup_${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
console.log(`\n💾 Backup guardado en: ${backupPath}`);

// Guardar productos actualizados
fs.writeFileSync(productsPath, JSON.stringify(productosRestantes, null, 2));
console.log(`✅ Productos actualizados guardados en: ${productsPath}`);

// Mostrar el producto creado
console.log(`\n📦 Producto unificado creado:`);
console.log(JSON.stringify(nuevoProducto, null, 2));

console.log('\n' + '='.repeat(70));
console.log('✅ UNIFICACIÓN COMPLETADA');
console.log('='.repeat(70));
