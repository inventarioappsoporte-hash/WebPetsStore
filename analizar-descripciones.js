const fs = require('fs');

// Leer productos
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

// Función para calcular similitud entre dos strings
function similarity(s1, s2) {
    s1 = s1.toLowerCase().trim();
    s2 = s2.toLowerCase().trim();
    if (s1 === s2) return 1;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    // Verificar si uno contiene al otro
    if (longer.includes(shorter)) {
        return shorter.length / longer.length;
    }
    
    // Contar palabras en común
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const common = words1.filter(w => words2.includes(w)).length;
    return common / Math.max(words1.length, words2.length);
}

const problemas = [];

products.forEach(p => {
    const issues = [];
    const name = p.name || '';
    const desc = p.description || '';
    const longDesc = p.longDescription || '';
    
    // 1. Sin descripción
    if (!desc || desc.trim() === '') {
        issues.push('❌ SIN DESCRIPCIÓN');
    }
    
    // 2. Descripción igual al título
    if (desc && name && desc.trim().toUpperCase() === name.trim().toUpperCase()) {
        issues.push('⚠️ Descripción IDÉNTICA al título');
    }
    
    // 3. Descripción muy similar al título (>80%)
    else if (desc && name && similarity(desc, name) > 0.8) {
        issues.push('⚠️ Descripción MUY SIMILAR al título');
    }
    
    // 4. Descripción muy corta (menos de 30 caracteres)
    if (desc && desc.length < 30 && desc.length > 0) {
        issues.push(`⚠️ Descripción MUY CORTA (${desc.length} chars)`);
    }
    
    // 5. longDescription igual a description
    if (longDesc && desc && longDesc.trim() === desc.trim()) {
        issues.push('⚠️ longDescription IGUAL a description');
    }
    
    // 6. Solo tiene medidas/tallas como descripción
    if (desc && /^(Talle|N°|T\d|Size|\d+\s*(x|X)\s*\d+)/i.test(desc.trim())) {
        issues.push('⚠️ Descripción solo tiene MEDIDAS/TALLAS');
    }
    
    // 7. Descripción genérica (features por defecto)
    if (longDesc && longDesc.includes('Múltiples variantes disponibles') && longDesc.includes('Calidad garantizada')) {
        issues.push('⚠️ Usa descripción GENÉRICA por defecto');
    }
    
    if (issues.length > 0) {
        problemas.push({
            id: p.id,
            name: name,
            description: desc.substring(0, 80) + (desc.length > 80 ? '...' : ''),
            longDescription: longDesc ? longDesc.substring(0, 80) + (longDesc.length > 80 ? '...' : '') : '(vacío)',
            issues: issues
        });
    }
});

// Ordenar por cantidad de problemas
problemas.sort((a, b) => b.issues.length - a.issues.length);

console.log('═══════════════════════════════════════════════════════════════');
console.log('  PRODUCTOS CON DESCRIPCIONES A MEJORAR');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`\nTotal productos analizados: ${products.length}`);
console.log(`Productos con problemas: ${problemas.length}\n`);

problemas.forEach((p, i) => {
    console.log(`\n${i + 1}. [${p.id}] ${p.name}`);
    console.log(`   Descripción: "${p.description}"`);
    console.log(`   LongDesc: "${p.longDescription}"`);
    p.issues.forEach(issue => console.log(`   ${issue}`));
});

// Resumen por tipo de problema
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  RESUMEN POR TIPO DE PROBLEMA');
console.log('═══════════════════════════════════════════════════════════════');

const conteo = {};
problemas.forEach(p => {
    p.issues.forEach(issue => {
        const tipo = issue.split(' ').slice(1).join(' ');
        conteo[tipo] = (conteo[tipo] || 0) + 1;
    });
});

Object.entries(conteo).sort((a, b) => b[1] - a[1]).forEach(([tipo, cant]) => {
    console.log(`  ${cant} productos: ${tipo}`);
});

// Generar archivo CSV para revisión
const csvLines = ['ID,Nombre,Categoría,Descripción Actual,Problemas'];
problemas.forEach(p => {
    const prod = products.find(pr => pr.id === p.id);
    const cat = prod ? prod.category : '';
    const desc = (prod?.description || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const issues = p.issues.map(i => i.replace(/[⚠️❌]/g, '').trim()).join(' | ');
    csvLines.push(`"${p.id}","${p.name.replace(/"/g, '""')}","${cat}","${desc}","${issues}"`);
});

fs.writeFileSync('./reporte-descripciones-mejorar.csv', csvLines.join('\n'), 'utf8');
console.log('\n✅ Archivo CSV generado: reporte-descripciones-mejorar.csv');

// Generar JSON detallado
const reporteJSON = {
    fecha: new Date().toISOString(),
    totalProductos: products.length,
    productosConProblemas: problemas.length,
    resumenProblemas: conteo,
    productos: problemas.map(p => {
        const prod = products.find(pr => pr.id === p.id);
        return {
            id: p.id,
            name: p.name,
            category: prod?.category || '',
            subcategory: prod?.subcategory || '',
            descriptionActual: prod?.description || '',
            longDescriptionActual: prod?.longDescription || '',
            problemas: p.issues
        };
    })
};

fs.writeFileSync('./reporte-descripciones-mejorar.json', JSON.stringify(reporteJSON, null, 2), 'utf8');
console.log('✅ Archivo JSON generado: reporte-descripciones-mejorar.json');
