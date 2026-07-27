const fs = require('fs');
const path = require('path');
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function createSVG(size) {
  const pad = size * 0.14;
  const sw = Math.max(1.5, size * 0.065);
  const cr = size * 0.20;
  const mid = size / 2;
  const bL = pad, bR = size - pad;
  const bT = pad * 0.9, bB = size - pad * 0.7;
  const ar = size * 0.08, vD = size * 0.22;
  const dotEl = size >= 32
    ? `<circle cx="${mid}" cy="${bT + size * 0.15}" r="${size * 0.05}" fill="url(#ac)"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d1425"/><stop offset="100%" stop-color="#080d1a"/>
    </linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00d9c8"/><stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${cr}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${cr}" fill="none" stroke="rgba(0,217,200,0.3)" stroke-width="${sw * 0.5}"/>
  <path d="M${bL + ar},${bT} L${bR - ar},${bT} Q${bR},${bT} ${bR},${bT + ar} L${bR},${bB} L${mid + size * 0.02},${bB - vD} L${mid},${bB - vD - size * 0.1} L${mid - size * 0.02},${bB - vD} L${bL},${bB} L${bL},${bT + ar} Q${bL},${bT} ${bL + ar},${bT} Z"
        fill="none" stroke="url(#ac)" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>
  ${dotEl}
</svg>`;
}

[16, 32, 48, 128].forEach(size => {
  const svg = createSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
  console.log(`Created icon${size}.svg`);
});
console.log('All SVG icons created in icons/');
