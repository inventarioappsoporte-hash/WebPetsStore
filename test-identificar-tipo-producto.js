// Test para Identificar Tipo de Producto (Simple vs Variantes)
const sqlite3 = require('sqlite3').verbose();

console.log('🧪 TEST DE IDENTIFICACIÓN DE TIPO DE PRODUCTO');
console.log('==============================================\n');

const DB_PATH = '../database/inventario_restored.db';
const db = new sqlite3.Database(DB_PATH);

console.log('📊 PASO 1: Estadísticas de productos\n');

db.get(`
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN tiene_variantes = 0 THEN 1 ELSE 0 END) as simples,
        SUM(CASE WHEN tiene_variantes = 1 THEN 1 ELSE 0 END) as con_variantes
    FROM productos
`, [], (err, stats) => {
    if (err) {
        console.error('❌ Error:', err);
        db.close();
        return;
    }
    
    console.log('Estadísticas generales:');
    console.log(`   Total productos: ${stats.total}`);
    console.log(`   Productos simples (tiene_variantes=0): ${stats.simples}`);
    console.log(`   Productos con variantes (tiene_variantes=1): ${stats.con_variantes}`);
    console.log('');
    
    // Ahora buscar ejemplos de cada tipo
    console.log('🔍 PASO 2: Ejemplos de productos simples\n');
    
    db.all(`
        SELECT id, nombre, sku, tiene_variantes, precio
        FROM productos 
        WHERE tiene_variantes = 0
        LIMIT 5
    `, [], (err, simples) => {
        if (err) {
            console.error('❌ Error:', err);
            db.close();
            return;
        }
        
        console.log('Productos SIMPLES (tiene_variantes = 0):');
        simples.forEach((p, i) => {
            console.log(`${i + 1}. ID: ${p.id} | ${p.nombre}`);
            console.log(`   SKU: ${p.sku} | Precio: $${p.precio.toLocaleString()}`);
            console.log(`   tiene_variantes: ${p.tiene_variantes}`);
        });
        console.log('');
        
        // Buscar productos con variantes
        console.log('🔍 PASO 3: Ejemplos de productos con variantes\n');
        
        db.all(`
            SELECT id, nombre, sku, tiene_variantes, precio
            FROM productos 
            WHERE tiene_variantes = 1
            LIMIT 5
        `, [], (err, conVariantes) => {
            if (err) {
                console.error('❌ Error:', err);
                db.close();
                return;
            }
            
            if (conVariantes.length === 0) {
                console.log('⚪ No hay productos con variantes en la base');
            } else {
                console.log('Productos CON VARIANTES (tiene_variantes = 1):');
                conVariantes.forEach((p, i) => {
                    console.log(`${i + 1}. ID: ${p.id} | ${p.nombre}`);
                    console.log(`   SKU: ${p.sku} | Precio: $${p.precio.toLocaleString()}`);
                    console.log(`   tiene_variantes: ${p.tiene_variantes}`);
                });
                console.log('');
                
                // Ver las variantes del primer producto
                if (conVariantes.length > 0) {
                    const productoId = conVariantes[0].id;
                    console.log(`🔍 PASO 4: Variantes del producto ID ${productoId}\n`);
                    
                    db.all(`
                        SELECT 
                            id,
                            producto_id,
                            combinacion_variantes,
                            stock_actual,
                            precio_final,
                            sku_variante
                        FROM producto_variantes
                        WHERE producto_id = ?
                    `, [productoId], (err, variantes) => {
                        if (err) {
                            console.error('❌ Error:', err);
                            db.close();
                            return;
                        }
                        
                        console.log(`Variantes encontradas: ${variantes.length}`);
                        variantes.forEach((v, i) => {
                            console.log(`${i + 1}. Variante ID: ${v.id}`);
                            console.log(`   Combinación: ${v.combinacion_variantes}`);
                            console.log(`   SKU: ${v.sku_variante}`);
                            console.log(`   Precio: $${v.precio_final?.toLocaleString() || 'N/A'}`);
                            console.log(`   Stock: ${v.stock_actual}`);
                        });
                        console.log('');
                        
                        mostrarConclusiones(stats);
                        db.close();
                    });
                } else {
                    mostrarConclusiones(stats);
                    db.close();
                }
            }
            
            if (conVariantes.length === 0) {
                mostrarConclusiones(stats);
                db.close();
            }
        });
    });
});

function mostrarConclusiones(stats) {
    console.log('📋 CONCLUSIONES:');
    console.log('================\n');
    
    console.log('✅ IDENTIFICACIÓN DE TIPO DE PRODUCTO:');
    console.log('--------------------------------------');
    console.log('Campo clave: `tiene_variantes` en tabla `productos`');
    console.log('');
    console.log('Producto SIMPLE:');
    console.log('   tiene_variantes = 0');
    console.log('   → Un solo precio, un solo stock');
    console.log('   → No tiene registros en tabla producto_variantes');
    console.log('');
    console.log('Producto CON VARIANTES:');
    console.log('   tiene_variantes = 1');
    console.log('   → Múltiples combinaciones (talla, color, etc.)');
    console.log('   → Tiene registros en tabla producto_variantes');
    console.log('   → Cada variante tiene su propio precio y stock');
    console.log('');
    
    console.log('📊 FILTROS SQL RECOMENDADOS:');
    console.log('-----------------------------');
    console.log('');
    console.log('Solo productos simples:');
    console.log('```sql');
    console.log('SELECT * FROM productos WHERE tiene_variantes = 0');
    console.log('```');
    console.log('');
    console.log('Solo productos con variantes:');
    console.log('```sql');
    console.log('SELECT * FROM productos WHERE tiene_variantes = 1');
    console.log('```');
    console.log('');
    console.log('Productos simples de una categoría:');
    console.log('```sql');
    console.log('SELECT * FROM productos ');
    console.log('WHERE tiene_variantes = 0 AND categoria_id = 263');
    console.log('```');
    console.log('');
    
    console.log('🚀 PARÁMETRO PROPUESTO PARA EL SCRIPT:');
    console.log('---------------------------------------');
    console.log('');
    console.log('Uso:');
    console.log('  node convertir-productos-sqlite.js [categoria] [limite] [tipo]');
    console.log('');
    console.log('Donde tipo puede ser:');
    console.log('  - "simple" o "simples" → Solo productos simples');
    console.log('  - "variantes" → Solo productos con variantes');
    console.log('  - omitido → Todos los productos');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node convertir-productos-sqlite.js 263 10 simple');
    console.log('  node convertir-productos-sqlite.js 263 10 variantes');
    console.log('  node convertir-productos-sqlite.js 263 10');
    console.log('');
    
    console.log(`📊 ESTADÍSTICAS DE TU BASE:');
    console.log(`---------------------------`);
    console.log(`Total: ${stats.total} productos`);
    console.log(`Simples: ${stats.simples} (${Math.round(stats.simples/stats.total*100)}%)`);
    console.log(`Con variantes: ${stats.con_variantes} (${Math.round(stats.con_variantes/stats.total*100)}%)`);
    console.log('');
    
    console.log('💡 RECOMENDACIÓN:');
    console.log('=================');
    console.log('1. Crear primero productos SIMPLES (más fácil)');
    console.log('2. Luego crear productos CON VARIANTES (más complejo)');
    console.log('3. Usar el parámetro "tipo" para filtrar');
    
    console.log('\n🚀 Test completado');
}
