// Test de Lógica de Descuentos - Selección del Mayor
console.log('🧪 TEST DE LÓGICA DE DESCUENTOS');
console.log('================================');
console.log('Regla: Los descuentos NO son acumulables');
console.log('Regla: Siempre se toma el MAYOR descuento aplicable\n');

// Producto de prueba
const producto = {
    id: 181,
    nombre: "RASCADOR TABLA CARTON Y ALFOMBRA",
    precio: 9000,
    categoria_id: 263
};

console.log('📦 PRODUCTO DE PRUEBA:');
console.log('======================');
console.log(`ID: ${producto.id}`);
console.log(`Nombre: ${producto.nombre}`);
console.log(`Precio: $${producto.precio.toLocaleString()}`);
console.log(`Categoría: ${producto.categoria_id}`);
console.log('');

// Descuentos de ejemplo (simulando diferentes escenarios)
const descuentos = [
    {
        id: 1,
        nombre: "Descuento Global 10%",
        tipo: "percent",
        valor: 10,
        categoria_id: null,
        producto_ids: null
    },
    {
        id: 2,
        nombre: "Descuento Categoría Rascadores 15%",
        tipo: "percent",
        valor: 15,
        categoria_id: 263,
        producto_ids: null
    },
    {
        id: 3,
        nombre: "Descuento Producto Específico 25%",
        tipo: "percent",
        valor: 25,
        categoria_id: null,
        producto_ids: "[181, 182, 183]"
    },
    {
        id: 4,
        nombre: "Descuento Categoría Rascadores 20%",
        tipo: "percent",
        valor: 20,
        categoria_id: 263,
        producto_ids: null
    }
];

console.log('📋 DESCUENTOS DISPONIBLES:');
console.log('===========================');
descuentos.forEach((d, i) => {
    console.log(`${i + 1}. ${d.nombre}`);
    console.log(`   Valor: ${d.valor}%`);
    console.log(`   Tipo: ${d.categoria_id ? 'Categoría' : d.producto_ids ? 'Producto específico' : 'Global'}`);
});
console.log('');

