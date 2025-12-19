const fs = require('fs');
const path = require('path');

// Sprawdź czy plik config istnieje
console.log('tailwind.config.js exists:', fs.existsSync('./tailwind.config.js'));
console.log('postcss.config.js exists:', fs.existsSync('./postcss.config.js'));

// Sprawdź zawartość
const tailwindConfig = require('./tailwind.config.js');
console.log('Tailwind config colors:', Object.keys(tailwindConfig.theme.extend.colors));

// Sprawdź czy komponenty istnieją
const componentsExist = fs.existsSync('./components');
console.log('components folder exists:', componentsExist);

if (componentsExist) {
  const components = fs.readdirSync('./components');
  console.log('Components:', components);
}
