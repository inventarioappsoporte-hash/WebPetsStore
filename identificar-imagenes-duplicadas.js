const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Leer products.json
const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Función para calcular hash de archivo
function getFileHash(filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath);
            return crypto.createHash('md5').update(content).digest('hex');
        }
    } catch (e) {}
    return null;
}

// Filtrar productos con variantes
const productosConVariantes = products.filter(p => p.hasVariants && p.variants && p.variants.combinations);

console.log('='.repeat(80));
console.log('PRODUCTOS CON VARIANTES QUE TIENEN IMÁGENES DUPLICADAS');
console.log('='.repeat(80));
console.log('');

const problemasEncontrados = [];

productosConVariantes.forEach(producto => {
    const variantes = producto.variants.combinations;
    
    if (variantes.length < 2) return;
    
    // Obtener hashes de las imágenes cover de cada variante
    const hashes = {};
    const imagenesVariantes = [];
    
    variantes.forEach(v => {
        if (v.images && v.images.cover) {
            const hash = getFileHash(v.images.cover);
            if (hash) {
                imagenesVariantes.push({
                    varianteId: v.id,
                    imagen: v.images.cover,
                    hash: hash
                });
                
                if (!hashes[hash]) {
                    hashes[hash] = [];
                }
                hashes[hash].push(v.id);
            }
        }
    });
    
    // Verificar si hay duplicados
    const hashesUnicos = Object.keys(hashes);
    const totalVariantes = imagenesVariantes.length;
    
    if (hashesUnicos.length < totalVariantes && totalVariantes > 1) {
        // Hay imágenes duplicadas
        const duplicados = Object.entries(hashes).filter(([hash, ids]) => ids.length > 1);
        
        problemasEncontrados.push({
            id: producto.id,
            nombre: producto.name,
            totalVariantes: totalVariantes,
            imagenesUnicas: hashesUnicos.length,
            duplicados: duplicados.map(([hash, ids]) => ({
                cantidad: ids.length,
                variantes: ids
            }))
        });
    }
});

if (problemasEncontrados.length === 0) {
    console.log('✅ No se encontraron productos con imágenes duplicadas en sus variantes.');
} else {
    console.log(`❌ Se encontraron ${problemasEncontrados.length} productos con imágenes duplicadas:\n`);
    
    problemasEncontrados.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.nombre} (${p.id})`);
        console.log(`   - Total variantes: ${p.totalVariantes}`);
        console.log(`   - Imágenes únicas: ${p.imagenesUnicas}`);
        console.log(`   - Grupos duplicados:`);
        p.duplicados.forEach(d => {
            console.log(`     * ${d.cantidad} variantes comparten la misma imagen: ${d.variantes.join(', ')}`);
        });
        console.log('');
    });
}

// Guardar reporte
const reportePath = path.join(__dirname, 'reporte-imagenes-duplicadas.json');
fs.writeFileSync(reportePath, JSON.stringify(problemasEncontrados, null, 2));
console.log(`\n📄 Reporte guardado en: reporte-imagenes-duplicadas.json`);
