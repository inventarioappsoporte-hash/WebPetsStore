const fs = require('fs');

// Leer productos
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

// Función para extraer medidas del texto
function extraerMedidas(texto) {
  const medidas = [];
  
  // Patrones de medidas: 14,5*8CM, 12X6CM, ANCHO 15CM, etc.
  const patrones = [
    /(\d+[,.]?\d*)\s*[*xX]\s*(\d+[,.]?\d*)\s*CM/gi,
    /ANCHO\s*(\d+[,.]?\d*)\s*CM/gi,
    /ALTO\s*(\d+[,.]?\d*)\s*CM/gi,
    /(\d+[,.]?\d*)\s*CM/gi,
    /(\d+[,.]?\d*)\s*M\b/gi
  ];
  
  let match;
  for (const patron of patrones) {
    while ((match = patron.exec(texto)) !== null) {
      medidas.push(match[0]);
    }
  }
  
  return medidas.length > 0 ? medidas.join(' / ') : null;
}

// Función para limpiar nombre
function limpiarNombre(nombre) {
  return nombre
    .replace(/\s*\d+[,.]?\d*\s*[*xX]\s*\d+[,.]?\d*\s*CM\s*/gi, '')
    .replace(/\s*ANCHO\s*\d+[,.]?\d*\s*CM\s*/gi, '')
    .replace(/\s*ALTO\s*\d+[,.]?\d*\s*CM\s*/gi, '')
    .replace(/\s*-?\s*\d{4,5}\s*\)?$/gi, '') // SKU al final
    .replace(/\s*\(\s*\d+\s*CM\s*\)\s*/gi, '')
    .replace(/\s*\d+\s*CM\s*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// Plantillas de descripción por tipo de juguete
function generarDescripcion(nombre, tipo) {
  const plantillas = {
    chifle: {
      short: `🐕 Juguete con sonido chifle en forma de ${tipo}. Perfecto para juegos de morder y estimular a tu mascota.`,
      long: `Divertido juguete con sonido chifle en forma de ${tipo} para perros. El sonido estimula el instinto de juego y mantiene a tu mascota entretenida por horas. Fabricado con material resistente a mordidas y seguro. Ideal para perros de todos los tamaños.`
    },
    pelota: {
      short: `🎾 Pelota ${tipo} para perros. Ideal para juegos de buscar y morder.`,
      long: `Pelota ${tipo} diseñada para horas de diversión con tu mascota. Perfecta para juegos de buscar, lanzar y morder. Material resistente y duradero que soporta el juego intenso. Estimula el ejercicio y la actividad física de tu perro.`
    },
    pelotaLuz: {
      short: `🎾 Pelota ${tipo} con luz LED. Perfecta para juegos diurnos y nocturnos.`,
      long: `Pelota ${tipo} con luz LED incorporada que se activa al rebotar. Ideal para juegos tanto de día como de noche. Estimula la curiosidad y el instinto de caza de tu mascota. Material resistente y seguro.`
    },
    mordillo: {
      short: `🦴 Mordillo ${tipo} para perros. Ayuda a la salud dental y alivia el estrés.`,
      long: `Mordillo ${tipo} diseñado para satisfacer el instinto natural de morder de tu perro. Ayuda a mantener los dientes limpios y las encías sanas. Alivia el estrés y la ansiedad. Material resistente y duradero.`
    },
    hueso: {
      short: `🦴 Juguete en forma de hueso ${tipo}. Resistente y duradero para horas de diversión.`,
      long: `Juguete en forma de hueso ${tipo} para perros. Diseñado para satisfacer el instinto natural de morder. Material resistente que soporta mordidas intensas. Perfecto para mantener a tu mascota entretenida y activa.`
    },
    goma: {
      short: `🐕 Juguete de goma ${tipo}. Resistente a mordidas y perfecto para juegos interactivos.`,
      long: `Juguete de goma ${tipo} de alta resistencia para perros. Material flexible y duradero que soporta mordidas intensas. Ideal para juegos de buscar y morder. Seguro y no tóxico para tu mascota.`
    },
    latex: {
      short: `🐕 Juguete de látex ${tipo} con sonido. Suave y seguro para tu mascota.`,
      long: `Juguete de látex ${tipo} con sonido incorporado. Material suave y flexible, ideal para perros que les gusta morder. El sonido estimula el juego y mantiene a tu mascota entretenida. Seguro y no tóxico.`
    },
    general: {
      short: `🐕 Juguete ${tipo} para mascotas. Diversión garantizada para tu compañero peludo.`,
      long: `Juguete ${tipo} diseñado para brindar horas de entretenimiento a tu mascota. Material resistente y seguro. Estimula el juego activo y ayuda a mantener a tu perro feliz y saludable.`
    }
  };
  
  const nombreLower = nombre.toLowerCase();
  
  if (nombreLower.includes('chifle')) return plantillas.chifle;
  if (nombreLower.includes('pelota') && nombreLower.includes('luz')) return plantillas.pelotaLuz;
  if (nombreLower.includes('pelota')) return plantillas.pelota;
  if (nombreLower.includes('mordillo')) return plantillas.mordillo;
  if (nombreLower.includes('hueso')) return plantillas.hueso;
  if (nombreLower.includes('goma') || nombreLower.includes('arandela') || nombreLower.includes('mancuerna')) return plantillas.goma;
  if (nombreLower.includes('latex')) return plantillas.latex;
  
  return plantillas.general;
}

// Función para identificar el tipo de juguete
function identificarTipo(nombre) {
  const nombreLower = nombre.toLowerCase();
  
  // Formas de comida
  if (nombreLower.includes('bife')) return 'bife';
  if (nombreLower.includes('hamburguesa') || nombreLower.includes('paty')) return 'hamburguesa';
  if (nombreLower.includes('pancho')) return 'pancho';
  if (nombreLower.includes('pollo') || nombreLower.includes('gallina')) return 'pollo';
  if (nombreLower.includes('costilla')) return 'costilla';
  if (nombreLower.includes('hueso')) return 'hueso';
  if (nombreLower.includes('helado') || nombreLower.includes('paleta')) return 'helado';
  if (nombreLower.includes('dona') || nombreLower.includes('rosquilla')) return 'dona';
  if (nombreLower.includes('muffin') || nombreLower.includes('cupcake') || nombreLower.includes('magdalena')) return 'muffin';
  if (nombreLower.includes('galletita')) return 'galletita';
  if (nombreLower.includes('papas')) return 'papas fritas';
  if (nombreLower.includes('zanahoria') || nombreLower.includes('zanaoria')) return 'zanahoria';
  if (nombreLower.includes('sandia')) return 'sandía';
  if (nombreLower.includes('mazorca') || nombreLower.includes('choclo')) return 'choclo';
  
  // Animales
  if (nombreLower.includes('cocodrilo')) return 'cocodrilo';
  if (nombreLower.includes('dinosaurio')) return 'dinosaurio';
  if (nombreLower.includes('cerdo') || nombreLower.includes('chancho')) return 'cerdo';
  if (nombreLower.includes('pato')) return 'pato';
  if (nombreLower.includes('foca')) return 'foca';
  if (nombreLower.includes('cangrejo')) return 'cangrejo';
  if (nombreLower.includes('pulpo')) return 'pulpo';
  if (nombreLower.includes('perro') || nombreLower.includes('perrito')) return 'perrito';
  if (nombreLower.includes('vaquita')) return 'vaquita';
  if (nombreLower.includes('erizo') || nombreLower.includes('cuerpo espin')) return 'erizo';
  
  // Objetos
  if (nombreLower.includes('pelota')) return 'pelota';
  if (nombreLower.includes('estrella')) return 'estrella';
  if (nombreLower.includes('corazon')) return 'corazón';
  if (nombreLower.includes('atomo')) return 'átomo';
  if (nombreLower.includes('pesa') || nombreLower.includes('mancuerna')) return 'pesa';
  if (nombreLower.includes('arandela')) return 'arandela';
  if (nombreLower.includes('mordillo')) return 'mordillo';
  if (nombreLower.includes('taco')) return 'taco';
  if (nombreLower.includes('ojota') || nombreLower.includes('pantufla')) return 'calzado';
  if (nombreLower.includes('bowling')) return 'palo de bowling';
  if (nombreLower.includes('botella')) return 'botella';
  
  return nombre.toLowerCase();
}

// Procesar juguetes
let actualizados = 0;
const cambios = [];

products.forEach((p, index) => {
  if (p.category !== 'juguetes') return;
  
  const nombreOriginal = p.name;
  const descOriginal = p.description;
  
  // Verificar si necesita mejora
  const necesitaMejora = 
    !p.description || 
    p.description === p.name ||
    p.description.length < 50 ||
    p.description.toUpperCase() === p.description;
  
  if (!necesitaMejora) return;
  
  // Extraer medidas
  const medidas = extraerMedidas(nombreOriginal) || extraerMedidas(descOriginal);
  
  // Limpiar nombre
  const nombreLimpio = limpiarNombre(nombreOriginal);
  
  // Identificar tipo y generar descripción
  const tipo = identificarTipo(nombreOriginal);
  const plantilla = generarDescripcion(nombreOriginal, tipo);
  
  // Actualizar producto
  p.name = nombreLimpio;
  p.description = plantilla.short;
  p.longDescription = plantilla.long;
  
  // Actualizar specs
  if (!p.specs) p.specs = {};
  if (medidas && !p.specs.dimensions) {
    p.specs.dimensions = medidas.replace(/\s*\/\s*/g, ' x ').replace(/CM/gi, 'cm');
  }
  if (!p.specs.material) {
    if (nombreOriginal.toLowerCase().includes('goma')) p.specs.material = 'Goma resistente';
    else if (nombreOriginal.toLowerCase().includes('latex')) p.specs.material = 'Látex suave';
    else if (nombreOriginal.toLowerCase().includes('chifle')) p.specs.material = 'Vinilo con chifle';
    else if (nombreOriginal.toLowerCase().includes('tela')) p.specs.material = 'Tela resistente';
    else p.specs.material = 'Material resistente';
  }
  if (!p.specs.idealFor) p.specs.idealFor = 'Perros de todos los tamaños';
  
  // Limpiar tags (quitar medidas)
  if (p.tags) {
    p.tags = p.tags.filter(t => !/^\d+[,.]?\d*[*xX]?\d*[,.]?\d*\s*cm$/i.test(t) && !/^\d{4,5}$/.test(t));
  }
  
  cambios.push({
    id: p.id,
    antes: { name: nombreOriginal, description: descOriginal },
    despues: { name: p.name, description: p.description }
  });
  
  actualizados++;
});

// Guardar cambios
fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf8');

console.log(`\n✅ Juguetes actualizados: ${actualizados}`);
console.log('\n📋 Ejemplos de cambios:\n');

cambios.slice(0, 10).forEach((c, i) => {
  console.log(`${i + 1}. [${c.id}]`);
  console.log(`   ANTES:   ${c.antes.name}`);
  console.log(`   DESPUÉS: ${c.despues.name}`);
  console.log(`   DESC:    ${c.despues.description.substring(0, 70)}...`);
  console.log('');
});

// Guardar log de cambios
fs.writeFileSync('./log-cambios-juguetes.json', JSON.stringify(cambios, null, 2), 'utf8');
console.log('📄 Log completo guardado en: log-cambios-juguetes.json');
