const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for different sizes
function createSVGIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a2a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a4a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  
  <!-- Stars -->
  <g fill="#ffffff">
    ${Array.from({length: Math.floor(size/8)}, () => {
      const x = Math.random() * size;
      const y = Math.random() * size;
      return `<circle cx="${x}" cy="${y}" r="1"/>`;
    }).join('')}
  </g>
  
  <!-- Ship -->
  <g transform="translate(${size/2}, ${size/2})">
    <polygon points="0,-${size*0.2} -${size*0.15},${size*0.15} -${size*0.1},${size*0.2} ${size*0.1},${size*0.2} ${size*0.15},${size*0.15}" fill="#4a90e2"/>
    <ellipse cx="0" cy="0" rx="${size*0.02}" ry="${size*0.04}" fill="#87ceeb"/>
    <rect x="-${size*0.02}" y="${size*0.2}" width="${size*0.04}" height="${size*0.02}" fill="#ff6b35"/>
  </g>
</svg>`;
}

// Sizes needed for PWA
const sizes = [16, 32, 152, 192, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// Generate SVG icons for each size
sizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(iconsDir, filename);
    
    fs.writeFileSync(filepath, svgContent);
    console.log(`Created ${filename}`);
});

console.log('All SVG icons created!');
console.log('Note: You may need to convert these to PNG format for full PWA compatibility.'); 