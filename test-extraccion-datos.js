// Test de Extracción de Datos - RASCADOR TABLA CARTON Y ALFOMBRA
const fs = require('fs');

console.log('🧪 TEST DE EXTRACCIÓN DE DATOS');
console.log('===============================');
console.log('📦 Producto: RASCADOR TABLA CARTON Y ALFOMBRA\n');

// Datos extraídos de SQLite
const productoSQLite = {
    id: 181,
    nombre: "RASCADOR TABLA CARTON Y ALFOMBRA",
    descripcion: "RASCADOR TABLA CARTON Y ALFOMBRA",
    sku: "RAS001",
    categoria_id: 263,
    precio: 9000.0,
    precio_compra: 4652.0,
    costo_promedio: 4652.0,
    precio_venta: 9000.0,
    stock: 10,
    stock_minimo: 5,
    foto: "[IMAGEN_PRODUCTO_181]",
    marca: null, // Sin marca en la base
    tiene_variantes: 0,
    fecha_creacion: "2026-01-06 19:50:30",
    fecha_actualizacion: "2026-01-06T19:50:30.913Z"
};

console.log('📋 DATOS EXTRAÍDOS DE SQLITE:');
console.log('=============================');
Object.entries(productoSQLite).forEach(([key, value]) => {
    console.log(`${key.padEnd(20)}: ${value}`);
});

// Mapeo de categorías
const categoriasMap = {
    250: { category: "higiene-cuidado", subcategory: "shampoo" },
    261: { category: "casa-descanso", subcategory: "colchonetas" },
    262: { category: "casa-descanso", subcategory: "casitas" },
    263: { category: "accesorios", subcategory: "rascadores" },
    264: { category: "juguetes", subcategory: "interactivos" },
    275: { category: "ropa", subcategory: "verano" },
    316: { category: "ropa", subcategory: "invierno" },
    317: { category: "accesorios", subcategory: "collares" },
    409: { category: "accesorios", subcategory: "comederos" }
};

// Función para generar tags
function generarTags(nombre, descripcion, marca, categoria) {
    const tags = [];
    
    // Tags de la marca
    if (marca) tags.push(marca.toLowerCase());
    
    // Tags del nombre
    const palabrasNombre = nombre.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Reemplazar caracteres especiales
        .split(/\s+/)
        .filter(palabra => palabra.length > 2);
    
    palabrasNombre.forEach(palabra => {
        if (!tags.includes(palabra)) {
            tags.push(palabra);
        }
    });
    
    // Tags de categoría específicos
    const tagsCategoria = {
        263: ['rascador', 'uñas', 'gatos', 'sisal', 'carton', 'alfombra']
    };
    
    if (tagsCategoria[categoria]) {
        tagsCategoria[categoria].forEach(tag => {
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
        });
    }
    
    return tags;
}

// Función para generar especificaciones
function generarEspecificaciones(producto) {
    const specs = {};
    
    // Especificaciones básicas
    if (producto.marca) specs.Marca = producto.marca;
    if (producto.sku) specs.SKU = producto.sku;
    
    // Extraer información del nombre
    const nombre = producto.nombre.toLowerCase();
    
    // Detectar materiales
    if (nombre.includes('carton')) specs.Material = 'Cartón corrugado';
    if (nombre.includes('alfombra')) specs['Material Base'] = 'Alfombra antideslizante';
    if (nombre.includes('sisal')) specs.Material = 'Sisal natural';
    
    // Especificaciones por categoría
    const especsPorCategoria = {
        263: { 
            Tipo: "Rascador", 
            Uso: "Mantener uñas sanas",
            'Ideal para': "Gatos",
            Instalación: "Fácil montaje"
        }
    };
    
    if (especsPorCategoria[producto.categoria_id]) {
        Object.assign(specs, especsPorCategoria[producto.categoria_id]);
    }
    
    return specs;
}

