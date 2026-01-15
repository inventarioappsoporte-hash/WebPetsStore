const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

// Función para extraer medidas
function extraerMedidas(texto) {
  if (!texto) return null;
  const patrones = [
    /(\d+[,.]?\d*)\s*[*xX]\s*(\d+[,.]?\d*)\s*CM/gi,
    /T-?\d+\s*=?\s*(\d+[,.]?\d*)\s*CM/gi,
    /(\d+[,.]?\d*)\s*CM/gi,
    /(\d+[,.]?\d*)\s*M\b/gi
  ];
  
  const medidas = [];
  for (const patron of patrones) {
    let match;
    while ((match = patron.exec(texto)) !== null) {
      medidas.push(match[0]);
    }
  }
  return medidas.length > 0 ? medidas[0] : null;
}

// Función para limpiar nombre
function limpiarNombre(nombre) {
  return nombre
    .replace(/\s*\d+[,.]?\d*\s*[*xX]\s*\d+[,.]?\d*\s*CM\s*/gi, '')
    .replace(/\s*T-?\d+\s*/gi, ' ')
    .replace(/\s*-?\s*\d{4,5}\s*$/gi, '')
    .replace(/\s*P\d+X?\d*CM\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// Plantillas por tipo de accesorio
const plantillas = {
  rascador: {
    short: '🐱 Rascador para gatos. Ayuda a mantener las uñas sanas y protege tus muebles.',
    long: 'Rascador diseñado especialmente para gatos. Permite que tu felino afile sus uñas de forma natural, manteniendo sus garras sanas y protegiendo tus muebles. Material resistente y duradero. Estimula el ejercicio y reduce el estrés.'
  },
  collar: {
    short: '🐕 Collar para mascotas. Cómodo, resistente y con diseño atractivo.',
    long: 'Collar de alta calidad para tu mascota. Fabricado con materiales resistentes y cómodos. Diseño atractivo que combina estilo y funcionalidad. Ajustable para un calce perfecto.'
  },
  correa: {
    short: '🐕 Correa para paseos. Resistente y cómoda para ti y tu mascota.',
    long: 'Correa de paseo de alta calidad. Fabricada con materiales resistentes para soportar tirones. Mango ergonómico para mayor comodidad. Perfecta para paseos diarios con tu mascota.'
  },
  pechera: {
    short: '🐕 Pechera cómoda y segura. Distribuye la presión uniformemente.',
    long: 'Pechera diseñada para brindar comodidad y seguridad a tu mascota. Distribuye la presión uniformemente evitando molestias en el cuello. Ajustable y fácil de colocar. Ideal para paseos y entrenamiento.'
  },
  arnes: {
    short: '🐕 Arnés seguro y cómodo. Control total durante los paseos.',
    long: 'Arnés de alta calidad que brinda control y seguridad durante los paseos. Diseño ergonómico que distribuye la presión uniformemente. Ajustable para un calce perfecto. Material resistente y duradero.'
  },
  conjunto: {
    short: '🐕 Conjunto completo de collar y correa. Todo lo que necesitas para pasear.',
    long: 'Conjunto completo que incluye collar y correa a juego. Diseño coordinado y atractivo. Materiales de alta calidad, resistentes y duraderos. Perfecto para paseos diarios con tu mascota.'
  },
  cadena: {
    short: '🐕 Cadena resistente para paseos. Máxima durabilidad y seguridad.',
    long: 'Cadena de alta resistencia para paseos con tu mascota. Fabricada con materiales de primera calidad que garantizan durabilidad. Ideal para perros de todos los tamaños. Mango cómodo y seguro.'
  },
  cinturon: {
    short: '🚗 Cinturón de seguridad para mascotas. Viajes seguros en auto.',
    long: 'Cinturón de seguridad diseñado para proteger a tu mascota durante los viajes en auto. Fácil de instalar y ajustar. Compatible con la mayoría de los vehículos. Brinda tranquilidad en cada viaje.'
  },
  pretal: {
    short: '🐕 Pretal resistente para perros grandes. Máximo control y seguridad.',
    long: 'Pretal de alta resistencia diseñado para perros grandes y fuertes. Proporciona control total durante los paseos. Materiales reforzados para máxima durabilidad. Ajustable y cómodo.'
  },
  moño: {
    short: '🎀 Accesorio decorativo con moño. Dale estilo a tu mascota.',
    long: 'Accesorio decorativo con moño para tu mascota. Perfecto para ocasiones especiales o para lucir con estilo todos los días. Cómodo y fácil de colocar. Diseño encantador.'
  },
  general: {
    short: '🐕 Accesorio de calidad para tu mascota. Diseño funcional y duradero.',
    long: 'Accesorio de alta calidad diseñado para tu mascota. Materiales resistentes y duraderos. Diseño funcional que combina comodidad y estilo.'
  }
};

function identificarTipo(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('rascador') || n.includes('rasacador') || n.includes('agatar')) return 'rascador';
  if (n.includes('collar') && !n.includes('pechera')) return 'collar';
  if (n.includes('correa') || n.includes('tira')) return 'correa';
  if (n.includes('pechera')) return 'pechera';
  if (n.includes('arnes') || n.includes('arnés')) return 'arnes';
  if (n.includes('conjunto')) return 'conjunto';
  if (n.includes('cadena')) return 'cadena';
  if (n.includes('cinturon') || n.includes('cinturón')) return 'cinturon';
  if (n.includes('pretal')) return 'pretal';
  if (n.includes('moño') || n.includes('lazo')) return 'moño';
  return 'general';
}

let actualizados = 0;
const cambios = [];

products.forEach(p => {
  if (p.category !== 'accesorios') return;
  
  const nombreOriginal = p.name;
  const descOriginal = p.description;
  
  // Verificar si necesita mejora
  const necesitaMejora = 
    !p.description || 
    p.description === p.name ||
    p.description.length < 50 ||
    p.description.toUpperCase() === p.description;
  
  if (!necesitaMejora) return;
  
  // Extraer medidas y limpiar nombre
  const medidas = extraerMedidas(nombreOriginal);
  const nombreLimpio = limpiarNombre(nombreOriginal);
  
  // Generar descripción
  const tipo = identificarTipo(nombreOriginal);
  const plantilla = plantillas[tipo];
  
  // Actualizar
  p.name = nombreLimpio;
  p.description = plantilla.short;
  p.longDescription = plantilla.long;
  
  // Specs
  if (!p.specs) p.specs = {};
  if (medidas && !p.specs.dimensions) {
    p.specs.dimensions = medidas.replace(/CM/gi, ' cm');
  }
  if (!p.specs.material) {
    if (nombreOriginal.toLowerCase().includes('cuero')) p.specs.material = 'Cuero';
    else if (nombreOriginal.toLowerCase().includes('nylon') || nombreOriginal.toLowerCase().includes('lona')) p.specs.material = 'Nylon resistente';
    else if (nombreOriginal.toLowerCase().includes('cadena')) p.specs.material = 'Metal cromado';
    else if (nombreOriginal.toLowerCase().includes('soga')) p.specs.material = 'Soga resistente';
    else p.specs.material = 'Material resistente';
  }
  
  cambios.push({
    id: p.id,
    antes: { name: nombreOriginal, description: descOriginal?.substring(0, 50) },
    despues: { name: p.name, description: p.description.substring(0, 50) }
  });
  
  actualizados++;
});

fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf8');

console.log(`\n✅ Accesorios actualizados: ${actualizados}`);
console.log('\n📋 Ejemplos de cambios:\n');

cambios.slice(0, 8).forEach((c, i) => {
  console.log(`${i + 1}. [${c.id}]`);
  console.log(`   ANTES:   ${c.antes.name}`);
  console.log(`   DESPUÉS: ${c.despues.name}`);
  console.log('');
});

fs.writeFileSync('./log-cambios-accesorios.json', JSON.stringify(cambios, null, 2), 'utf8');
console.log('📄 Log guardado en: log-cambios-accesorios.json');
