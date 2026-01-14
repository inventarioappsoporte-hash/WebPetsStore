// Test de Detección de Descuento Específico por Producto
const sqlite3 = require('sqlite3').verbose();

console.log('🧪 TEST DE DETECCIÓN DE DESCUENTO ESPECÍFICO');
console.log('=============================================\n');

const DB_PATH = '../database/inventario_restored.db';

// Conectar a SQLite
const db = new sqlite3.Database(DB_PATH);

console.log('🔍 PASO 1: Consultar descuentos con producto_ids\n');

db.all(`
    SELECT 
        id,
        nombre,
        tipo,
        valor,
        producto_ids
    FROM descuentos 
    WHERE producto_ids IS NOT NULL 
    AND producto_ids != ''
    AND activo = 1
    LIMIT 5
`, [], (err, descuentos) => {
    if (err) {
        console.error('❌ Error:', err);
        db.close();
        return;
    }
    
    console.log(`📊 ${descuentos.length} descuentos con productos específicos encontrados\n`);
    
    descuentos.forEach((d, i) => {
        console.log(`${i + 1}. ${d.nombre}`);
        console.log(`   Tipo: ${d.tipo}`);
        console.log(`   Valor: ${d.valor}%`);
        console.log(`   producto_ids (raw): ${d.producto_ids}`);
        
        // Intentar parsear el JSON
        try {
            const productIds = JSON.parse(d.producto_ids);
            console.log(`   ✅ JSON parseado correctamente`);
            console.log(`   Tipo de datos: ${Array.isArray(productIds) ? 'Array' : typeof productIds}`);
            console.log(`   Cantidad de productos: ${Array.isArray(productIds) ? productIds.length : 'N/A'}`);
            console.log(`   Primeros IDs: ${Array.isArray(productIds) ? productIds.slice(0, 5).join(', ') : productIds}`);
        } catch (e) {
            console.log(`   ❌ Error parseando JSON: ${e.message}`);
        }
        console.log('');
    });
    
    // Ahora probar con un producto específico
    console.log('🧪 PASO 2: Probar detección con producto específico\n');
    
    // Tomar el primer descuento con productos
    if (descuentos.length > 0) {
        const descuentoTest = descuentos[0];
        console.log(`Descuento de prueba: ${descuentoTest.nombre}`);
        console.log(`producto_ids: ${descuentoTest.producto_ids}\n`);
        
        try {
            const productIds = JSON.parse(descuentoTest.producto_ids);
            
            if (Array.isArray(productIds) && productIds.length > 0) {
                // Tomar el primer ID del array
                const primerProductoId = productIds[0];
                console.log(`Probando con primer producto del array: ${primerProductoId}`);
                console.log(`Tipo de dato: ${typeof primerProductoId}\n`);
                
                // Función de detección (la del script)
                function detectarDescuento(productoId, descuento) {
                    console.log('🔍 Ejecutando función de detección:');
                    console.log(`   Producto ID a buscar: ${productoId} (tipo: ${typeof productoId})`);
                    
                    if (!descuento.producto_ids) {
                        console.log('   ❌ No hay producto_ids en el descuento');
                        return false;
                    }
                    
                    try {
                        const productIds = JSON.parse(descuento.producto_ids);
                        console.log(`   ✅ JSON parseado: ${productIds.length} productos`);
                        console.log(`   Productos en array: ${productIds.slice(0, 10).join(', ')}`);
                        
                        // Verificar si el ID está en el array
                        const encontrado = productIds.includes(productoId);
                        console.log(`   Buscando ${productoId} en array...`);
                        console.log(`   Resultado: ${encontrado ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO'}`);
                        
                        // Debug adicional: verificar tipos
                        if (!encontrado) {
                            console.log(`   🔍 Debug de tipos:`);
                            productIds.slice(0, 5).forEach(id => {
                                console.log(`      - ${id} (tipo: ${typeof id}) === ${productoId} (tipo: ${typeof productoId})? ${id === productoId}`);
                            });
                            
                            // Intentar conversión
                            const encontradoConConversion = productIds.some(id => {
                                return String(id) === String(productoId) || Number(id) === Number(productoId);
                            });
                            console.log(`   🔄 Con conversión de tipos: ${encontradoConConversion ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO'}`);
                        }
                        
                        return encontrado;
                    } catch (e) {
                        console.log(`   ❌ Error parseando JSON: ${e.message}`);
                        return false;
                    }
                }
                
                // Probar detección
                const resultado = detectarDescuento(primerProductoId, descuentoTest);
                
                console.log(`\n📊 RESULTADO:`);
                console.log(`   Descuento detectado: ${resultado ? '✅ SÍ' : '❌ NO'}`);
                
                // Probar con conversión de tipos
                console.log(`\n🔄 PROBANDO CON DIFERENTES TIPOS:`);
                
                // Como número
                const resultadoNumero = detectarDescuento(Number(primerProductoId), descuentoTest);
                console.log(`   Como número (${Number(primerProductoId)}): ${resultadoNumero ? '✅' : '❌'}`);
                
                // Como string
                const resultadoString = detectarDescuento(String(primerProductoId), descuentoTest);
                console.log(`   Como string ("${String(primerProductoId)}"): ${resultadoString ? '✅' : '❌'}`);
                
            } else {
                console.log('❌ producto_ids no es un array válido');
            }
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
    }
    
    console.log('\n💡 RECOMENDACIÓN:');
    console.log('==================');
    console.log('Para asegurar compatibilidad, la función debe:');
    console.log('1. Parsear el JSON correctamente');
    console.log('2. Manejar diferentes tipos de datos (string, number)');
    console.log('3. Usar comparación flexible con conversión de tipos');
    console.log('');
    console.log('Código recomendado:');
    console.log('```javascript');
    console.log('const productIds = JSON.parse(descuento.producto_ids);');
    console.log('const encontrado = productIds.some(id => ');
    console.log('    String(id) === String(productoId) || ');
    console.log('    Number(id) === Number(productoId)');
    console.log(');');
    console.log('```');
    
    console.log('\n🚀 Test completado');
    
    db.close();
});