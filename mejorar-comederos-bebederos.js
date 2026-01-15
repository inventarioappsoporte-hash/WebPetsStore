const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

// Función para generar descripción basada en el nombre
function generarDescripcion(nombre) {
  const n = nombre.toLowerCase();
  
  // Comedero come lento / anti-voracidad
  if (n.includes('come lento') || n.includes('lento') || n.includes('regu-diet')) {
    return {
      short: '🍽️ Comedero come lento. Ayuda a controlar la velocidad de alimentación de tu mascota.',
      long: 'Comedero diseñado para ralentizar la alimentación de tu mascota. Evita la ingesta rápida que puede causar problemas digestivos. Ideal para perros y gatos que comen muy rápido. Base antideslizante para mayor estabilidad.'
    };
  }
  
  // Cazuela
  if (n.includes('cazuela')) {
    const tamaño = n.includes('chica') ? 'chica' : n.includes('mediana') ? 'mediana' : n.includes('grande') ? 'grande' : '';
    return {
      short: `🍽️ Cazuela ${tamaño} para mascotas. Diseño clásico y resistente.`,
      long: `Cazuela ${tamaño} de alta calidad para tu mascota. Diseño clásico que facilita el acceso al alimento. Material resistente y fácil de limpiar. Base estable para evitar derrames.`
    };
  }
  
  // Comedero doble
  if (n.includes('doble')) {
    return {
      short: '🍽️ Comedero doble para comida y agua. Práctico y funcional.',
      long: 'Comedero doble que permite servir comida y agua en un solo accesorio. Diseño práctico que ahorra espacio. Material resistente y fácil de limpiar. Ideal para perros y gatos.'
    };
  }
  
  // Bebedero automático
  if (n.includes('bebedero') && (n.includes('automatico') || n.includes('autamatico'))) {
    return {
      short: '💧 Bebedero automático. Agua fresca disponible todo el día.',
      long: 'Bebedero automático que mantiene el agua fresca y disponible para tu mascota durante todo el día. Sistema de dispensado que regula el nivel de agua. Fácil de rellenar y limpiar.'
    };
  }
  
  // Bebedero con tornillo/soporte (para jaulas)
  if (n.includes('bebedero') && (n.includes('tornillo') || n.includes('soporte') || n.includes('hamster') || n.includes('jaula'))) {
    return {
      short: '💧 Bebedero para jaula. Fácil instalación y uso.',
      long: 'Bebedero diseñado para instalarse en jaulas de roedores, conejos o aves. Sistema de goteo que mantiene el agua limpia. Fácil de instalar y rellenar. Material resistente y duradero.'
    };
  }
  
  // Bebedero general
  if (n.includes('bebedero')) {
    return {
      short: '💧 Bebedero para mascotas. Mantiene el agua fresca y accesible.',
      long: 'Bebedero de calidad para tu mascota. Diseño que mantiene el agua fresca y limpia. Fácil de limpiar y rellenar. Material resistente y duradero.'
    };
  }
  
  // Dispenser
  if (n.includes('dispenser')) {
    return {
      short: '💧 Dispenser de agua para mascotas. Gran capacidad y autonomía.',
      long: 'Dispenser de agua de gran capacidad para tu mascota. Ideal para cuando no estás en casa. Sistema de dispensado automático que mantiene el agua siempre disponible. Fácil de rellenar y limpiar.'
    };
  }
  
  // Comedero melamina
  if (n.includes('melamina')) {
    return {
      short: '🍽️ Comedero de melamina con diseño estampado. Resistente y decorativo.',
      long: 'Comedero de melamina con atractivo diseño estampado. Material resistente, liviano y fácil de limpiar. Ideal para perros y gatos. Combina funcionalidad con estilo.'
    };
  }
  
  // Comedero acero inoxidable
  if (n.includes('acero') || n.includes('inoxidable')) {
    return {
      short: '🍽️ Comedero de acero inoxidable. Higiénico y duradero.',
      long: 'Comedero de acero inoxidable de alta calidad. Material higiénico que no retiene olores ni bacterias. Fácil de limpiar y muy duradero. Base antideslizante para mayor estabilidad.'
    };
  }
  
  // Comedero cerámica
  if (n.includes('ceramica') || n.includes('cerámica')) {
    return {
      short: '🍽️ Comedero de cerámica. Elegante y estable.',
      long: 'Comedero de cerámica de alta calidad. Su peso proporciona estabilidad evitando que se mueva mientras tu mascota come. Diseño elegante y fácil de limpiar. Ideal para gatos y perros pequeños.'
    };
  }
  
  // Comedero plástico
  if (n.includes('plastico') || n.includes('plástico')) {
    return {
      short: '🍽️ Comedero de plástico resistente. Liviano y práctico.',
      long: 'Comedero de plástico de alta resistencia. Material liviano, duradero y fácil de limpiar. Base antideslizante para mayor estabilidad. Ideal para uso diario.'
    };
  }
  
  // Plato / Tazón
  if (n.includes('plato') || n.includes('tazon')) {
    const animal = n.includes('gato') ? 'gatos' : n.includes('perro') ? 'perros' : 'mascotas';
    return {
      short: `🍽️ Plato para ${animal}. Diseño cómodo para la alimentación.`,
      long: `Plato diseñado especialmente para ${animal}. Altura y forma ideales para una alimentación cómoda. Material resistente y fácil de limpiar. Base estable.`
    };
  }
  
  // Comedero tolva (gravedad)
  if (n.includes('tolva')) {
    return {
      short: '🍽️ Comedero tipo tolva. Alimentación automática por gravedad.',
      long: 'Comedero tipo tolva con sistema de alimentación por gravedad. Mantiene el alimento disponible automáticamente. Ideal para cuando no estás en casa. Gran capacidad de almacenamiento.'
    };
  }
  
  // Comedero altura regulable
  if (n.includes('altura') || n.includes('regulable') || n.includes('elevado')) {
    return {
      short: '🍽️ Comedero de altura regulable. Mejor postura al comer.',
      long: 'Comedero con altura regulable que mejora la postura de tu mascota al comer. Reduce el esfuerzo en cuello y articulaciones. Ideal para perros grandes o mascotas con problemas de movilidad.'
    };
  }
  
  // Comedero triangular
  if (n.includes('triangular')) {
    return {
      short: '🍽️ Comedero triangular. Diseño que aprovecha las esquinas.',
      long: 'Comedero con diseño triangular ideal para colocar en esquinas. Aprovecha mejor el espacio disponible. Material resistente y fácil de limpiar.'
    };
  }
  
  // Comedero redondo con huella
  if (n.includes('huella') || n.includes('redondo')) {
    return {
      short: '🍽️ Comedero con diseño de huella. Estilo y funcionalidad.',
      long: 'Comedero con atractivo diseño de huella de mascota. Combina estilo y funcionalidad. Material resistente y fácil de limpiar. Base estable para evitar derrames.'
    };
  }
  
  // Default para comederos
  if (n.includes('comedero')) {
    return {
      short: '🍽️ Comedero para mascotas. Diseño práctico y resistente.',
      long: 'Comedero de calidad para tu mascota. Material resistente y fácil de limpiar. Diseño que facilita el acceso al alimento. Base estable para evitar derrames.'
    };
  }
  
  // Default general
  return {
    short: '🍽️ Accesorio de alimentación para mascotas. Calidad garantizada.',
    long: 'Accesorio de alimentación de alta calidad para tu mascota. Material resistente y duradero. Fácil de limpiar y mantener.'
  };
}

let actualizados = 0;
const cambios = [];

products.forEach(p => {
  const n = p.name.toLowerCase();
  
  // Solo procesar comederos y bebederos
  if (!n.includes('comedero') && !n.includes('bebedero') && !n.includes('plato') && 
      !n.includes('tazon') && !n.includes('cazuela') && !n.includes('dispenser')) {
    return;
  }
  
  const descAnterior = p.description;
  const desc = generarDescripcion(p.name);
  
  p.description = desc.short;
  p.longDescription = desc.long;
  
  cambios.push({
    id: p.id,
    name: p.name,
    antes: descAnterior?.substring(0, 50),
    despues: p.description
  });
  
  actualizados++;
});

fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2), 'utf8');

console.log(`\n✅ Comederos/Bebederos actualizados: ${actualizados}`);
console.log('\n📋 Ejemplos de cambios:\n');

cambios.slice(0, 15).forEach((c, i) => {
  console.log(`${i + 1}. [${c.id}] ${c.name}`);
  console.log(`   Nueva desc: ${c.despues}`);
  console.log('');
});

fs.writeFileSync('./log-cambios-comederos.json', JSON.stringify(cambios, null, 2), 'utf8');
