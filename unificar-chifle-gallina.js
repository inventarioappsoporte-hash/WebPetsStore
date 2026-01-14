/**
 * Script para unificar CHIFLE GALLINA CON LUZ en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_281', 'prod_282', 'prod_283'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_281",
    "name": "CHIFLE GALLINA CON LUZ",
    "category": "juguetes",
    "subcategory": "Juguetes",
    "hasVariants": true,
    "basePrice": 3315, // Precio más bajo (Chico)
    "baseOriginalPrice": 3900,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0),
    "rating": 4.1, // Promedio de 4.8, 3.7, 3.9
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0),
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "chifle",
        "gallina",
        "luz",
        "juguete",
        "entretenimiento",
        "diversión",
        "interactivo",
        "sonido",
        "perros"
    ],
    "description": "Chifle gallina con luz para mascotas. Disponible en varios tamaños.",
    "longDescription": "Divertido juguete chifle en forma de gallina con luz LED incorporada. Ideal para el entretenimiento de tu mascota. Emite sonido al presionarlo y tiene luz que atrae la atención. Disponible en tamaños chico, mediano y grande.",
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
                "id": "var_281_1",
                "attributes": { "Tamaño": "Chico" },
                "price": 3315,
                "originalPrice": 3900,
                "stock": 5,
                "sku": "CHI001",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_281/cover.jpg",
                    "thumb": "assets/images/products/prod_281/thumb.jpg",
                    "gallery": ["assets/images/products/prod_281/1.jpg"]
                }
            },
            {
                "id": "var_281_2",
                "attributes": { "Tamaño": "Mediano" },
                "price": 7735,
                "originalPrice": 9100,
                "stock": 5,
                "sku": "CHI002",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_282/cover.jpg",
                    "thumb": "assets/images/products/prod_282/thumb.jpg",
                    "gallery": ["assets/images/products/prod_282/1.jpg"]
                }
            },
            {
                "id": "var_281_3",
                "attributes": { "Tamaño": "Grande" },
                "price": 9945,
                "originalPrice": 11700,
                "stock": 5,
                "sku": "CHI003",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_283/cover.jpg",
                    "thumb": "assets/images/products/prod_283/thumb.jpg",
                    "gallery": ["assets/images/products/prod_283/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_281/cover.jpg",
        "thumb": "assets/images/products/prod_281/thumb.jpg",
        "gallery": ["assets/images/products/prod_281/1.jpg"]
    },
    "specs": {
        "SKU": "CHI001",
        "Material": "Plástico con LED",
        "Tamaños disponibles": "Chico, Mediano, Grande",
        "Características": "Con luz y sonido"
    },
    "shipping": {
        "free": false,
        "days": 3
    },
    "badge": "🎾 Juguetes",
    "brand": "Sin marca",
    "sku": "CHI001",
    "features": [
        "Múltiples tamaños disponibles",
        "Luz LED incorporada",
        "Emite sonido al presionar",
        "Estimula el juego",
        "Material seguro",
        "Entretenimiento garantizado"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_282', 'prod_283'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_281 con el producto unificado
const index281 = productosActualizados.findIndex(p => p.id === 'prod_281');
if (index281 !== -1) {
    productosActualizados[index281] = productoUnificado;
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
