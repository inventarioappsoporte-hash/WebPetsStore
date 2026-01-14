/**
 * Script para unificar COMEDERO REDONDO (Chico, Mediano, Grande) en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_825', 'prod_826', 'prod_827'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_825",
    "name": "COMEDERO REDONDO",
    "category": "accesorios",
    "subcategory": "Comederos",
    "hasVariants": true,
    "basePrice": 1530, // Precio más bajo (Chico)
    "baseOriginalPrice": 1800,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0), // Stock total
    "rating": 4.4, // Promedio aproximado de los tres
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0), // Total reviews: 44+23+13=80
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "comedero",
        "redondo",
        "bebedero",
        "alimentación",
        "agua",
        "perros",
        "gatos"
    ],
    "description": "Comedero redondo de plástico resistente. Disponible en tamaño Chico, Mediano y Grande.",
    "longDescription": "Comedero redondo de plástico de alta calidad. Ideal para perros y gatos. Fácil de limpiar y mantener. Disponible en tres tamaños para adaptarse a las necesidades de tu mascota.",
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
                "id": "var_825_1",
                "attributes": { "Tamaño": "Chico" },
                "price": 1530,
                "originalPrice": 1800,
                "stock": 10,
                "sku": "COM041",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_825/cover.jpg",
                    "thumb": "assets/images/products/prod_825/thumb.jpg",
                    "gallery": ["assets/images/products/prod_825/1.jpg"]
                }
            },
            {
                "id": "var_825_2",
                "attributes": { "Tamaño": "Mediano" },
                "price": 2125,
                "originalPrice": 2500,
                "stock": 10,
                "sku": "COM042",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_826/cover.jpg",
                    "thumb": "assets/images/products/prod_826/thumb.jpg",
                    "gallery": ["assets/images/products/prod_826/1.jpg"]
                }
            },
            {
                "id": "var_825_3",
                "attributes": { "Tamaño": "Grande" },
                "price": 2975,
                "originalPrice": 3500,
                "stock": 10,
                "sku": "COM043",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_827/cover.jpg",
                    "thumb": "assets/images/products/prod_827/thumb.jpg",
                    "gallery": ["assets/images/products/prod_827/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_825/cover.jpg",
        "thumb": "assets/images/products/prod_825/thumb.jpg",
        "gallery": ["assets/images/products/prod_825/1.jpg"]
    },
    "specs": {
        "SKU": "COM041",
        "Material": "Plástico resistente",
        "Tamaños disponibles": "Chico, Mediano, Grande"
    },
    "shipping": {
        "free": false,
        "days": 3
    },
    "badge": "🍽️ Comederos",
    "brand": "Sin marca",
    "sku": "COM041",
    "features": [
        "Múltiples tamaños disponibles",
        "Fácil de limpiar",
        "Antideslizante",
        "Capacidad adecuada",
        "Material duradero"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_826', 'prod_827']; // Eliminar Mediano y Grande
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_825 con el producto unificado
const index825 = productosActualizados.findIndex(p => p.id === 'prod_825');
if (index825 !== -1) {
    productosActualizados[index825] = productoUnificado;
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
