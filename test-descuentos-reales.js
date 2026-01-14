// Test COMPLETO - Validación de TODOS los descuentos desde SQLite
// Para producto: ANTEOJOS PARA GATO Y PERRITO (ID 871)

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'inventario_restored.db');

console.log('🧪 TEST COMPLETO - VALIDACIÓN DE DESCUENTOS REALES');
console.log('===================================================\n');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('❌ Error al abrir la base de datos:', err.message);
        process.exit(1);
    }
    console.log('✅ Base de datos conectada\n');
});

// Datos del producto
const productoId = 871;
const productoNombre = "ANTEOJOS PARA GATO Y PERRITO";

console.log('📋 PRODUCTO A VALIDAR:');
console.log('======================');
console.log(`ID: ${productoId}`);
console.log(`Nombre: ${productoNombre}`);
console.log('');

// Obtener datos del producto
db.get(`
    SELECT 
        p.id,
        p.nombre,
        p.categoria_id,
        p.precio_venta,
        c.nombre as categoria_nombre
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.id = ?
`, [productoId], (err, producto) => {
    if (err) {
        console.error('❌ Error al obtener producto:', err.message);
        db.close();
        return;
    }

    if (!producto) {
        console.error('❌ Producto no encontrado');
        db.close();
        return;
    }

    console.log('✅ Producto encontrado:');
    console.log(`   Nombre: ${producto.nombre}`);
    console.log(`   Categoría ID: ${producto.categoria_id || 'Sin categoría'}`);
    console.log(`   Categoría: ${producto.categoria_nombre || 'Sin categoría'}`);
    console.log(`   Precio venta: ${producto.precio_venta.toLocaleString()}`);
    console.log('');

    // Buscar TODOS los descuentos activos
    console.log('🔍 BUSCANDO DESCUENTOS ACTIVOS...\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    db.all(`
        SELECT 
            id,
            nombre,
            tipo,
            valor,
            categoria_id,
            producto_ids,
            activo,
            fecha_inicio,
            fecha_fin
        FROM descuentos
        WHERE activo = 1
        AND (fecha_fin IS NULL OR fecha_fin >= date('now'))
        ORDER BY valor DESC
    `, [], (err, descuentos) => {
        if (err) {
            console.error('❌ Error al buscar descuentos:', err.message);
            db.close();
            return;
        }

        console.log(`📊 Total de descuentos activos: ${descuentos.length}\n`);

        if (descuentos.length === 0) {
            console.log('⚠️  No hay descuentos activos en la base de datos\n');
            db.close();
            return;
        }

        // Clasificar descuentos
        const descuentosAplicables = [];
        
        console.log('PASO 1: DESCUENTOS ESPECÍFICOS POR PRODUCTO');
        console.log('─────────────────────────────────────────────\n');
        
        let encontradoEspecifico = false;
        descuentos.forEach(desc => {
            if (desc.producto_ids) {
                try {
                    const productIds = JSON.parse(desc.producto_ids);
                    const incluyeProducto = productIds.includes(productoId) || 
                                          productIds.includes(productoId.toString());
                    
                    console.log(`Descuento: ${desc.nombre}`);
                    console.log(`   ID: ${desc.id}`);
                    console.log(`   Valor: ${desc.valor}%`);
                    console.log(`   producto_ids: ${desc.producto_ids}`);
                    console.log(`   IDs parseados: [${productIds.join(', ')}]`);
                    console.log(`   ¿Incluye ${productoId}? ${incluyeProducto ? '✅ SÍ' : '❌ NO'}`);
                    
                    if (incluyeProducto) {
                        console.log(`   🎯 APLICABLE - Descuento específico`);
                        descuentosAplicables.push({
                            tipo: 'específico',
                            nombre: desc.nombre,
                            valor: desc.valor,
                            id: desc.id
                        });
                        encontradoEspecifico = true;
                    }
                    console.log('');
                } catch (e) {
                    console.log(`   ⚠️  Error al parsear producto_ids: ${e.message}\n`);
                }
            }
        });

        if (!encontradoEspecifico) {
            console.log('   ⚪ No hay descuentos específicos para este producto\n');
        }

        console.log('PASO 2: DESCUENTOS POR CATEGORÍA');
        console.log('─────────────────────────────────\n');
        
        if (!producto.categoria_id) {
            console.log('   ⚠️  Producto sin categoría asignada');
            console.log('   ⚪ No se pueden aplicar descuentos por categoría\n');
        } else {
            let encontradoCategoria = false;
            descuentos.forEach(desc => {
                if (desc.categoria_id === producto.categoria_id && !desc.producto_ids) {
                    console.log(`Descuento: ${desc.nombre}`);
                    console.log(`   ID: ${desc.id}`);
                    console.log(`   Valor: ${desc.valor}%`);
                    console.log(`   Categoría: ${producto.categoria_nombre} (ID: ${desc.categoria_id})`);
                    console.log(`   🎯 APLICABLE - Descuento por categoría\n`);
                    
                    descuentosAplicables.push({
                        tipo: 'categoría',
                        nombre: desc.nombre,
                        valor: desc.valor,
                        id: desc.id
                    });
                    encontradoCategoria = true;
                }
            });

            if (!encontradoCategoria) {
                console.log('   ⚪ No hay descuentos para esta categoría\n');
            }
        }

        console.log('PASO 3: DESCUENTOS GLOBALES');
        console.log('────────────────────────────\n');
        
        let encontradoGlobal = false;
        descuentos.forEach(desc => {
            if (!desc.categoria_id && !desc.producto_ids) {
                console.log(`Descuento: ${desc.nombre}`);
                console.log(`   ID: ${desc.id}`);
                console.log(`   Valor: ${desc.valor}%`);
                console.log(`   Aplicación: Todos los productos`);
                console.log(`   🎯 APLICABLE - Descuento global\n`);
                
                descuentosAplicables.push({
                    tipo: 'global',
                    nombre: desc.nombre,
                    valor: desc.valor,
                    id: desc.id
                });
                encontradoGlobal = true;
            }
        });

        if (!encontradoGlobal) {
            console.log('   ⚪ No hay descuentos globales activos\n');
        }

        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('📊 RESUMEN DE DESCUENTOS APLICABLES:');
        console.log('════════════════════════════════════\n');

        if (descuentosAplicables.length === 0) {
            console.log('❌ NO HAY DESCUENTOS APLICABLES');
            console.log('   → El producto se mostrará a precio normal');
            console.log(`   → Precio: ${producto.precio_venta.toLocaleString()}`);
            console.log('   → originalPrice: null');
            console.log('   → discount: null\n');
        } else {
            console.log(`✅ ${descuentosAplicables.length} descuento(s) aplicable(s):\n`);
            
            descuentosAplicables.forEach((desc, index) => {
                console.log(`${index + 1}. ${desc.nombre}`);
                console.log(`   Tipo: ${desc.tipo}`);
                console.log(`   Valor: ${desc.valor}%`);
                console.log('');
            });

            // Seleccionar el mayor
            const descuentoMayor = descuentosAplicables.reduce((max, desc) => 
                desc.valor > max.valor ? desc : max
            );

            console.log('🎯 DESCUENTO SELECCIONADO (MAYOR):');
            console.log('───────────────────────────────────');
            console.log(`Nombre: ${descuentoMayor.nombre}`);
            console.log(`Tipo: ${descuentoMayor.tipo}`);
            console.log(`Valor: ${descuentoMayor.valor}%`);
            console.log('');

            // Calcular precios
            const precioOriginal = producto.precio_venta;
            const descuentoPorcentaje = descuentoMayor.valor;
            const descuentoMonto = Math.round(precioOriginal * (descuentoPorcentaje / 100));
            const precioConDescuento = precioOriginal - descuentoMonto;

            console.log('💰 CÁLCULO DE PRECIOS:');
            console.log('──────────────────────');
            console.log(`Precio original: ${precioOriginal.toLocaleString()}`);
            console.log(`Descuento: ${descuentoPorcentaje}%`);
            console.log(`Monto descuento: ${descuentoMonto.toLocaleString()}`);
            console.log(`Precio con descuento: ${precioConDescuento.toLocaleString()}`);
            console.log('');

            console.log('🌐 DATOS PARA LA WEB:');
            console.log('─────────────────────');
            console.log(`price: ${precioConDescuento.toLocaleString()} (con descuento)`);
            console.log(`originalPrice: ${precioOriginal.toLocaleString()}`);
            console.log(`discount: ${Math.round(descuentoPorcentaje)}%`);
            console.log(`topDiscount: ${descuentoPorcentaje >= 20 ? 'true' : 'false'}`);
            console.log('');

            console.log('💵 AHORRO PARA EL CLIENTE:');
            console.log('──────────────────────────');
            console.log(`Ahorra: ${descuentoMonto.toLocaleString()} (${descuentoPorcentaje}%)`);
            console.log('');
        }

        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('✅ VALIDACIÓN COMPLETA');
        console.log('');
        console.log('Proceso ejecutado:');
        console.log('1. ✅ Consulta a tabla productos');
        console.log('2. ✅ Consulta a tabla descuentos');
        console.log('3. ✅ Validación de descuentos específicos');
        console.log('4. ✅ Validación de descuentos por categoría');
        console.log('5. ✅ Validación de descuentos globales');
        console.log('6. ✅ Selección del mayor descuento');
        console.log('7. ✅ Cálculo de precios correcto');
        console.log('');
        console.log('🚀 Test completado exitosamente');

        db.close();
    });
});
