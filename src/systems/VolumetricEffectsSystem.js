/**
 * Volumetric Effects System
 * 3D-like volumetric clouds, fog, and atmospheric effects
 * Pushes visuals to console-quality level
 */

export class VolumetricExplosion {
  constructor(x, y, maxRadius, color, duration) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = maxRadius;
    this.color = color;
    this.duration = duration;
    this.life = duration;
    this.layers = 5;
  }

  update() {
    this.life--;
    const progress = 1 - (this.life / this.duration);
    this.radius = this.maxRadius * Math.sin(progress * Math.PI);
  }

  draw(ctx) {
    if (this.life <= 0) return;

    const alpha = this.life / this.duration;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Draw multiple layers for volumetric effect
    for (let i = 0; i < this.layers; i++) {
      const layerRadius = this.radius * (1 - i / this.layers);
      const layerAlpha = alpha * (1 - i / this.layers) * 0.4;

      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, layerRadius
      );

      gradient.addColorStop(0, this.adjustAlpha(this.color, layerAlpha));
      gradient.addColorStop(0.5, this.adjustAlpha(this.color, layerAlpha * 0.6));
      gradient.addColorStop(1, this.adjustAlpha(this.color, 0));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, layerRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }

  adjustAlpha(color, alpha) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

export class VolumetricEffectsSystem {
  constructor() {
    this.explosions = [];
    this.fogLayers = [];
  }

  /**
   * Create volumetric explosion
   */
  createVolumetricExplosion(x, y, size = 'medium', color = '#ff6600') {
    const sizes = { small: 40, medium: 80, large: 150, huge: 250 };
    const durations = { small: 20, medium: 30, large: 40, huge: 50 };

    const explosion = new VolumetricExplosion(
      x, y,
      sizes[size] || 80,
      color,
      durations[size] || 30
    );

    this.explosions.push(explosion);
  }

  /**
   * Create atmospheric fog
   */
  createFog(ctx, canvas, density = 0.1, color = 'rgba(100, 120, 200, 0.05)') {
    ctx.save();
    
    const fogHeight = canvas.height * 0.3;
    const gradient = ctx.createLinearGradient(0, canvas.height - fogHeight, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, color);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height - fogHeight, canvas.width, fogHeight);

    ctx.restore();
  }

  /**
   * Create depth-of-field blur effect
   */
  applyDepthOfField(ctx, canvas, focusY, blurRadius = 10) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple box blur for areas not in focus
    for (let y = 0; y < canvas.height; y++) {
      const distanceFromFocus = Math.abs(y - focusY);
      const blurAmount = Math.min(1, distanceFromFocus / (canvas.height * 0.3));
      
      if (blurAmount > 0.1) {
        // Apply blur to this row
        this.blurRow(imageData, y, canvas.width, Math.floor(blurRadius * blurAmount));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Simple row blur
   */
  blurRow(imageData, row, width, radius) {
    if (radius < 1) return;

    const data = imageData.data;
    const tempRow = [];

    // Copy row data
    for (let x = 0; x < width; x++) {
      const idx = (row * width + x) * 4;
      tempRow.push([data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]);
    }

    // Apply blur
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;

      for (let dx = -radius; dx <= radius; dx++) {
        const sx = Math.min(width - 1, Math.max(0, x + dx));
        r += tempRow[sx][0];
        g += tempRow[sx][1];
        b += tempRow[sx][2];
        a += tempRow[sx][3];
        count++;
      }

      const idx = (row * width + x) * 4;
      data[idx] = r / count;
      data[idx + 1] = g / count;
      data[idx + 2] = b / count;
      data[idx + 3] = a / count;
    }
  }

  /**
   * Update all volumetric effects
   */
  update() {
    this.explosions.forEach(explosion => explosion.update());
    this.explosions = this.explosions.filter(explosion => !explosion.isDead());
  }

  /**
   * Draw all volumetric effects
   */
  draw(ctx) {
    this.explosions.forEach(explosion => explosion.draw(ctx));
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
}

export default VolumetricEffectsSystem;

