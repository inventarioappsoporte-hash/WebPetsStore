/**
 * Script para eliminar productos de la tienda por nombre
 * 
 * USO:
 *   node eliminar-producto-por-nombre.js "Nombre del Producto"
 *   node eliminar-producto-por-nombre.js "Producto 1" "Producto 2" "Producto 3"
 * 
 * EJEMPLO:
 *   node eliminar-producto-por-nombre.js "Pipetas pulguicida Gato"
 *   node eliminar-producto-por-nombre.js "BEBEDERO CON FUENTE ELECTRICO" "COMEDERO DOBLE DE AC. INOX., 0,9 L"
 * 
 * El script:
 *   1. Busca el producto en products.json por nombre (búsqueda exacta o parcial)
 *   2. Elimina el producto del JSON
 *   3. Elimina la carpeta de imágenes asociada (assets/images/products/prod_XXX)
 */

const fs = require('fs');
const path = require('path');

// Rutas
const PRODUCTS_JSON_PATH = path.join(__dirname, 'data', 'products.json');
const IMAGES_BASE_PATH = path.join(__dirname, 'assets', 'images', 'products');

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(color, symbol, message) {
    console.log(`${colors[color]}${symbol}${colors.reset} ${message}`);
}

// Función para eliminar carpeta recursivamente
function eliminarCarpetaRecursiva(carpetaPath) {
    if (fs.existsSync(carpetaPath)) {
        const archivos = fs.readdirSync(carpetaPath);
        for (const archivo of archivos) {
            const archivoPath = path.join(carpetaPath, archivo);
            if (fs.statSync(archivoPath).isDirectory()) {
                eliminarCarpetaRecursiva(archivoPath);
            } else {
                fs.unlinkSync(archivoPath);
            }
        }
        fs.rmdirSync(carpetaPath);
        return true;
    }
    return false;
}

// Función para buscar productos por nombre
function buscarProductos(productos, nombreBuscado) {
    const nombreNormalizado = nombreBuscado.toLowerCase().trim();
    
    // Primero buscar coincidencia exacta
    const exacto = productos.filter(p => 
        p.name.toLowerCase().trim() === nombreNormalizado
    );
    
    if (exacto.length > 0) return exacto;
    
    // Si no hay exacta, buscar parcial
    return productos.filter(p => 
        p.name.toLowerCase().includes(nombreNormalizado) ||
        nombreNormalizado.includes(p.name.toLowerCase())
    );
}


// Función principal para eliminar un producto
function eliminarProducto(productos, nombreProducto) {
    const resultado = {
        nombre: nombreProducto,
        encontrado: false,
        eliminadoJson: false,
        eliminadoImagenes: false,
        productosEliminados: [],
        imagenesEliminadas: []
    };
    
    const productosEncontrados = buscarProductos(productos, nombreProducto);
    
    if (productosEncontrados.length === 0) {
        return resultado;
    }
    
    resultado.encontrado = true;
    
    for (const producto of productosEncontrados) {
        // Obtener el ID del producto para la carpeta de imágenes
        const productId = producto.id;
        const carpetaImagenes = path.join(IMAGES_BASE_PATH, productId);
        
        // Eliminar carpeta de imágenes
        if (eliminarCarpetaRecursiva(carpetaImagenes)) {
            resultado.eliminadoImagenes = true;
            resultado.imagenesEliminadas.push(carpetaImagenes);
        }
        
        // Marcar producto para eliminar del JSON
        resultado.productosEliminados.push({
            id: producto.id,
            name: producto.name
        });
    }
    
    resultado.eliminadoJson = resultado.productosEliminados.length > 0;
    
    return resultado;
}

// Función para mostrar ayuda
function mostrarAyuda() {
    console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════════╗
║     SCRIPT PARA ELIMINAR PRODUCTOS DE LA TIENDA               ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}

${colors.yellow}USO:${colors.reset}
  node eliminar-producto-por-nombre.js "Nombre del Producto"
  node eliminar-producto-por-nombre.js "Producto 1" "Producto 2" ...

${colors.yellow}EJEMPLOS:${colors.reset}
  node eliminar-producto-por-nombre.js "Pipetas pulguicida Gato"
  node eliminar-producto-por-nombre.js "BEBEDERO CON FUENTE ELECTRICO"
  node eliminar-producto-por-nombre.js "Producto 1" "Producto 2" "Producto 3"

${colors.yellow}OPCIONES:${colors.reset}
  --list          Lista todos los productos disponibles
  --search "X"    Busca productos que contengan "X" en el nombre
  --help          Muestra esta ayuda

${colors.yellow}NOTAS:${colors.reset}
  - La búsqueda es case-insensitive (no distingue mayúsculas/minúsculas)
  - Primero busca coincidencia exacta, luego parcial
  - Elimina tanto el producto del JSON como su carpeta de imágenes
