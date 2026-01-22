const fs = require('fs');
const products = require('./data/products.json');
const categories = require('./data/categories.json');

const baseUrl = 'https://pets-store-arg.com';
const today = new Date().toISOString().split('T')[0];

// Páginas principales
const mainPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/index.html', priority: '1.0', changefreq: 'daily' },
    { url: '/search.html', priority: '0.8', changefreq: 'weekly' },
    { url: '/contact.html', priority: '0.6', changefreq: 'monthly' },
    { url: '/mayorista.html', priority: '0.7', changefreq: 'monthly' }
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// Agregar páginas principales
mainPages.forEach(page => {
    xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
});

// Agregar páginas de categorías
categories.categories.forEach(cat => {
    const catSlug = encodeURIComponent(cat.name);
    xml += `  <url>
    <loc>${baseUrl}/index.html?category=${catSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

// Agregar páginas de productos
products.forEach(product => {
    xml += `  <url>
    <loc>${baseUrl}/product.html?id=${product.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
});

xml += `</urlset>`;

fs.writeFileSync('./sitemap.xml', xml);
console.log(`Sitemap generado con ${mainPages.length + categories.categories.length + products.length} URLs`);
console.log(`- ${mainPages.length} páginas principales`);
console.log(`- ${categories.categories.length} categorías`);
console.log(`- ${products.length} productos`);
