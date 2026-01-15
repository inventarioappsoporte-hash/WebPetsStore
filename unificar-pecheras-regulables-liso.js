/**
 * Script para unificar PECHERAS REGULABLES LISO en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_739', 'prod_740', 'prod_741', 'prod_742', 'prod_743'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_739",
    "name": "PECHERAS REGULABLES LISO",
    "category": "accesorios",
    "subcategory": "Accesorios",
    "hasVariants": true,
    "basePrice": 4675,
    "baseOriginalPrice": 5500,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0),
    "rating": 4.4,
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0),
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "pecheras",
        "regulables",
        "liso",
        "collar",
        "correa",
        "paseo",
        "pechera",
        "perros"
    ],
    "description": "Pechera regulable lisa. Disponible en múltiples tamaños.",
    "longDescription": "Pechera regulable lisa de alta calidad para perros. Ajuste cómodo y seguro. Material resistente y duradero. Disponible en varios tamaños y colores para adaptarse a tu mascota.",
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
                "id": "var_739_1",
                "attributes": { "Tamaño": "N° 1" },
                "price": 4675,
                "originalPrice": 5500,
                "stock": 10,
                "sku": "PEC005",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_739/cover.jpg",
                    "thumb": "assets/images/products/prod_739/thumb.jpg",
                    "gallery": ["assets/images/products/prod_739/1.jpg"]
                }
            },
            {
                "id": "var_739_2",
                "attributes": { "Tamaño": "N° 2" },
                "price": 5100,
                "originalPrice": 6000,
                "stock": 10,
                "sku": "PEC006",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_740/cover.jpg",
                    "thumb": "assets/images/products/prod_740/thumb.jpg",
                    "gallery": ["assets/images/products/prod_740/1.jpg"]
                }
            },
            {
                "id": "var_739_3",
                "attributes": { "Tamaño": "N° 3" },
                "price": 7565,
                "originalPrice": 8900,
                "stock": 10,
                "sku": "PEC007",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_741/cover.jpg",
                    "thumb": "assets/images/products/prod_741/thumb.jpg",
                    "gallery": ["assets/images/products/prod_741/1.jpg"]
                }
            },
            {
                "id": "var_739_4",
                "attributes": { "Tamaño": "N° 4" },
                "price": 8330,
                "originalPrice": 9800,
                "stock": 10,
                "sku": "PEC008",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_742/cover.jpg",
                    "thumb": "assets/images/products/prod_742/thumb.jpg",
                    "gallery": ["assets/images/products/prod_742/1.jpg"]
                }
            },
            {
                "id": "var_739_5",
                "attributes": { "Tamaño": "N° 5" },
                "price": 8925,
                "originalPrice": 10500,
                "stock": 10,
                "sku": "PEC009",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_743/cover.jpg",
                    "thumb": "assets/images/products/prod_743/thumb.jpg",
                    "gallery": ["assets/images/products/prod_743/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_739/cover.jpg",
        "thumb": "assets/images/products/prod_739/thumb.jpg",
        "gallery": ["assets/images/products/prod_739/1.jpg"]
    },
    "specs": {
        "SKU": "PEC005",
        "Material": "Nylon resistente",
        "Tamaños disponibles": "N°1, N°2, N°3, N°4, N°5"
    },
    "shipping": {
        "free": false,
        "days": 3
    },
    "badge": "🦴 Accesorios",
    "brand": "Sin marca",
    "sku": "PEC005",
    "features": [
        "Múltiples tamaños disponibles",
        "Ajuste cómodo",
        "Material resistente",
        "Fácil de usar",
        "Seguro y confiable"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_740', 'prod_741', 'prod_742', 'prod_743'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_739 con el producto unificado
const index739 = productosActualizados.findIndex(p => p.id === 'prod_739');
if (index739 !== -1) {
    productosActualizados[index739] = productoUnificado;
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
