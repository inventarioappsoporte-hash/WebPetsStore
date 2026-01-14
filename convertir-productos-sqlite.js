// Script de Conversión de Productos desde SQLite a JSON
// Uso: node convertir-productos-sqlite.js [--check] [categoria] [limite] [tipo]

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración
const DB_PATH = path.join(__dirname, '..', 'database', 'inventario_restored.db');
const BACKUP_PATH = path.join(__dirname, '..', 'backupInventario', 'backup_owner_2026-01-13T16-26-46-405.json');
const PRODUCTS_JSON = path.join(__dirname, 'data', 'products.json');

// Función helper para ejecutar queries SQL
function ejecutarQuery(query) {
    try {
        // Escapar comillas y ejecutar
        const cmd = `sqlite3 "${DB_PATH}" "${query.replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\s+/g, ' ')}"`;
        const result = execSync(cmd, { 
            encoding: 'utf8', 
            maxBuffer: 10 * 1024 * 1024,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        return result.trim();
    } catch (error) {
        console.error('❌ Error ejecutando query:', error.message);
        return '';
    }
}

// Mapeo de categorías SQLite → JSON
const categoriasMap = {
    250: { category: "higiene-cuidado", subcategory: "Alimentos", icon: "🧴", nombre: "HIGIENE Y CUIDADO" },
    261: { category: "casa-descanso", subcategory: "Colchonetas", icon: "🛏️", nombre: "COLCHONETAS Y MOISES" },
    262: { category: "casa-descanso", subcategory: "Casitas", icon: "🏠", nombre: "BOLSOS Y CASITAS" },
    263: { category: "accesorios", subcategory: "Rascadores", icon: "🛏️", nombre: "RASCADORES" },
    264: { category: "juguetes", subcategory: "Juguetes", icon: "🎾", nombre: "JUGUETES" },
    275: { category: "ropa", subcategory: "Ropa", icon: "👕", nombre: "ROPA VERANO" },
    316: { category: "ropa", subcategory: "Ropa", icon: "🧥", nombre: "ROPA INVIERNO" },
    317: { category: "accesorios", subcategory: "Accesorios", icon: "🦴", nombre: "COLLARES, CORREAS Y PECHERAS" },
    409: { category: "accesorios", subcategory: "Comederos", icon: "🍽️", nombre: "COMEDEROS Y BEBEDEROS" }
};

// Función principal de verificación
function verificarDuplicados(categoriaId, limite, tipoProducto) {
    console.log('🔍 MODO VERIFICACIÓN - NO SE AGREGARÁN PRODUCTOS');
    console.log('=================================================\n');
    
    const categoriaNombre = categoriaId ? categoriasMap[categoriaId]?.nombre || `ID ${categoriaId}` : 'Todas';
    console.log(`📂 Categoría: ${categoriaId || 'null'} (${categoriaNombre})`);
    console.log(`📊 Límite: ${limite}`);
    console.log(`🏷️  Tipo: ${tipoProducto}`);
    console.log('');

    // Cargar productos existentes
    let productosExistentes = [];
    if (fs.existsSync(PRODUCTS_JSON)) {
        productosExistentes = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
    }
    console.log(`📦 Productos actuales en la tienda: ${productosExistentes.length}\n`);

    // Construir query
    let whereClause = '1=1';
    if (categoriaId) {
        whereClause += ` AND p.categoria_id = ${categoriaId}`;
    }
    if (tipoProducto === 'simple' || tipoProducto === 'simples') {
        whereClause += ' AND p.tiene_variantes = 0';
    } else if (tipoProducto === 'variantes') {
        whereClause += ' AND p.tiene_variantes = 1';
    }

    // Consultar más productos para compensar duplicados
    // Multiplicamos el límite por 3 para tener margen
    const limiteConsulta = limite * 3;

    const query = `
        SELECT 
            p.id || '|' ||
            p.nombre || '|' ||
            COALESCE(p.sku, '') || '|' ||
            p.precio_venta || '|' ||
            p.stock || '|' ||
            COALESCE(c.nombre, 'Sin categoría') || '|' ||
            p.tiene_variantes
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE ${whereClause}
        ORDER BY p.nombre
        LIMIT ${limiteConsulta}
    `;

    const resultado = ejecutarQuery(query);
    if (!resultado) {
        console.log('❌ No se pudieron obtener productos de la base de datos');
        return;
    }

    const lineas = resultado.split('\n').filter(l => l.trim());

    console.log(`🔍 Productos consultados en SQLite: ${lineas.length}`);
    console.log(`🎯 Límite de productos NUEVOS a agregar: ${limite}\n`);
    console.log('═══════════════════════════════════════════════════════════\n');

    const duplicados = [];
    const nuevos = [];

    lineas.forEach((linea, index) => {
        const [id, nombre, sku, precio, stock, categoria, tieneVariantes] = linea.split('|');
        const productoId = `prod_${id}`;
        const yaExistePorId = productosExistentes.some(p => p.id === productoId);
        const yaExistePorSku = sku && productosExistentes.some(p => p.sku === sku);

        console.log(`${index + 1}. ${nombre}`);
        console.log(`   ID SQLite: ${id} → ID Web: ${productoId}`);
        console.log(`   SKU: ${sku || 'Sin SKU'}`);
        console.log(`   Precio: $${parseFloat(precio).toLocaleString()}`);
        console.log(`   Stock: ${stock} unidades`);
        console.log(`   Categoría: ${categoria}`);
        console.log(`   Tipo: ${tieneVariantes === '1' ? 'Con variantes' : 'Simple'}`);

        if (yaExistePorId) {
            console.log(`   ❌ DUPLICADO - ID ya existe`);
            duplicados.push({ id: productoId, nombre, sku, razon: 'ID ya existe' });
        } else if (yaExistePorSku) {
            console.log(`   ❌ DUPLICADO - SKU ya existe`);
            duplicados.push({ id: productoId, nombre, sku, razon: 'SKU ya existe' });
        } else {
            console.log(`   ✅ NUEVO - Se puede agregar`);
            nuevos.push({ id: productoId, nombre, sku, precio: parseFloat(precio), stock: parseInt(stock) });
        }
        console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📊 RESUMEN DEL ANÁLISIS:');
    console.log('========================\n');
    console.log(`✅ ${nuevos.length} productos NUEVOS para agregar`);
    console.log(`🚫 ${duplicados.length} productos DUPLICADOS (se omitirán)\n`);

    if (duplicados.length > 0) {
        console.log('🚫 PRODUCTOS DUPLICADOS:');
        console.log('────────────────────────\n');
        duplicados.forEach((p, i) => {
            console.log(`${i + 1}. ${p.nombre}`);
            console.log(`   ID: ${p.id}`);
            console.log(`   SKU: ${p.sku || 'Sin SKU'}`);
            console.log(`   Razón: ${p.razon}`);
            console.log('');
        });
    }

    if (nuevos.length > 0) {
        console.log('✨ PRODUCTOS NUEVOS:');
        console.log('────────────────────\n');
        nuevos.forEach((p, i) => {
            console.log(`${i + 1}. ${p.nombre}`);
            console.log(`   ID: ${p.id}`);
            console.log(`   SKU: ${p.sku || 'Sin SKU'}`);
            console.log(`   Precio: $${p.precio.toLocaleString()}`);
            console.log(`   Stock: ${p.stock} unidades`);
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('💡 SIGUIENTE PASO:');
        console.log('==================\n');
        console.log('Para agregar estos productos a la tienda, ejecuta:\n');
        const cmd = `   node convertir-productos-sqlite.js ${categoriaId || 'null'} ${limite} ${tipoProducto}`;
        console.log(cmd + '\n');
        console.log('⚠️  Esto agregará los productos NUEVOS y omitirá los duplicados.\n');
    } else {
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('⚠️  NO HAY PRODUCTOS NUEVOS PARA AGREGAR');
        console.log('   Todos los productos ya existen en la tienda.\n');
    }

    console.log('✅ Verificación completada');
}

// Función principal de conversión
function convertirProductos(categoriaId, limite, tipoProducto) {
    console.log('🔄 MODO CONVERSIÓN - SE AGREGARÁN PRODUCTOS');
    console.log('============================================\n');
    
    const categoriaNombre = categoriaId ? categoriasMap[categoriaId]?.nombre || `ID ${categoriaId}` : 'Todas';
    console.log(`📂 Categoría: ${categoriaId || 'null'} (${categoriaNombre})`);
    console.log(`📊 Límite: ${limite}`);
    console.log(`🏷️  Tipo: ${tipoProducto}`);
    console.log('');

    // Cargar backup JSON
    let backupData = null;
    if (fs.existsSync(BACKUP_PATH)) {
        backupData = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
        console.log(`📸 Backup JSON cargado: ${backupData.imagenes?.length || 0} imágenes disponibles\n`);
    } else {
        console.log('⚠️  Backup JSON no encontrado - No se extraerán imágenes\n');
    }

    // Cargar productos existentes
    let productosExistentes = [];
    if (fs.existsSync(PRODUCTS_JSON)) {
        productosExistentes = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
    }
    console.log(`📦 Productos actuales en la tienda: ${productosExistentes.length}\n`);

    // Cargar descuentos activos
    const queryDescuentos = `
        SELECT 
            id || '|' ||
            nombre || '|' ||
            tipo || '|' ||
            valor || '|' ||
            COALESCE(categoria_id, '') || '|' ||
            COALESCE(producto_ids, '')
        FROM descuentos 
        WHERE activo = 1 
        AND (fecha_fin IS NULL OR fecha_fin >= date('now'))
    `;
    
    const resultadoDescuentos = ejecutarQuery(queryDescuentos);
    const descuentos = [];
    if (resultadoDescuentos) {
        resultadoDescuentos.split('\n').filter(l => l.trim()).forEach(linea => {
            const [id, nombre, tipo, valor, categoria_id, producto_ids] = linea.split('|');
            descuentos.push({
                id: parseInt(id),
                nombre,
                tipo,
                valor: parseFloat(valor),
                categoria_id: categoria_id && categoria_id.trim() ? parseInt(categoria_id) : null,
                producto_ids: producto_ids && producto_ids.trim() ? producto_ids : null
            });
        });
    }
    console.log(`💰 Descuentos activos encontrados: ${descuentos.length}\n`);

    // Construir query de productos
    let whereClause = '1=1';
    if (categoriaId) {
        whereClause += ` AND p.categoria_id = ${categoriaId}`;
    }
    if (tipoProducto === 'simple' || tipoProducto === 'simples') {
        whereClause += ' AND p.tiene_variantes = 0';
    } else if (tipoProducto === 'variantes') {
        whereClause += ' AND p.tiene_variantes = 1';
    }

    // Consultar más productos para compensar duplicados
    // Multiplicamos el límite por 3 para tener margen
    const limiteConsulta = limite * 3;

    const query = `
        SELECT 
            p.id || '|' ||
            REPLACE(p.nombre, '|', '{{PIPE}}') || '|' ||
            REPLACE(COALESCE(p.descripcion, p.nombre), '|', '{{PIPE}}') || '|' ||
            COALESCE(p.sku, '') || '|' ||
            COALESCE(p.categoria_id, '') || '|' ||
            p.precio_venta || '|' ||
            p.stock || '|' ||
            REPLACE(COALESCE(p.marca, ''), '|', '{{PIPE}}') || '|' ||
            p.tiene_variantes
        FROM productos p
        WHERE ${whereClause}
        ORDER BY p.nombre
        LIMIT ${limiteConsulta}
    `;

    const resultado = ejecutarQuery(query);
    if (!resultado) {
        console.log('❌ No se pudieron obtener productos de la base de datos');
        return;
    }

    const lineas = resultado.split('\n').filter(l => l.trim());
    console.log(`🔍 Productos consultados en SQLite: ${lineas.length}\n`);
    console.log('═══════════════════════════════════════════════════════════\n');

    const productosNuevos = [];
    const productosOmitidos = [];
    let productosAgregados = 0;

    for (const linea of lineas) {
        // Si ya alcanzamos el límite de productos nuevos, detenemos
        if (productosAgregados >= limite) {
            break;
        }

        const partes = linea.split('|');
        
        // Validar que tenemos todos los campos necesarios
        if (partes.length < 9) {
            console.log(`⚠️  Producto con datos incompletos (${partes.length} campos): ${partes[1] || 'sin nombre'}`);
            continue;
        }
        
        const id = partes[0];
        const nombre = partes[1].replace(/\{\{PIPE\}\}/g, '|');
        const descripcion = partes[2].replace(/\{\{PIPE\}\}/g, '|');
        const sku = partes[3];
        const categoria_id = partes[4];
        const precio_venta = partes[5];
        const stock = partes[6];
        const marca = partes[7].replace(/\{\{PIPE\}\}/g, '|');
        const tiene_variantes = partes[8];
        
        const producto = {
            id: parseInt(id),
            nombre,
            descripcion,
            sku,
            categoria_id: categoria_id ? parseInt(categoria_id) : null,
            precio_venta: parseFloat(precio_venta),
            stock: parseInt(stock),
            marca,
            tiene_variantes: parseInt(tiene_variantes)
        };

        const productoId = `prod_${producto.id}`;
        const yaExistePorId = productosExistentes.some(p => p.id === productoId);
        const yaExistePorSku = producto.sku && productosExistentes.some(p => p.sku === producto.sku);

        if (yaExistePorId || yaExistePorSku) {
            productosOmitidos.push({
                id: productoId,
                nombre: producto.nombre,
                sku: producto.sku,
                razon: yaExistePorId ? 'ID ya existe' : 'SKU ya existe'
            });
        } else {
            // Convertir producto
            const productoConvertido = convertirProducto(producto, backupData, descuentos);
            productosNuevos.push(productoConvertido);
            console.log(`✅ ${producto.nombre}`);
            productosAgregados++;
        }
    }

    // Agregar productos nuevos
    const todosLosProductos = [...productosExistentes, ...productosNuevos];

    // Guardar archivo JSON
    fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(todosLosProductos, null, 2));

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('📊 RESUMEN DE CONVERSIÓN:');
    console.log('=========================\n');
    console.log(`✅ ${productosNuevos.length} productos agregados`);
    console.log(`⚠️  ${productosOmitidos.length} productos omitidos (duplicados)`);
    console.log(`📦 Total productos en tienda: ${todosLosProductos.length}\n`);

    if (productosOmitidos.length > 0) {
        console.log('🚫 PRODUCTOS OMITIDOS:');
        console.log('──────────────────────\n');
        productosOmitidos.forEach(p => {
            console.log(`   - ${p.nombre} (${p.razon})`);
        });
        console.log('');
    }

    console.log('✅ Conversión completada exitosamente');
}

// Función para convertir un producto individual
function convertirProducto(producto, backupData, descuentos) {
    // Mapear categoría
    const categoriaInfo = categoriasMap[producto.categoria_id] || 
        { category: "otros", subcategory: "general" };

    // Buscar y aplicar descuento
    const descuentoInfo = aplicarDescuento(producto, descuentos);

    // Buscar imagen en backup
    if (backupData && backupData.imagenes) {
        const imagen = backupData.imagenes.find(img => 
            img.tipo === 'producto' && img.id === producto.id
        );
        if (imagen) {
            guardarImagen(producto.id, imagen);
        }
    }

    // Generar datos adicionales
    const tags = generarTags(producto.nombre, producto.descripcion, producto.marca, producto.categoria_id);
    const specifications = generarEspecificaciones(producto);
    const features = generarFeatures(producto);

    return {
        id: `prod_${producto.id}`,
        name: producto.nombre,
        category: categoriaInfo.category,
        subcategory: categoriaInfo.subcategory,
        price: descuentoInfo.price,
        originalPrice: descuentoInfo.originalPrice,
        discount: descuentoInfo.discount,
        stock: producto.stock,
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
        reviews: Math.floor(Math.random() * 50) + 5,
        featured: false,
        topDiscount: descuentoInfo.discount >= 20,
        hasVideo: false,
        tags,
        description: producto.descripcion || producto.nombre,
        longDescription: producto.descripcion || producto.nombre,
        images: {
            cover: `assets/images/products/prod_${producto.id}/cover.jpg`,
            thumb: `assets/images/products/prod_${producto.id}/thumb.jpg`,
            gallery: [`assets/images/products/prod_${producto.id}/1.jpg`]
        },
        specs: specifications,
        shipping: {
            free: producto.precio_venta >= 15000,
            days: Math.floor(Math.random() * 3) + 2
        },
        badge: `${categoriaInfo.icon || '🐾'} ${categoriaInfo.subcategory}`,
        brand: producto.marca || "Sin marca",
        sku: producto.sku,
        features
    };
}

// Función para aplicar descuento
function aplicarDescuento(producto, descuentos) {
    const descuentosAplicables = [];

    // 1. Buscar descuentos por producto específico
    descuentos.forEach(d => {
        if (d.producto_ids && d.tipo === 'percent') {
            try {
                const productIds = JSON.parse(d.producto_ids);
                const encontrado = productIds.some(id => 
                    String(id) === String(producto.id) || Number(id) === Number(producto.id)
                );
                if (encontrado) {
                    descuentosAplicables.push({ ...d, tipo_aplicacion: 'especifico' });
                }
            } catch (e) {
                // Ignorar errores de parsing
            }
        }
    });

    // 2. Buscar descuentos por categoría
    descuentos.forEach(d => {
        if (d.categoria_id === producto.categoria_id && !d.producto_ids && d.tipo === 'percent') {
            descuentosAplicables.push({ ...d, tipo_aplicacion: 'categoria' });
        }
    });

    // 3. Buscar descuentos globales
    descuentos.forEach(d => {
        if (!d.categoria_id && !d.producto_ids && d.tipo === 'percent') {
            descuentosAplicables.push({ ...d, tipo_aplicacion: 'global' });
        }
    });

    // Si no hay descuentos aplicables
    if (descuentosAplicables.length === 0) {
        return {
            price: producto.precio_venta,
            originalPrice: null,
            discount: null
        };
    }

    // Tomar el descuento MAYOR
    const descuentoMayor = descuentosAplicables.reduce((max, d) => 
        d.valor > max.valor ? d : max
    );

    // Calcular precios
    const precioOriginal = producto.precio_venta;
    const descuentoPorcentaje = descuentoMayor.valor;
    const descuentoMonto = Math.round(precioOriginal * (descuentoPorcentaje / 100));
    const precioConDescuento = precioOriginal - descuentoMonto;

    return {
        price: precioConDescuento,
        originalPrice: precioOriginal,
        discount: Math.round(descuentoPorcentaje)
    };
}

// Función para guardar imagen
function guardarImagen(productoId, imagen) {
    try {
        const productDir = path.join(__dirname, 'assets', 'images', 'products', `prod_${productoId}`);
        
        if (!fs.existsSync(productDir)) {
            fs.mkdirSync(productDir, { recursive: true });
        }

        // La propiedad es 'data' no 'data_base64'
        const base64Data = imagen.data.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        fs.writeFileSync(path.join(productDir, '1.jpg'), buffer);
        fs.writeFileSync(path.join(productDir, 'cover.jpg'), buffer);
        fs.writeFileSync(path.join(productDir, 'thumb.jpg'), buffer);

        console.log(`   📸 Imagen guardada`);
    } catch (error) {
        console.log(`   ⚠️  Error guardando imagen: ${error.message}`);
    }
}

// Función para generar tags
function generarTags(nombre, descripcion, marca, categoriaId) {
    const tags = [];
    const texto = (nombre + ' ' + (descripcion || '')).toLowerCase();

    // Tags de marca
    if (marca) tags.push(marca.toLowerCase());

    // Tags del nombre
    const palabras = nombre.toLowerCase().split(' ');
    palabras.forEach(palabra => {
        if (palabra.length > 3 && !['para', 'con', 'sin'].includes(palabra)) {
            tags.push(palabra);
        }
    });

    // Tags por categoría
    const tagsPorCategoria = {
        250: ['shampoo', 'higiene', 'limpieza', 'mascotas'],
        261: ['colchoneta', 'descanso', 'cama', 'moises'],
        262: ['casita', 'hogar', 'refugio', 'bolso'],
        263: ['rascador', 'uñas', 'gatos', 'sisal'],
        264: ['juguete', 'entretenimiento', 'diversión', 'interactivo'],
        275: ['ropa', 'verano', 'fresco', 'ligero'],
        316: ['ropa', 'invierno', 'abrigo', 'calor'],
        317: ['collar', 'correa', 'paseo', 'pechera'],
        409: ['comedero', 'bebedero', 'alimentación', 'agua']
    };

    if (tagsPorCategoria[categoriaId]) {
        tags.push(...tagsPorCategoria[categoriaId]);
    }

    return [...new Set(tags)].slice(0, 10);
}

// Función para generar especificaciones
function generarEspecificaciones(producto) {
    const specs = {};

    if (producto.sku) specs.SKU = producto.sku;
    if (producto.marca) specs.Marca = producto.marca;

    // Extraer medidas del nombre
    const medidaMatch = producto.nombre.match(/(\d+)\s*(cm|cm3|ml|gr|kg|mm)/i);
    if (medidaMatch) {
        specs.Medida = medidaMatch[0];
    }

    return specs;
}

// Función para generar features
function generarFeatures(producto) {
    const features = [];

    const featuresPorCategoria = {
        250: ['Limpia profundamente', 'Fórmula suave', 'Aroma agradable', 'Para todo tipo de pelaje'],
        261: ['Cómodo y suave', 'Fácil de lavar', 'Antideslizante', 'Material resistente'],
        262: ['Espacio privado', 'Fácil montaje', 'Material resistente', 'Diseño atractivo'],
        263: ['Protege muebles', 'Mantiene uñas sanas', 'Base estable', 'Material duradero'],
        264: ['Estimula el juego', 'Material seguro', 'Resistente a mordidas', 'Entretenimiento garantizado'],
        275: ['Tela transpirable', 'Diseño fresco', 'Fácil de poner', 'Cómodo para el verano'],
        316: ['Mantiene el calor', 'Material suave', 'Resistente al agua', 'Perfecto para el frío'],
        317: ['Ajuste cómodo', 'Material resistente', 'Fácil de usar', 'Seguro y confiable'],
        409: ['Fácil de limpiar', 'Antideslizante', 'Capacidad adecuada', 'Material duradero']
    };

    if (featuresPorCategoria[producto.categoria_id]) {
        features.push(...featuresPorCategoria[producto.categoria_id]);
    }

    return features;
}

// Ejecutar script
if (require.main === module) {
    const args = process.argv.slice(2);

    // Verificar si es modo check
    const isCheckMode = args[0] === '--check';
    const startIndex = isCheckMode ? 1 : 0;

    const categoriaId = args[startIndex] && args[startIndex] !== 'null' 
        ? parseInt(args[startIndex]) 
        : null;
    const limite = args[startIndex + 1] ? parseInt(args[startIndex + 1]) : 10;
    const tipoProducto = (args[startIndex + 2] || 'todos').toLowerCase();

    // Validar tipo de producto
    const tiposValidos = ['simple', 'simples', 'variantes', 'todos'];
    if (!tiposValidos.includes(tipoProducto)) {
        console.error(`❌ Tipo de producto inválido: ${tipoProducto}`);
        console.error(`   Tipos válidos: ${tiposValidos.join(', ')}`);
        process.exit(1);
    }

    if (isCheckMode) {
        verificarDuplicados(categoriaId, limite, tipoProducto);
    } else {
        convertirProductos(categoriaId, limite, tipoProducto);
    }
}

module.exports = { convertirProductos, verificarDuplicados };
