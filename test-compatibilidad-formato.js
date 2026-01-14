// Test de Compatibilidad de Formato - Comparar con producto existente
const fs = require('fs');

console.log('🧪 TEST DE COMPATIBILIDAD DE FORMATO');
console.log('====================================');
console.log('📊 Comparando estructura de datos extraídos vs productos existentes\n');

// Producto extraído de SQLite (RASCADOR TABLA CARTON Y ALFOMBRA)
const productoExtraido = {
    id: "prod_181",
    name: "RASCADOR TABLA CARTON Y ALFOMBRA",
    description: "RASCADOR TABLA CARTON Y ALFOMBRA",
    price: 9000,
    originalPrice: 11250,
    discount: 20,
    category: "accesorios",
    subcategory: "rascadores",
    brand: "Sin marca",
    sku: "RAS001",
    stock: 10,
    rating: 3.8,
    reviews: 12,
    tags: ["rascador", "tabla", "carton", "alfombra", "uñas", "gatos", "sisal"],
    images: {
        cover: "assets/images/products/prod_181/cover.jpg",
        thumb: "assets/images/products/prod_181/thumb.jpg",
        marketing: null,
        gallery: ["assets/images/products/prod_181/1.jpg"]
    },
    specifications: {
        SKU: "RAS001",
        Material: "Cartón corrugado",
        "Material Base": "Alfombra antideslizante",
        Tipo: "Rascador",
        Uso: "Mantener uñas sanas",
        "Ideal para": "Gatos",
        Instalación: "Fácil montaje"
    },
    features: [
        "Superficie plana para rascar",
        "Diseño horizontal",
        "Material ecológico",
        "Textura ideal para uñas",
        "Reciclable",
        "Base antideslizante",
        "Estable y seguro",
        "Protege muebles del hogar",
        "Estimula comportamiento natural",
        "Fácil de usar"
    ],
    hasVideo: false,
    topDiscount: true
};

// Cargar productos existentes
const PRODUCTS_JSON = 'data/products.json';
let productosExistentes = [];
if (fs.existsSync(PRODUCTS_JSON)) {
    productosExistentes = JSON.parse(fs.readFileSync(PRODUCTS_JSON));
}

// Tomar un producto existente como referencia
const productoReferencia = productosExistentes[0]; // Primer producto como referencia

console.log('📋 PRODUCTO DE REFERENCIA (Existente):');
console.log('======================================');
console.log(`ID: ${productoReferencia.id}`);
console.log(`Nombre: ${productoReferencia.name}`);
console.log(`Categoría: ${productoReferencia.category}`);
console.log('');

console.log('📦 PRODUCTO EXTRAÍDO (Nuevo):');
console.log('=============================');
console.log(`ID: ${productoExtraido.id}`);
console.log(`Nombre: ${productoExtraido.name}`);
console.log(`Categoría: ${productoExtraido.category}`);
console.log('');

// Función para obtener todos los campos de un objeto (incluyendo anidados)
function obtenerCampos(obj, prefijo = '') {
    const campos = [];
    
    for (const [key, value] of Object.entries(obj)) {
        const nombreCampo = prefijo ? `${prefijo}.${key}` : key;
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            // Objeto anidado
            campos.push(nombreCampo);
            campos.push(...obtenerCampos(value, nombreCampo));
        } else {
            campos.push(nombreCampo);
        }
    }
    
    return campos;
}

// Obtener campos de ambos productos
const camposReferencia = obtenerCampos(productoReferencia);
const camposExtraido = obtenerCampos(productoExtraido);

console.log('🔍 ANÁLISIS DE COMPATIBILIDAD:');
console.log('==============================');

// Campos presentes en referencia
console.log(`📊 Campos en producto de referencia: ${camposReferencia.length}`);
console.log(`📊 Campos en producto extraído: ${camposExtraido.length}`);
console.log('');

// Campos faltantes en el producto extraído
const camposFaltantes = camposReferencia.filter(campo => !camposExtraido.includes(campo));
console.log('❌ CAMPOS FALTANTES en producto extraído:');
if (camposFaltantes.length === 0) {
    console.log('   ✅ Ninguno - Todos los campos están presentes');
} else {
    camposFaltantes.forEach(campo => {
        console.log(`   - ${campo}`);
    });
}
console.log('');

// Campos adicionales en el producto extraído
const camposAdicionales = camposExtraido.filter(campo => !camposReferencia.includes(campo));
console.log('➕ CAMPOS ADICIONALES en producto extraído:');
if (camposAdicionales.length === 0) {
    console.log('   ⚪ Ninguno - Estructura idéntica');
} else {
    camposAdicionales.forEach(campo => {
        console.log(`   + ${campo}`);
    });
}
console.log('');

// Validar tipos de datos
console.log('🔍 VALIDACIÓN DE TIPOS DE DATOS:');
console.log('================================');

function validarTipo(valor, nombreCampo) {
    const tipo = Array.isArray(valor) ? 'array' : typeof valor;
    return { tipo, valor, nombreCampo };
}

const tiposReferencia = {};
const tiposExtraido = {};

// Obtener tipos del producto de referencia
for (const [key, value] of Object.entries(productoReferencia)) {
    tiposReferencia[key] = validarTipo(value, key);
}

