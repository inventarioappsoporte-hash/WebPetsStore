const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

function generarDescripcion(nombre) {
  const n = nombre.toLowerCase();
  
  // Moisés Iglú
  if (n.includes('iglu') || n.includes('iglú')) {
    return {
      short: '🏠 Moisés tipo iglú para mascotas. Refugio cálido y acogedor.',
      long: 'Moisés con diseño tipo iglú que brinda a tu mascota un refugio cálido y protegido. Interior suave y acolchado para máximo confort. Ideal para gatos y perros pequeños que buscan un espacio cerrado y seguro. Fácil de limpiar.'
    };
  }
  
  // Moisés Túnel
  if (n.includes('tunel') || n.includes('túnel')) {
    return {
      short: '🏠 Moisés tipo túnel. Espacio cerrado y protegido para tu mascota.',
      long: 'Moisés con diseño tipo túnel que ofrece un espacio cerrado y protegido. Tu mascota se sentirá segura y abrigada. Interior suave y cómodo. Perfecto para gatos y perros pequeños que disfrutan de espacios acogedores.'
    };
  }
  
  // Moisés Nido
  if (n.includes('nido')) {
    return {
      short: '🛏️ Moisés tipo nido. Bordes elevados que abrazan a tu mascota.',
      long: 'Moisés con diseño tipo nido y bordes elevados que brindan sensación de protección y contención. Tu mascota puede apoyar la cabeza en los bordes acolchados. Interior suave y mullido. Ideal para mascotas que les gusta sentirse abrazadas.'
    };
  }
  
  // Moisés con moño/decorativo
  if (n.includes('moño') || n.includes('lunares') || n.includes('premiun') || n.includes('premium')) {
    return {
      short: '🛏️ Moisés premium para mascotas. Diseño elegante y máximo confort.',
      long: 'Moisés de línea premium con diseño elegante y materiales de alta calidad. Bordes elevados y acolchados para mayor comodidad. Interior suave que brinda el descanso que tu mascota merece. Fácil de limpiar y mantener.'
    };
  }
  
  // Moisés económico/general
  if (n.includes('moises')) {
    return {
      short: '🛏️ Moisés cómodo para mascotas. Descanso acogedor garantizado.',
      long: 'Moisés diseñado para brindar comodidad y descanso a tu mascota. Bordes elevados que proporcionan sensación de seguridad. Interior suave y acolchado. Ideal para perros y gatos de todos los tamaños.'
    };
  }
  
  // Colchón Living
  if (n.includes('living')) {
    return {
      short: '🛏️ Colchón línea Living. Diseño moderno para tu hogar.',
      long: 'Colchón de la línea Living con diseño moderno que combina con cualquier ambiente. Materiales de alta calidad que brindan confort y durabilidad. Bordes acolchados para que tu mascota apoye la cabeza. Fácil de limpiar.'
    };
  }
  
  // Colchón Fantasía/Espuma
  if (n.includes('fantasia') || n.includes('espuma')) {
    return {
      short: '🛏️ Colchón de espuma para mascotas. Soporte óptimo y comodidad.',
      long: 'Colchón con relleno de espuma que brinda soporte óptimo para el descanso de tu mascota. Superficie suave y acolchada. Ideal para mascotas de todas las edades, especialmente las que necesitan mayor soporte articular.'
    };
  }
  
  // Colchoneta Plush
  if (n.includes('plush')) {
    return {
      short: '🛏️ Colchoneta Plush ultra suave. Máxima comodidad para tu mascota.',
      long: 'Colchoneta con acabado Plush ultra suave al tacto. Brinda una superficie mullida y acogedora para el descanso. Material de alta calidad que mantiene su suavidad con el uso. Fácil de limpiar.'
    };
  }
  
  // Colchoneta Anti-desgarro
  if (n.includes('anti-desgarro') || n.includes('antidesgarro')) {
    return {
      short: '🛏️ Colchoneta anti-desgarro. Resistente para mascotas activas.',
      long: 'Colchoneta fabricada con material anti-desgarro especialmente diseñada para mascotas activas o que muerden. Extremadamente resistente y duradera. Interior cómodo y acolchado. Ideal para perros juguetones.'
    };
  }
  
  // Colchoneta Corderito/Polar
  if (n.includes('corderito') || n.includes('polar')) {
    return {
      short: '🛏️ Colchoneta de polar suave. Calidez y confort en invierno.',
      long: 'Colchoneta con acabado tipo corderito/polar que brinda calidez extra en días fríos. Superficie ultra suave y acogedora. Perfecta para mantener a tu mascota abrigada y cómoda durante el invierno.'
    };
  }
  
  // Puff
  if (n.includes('puff')) {
    return {
      short: '🛏️ Puff para mascotas. Diseño moderno y súper cómodo.',
      long: 'Puff con diseño moderno y relleno mullido que se adapta al cuerpo de tu mascota. Brinda una superficie cómoda y acogedora para el descanso. Ideal para gatos y perros que buscan un lugar suave donde acurrucarse.'
    };
  }
  
  // Almohadón
  if (n.includes('almohadon') || n.includes('almohadón')) {
    return {
      short: '🛏️ Almohadón para mascotas. Suave y mullido para el descanso.',
      long: 'Almohadón suave y mullido diseñado para el descanso de tu mascota. Relleno que mantiene su forma con el uso. Funda fácil de limpiar. Ideal como cama principal o complemento en cualquier espacio.'
    };
  }
  
  // Colchoneta Maletín/Móvil
  if (n.includes('maletin') || n.includes('movil') || n.includes('móvil')) {
    return {
      short: '🛏️ Colchoneta portátil tipo maletín. Ideal para viajes.',
      long: 'Colchoneta portátil que se pliega como maletín para fácil transporte. Perfecta para viajes, visitas o paseos. Tu mascota tendrá su lugar de descanso familiar donde sea que vayan. Liviana y práctica.'
    };
  }
  
  // Soft Jean
  if (n.includes('soft') || n.includes('jean')) {
    return {
      short: '🛏️ Colchoneta Soft con diseño moderno. Comodidad y estilo.',
      long: 'Colchoneta con acabado Soft y diseño moderno que combina comodidad y estilo. Material suave al tacto y resistente al uso diario. Perfecta para mascotas que merecen lo mejor.'
    };
  }
  
  // Colchoneta doble lona
  if (n.includes('doble') || n.includes('lona')) {
    return {
      short: '🛏️ Colchoneta doble faz resistente. Durabilidad garantizada.',
      long: 'Colchoneta con construcción doble faz de alta resistencia. Material duradero que soporta el uso intensivo. Interior acolchado para máximo confort. Ideal para mascotas activas.'
    };
  }
  
  // Colchoneta/Colchón general
  if (n.includes('colchon') || n.includes('colchoneta')) {
    return {
      short: '🛏️ Colchoneta cómoda para mascotas. Descanso de calidad.',
      long: 'Colchoneta de alta calidad diseñada para el descanso de tu mascota. Relleno suave y acolchado que brinda confort. Fácil de limpiar y mantener. Disponible en varios tamaños.'
    };
  }
  
  return null;
}

