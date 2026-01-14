/**
 * Script para unificar COMEDERO ACERO INOXIDABLE en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_789', 'prod_790', 'prod_791', 'prod_792', 'prod_793', 'prod_794'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoBase = productosAUnificar[0]; // Usar el primero como base

const productoUnificado = {
    "id": "prod_789",
    "name": "COMEDERO ACERO INOXIDABLE",
    "category": "accesorios",
    "subcategory": "Comederos",
    "hasVariants": true,
    "basePrice": 3655, // Precio más bajo
    "baseOriginalPrice": 4300,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0), // Stock total
    "rating": 4.3, // Promedio aproximado
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0), // Total reviews
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "comedero",
        "acero",
        "inoxidable",
        "bebedero",
        "alimentación",
        "agua",
        "perros",
        "gatos"
    ],
    "description": "Comedero de acero inoxidable de alta calidad. Disponible en múltiples tamaños.",
    "longDescription": "Comedero de acero inoxidable resistente y duradero. Ideal para perros y gatos. Fácil de limpiar y mantener. Disponible en varios tamaños para adaptarse a las necesidades de tu mascota.",
    "variants": {
        "attributes": [
            {
                "id": "size",
                "name": "Tamaño",
                "type": "size"
            }
        ],
        "combinations": [
            {
                "id": "var_789_1",
                "attributes": { "Tamaño": "N°1 (15cm)" },
                "price": 3655,
                "originalPrice": 4300,
                "stock": 10,
                "sku": "COM009",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_789/cover.jpg",
                    "thumb": "assets/images/products/prod_789/thumb.jpg",
                    "gallery": ["assets/images/products/prod_789/1.jpg"]
                }
            },
            {
                "id": "var_789_2",
                "attributes": { "Tamaño": "N°2 (18cm)" },
                "price": 5525,
                "originalPrice": 6500,
                "stock": 10,
                "sku": "COM010",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_790/cover.jpg",
                    "thumb": "assets/images/products/prod_790/thumb.jpg",
                    "gallery": ["assets/images/products/prod_790/1.jpg"]
                }
            },
            {
                "id": "var_789_3",
                "attributes": { "Tamaño": "N°3 (22cm)" },
                "price": 6800,
                "originalPrice": 8000,
                "stock": 10,
                "sku": "COM011",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_791/cover.jpg",
                    "thumb": "assets/images/products/prod_791/thumb.jpg",
                    "gallery": ["assets/images/products/prod_791/1.jpg"]
                }
            },
            {
                "id": "var_789_4",
                "attributes": { "Tamaño": "N°4 (26cm)" },
                "price": 7650,
                "originalPrice": 9000,
                "stock": 10,
                "sku": "COM012",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_792/cover.jpg",
                    "thumb": "assets/images/products/prod_792/thumb.jpg",
                    "gallery": ["assets/images/products/prod_792/1.jpg"]
                }
            },
            {
                "id": "var_789_5",
                "attributes": { "Tamaño": "N°6 (34cm)" },
                "price": 13430,
                "originalPrice": 15800,
                "stock": 10,
                "sku": "COM013",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_793/cover.jpg",
                    "thumb": "assets/images/products/prod_793/thumb.jpg",
                    "gallery": ["assets/images/products/prod_793/1.jpg"]
                }
            },
            {
                "id": "var_789_6",
                "attributes": { "Tamaño": "N°7 (38cm)" },
                "price": 18360,
                "originalPrice": 21600,
                "stock": 10,
                "sku": "COM014",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_794/cover.jpg",
                    "thumb": "assets/images/products/prod_794/thumb.jpg",
                    "gallery": ["assets/images/products/prod_794/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_789/cover.jpg",
        "thumb": "assets/images/products/prod_789/thumb.jpg",
        "gallery": ["assets/images/products/prod_789/1.jpg"]
    },
    "specs": {
        "SKU": "COM009",
        "Material": "Acero Inoxidable",
        "Tamaños disponibles": "15cm, 18cm, 22cm, 26cm, 34cm, 38cm"
    },
    "shipping": {
        "free": false,
        "days": 3
    },
    "badge": "🍽️ Comederos",
    "brand": "Sin marca",
    "sku": "COM009",
    "features": [
        "Múltiples tamaños disponibles",
        "Fácil de limpiar",
        "Antideslizante",
        "Material duradero",
        "Acero inoxidable de alta calidad"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_790', 'prod_791', 'prod_792', 'prod_793', 'prod_794'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_789 con el producto unificado
const index789 = productosActualizados.findIndex(p => p.id === 'prod_789');
if (index789 !== -1) {
    productosActualizados[index789] = productoUnificado;
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