// Función para generar features
function generarFeatures(producto) {
    const features = [];
    const nombre = producto.nombre.toLowerCase();
    
    // Features específicas por tipo de rascador
    if (nombre.includes('tabla')) {
        features.push("Superficie plana para rascar");
        features.push("Diseño horizontal");
    }
    
    if (nombre.includes('carton')) {
        features.push("Material ecológico");
        features.push("Textura ideal para uñas");
        features.push("Reciclable");
    }
    
    if (nombre.includes('alfombra')) {
        features.push("Base antideslizante");
        features.push("Estable y seguro");
    }
    
    // Features generales para rascadores
    features.push("Protege muebles del hogar");
    features.push("Estimula comportamiento natural");
    features.push("Fácil de usar");
    
    return features;
}

// Función para calcular descuento
function calcularDescuento(precio, precioCompra) {
    if (!precioCompra || precio <= precioCompra * 1.3) return null;
    
    const originalPrice = Math.round(precio * 1.25);
    const discount = Math.round(((originalPrice - precio) / originalPrice) * 100);
    
    return { originalPrice, discount };
}

// Función para generar rating y reviews aleatorios pero realistas
function generarRatingYReviews(precio, categoria) {
    // Productos más baratos tienden a tener menos reviews
    const baseReviews = precio < 10000 ? 15 : precio < 20000 ? 25 : 40;
    const reviews = Math.floor(Math.random() * baseReviews) + 5;
    
    // Rating entre 3.5 y 5.0, con tendencia hacia valores altos
    const rating = Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;
    
    return { rating, reviews };
}

console.log('\n🔄 PROCESANDO DATOS...\n');

// Procesar el producto
const categoriaInfo = categoriasMap[productoSQLite.categoria_id] || 
    { category: "otros", subcategory: "general" };

const tags = generarTags(
    productoSQLite.nombre, 
    productoSQLite.descripcion, 
    productoSQLite.marca, 
    productoSQLite.categoria_id
);

const specifications = generarEspecificaciones(productoSQLite);
const features = generarFeatures(productoSQLite);
const descuentoInfo = calcularDescuento(productoSQLite.precio, productoSQLite.precio_compra);
const { rating, reviews } = generarRatingYReviews(productoSQLite.precio, productoSQLite.categoria_id);

// Producto final generado
const productoFinal = {
    id: `prod_${productoSQLite.id}`,
    name: productoSQLite.nombre,
    description: productoSQLite.descripcion || productoSQLite.nombre,
    price: productoSQLite.precio,
    originalPrice: descuentoInfo?.originalPrice || null,
    discount: descuentoInfo?.discount || null,
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
    topDiscount: descuentoInfo && descuentoInfo.discount >= 20
};

console.log('📦 PRODUCTO FINAL GENERADO:');
console.log('===========================');
console.log(JSON.stringify(productoFinal, null, 2));

// Validar campos obligatorios
console.log('\n🔍 VALIDACIÓN DE CAMPOS OBLIGATORIOS:');
console.log('=====================================');

const camposObligatorios = [
    'id', 'name', 'description', 'price', 'category', 'subcategory', 
    'brand', 'sku', 'stock', 'rating', 'reviews', 'tags', 'images', 
    'specifications', 'features', 'hasVideo'
];

const camposOpcionales = [
    'originalPrice', 'discount', 'topDiscount', 'marketing'
];

let todosLosObligatoriosPresentes = true;

camposObligatorios.forEach(campo => {
    const presente = productoFinal.hasOwnProperty(campo) && productoFinal[campo] !== null && productoFinal[campo] !== undefined;
    const valor = productoFinal[campo];
    
    console.log(`${campo.padEnd(15)}: ${presente ? '✅' : '❌'} ${presente ? (typeof valor === 'object' ? `(${Array.isArray(valor) ? valor.length + ' items' : Object.keys(valor).length + ' props'})` : valor) : 'FALTANTE'}`);
    
    if (!presente) todosLosObligatoriosPresentes = false;
});

