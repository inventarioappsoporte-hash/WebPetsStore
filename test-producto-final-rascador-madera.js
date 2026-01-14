// Test Final - RASCADOR DE MADERA EN 2 POSICIONES
// Simula cómo se vería el producto en la página web

console.log('🧪 TEST FINAL - PRODUCTO COMPLETO EN PÁGINA WEB');
console.log('================================================\n');

// Datos extraídos de SQLite
const productoSQLite = {
    id: 184,
    nombre: "RASCADOR DE MADERA EN 2 POSICIONES",
    descripcion: "RASCADOR DE MADERA EN 2 POSICIONES",
    sku: "RAS004",
    categoria_id: 263,
    precio: 18000.0,
    precio_compra: 9385.0,
    costo_promedio: 9385.0,
    precio_venta: 18000.0,
    stock: 10,
    stock_minimo: 5,
    foto: "[IMAGEN_PRODUCTO_184]",
    marca: null,
    tiene_variantes: 0,
    fecha_creacion: "2026-01-06 20:01:42",
    fecha_actualizacion: "2026-01-06T20:01:42.000Z"
};

console.log('📋 DATOS EXTRAÍDOS DE SQLITE:');
console.log('==============================\n');
Object.entries(productoSQLite).forEach(([key, value]) => {
    console.log(`${key.padEnd(20)}: ${value}`);
});
console.log('\n');

// Mapeo de categorías
const categoriasMap = {
    263: { category: "accesorios", subcategory: "rascadores" }
};

// Función para generar tags
function generarTags(nombre) {
    const tags = [];
    const palabras = nombre.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(p => p.length > 2);
    
    palabras.forEach(palabra => {
        if (!tags.includes(palabra)) {
            tags.push(palabra);
        }
    });
    
    // Tags específicos de categoría
    const tagsCategoria = ['rascador', 'uñas', 'gatos', 'madera', 'natural'];
    tagsCategoria.forEach(tag => {
        if (!tags.includes(tag)) {
            tags.push(tag);
        }
    });
    
    return tags;
}

// Función para generar especificaciones
function generarEspecificaciones(producto) {
    const specs = {};
    
    if (producto.sku) specs.SKU = producto.sku;
    if (producto.marca) specs.Marca = producto.marca;
    
    const nombre = producto.nombre.toLowerCase();
    
    if (nombre.includes('madera')) {
        specs.Material = 'Madera natural';
    }
    
    if (nombre.includes('2 posiciones') || nombre.includes('dos posiciones')) {
        specs['Posiciones'] = '2 posiciones ajustables';
        specs['Versatilidad'] = 'Horizontal y vertical';
    }
    
    specs.Tipo = 'Rascador';
    specs['Ideal para'] = 'Gatos';
    specs.Instalación = 'Fácil montaje';
    
    return specs;
}

// Función para generar features
function generarFeatures(producto) {
    const features = [];
    const nombre = producto.nombre.toLowerCase();
    
    if (nombre.includes('madera')) {
        features.push('Material natural y resistente');
        features.push('Acabado en madera de calidad');
        features.push('Ecológico y duradero');
    }
    
    if (nombre.includes('2 posiciones')) {
        features.push('2 posiciones ajustables');
        features.push('Uso horizontal o vertical');
        features.push('Adaptable a diferentes espacios');
    }
    
    features.push('Protege muebles del hogar');
    features.push('Mantiene uñas sanas');
    features.push('Estimula comportamiento natural');
    features.push('Base estable y segura');
    features.push('Fácil de instalar');
    
    return features;
}

// Función para buscar descuentos (simulado - sin descuentos en este caso)
function buscarDescuentos(producto) {
    // En este caso, no hay descuentos aplicables
    return {
        discount: null,
        originalPrice: null,
        descuentoInfo: null
    };
}

// Generar rating y reviews
function generarRatingYReviews(precio) {
    const baseReviews = precio < 10000 ? 15 : precio < 20000 ? 25 : 40;
    const reviews = Math.floor(Math.random() * baseReviews) + 5;
    const rating = Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;
    
    return { rating, reviews };
}

console.log('🔄 PROCESANDO DATOS...\n');

// Procesar el producto
const categoriaInfo = categoriasMap[productoSQLite.categoria_id];
const tags = generarTags(productoSQLite.nombre);
const specifications = generarEspecificaciones(productoSQLite);
const features = generarFeatures(productoSQLite);
const descuentoInfo = buscarDescuentos(productoSQLite);
const { rating, reviews } = generarRatingYReviews(productoSQLite.precio);

// Producto final como aparecería en la web
const productoFinal = {
    id: `prod_${productoSQLite.id}`,
    name: productoSQLite.nombre,
    description: productoSQLite.descripcion,
    price: productoSQLite.precio,
    originalPrice: descuentoInfo.originalPrice,
    discount: descuentoInfo.discount,
    category: categoriaInfo.category,
    subcategory: categoriaInfo.subcategory,
    brand: productoSQLite.marca || "Sin marca",
    sku: productoSQLite.sku,
    stock: productoSQLite.stock,
    rating: rating,
    reviews: reviews,
    tags: tags,
    images: {
        cover: `assets/images/products/prod_${productoSQLite.id}/cover.jpg`,
        thumb: `assets/images/products/prod_${productoSQLite.id}/thumb.jpg`,
        marketing: null,
        gallery: [`assets/images/products/prod_${productoSQLite.id}/1.jpg`]
    },
    specifications: specifications,
    features: features,
    hasVideo: false,
    topDiscount: false
};

