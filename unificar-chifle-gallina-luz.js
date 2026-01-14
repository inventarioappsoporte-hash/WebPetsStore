/**
 * Script para unificar productos CHIFLE GALLINA CON LUZ en un solo producto con variantes
 * 
 * Productos a unificar:
 * - prod_281: CHIFLE GALLINA CON LUZ CHICO - $3,315 (original $3,900)
 * - prod_282: CHIFLE GALLINA CON LUZ MEDIANO - $7,735 (original $9,100)
 * - prod_283: CHIFLE GALLINA CON LUZ GRANDE - $9,945 (original $11,700)
 */

const fs = require('fs');
const path = require('path');

// Configuración
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const BACKUP_DIR = path.join(__dirname, '..', 'backupInventario');

// IDs de productos a unificar
const PRODUCT_IDS_TO_REMOVE = ['prod_281', 'prod_282', 'prod_283'];

// Nuevo producto unificado con variantes
const UNIFIED_PRODUCT = {
    "id": "prod_281",
    "name": "CHIFLE GALLINA CON LUZ",
    "category": "juguetes",
    "subcategory": "Juguetes",
    "price": 3315,
    "originalPrice": 3900,
    "discount": 15,
    "stock": 15,
    "rating": 4.1,
    "reviews": 79,
    "featured": false,
    "topDiscount": false,
    "hasVideo": false,
    "tags": [
        "chifle",
        "gallina",
        "juguete",
        "entretenimiento",
        "diversión",
        "interactivo",
        "luz",
        "sonido"
    ],
    "description": "Chifle Gallina con Luz - Juguete interactivo para mascotas",
    "longDescription": "Divertido juguete en forma de gallina con luz y sonido chifle. Ideal para estimular el juego y entretenimiento de tu mascota. Disponible en tres tamaños para adaptarse a diferentes razas y preferencias.",
    "images": {
        "cover": "assets/images/products/prod_281/cover.jpg",
        "thumb": "assets/images/products/prod_281/thumb.jpg",
        "gallery": [
            "assets/images/products/prod_281/1.jpg",
            "assets/images/products/prod_282/cover.jpg",
            "assets/images/products/prod_283/cover.jpg"
        ]
    },
    "specs": {
        "Material": "Goma resistente",
        "Tipo": "Juguete interactivo",
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
        "Estimula el juego",
        "Material seguro",
        "Resistente a mordidas",
        "Entretenimiento garantizado",
        "Con luz LED",
        "Sonido chifle al presionar"
    ],
    "hasVariants": true,
    "variantType": "Tamaño",
    "variants": [
        {
            "id": "var_281_chico",
            "name": "Chico",
            "price": 3315,
            "originalPrice": 3900,
            "discount": 15,
            "stock": 5,
            "sku": "CHI001",
            "images": {
                "cover": "assets/images/products/prod_281/cover.jpg",
                "thumb": "assets/images/products/prod_281/thumb.jpg",
                "gallery": ["assets/images/products/prod_281/1.jpg"]
            }
        },
        {
            "id": "var_282_mediano",
            "name": "Mediano",
            "price": 7735,
            "originalPrice": 9100,
            "discount": 15,
            "stock": 5,
            "sku": "CHI002",
            "images": {
                "cover": "assets/images/products/prod_282/cover.jpg",
                "thumb": "assets/images/products/prod_282/thumb.jpg",
                "gallery": ["assets/images/products/prod_282/1.jpg"]
            }
        },
        {
            "id": "var_283_grande",
            "name": "Grande",
            "price": 9945,
            "originalPrice": 11700,
            "discount": 15,
            "stock": 5,
            "sku": "CHI003",
            "images": {
                "cover": "assets/images/products/prod_283/cover.jpg",
                "thumb": "assets/images/products/prod_283/thumb.jpg",
                "gallery": ["assets/images/products/prod_283/1.jpg"]
            }
        }
    ]
};

function createBackup(products) {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = path.join(BACKUP_DIR, `backup_chifle_gallina_luz_${timestamp}.json`);
    
    // Guardar solo los productos que vamos a modificar
    const productsToBackup = products.filter(p => PRODUCT_IDS_TO_REMOVE.includes(p.id));
    fs.writeFileSync(backupFile, JSON.stringify(productsToBackup, null, 2), 'utf8');
    
    console.log(`✅ Backup creado: ${backupFile}`);
    return backupFile;
}

function unifyProducts() {
    console.log('🔄 Iniciando unificación de CHIFLE GALLINA CON LUZ...\n');
    
    // Leer productos actuales
    const productsData = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const products = JSON.parse(productsData);
    
    console.log(`📦 Total de productos antes: ${products.length}`);
    
    // Crear backup
    createBackup(products);
    
    // Mostrar productos a unificar
    console.log('\n📋 Productos a unificar:');
    products.filter(p => PRODUCT_IDS_TO_REMOVE.includes(p.id)).forEach(p => {
        console.log(`   - ${p.id}: ${p.name} - $${p.price.toLocaleString()}`);
    });
    
    // Eliminar productos originales
    const filteredProducts = products.filter(p => !PRODUCT_IDS_TO_REMOVE.includes(p.id));
    
    // Encontrar posición para insertar (donde estaba el primer producto)
    const originalIndex = products.findIndex(p => p.id === 'prod_281');
    
    // Insertar producto unificado
    filteredProducts.splice(originalIndex, 0, UNIFIED_PRODUCT);
    
    // Guardar archivo actualizado
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filteredProducts, null, 2), 'utf8');
    
    console.log(`\n📦 Total de productos después: ${filteredProducts.length}`);
    console.log(`📉 Productos reducidos: ${products.length - filteredProducts.length}`);
    
    console.log('\n✅ Unificación completada exitosamente!');
    console.log('\n📝 Producto unificado creado:');
    console.log(`   - ID: ${UNIFIED_PRODUCT.id}`);
    console.log(`   - Nombre: ${UNIFIED_PRODUCT.name}`);
    console.log(`   - Variantes: ${UNIFIED_PRODUCT.variants.length}`);
    UNIFIED_PRODUCT.variants.forEach(v => {
        console.log(`     • ${v.name}: $${v.price.toLocaleString()} (antes $${v.originalPrice.toLocaleString()})`);
    });
}

// Ejecutar
unifyProducts();
