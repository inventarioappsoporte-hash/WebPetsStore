const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, '..', 'backupInventario', 'backup_owner_2026-01-13T16-26-46-405.json');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

console.log('📋 ESTRUCTURA REAL DEL BACKUP\n');

console.log('Claves principales del backup:');
console.log(Object.keys(backup));
console.log('');

if (backup.imagenes && Array.isArray(backup.imagenes)) {
    console.log(`Total de imágenes: ${backup.imagenes.length}`);
    console.log('\nPrimera imagen (primeras 500 caracteres):');
    const primeraImagen = JSON.stringify(backup.imagenes[0]).substring(0, 500);
    console.log(primeraImagen);
    console.log('...\n');
    
    console.log('Tipo de dato de la primera imagen:');
    console.log(typeof backup.imagenes[0]);
    console.log('');
    
    if (typeof backup.imagenes[0] === 'string') {
        console.log('✅ Las imágenes son strings en base64 directo');
        console.log('Longitud del string: ' + backup.imagenes[0].length);
    } else if (typeof backup.imagenes[0] === 'object') {
        console.log('✅ Las imágenes son objetos');
        console.log('Propiedades:');
        console.log(Object.keys(backup.imagenes[0]));
    }
}

// Buscar si hay otra estructura
console.log('\n\nBuscando otras estructuras en el backup...\n');
for (const key in backup) {
    if (key !== 'imagenes') {
        console.log(`Clave: ${key}`);
        console.log(`Tipo: ${typeof backup[key]}`);
        if (Array.isArray(backup[key])) {
            console.log(`Es array con ${backup[key].length} elementos`);
        }
        console.log('');
    }
}
