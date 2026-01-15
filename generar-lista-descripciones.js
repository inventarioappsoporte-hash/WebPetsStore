const fs = require('fs');

const reporte = JSON.parse(fs.readFileSync('./reporte-descripciones-mejorar.json', 'utf8'));

// Agrupar por categoría
const porCategoria = {};
reporte.productos.forEach(p => {
    const cat = p.category || 'sin-categoria';
    if (!porCategoria[cat]) porCategoria[cat] = [];
    porCategoria[cat].push(p);
});

let output = `# PRODUCTOS CON DESCRIPCIONES A MEJORAR
Fecha: ${new Date().toLocaleDateString('es-AR')}
Total productos: ${reporte.totalProductos}
Productos con problemas: ${reporte.productosConProblemas}

## RESUMEN POR TIPO DE PROBLEMA
`;

Object.entries(reporte.resumenProblemas)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tipo, cant]) => {
        output += `- ${cant} productos: ${tipo}\n`;
    });

output += `\n---\n\n## LISTA COMPLETA POR CATEGORÍA\n\n`;

Object.entries(porCategoria)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([cat, productos]) => {
        output += `### ${cat.toUpperCase()} (${productos.length} productos)\n\n`;
        output += `| ID | Nombre | Descripción Actual | Problemas |\n`;
        output += `|---|---|---|---|\n`;
        
        productos.forEach(p => {
            const desc = p.descriptionActual.substring(0, 50).replace(/\|/g, '/').replace(/\n/g, ' ');
            const probs = p.problemas.map(pr => pr.replace(/[⚠️❌]/g, '').trim()).join(', ');
            output += `| ${p.id} | ${p.name.substring(0, 40)} | ${desc}${p.descriptionActual.length > 50 ? '...' : ''} | ${probs} |\n`;
        });
        
        output += `\n`;
    });

fs.writeFileSync('./LISTA_DESCRIPCIONES_MEJORAR.md', output, 'utf8');
console.log('✅ Archivo generado: LISTA_DESCRIPCIONES_MEJORAR.md');
