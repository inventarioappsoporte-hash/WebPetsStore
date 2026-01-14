/**
 * Script para unificar PELOTA PULPO en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_260', 'prod_261', 'prod_262', 'prod_263'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price} (original: $${p.originalPrice})`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_260",
    "name": "PELOTA PULPO",
    "category": "juguetes",
    "subcategory": "Juguetes",
    "hasVariants": true,
    "basePrice": 4088,
    "baseOriginalPrice": 4810,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0),
    "rating": 3.8,
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0),
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "pelota",
        "pulpo",
        "juguete",
        "entretenimiento",
        "diversión",
        "interactivo",
        "perros",
        "mascotas"
    ],
    "description": "Pelota Pulpo para mascotas. Disponible en múltiples tamaños.",
    "longDescription": "Pelota Pulpo ideal para el entretenimiento de tu mascota. Diseño divertido con forma de pulpo que estimula el juego y la actividad física. Material seguro y resistente a mordidas. Disponible en varios tamaños para adaptarse a diferentes razas y preferencias.",
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
                "id": "var_260_1",
                "attributes": { "Tamaño": "N°3" },
                "price": 4088,
                "originalPrice": 4810,
                "stock": 5,
                "sku": "PEL020",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_260/cover.jpg",
                    "thumb": "assets/images/products/prod_260/thumb.jpg",
                    "gallery": ["assets/images/products/prod_260/1.jpg"]
                }
            },
            {
                "id": "var_260_2",
                "attributes": { "Tamaño": "N°4" },
                "price": 5525,
                "originalPrice": 6500,
                "stock": 5,
                "sku": "PEL021",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_261/cover.jpg",
                    "thumb": "assets/images/products/prod_261/thumb.jpg",
                    "gallery": ["assets/images/products/prod_261/1.jpg"]
                }
            },
            {
                "id": "var_260_3",
                "attributes": { "Tamaño": "N°5" },
                "price": 7514,
                "originalPrice": 8840,
                "stock": 5,
                "sku": "PEL022",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_262/cover.jpg",
                    "thumb": "assets/images/products/prod_262/thumb.jpg",
                    "gallery": ["assets/images/products/prod_262/1.jpg"]
                }
            },
            {
                "id": "var_260_4",
                "attributes": { "Tamaño": "N°6" },
                "price": 9392,
                "originalPrice": 11050,
                "stock": 5,
                "sku": "PEL023",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_263/cover.jpg",
                    "thumb": "assets/images/products/prod_263/thumb.jpg",
                    "gallery": ["assets/images/products/prod_263/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_260/cover.jpg",
        "thumb": "assets/images/products/prod_260/thumb.jpg",
        "gallery": ["assets/images/products/prod_260/1.jpg"]
    },
    "specs": {
        "SKU": "PEL020",
        "Material": "Resistente a mordidas",
        "Tamaños disponibles": "N°3, N°4, N°5, N°6"
    },
    "shipping": {
        "free": false,
        "days": 3
    },
    "badge": "🎾 Juguetes",
    "brand": "Sin marca",
    "sku": "PEL020",
    "features": [
        "Múltiples tamaños disponibles",
        "Estimula el juego",
        "Material seguro",
        "Resistente a mordidas",
        "Entretenimiento garantizado"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_261', 'prod_262', 'prod_263'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_260 con el producto unificado
const index260 = productosActualizados.findIndex(p => p.id === 'prod_260');
if (index260 !== -1) {
    productosActualizados[index260] = productoUnificado;
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
