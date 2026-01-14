const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 TEST: Conversión de Productos con Variantes (Mejorado)');
console.log('==========================================================\n');

// Productos con variantes conocidos
const productosTest = [106, 145]; // IDs de productos con variantes

console.log('📋 Productos a probar:');
productosTest.forEach(id => {
    console.log(`   - Producto ID: ${id}`);
});

console.log('\n🔍 Fase 1: Verificación (modo check)');
console.log('=====================================\n');

productosTest.forEach(id => {
    try {
        console.log(`\n--- Producto ${id} ---`);
        const result = execSync(`node convertir-productos-variantes.js check ${id}`, {
            encoding: 'utf-8',
            cwd: __dirname
        });
        console.log(result);
    } catch (error) {
        console.error(`❌ Error en producto ${id}:`, error.message);
    }
});

console.log('\n\n🔄 Fase 2: Conversión (modo convert)');
console.log('=====================================\n');

const productosConvertidos = [];

productosTest.forEach(id => {
    try {
        console.log(`\n--- Convirtiendo Producto ${id} ---`);
        const result = execSync(`node convertir-productos-variantes.js convert ${id}`, {
            encoding: 'utf-8',
            cwd: __dirname
        });
        console.log(result);
        
        // Leer el archivo generado
        const outputPath = path.join(__dirname, `producto_variante_${id}.json`);
        if (fs.existsSync(outputPath)) {
            const producto = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
            productosConvertidos.push(producto);
            console.log(`✅ Producto ${id} convertido exitosamente`);
        }
    } catch (error) {
        console.error(`❌ Error convirtiendo producto ${id}:`, error.message);
    }
});

console.log('\n\n🔍 Fase 3: Validación de Productos Convertidos');
console.log('===============================================\n');