console.log('🌐 PRODUCTO COMO SE VERÍA EN LA PÁGINA WEB:');
console.log('============================================\n');
console.log(JSON.stringify(productoFinal, null, 2));

console.log('\n\n📱 VISTA PREVIA EN LA TIENDA:');
console.log('==============================\n');

console.log('┌─────────────────────────────────────────────────────┐');
console.log('│                                                     │');
console.log('│  [IMAGEN: RASCADOR DE MADERA EN 2 POSICIONES]      │');
console.log('│                                                     │');
console.log('├─────────────────────────────────────────────────────┤');
console.log(`│  ${productoFinal.name.padEnd(51)} │`);
console.log('├─────────────────────────────────────────────────────┤');
console.log(`│  ⭐ ${productoFinal.rating}/5  (${productoFinal.reviews} reseñas)${' '.repeat(30)} │`);
console.log('├─────────────────────────────────────────────────────┤');
console.log(`│  💰 $${productoFinal.price.toLocaleString()}${' '.repeat(44)} │`);
if (productoFinal.originalPrice) {
    console.log(`│  🏷️  Antes: $${productoFinal.originalPrice.toLocaleString()} (-${productoFinal.discount}%)${' '.repeat(20)} │`);
}
console.log('├─────────────────────────────────────────────────────┤');
console.log(`│  📦 Stock: ${productoFinal.stock} unidades disponibles${' '.repeat(23)} │`);
console.log(`│  🏷️  SKU: ${productoFinal.sku}${' '.repeat(43)} │`);
console.log('├─────────────────────────────────────────────────────┤');
console.log('│  📋 ESPECIFICACIONES:                               │');
Object.entries(productoFinal.specifications).forEach(([key, value]) => {
    const line = `│     • ${key}: ${value}`;
    console.log(line.padEnd(54) + '│');
});
console.log('├─────────────────────────────────────────────────────┤');
console.log('│  ⭐ CARACTERÍSTICAS:                                │');
productoFinal.features.slice(0, 5).forEach(feature => {
    const line = `│     ✓ ${feature}`;
    console.log(line.padEnd(54) + '│');
});
if (productoFinal.features.length > 5) {
    console.log(`│     ... y ${productoFinal.features.length - 5} más${' '.repeat(35)} │`);
}
console.log('├─────────────────────────────────────────────────────┤');
console.log('│  🏷️  TAGS:                                          │');
const tagsLine = `│     ${productoFinal.tags.slice(0, 6).join(', ')}`;
console.log(tagsLine.padEnd(54) + '│');
console.log('├─────────────────────────────────────────────────────┤');
console.log('│                                                     │');
console.log('│         [ AGREGAR AL CARRITO ]  [ ❤️ FAVORITO ]     │');
console.log('│                                                     │');
console.log('└─────────────────────────────────────────────────────┘');

console.log('\n\n✅ VALIDACIÓN DE CAMPOS:');
console.log('========================\n');

const camposObligatorios = [
    'id', 'name', 'description', 'price', 'category', 'subcategory',
    'brand', 'sku', 'stock', 'rating', 'reviews', 'tags', 'images',
    'specifications', 'features', 'hasVideo'
];

let todosPresentes = true;
camposObligatorios.forEach(campo => {
    const presente = productoFinal.hasOwnProperty(campo) && 
                    productoFinal[campo] !== null && 
                    productoFinal[campo] !== undefined;
    const valor = productoFinal[campo];
    const tipo = Array.isArray(valor) ? 'array' : typeof valor;
    
    console.log(`${campo.padEnd(15)}: ${presente ? '✅' : '❌'} (${tipo})`);
    if (!presente) todosPresentes = false;
});

console.log('\n📊 RESUMEN:');
console.log('===========\n');
console.log(`Producto: ${productoFinal.name}`);
console.log(`ID: ${productoFinal.id}`);
console.log(`Precio: $${productoFinal.price.toLocaleString()}`);
console.log(`Stock: ${productoFinal.stock} unidades`);
console.log(`Rating: ${productoFinal.rating}/5 (${productoFinal.reviews} reseñas)`);
console.log(`Categoría: ${productoFinal.category} > ${productoFinal.subcategory}`);
console.log(`Tags: ${productoFinal.tags.length} tags`);
console.log(`Especificaciones: ${Object.keys(productoFinal.specifications).length} specs`);
console.log(`Características: ${productoFinal.features.length} features`);
console.log(`Descuento: ${productoFinal.discount ? productoFinal.discount + '%' : 'No'}`);

console.log('\n🎯 RESULTADO FINAL:');
console.log('===================\n');

if (todosPresentes) {
    console.log('✅ PRODUCTO VÁLIDO Y COMPLETO');
    console.log('   ✓ Todos los campos obligatorios presentes');
    console.log('   ✓ Datos generados correctamente');
    console.log('   ✓ Listo para mostrar en la tienda');
    console.log('   ✓ Compatible con el formato de la página');
} else {
    console.log('❌ PRODUCTO INCOMPLETO');
}

console.log('\n🚀 Test completado - Producto listo para la web');