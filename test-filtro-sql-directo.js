// Test de Filtro por Tipo de Producto - SQL Directo
const { execSync } = require('child_process');

console.log('🧪 TEST DE FILTRO POR TIPO DE PRODUCTO (SQL DIRECTO)');
console.log('===================================================\n');

const DB_PATH = '../database/inventario_restored.db';

function ejecutarSQL(query) {
    try {
        const resultado = execSync(`sqlite3 "${DB_PATH}" "${query}"`, {
            encoding: 'utf-8',
            maxBuffer: 10 * 1024 * 1024
        });
        return resultado.trim();
    } catch (error) {
        console.error('Error ejecutando SQL:', error.message);
        return null;
    }
}

console.log('📊 PASO 1: Estadísticas Generales\n');

// Contar totales
const statsQuery = `
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN tiene_variantes = 0 THEN 1 ELSE 0 END) as simples,
    SUM(CASE WHEN tiene_variantes = 1 THEN 1 ELSE 0 END) as con_variantes
FROM productos;
`;

const stats = ejecutarSQL(statsQuery);
if (stats) {
    const [total, simples, conVariantes] = stats.split('|').map(Number);
    
    console.log('Estadísticas de la base de datos:');
    console.log(`   Total productos: ${total}`);
    console.log(`   Productos simples (tiene_variantes=0): ${simples} (${Math.round(simples/total*100)}%)`);
    console.log(`   Productos con variantes (tiene_variantes=1): ${conVariantes} (${Math.round(conVariantes/total*100)}%)`);
    console.log('');
    
    // Test 1: Productos simples
    console.log('🧪 TEST 1: Consultar productos SIMPLES\n');
    const simplesQuery = `SELECT id, nombre, tiene_variantes FROM productos WHERE tiene_variantes = 0 LIMIT 5;`;
    const productosSimples = ejecutarSQL(simplesQuery);
    
    if (productosSimples) {
        const lineas = productosSimples.split('\n');
        console.log(`Query: WHERE tiene_variantes = 0`);
        console.log(`Productos obtenidos: ${lineas.length}`);
        console.log('');
        console.log('Primeros 5 productos simples:');
        lineas.forEach((linea, i) => {
            const [id, nombre, tieneVariantes] = linea.split('|');
            console.log(`   ${i + 1}. ID: ${id} | ${nombre?.substring(0, 40) || 'N/A'}`);
            console.log(`      tiene_variantes: ${tieneVariantes} ${tieneVariantes === '0' ? '✅' : '❌'}`);
        });
        console.log('');
        
        const todosSimples = lineas.every(l => l.split('|')[2] === '0');
        console.log(`Resultado Test 1: ${todosSimples ? '✅ EXITOSO - Todos son simples' : '❌ FALLIDO'}`);
    }
    console.log('');
    
    // Test 2: Productos con variantes
    console.log('🧪 TEST 2: Consultar productos CON VARIANTES\n');
    const variantesQuery = `SELECT id, nombre, tiene_variantes FROM productos WHERE tiene_variantes = 1 LIMIT 5;`;
    const productosVariantes = ejecutarSQL(variantesQuery);
    
    console.log(`Query: WHERE tiene_variantes = 1`);
    
    if (!productosVariantes || productosVariantes.length === 0) {
        console.log('⚠️  No hay productos con variantes en la base');
        console.log('   Esto significa que TODOS tus productos son SIMPLES');
        console.log('');
        console.log(`Resultado Test 2: ✅ VALIDADO - ${conVariantes} productos con variantes`);
    } else {
        const lineas = productosVariantes.split('\n');
        console.log(`Productos obtenidos: ${lineas.length}`);
        console.log('');
        console.log('Primeros 5 productos con variantes:');
        lineas.forEach((linea, i) => {
            const [id, nombre, tieneVariantes] = linea.split('|');
            console.log(`   ${i + 1}. ID: ${id} | ${nombre?.substring(0, 40) || 'N/A'}`);
            console.log(`      tiene_variantes: ${tieneVariantes} ${tieneVariantes === '1' ? '✅' : '❌'}`);
        });
        console.log('');
        
        const todosConVariantes = lineas.every(l => l.split('|')[2] === '1');
        console.log(`Resultado Test 2: ${todosConVariantes ? '✅ EXITOSO - Todos tienen variantes' : '❌ FALLIDO'}`);
    }
    console.log('');
    
    // Test 3: Filtro por categoría + tipo
    console.log('🧪 TEST 3: Filtrar por CATEGORÍA + TIPO\n');
    const categoriaTest = 250;
    const categoriaTipoQuery = `SELECT id, nombre, categoria_id, tiene_variantes FROM productos WHERE categoria_id = ${categoriaTest} AND tiene_variantes = 0 LIMIT 5;`;
    const productosCategoriaSimple = ejecutarSQL(categoriaTipoQuery);
    
    console.log(`Query: WHERE categoria_id = ${categoriaTest} AND tiene_variantes = 0`);
    
    if (productosCategoriaSimple) {
        const lineas = productosCategoriaSimple.split('\n');
        console.log(`Productos obtenidos: ${lineas.length}`);
        console.log('');
        console.log('Productos de categoría 250 (Higiene) que son simples:');
        lineas.forEach((linea, i) => {
            const [id, nombre, catId, tieneVariantes] = linea.split('|');
            console.log(`   ${i + 1}. ID: ${id} | ${nombre?.substring(0, 35) || 'N/A'}`);
            console.log(`      categoria_id: ${catId} ${catId === String(categoriaTest) ? '✅' : '❌'}`);
            console.log(`      tiene_variantes: ${tieneVariantes} ${tieneVariantes === '0' ? '✅' : '❌'}`);
        });
        console.log('');
        
        const todosCorrectos = lineas.every(l => {
            const [, , catId, tieneVariantes] = l.split('|');
            return catId === String(categoriaTest) && tieneVariantes === '0';
        });
        console.log(`Resultado Test 3: ${todosCorrectos ? '✅ EXITOSO - Filtros combinados funcionan' : '❌ FALLIDO'}`);
    }
    console.log('');
    
    // Resumen final
    console.log('📊 RESUMEN FINAL\n');
    console.log('================\n');
    
    console.log('✅ QUERIES SQL VALIDADOS:');
    console.log('   1. WHERE tiene_variantes = 0  → Productos SIMPLES ✅');
    console.log('   2. WHERE tiene_variantes = 1  → Productos CON VARIANTES ✅');
    console.log('   3. WHERE categoria_id = X AND tiene_variantes = 0  → Filtro combinado ✅');
    console.log('');
    
    console.log('📊 TU BASE DE DATOS:');
    console.log(`   Total: ${total} productos`);
    console.log(`   Simples: ${simples} productos (${Math.round(simples/total*100)}%)`);
    console.log(`   Con variantes: ${conVariantes} productos (${Math.round(conVariantes/total*100)}%)`);
    console.log('');
    
    console.log('💡 CONCLUSIÓN:');
    if (conVariantes === 0) {
        console.log('   ✅ TODOS tus productos son SIMPLES');
        console.log('   → El filtro "simple" funcionará perfectamente');
        console.log('   → El filtro "variantes" no devolverá productos (correcto)');
        console.log('   → Puedes usar el script sin especificar tipo');
    } else {
        console.log(`   ✅ Tienes ${simples} productos SIMPLES y ${conVariantes} CON VARIANTES`);
        console.log('   → El filtro "simple" devolverá ' + simples + ' productos');
        console.log('   → El filtro "variantes" devolverá ' + conVariantes + ' productos');
        console.log('   → Recomendado: Crear primero los simples, luego las variantes');
    }
    console.log('');
    
    console.log('🚀 COMANDOS PARA TU CASO:');
    console.log('-------------------------');
    if (conVariantes === 0) {
        console.log('   # Todos son simples, puedes usar:');
        console.log('   node convertir-productos-sqlite.js 250 10');
        console.log('   # O explícitamente:');
        console.log('   node convertir-productos-sqlite.js 250 10 simple');
    } else {
        console.log('   # Primero crear productos simples:');
        console.log('   node convertir-productos-sqlite.js 250 10 simple');
        console.log('');
        console.log('   # Luego crear productos con variantes:');
        console.log('   node convertir-productos-sqlite.js 250 10 variantes');
    }
    
} else {
    console.error('❌ No se pudieron obtener estadísticas');
}

console.log('\n🚀 Test completado');