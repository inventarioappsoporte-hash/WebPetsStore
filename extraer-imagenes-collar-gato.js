const fs = require('fs');
const path = require('path');

// Leer el backup
const backupPath = path.join(__dirname, '..', 'backupInventario', 'backup_owner_2026-01-13T16-26-46-405.json');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

// Buscar las imágenes de las variantes del producto 606
const imagenesVariantes = backup.imagenes.filter(img => 
    img.tipo === 'variante' && img.producto_id === 606
);

console.log('Imágenes encontradas para variantes del producto 606:');
console.log('Total:', imagenesVariantes.length);

imagenesVariantes.forEach(img => {
    console.log(`\nVariante ID: ${img.id}`);
    console.log(`Producto ID: ${img.producto_id}`);
    
    // Guardar la imagen
    if (img.data) {
        const outputDir = path.join(__dirname, 'assets', 'images', 'products', 'prod_606');
        const outputFile = path.join(outputDir, `variante_${img.id}.jpg`);
        
        // Decodificar base64 y guardar
        const imageBuffer = Buffer.from(img.data, 'base64');
        fs.writeFileSync(outputFile, imageBuffer);
        console.log(`Guardada: ${outputFile}`);
    }
});

console.log('\n✅ Extracción completada');
