const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/inventario_restored.db');
const PRODUCTS_JSON_PATH = path.join(__dirname, 'data/products.json');

console.log('🔄 CONVERSIÓN MASIVA DE PRODUCTOS CON VARIANTES');
console.log('================================================\n');

// Obtener todos los productos con variantes
const query = `SELECT id FROM productos WHERE tiene_variantes = 1 ORDER BY id;`;

try {
    const result = execSync(`sqlite3 "${DB_PATH}" "${query}"`, {
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024
    });
    
    const productosIds = result.trim().split('\n').filter(l => l.trim()).map(id => parseInt(id));
    
    console.log(`📊 Total de productos con variantes: ${productosIds.length}`);
    console.log(`📝 IDs: ${productosIds.join(', ')}\n`);
    
    // Confirmar antes de proceder
    console.log('⚠️  Este proceso convertirá todos los productos con variantes.');
    console.log('   Los archivos JSON se guardarán individualmente para revisión.\n');
    
    const productosConvertidos = [];
    const productosConError = [];
    
    console.log('🔄 Iniciando conversión...\n');
    console.log('='.repeat(70));
    
    productosIds.forEach((id, index) => {
        console.log(`\n[${index + 1}/${productosIds.length}] Procesando producto ${id}...`);
        console.log('-'.repeat(70));
        
        try {
            const result = execSync(`node convertir-productos-variantes.js convert ${id}`, {
                encoding: 'utf-8',
                cwd: __dirname,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            // Verificar que se creó el archivo
            const outputPath = path.join(__dirname, `producto_variante_${id}.json`);
            if (fs.existsSync(outputPath)) {
                const producto = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
                
                // Validar que no tenga NaN
                const jsonStr = JSON.stringify(producto);
                if (jsonStr.includes('NaN') || jsonStr.includes('null')) {
                    console.log(`   ⚠️  Producto ${id} contiene valores NaN o null, revisar manualmente`);
                    productosConError.push({ id, razon: 'Contiene NaN o null' });
                } else {
                    productosConvertidos.push(producto);
                    console.log(`   ✅ Producto ${id} convertido exitosamente`);
                }
            } else {
                console.log(`   ❌ No se generó el archivo para producto ${id}`);
                productosConError.push({ id, razon: 'Archivo no generado' });
            }
        } catch (error) {
            console.log(`   ❌ Error en producto ${id}: ${error.message.substring(0, 100)}`);
            productosConError.push({ id, razon: error.message.substring(0, 100) });
        }
    });
    
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 RESUMEN DE CONVERSIÓN');
    console.log('='.repeat(70));
    console.log(`\n✅ Productos convertidos exitosamente: ${productosConvertidos.length}`);
    console.log(`❌ Productos con errores: ${productosConError.length}`);
    
    if (productosConError.length > 0) {
        console.log('\n⚠️  Productos con errores:');
        productosConError.forEach(({ id, razon }) => {
            console.log(`   - Producto ${id}: ${razon}`);
        });
    }
    
    if (productosConvertidos.length > 0) {
        console.log('\n\n📁 Archivos JSON generados:');
        productosConvertidos.forEach(p => {
            const id = p.id.replace('prod_', '');
            console.log(`   - producto_variante_${id}.json`);
        });
        
        // Preguntar si desea agregar a products.json
        console.log('\n\n🔧 SIGUIENTE PASO:');
        console.log('='.repeat(70));
        console.log('\nPara agregar estos productos a products.json, puedes:');
        console.log('\n1. Revisar manualmente cada archivo JSON generado');
        console.log('2. Ejecutar el script de agregación automática (próximo paso)');
        console.log('3. Copiar y pegar manualmente en data/products.json');
        
        // Guardar resumen
        const resumen = {
            fecha: new Date().toISOString(),
            total_procesados: productosIds.length,
            exitosos: productosConvertidos.length,
            errores: productosConError.length,
            productos_exitosos: productosConvertidos.map(p => ({
                id: p.id,
                nombre: p.name,
                variantes: p.variants.combinations.length
            })),
            productos_error: productosConError
        };
        
        const resumenPath = path.join(__dirname, 'resumen-conversion-variantes.json');
        fs.writeFileSync(resumenPath, JSON.stringify(resumen, null, 2));
        console.log(`\n💾 Resumen guardado en: resumen-conversion-variantes.json`);
    }
    
} catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
}
