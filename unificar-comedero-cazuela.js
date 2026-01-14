/**
 * Script para unificar COMEDERO CAZUELA en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_840', 'prod_841', 'prod_842'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_840",
    "name": "COMEDERO CAZUELA",
    "category": "accesorios",
    "subcategory": "Comederos",
    "hasVariants": true,
    "basePrice": 1530,
    "baseOriginalPrice": 1800,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0),
    "rating": 4.6,
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0),
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "comedero",
        "cazuela",
        "bebedero",
        "alimentación",
        "agua",
        "perros",
        "gatos",
        "plástico"
    ],
    "description": "Comedero cazuela de plástico. Disponible en múltiples tamaños.",
    "longDescription": "Comedero tipo cazuela de plástico resistente. Ideal para perros y gatos. Fácil de limpiar y mantener. Disponible en varios tamaños y colores para adaptarse a las necesidades de tu mascota.",
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
                "id": "var_840_1",
                "attributes": { "Tamaño": "Chica" },
                "price": 1530,
                "originalPrice": 1800,
                "stock": 10,
                "sku": "COM053",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_840/cover.jpg",
                    "thumb": "assets/images/products/prod_840/thumb.jpg",
                    "gallery": ["assets/images/products/prod_840/1.jpg"]
                }
            },
            {
                "id": "var_840_2",
                "attributes": { "Tamaño": "Mediano" },
                "price": 2380,
                "originalPrice": 2800,
                "stock": 10,
                "sku": "COM054",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_841/cover.jpg",
                    "thumb": "assets/images/products/prod_841/thumb.jpg",
                    "gallery": ["assets/images/products/prod_841/1.jpg"]
                }
            },
            {
                "id": "var_840_3",
                "attributes": { "Tamaño": "Grande" },
                "price": 3230,
                "originalPrice": 3800,
                "stock": 10,
                "sku": "COM055",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_842/cover.jpg",
                    "thumb": "assets/images/products/prod_842/thumb.jpg",
                    "gallery": ["assets/images/products/prod_842/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_840/cover.jpg",
        "thumb": "assets/images/products/prod_840/thumb.jpg",
        "gallery": ["assets/images/products/prod_840/1.jpg"]
    },
    "specs": {
        "SKU": "COM053",
        "Material": "Plástico resistente",
        "Tamaños disponibles": "Chica, Mediano, Grande"
    },
    "shipping": {
        "free": false,
        "days": 2
    },
    "badge": "🍽️ Comederos",
    "brand": "Sin marca",
    "sku": "COM053",
    "features": [
        "Múltiples tamaños disponibles",
        "Fácil de limpiar",
        "Antideslizante",
        "Capacidad adecuada",
        "Material duradero"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_841', 'prod_842'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_840 con el producto unificado
const index840 = productosActualizados.findIndex(p => p.id === 'prod_840');
if (index840 !== -1) {
    productosActualizados[index840] = productoUnificado;
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
