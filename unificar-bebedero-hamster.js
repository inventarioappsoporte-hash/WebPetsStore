/**
 * Script para unificar BEBEDERO PARA HAMSTER (LAND PET) en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_861', 'prod_862', 'prod_863'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_861",
    "name": "BEBEDERO PARA HAMSTER (LAND PET)",
    "category": "accesorios",
    "subcategory": "Comederos",
    "hasVariants": true,
    "basePrice": 2465,
    "baseOriginalPrice": 2900,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0),
    "rating": 4.3,
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0),
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "bebedero",
        "hamster",
        "land pet",
        "roedores",
        "agua",
        "pequeños animales"
    ],
    "description": "Bebedero para hamster Land Pet. Disponible en múltiples capacidades.",
    "longDescription": "Bebedero para hamster marca Land Pet. Ideal para roedores y pequeños animales. Fácil de instalar y limpiar. Disponible en varias capacidades para adaptarse a las necesidades de tu mascota.",
    "variants": {
        "attributes": [
            {
                "id": "size",
                "name": "Capacidad",
                "type": "size"
            }
        ],
        "combinations": [
            {
                "id": "var_861_1",
                "attributes": { "Capacidad": "T-1 (80ml)" },
                "price": 2465,
                "originalPrice": 2900,
                "stock": 10,
                "sku": "BEB006",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_861/cover.jpg",
                    "thumb": "assets/images/products/prod_861/thumb.jpg",
                    "gallery": ["assets/images/products/prod_861/1.jpg"]
                }
            },
            {
                "id": "var_861_2",
                "attributes": { "Capacidad": "T-2 (125ml)" },
                "price": 2805,
                "originalPrice": 3300,
                "stock": 10,
                "sku": "BEB007",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_862/cover.jpg",
                    "thumb": "assets/images/products/prod_862/thumb.jpg",
                    "gallery": ["assets/images/products/prod_862/1.jpg"]
                }
            },
            {
                "id": "var_861_3",
                "attributes": { "Capacidad": "T-3 (250ml)" },
                "price": 3400,
                "originalPrice": 4000,
                "stock": 10,
                "sku": "BEB008",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_863/cover.jpg",
                    "thumb": "assets/images/products/prod_863/thumb.jpg",
                    "gallery": ["assets/images/products/prod_863/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_861/cover.jpg",
        "thumb": "assets/images/products/prod_861/thumb.jpg",
        "gallery": ["assets/images/products/prod_861/1.jpg"]
    },
    "specs": {
        "SKU": "BEB006",
        "Marca": "Land Pet",
        "Capacidades disponibles": "80ml, 125ml, 250ml"
    },
    "shipping": {
        "free": false,
        "days": 2
    },
    "badge": "🍽️ Comederos",
    "brand": "Land Pet",
    "sku": "BEB006",
    "features": [
        "Múltiples capacidades disponibles",
        "Fácil de limpiar",
        "Fácil instalación",
        "Capacidad adecuada",
        "Material duradero"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_862', 'prod_863'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_861 con el producto unificado
const index861 = productosActualizados.findIndex(p => p.id === 'prod_861');
if (index861 !== -1) {
    productosActualizados[index861] = productoUnificado;
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