let actualizados = 0;
const cambios = [];

products.forEach(p => {
  const n = p.name.toLowerCase();
  
  // Solo procesar colchonetas y moisés
  if (!n.includes('colchon') && !n.includes('moises') && !n.includes('almohadon') && 
      !n.includes('puff') && !n.includes('nido') && p.subcategory !== 'Colchonetas') {
    return;
  }
  
  // Saltar si ya tiene buena descripción (no empieza con medidas)
  if (p.description && !p.description.startsWith('Talle') && 
      !p.description.startsWith('N°') && !p.description.startsWith('Medidas') &&
      p.description.length > 60) {
    return;
  }
  
  const desc = generarDescripcion(p.name);
  if (!desc) return;
  
  const descAnterior = p.description;
  p.description = desc.short;
  p.longDescription = desc.long;
  
  cambios.push({
    id: p.id,
    name: p.name,
    antes: descAnterior?.substring(0, 40),
    despues: p.description
  });
  
  actualizados++;
});

fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf8');

console.log(`\n✅ Colchonetas/Moisés actualizados: ${actualizados}`);
console.log('\n📋 Cambios realizados:\n');

cambios.forEach((c, i) => {
  console.log(`${i + 1}. [${c.id}] ${c.name}`);
  console.log(`   Antes: ${c.antes}...`);
  console.log(`   Ahora: ${c.despues}`);
  console.log('');
});
