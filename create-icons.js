const fs = require('fs');
const path = require('path');

// Create a rocket SVG icon for different sizes
function createSVGIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a2a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a4a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="rocket" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b35;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ff8c42;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff6b35;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="window" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#87ceeb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4a90e2;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="flame" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#ffff00;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ff6600;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff0000;stop-opacity:0.8" />
    </radialGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  
  <!-- Stars -->
  <g fill="#ffffff">
    ${Array.from({length: Math.floor(size/6)}, () => {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const starSize = Math.random() * 2 + 0.5;
      return `<circle cx="${x}" cy="${y}" r="${starSize}"/>`;
    }).join('')}
  </g>
  
  <!-- Rocket -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Rocket body -->
    <ellipse cx="0" cy="0" rx="${size*0.08}" ry="${size*0.25}" fill="url(#rocket)"/>
    
    <!-- Rocket nose cone -->
    <polygon points="0,-${size*0.25} -${size*0.08},-${size*0.15} ${size*0.08},-${size*0.15}" fill="#ff4444"/>
    
    <!-- Rocket window -->
    <circle cx="0" cy="-${size*0.05}" r="${size*0.03}" fill="url(#window)"/>
    <circle cx="0" cy="-${size*0.05}" r="${size*0.015}" fill="#ffffff"/>
    
    <!-- Rocket fins -->
    <polygon points="-${size*0.08},${size*0.15} -${size*0.15},${size*0.25} -${size*0.12},${size*0.25}" fill="#ff4444"/>
    <polygon points="${size*0.08},${size*0.15} ${size*0.15},${size*0.25} ${size*0.12},${size*0.25}" fill="#ff4444"/>
    
    <!-- Rocket engine flames -->
    <ellipse cx="0" cy="${size*0.25}" rx="${size*0.06}" ry="${size*0.12}" fill="url(#flame)"/>
    <ellipse cx="0" cy="${size*0.25}" rx="${size*0.04}" ry="${size*0.08}" fill="#ffff00"/>
    
    <!-- Side flames -->
    <ellipse cx="-${size*0.06}" cy="${size*0.2}" rx="${size*0.03}" ry="${size*0.08}" fill="url(#flame)"/>
    <ellipse cx="${size*0.06}" cy="${size*0.2}" rx="${size*0.03}" ry="${size*0.08}" fill="url(#flame)"/>
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

console.log('All rocket SVG icons created!');
console.log('Note: You may need to convert these to PNG format for full PWA compatibility.'); 