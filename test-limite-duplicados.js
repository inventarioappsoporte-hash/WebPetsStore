// Test para verificar el comportamiento del límite con duplicados

console.log('🧪 TEST: Comportamiento del límite con duplicados\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Simular productos existentes
const productosExistentes = [
    { id: 'prod_223', name: 'COCODRILO - AGATAR' },
    { id: 'prod_230', name: 'ELEFANTE MINI - AGATAR' },
    { id: 'prod_231', name: 'Gorila Mini - AGATAR' },
    { id: 'prod_232', name: 'CHANCHITO - AGATAR' }
];

// Simular productos consultados de SQLite (10 productos)
const productosConsultados = [
    { id: 223, nombre: 'COCODRILO - AGATAR' },  // DUPLICADO
    { id: 230, nombre: 'ELEFANTE MINI - AGATAR' },  // DUPLICADO
    { id: 231, nombre: 'Gorila Mini - AGATAR' },  // DUPLICADO
    { id: 232, nombre: 'CHANCHITO - AGATAR' },  // DUPLICADO
    { id: 233, nombre: 'PRODUCTO NUEVO 1' },  // NUEVO
    { id: 234, nombre: 'PRODUCTO NUEVO 2' },  // NUEVO
    { id: 235, nombre: 'PRODUCTO NUEVO 3' },  // NUEVO
    { id: 236, nombre: 'PRODUCTO NUEVO 4' },  // NUEVO
    { id: 237, nombre: 'PRODUCTO NUEVO 5' },  // NUEVO
    { id: 238, nombre: 'PRODUCTO NUEVO 6' }   // NUEVO
];

const limite = 10;

console.log(`📊 Configuración:`);
console.log(`   Límite solicitado: ${limite} productos`);
console.log(`   Productos existentes: ${productosExistentes.length}`);
console.log(`   Productos consultados: ${productosConsultados.length}\n`);

console.log('═══════════════════════════════════════════════════════════\n');
console.log('❌ COMPORTAMIENTO ACTUAL (INCORRECTO):\n');

let nuevosActual = 0;
let duplicadosActual = 0;

productosConsultados.forEach((producto, index) => {
    const productoId = `prod_${producto.id}`;
    const yaExiste = productosExistentes.some(p => p.id === productoId);
    
    if (yaExiste) {
        console.log(`${index + 1}. ${producto.nombre} → ❌ DUPLICADO`);
        duplicadosActual++;
    } else {
        console.log(`${index + 1}. ${producto.nombre} → ✅ NUEVO`);
        nuevosActual++;
    }
});

console.log(`\n📊 Resultado:`);
console.log(`   Productos nuevos agregados: ${nuevosActual}`);
console.log(`   Productos duplicados omitidos: ${duplicadosActual}`);
console.log(`   ⚠️  PROBLEMA: Solo se agregaron ${nuevosActual} productos en lugar de ${limite}\n`);

console.log('═══════════════════════════════════════════════════════════\n');
console.log('✅ COMPORTAMIENTO ESPERADO (CORRECTO):\n');

let nuevosEsperado = 0;
let duplicadosEsperado = 0;
let productosConsultadosEsperado = 0;

// Simular consulta con límite x3
const limiteConsulta = limite * 3;
console.log(`   Se consultarán hasta ${limiteConsulta} productos para alcanzar ${limite} nuevos\n`);

for (let i = 0; i < productosConsultados.length; i++) {
    // Si ya alcanzamos el límite de productos nuevos, detenemos
    if (nuevosEsperado >= limite) {
        console.log(`\n⚠️  Se alcanzó el límite de ${limite} productos nuevos.`);
        console.log(`   Se consultaron ${productosConsultadosEsperado} productos en total.\n`);
        break;
    }

    const producto = productosConsultados[i];
    const productoId = `prod_${producto.id}`;
    const yaExiste = productosExistentes.some(p => p.id === productoId);
    
    productosConsultadosEsperado++;
    
    if (yaExiste) {
        console.log(`${i + 1}. ${producto.nombre} → ❌ DUPLICADO (no cuenta para el límite)`);
        duplicadosEsperado++;
    } else {
        console.log(`${i + 1}. ${producto.nombre} → ✅ NUEVO (${nuevosEsperado + 1}/${limite})`);
        nuevosEsperado++;
    }
}

console.log(`\n📊 Resultado:`);
console.log(`   Productos nuevos agregados: ${nuevosEsperado}`);
console.log(`   Productos duplicados omitidos: ${duplicadosEsperado}`);
console.log(`   Productos consultados en total: ${productosConsultadosEsperado}`);
console.log(`   ✅ CORRECTO: Se agregaron exactamente ${limite} productos nuevos\n`);

console.log('═══════════════════════════════════════════════════════════\n');
console.log('💡 SOLUCIÓN:\n');
console.log('1. Consultar más productos de los necesarios (límite × 3)');
console.log('2. Filtrar duplicados durante el procesamiento');
console.log('3. Detener cuando se alcance el límite de productos NUEVOS');
console.log('4. Los duplicados NO cuentan para el límite\n');
