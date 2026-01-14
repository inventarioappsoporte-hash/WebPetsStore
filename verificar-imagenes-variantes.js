const fs = require('fs');
const path = require('path');

const BACKUP_PATH = path.join(__dirname, '../backupInventario/backup_owner_2026-01-13T16-26-46-405.json');

console.log('🔍 Verificando imágenes para productos con variantes\n');

const backup = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
console.log(`📸 Total imágenes en backup: ${backup.imagenes.length}`);

const prodImages = backup.imagenes.filter(i => i.tipo === 'producto');
console.log(`📦 Imágenes de productos: ${prodImages.length}\n`);

const ids = [106, 145];

ids.forEach(id => {
    const img = prodImages.find(i => i.objeto_id === id);
    console.log(`Producto ${id}:`);
    if (img) {
        console.log('  ✅ SÍ tiene imagen');
        console.log(`  - ID: ${img.id}`);
        console.log(`  - Nombre: ${img.nombre_archivo || 'N/A'}`);
        console.log(`  - Tiene data: ${img.data ? 'Sí' : 'No'}`);
        if (img.data) {
            console.log(`  - Tamaño data: ${img.data.length} caracteres`);
        }
    } else {
        console.log('  ❌ NO tiene imagen en backup');
    }
    console.log('');
});

// Buscar imágenes de categorías similares
console.log('\n📂 Buscando imágenes de categorías similares:');
console.log('Categoría 250 (Higiene):');
const higiene = prodImages.filter(i => {
    const prod = backup.productos?.find(p => p.id === i.objeto_id);
    return prod && prod.categoria_id === 250;
});
console.log(`  Encontradas: ${higiene.length} imágenes`);

console.log('Categoría 261 (Colchonetas):');
const colchonetas = prodImages.filter(i => {
    const prod = backup.productos?.find(p => p.id === i.objeto_id);
    return prod && prod.categoria_id === 261;
});
console.log(`  Encontradas: ${colchonetas.length} imágenes`);
