/**
 * Script para unificar PLATO CUADRADO (Chico, Mediano, Grande) en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_837', 'prod_838', 'prod_839'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_837",
    "name": "PLATO CUADRADO",
    "category": "accesorios",
    "subcategory": "Comederos",
    "hasVariants": true,
    "basePrice": 1275,
    "baseOriginalPrice": 1500,
    "discount": 15,
    "stock": 30,
    "rating": 4.0,
    "reviews": 102,
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "plato",
        "cuadrado",
        "comedero",
        "bebedero",
        "alimentación",
        "agua",
        "perros",
        "gatos"
    ],
    "description": "Plato cuadrado de plástico resistente. Disponible en tamaño Chico, Mediano y Grande.",
    "longDescription": "Plato cuadrado de plástico de alta calidad. Ideal para perros y gatos. Fácil de limpiar y mantener. Disponible en tres tamaños para adaptarse a las necesidades de tu mascota.",
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
                "id": "var_837_1",
                "attributes": { "Tamaño": "Chico" },
                "price": 1275,
                "originalPrice": 1500,
                "stock": 10,
                "sku": "PLA001",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_837/cover.jpg",
                    "thumb": "assets/images/products/prod_837/thumb.jpg",
                    "gallery": ["assets/images/products/prod_837/1.jpg"]
                }
            },
            {
                "id": "var_837_2",
                "attributes": { "Tamaño": "Mediano" },
                "price": 1785,
                "originalPrice": 2100,
                "stock": 10,
                "sku": "PLA002",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_838/cover.jpg",
                    "thumb": "assets/images/products/prod_838/thumb.jpg",
                    "gallery": ["assets/images/products/prod_838/1.jpg"]
                }
            },
            {
                "id": "var_837_3",
                "attributes": { "Tamaño": "Grande" },
                "price": 2210,
                "originalPrice": 2600,
                "stock": 10,
                "sku": "PLA003",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_839/cover.jpg",
                    "thumb": "assets/images/products/prod_839/thumb.jpg",
                    "gallery": ["assets/images/products/prod_839/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_837/cover.jpg",
        "thumb": "assets/images/products/prod_837/thumb.jpg",
        "gallery": ["assets/images/products/prod_837/1.jpg"]
    },
    "specs": {
        "SKU": "PLA001",
        "Material": "Plástico resistente",
        "Tamaños disponibles": "Chico, Mediano, Grande"
    },
    "shipping": {
        "free": false,
        "days": 3
    },
    "badge": "🍽️ Comederos",
    "brand": "Sin marca",
    "sku": "PLA001",
    "features": [
        "Múltiples tamaños disponibles",
        "Fácil de limpiar",
        "Antideslizante",
        "Capacidad adecuada",
        "Material duradero"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_838', 'prod_839'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_837 con el producto unificado
const index837 = productosActualizados.findIndex(p => p.id === 'prod_837');
if (index837 !== -1) {
    productosActualizados[index837] = productoUnificado;
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
