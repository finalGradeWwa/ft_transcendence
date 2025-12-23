import fs from 'fs';

console.log(
  'tailwind.config.js exists:',
  fs.existsSync('./tailwind.config.js')
);
console.log('postcss.config.js exists:', fs.existsSync('./postcss.config.js'));

// W Next.js zamiast require() dla plików JS, używamy dynamicznego importu lub po prostu importujemy na górze, jeśli to możliwe.
import tailwindConfig from './tailwind.config.js';
console.log(
  'Tailwind config colors:',
  Object.keys(tailwindConfig.theme.extend.colors)
);

const componentsExist = fs.existsSync('./components');
console.log('components folder exists:', componentsExist);

if (componentsExist) {
  const components = fs.readdirSync('./components');
  console.log('Components:', components);
}
