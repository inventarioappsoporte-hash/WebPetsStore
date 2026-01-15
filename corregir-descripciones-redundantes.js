const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

let corregidos = 0;

products.forEach(p => {
  if (p.category !== 'juguetes') return;
  
  // Corregir descripciones redundantes
  if (p.description) {
    // "Pelota pelota" -> "Pelota"
    p.description = p.description.replace(/Pelota pelota/gi, 'Pelota');
    p.description = p.description.replace(/Juguete juguete/gi, 'Juguete');
    p.description = p.description.replace(/Mordillo mordillo/gi, 'Mordillo');
    
    // Quitar "para mascotas. Diversión garantizada para tu compañero peludo" si ya tiene otra descripción
    if (p.description.includes('para mascotas. Diversión garantizada')) {
      const nombreLimpio = p.name.toLowerCase();
      
      if (nombreLimpio.includes('gato') || nombreLimpio.includes('rata')) {
        p.description = `🐱 Juguete interactivo para gatos. Estimula el instinto de caza y mantiene a tu felino entretenido.`;
        p.longDescription = `Juguete interactivo diseñado especialmente para gatos. Estimula el instinto natural de caza y proporciona horas de entretenimiento. Perfecto para mantener a tu felino activo y feliz. Material seguro y duradero.`;
      }
    }
    corregidos++;
  }
  
  if (p.longDescription) {
    p.longDescription = p.longDescription.replace(/Pelota pelota/gi, 'Pelota');
    p.longDescription = p.longDescription.replace(/Juguete juguete/gi, 'Juguete');
    p.longDescription = p.longDescription.replace(/Mordillo mordillo/gi, 'Mordillo');
  }
});

fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf8');
console.log(`✅ Corregidas ${corregidos} descripciones redundantes`);

// Mostrar algunos ejemplos
const ejemplos = products.filter(p => p.category === 'juguetes').slice(0, 5);
console.log('\n📋 Ejemplos actuales:\n');
ejemplos.forEach(p => {
  console.log(`[${p.id}] ${p.name}`);
  console.log(`  Desc: ${p.description}`);
  console.log('');
});
