/**
 * Script para unificar COMEDERO REDONDO PETS PLAST (Chico, Mediano, Grande) en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_828', 'prod_829', 'prod_830'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_828",
    "name": "COMEDERO REDONDO PETS PLAST",
    "category": "accesorios",
    "subcategory": "Comederos",
    "hasVariants": true,
    "basePrice": 1360, // Precio más bajo (Chico)
    "baseOriginalPrice": 1600,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0), // Stock total
    "rating": 3.7, // Promedio aproximado
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0), // Total reviews: 5+38+20=63
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "comedero",
        "redondo",
        "pets plast",
        "bebedero",
        "alimentación",
        "agua",
        "perros",
        "gatos"
    ],
    "description": "Comedero redondo Pets Plast de plástico resistente. Disponible en tamaño Chico, Mediano y Grande.",
    "longDescription": "Comedero redondo marca Pets Plast de plástico de alta calidad. Ideal para perros y gatos. Fácil de limpiar y mantener. Disponible en tres tamaños para adaptarse a las necesidades de tu mascota.",
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
                "id": "var_828_1",
                "attributes": { "Tamaño": "Chico" },
                "price": 1360,
                "originalPrice": 1600,
                "stock": 10,
                "sku": "COM044",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_828/cover.jpg",
                    "thumb": "assets/images/products/prod_828/thumb.jpg",
                    "gallery": ["assets/images/products/prod_828/1.jpg"]
                }
            },
            {
                "id": "var_828_2",
                "attributes": { "Tamaño": "Mediano" },
                "price": 2125,
                "originalPrice": 2500,
                "stock": 10,
                "sku": "COM045",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_829/cover.jpg",
                    "thumb": "assets/images/products/prod_829/thumb.jpg",
                    "gallery": ["assets/images/products/prod_829/1.jpg"]
                }
            },
            {
                "id": "var_828_3",
                "attributes": { "Tamaño": "Grande" },
                "price": 2550,
                "originalPrice": 3000,
                "stock": 10,
                "sku": "COM046",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_830/cover.jpg",
                    "thumb": "assets/images/products/prod_830/thumb.jpg",
                    "gallery": ["assets/images/products/prod_830/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_828/cover.jpg",
        "thumb": "assets/images/products/prod_828/thumb.jpg",
        "gallery": ["assets/images/products/prod_828/1.jpg"]
    },
    "specs": {
        "SKU": "COM044",
        "Material": "Plástico resistente",
        "Marca": "Pets Plast",
        "Tamaños disponibles": "Chico, Mediano, Grande"
    },
    "shipping": {
        "free": false,
        "days": 3
    },
    "badge": "🍽️ Comederos",
    "brand": "Pets Plast",
    "sku": "COM044",
    "features": [
        "Múltiples tamaños disponibles",
        "Fácil de limpiar",
        "Antideslizante",
        "Capacidad adecuada",
        "Material duradero"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_829', 'prod_830']; // Eliminar Mediano y Grande
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_828 con el producto unificado
const index828 = productosActualizados.findIndex(p => p.id === 'prod_828');
if (index828 !== -1) {
    productosActualizados[index828] = productoUnificado;
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
