/**
 * Script para unificar BEBEDERO PARA SOPORTE DE ALAMBRE (100L, 250L, 450L) en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_864', 'prod_865', 'prod_866'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_864",
    "name": "BEBEDERO PARA SOPORTE DE ALAMBRE",
    "category": "accesorios",
    "subcategory": "Comederos",
    "hasVariants": true,
    "basePrice": 4080, // Precio más bajo (100L)
    "baseOriginalPrice": 4800,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0), // Stock total
    "rating": 4.2, // Promedio aproximado de los tres (4.4+4.3+4)/3
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0), // Total reviews: 9+6+43=58
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "bebedero",
        "soporte",
        "alambre",
        "colores",
        "surtidos",
        "comedero",
        "alimentación",
        "agua"
    ],
    "description": "Bebedero para soporte de alambre, colores surtidos. Disponible en capacidades de 100L, 250L y 450L.",
    "longDescription": "Bebedero de alta calidad para soporte de alambre. Ideal para jaulas y transportadoras. Fácil de instalar y limpiar. Disponible en tres capacidades para adaptarse a las necesidades de tu mascota.",
    "variants": {
        "attributes": [
            {
                "id": "capacity",
                "name": "Capacidad",
                "type": "size"
            }
        ],
        "combinations": [
            {
                "id": "var_864_1",
                "attributes": { "Capacidad": "100L" },
                "price": 4080,
                "originalPrice": 4800,
                "stock": 10,
                "sku": "BEB009",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_864/cover.jpg",
                    "thumb": "assets/images/products/prod_864/thumb.jpg",
                    "gallery": ["assets/images/products/prod_864/1.jpg"]
                }
            },
            {
                "id": "var_864_2",
                "attributes": { "Capacidad": "250L" },
                "price": 5100,
                "originalPrice": 6000,
                "stock": 10,
                "sku": "BEB010",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_865/cover.jpg",
                    "thumb": "assets/images/products/prod_865/thumb.jpg",
                    "gallery": ["assets/images/products/prod_865/1.jpg"]
                }
            },
            {
                "id": "var_864_3",
                "attributes": { "Capacidad": "450L" },
                "price": 5950,
                "originalPrice": 7000,
                "stock": 10,
                "sku": "BEB011",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_866/cover.jpg",
                    "thumb": "assets/images/products/prod_866/thumb.jpg",
                    "gallery": ["assets/images/products/prod_866/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_864/cover.jpg",
        "thumb": "assets/images/products/prod_864/thumb.jpg",
        "gallery": ["assets/images/products/prod_864/1.jpg"]
    },
    "specs": {
        "SKU": "BEB009",
        "Material": "Plástico resistente",
        "Capacidades disponibles": "100L, 250L, 450L"
    },
    "shipping": {
        "free": false,
        "days": 2
    },
    "badge": "🍽️ Comederos",
    "brand": "Sin marca",
    "sku": "BEB009",
    "features": [
        "Múltiples capacidades disponibles",
        "Fácil de limpiar",
        "Fácil instalación en alambre",
        "Colores surtidos",
        "Material duradero"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_865', 'prod_866']; // Eliminar 250L y 450L
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_864 con el producto unificado
const index864 = productosActualizados.findIndex(p => p.id === 'prod_864');
if (index864 !== -1) {
    productosActualizados[index864] = productoUnificado;
}

console.log(`\n✅ Producto unificado creado con ${productoUnificado.variants.combinations.length} variantes`);
console.log(`📊 Productos antes: ${products.length}`);
console.log(`📊 Productos después: ${productosActualizados.length}`);
console.log(`📊 Productos eliminados: ${products.length - productosActualizados.length}`);

// Guardar
fs.writeFileSync(productsPath, JSON.stringify(productosActualizados, null, 2), 'utf8');

console.log('\n✅ Archivo products.json actualizado correctamente');
console.log('\n📦 Producto unificado:');
console.log(JSON.stringify(productoUnificado, null, 2));
