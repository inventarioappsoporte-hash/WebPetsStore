/**
 * Script para unificar CONJUNTO CUADRILLE (1,0 CM, 1,5 CM) en un producto con variantes
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// IDs de los productos a unificar
const idsAUnificar = ['prod_695', 'prod_696'];

// Encontrar los productos
const productosAUnificar = products.filter(p => idsAUnificar.includes(p.id));

console.log(`\n📦 Productos encontrados: ${productosAUnificar.length}`);
productosAUnificar.forEach(p => {
    console.log(`   - ${p.id}: ${p.name} | $${p.price}`);
});

// Crear el producto unificado con variantes
const productoUnificado = {
    "id": "prod_695",
    "name": "CONJUNTO CUADRILLE",
    "category": "accesorios",
    "subcategory": "Accesorios",
    "hasVariants": true,
    "basePrice": 4420, // Precio más bajo (1,0 CM)
    "baseOriginalPrice": 5200,
    "discount": 15,
    "stock": productosAUnificar.reduce((sum, p) => sum + (p.stock || 0), 0),
    "rating": 3.9, // Promedio aproximado (4.1 + 3.6) / 2
    "reviews": productosAUnificar.reduce((sum, p) => sum + (p.reviews || 0), 0), // 43+42=85
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "conjunto",
        "cuadrille",
        "collar",
        "correa",
        "paseo",
        "pechera"
    ],
    "description": "Conjunto Cuadrille con collar, correa y pechera. Disponible en anchos de 1,0 CM y 1,5 CM.",
    "longDescription": "Conjunto Cuadrille de alta calidad con diseño a cuadros. Incluye collar, correa y pechera coordinados. Ideal para paseos con estilo. Disponible en dos anchos para diferentes tamaños de mascota.",
    "variants": {
        "attributes": [
            {
                "id": "size",
                "name": "Ancho",
                "type": "size"
            }
        ],
        "combinations": [
            {
                "id": "var_695_1",
                "attributes": { "Ancho": "1,0 CM" },
                "price": 4420,
                "originalPrice": 5200,
                "stock": 10,
                "sku": "CON017",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_695/cover.jpg",
                    "thumb": "assets/images/products/prod_695/thumb.jpg",
                    "gallery": ["assets/images/products/prod_695/1.jpg"]
                }
            },
            {
                "id": "var_695_2",
                "attributes": { "Ancho": "1,5 CM" },
                "price": 5780,
                "originalPrice": 6800,
                "stock": 10,
                "sku": "CON018",
                "available": true,
                "images": {
                    "cover": "assets/images/products/prod_696/cover.jpg",
                    "thumb": "assets/images/products/prod_696/thumb.jpg",
                    "gallery": ["assets/images/products/prod_696/1.jpg"]
                }
            }
        ]
    },
    "images": {
        "cover": "assets/images/products/prod_695/cover.jpg",
        "thumb": "assets/images/products/prod_695/thumb.jpg",
        "gallery": ["assets/images/products/prod_695/1.jpg"]
    },
    "specs": {
        "SKU": "CON017",
        "Material": "Tela cuadrillé",
        "Anchos disponibles": "1,0 CM, 1,5 CM"
    },
    "shipping": {
        "free": false,
        "days": 2
    },
    "badge": "🦴 Accesorios",
    "brand": "Sin marca",
    "sku": "CON017",
    "features": [
        "Múltiples anchos disponibles",
        "Diseño a cuadros elegante",
        "Ajuste cómodo",
        "Material resistente",
        "Fácil de usar"
    ]
};

// Filtrar productos originales y agregar el unificado
const idsAEliminar = ['prod_696'];
const productosActualizados = products.filter(p => !idsAEliminar.includes(p.id));

// Reemplazar prod_695 con el producto unificado
const index695 = productosActualizados.findIndex(p => p.id === 'prod_695');
if (index695 !== -1) {
    productosActualizados[index695] = productoUnificado;
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
