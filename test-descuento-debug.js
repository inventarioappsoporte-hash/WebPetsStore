const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 DEBUG DE APLICACIÓN DE DESCUENTOS\n');

const dbPath = path.join(__dirname, '..', 'database', 'inventario_restored.db');

// Cargar descuentos
const queryDescuentos = `
    SELECT 
        id || '|' ||
        nombre || '|' ||
        tipo || '|' ||
        valor || '|' ||
        COALESCE(categoria_id, '') || '|' ||
        COALESCE(producto_ids, '')
    FROM descuentos 
    WHERE activo = 1 
    AND (fecha_fin IS NULL OR fecha_fin >= date('now'))
`;

const cmd = `sqlite3 "${dbPath}" "${queryDescuentos.replace(/\n/g, ' ').replace(/\s+/g, ' ')}"`;
const resultado = execSync(cmd, { encoding: 'utf8' });
const descuentos = [];

resultado.split('\n').filter(l => l.trim()).forEach(linea => {
    const [id, nombre, tipo, valor, categoria_id, producto_ids] = linea.split('|');
    descuentos.push({
        id: parseInt(id),
        nombre,
        tipo,
        valor: parseFloat(valor),
        categoria_id: categoria_id ? parseInt(categoria_id) : null,
        producto_ids: producto_ids || null
    });
});

console.log(`Total descuentos cargados: ${descuentos.length}\n`);

// Producto de prueba
const producto = {
    id: 223,
    nombre: "COCODRILO - AGATAR",
    categoria_id: 263,
    precio_venta: 18000
};

console.log('Producto de prueba:');
console.log(`  ID: ${producto.id}`);
console.log(`  Nombre: ${producto.nombre}`);
console.log(`  Categoría: ${producto.categoria_id}`);
console.log(`  Precio: $${producto.precio_venta.toLocaleString()}\n`);

console.log('Buscando descuentos aplicables...\n');

const descuentosAplicables = [];

// 1. Por producto específico
console.log('1. Descuentos por producto específico:');
descuentos.forEach(d => {
    if (d.producto_ids && d.tipo === 'percent') {
        try {
            const productIds = JSON.parse(d.producto_ids);
            const encontrado = productIds.some(id => 
                String(id) === String(producto.id) || Number(id) === Number(producto.id)
            );
            console.log(`   ${d.nombre} (${d.valor}%) - producto_ids: ${d.producto_ids}`);
            console.log(`   ¿Incluye ${producto.id}? ${encontrado ? '✅ SÍ' : '❌ NO'}`);
            if (encontrado) {
                descuentosAplicables.push({ ...d, tipo_aplicacion: 'especifico' });
            }
        } catch (e) {
            console.log(`   Error parseando: ${e.message}`);
        }
    }
});
console.log('');

// 2. Por categoría
console.log('2. Descuentos por categoría:');
descuentos.forEach(d => {
    if (d.categoria_id === producto.categoria_id && !d.producto_ids && d.tipo === 'percent') {
        console.log(`   ✅ ${d.nombre} (${d.valor}%) - categoría ${d.categoria_id}`);
        descuentosAplicables.push({ ...d, tipo_aplicacion: 'categoria' });
    }
});
if (descuentosAplicables.filter(d => d.tipo_aplicacion === 'categoria').length === 0) {
    console.log('   ❌ No hay descuentos para categoría 263');
}
console.log('');

// 3. Globales
console.log('3. Descuentos globales:');
descuentos.forEach(d => {
    if (!d.categoria_id && !d.producto_ids && d.tipo === 'percent') {
        console.log(`   ✅ ${d.nombre} (${d.valor}%)`);
        descuentosAplicables.push({ ...d, tipo_aplicacion: 'global' });
    }
});
if (descuentosAplicables.filter(d => d.tipo_aplicacion === 'global').length === 0) {
    console.log('   ❌ No hay descuentos globales');
}
console.log('');

console.log(`\nTotal descuentos aplicables: ${descuentosAplicables.length}\n`);

if (descuentosAplicables.length > 0) {
    console.log('Descuentos aplicables:');
    descuentosAplicables.forEach(d => {
        console.log(`  - ${d.nombre}: ${d.valor}% (${d.tipo_aplicacion})`);
    });
    
    const descuentoMayor = descuentosAplicables.reduce((max, d) => 
        d.valor > max.valor ? d : max
    );
    
    console.log(`\n✅ Descuento seleccionado: ${descuentoMayor.nombre} (${descuentoMayor.valor}%)\n`);
    
    const precioOriginal = producto.precio_venta;
    const descuentoPorcentaje = descuentoMayor.valor;
    const descuentoMonto = Math.round(precioOriginal * (descuentoPorcentaje / 100));
    const precioConDescuento = precioOriginal - descuentoMonto;
    
    console.log('Cálculo:');
    console.log(`  Precio original: $${precioOriginal.toLocaleString()}`);
    console.log(`  Descuento: ${descuentoPorcentaje}%`);
    console.log(`  Monto descuento: $${descuentoMonto.toLocaleString()}`);
    console.log(`  Precio con descuento: $${precioConDescuento.toLocaleString()}`);
    
    console.log('\nDatos para products.json:');
    console.log(`  price: ${precioConDescuento}`);
    console.log(`  originalPrice: ${precioOriginal}`);
    console.log(`  discount: ${Math.round(descuentoPorcentaje)}`);
} else {
    console.log('❌ NO HAY DESCUENTOS APLICABLES');
    console.log('\nDatos para products.json:');
    console.log(`  price: ${producto.precio_venta}`);
    console.log(`  originalPrice: null`);
    console.log(`  discount: null`);
}
