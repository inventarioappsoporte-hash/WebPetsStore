const fs = require('fs');
const path = require('path');

// Leer productos actuales
const productsPath = './data/products.json';
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Nuevos productos desde el Excel
const nuevosProductos = [
  {
    nombre: "CASITA PARA GATO CON RASCADOR",
    descripcion: "Dimensiones: 50X28X42",
    sku: "CAS002",
    categoria: "accesorios",
    subcategoria: "Bolsos y Casitas",
    badge: "🐾 Bolsos y Casitas",
    stock: 2,
    precio: 82000,
    descuento: 15,
    precioDescuento: 69700,
    imagen: "1.jpeg"
  },
  {
    nombre: "RASCADOR DOBLE POSTE CON POMPONES",
    descripcion: "Dimensiones: 30*36*38",
    sku: "RAS002",
    categoria: "accesorios",
    subcategoria: "Rascadores",
    badge: "🐾 Rascadores",
    stock: 2,
    precio: 64500,
    descuento: 15,
    precioDescuento: 54825,
    imagen: "2.jpeg"
  },
  {
    nombre: "RASCADOR CAMA TRES POSTES CON TRES NIVELES",
    descripcion: "Dimensiones: 40*34*47",
    sku: "RAS003",
    categoria: "accesorios",
    subcategoria: "Rascadores",
    badge: "🐾 Rascadores",
    stock: 2,
    precio: 91000,
    descuento: 15,
    precioDescuento: 77350,
    imagen: "3.jpeg"
  },
  {
    nombre: "JUEGO DIAMANTE",
    descripcion: "Juego interactivo para gatos diseño diamante",
    sku: "JUE002",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 2,
    precio: 65000,
    descuento: 15,
    precioDescuento: 55250,
    imagen: "4.jpeg"
  },
  {
    nombre: "JUEGO INFINITO",
    descripcion: "Juego interactivo para gatos diseño infinito",
    sku: "JUE003",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 2,
    precio: 65000,
    descuento: 15,
    precioDescuento: 55250,
    imagen: "5.jpeg"
  },
  {
    nombre: "RASCADOR DE MADERA CON PLUMA",
    descripcion: "Rascador de madera con pluma para gatos",
    sku: "RAS016",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 1,
    precio: 68000,
    descuento: 15,
    precioDescuento: 57800,
    imagen: "6.jpeg"
  },
  {
    nombre: "RATA HILO SISAL",
    descripcion: "Dimensiones: 25 cm",
    sku: "RAT002",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 6,
    precio: 10200,
    descuento: 15,
    precioDescuento: 8670,
    imagen: "7.jpeg"
  },
  {
    nombre: "Cubo interactivo",
    descripcion: "Dimensiones: Largo 40cm, Ancho 40cm, Alto 40cm",
    sku: "CUB001",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 2,
    precio: 57000,
    descuento: 15,
    precioDescuento: 48450,
    imagen: "8.jpeg"
  },
  {
    nombre: "JUGUETE INTERACTIVO Y COMEDERO REGULADOR CON PELOTAS Y PLUMA",
    descripcion: "Dimensiones: 23,5*9,4",
    sku: "JUG014",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 3,
    precio: 17000,
    descuento: 15,
    precioDescuento: 14450,
    imagen: "9.jpeg"
  },
  {
    nombre: "JUGUETE INTERACTIVO 4 PISO",
    descripcion: "Juguete interactivo de 4 pisos para gatos",
    sku: "JUG015",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 3,
    precio: 20000,
    descuento: 15,
    precioDescuento: 17000,
    imagen: "10.jpeg"
  },
  {
    nombre: "JUEGO DIDACTICO 4 PISOS C/6 PELOTAS 2 PLUMAS",
    descripcion: "Juego didáctico de 4 pisos con 6 pelotas y 2 plumas",
    sku: "JUE004",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 3,
    precio: 33500,
    descuento: 15,
    precioDescuento: 28475,
    imagen: "11.jpeg"
  },
  {
    nombre: "JUGUETE GATO 15CM",
    descripcion: "Dimensiones: 6,5*15CM",
    sku: "JUG016",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 5,
    precio: 8400,
    descuento: 15,
    precioDescuento: 7140,
    imagen: "12.jpeg"
  },
  {
    nombre: "JUGUETE GATO 18CM",
    descripcion: "Dimensiones: 6,5*18CM",
    sku: "JUG019",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 7,
    precio: 10000,
    descuento: 15,
    precioDescuento: 8500,
    imagen: "13.jpeg"
  },
  {
    nombre: "JUGUETE Y PORTA ALIMENTO PARA GATO",
    descripcion: "Dimensiones: 10*10*13CM",
    sku: "JUG017",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 6,
    precio: 9000,
    descuento: 15,
    precioDescuento: 7650,
    imagen: "14.jpeg"
  },
  {
    nombre: "Juguete vaivén con varita y pluma base forma de gato",
    descripcion: "Dimensiones: 7*9cm",
    sku: "JUG018",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 6,
    precio: 9000,
    descuento: 15,
    precioDescuento: 7650,
    imagen: "15.jpeg"
  },
  {
    nombre: "PAJARO VOLADOR FLAPPY",
    descripcion: "Pájaro volador interactivo para gatos",
    sku: "PAJ001",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 3,
    precio: 40000,
    descuento: 15,
    precioDescuento: 34000,
    imagen: "16.jpeg"
  },
  {
    nombre: "Pelota sisal c/ plumas y cara",
    descripcion: "Pelota de sisal con plumas y cara decorativa",
    sku: "PEL044",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 10,
    precio: 3200,
    descuento: 15,
    precioDescuento: 2720,
    imagen: "17.jpeg"
  },
  {
    nombre: "JUGUETE RUEDA SISAL CON PLUMA",
    descripcion: "Rueda de sisal con pluma para gatos",
    sku: "JUG020",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 10,
    precio: 3200,
    descuento: 15,
    precioDescuento: 2720,
    imagen: "18.jpeg"
  },
  {
    nombre: "JUGUETE PELOTA COLOR",
    descripcion: "Dimensiones: 4,5CM",
    sku: "JUG021",
    categoria: "juguetes",
    subcategoria: "Juguetes",
    badge: "🐾 Juguetes",
    stock: 7,
    precio: 3100,
    descuento: 15,
    precioDescuento: 2635,
    imagen: "19.jpeg"
  }
];

