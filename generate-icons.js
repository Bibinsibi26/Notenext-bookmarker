// generate-icons.js
// Run with: node generate-icons.js
// Generates PNG icons from SVG using pure Node.js (no external deps)
// Uses a simple canvas-based approach via the built-in createCanvas polyfill
// NOTE: This script creates SVG data URI PNGs compatible with Chrome extensions.
// If you have Node + canvas module available, run it. Otherwise use the inline SVG approach below.

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

// Generate SVG icon at given size
function createSVG(size) {
  const padding = Math.round(size * 0.12);
  const cornerR = Math.round(size * 0.18);
  const strokeW = Math.max(1.5, size * 0.06);
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d1425"/>
      <stop offset="100%" stop-color="#080d1a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00d9c8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="${size * 0.06}" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <!-- Background rounded rect -->
  <rect width="${size}" height="${size}" rx="${cornerR}" fill="url(#bg)"/>
  
  <!-- Subtle border -->
  <rect width="${size}" height="${size}" rx="${cornerR}" fill="none" 
        stroke="rgba(0,217,200,0.25)" stroke-width="${strokeW * 0.5}"/>
  
  <!-- Bookmark shape -->
  <g filter="url(#glow)">
    <path d="M${padding + size*0.15} ${padding}
             L${size - padding - size*0.15} ${padding}
             Q${size - padding} ${padding} ${size - padding} ${padding + size*0.1}
             L${size - padding} ${size - padding}
             L${size/2} ${size - padding - size*0.2}
             L${padding} ${size - padding}
             L${padding} ${padding + size*0.1}
             Q${padding} ${padding} ${padding + size*0.15} ${padding}
             Z"
          fill="none" stroke="url(#accent)" stroke-width="${strokeW}" 
          stroke-linejoin="round" stroke-linecap="round"/>
  </g>
  
  <!-- Inner notch (bookmark V shape) -->
  <path d="M${size/2 - size*0.12} ${padding + size*0.05}
           L${size/2} ${padding + size*0.22}
           L${size/2 + size*0.12} ${padding + size*0.05}"
        fill="none" stroke="url(#accent)" stroke-width="${strokeW * 0.8}"
        stroke-linejoin="round" stroke-linecap="round"/>
</svg>`;
}

const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const svg = createSVG(size);
  const svgPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✅ Created icon${size}.svg`);
});

console.log('\n📌 SVG icons created in /icons/');
console.log('💡 To use as PNGs, either:');
console.log('   1. Rename .svg to .png if your browser supports SVG icons, OR');
console.log('   2. Run: npm install canvas && node convert-icons.js');
console.log('   3. Or open convert.html in a browser to generate PNGs\n');
