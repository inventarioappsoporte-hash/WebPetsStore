// Script para corregir el comportamiento del límite en convertir-productos-sqlite.js

const fs = require('fs');

let content = fs.readFileSync('convertir-productos-sqlite.js', 'utf8');

// Corrección 1: En verificarDuplicados - cambiar forEach por for loop
const oldVerificar = `    lineas.forEach((linea, index) => {
        const [id, nombre, sku, precio, stock, categoria, tieneVariantes] = linea.split('|');
        const productoId = \`prod_\${id}\`;
        const yaExistePorId = productosExistentes.some(p => p.id === productoId);
        const yaExistePorSku = sku && productosExistentes.some(p => p.sku === sku);

        console.log(\`\${index + 1}. \${nombre}\`);
        console.log(\`   ID SQLite: \${id} → ID Web: \${productoId}\`);
        console.log(\`   SKU: \${sku || 'Sin SKU'}\`);
        console.log(\`   Precio: \${parseFloat(precio).toLocaleString()}\`);
        console.log(\`   Stock: \${stock} unidades\`);
        console.log(\`   Categoría: \${categoria}\`);
        console.log(\`   Tipo: \${tieneVariantes === '1' ? 'Con variantes' : 'Simple'}\`);

        if (yaExistePorId) {
            console.log(\`   ❌ DUPLICADO - ID ya existe\`);
            duplicados.push({ id: productoId, nombre, sku, razon: 'ID ya existe' });
        } else if (yaExistePorSku) {
            console.log(\`   ❌ DUPLICADO - SKU ya existe\`);
            duplicados.push({ id: productoId, nombre, sku, razon: 'SKU ya existe' });
        } else {
            console.log(\`   ✅ NUEVO - Se puede agregar\`);
            nuevos.push({ id: productoId, nombre, sku, precio: parseFloat(precio), stock: parseInt(stock) });
        }
        console.log('');
    });`;

const newVerificar = `    let contadorNuevos = 0;

    for (let index = 0; index < lineas.length; index++) {
        // Si ya alcanzamos el límite de productos nuevos, detenemos
        if (contadorNuevos >= limite) {
            console.log(\`\\n⚠️  Se alcanzó el límite de \${limite} productos nuevos.\`);
            console.log(\`   Se consultaron \${index} productos en total (incluyendo duplicados).\\n\`);
            break;
        }

        const linea = lineas[index];
        const [id, nombre, sku, precio, stock, categoria, tieneVariantes] = linea.split('|');
        const productoId = \`prod_\${id}\`;
        const yaExistePorId = productosExistentes.some(p => p.id === productoId);
        const yaExistePorSku = sku && productosExistentes.some(p => p.sku === sku);

        console.log(\`\${index + 1}. \${nombre}\`);
        console.log(\`   ID SQLite: \${id} → ID Web: \${productoId}\`);
        console.log(\`   SKU: \${sku || 'Sin SKU'}\`);
        console.log(\`   Precio: \${parseFloat(precio).toLocaleString()}\`);
        console.log(\`   Stock: \${stock} unidades\`);
        console.log(\`   Categoría: \${categoria}\`);
        console.log(\`   Tipo: \${tieneVariantes === '1' ? 'Con variantes' : 'Simple'}\`);

        if (yaExistePorId) {
            console.log(\`   ❌ DUPLICADO - ID ya existe\`);
            duplicados.push({ id: productoId, nombre, sku, razon: 'ID ya existe' });
        } else if (yaExistePorSku) {
            console.log(\`   ❌ DUPLICADO - SKU ya existe\`);
            duplicados.push({ id: productoId, nombre, sku, razon: 'SKU ya existe' });
        } else {
            console.log(\`   ✅ NUEVO - Se puede agregar (\${contadorNuevos + 1}/\${limite})\`);
            nuevos.push({ id: productoId, nombre, sku, precio: parseFloat(precio), stock: parseInt(stock) });
            contadorNuevos++;
        }
        console.log('');
    }`;

if (content.includes(oldVerificar)) {
    content = content.replace(oldVerificar, newVerificar);
    console.log('✅ Corrección 1 aplicada: verificarDuplicados');
} else {
    console.log('⚠️  Corrección 1 no aplicada: patrón no encontrado');
}

// Guardar archivo
fs.writeFileSync('convertir-productos-sqlite.js', content);
console.log('\n✅ Archivo actualizado: convertir-productos-sqlite.js');