productosConvertidos.forEach(producto => {
    console.log(`\n📦 Validando: ${producto.name} (${producto.id})`);
    
    // Validar estructura básica
    const camposRequeridos = [
        'id', 'name', 'category', 'hasVariants', 'basePrice', 
        'stock', 'badge', 'variants', 'images'
    ];
    
    const camposFaltantes = camposRequeridos.filter(campo => !(campo in producto));
    
    if (camposFaltantes.length > 0) {
        console.log(`   ❌ Campos faltantes: ${camposFaltantes.join(', ')}`);
    } else {
        console.log(`   ✅ Estructura básica completa`);
    }
    
    // Validar precios
    console.log(`\n   💰 Validación de Precios:`);
    console.log(`      Base Price: ${producto.basePrice}`);
    
    if (isNaN(producto.basePrice) || producto.basePrice <= 0) {
        console.log(`      ❌ Precio base inválido: ${producto.basePrice}`);
    } else {
        console.log(`      ✅ Precio base válido`);
    }
    
    if (producto.discount) {
        console.log(`      Descuento: ${producto.discount}%`);
        console.log(`      Precio Original: ${producto.baseOriginalPrice}`);
        
        if (isNaN(producto.baseOriginalPrice) || producto.baseOriginalPrice <= 0) {
            console.log(`      ❌ Precio original inválido`);
        } else if (producto.baseOriginalPrice <= producto.basePrice) {
            console.log(`      ❌ Precio original debe ser mayor al precio con descuento`);
        } else {
            console.log(`      ✅ Descuento aplicado correctamente`);
        }
    } else {
        console.log(`      Sin descuento`);
        if (producto.baseOriginalPrice !== null) {
            console.log(`      ⚠️  baseOriginalPrice debería ser null cuando no hay descuento`);
        }
    }
    
    // Validar variantes
    console.log(`\n   🎨 Validación de Variantes:`);
    console.log(`      Total variantes: ${producto.variants.combinations.length}`);
    console.log(`      Atributos: ${producto.variants.attributes.map(a => a.name).join(', ')}`);
    
    let variantesValidas = 0;
    let variantesInvalidas = 0;
    
    producto.variants.combinations.forEach((variante, index) => {
        const precioValido = !isNaN(variante.price) && variante.price > 0;
        const stockValido = !isNaN(variante.stock) && variante.stock >= 0;
        const atributosValidos = Object.keys(variante.attributes).length > 0;
        
        if (precioValido && stockValido && atributosValidos) {
            variantesValidas++;
        } else {
            variantesInvalidas++;
            console.log(`      ❌ Variante ${index + 1} inválida:`);
            if (!precioValido) console.log(`         - Precio inválido: ${variante.price}`);
            if (!stockValido) console.log(`         - Stock inválido: ${variante.stock}`);
            if (!atributosValidos) console.log(`         - Sin atributos`);
        }
        
        // Validar descuento en variante
        if (producto.discount) {
            if (!variante.originalPrice) {
                console.log(`      ⚠️  Variante ${index + 1} sin precio original (debería tenerlo con descuento)`);
            } else if (variante.originalPrice <= variante.price) {
                console.log(`      ❌ Variante ${index + 1}: precio original debe ser mayor al precio con descuento`);
            }
        }
    });
    
    console.log(`      ✅ Variantes válidas: ${variantesValidas}`);
    if (variantesInvalidas > 0) {
        console.log(`      ❌ Variantes inválidas: ${variantesInvalidas}`);
    }
    
    // Validar badge
    console.log(`\n   🏷️  Badge: ${producto.badge}`);
    if (producto.discount && producto.discount >= 25) {
        if (producto.badge.includes(`-${producto.discount}%`)) {
            console.log(`      ✅ Badge de descuento correcto`);
        } else {
            console.log(`      ⚠️  Badge debería mostrar descuento: 🔥 -${producto.discount}%`);
        }
    } else {
        console.log(`      ✅ Badge de categoría`);
    }
    
    // Validar topDiscount
    if (producto.discount && producto.discount >= 25) {
        if (producto.topDiscount) {
            console.log(`      ✅ topDiscount: true (correcto para descuento >= 25%)`);
        } else {
            console.log(`      ❌ topDiscount debería ser true para descuento >= 25%`);
        }
    }
    
    // Validar imágenes
    console.log(`\n   📸 Validación de Imágenes:`);
    const imagenesBase = ['cover', 'thumb', 'gallery'];
    const imagenesFaltantes = imagenesBase.filter(tipo => {
        if (tipo === 'gallery') {
            return !producto.images.gallery || producto.images.gallery.length === 0;
        }
        return !producto.images[tipo];
    });
    
    if (imagenesFaltantes.length > 0) {
        console.log(`      ❌ Imágenes faltantes: ${imagenesFaltantes.join(', ')}`);
    } else {
        console.log(`      ✅ Imágenes base completas`);
    }
    
    // Verificar que cada variante tenga imágenes
    const variantesSinImagenes = producto.variants.combinations.filter(v => 
        !v.images || !v.images.cover || !v.images.thumb
    );
    
    if (variantesSinImagenes.length > 0) {
        console.log(`      ⚠️  ${variantesSinImagenes.length} variantes sin imágenes completas`);
    } else {
        console.log(`      ✅ Todas las variantes tienen imágenes`);
    }
});

console.log('\n\n📊 RESUMEN FINAL');
console.log('================\n');
console.log(`Total productos procesados: ${productosTest.length}`);
console.log(`Productos convertidos exitosamente: ${productosConvertidos.length}`);
console.log(`Productos con errores: ${productosTest.length - productosConvertidos.length}`);

if (productosConvertidos.length > 0) {
    console.log('\n✅ Conversión completada. Revisa los archivos generados:');
    productosConvertidos.forEach(p => {
        console.log(`   - producto_variante_${p.id.replace('prod_', '')}.json`);
    });
    console.log('\n💡 Si todo está correcto, puedes agregar estos productos a products.json');
} else {
    console.log('\n❌ No se pudo convertir ningún producto');
}