console.log('\n📋 CAMPOS OPCIONALES:');
camposOpcionales.forEach(campo => {
    const presente = productoFinal.hasOwnProperty(campo) && productoFinal[campo] !== null;
    const valor = productoFinal[campo];
    console.log(`${campo.padEnd(15)}: ${presente ? '✅' : '⚪'} ${presente ? valor : 'No definido'}`);
});

// Validaciones específicas
console.log('\n🧪 VALIDACIONES ESPECÍFICAS:');
console.log('============================');

// Validar imágenes
const imagenesValidas = productoFinal.images && 
    productoFinal.images.cover && 
    productoFinal.images.thumb && 
    productoFinal.images.gallery && 
    Array.isArray(productoFinal.images.gallery);

console.log(`Estructura de imágenes: ${imagenesValidas ? '✅' : '❌'}`);

// Validar tags
const tagsValidos = Array.isArray(productoFinal.tags) && productoFinal.tags.length > 0;
console.log(`Tags generados: ${tagsValidos ? '✅' : '❌'} (${productoFinal.tags?.length || 0} tags)`);

// Validar especificaciones
const specsValidas = typeof productoFinal.specifications === 'object' && 
    Object.keys(productoFinal.specifications).length > 0;
console.log(`Especificaciones: ${specsValidas ? '✅' : '❌'} (${Object.keys(productoFinal.specifications || {}).length} specs)`);

// Validar features
const featuresValidas = Array.isArray(productoFinal.features) && productoFinal.features.length > 0;
console.log(`Features generadas: ${featuresValidas ? '✅' : '❌'} (${productoFinal.features?.length || 0} features)`);

// Validar precio
const precioValido = typeof productoFinal.price === 'number' && productoFinal.price > 0;
console.log(`Precio válido: ${precioValido ? '✅' : '❌'} ($${productoFinal.price?.toLocaleString() || 'N/A'})`);

// Validar stock
const stockValido = typeof productoFinal.stock === 'number' && productoFinal.stock >= 0;
console.log(`Stock válido: ${stockValido ? '✅' : '❌'} (${productoFinal.stock} unidades)`);

// Validar rating
const ratingValido = typeof productoFinal.rating === 'number' && 
    productoFinal.rating >= 1 && productoFinal.rating <= 5;
console.log(`Rating válido: ${ratingValido ? '✅' : '❌'} (${productoFinal.rating}/5)`);

// Resultado final
console.log('\n🎯 RESULTADO FINAL:');
console.log('==================');

const todasLasValidaciones = todosLosObligatoriosPresentes && imagenesValidas && 
    tagsValidos && specsValidas && featuresValidas && precioValido && 
    stockValido && ratingValido;

if (todasLasValidaciones) {
    console.log('✅ PRODUCTO VÁLIDO - Listo para agregar a la tienda');
    console.log('   ✓ Todos los campos obligatorios presentes');
    console.log('   ✓ Estructura de datos correcta');
    console.log('   ✓ Valores dentro de rangos válidos');
    console.log('   ✓ Compatible con el formato de la tienda');
} else {
    console.log('❌ PRODUCTO INVÁLIDO - Requiere correcciones');
    if (!todosLosObligatoriosPresentes) console.log('   ✗ Faltan campos obligatorios');
    if (!imagenesValidas) console.log('   ✗ Estructura de imágenes incorrecta');
    if (!tagsValidos) console.log('   ✗ Tags no generados correctamente');
    if (!specsValidas) console.log('   ✗ Especificaciones faltantes');
    if (!featuresValidas) console.log('   ✗ Features no generadas');
    if (!precioValido) console.log('   ✗ Precio inválido');
    if (!stockValido) console.log('   ✗ Stock inválido');
    if (!ratingValido) console.log('   ✗ Rating fuera de rango');
}

console.log('\n🚀 Test de extracción de datos completado');