const fs = require('fs');
const path = require('path');

console.log('🔍 BÚSQUEDA DETALLADA DE IMÁGENES Y DESCUENTOS\n');

const backupPath = path.join(__dirname, '..', 'backupInventario', 'backup_owner_2026-01-13T16-26-46-405.json');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

const productosNuevos = [223, 230, 231, 232];

console.log('═══════════════════════════════════════════════════════════');
console.log('PARTE 1: BÚSQUEDA DE IMÁGENES');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(`Total imágenes en backup: ${backup.imagenes.length}\n`);

// Buscar por diferentes criterios
productosNuevos.forEach(id => {
    console.log(`\n--- Producto ID ${id} ---`);
    
    // Búsqueda 1: tipo='producto' y objeto_id
    const img1 = backup.imagenes.find(img => 
        img.tipo === 'producto' && img.objeto_id === id
    );
    console.log(`Búsqueda tipo='producto' y objeto_id=${id}: ${img1 ? '✅ ENCONTRADA' : '❌ No encontrada'}`);
    
    // Búsqueda 2: solo objeto_id
    const img2 = backup.imagenes.find(img => img.objeto_id === id);
    console.log(`Búsqueda solo objeto_id=${id}: ${img2 ? '✅ ENCONTRADA' : '❌ No encontrada'}`);
    if (img2) {
        console.log(`   Tipo: ${img2.tipo}`);
        console.log(`   Nombre: ${img2.nombre_archivo}`);
    }
    
    // Búsqueda 3: en nombre_archivo
    const img3 = backup.imagenes.find(img => 
        img.nombre_archivo && img.nombre_archivo.includes(`producto_${id}_`)
    );
    console.log(`Búsqueda en nombre_archivo 'producto_${id}_': ${img3 ? '✅ ENCONTRADA' : '❌ No encontrada'}`);
    if (img3) {
        console.log(`   Tipo: ${img3.tipo}`);
        console.log(`   objeto_id: ${img3.objeto_id}`);
        console.log(`   Nombre: ${img3.nombre_archivo}`);
    }
    
    // Búsqueda 4: cualquier mención del ID
    const img4 = backup.imagenes.find(img => 
        JSON.stringify(img).includes(`${id}`)
    );
    console.log(`Búsqueda cualquier mención de '${id}': ${img4 ? '✅ ENCONTRADA' : '❌ No encontrada'}`);
});

// Mostrar algunos ejemplos de imágenes de productos
console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('EJEMPLOS DE IMÁGENES DE PRODUCTOS EN EL BACKUP:');
console.log('═══════════════════════════════════════════════════════════\n');

const imagenesProducto = backup.imagenes.filter(img => img.tipo === 'producto').slice(0, 10);
imagenesProducto.forEach(img => {
    console.log(`ID: ${img.objeto_id}, Nombre: ${img.nombre_archivo}`);
});

console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('PARTE 2: VERIFICACIÓN DE DESCUENTOS');
console.log('═══════════════════════════════════════════════════════════\n');

// Consultar descuentos desde SQLite
const { execSync } = require('child_process');
const dbPath = path.join(__dirname, '..', 'database', 'inventario_restored.db');

const queryDescuentos = `
    SELECT 
        id || '|' ||
        nombre || '|' ||
        tipo || '|' ||
        valor || '|' ||
        COALESCE(categoria_id, '') || '|' ||
        COALESCE(producto_ids, '') || '|' ||
        activo || '|' ||
        COALESCE(fecha_fin, '')
    FROM descuentos 
    WHERE activo = 1
`;

try {
    const cmd = `sqlite3 "${dbPath}" "${queryDescuentos.replace(/\n/g, ' ').replace(/\s+/g, ' ')}"`;
    const resultado = execSync(cmd, { encoding: 'utf8' });
    const lineas = resultado.trim().split('\n').filter(l => l.trim());
    
    console.log(`Total descuentos activos: ${lineas.length}\n`);
    
    lineas.forEach((linea, i) => {
        const [id, nombre, tipo, valor, categoria_id, producto_ids, activo, fecha_fin] = linea.split('|');
        console.log(`${i + 1}. ${nombre}`);
        console.log(`   ID: ${id}`);
        console.log(`   Tipo: ${tipo}`);
        console.log(`   Valor: ${valor}%`);
        console.log(`   Categoría: ${categoria_id || 'Global'}`);
        console.log(`   Productos específicos: ${producto_ids || 'No'}`);
        console.log(`   Activo: ${activo}`);
        console.log(`   Fecha fin: ${fecha_fin || 'Sin límite'}`);
        console.log('');
    });
    
    // Buscar descuento para categoría 263
    console.log('═══════════════════════════════════════════════════════════');
    console.log('DESCUENTOS PARA CATEGORÍA 263 (RASCADORES):');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const descuentoCategoria = lineas.find(linea => {
        const [id, nombre, tipo, valor, categoria_id] = linea.split('|');
        return categoria_id === '263';
    });
    
    if (descuentoCategoria) {
        const [id, nombre, tipo, valor, categoria_id] = descuentoCategoria.split('|');
        console.log(`✅ DESCUENTO ENCONTRADO:`);
        console.log(`   Nombre: ${nombre}`);
        console.log(`   Valor: ${valor}%`);
        console.log(`   Tipo: ${tipo}`);
    } else {
        console.log('❌ No hay descuento específico para categoría 263');
    }
    
    // Buscar descuentos globales
    const descuentoGlobal = lineas.find(linea => {
        const [id, nombre, tipo, valor, categoria_id, producto_ids] = linea.split('|');
        return !categoria_id && !producto_ids;
    });
    
    if (descuentoGlobal) {
        const [id, nombre, tipo, valor] = descuentoGlobal.split('|');
        console.log(`\n✅ DESCUENTO GLOBAL ENCONTRADO:`);
        console.log(`   Nombre: ${nombre}`);
        console.log(`   Valor: ${valor}%`);
    }
    
} catch (error) {
    console.error('❌ Error consultando descuentos:', error.message);
}

console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('PARTE 3: VERIFICAR PRODUCTOS AGREGADOS');
console.log('═══════════════════════════════════════════════════════════\n');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log(`Total productos en la tienda: ${products.length}\n`);

productosNuevos.forEach(id => {
    const producto = products.find(p => p.id === `prod_${id}`);
    if (producto) {
        console.log(`✅ prod_${id}: ${producto.name}`);
        console.log(`   Precio: $${producto.price.toLocaleString()}`);
        console.log(`   Precio original: ${producto.originalPrice ? '$' + producto.originalPrice.toLocaleString() : 'null'}`);
        console.log(`   Descuento: ${producto.discount ? producto.discount + '%' : 'null'}`);
        console.log(`   Categoría: ${producto.category}/${producto.subcategory}`);
        console.log('');
    } else {
        console.log(`❌ prod_${id}: NO encontrado en products.json\n`);
    }
});
