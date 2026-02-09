/**
 * Script para corregir el mensaje hardcodeado en cartUI.js
 * Cambia "ej: 2 del mismo" por "ej: ${minItemsPerProduct} del mismo"
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js/modules/cartUI.js');

console.log('📝 Leyendo cartUI.js...');
let content = fs.readFileSync(filePath, 'utf8');

// Buscar y reemplazar el mensaje hardcodeado
const oldText = '(ej: 2 del mismo artículo';
const newText = '(ej: ${minItemsPerProduct} del mismo artículo';

if (content.includes(oldText)) {
  content = content.replace(oldText, newText);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Mensaje corregido exitosamente');
  console.log('   Antes: ' + oldText);
  console.log('   Ahora: ' + newText);
} else if (content.includes(newText)) {
  console.log('ℹ️ El mensaje ya está corregido');
} else {
  console.log('⚠️ No se encontró el texto a reemplazar');
  // Buscar variaciones
  const regex = /\(ej:\s*\d+\s*del mismo/g;
  const matches = content.match(regex);
  if (matches) {
    console.log('   Encontrado:', matches);
  }
}

console.log('\n✅ Script finalizado');
