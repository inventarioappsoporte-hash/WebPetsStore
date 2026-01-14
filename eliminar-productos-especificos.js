const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'inventario_restored.db');

// Lista de productos a eliminar
const productosAEliminar = [
    'BEBEDERO CON FUENTE ELECTRICO',
    'BEBEDERO DE HAMSTER NEW PET',
    'COMEDERO DE ALTURA REGULABLE N1',
    'COMEDERO DOBLE DE AC. INOX., 0,9 L',
    'COMEDERO DE AVES/COLIBRI',
    'KIT BEBEDERO Y COMEDERO GOURMET',
    'KIT MOISE CON PELOTITA Y PLATO',
    'COMEDERO DOBLE DE AC. INOX., 0,2 L',
    'COMEDERO DOBLE DE AC. INOX., 0,4 L',
    'COMEDERO DOBLE DE AC. INOX., 1,6 L',
    'Pipetas pulguicida Gato',
    'Pipetas pulguicida Perro',
    'LaPastilla® OSSPRET Gato',
    'LaPastilla® OSSPRET PERRO'
];

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error al conectar con la base de datos:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado a la base de datos SQLite\n');
});

// Función para buscar productos
function buscarProductos() {
    return new Promise((resolve, reject) => {
        const placeholders = productosAEliminar.map(() => '?').join(',');
        const query = `SELECT id, name FROM products WHERE name IN (${placeholders})`;
        
        db.all(query, productosAEliminar, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Función para eliminar productos
function eliminarProductos(ids) {
    return new Promise((resolve, reject) => {
        const placeholders = ids.map(() => '?').join(',');
        const query = `DELETE FROM products WHERE id IN (${placeholders})`;
        
        db.run(query, ids, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

// Proceso principal
async function main() {
    try {
        console.log('🔍 Buscando productos en la base de datos...\n');
        
        const productosEncontrados = await buscarProductos();
        
        if (productosEncontrados.length === 0) {
            console.log('ℹ️  No se encontraron productos con esos nombres en la base de datos.');
            console.log('\n📋 Productos buscados:');
            productosAEliminar.forEach((nombre, index) => {
                console.log(`   ${index + 1}. ${nombre}`);
            });
        } else {
            console.log(`✅ Se encontraron ${productosEncontrados.length} productos:\n`);
            productosEncontrados.forEach((producto, index) => {
                console.log(`   ${index + 1}. ID: ${producto.id} - ${producto.name}`);
            });
            
            console.log('\n🗑️  Eliminando productos...\n');
            
            const ids = productosEncontrados.map(p => p.id);
            const cambios = await eliminarProductos(ids);
            
            console.log(`✅ Se eliminaron ${cambios} productos de la base de datos.`);
            
            console.log('\n📋 Productos eliminados:');
            productosEncontrados.forEach((producto, index) => {
                console.log(`   ${index + 1}. ${producto.name}`);
            });
        }
        
        // Verificar productos no encontrados
        const nombresEncontrados = productosEncontrados.map(p => p.name);
        const productosNoEncontrados = productosAEliminar.filter(
            nombre => !nombresEncontrados.includes(nombre)
        );
        
        if (productosNoEncontrados.length > 0) {
            console.log('\n⚠️  Productos NO encontrados en la base de datos:');
            productosNoEncontrados.forEach((nombre, index) => {
                console.log(`   ${index + 1}. ${nombre}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('❌ Error al cerrar la base de datos:', err.message);
            } else {
                console.log('\n✅ Conexión a la base de datos cerrada.');
            }
        });
    }
}

main();