// Función para aplicar descuento (lógica correcta)
function aplicarDescuento(producto, descuentos) {
    const descuentosAplicables = [];
    
    console.log('🔍 BUSCANDO DESCUENTOS APLICABLES:');
    console.log('===================================\n');
    
    // 1. Buscar descuentos por producto específico
    console.log('PASO 1: Descuentos por producto específico');
    descuentos.forEach(d => {
        if (d.producto_ids) {
            try {
                const productIds = JSON.parse(d.producto_ids);
                if (productIds.includes(producto.id)) {
                    descuentosAplicables.push({
                        ...d,
                        tipo_aplicacion: 'producto_especifico',
                        prioridad: 3
                    });
                    console.log(`   ✅ ${d.nombre} (${d.valor}%)`);
                }
            } catch (e) {
                // Ignorar errores de parsing
            }
        }
    });
    if (descuentosAplicables.filter(d => d.tipo_aplicacion === 'producto_especifico').length === 0) {
        console.log('   ⚪ No hay descuentos específicos');
    }
    console.log('');
    
    // 2. Buscar descuentos por categoría
    console.log('PASO 2: Descuentos por categoría');
    descuentos.forEach(d => {
        if (d.categoria_id === producto.categoria_id) {
            descuentosAplicables.push({
                ...d,
                tipo_aplicacion: 'categoria',
                prioridad: 2
            });
            console.log(`   ✅ ${d.nombre} (${d.valor}%)`);
        }
    });
    if (descuentosAplicables.filter(d => d.tipo_aplicacion === 'categoria').length === 0) {
        console.log('   ⚪ No hay descuentos por categoría');
    }
    console.log('');
    
    // 3. Buscar descuentos globales
    console.log('PASO 3: Descuentos globales');
    descuentos.forEach(d => {
        if (!d.categoria_id && !d.producto_ids) {
            descuentosAplicables.push({
                ...d,
                tipo_aplicacion: 'global',
                prioridad: 1
            });
            console.log(`   ✅ ${d.nombre} (${d.valor}%)`);
        }
    });
    if (descuentosAplicables.filter(d => d.tipo_aplicacion === 'global').length === 0) {
        console.log('   ⚪ No hay descuentos globales');
    }
    console.log('');
    
    // Si no hay descuentos aplicables
    if (descuentosAplicables.length === 0) {
        console.log('❌ NO HAY DESCUENTOS APLICABLES');
        return { discount: null, originalPrice: null, descuentoInfo: null };
    }
    
    // Mostrar todos los descuentos aplicables
    console.log('📊 RESUMEN DE DESCUENTOS APLICABLES:');
    console.log('====================================');
    descuentosAplicables.forEach(d => {
        console.log(`   ${d.valor}% - ${d.nombre} (${d.tipo_aplicacion})`);
    });
    console.log('');
    
    // Filtrar solo descuentos de tipo porcentaje
    const descuentosPorcentuales = descuentosAplicables.filter(d => d.tipo === 'percent');
    
    if (descuentosPorcentuales.length === 0) {
        console.log('❌ No hay descuentos porcentuales aplicables');
        return { discount: null, originalPrice: null, descuentoInfo: null };
    }
    
    // Tomar el descuento MAYOR (no son acumulables)
    console.log('🎯 SELECCIONANDO EL MAYOR DESCUENTO:');
    console.log('====================================');
    const descuentoMayor = descuentosPorcentuales.reduce((max, d) => {
        console.log(`   Comparando: ${d.valor}% vs ${max.valor}%`);
        return d.valor > max.valor ? d : max;
    });
    
    console.log(`\n✅ DESCUENTO SELECCIONADO: ${descuentoMayor.nombre}`);
    console.log(`   Valor: ${descuentoMayor.valor}%`);
    console.log(`   Tipo: ${descuentoMayor.tipo_aplicacion}`);
    console.log('');
    
    // Calcular precio original basado en el descuento real
    console.log('🔢 CÁLCULO DE PRECIOS:');
    console.log('======================');
    const discount = Math.round(descuentoMayor.valor);
    const factor = 1 - discount / 100;
    const originalPrice = Math.round(producto.precio / factor);
    
    console.log(`Precio actual: $${producto.precio.toLocaleString()}`);
    console.log(`Descuento: ${discount}%`);
    console.log(`Factor: 1 - ${discount}/100 = ${factor}`);
    console.log(`Precio original: $${producto.precio.toLocaleString()} / ${factor} = $${originalPrice.toLocaleString()}`);
    console.log('');
    
    // Verificación
    const precioConDescuento = Math.round(originalPrice * factor);
    console.log('🔍 VERIFICACIÓN:');
    console.log(`$${originalPrice.toLocaleString()} - ${discount}% = $${precioConDescuento.toLocaleString()}`);
    console.log(`¿Coincide? ${precioConDescuento === producto.precio ? '✅ SÍ' : '❌ NO'}`);
    console.log('');
    
    return { 
        discount, 
        originalPrice,
        descuentoInfo: {
            nombre: descuentoMayor.nombre,
            tipo_aplicacion: descuentoMayor.tipo_aplicacion,
            descuentos_evaluados: descuentosAplicables.length
        }
    };
}

// Ejecutar la función
const resultado = aplicarDescuento(producto, descuentos);

console.log('📦 RESULTADO FINAL:');
console.log('===================');
if (resultado.discount) {
    console.log(`Precio actual: $${producto.precio.toLocaleString()}`);
    console.log(`Precio original: $${resultado.originalPrice.toLocaleString()}`);
    console.log(`Descuento: ${resultado.discount}%`);
    console.log(`Ahorro: $${(resultado.originalPrice - producto.precio).toLocaleString()}`);
    console.log(`Descuento aplicado: ${resultado.descuentoInfo.nombre}`);
    console.log(`Tipo: ${resultado.descuentoInfo.tipo_aplicacion}`);
    console.log(`topDiscount: ${resultado.discount >= 20 ? 'true' : 'false'}`);
} else {
    console.log('Sin descuento');
}

console.log('\n💡 REGLAS DE DESCUENTOS:');
console.log('========================');
console.log('1. Los descuentos NO son acumulables');
console.log('2. Se evalúan en este orden:');
console.log('   a) Descuentos por producto específico');
console.log('   b) Descuentos por categoría');
console.log('   c) Descuentos globales');
console.log('3. Se toma el MAYOR descuento de todos los aplicables');
console.log('4. Solo se consideran descuentos de tipo "percent"');
console.log('5. El precio original se calcula inversamente desde el descuento');

console.log('\n🚀 Test de lógica de descuentos completado');