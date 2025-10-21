/**
 * Procedural Texture System
 * Generates sprite-like details without actual sprite files
 * Rivals sprite-based games in visual quality
 */

export class ProceduralTextureSystem {
  constructor() {
    this.cache = new Map();
    this.noiseCache = new Map();
  }

  /**
   * Generate Perlin-like noise for texture patterns
   */
  generateNoise(width, height, scale = 0.05) {
    const cacheKey = `${width}x${height}x${scale}`;
    if (this.noiseCache.has(cacheKey)) {
      return this.noiseCache.get(cacheKey);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const value = this.simpleNoise(x * scale, y * scale);
        const brightness = Math.floor((value + 1) * 127.5);
        const idx = (y * width + x) * 4;
        data[idx] = brightness;
        data[idx + 1] = brightness;
        data[idx + 2] = brightness;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    this.noiseCache.set(cacheKey, canvas);
    return canvas;
  }

  /**
   * Simple noise function
   */
  simpleNoise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }

  /**
   * Generate panel texture for ships
   */
  generateShipPanels(ctx, width, height, color, panelCount = 5) {
    ctx.save();
    ctx.strokeStyle = this.darken(color, 30);
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;

    // Horizontal panels
    for (let i = 0; i < panelCount; i++) {
      const y = (height / panelCount) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical accent lines
    const vertLines = 3;
    for (let i = 0; i < vertLines; i++) {
      const x = (width / (vertLines + 1)) * (i + 1);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Generate metallic sheen effect
   */
  generateMetallicSheen(ctx, x, y, width, height, angle = Math.PI / 4) {
    ctx.save();
    
    const gradient = ctx.createLinearGradient(
      x, y,
      x + Math.cos(angle) * width,
      y + Math.sin(angle) * height
    );

    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  /**
   * Generate rivets and bolts
   */
  generateRivets(ctx, x, y, width, height, density = 0.1) {
    ctx.save();
    ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';

    const rivetCount = Math.floor(width * height * density / 100);
    
    for (let i = 0; i < rivetCount; i++) {
      const rx = x + Math.random() * width;
      const ry = y + Math.random() * height;
      
      // Rivet body
      ctx.beginPath();
      ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Rivet highlight
      ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
      ctx.beginPath();
      ctx.arc(rx - 0.5, ry - 0.5, 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
    }

    ctx.restore();
  }

  /**
   * Generate exhaust heat distortion
   */
  generateHeatDistortion(ctx, x, y, width, height, intensity = 1.0) {
    const imageData = ctx.getImageData(x, y - height, width, height);
    const data = imageData.data;

    // Apply distortion
    for (let py = 0; py < height; py++) {
      const distortion = Math.sin(py * 0.2 + Date.now() * 0.01) * intensity * 2;
      
      for (let px = 0; px < width; px++) {
        const sourceX = Math.min(width - 1, Math.max(0, px + distortion));
        const targetIdx = (py * width + px) * 4;
        const sourceIdx = (py * width + Math.floor(sourceX)) * 4;

        data[targetIdx] = data[sourceIdx];
        data[targetIdx + 1] = data[sourceIdx + 1];
        data[targetIdx + 2] = data[sourceIdx + 2];
        data[targetIdx + 3] = data[sourceIdx + 3];
      }
    }

    ctx.putImageData(imageData, x, y - height);
  }

  /**
   * Generate energy field effect
   */
  generateEnergyField(ctx, x, y, radius, color, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Outer field
    for (let i = 0; i < 3; i++) {
      const offset = Math.sin(time * 0.002 + i) * 5;
      const alpha = 0.3 - i * 0.1;
      
      ctx.strokeStyle = this.adjustAlpha(color, alpha);
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = (time * 0.1 + i * 10) % 10;
      
      ctx.beginPath();
      ctx.arc(x + offset, y, radius + i * 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  /**
   * Generate holographic display effect
   */
  generateHologram(ctx, x, y, width, height, color) {
    ctx.save();

    // Holographic grid
    ctx.strokeStyle = this.adjustAlpha(color, 0.3);
    ctx.lineWidth = 0.5;

    const gridSize = 10;
    for (let gx = 0; gx < width; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + gx, y);
      ctx.lineTo(x + gx, y + height);
      ctx.stroke();
    }

    for (let gy = 0; gy < height; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, y + gy);
      ctx.lineTo(x + width, y + gy);
      ctx.stroke();
    }

    // Scan line effect
    const scanY = ((Date.now() * 0.1) % height);
    const scanGradient = ctx.createLinearGradient(x, y + scanY - 20, x, y + scanY + 20);
    scanGradient.addColorStop(0, this.adjustAlpha(color, 0));
    scanGradient.addColorStop(0.5, this.adjustAlpha(color, 0.5));
    scanGradient.addColorStop(1, this.adjustAlpha(color, 0));

    ctx.fillStyle = scanGradient;
    ctx.fillRect(x, y + scanY - 20, width, 40);

    // Glitch effect (occasional)
    if (Math.random() > 0.98) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = color;
      const glitchHeight = 5;
      const glitchY = Math.random() * height;
      ctx.fillRect(x, y + glitchY, width, glitchHeight);
    }

    ctx.restore();
  }

  /**
   * Generate shield hexagon pattern
   */
  generateShieldPattern(ctx, x, y, radius, color, strength = 1.0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const hexSize = 12;
    const cols = Math.ceil(radius * 2 / hexSize);
    const rows = Math.ceil(radius * 2 / hexSize);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const hx = x - radius + col * hexSize + (row % 2) * (hexSize / 2);
        const hy = y - radius + row * hexSize * 0.866;

        // Only draw if within circle
        const dist = Math.hypot(hx - x, hy - y);
        if (dist < radius) {
          const alpha = (1 - dist / radius) * strength * 0.4;
          
          ctx.strokeStyle = this.adjustAlpha(color, alpha);
          ctx.lineWidth = 1;
          
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = hx + Math.cos(angle) * (hexSize / 2);
            const py = hy + Math.sin(angle) * (hexSize / 2);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  /**
   * Generate weapon charge effect
   */
  generateChargeEffect(ctx, x, y, radius, color, chargePercent = 1.0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Inner core
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * chargePercent);
    coreGradient.addColorStop(0, '#ffffff');
    coreGradient.addColorStop(0.5, color);
    coreGradient.addColorStop(1, this.adjustAlpha(color, 0));

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * chargePercent, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting particles
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + Date.now() * 0.005;
      const orbitRadius = radius * 1.5 * chargePercent;
      const px = x + Math.cos(angle) * orbitRadius;
      const py = y + Math.sin(angle) * orbitRadius;

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  adjustAlpha(color, alpha) {
    if (color.includes('rgba')) {
      return color.replace(/[\d.]+\)$/, alpha + ')');
    }
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  darken(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
}

export default ProceduralTextureSystem;

