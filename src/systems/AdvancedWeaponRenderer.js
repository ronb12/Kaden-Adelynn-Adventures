/**
 * Advanced Weapon Renderer
 * Professional-quality weapon visuals with trails, glow, and effects
 */

export class AdvancedWeaponRenderer {
  constructor() {
    this.trailCache = new Map();
  }

  /**
   * Draw advanced bullet with trails and effects
   */
  drawBullet(ctx, bullet, weaponType) {
    const { x, y, width, height, color, speed } = bullet;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    ctx.save();

    switch (weaponType) {
      case 'laser':
        this.drawLaserBolt(ctx, centerX, centerY, width, height, color);
        break;
      case 'plasma':
        this.drawPlasmaBolt(ctx, centerX, centerY, width, height, color);
        break;
      case 'missile':
        this.drawMissile(ctx, centerX, centerY, width, height, color);
        break;
      case 'beam':
        this.drawEnergyBeam(ctx, centerX, centerY, width, height, color);
        break;
      case 'homing':
        this.drawHomingMissile(ctx, centerX, centerY, width, height, color);
        break;
      default:
        this.drawLaserBolt(ctx, centerX, centerY, width, height, color);
    }

    ctx.restore();
  }

  /**
   * Laser Bolt (Solid beam with glow)
   */
  drawLaserBolt(ctx, x, y, w, h, color) {
    // Outer glow
    const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, w);
    outerGradient.addColorStop(0, color);
    outerGradient.addColorStop(0.5, this.addAlpha(color, 0.5));
    outerGradient.addColorStop(1, this.addAlpha(color, 0));

    ctx.fillStyle = outerGradient;
    ctx.fillRect(x - w, y - h/2, w * 2, h);

    // Core beam
    const coreGradient = ctx.createLinearGradient(x - w/2, y, x + w/2, y);
    coreGradient.addColorStop(0, this.addAlpha(color, 0.3));
    coreGradient.addColorStop(0.5, color);
    coreGradient.addColorStop(1, this.addAlpha(color, 0.3));

    ctx.fillStyle = coreGradient;
    ctx.fillRect(x - w/2, y - h/2, w, h);

    // Bright core
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x - w/4, y - h/2, w/2, h);
    ctx.globalAlpha = 1;
  }

  /**
   * Plasma Bolt (Unstable energy ball)
   */
  drawPlasmaBolt(ctx, x, y, w, h, color) {
    // Plasma distortion effect
    const time = Date.now() * 0.01;
    
    // Outer plasma field
    for (let i = 0; i < 3; i++) {
      const offset = Math.sin(time + i) * 3;
      const gradient = ctx.createRadialGradient(
        x + offset, y, 0,
        x + offset, y, w + i * 2
      );
      gradient.addColorStop(0, this.addAlpha(color, 0.8));
      gradient.addColorStop(0.6, this.addAlpha(color, 0.4));
      gradient.addColorStop(1, this.addAlpha(color, 0));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x + offset, y, w + i * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x, y, w/2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Missile (Rocket with exhaust)
   */
  drawMissile(ctx, x, y, w, h, color) {
    // Missile body gradient
    const bodyGradient = ctx.createLinearGradient(x, y - h/2, x, y + h/2);
    bodyGradient.addColorStop(0, this.lighten(color, 30));
    bodyGradient.addColorStop(0.5, color);
    bodyGradient.addColorStop(1, this.darken(color, 20));

    // Main body
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(x, y - h/2); // Nose
    ctx.lineTo(x - w/2, y + h/3);
    ctx.lineTo(x - w/3, y + h/2);
    ctx.lineTo(x + w/3, y + h/2);
    ctx.lineTo(x + w/2, y + h/3);
    ctx.closePath();
    ctx.fill();

    // Fins
    ctx.fillStyle = this.darken(color, 30);
    ctx.beginPath();
    ctx.moveTo(x - w/2, y + h/4);
    ctx.lineTo(x - w, y + h/3);
    ctx.lineTo(x - w/2, y + h/2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + w/2, y + h/4);
    ctx.lineTo(x + w, y + h/3);
    ctx.lineTo(x + w/2, y + h/2);
    ctx.fill();

    // Exhaust glow
    const exhaustGradient = ctx.createRadialGradient(x, y + h/2, 0, x, y + h/2, w);
    exhaustGradient.addColorStop(0, '#ffaa00');
    exhaustGradient.addColorStop(0.5, '#ff6600');
    exhaustGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

    ctx.fillStyle = exhaustGradient;
    ctx.beginPath();
    ctx.arc(x, y + h/2, w, 0, Math.PI * 2);
    ctx.fill();

    // Warhead tip
    ctx.fillStyle = '#ff0000';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y - h/2, w/4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /**
   * Energy Beam (Wide powerful blast)
   */
  drawEnergyBeam(ctx, x, y, w, h, color) {
    // Beam outer glow
    const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, w * 2);
    outerGradient.addColorStop(0, color);
    outerGradient.addColorStop(0.5, this.addAlpha(color, 0.6));
    outerGradient.addColorStop(1, this.addAlpha(color, 0));

    ctx.fillStyle = outerGradient;
    ctx.fillRect(x - w * 2, y - h/2, w * 4, h);

    // Inner beam
    const innerGradient = ctx.createLinearGradient(x - w, y, x + w, y);
    innerGradient.addColorStop(0, this.addAlpha(color, 0));
    innerGradient.addColorStop(0.3, color);
    innerGradient.addColorStop(0.7, color);
    innerGradient.addColorStop(1, this.addAlpha(color, 0));

    ctx.fillStyle = innerGradient;
    ctx.fillRect(x - w, y - h/2, w * 2, h);

    // Core highlights
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    const highlightCount = 3;
    for (let i = 0; i < highlightCount; i++) {
      const highlightY = y - h/2 + (i * h / (highlightCount - 1));
      ctx.fillRect(x - w/4, highlightY - 1, w/2, 2);
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Homing Missile (Glowing seeker)
   */
  drawHomingMissile(ctx, x, y, w, h, color) {
    // Seeker rings (animated)
    const time = Date.now() * 0.005;
    for (let i = 0; i < 3; i++) {
      const ringSize = w + Math.sin(time + i) * w/2;
      ctx.strokeStyle = this.addAlpha(color, 0.3 - i * 0.1);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, ringSize, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Main body
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, w);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.4, color);
    gradient.addColorStop(1, this.darken(color, 40));

    ctx.fillStyle = gradient;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x, y, w, 0, Math.PI * 2);
    ctx.fill();

    // Seeker eye
    ctx.fillStyle = '#ff0000';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, w/3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /**
   * Color utilities
   */
  addAlpha(color, alpha) {
    if (color.startsWith('rgb')) return color;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  lighten(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
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

export default AdvancedWeaponRenderer;

