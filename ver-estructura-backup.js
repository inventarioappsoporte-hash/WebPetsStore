const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, '..', 'backupInventario', 'backup_owner_2026-01-13T16-26-46-405.json');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

console.log('📋 ESTRUCTURA DEL BACKUP JSON\n');

console.log('Claves principales:');
console.log(Object.keys(backup));
console.log('');

console.log('Estructura de la primera imagen:');
console.log(JSON.stringify(backup.imagenes[0], null, 2));
console.log('');

console.log('Buscando imágenes que contengan "223":');
const imagenesConId = backup.imagenes.filter(img => 
    JSON.stringify(img).includes('223')
);
console.log(`Encontradas: ${imagenesConId.length}`);
if (imagenesConId.length > 0) {
    console.log('\nPrimera coincidencia:');
    console.log(JSON.stringify(imagenesConId[0], null, 2));
}
