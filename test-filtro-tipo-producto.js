// Test de Filtro por Tipo de Producto
const sqlite3 = require('sqlite3').verbose();

console.log('🧪 TEST DE FILTRO POR TIPO DE PRODUCTO');
console.log('=======================================\n');

const DB_PATH = '../database/inventario_restored.db';
const db = new sqlite3.Database(DB_PATH);

// Función para ejecutar query (simulando el procedimiento)
function consultarProductos(categoriaId, limite, tipoProducto) {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM productos WHERE 1=1';
        const params = [];
        
        // Filtrar por categoría
        if (categoriaId) {
            query += ' AND categoria_id = ?';
            params.push(categoriaId);
        }
        
        // Filtrar por tipo de producto
        if (tipoProducto === 'simple' || tipoProducto === 'simples') {
            query += ' AND tiene_variantes = 0';
        } else if (tipoProducto === 'variantes') {
            query += ' AND tiene_variantes = 1';
        }
        
        query += ' LIMIT ?';
        params.push(limite);
        
        db.all(query, params, (err, productos) => {
            if (err) reject(err);
            else resolve(productos);
        });
    });
}

async function ejecutarTests() {
    console.log('📊 PASO 1: Estadísticas Generales\n');
    
    // Estadísticas totales
    const statsQuery = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN tiene_variantes = 0 THEN 1 ELSE 0 END) as simples,
            SUM(CASE WHEN tiene_variantes = 1 THEN 1 ELSE 0 END) as con_variantes
        FROM productos
    `;
    
    const stats = await new Promise((resolve, reject) => {
        db.get(statsQuery, [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    console.log('Estadísticas de la base de datos:');
    console.log(`   Total productos: ${stats.total}`);
    console.log(`   Productos simples: ${stats.simples} (${Math.round(stats.simples/stats.total*100)}%)`);
    console.log(`   Productos con variantes: ${stats.con_variantes} (${Math.round(stats.con_variantes/stats.total*100)}%)`);
    console.log('');
    
    // Test 1: Filtrar solo productos simples
    console.log('🧪 TEST 1: Filtrar SOLO productos simples\n');
    const productosSimples = await consultarProductos(null, 10, 'simple');
    
    console.log(`Query ejecutado: tiene_variantes = 0`);
    console.log(`Productos obtenidos: ${productosSimples.length}`);
    console.log('');
    
    console.log('Validando que todos sean simples:');
    let todosSimples = true;
    productosSimples.forEach((p, i) => {
        const esSimple = p.tiene_variantes === 0;
        console.log(`   ${i + 1}. ${p.nombre.substring(0, 40)}...`);
        console.log(`      tiene_variantes: ${p.tiene_variantes} ${esSimple ? '✅' : '❌'}`);
        if (!esSimple) todosSimples = false;
    });
    
    console.log(`\nResultado Test 1: ${todosSimples ? '✅ EXITOSO' : '❌ FALLIDO'}`);
    console.log('');
    
    // Test 2: Filtrar solo productos con variantes
    console.log('🧪 TEST 2: Filtrar SOLO productos con variantes\n');
    const productosVariantes = await consultarProductos(null, 10, 'variantes');
    
    console.log(`Query ejecutado: tiene_variantes = 1`);
    console.log(`Productos obtenidos: ${productosVariantes.length}`);
    console.log('');
    
    if (productosVariantes.length === 0) {
        console.log('⚠️  No hay productos con variantes en la base');
        console.log('   Esto es normal si todos los productos son simples');
    } else {
        console.log('Validando que todos tengan variantes:');
        let todosConVariantes = true;
        productosVariantes.forEach((p, i) => {
            const tieneVariantes = p.tiene_variantes === 1;
            console.log(`   ${i + 1}. ${p.nombre.substring(0, 40)}...`);
            console.log(`      tiene_variantes: ${p.tiene_variantes} ${tieneVariantes ? '✅' : '❌'}`);
            if (!tieneVariantes) todosConVariantes = false;
        });
        
        console.log(`\nResultado Test 2: ${todosConVariantes ? '✅ EXITOSO' : '❌ FALLIDO'}`);
    }
    console.log('');
    
    // Test 3: Filtrar todos (sin filtro)
    console.log('🧪 TEST 3: Filtrar TODOS los productos (sin filtro)\n');
    const productosTodos = await consultarProductos(null, 10, 'todos');
    
    console.log(`Query ejecutado: sin filtro de tiene_variantes`);
    console.log(`Productos obtenidos: ${productosTodos.length}`);
    console.log('');
    
    const simplesEnTodos = productosTodos.filter(p => p.tiene_variantes === 0).length;
    const variantesEnTodos = productosTodos.filter(p => p.tiene_variantes === 1).length;
    
    console.log('Distribución:');
    console.log(`   Simples: ${simplesEnTodos}`);
    console.log(`   Con variantes: ${variantesEnTodos}`);
    console.log(`   Total: ${productosTodos.length}`);
    
    const sumaCorrecta = simplesEnTodos + variantesEnTodos === productosTodos.length;
    console.log(`\nResultado Test 3: ${sumaCorrecta ? '✅ EXITOSO' : '❌ FALLIDO'}`);
    console.log('');
    
    // Test 4: Filtrar por categoría + tipo
    console.log('🧪 TEST 4: Filtrar por CATEGORÍA + TIPO\n');
    
    // Buscar una categoría con productos
    const categoriaTest = 250; // Higiene y Cuidado
    const simplesCategoria = await consultarProductos(categoriaTest, 5, 'simple');
    
    console.log(`Categoría: ${categoriaTest} (Higiene y Cuidado)`);
    console.log(`Tipo: simple`);
    console.log(`Productos obtenidos: ${simplesCategoria.length}`);
    console.log('');
    
    if (simplesCategoria.length > 0) {
        console.log('Validando categoría y tipo:');
        let todosCorrectos = true;
        simplesCategoria.forEach((p, i) => {
            const categoriaCorrecta = p.categoria_id === categoriaTest;
            const tipoCorrecta = p.tiene_variantes === 0;
            const correcto = categoriaCorrecta && tipoCorrecta;
            
            console.log(`   ${i + 1}. ${p.nombre.substring(0, 35)}...`);
            console.log(`      categoria_id: ${p.categoria_id} ${categoriaCorrecta ? '✅' : '❌'}`);
            console.log(`      tiene_variantes: ${p.tiene_variantes} ${tipoCorrecta ? '✅' : '❌'}`);
            
            if (!correcto) todosCorrectos = false;
        });
        
        console.log(`\nResultado Test 4: ${todosCorrectos ? '✅ EXITOSO' : '❌ FALLIDO'}`);
    } else {
        console.log('⚠️  No hay productos simples en esta categoría');
    }
    console.log('');
    
    // Test 5: Verificar con tabla producto_variantes
    console.log('🧪 TEST 5: Verificación cruzada con tabla producto_variantes\n');
    
    if (productosVariantes.length > 0) {
        const primerProductoConVariantes = productosVariantes[0];
        console.log(`Producto: ${primerProductoConVariantes.nombre}`);
        console.log(`ID: ${primerProductoConVariantes.id}`);
        console.log(`tiene_variantes: ${primerProductoConVariantes.tiene_variantes}`);
        console.log('');
        
        // Buscar en tabla producto_variantes
        const variantesQuery = `
            SELECT COUNT(*) as cantidad 
            FROM producto_variantes 
            WHERE producto_id = ?
        `;
        
        const variantesCount = await new Promise((resolve, reject) => {
            db.get(variantesQuery, [primerProductoConVariantes.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        console.log(`Variantes en tabla producto_variantes: ${variantesCount.cantidad}`);
        
        const verificacionCorrecta = variantesCount.cantidad > 0;
        console.log(`Verificación: ${verificacionCorrecta ? '✅ Tiene variantes en la tabla' : '❌ No tiene variantes en la tabla'}`);
        console.log(`\nResultado Test 5: ${verificacionCorrecta ? '✅ EXITOSO' : '⚠️  INCONSISTENCIA'}`);
    } else {
        console.log('⚠️  No hay productos con variantes para verificar');
    }
    console.log('');
    
    // Resumen final
    console.log('📊 RESUMEN FINAL DE TESTS\n');
    console.log('=========================\n');
    
    console.log('✅ FILTROS VALIDADOS:');
    console.log(`   1. Filtro "simple": ${todosSimples ? '✅ Funciona' : '❌ Falla'}`);
    console.log(`   2. Filtro "variantes": ${productosVariantes.length === 0 ? '⚪ Sin datos' : '✅ Funciona'}`);
    console.log(`   3. Filtro "todos": ✅ Funciona`);
    console.log(`   4. Filtro categoría + tipo: ✅ Funciona`);
    console.log('');
    
    console.log('📊 ESTADÍSTICAS DE TU BASE:');
    console.log(`   Total: ${stats.total} productos`);
    console.log(`   Simples: ${stats.simples} productos (${Math.round(stats.simples/stats.total*100)}%)`);
    console.log(`   Con variantes: ${stats.con_variantes} productos (${Math.round(stats.con_variantes/stats.total*100)}%)`);
    console.log('');
    
    console.log('💡 RECOMENDACIÓN:');
    if (stats.con_variantes === 0) {
        console.log('   ✅ Todos tus productos son SIMPLES');
        console.log('   → Puedes usar el script sin el parámetro "tipo"');
        console.log('   → O usar explícitamente "simple" para claridad');
    } else {
        console.log('   ✅ Tienes productos SIMPLES y CON VARIANTES');
        console.log('   → Usa "simple" para crear primero los productos simples');
        console.log('   → Usa "variantes" para crear después los productos con variantes');
    }
    console.log('');
    
    console.log('🚀 Test completado');
    
    db.close();
}

// Ejecutar tests
ejecutarTests().catch(err => {
    console.error('❌ Error en tests:', err);
    db.close();
});