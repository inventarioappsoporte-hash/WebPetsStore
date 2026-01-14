const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, '..', 'backupInventario', 'backup_owner_2026-01-13T16-26-46-405.json');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

const ids = [223, 230, 231, 232];

console.log('Verificando imágenes en el backup para los productos nuevos:\n');

ids.forEach(id => {
    const img = backup.imagenes.find(i => i.tipo === 'producto' && i.objeto_id === id);
    if (img) {
        console.log(`✅ ID ${id}: SÍ tiene imagen`);
        console.log(`   Nombre archivo: ${img.nombre_archivo}`);
    } else {
        console.log(`❌ ID ${id}: NO tiene imagen`);
    }
});

console.log('\n---\n');
console.log('Verificando carpetas creadas:\n');

ids.forEach(id => {
    const productDir = path.join(__dirname, 'assets', 'images', 'products', `prod_${id}`);
    if (fs.existsSync(productDir)) {
        const files = fs.readdirSync(productDir);
        console.log(`✅ prod_${id}: Carpeta existe con ${files.length} archivos`);
        files.forEach(f => console.log(`   - ${f}`));
    } else {
        console.log(`❌ prod_${id}: Carpeta NO existe`);
    }
});
