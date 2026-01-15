const fs = require('fs');

// Cargar productos
const products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

// IDs de los productos a unificar
const idsToRemove = ['prod_831', 'prod_832', 'prod_833'];

// Producto base (usaremos prod_831 como base)
const baseProduct = products.find(p => p.id === 'prod_831');
const medianoProduct = products.find(p => p.id === 'prod_832');
const grandeProduct = products.find(p => p.id === 'prod_833');

if (!baseProduct || !medianoProduct || !grandeProduct) {
  console.error('No se encontraron todos los productos');
  process.exit(1);
}

// Crear producto unificado con variantes
const unifiedProduct = {
  "id": "prod_831",
  "name": "Comedero Ovalado",
  "category": "accesorios",
  "subcategory": "Comederos",
  "hasVariants": true,
  "basePrice": 1530,
  "baseOriginalPrice": 1800,
  "discount": 15,
  "stock": 30,
  "rating": 4.1,
  "reviews": 108,
  "featured": false,
  "topDiscount": false,
  "hasVideo": false,
  "tags": [
    "comedero",
    "ovalado",
    "bebedero",
    "alimentación",
    "agua",
    "chico",
    "mediano",
    "grande"
  ],
  "description": "🍽️ Comedero ovalado para mascotas. Diseño práctico y resistente. Disponible en 3 tamaños.",
  "longDescription": "Comedero ovalado de calidad para tu mascota. Material resistente y fácil de limpiar. Diseño que facilita el acceso al alimento. Base estable para evitar derrames. Disponible en tamaño Chico, Mediano y Grande para adaptarse a las necesidades de tu mascota.",
  "variants": {
    "attributes": [
      {
        "id": "tamaño",
        "name": "Tamaño",
        "type": "size"
      }
    ],
    "combinations": [
      {
        "id": "var_831_1",
        "attributes": {
          "Tamaño": "Chico"
        },
        "price": 1530,
        "originalPrice": 1800,
        "stock": 10,
        "sku": "COM047",
        "available": true,
        "images": {
          "cover": "assets/images/products/prod_831/cover.jpg",
          "thumb": "assets/images/products/prod_831/thumb.jpg",
          "gallery": ["assets/images/products/prod_831/1.jpg"]
        }
      },
      {
        "id": "var_831_2",
        "attributes": {
          "Tamaño": "Mediano"
        },
        "price": 1700,
        "originalPrice": 2000,
        "stock": 10,
        "sku": "COM048",
        "available": true,
        "images": {
          "cover": "assets/images/products/prod_832/cover.jpg",
          "thumb": "assets/images/products/prod_832/thumb.jpg",
          "gallery": ["assets/images/products/prod_832/1.jpg"]
        }
      },
      {
        "id": "var_831_3",
        "attributes": {
          "Tamaño": "Grande"
        },
        "price": 4080,
        "originalPrice": 4800,
        "stock": 10,
        "sku": "COM049",
        "available": true,
        "images": {
          "cover": "assets/images/products/prod_833/cover.jpg",
          "thumb": "assets/images/products/prod_833/thumb.jpg",
          "gallery": ["assets/images/products/prod_833/1.jpg"]
        }
      }
    ]
  },
  "images": {
    "cover": "assets/images/products/prod_831/cover.jpg",
    "thumb": "assets/images/products/prod_831/thumb.jpg",
    "gallery": []
  },
  "specs": {
    "SKU": "COM047",
    "Material": "Material resistente"
  },
  "shipping": {
    "free": false,
    "days": 2
  },
  "badge": "🍽️ Comederos",
  "brand": "Sin marca",
  "sku": "COM047",
  "features": [
    "Fácil de limpiar",
    "Antideslizante",
    "Capacidad adecuada",
    "Material duradero",
    "Disponible en 3 tamaños"
  ]
};

// Filtrar productos eliminando los que se van a unificar
let newProducts = products.filter(p => !idsToRemove.includes(p.id));

// Agregar el producto unificado
newProducts.push(unifiedProduct);

// Ordenar por ID
newProducts.sort((a, b) => {
  const numA = parseInt(a.id.replace('prod_', ''));
  const numB = parseInt(b.id.replace('prod_', ''));
  return numA - numB;
});

// Guardar
fs.writeFileSync('data/products.json', JSON.stringify(newProducts, null, 2));

console.log('✅ Productos unificados exitosamente');
console.log(`   - Productos eliminados: ${idsToRemove.join(', ')}`);
console.log(`   - Producto unificado: prod_831 (Comedero Ovalado)`);
console.log(`   - Total productos: ${newProducts.length}`);
