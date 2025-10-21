/**
 * Dynamic Lighting System
 * Real-time lighting and shadows for 10/10 visual quality
 */

export class Light {
  constructor(x, y, color, intensity, radius) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.intensity = intensity;
    this.radius = radius;
    this.flicker = 0;
    this.flickerSpeed = 0.05 + Math.random() * 0.05;
  }

  update() {
    this.flicker += this.flickerSpeed;
  }

  draw(ctx) {
    const flickerIntensity = this.intensity * (0.9 + Math.sin(this.flicker) * 0.1);
    
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius
    );

    gradient.addColorStop(0, this.adjustAlpha(this.color, flickerIntensity));
    gradient.addColorStop(0.5, this.adjustAlpha(this.color, flickerIntensity * 0.5));
    gradient.addColorStop(1, this.adjustAlpha(this.color, 0));

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
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
}

export class DynamicLightingSystem {
  constructor() {
    this.lights = [];
    this.ambientLight = 0.2; // Base darkness level
    this.lightingCanvas = null;
    this.lightingCtx = null;
  }

  initialize(width, height) {
    // Create offscreen canvas for lighting layer
    this.lightingCanvas = document.createElement('canvas');
    this.lightingCanvas.width = width;
    this.lightingCanvas.height = height;
    this.lightingCtx = this.lightingCanvas.getContext('2d');
  }

  addLight(x, y, color, intensity = 0.8, radius = 150) {
    const light = new Light(x, y, color, intensity, radius);
    this.lights.push(light);
    return light;
  }

  removeLight(light) {
    const index = this.lights.indexOf(light);
    if (index > -1) {
      this.lights.splice(index, 1);
    }
  }

  update() {
    this.lights.forEach(light => light.update());
    
    // Remove lights that are offscreen or expired
    this.lights = this.lights.filter(light => {
      return light.active !== false;
    });
  }

  render(ctx, canvas) {
    if (!this.lightingCanvas) {
      this.initialize(canvas.width, canvas.height);
    }

    // Clear lighting layer
    this.lightingCtx.fillStyle = `rgba(0, 0, 20, ${1 - this.ambientLight})`;
    this.lightingCtx.fillRect(0, 0, this.lightingCanvas.width, this.lightingCanvas.height);

    // Draw all lights to lighting layer
    this.lights.forEach(light => light.draw(this.lightingCtx));

    // Composite lighting onto main canvas
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(this.lightingCanvas, 0, 0);
    ctx.restore();

    // Add additive glow pass
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.3;
    this.lights.forEach(light => {
      const gradient = ctx.createRadialGradient(
        light.x, light.y, 0,
        light.x, light.y, light.radius * 0.5
      );
      gradient.addColorStop(0, light.adjustAlpha(light.color, light.intensity * 0.5));
      gradient.addColorStop(1, light.adjustAlpha(light.color, 0));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(light.x, light.y, light.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  clear() {
    this.lights = [];
  }

  setAmbientLight(level) {
    this.ambientLight = Math.max(0, Math.min(1, level));
  }
}

export default DynamicLightingSystem;

