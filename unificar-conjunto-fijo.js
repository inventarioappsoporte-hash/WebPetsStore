/**
 * Script para unificar CONJUNTO FIJO en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_745', 'prod_746', 'prod_747', 'prod_748', 'prod_749', 'prod_750', 'prod_751', 'prod_752', 'prod_753'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_745",
    "name": "CONJUNTO FIJO",
    "category": "accesorios",
    "subcategory": "Accesorios",
    "hasVariants": true,
    "basePrice": 5780,
    "baseOriginalPrice": 6800,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0),
    "rating": 4.2,
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0),
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "conjunto",
        "fijo",
        "collar",
        "correa",
        "paseo",
        "pechera",
        "perros"
    ],
    "description": "Conjunto fijo collar y correa. Disponible en múltiples tamaños.",
    "longDescription": "Conjunto fijo de collar y correa para perros. Material resistente y duradero. Ajuste cómodo y seguro. Disponible en varios tamaños para adaptarse a tu mascota.",
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
                "id": "var_745_1",
                "attributes": { "Tamaño": "N°0" },
                "price": 5780,
                "originalPrice": 6800,
                "stock": 10,
                "sku": "CON003",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_745/cover.jpg",
                    "thumb": "assets/images/products/prod_745/thumb.jpg",
                    "gallery": ["assets/images/products/prod_745/1.jpg"]
                }
            },
            {
                "id": "var_745_2",
                "attributes": { "Tamaño": "N°1 (p15)" },
                "price": 6460,
                "originalPrice": 7600,
                "stock": 10,
                "sku": "CON004",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_746/cover.jpg",
                    "thumb": "assets/images/products/prod_746/thumb.jpg",
                    "gallery": ["assets/images/products/prod_746/1.jpg"]
                }
            },
            {
                "id": "var_745_3",
                "attributes": { "Tamaño": "N°2 (p20)" },
                "price": 7650,
                "originalPrice": 9000,
                "stock": 10,
                "sku": "CON007",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_747/cover.jpg",
                    "thumb": "assets/images/products/prod_747/thumb.jpg",
                    "gallery": ["assets/images/products/prod_747/1.jpg"]
                }
            },
            {
                "id": "var_745_4",
                "attributes": { "Tamaño": "N°3 (p20)" },
                "price": 7905,
                "originalPrice": 9300,
                "stock": 10,
                "sku": "CON008",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_748/cover.jpg",
                    "thumb": "assets/images/products/prod_748/thumb.jpg",
                    "gallery": ["assets/images/products/prod_748/1.jpg"]
                }
            },
            {
                "id": "var_745_5",
                "attributes": { "Tamaño": "N°4 (p20)" },
                "price": 8330,
                "originalPrice": 9800,
                "stock": 10,
                "sku": "CON009",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_749/cover.jpg",
                    "thumb": "assets/images/products/prod_749/thumb.jpg",
                    "gallery": ["assets/images/products/prod_749/1.jpg"]
                }
            },
            {
                "id": "var_745_6",
                "attributes": { "Tamaño": "N°5 (p25)" },
                "price": 10625,
                "originalPrice": 12500,
                "stock": 10,
                "sku": "CON010",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_750/cover.jpg",
                    "thumb": "assets/images/products/prod_750/thumb.jpg",
                    "gallery": ["assets/images/products/prod_750/1.jpg"]
                }
            },
            {
                "id": "var_745_7",
                "attributes": { "Tamaño": "N°6 (p25)" },
                "price": 11475,
                "originalPrice": 13500,
                "stock": 10,
                "sku": "CON011",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_751/cover.jpg",
                    "thumb": "assets/images/products/prod_751/thumb.jpg",
                    "gallery": ["assets/images/products/prod_751/1.jpg"]
                }
            },
            {
                "id": "var_745_8",
                "attributes": { "Tamaño": "N°7 (p30)" },
                "price": 13345,
                "originalPrice": 15700,
                "stock": 10,
                "sku": "CON012",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_752/cover.jpg",
                    "thumb": "assets/images/products/prod_752/thumb.jpg",
                    "gallery": ["assets/images/products/prod_752/1.jpg"]
                }
            },
            {
                "id": "var_745_9",
                "attributes": { "Tamaño": "N°8 (p30)" },
                "price": 14110,
                "originalPrice": 16600,
                "stock": 10,
                "sku": "CON021",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_753/cover.jpg",
                    "thumb": "assets/images/products/prod_753/thumb.jpg",
                    "gallery": ["assets/images/products/prod_753/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_745/cover.jpg",
        "thumb": "assets/images/products/prod_745/thumb.jpg",
        "gallery": ["assets/images/products/prod_745/1.jpg"]
    },
    "specs": {
        "SKU": "CON003",
        "Material": "Nylon resistente",
        "Tamaños disponibles": "N°0, N°1, N°2, N°3, N°4, N°5, N°6, N°7, N°8"
    },
    "shipping": {
        "free": false,
        "days": 3
    },
    "badge": "🦴 Accesorios",
    "brand": "Sin marca",
    "sku": "CON003",
    "features": [
        "Múltiples tamaños disponibles",
        "Ajuste cómodo",
        "Material resistente",
        "Fácil de usar",
        "Seguro y confiable"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_746', 'prod_747', 'prod_748', 'prod_749', 'prod_750', 'prod_751', 'prod_752', 'prod_753'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_745 con el producto unificado
const index745 = productosActualizados.findIndex(p => p.id === 'prod_745');
if (index745 !== -1) {
    productosActualizados[index745] = productoUnificado;
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
