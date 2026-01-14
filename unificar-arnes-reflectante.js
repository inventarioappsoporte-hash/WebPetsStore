/**
 * Script para unificar ARNES REFLECTANTE en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_700', 'prod_701', 'prod_702'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_700",
    "name": "ARNES REFLECTANTE",
    "category": "accesorios",
    "subcategory": "Accesorios",
    "hasVariants": true,
    "basePrice": 8500,
    "baseOriginalPrice": 10000,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0),
    "rating": 4.2,
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0),
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "arnes",
        "reflectante",
        "collar",
        "correa",
        "paseo",
        "pechera",
        "perros",
        "seguridad"
    ],
    "description": "Arnés reflectante de alta calidad. Disponible en múltiples tamaños.",
    "longDescription": "Arnés reflectante para perros, ideal para paseos nocturnos. Material resistente y cómodo. Bandas reflectantes para mayor visibilidad y seguridad. Disponible en varios tamaños para adaptarse a tu mascota.",
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
                "id": "var_700_1",
                "attributes": { "Tamaño": "1,0cm x 120cm x 1,0cm" },
                "price": 8500,
                "originalPrice": 10000,
                "stock": 10,
                "sku": "ARN001",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_700/cover.jpg",
                    "thumb": "assets/images/products/prod_700/thumb.jpg",
                    "gallery": ["assets/images/products/prod_700/1.jpg"]
                }
            },
            {
                "id": "var_700_2",
                "attributes": { "Tamaño": "1,0cm x 120cm x 2,0cm" },
                "price": 11900,
                "originalPrice": 14000,
                "stock": 10,
                "sku": "ARN002",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_701/cover.jpg",
                    "thumb": "assets/images/products/prod_701/thumb.jpg",
                    "gallery": ["assets/images/products/prod_701/1.jpg"]
                }
            },
            {
                "id": "var_700_3",
                "attributes": { "Tamaño": "1,2cm x 120cm x 2,5cm" },
                "price": 15300,
                "originalPrice": 18000,
                "stock": 10,
                "sku": "ARN003",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_702/cover.jpg",
                    "thumb": "assets/images/products/prod_702/thumb.jpg",
                    "gallery": ["assets/images/products/prod_702/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_700/cover.jpg",
        "thumb": "assets/images/products/prod_700/thumb.jpg",
        "gallery": ["assets/images/products/prod_700/1.jpg"]
    },
    "specs": {
        "SKU": "ARN001",
        "Material": "Nylon reflectante",
        "Tamaños disponibles": "1,0x120x1,0cm, 1,0x120x2,0cm, 1,2x120x2,5cm"
    },
    "shipping": {
        "free": false,
        "days": 2
    },
    "badge": "🦴 Accesorios",
    "brand": "Sin marca",
    "sku": "ARN001",
    "features": [
        "Múltiples tamaños disponibles",
        "Bandas reflectantes para seguridad nocturna",
        "Ajuste cómodo",
        "Material resistente",
        "Fácil de usar"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_701', 'prod_702'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_700 con el producto unificado
const index700 = productosActualizados.findIndex(p => p.id === 'prod_700');
if (index700 !== -1) {
    productosActualizados[index700] = productoUnificado;
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
