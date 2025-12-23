// tailwind.config.js

// 1. Definiujemy konfiguracje jako NAZWANA zmienna (tailwindConfig)
/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // './src/**/*.{js,ts,jsx,tsx,mdx}', // usuniete, bo folder nie istnieje
  ],
  theme: {
    extend: {
      colors: {
        // Format: 'nazwa-klasy-tailwind': '#hex'
        'light-bg': '#F8F8F8',
        'dark-text': '#333333',
        'container-light': '#dad5d0ff',
        'container-light2': '#c7c1bcff',
        'primary-green': '#186618ff',
        'secondary-beige': '#e7dcc7ff',
        'subtle-gray': '#E0E0E0',
        'border-gray': '#adadadff',
        'header-main': '#ffffffff',
      },
    },
  },
  plugins: [],
};

// 2. Eksportujemy nazwana zmienna jako default.
module.exports = tailwindConfig;
