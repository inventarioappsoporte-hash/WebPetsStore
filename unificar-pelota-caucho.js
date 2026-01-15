/**
 * Script para unificar PELOTA DE CAUCHO en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_267', 'prod_268', 'prod_269', 'prod_270', 'prod_271'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_267",
    "name": "PELOTA DE CAUCHO",
    "category": "juguetes",
    "subcategory": "Juguetes",
    "hasVariants": true,
    "basePrice": 1215,
    "baseOriginalPrice": 1430,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0),
    "rating": 4.3,
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0),
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "pelota",
        "caucho",
        "juguete",
        "entretenimiento",
        "diversión",
        "interactivo",
        "perros",
        "resistente"
    ],
    "description": "Pelota de caucho resistente. Disponible en múltiples tamaños.",
    "longDescription": "Pelota de caucho de alta calidad para perros. Material resistente a mordidas. Ideal para juegos de lanzar y buscar. Disponible en varios tamaños para adaptarse al tamaño de tu mascota.",
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
                "id": "var_267_1",
                "attributes": { "Tamaño": "N°1 (40mm)" },
                "price": 1215,
                "originalPrice": 1430,
                "stock": 5,
                "sku": "PEL027",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_267/cover.jpg",
                    "thumb": "assets/images/products/prod_267/thumb.jpg",
                    "gallery": ["assets/images/products/prod_267/1.jpg"]
                }
            },
            {
                "id": "var_267_2",
                "attributes": { "Tamaño": "N°2 (48mm)" },
                "price": 1547,
                "originalPrice": 1820,
                "stock": 5,
                "sku": "PEL028",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_268/cover.jpg",
                    "thumb": "assets/images/products/prod_268/thumb.jpg",
                    "gallery": ["assets/images/products/prod_268/1.jpg"]
                }
            },
            {
                "id": "var_267_3",
                "attributes": { "Tamaño": "N°3 (58mm)" },
                "price": 3425,
                "originalPrice": 4030,
                "stock": 5,
                "sku": "PEL029",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_269/cover.jpg",
                    "thumb": "assets/images/products/prod_269/thumb.jpg",
                    "gallery": ["assets/images/products/prod_269/1.jpg"]
                }
            },
            {
                "id": "var_267_4",
                "attributes": { "Tamaño": "N°4 (75mm)" },
                "price": 6077,
                "originalPrice": 7150,
                "stock": 5,
                "sku": "PEL030",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_270/cover.jpg",
                    "thumb": "assets/images/products/prod_270/thumb.jpg",
                    "gallery": ["assets/images/products/prod_270/1.jpg"]
                }
            },
            {
                "id": "var_267_5",
                "attributes": { "Tamaño": "N°5 (90mm)" },
                "price": 9503,
                "originalPrice": 11180,
                "stock": 5,
                "sku": "PEL031",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_271/cover.jpg",
                    "thumb": "assets/images/products/prod_271/thumb.jpg",
                    "gallery": ["assets/images/products/prod_271/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_267/cover.jpg",
        "thumb": "assets/images/products/prod_267/thumb.jpg",
        "gallery": ["assets/images/products/prod_267/1.jpg"]
    },
    "specs": {
        "SKU": "PEL027",
        "Material": "Caucho resistente",
        "Tamaños disponibles": "40mm, 48mm, 58mm, 75mm, 90mm"
    },
    "shipping": {
        "free": false,
        "days": 3
    },
    "badge": "🎾 Juguetes",
    "brand": "Sin marca",
    "sku": "PEL027",
    "features": [
        "Múltiples tamaños disponibles",
        "Estimula el juego",
        "Material seguro",
        "Resistente a mordidas",
        "Entretenimiento garantizado"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_268', 'prod_269', 'prod_270', 'prod_271'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_267 con el producto unificado
const index267 = productosActualizados.findIndex(p => p.id === 'prod_267');
if (index267 !== -1) {
    productosActualizados[index267] = productoUnificado;
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
