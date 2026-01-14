// Test CHECK - Categoría 263 (RASCADORES) - 5 productos simples
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🔍 MODO VERIFICACIÓN - CHECK');
console.log('============================\n');
console.log('📂 Categoría: 263 (🐾 RASCADORES)');
console.log('📊 Límite: 5 productos');
console.log('🏷️  Tipo: simple (sin variantes)');
console.log('⚠️  NO se agregarán productos\n');

const dbPath = path.join(__dirname, '..', 'database', 'inventario_restored.db');
const productsJsonPath = path.join(__dirname, 'data', 'products.json');

// Cargar productos existentes
let productosExistentes = [];
if (fs.existsSync(productsJsonPath)) {
    productosExistentes = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
}

console.log(`📦 Productos actuales en la tienda: ${productosExistentes.length}\n`);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('❌ Error al abrir la base de datos:', err.message);
        process.exit(1);
    }
});

// Consultar productos de la categoría 263, solo simples
const query = `
    SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.sku,
        p.categoria_id,
        p.precio_venta,
        p.stock,
        p.foto,
        p.marca,
        p.tiene_variantes,
        c.nombre as categoria_nombre
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.categoria_id = 263
    AND p.tiene_variantes = 0
    ORDER BY p.nombre
    LIMIT 5
`;

db.all(query, [], (err, productos) => {
    if (err) {
        console.error('❌ Error consultando productos:', err.message);
        db.close();
        return;
    }

    console.log(`🔍 Productos encontrados en SQLite: ${productos.length}\n`);
    console.log('═══════════════════════════════════════════════════════════\n');

    const duplicados = [];
    const nuevos = [];

    productos.forEach((producto, index) => {
        const productoId = `prod_${producto.id}`;
        const yaExistePorId = productosExistentes.some(p => p.id === productoId);
        const yaExistePorSku = producto.sku && productosExistentes.some(p => p.sku === producto.sku);

        console.log(`${index + 1}. ${producto.nombre}`);
        console.log(`   ID SQLite: ${producto.id} → ID Web: ${productoId}`);
        console.log(`   SKU: ${producto.sku || 'Sin SKU'}`);
        console.log(`   Precio: $${producto.precio_venta.toLocaleString()}`);
        console.log(`   Stock: ${producto.stock} unidades`);
        console.log(`   Categoría: ${producto.categoria_nombre}`);
        console.log(`   Tiene variantes: ${producto.tiene_variantes === 1 ? 'Sí' : 'No'}`);

        if (yaExistePorId) {
            console.log(`   ❌ DUPLICADO - ID ya existe en la tienda`);
            duplicados.push({
                id: productoId,
                nombre: producto.nombre,
                sku: producto.sku,
                razon: 'ID ya existe'
            });
        } else if (yaExistePorSku) {
            console.log(`   ❌ DUPLICADO - SKU "${producto.sku}" ya existe en la tienda`);
            duplicados.push({
                id: productoId,
                nombre: producto.nombre,
                sku: producto.sku,
                razon: 'SKU ya existe'
            });
        } else {
            console.log(`   ✅ NUEVO - Se puede agregar`);
            nuevos.push({
                id: productoId,
                nombre: producto.nombre,
                sku: producto.sku,
                precio: producto.precio_venta,
                stock: producto.stock
            });
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
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    if (nuevos.length > 0) {
        console.log('💡 SIGUIENTE PASO:');
        console.log('==================\n');
        console.log('Para agregar estos productos a la tienda, ejecuta:\n');
        console.log('   node convertir-productos-sqlite.js 263 5 simple\n');
        console.log('⚠️  Esto agregará los productos NUEVOS y omitirá los duplicados.\n');
    } else {
        console.log('⚠️  NO HAY PRODUCTOS NUEVOS PARA AGREGAR');
        console.log('   Todos los productos ya existen en la tienda.\n');
    }

    console.log('✅ Verificación completada');

    db.close();
});
