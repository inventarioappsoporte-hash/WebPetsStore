const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const DB_PATH = path.join(__dirname, '../database/inventario_restored.db');
const PRODUCTS_JSON_PATH = path.join(__dirname, 'data/products.json');
const BACKUP_JSON_PATH = path.join(__dirname, '../backupInventario/backup_owner_2026-01-13T16-26-46-405.json');

// Mapeo de categorías SQLite a categorías web
const CATEGORY_MAP = {
    250: { slug: 'higiene-cuidado', name: 'Higiene y Cuidado', badge: '🧼 Higiene' },
    261: { slug: 'casa-descanso', name: 'Colchonetas y Moisés', badge: '🛏️ Colchonetas' },
    262: { slug: 'casa-descanso', name: 'Bolsos y Casitas', badge: '🏠 Casitas' },
    263: { slug: 'casa-descanso', name: 'Rascadores', badge: '🐱 Rascadores' },
    264: { slug: 'juguetes', name: 'Juguetes', badge: '🎾 Juguetes' },
    275: { slug: 'ropa', name: 'Ropa Verano', badge: '👕 Ropa' },
    316: { slug: 'ropa', name: 'Ropa Invierno', badge: '🧥 Ropa' },
    317: { slug: 'accesorios', name: 'Collares, Correas y Pecheras', badge: '🦴 Accesorios' },
    409: { slug: 'alimentacion', name: 'Comederos y Bebederos', badge: '🍽️ Comederos' },
    500: { slug: 'accesorios', name: 'Accesorios', badge: '😎 Accesorios' }
};

// Mapeo de tipos de variantes
const VARIANT_TYPE_MAP = {
    'Talla': 'size',
    'Color': 'color',
    'Tamaño': 'size',
    'Sabor': 'flavor',
    'Tipo': 'type',
    'Modelo': 'model'
};

function ejecutarQuery(query) {
    try {
        const result = execSync(`sqlite3 "${DB_PATH}" "${query}"`, {
            encoding: 'utf-8',
            maxBuffer: 50 * 1024 * 1024
        });
        return result.trim();
    } catch (error) {
        console.error('❌ Error ejecutando query:', error.message);
        return null;
    }
}

function cargarBackupImagenes() {
    try {
        const backupData = JSON.parse(fs.readFileSync(BACKUP_JSON_PATH, 'utf-8'));
        console.log(`📸 Backup JSON cargado: ${backupData.imagenes?.length || 0} imágenes disponibles`);
        return backupData.imagenes || [];
    } catch (error) {
        console.error('❌ Error cargando backup de imágenes:', error.message);
        return [];
    }
}

function buscarImagenProducto(productoId, imagenes) {
    return imagenes.find(img => 
        img.tipo === 'producto' && 
        img.objeto_id === productoId
    );
}

function buscarImagenVariante(productoId, skuVariante, imagenes) {
    // Buscar imagen específica de la variante por SKU
    const imagenVariante = imagenes.find(img => 
        img.tipo === 'producto_variante' && 
        img.nombre_archivo && 
        img.nombre_archivo.includes(skuVariante)
    );
    
    if (imagenVariante) return imagenVariante;
    
    // Si no hay imagen específica, usar la del producto base
    return buscarImagenProducto(productoId, imagenes);
}

function guardarImagen(imagenData, productoId, varianteSuffix = '') {
    if (!imagenData || !imagenData.ruta_original) return null;

    const rutaOriginal = imagenData.ruta_original;
    const extension = path.extname(rutaOriginal) || '.jpg';
    const suffix = varianteSuffix ? `_${varianteSuffix}` : '';
    
    const dirDestino = path.join(__dirname, 'assets/images/products', `prod_${productoId}`);
    
    if (!fs.existsSync(dirDestino)) {
        fs.mkdirSync(dirDestino, { recursive: true });
    }

    try {
        // Guardar cover, thumb y galería
        const archivos = ['cover', 'thumb', '1'];
        const rutas = {};

        archivos.forEach(tipo => {
            const nombreArchivo = `${tipo}${suffix}${extension}`;
            const rutaDestino = path.join(dirDestino, nombreArchivo);
            
            if (fs.existsSync(rutaOriginal)) {
                fs.copyFileSync(rutaOriginal, rutaDestino);
            }
            
            rutas[tipo] = `assets/images/products/prod_${productoId}/${nombreArchivo}`;
        });

        return rutas;
    } catch (error) {
        console.error(`   ⚠️  Error guardando imagen: ${error.message}`);
        return null;
    }
}

