const { execSync } = require('child_process');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/inventario_restored.db');

console.log('🔍 LISTADO DE PRODUCTOS CON VARIANTES');
console.log('======================================\n');

// Query para obtener todos los productos con variantes
const query = `
SELECT 
    p.id,
    p.nombre,
    p.categoria_id,
    p.precio_venta,
    p.stock,
    COUNT(pv.id) as num_variantes
FROM productos p
LEFT JOIN producto_variantes pv ON p.id = pv.producto_id AND pv.activo = 1
WHERE p.tiene_variantes = 1
GROUP BY p.id
ORDER BY p.categoria_id, p.id;
`;

try {
    const result = execSync(`sqlite3 -separator "|||" "${DB_PATH}" "${query}"`, {
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024
    });
    
    const lineas = result.trim().split('\n').filter(l => l.trim());
    
    console.log(`📊 Total de productos con variantes: ${lineas.length}\n`);
    
    // Agrupar por categoría
    const porCategoria = {};
    
    lineas.forEach(linea => {
        const [id, nombre, categoria_id, precio, stock, num_variantes] = linea.split('|||');
        
        if (!porCategoria[categoria_id]) {
            porCategoria[categoria_id] = [];
        }
        
        porCategoria[categoria_id].push({
            id: parseInt(id),
            nombre,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            num_variantes: parseInt(num_variantes)
        });
    });
    
    // Mapeo de categorías
    const CATEGORY_NAMES = {
        250: 'Higiene y Cuidado',
        261: 'Colchonetas y Moisés',
        262: 'Bolsos y Casitas',
        263: 'Rascadores',
        264: 'Juguetes',
        275: 'Ropa Verano',
        316: 'Ropa Invierno',
        317: 'Collares, Correas y Pecheras',
        409: 'Comederos y Bebederos',
        500: 'Accesorios'
    };
    
    // Mostrar por categoría
    Object.keys(porCategoria).sort().forEach(catId => {
        const productos = porCategoria[catId];
        const catName = CATEGORY_NAMES[catId] || `Categoría ${catId}`;
        
        console.log(`\n📁 ${catName} (ID: ${catId})`);
        console.log('─'.repeat(60));
        
        productos.forEach(p => {
            console.log(`   ${p.id.toString().padStart(4)} | ${p.nombre.padEnd(40)} | ${p.num_variantes} variantes | $${p.precio}`);
        });
        
        console.log(`   Total: ${productos.length} productos`);
    });
    
    // Resumen
    console.log('\n\n📊 RESUMEN POR CATEGORÍA');
    console.log('========================\n');
    
    Object.keys(porCategoria).sort().forEach(catId => {
        const productos = porCategoria[catId];
        const catName = CATEGORY_NAMES[catId] || `Categoría ${catId}`;
        const totalVariantes = productos.reduce((sum, p) => sum + p.num_variantes, 0);
        
        console.log(`${catName.padEnd(35)} | ${productos.length.toString().padStart(2)} productos | ${totalVariantes.toString().padStart(3)} variantes`);
    });
    
    // Lista de IDs para conversión
    console.log('\n\n🔧 COMANDOS PARA CONVERSIÓN');
    console.log('===========================\n');
    
    const todosLosIds = [];
    Object.values(porCategoria).forEach(productos => {
        productos.forEach(p => todosLosIds.push(p.id));
    });
    
    console.log('Para convertir todos los productos, ejecuta:\n');
    todosLosIds.forEach(id => {
        console.log(`node convertir-productos-variantes.js convert ${id}`);
    });
    
    console.log(`\n\n💡 Total de productos a convertir: ${todosLosIds.length}`);
    console.log(`\n📝 IDs: ${todosLosIds.join(', ')}`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
}
