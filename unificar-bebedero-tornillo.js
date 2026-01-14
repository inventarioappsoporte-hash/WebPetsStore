/**
 * Script para unificar BEBEDERO CON TORNILLO FIJADOR (125ML, 250ML, 500ML) en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_867', 'prod_868', 'prod_869'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_867",
    "name": "BEBEDERO CON TORNILLO FIJADOR",
    "category": "accesorios",
    "subcategory": "Comederos",
    "hasVariants": true,
    "basePrice": 6800, // Precio más bajo (125ML)
    "baseOriginalPrice": 8000,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0),
    "rating": 4.0, // Promedio aproximado
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0), // 44+38+8=90
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "bebedero",
        "tornillo",
        "fijador",
        "comedero",
        "alimentación",
        "agua"
    ],
    "description": "Bebedero con tornillo fijador. Disponible en capacidades de 125ML, 250ML y 500ML.",
    "longDescription": "Bebedero de alta calidad con sistema de tornillo fijador para una instalación segura. Ideal para jaulas y transportadoras. Fácil de instalar y limpiar. Disponible en tres capacidades.",
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
                "id": "var_867_1",
                "attributes": { "Capacidad": "125 ML" },
                "price": 6800,
                "originalPrice": 8000,
                "stock": 10,
                "sku": "BEB012",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_867/cover.jpg",
                    "thumb": "assets/images/products/prod_867/thumb.jpg",
                    "gallery": ["assets/images/products/prod_867/1.jpg"]
                }
            },
            {
                "id": "var_867_2",
                "attributes": { "Capacidad": "250 ML" },
                "price": 8075,
                "originalPrice": 9500,
                "stock": 10,
                "sku": "BEB013",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_868/cover.jpg",
                    "thumb": "assets/images/products/prod_868/thumb.jpg",
                    "gallery": ["assets/images/products/prod_868/1.jpg"]
                }
            },
            {
                "id": "var_867_3",
                "attributes": { "Capacidad": "500 ML" },
                "price": 10200,
                "originalPrice": 12000,
                "stock": 10,
                "sku": "BEB014",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_869/cover.jpg",
                    "thumb": "assets/images/products/prod_869/thumb.jpg",
                    "gallery": ["assets/images/products/prod_869/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_867/cover.jpg",
        "thumb": "assets/images/products/prod_867/thumb.jpg",
        "gallery": ["assets/images/products/prod_867/1.jpg"]
    },
    "specs": {
        "SKU": "BEB012",
        "Material": "Plástico resistente",
        "Capacidades disponibles": "125ML, 250ML, 500ML"
    },
    "shipping": {
        "free": false,
        "days": 3
    },
    "badge": "🍽️ Comederos",
    "brand": "Sin marca",
    "sku": "BEB012",
    "features": [
        "Múltiples capacidades disponibles",
        "Sistema de tornillo fijador",
        "Fácil de limpiar",
        "Instalación segura",
        "Material duradero"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_868', 'prod_869'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_867 con el producto unificado
const index867 = productosActualizados.findIndex(p => p.id === 'prod_867');
if (index867 !== -1) {
    productosActualizados[index867] = productoUnificado;
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