function generarTags(nombre, categoria) {
    const palabras = nombre.toLowerCase()
        .replace(/[^\w\sáéíóúñ]/g, ' ')
        .split(/\s+/)
        .filter(p => p.length > 2);
    
    const tagsBase = [...new Set(palabras)].slice(0, 6);
    
    // Agregar tags de categoría
    const categoryTags = {
        'higiene-cuidado': ['higiene', 'limpieza', 'cuidado'],
        'casa-descanso': ['descanso', 'cama', 'confort'],
        'juguetes': ['juguete', 'juego', 'diversión'],
        'ropa': ['ropa', 'vestimenta'],
        'accesorios': ['accesorio', 'complemento'],
        'alimentacion': ['comedero', 'bebedero', 'alimentación']
    };
    
    return [...tagsBase, ...(categoryTags[categoria] || [])].slice(0, 8);
}

function convertirProductoConVariantes(productoId, modo = 'check') {
    console.log(`\n🔍 Analizando producto ID: ${productoId}`);
    
    // Obtener información del producto base
    const queryProducto = `SELECT id, nombre, descripcion, sku, categoria_id, precio_venta, stock, marca, tiene_variantes FROM productos WHERE id = ${productoId};`;
    
    const resultadoProducto = ejecutarQuery(queryProducto);
    if (!resultadoProducto) {
        console.log('❌ Producto no encontrado');
        return null;
    }
    
    const partes = resultadoProducto.split('|');
    if (partes.length < 9) {
        console.log('❌ Datos incompletos del producto');
        return null;
    }
    
    const [id, nombre, descripcion, sku, categoria_id, precio_venta, stock, marca, tiene_variantes] = partes;
    
    if (parseInt(tiene_variantes) !== 1) {
        console.log('⚠️  Este producto NO tiene variantes');
        return null;
    }
    
    console.log(`✅ Producto: ${nombre}`);
    console.log(`   Tiene variantes: Sí`);
    
    // Obtener variantes del producto
    const queryVariantes = `SELECT id, combinacion_variantes, stock_actual, precio_final, sku_variante, foto FROM producto_variantes WHERE producto_id = ${productoId} AND activo = 1 ORDER BY orden_display, id;`;
    
    const resultadoVariantes = ejecutarQuery(queryVariantes);
    if (!resultadoVariantes) {
        console.log('❌ No se encontraron variantes');
        return null;
    }
    
    const lineasVariantes = resultadoVariantes.split('\n').filter(l => l.trim());
    console.log(`   Variantes encontradas: ${lineasVariantes.length}`);
    
    // Procesar variantes
    const variantes = [];
    const atributosSet = new Set();
    
    lineasVariantes.forEach((linea, index) => {
        const [varId, combinacion, stockVar, precioVar, skuVar, fotoVar] = linea.split('|');
        
        try {
            const combinacionObj = JSON.parse(combinacion);
            const atributos = Object.keys(combinacionObj);
            atributos.forEach(attr => atributosSet.add(attr));
            
            variantes.push({
                id: `var_${productoId}_${index + 1}`,
                attributes: combinacionObj,
                price: parseFloat(precioVar),
                stock: parseInt(stockVar),
                sku: skuVar || `${sku}-VAR${index + 1}`,
                available: parseInt(stockVar) > 0
            });
            
            console.log(`   - ${Object.entries(combinacionObj).map(([k,v]) => `${k}: ${v}`).join(', ')} - $${precioVar} (Stock: ${stockVar})`);
        } catch (error) {
            console.error(`   ⚠️  Error procesando variante: ${error.message}`);
        }
    });
    
    // Construir estructura de atributos
    const attributes = Array.from(atributosSet).map(attr => ({
        id: VARIANT_TYPE_MAP[attr] || attr.toLowerCase(),
        name: attr,
        type: VARIANT_TYPE_MAP[attr] || 'custom'
    }));
    
    console.log(`   Atributos: ${attributes.map(a => a.name).join(', ')}`);
    
    if (modo === 'check') {
        console.log('\n✅ Análisis completado (modo check)');
        return {
            id: productoId,
            nombre,
            variantes: variantes.length,
            atributos: attributes.map(a => a.name)
        };
    }
    
    // Modo conversión: crear estructura completa
    const categoryInfo = CATEGORY_MAP[parseInt(categoria_id)] || CATEGORY_MAP[500];
    const imagenes = cargarBackupImagenes();
    
    // Calcular precio base (el más bajo)
    const precioBase = Math.min(...variantes.map(v => v.price));
    const precioOriginal = Math.round(precioBase * 1.25);
    const descuento = 20;
    
    // Guardar imágenes del producto base
    const imagenProducto = buscarImagenProducto(parseInt(id), imagenes);
    const rutasImagenes = guardarImagen(imagenProducto, id);
    
    if (rutasImagenes) {
        console.log(`   📸 Imagen base guardada`);
    }
    
    // Procesar imágenes de variantes
    variantes.forEach((variante, index) => {
        const imagenVar = buscarImagenVariante(parseInt(id), variante.sku, imagenes);
        const suffix = Object.values(variante.attributes).join('_').toLowerCase().replace(/\s+/g, '_');
        const rutasVar = guardarImagen(imagenVar, id, suffix);
        
        if (rutasVar) {
            variante.images = {
                cover: rutasVar.cover,
                thumb: rutasVar.thumb,
                gallery: [rutasVar['1']]
            };
            console.log(`   📸 Imagen variante ${index + 1} guardada`);
        } else {
            // Usar imágenes del producto base
            variante.images = {
                cover: rutasImagenes?.cover || `assets/images/products/prod_${id}/cover.jpg`,
                thumb: rutasImagenes?.thumb || `assets/images/products/prod_${id}/thumb.jpg`,
                gallery: [rutasImagenes?.['1'] || `assets/images/products/prod_${id}/1.jpg`]
            };
        }
        
        // Calcular precio original de la variante
        variante.originalPrice = Math.round(variante.price * 1.25);
    });
    
    // Construir producto completo
    const producto = {
        id: `prod_${id}`,
        name: nombre,
        category: categoryInfo.slug,
        subcategory: categoryInfo.name.split(' ')[0],
        hasVariants: true,
        basePrice: precioBase,
        baseOriginalPrice: precioOriginal,
        discount: descuento,
        stock: variantes.reduce((sum, v) => sum + v.stock, 0),
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 100) + 20,
        featured: false,
        topDiscount: descuento >= 25,
        hasVideo: false,
        tags: generarTags(nombre, categoryInfo.slug),
        description: descripcion || nombre,
        longDescription: descripcion || `${nombre}. Disponible en múltiples variantes.`,
        variants: {
            attributes,
            combinations: variantes
        },
        images: {
            cover: rutasImagenes?.cover || `assets/images/products/prod_${id}/cover.jpg`,
            thumb: rutasImagenes?.thumb || `assets/images/products/prod_${id}/thumb.jpg`,
            gallery: [rutasImagenes?.['1'] || `assets/images/products/prod_${id}/1.jpg`]
        },
        specs: {
            SKU: sku || `PROD${id}`
        },
        shipping: {
            free: precioBase > 15000,
            days: Math.floor(Math.random() * 3) + 2
        },
        badge: categoryInfo.badge,
        brand: marca || 'Sin marca',
        sku: sku || `PROD${id}`,
        features: [
            'Múltiples variantes disponibles',
            'Calidad garantizada',
            'Fácil de usar',
            'Resistente y duradero'
        ]
    };
    
    console.log(`\n✅ Producto con variantes convertido exitosamente`);
    return producto;
}

// Función principal
function main() {
    const args = process.argv.slice(2);
    const comando = args[0] || 'check';
    const productoId = args[1];
    
    console.log('🔄 CONVERTIDOR DE PRODUCTOS CON VARIANTES');
    console.log('==========================================\n');
    
    if (!productoId) {
        console.log('❌ Uso: node convertir-productos-variantes.js [check|convert] <producto_id>');
        console.log('\nEjemplos:');
        console.log('  node convertir-productos-variantes.js check 106');
        console.log('  node convertir-productos-variantes.js convert 106');
        process.exit(1);
    }
    
    const resultado = convertirProductoConVariantes(productoId, comando);
    
    if (resultado && comando === 'convert') {
        // Guardar en archivo temporal para revisión
        const outputPath = path.join(__dirname, `producto_variante_${productoId}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(resultado, null, 2));
        console.log(`\n💾 Producto guardado en: ${outputPath}`);
        console.log('\n📝 Revisa el archivo y si está correcto, agrégalo manualmente a products.json');
    }
}

main();
