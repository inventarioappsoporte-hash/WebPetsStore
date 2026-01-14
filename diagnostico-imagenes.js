const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE IMÁGENES\n');

const backupPath = path.join(__dirname, '..', 'backupInventario', 'backup_owner_2026-01-13T16-26-46-405.json');

console.log(`Ruta del backup: ${backupPath}`);
console.log(`¿Existe? ${fs.existsSync(backupPath) ? 'SÍ' : 'NO'}\n`);

if (!fs.existsSync(backupPath)) {
    console.log('❌ El archivo de backup no existe');
    process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
console.log(`Total de imágenes en backup: ${backup.imagenes?.length || 0}\n`);

const productosNuevos = [223, 230, 231, 232];

console.log('Buscando imágenes para productos nuevos:\n');

productosNuevos.forEach(id => {
    const imagen = backup.imagenes.find(img => 
        img.tipo === 'producto' && img.objeto_id === id
    );
    
    if (imagen) {
        console.log(`✅ Producto ${id}:`);
        console.log(`   Nombre: ${imagen.nombre_archivo}`);
        console.log(`   Tiene data_base64: ${imagen.data_base64 ? 'SÍ' : 'NO'}`);
        if (imagen.data_base64) {
            const dataLength = imagen.data_base64.length;
            console.log(`   Tamaño data: ${dataLength} caracteres`);
        }
    } else {
        console.log(`❌ Producto ${id}: NO tiene imagen en el backup`);
    }
    console.log('');
});

console.log('\nVerificando carpetas en assets/images/products:\n');

productosNuevos.forEach(id => {
    const productDir = path.join(__dirname, 'assets', 'images', 'products', `prod_${id}`);
    const existe = fs.existsSync(productDir);
    
    if (existe) {
        const archivos = fs.readdirSync(productDir);
        console.log(`✅ prod_${id}: Carpeta existe (${archivos.length} archivos)`);
        archivos.forEach(f => console.log(`   - ${f}`));
    } else {
        console.log(`❌ prod_${id}: Carpeta NO existe`);
    }
});