let nextId = 868;

nuevosProductos.forEach((prod, index) => {
  const prodId = `prod_${nextId}`;
  
  const nuevoProducto = {
    id: prodId,
    name: prod.nombre,
    category: prod.categoria,
    subcategory: prod.subcategoria,
    hasVariants: false,
    price: prod.precioDescuento,
    originalPrice: prod.precio,
    discount: prod.descuento,
    stock: prod.stock,
    rating: 4.5,
    reviews: Math.floor(Math.random() * 50) + 10,
    featured: false,
    topDiscount: prod.descuento >= 15,
    tags: prod.nombre.toLowerCase().split(' ').filter(t => t.length > 2),
    description: prod.descripcion,
    longDescription: `${prod.nombre}. ${prod.descripcion}. Producto de alta calidad para tu mascota.`,
    images: {
      cover: `assets/images/products/${prodId}/cover.jpg`,
      thumb: `assets/images/products/${prodId}/thumb.jpg`,
      gallery: [`assets/images/products/${prodId}/1.jpg`]
    },
    specs: {
      SKU: prod.sku
    },
    shipping: {
      free: prod.precioDescuento >= 15000,
      days: 3
    },
    badge: prod.badge,
    brand: "Sin marca",
    sku: prod.sku
  };
  
  products.push(nuevoProducto);
  console.log(`Agregado: ${prodId} - ${prod.nombre}`);
  
  nextId++;
});

// Guardar productos
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log(`\nTotal productos: ${products.length}`);
console.log('Productos guardados exitosamente');
