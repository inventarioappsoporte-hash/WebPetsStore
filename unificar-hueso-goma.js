/**
 * Script para unificar HUESO DE GOMA en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_275', 'prod_276', 'prod_277'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_275",
    "name": "HUESO DE GOMA",
    "category": "juguetes",
    "subcategory": "Juguetes",
    "hasVariants": true,
    "basePrice": 2652, // Precio más bajo (Chico)
    "baseOriginalPrice": 3120,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0),
    "rating": 4.5, // Promedio aproximado
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0),
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "hueso",
        "goma",
        "juguete",
        "entretenimiento",
        "diversión",
        "interactivo",
        "perros",
        "mordedor"
    ],
    "description": "Hueso de goma resistente para perros. Disponible en varios tamaños.",
    "longDescription": "Hueso de goma de alta calidad, ideal para el entretenimiento y la salud dental de tu mascota. Material seguro y resistente a mordidas. Disponible en tamaños chico, mediano y grande.",
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
                "id": "var_275_1",
                "attributes": { "Tamaño": "Chico" },
                "price": 2652,
                "originalPrice": 3120,
                "stock": 5,
                "sku": "HUE003",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_277/cover.jpg",
                    "thumb": "assets/images/products/prod_277/thumb.jpg",
                    "gallery": ["assets/images/products/prod_277/1.jpg"]
                }
            },
            {
                "id": "var_275_2",
                "attributes": { "Tamaño": "Mediano" },
                "price": 3094,
                "originalPrice": 3640,
                "stock": 5,
                "sku": "HUE002",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_276/cover.jpg",
                    "thumb": "assets/images/products/prod_276/thumb.jpg",
                    "gallery": ["assets/images/products/prod_276/1.jpg"]
                }
            },
            {
                "id": "var_275_3",
                "attributes": { "Tamaño": "Grande" },
                "price": 5746,
                "originalPrice": 6760,
                "stock": 5,
                "sku": "HUE001",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_275/cover.jpg",
                    "thumb": "assets/images/products/prod_275/thumb.jpg",
                    "gallery": ["assets/images/products/prod_275/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_275/cover.jpg",
        "thumb": "assets/images/products/prod_275/thumb.jpg",
        "gallery": ["assets/images/products/prod_275/1.jpg"]
    },
    "specs": {
        "SKU": "HUE001",
        "Material": "Goma resistente",
        "Tamaños disponibles": "Chico, Mediano, Grande"
    },
    "shipping": {
        "free": false,
        "days": 3
    },
    "badge": "🎾 Juguetes",
    "brand": "Sin marca",
    "sku": "HUE001",
    "features": [
        "Múltiples tamaños disponibles",
        "Estimula el juego",
        "Material seguro",
        "Resistente a mordidas",
        "Entretenimiento garantizado"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_276', 'prod_277'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_275 con el producto unificado
const index275 = productosActualizados.findIndex(p => p.id === 'prod_275');
if (index275 !== -1) {
    productosActualizados[index275] = productoUnificado;
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
