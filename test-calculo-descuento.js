// Test de Cálculo de Descuento - RASCADOR TABLA CARTON Y ALFOMBRA
console.log('🧪 TEST DE CÁLCULO DE DESCUENTO');
console.log('================================\n');

// Datos del producto desde SQLite
const producto = {
    nombre: "RASCADOR TABLA CARTON Y ALFOMBRA",
    precio: 9000.0,           // Precio de venta actual
    precio_compra: 4652.0     // Precio de compra/costo
};

console.log('📋 DATOS DEL PRODUCTO:');
console.log('======================');
console.log(`Nombre: ${producto.nombre}`);
console.log(`Precio de venta: $${producto.precio.toLocaleString()}`);
console.log(`Precio de compra: $${producto.precio_compra.toLocaleString()}`);
console.log('');

// Función de cálculo de descuento (del script)
function calcularDescuento(precio, precioCompra) {
    console.log('🔢 PASO A PASO DEL CÁLCULO:');
    console.log('===========================\n');
    
    // Paso 1: Verificar si hay precio de compra
    console.log('PASO 1: Verificar precio de compra');
    if (!precioCompra) {
        console.log('❌ No hay precio de compra → No se calcula descuento');
        return null;
    }
    console.log(`✅ Precio de compra existe: $${precioCompra.toLocaleString()}`);
    console.log('');
    
    // Paso 2: Verificar margen mínimo
    console.log('PASO 2: Verificar margen de ganancia');
    const margenMinimo = precioCompra * 1.5;
    console.log(`Margen mínimo requerido: precio_compra * 1.5`);
    console.log(`$${precioCompra.toLocaleString()} * 1.5 = $${margenMinimo.toLocaleString()}`);
    console.log(`Precio actual: $${precio.toLocaleString()}`);
    
    if (precio <= margenMinimo) {
        console.log(`❌ Precio ($${precio}) ≤ Margen mínimo ($${margenMinimo})`);
        console.log('   → No se considera descuento (margen muy bajo)');
        return null;
    }
    console.log(`✅ Precio ($${precio}) > Margen mínimo ($${margenMinimo})`);
    console.log('   → Sí hay margen para mostrar descuento');
    console.log('');
    
    // Paso 3: Calcular precio original simulado
    console.log('PASO 3: Calcular precio original (antes del descuento)');
    console.log('Fórmula: precio_actual * 1.25');
    const originalPrice = Math.round(precio * 1.25);
    console.log(`$${precio.toLocaleString()} * 1.25 = $${originalPrice.toLocaleString()}`);
    console.log('');
    
    // Paso 4: Calcular porcentaje de descuento
    console.log('PASO 4: Calcular porcentaje de descuento');
    console.log('Fórmula: ((precio_original - precio_actual) / precio_original) * 100');
    
    const diferencia = originalPrice - precio;
    console.log(`Diferencia: $${originalPrice.toLocaleString()} - $${precio.toLocaleString()} = $${diferencia.toLocaleString()}`);
    
    const porcentaje = (diferencia / originalPrice) * 100;
    console.log(`Porcentaje: ($${diferencia.toLocaleString()} / $${originalPrice.toLocaleString()}) * 100 = ${porcentaje.toFixed(2)}%`);
    
    const discount = Math.round(porcentaje);
    console.log(`Redondeado: ${discount}%`);
    console.log('');
    
    return { originalPrice, discount };
}

// Ejecutar cálculo
const resultado = calcularDescuento(producto.precio, producto.precio_compra);

console.log('📊 RESULTADO FINAL:');
console.log('===================');
if (resultado) {
    console.log(`✅ Se calculó descuento:`);
    console.log(`   Precio original: $${resultado.originalPrice.toLocaleString()}`);
    console.log(`   Precio actual: $${producto.precio.toLocaleString()}`);
    console.log(`   Descuento: ${resultado.discount}%`);
    console.log(`   Ahorro: $${(resultado.originalPrice - producto.precio).toLocaleString()}`);
} else {
    console.log('❌ No se calculó descuento (margen insuficiente)');
}

console.log('');

// Verificación adicional
console.log('🔍 VERIFICACIÓN DEL CÁLCULO:');
console.log('============================');
if (resultado) {
    const precioConDescuento = resultado.originalPrice * (1 - resultado.discount / 100);
    console.log(`Verificar: $${resultado.originalPrice.toLocaleString()} - ${resultado.discount}% = $${Math.round(precioConDescuento).toLocaleString()}`);
    console.log(`Precio actual: $${producto.precio.toLocaleString()}`);
    console.log(`¿Coincide? ${Math.round(precioConDescuento) === producto.precio ? '✅ SÍ' : '❌ NO'}`);
}

console.log('');

// Explicación del criterio
console.log('💡 CRITERIO DE DESCUENTO:');
console.log('=========================');
console.log('El script usa este criterio para decidir si mostrar descuento:');
console.log('');
console.log('1. Debe existir precio_compra en la base de datos');
console.log('2. El precio_venta debe ser > (precio_compra * 1.5)');
console.log('   → Esto asegura un margen mínimo del 50%');
console.log('3. Si cumple, se simula un "precio original" multiplicando por 1.25');
console.log('   → Esto crea un descuento del 20% aproximadamente');
console.log('');
console.log('Para este producto:');
console.log(`   Precio compra: $${producto.precio_compra.toLocaleString()}`);
console.log(`   Margen mínimo: $${(producto.precio_compra * 1.5).toLocaleString()} (50% ganancia)`);
console.log(`   Precio actual: $${producto.precio.toLocaleString()}`);
console.log(`   ¿Cumple criterio? ${producto.precio > producto.precio_compra * 1.5 ? '✅ SÍ' : '❌ NO'}`);

console.log('\n🚀 Test de cálculo de descuento completado');