`);
}

// Función para listar productos
function listarProductos(productos) {
    console.log(`\n${colors.cyan}📋 LISTA DE PRODUCTOS (${productos.length} total):${colors.reset}\n`);
    productos.forEach((p, i) => {
        console.log(`  ${colors.blue}${i + 1}.${colors.reset} [${p.id}] ${p.name}`);
    });
    console.log('');
}

// Función para buscar y mostrar productos
function buscarYMostrar(productos, termino) {
    const encontrados = buscarProductos(productos, termino);
    if (encontrados.length === 0) {
        log('yellow', '⚠️', `No se encontraron productos con "${termino}"`);
    } else {
        console.log(`\n${colors.green}✅ Productos encontrados (${encontrados.length}):${colors.reset}\n`);
        encontrados.forEach((p, i) => {
            console.log(`  ${colors.blue}${i + 1}.${colors.reset} [${p.id}] ${p.name}`);
        });
        console.log('');
    }
}


// PROCESO PRINCIPAL
async function main() {
    const args = process.argv.slice(2);
    
    // Verificar argumentos
    if (args.length === 0) {
        mostrarAyuda();
        process.exit(0);
    }
    
    // Cargar productos
    let productos;
    try {
        const contenido = fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8');
        productos = JSON.parse(contenido);
        log('green', '✅', `Cargados ${productos.length} productos desde products.json`);
    } catch (error) {
        log('red', '❌', `Error al cargar products.json: ${error.message}`);
        process.exit(1);
    }
    
    // Manejar opciones especiales
    if (args[0] === '--help' || args[0] === '-h') {
        mostrarAyuda();
        process.exit(0);
    }
    
    if (args[0] === '--list' || args[0] === '-l') {
        listarProductos(productos);
        process.exit(0);
    }
    
    if (args[0] === '--search' || args[0] === '-s') {
        if (args[1]) {
            buscarYMostrar(productos, args[1]);
        } else {
            log('red', '❌', 'Debes proporcionar un término de búsqueda');
        }
        process.exit(0);
    }
    
    // Procesar eliminación de productos
    console.log(`\n${colors.cyan}🗑️  ELIMINANDO PRODUCTOS...${colors.reset}\n`);
    
    const nombresAEliminar = args;
    const resultados = [];
    const idsAEliminar = new Set();
    
    for (const nombre of nombresAEliminar) {
        const resultado = eliminarProducto(productos, nombre);
        resultados.push(resultado);
        
        if (resultado.encontrado) {
            resultado.productosEliminados.forEach(p => idsAEliminar.add(p.id));
        }
    }
    
    // Filtrar productos (eliminar los marcados)
    const productosFinales = productos.filter(p => !idsAEliminar.has(p.id));
    const productosEliminados = productos.length - productosFinales.length;
    
    // Guardar JSON actualizado
    if (productosEliminados > 0) {
        try {
            fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(productosFinales, null, 2), 'utf8');
            log('green', '✅', `products.json actualizado (${productosEliminados} productos eliminados)`);
        } catch (error) {
            log('red', '❌', `Error al guardar products.json: ${error.message}`);
        }
    }
    
    // Mostrar resumen
    console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}                         RESUMEN                               ${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
    
    let totalEliminados = 0;
    let totalImagenes = 0;
    
    for (const resultado of resultados) {
        if (resultado.encontrado) {
            log('green', '✅', `"${resultado.nombre}"`);
            resultado.productosEliminados.forEach(p => {
                console.log(`      └─ [${p.id}] ${p.name}`);
                totalEliminados++;
            });
            if (resultado.imagenesEliminadas.length > 0) {
                resultado.imagenesEliminadas.forEach(img => {
                    console.log(`      └─ 🖼️  Imágenes eliminadas: ${path.basename(img)}`);
                    totalImagenes++;
                });
            }
        } else {
            log('yellow', '⚠️', `"${resultado.nombre}" - No encontrado`);
        }
    }
    
    console.log(`\n${colors.cyan}───────────────────────────────────────────────────────────────${colors.reset}`);
    console.log(`  📦 Productos eliminados del JSON: ${colors.green}${totalEliminados}${colors.reset}`);
    console.log(`  🖼️  Carpetas de imágenes eliminadas: ${colors.green}${totalImagenes}${colors.reset}`);
    console.log(`  📋 Productos restantes: ${colors.blue}${productosFinales.length}${colors.reset}`);
    console.log(`${colors.cyan}───────────────────────────────────────────────────────────────${colors.reset}\n`);
}

main().catch(error => {
    log('red', '❌', `Error: ${error.message}`);
    process.exit(1);
});
