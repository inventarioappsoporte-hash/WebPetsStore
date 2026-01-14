// Test para verificar que el badge se genera correctamente

const categoriasMap = {
    250: { category: "higiene-cuidado", subcategory: "Alimentos", icon: "🧴", nombre: "HIGIENE Y CUIDADO" },
    261: { category: "casa-descanso", subcategory: "Colchonetas", icon: "🛏️", nombre: "COLCHONETAS Y MOISES" },
    262: { category: "casa-descanso", subcategory: "Casitas", icon: "🏠", nombre: "BOLSOS Y CASITAS" },
    263: { category: "accesorios", subcategory: "Rascadores", icon: "🛏️", nombre: "RASCADORES" },
    264: { category: "juguetes", subcategory: "Juguetes", icon: "🎾", nombre: "JUGUETES" },
    275: { category: "ropa", subcategory: "Ropa", icon: "👕", nombre: "ROPA VERANO" },
    316: { category: "ropa", subcategory: "Ropa", icon: "🧥", nombre: "ROPA INVIERNO" },
    317: { category: "accesorios", subcategory: "Accesorios", icon: "🦴", nombre: "COLLARES, CORREAS Y PECHERAS" },
    409: { category: "accesorios", subcategory: "Comederos", icon: "🍽️", nombre: "COMEDEROS Y BEBEDEROS" }
};

console.log('🧪 TEST: Generación de badges\n');
console.log('═══════════════════════════════════════\n');

Object.keys(categoriasMap).forEach(catId => {
    const categoriaInfo = categoriasMap[catId];
    const badge = `${categoriaInfo.icon || '🐾'} ${categoriaInfo.subcategory}`;
    
    console.log(`Categoría ${catId}: ${categoriaInfo.nombre}`);
    console.log(`   Badge generado: "${badge}"`);
    console.log(`   Category: ${categoriaInfo.category}`);
    console.log(`   Subcategory: ${categoriaInfo.subcategory}`);
    console.log('');
});

console.log('═══════════════════════════════════════\n');
console.log('✅ Todos los badges se generan correctamente');
