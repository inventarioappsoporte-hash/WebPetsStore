const { execSync } = require('child_process');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/inventario_restored.db');

console.log('🔍 VERIFICACIÓN DE PRODUCTOS CON VARIANTES EN LA BD');
console.log('===================================================\n');

function ejecutarQuery(query, descripcion) {
    console.log(`\n📋 ${descripcion}`);
    console.log('─'.repeat(60));
    try {
        const result = execSync(`sqlite3 -separator "|||" "${DB_PATH}" "${query}"`, {
            encoding: 'utf-8',
            maxBuffer: 50 * 1024 * 1024
        });
        return result.trim();
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// 1. Verificar productos con tiene_variantes = 1
const query1 = `SELECT id, nombre, tiene_variantes FROM productos WHERE tiene_variantes = 1 LIMIT 20;`;
const result1 = ejecutarQuery(query1, 'Productos con tiene_variantes = 1');
if (result1) {
    const lineas = result1.split('\n').filter(l => l.trim());
    console.log(`Total encontrados: ${lineas.length}`);
    lineas.forEach(linea => {
        const [id, nombre, tiene_variantes] = linea.split('|||');
        console.log(`   ${id.padStart(4)} | ${nombre.substring(0, 50).padEnd(50)} | tiene_variantes: ${tiene_variantes}`);
    });
} else {
    console.log('No se encontraron productos');
}

// 2. Verificar tabla producto_variantes
const query2 = `SELECT COUNT(*) as total FROM producto_variantes;`;
const result2 = ejecutarQuery(query2, 'Total de registros en producto_variantes');
if (result2) {
    console.log(`Total: ${result2}`);
}

// 3. Verificar variantes activas
const query3 = `SELECT COUNT(*) as total FROM producto_variantes WHERE activo = 1;`;
const result3 = ejecutarQuery(query3, 'Variantes activas');
if (result3) {
    console.log(`Total: ${result3}`);
}

// 4. Productos con variantes activas
const query4 = `
SELECT DISTINCT p.id, p.nombre, COUNT(pv.id) as num_variantes
FROM productos p
INNER JOIN producto_variantes pv ON p.id = pv.producto_id
WHERE pv.activo = 1
GROUP BY p.id
ORDER BY p.id
LIMIT 20;
`;
const result4 = ejecutarQuery(query4, 'Productos que tienen variantes activas');
if (result4) {
    const lineas = result4.split('\n').filter(l => l.trim());
    console.log(`Total encontrados: ${lineas.length}`);
    lineas.forEach(linea => {
        const [id, nombre, num_variantes] = linea.split('|||');
        console.log(`   ${id.padStart(4)} | ${nombre.substring(0, 40).padEnd(40)} | ${num_variantes} variantes`);
    });
} else {
    console.log('No se encontraron productos');
}

// 5. Verificar estructura de la tabla productos
const query5 = `PRAGMA table_info(productos);`;
const result5 = ejecutarQuery(query5, 'Estructura de tabla productos');
if (result5) {
    console.log(result5);
}

// 6. Verificar estructura de la tabla producto_variantes
const query6 = `PRAGMA table_info(producto_variantes);`;
const result6 = ejecutarQuery(query6, 'Estructura de tabla producto_variantes');
if (result6) {
    console.log(result6);
}

// 7. Muestra de datos de producto_variantes
const query7 = `SELECT * FROM producto_variantes LIMIT 5;`;
const result7 = ejecutarQuery(query7, 'Muestra de datos en producto_variantes');
if (result7) {
    const lineas = result7.split('\n').filter(l => l.trim());
    console.log(`Registros encontrados: ${lineas.length}`);
    lineas.forEach((linea, index) => {
        console.log(`\nRegistro ${index + 1}:`);
        console.log(linea);
    });
} else {
    console.log('No hay datos en la tabla');
}

console.log('\n\n✅ Verificación completada');