// Obtener tipos del producto extraído
for (const [key, value] of Object.entries(productoExtraido)) {
    tiposExtraido[key] = validarTipo(value, key);
}

// Comparar tipos
const tiposIncorrectos = [];
for (const campo in tiposReferencia) {
    if (tiposExtraido[campo]) {
        const tipoRef = tiposReferencia[campo].tipo;
        const tipoExt = tiposExtraido[campo].tipo;
        
        if (tipoRef !== tipoExt) {
            tiposIncorrectos.push({
                campo,
                esperado: tipoRef,
                obtenido: tipoExt
            });
        }
    }
}

if (tiposIncorrectos.length === 0) {
    console.log('✅ Todos los tipos de datos son correctos');
} else {
    console.log('❌ TIPOS DE DATOS INCORRECTOS:');
    tiposIncorrectos.forEach(error => {
        console.log(`   - ${error.campo}: esperado ${error.esperado}, obtenido ${error.obtenido}`);
    });
}
console.log('');

// Validar estructura de imágenes específicamente
console.log('🖼️ VALIDACIÓN DE ESTRUCTURA DE IMÁGENES:');
console.log('========================================');

const imagenesRef = productoReferencia.images;
const imagenesExt = productoExtraido.images;

const camposImagenesRequeridos = ['cover', 'thumb', 'gallery'];
const camposImagenesOpcionales = ['marketing'];

camposImagenesRequeridos.forEach(campo => {
    const presenteRef = imagenesRef && imagenesRef[campo];
    const presenteExt = imagenesExt && imagenesExt[campo];
    
    console.log(`${campo.padEnd(10)}: Ref ${presenteRef ? '✅' : '❌'} | Ext ${presenteExt ? '✅' : '❌'}`);
});

camposImagenesOpcionales.forEach(campo => {
    const presenteRef = imagenesRef && imagenesRef[campo];
    const presenteExt = imagenesExt && imagenesExt[campo];
    
    console.log(`${campo.padEnd(10)}: Ref ${presenteRef ? '✅' : '⚪'} | Ext ${presenteExt ? '✅' : '⚪'} (opcional)`);
});

// Validar arrays
console.log('\n📋 VALIDACIÓN DE ARRAYS:');
console.log('========================');

const arraysValidar = ['tags', 'features'];
arraysValidar.forEach(campo => {
    const refArray = productoReferencia[campo];
    const extArray = productoExtraido[campo];
    
    const refEsArray = Array.isArray(refArray);
    const extEsArray = Array.isArray(extArray);
    const refTamaño = refEsArray ? refArray.length : 0;
    const extTamaño = extEsArray ? extArray.length : 0;
    
    console.log(`${campo.padEnd(10)}: Ref ${refEsArray ? '✅' : '❌'}(${refTamaño}) | Ext ${extEsArray ? '✅' : '❌'}(${extTamaño})`);
});

// Validar objetos anidados
console.log('\n🔧 VALIDACIÓN DE OBJETOS ANIDADOS:');
console.log('==================================');

const objetosValidar = ['images', 'specifications'];
objetosValidar.forEach(campo => {
    const refObj = productoReferencia[campo];
    const extObj = productoExtraido[campo];
    
    const refEsObj = typeof refObj === 'object' && refObj !== null && !Array.isArray(refObj);
    const extEsObj = typeof extObj === 'object' && extObj !== null && !Array.isArray(extObj);
    const refProps = refEsObj ? Object.keys(refObj).length : 0;
    const extProps = extEsObj ? Object.keys(extObj).length : 0;
    
    console.log(`${campo.padEnd(15)}: Ref ${refEsObj ? '✅' : '❌'}(${refProps}) | Ext ${extEsObj ? '✅' : '❌'}(${extProps})`);
});

// Resultado final
console.log('\n🎯 RESULTADO DE COMPATIBILIDAD:');
console.log('===============================');

const esCompatible = camposFaltantes.length === 0 && 
                    tiposIncorrectos.length === 0 && 
                    Array.isArray(productoExtraido.tags) && 
                    Array.isArray(productoExtraido.features) &&
                    typeof productoExtraido.images === 'object' &&
                    typeof productoExtraido.specifications === 'object';

if (esCompatible) {
    console.log('✅ FORMATO COMPLETAMENTE COMPATIBLE');
    console.log('   ✓ Todos los campos requeridos presentes');
    console.log('   ✓ Tipos de datos correctos');
    console.log('   ✓ Estructura de arrays válida');
    console.log('   ✓ Objetos anidados correctos');
    console.log('   ✓ Listo para integrar en la tienda');
} else {
    console.log('❌ FORMATO INCOMPATIBLE - Requiere ajustes');
    if (camposFaltantes.length > 0) console.log('   ✗ Faltan campos requeridos');
    if (tiposIncorrectos.length > 0) console.log('   ✗ Tipos de datos incorrectos');
}

console.log('\n📊 ESTADÍSTICAS FINALES:');
console.log('========================');
console.log(`Compatibilidad: ${esCompatible ? '100%' : 'Parcial'}`);
console.log(`Campos coincidentes: ${camposReferencia.length - camposFaltantes.length}/${camposReferencia.length}`);
console.log(`Tipos correctos: ${Object.keys(tiposReferencia).length - tiposIncorrectos.length}/${Object.keys(tiposReferencia).length}`);

console.log('\n🚀 Test de compatibilidad completado');