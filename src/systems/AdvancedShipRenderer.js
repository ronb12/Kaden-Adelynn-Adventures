/**
 * Advanced Ship Renderer
 * Creates professional-quality ship visuals without sprites
 * Multi-part geometric designs that rival sprite-based games
 */

export class AdvancedShipRenderer {
  constructor() {
    this.shipCache = new Map(); // Cache rendered ships for performance
    this.animationTime = 0;
  }

  /**
   * Update animation time
   */
  update(deltaTime = 1) {
    this.animationTime += deltaTime;
  }

  /**
   * Draw advanced ship based on shape type
   */
  drawShip(ctx, x, y, width, height, shipData, options = {}) {
    const {
      color = '#0088ff',
      glowColor = '#00ccff',
      shape = 'advanced_triangle',
      health = 1.0,
      invincible = false,
      character = 'kaden'
    } = { ...shipData, ...options };

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    // Invincibility flicker
    if (invincible && Math.floor(this.animationTime / 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Damage-based color shift
    const damageColor = health < 0.3 ? '#ff4400' : health < 0.6 ? '#ffaa00' : color;

    switch (shape) {
      case 'advanced_triangle':
        this.drawAdvancedTriangle(ctx, width, height, damageColor, glowColor);
        break;
      case 'fighter_jet':
        this.drawFighterJet(ctx, width, height, damageColor, glowColor);
        break;
      case 'heavy_bomber':
        this.drawHeavyBomber(ctx, width, height, damageColor, glowColor);
        break;
      case 'interceptor':
        this.drawInterceptor(ctx, width, height, damageColor, glowColor);
        break;
      case 'stealth_ship':
        this.drawStealthShip(ctx, width, height, damageColor, glowColor);
        break;
      case 'carrier':
        this.drawCarrier(ctx, width, height, damageColor, glowColor);
        break;
      case 'destroyer':
        this.drawDestroyer(ctx, width, height, damageColor, glowColor);
        break;
      case 'corvette':
        this.drawCorvette(ctx, width, height, damageColor, glowColor);
        break;
      case 'cruiser':
        this.drawCruiser(ctx, width, height, damageColor, glowColor);
        break;
      case 'battleship':
        this.drawBattleship(ctx, width, height, damageColor, glowColor);
        break;
      default:
        this.drawAdvancedTriangle(ctx, width, height, damageColor, glowColor);
    }

    // Engine glow animation
    this.drawEngineGlow(ctx, width, height, glowColor);

    ctx.restore();
  }

  /**
   * Advanced Triangle (Enhanced from basic)
   */
  drawAdvancedTriangle(ctx, w, h, color, glowColor) {
    // Main body gradient
    const gradient = ctx.createLinearGradient(0, -h/2, 0, h/2);
    gradient.addColorStop(0, this.lighten(color, 40));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, this.darken(color, 30));

    // Main hull
    ctx.fillStyle = gradient;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(0, -h/2); // Nose
    ctx.lineTo(-w/2 + 5, h/2); // Left wing inner
    ctx.lineTo(-w/2, h/2 + 3); // Left wing tip
    ctx.lineTo(-w/3, h/2); // Left engine
    ctx.lineTo(w/3, h/2); // Right engine
    ctx.lineTo(w/2, h/2 + 3); // Right wing tip
    ctx.lineTo(w/2 - 5, h/2); // Right wing inner
    ctx.closePath();
    ctx.fill();

    // Cockpit window
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(0, -h/4, w/8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Wing details
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w/4, h/4);
    ctx.lineTo(-w/3, -h/8);
    ctx.moveTo(w/4, h/4);
    ctx.lineTo(w/3, -h/8);
    ctx.stroke();

    // Center line
    ctx.strokeStyle = this.lighten(color, 60);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -h/2 + 5);
    ctx.lineTo(0, h/2 - 5);
    ctx.stroke();
  }

  /**
   * Fighter Jet (Sleek and fast)
   */
  drawFighterJet(ctx, w, h, color, glowColor) {
    // Main body
    const gradient = ctx.createLinearGradient(0, -h/2, 0, h/2);
    gradient.addColorStop(0, this.lighten(color, 50));
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(1, this.darken(color, 40));

    ctx.fillStyle = gradient;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20;

    // Streamlined fuselage
    ctx.beginPath();
    ctx.moveTo(0, -h/2); // Pointed nose
    ctx.quadraticCurveTo(-w/6, -h/3, -w/4, 0); // Left curve
    ctx.lineTo(-w/3, h/2); // Left back
    ctx.lineTo(w/3, h/2); // Right back
    ctx.lineTo(w/4, 0); // Right curve
    ctx.quadraticCurveTo(w/6, -h/3, 0, -h/2); // Complete
    ctx.fill();

    // Wings (delta wings)
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(-w/4, -h/6);
    ctx.lineTo(-w/2, h/4);
    ctx.lineTo(-w/3, h/4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w/4, -h/6);
    ctx.lineTo(w/2, h/4);
    ctx.lineTo(w/3, h/4);
    ctx.closePath();
    ctx.fill();

    // Cockpit canopy
    ctx.shadowBlur = 0;
    const canopyGradient = ctx.createRadialGradient(0, -h/4, 0, 0, -h/4, w/6);
    canopyGradient.addColorStop(0, 'rgba(100, 200, 255, 0.9)');
    canopyGradient.addColorStop(1, 'rgba(0, 100, 200, 0.5)');
    ctx.fillStyle = canopyGradient;
    ctx.beginPath();
    ctx.arc(0, -h/4, w/6, 0, Math.PI * 2);
    ctx.fill();

    // Detail lines
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(-w/8, -h/3);
    ctx.lineTo(-w/8, h/3);
    ctx.moveTo(w/8, -h/3);
    ctx.lineTo(w/8, h/3);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /**
   * Heavy Bomber (Large and imposing)
   */
  drawHeavyBomber(ctx, w, h, color, glowColor) {
    const gradient = ctx.createLinearGradient(0, -h/2, 0, h/2);
    gradient.addColorStop(0, this.darken(color, 20));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, this.darken(color, 40));

    ctx.fillStyle = gradient;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;

    // Wide, bulky main body
    ctx.beginPath();
    ctx.moveTo(0, -h/2);
    ctx.lineTo(-w/3, -h/4);
    ctx.lineTo(-w/2, h/4);
    ctx.lineTo(-w/2, h/2);
    ctx.lineTo(-w/4, h/2);
    ctx.lineTo(w/4, h/2);
    ctx.lineTo(w/2, h/2);
    ctx.lineTo(w/2, h/4);
    ctx.lineTo(w/3, -h/4);
    ctx.closePath();
    ctx.fill();

    // Weapon pods
    ctx.fillStyle = this.darken(color, 30);
    ctx.fillRect(-w/2 + 5, 0, w/6, h/3);
    ctx.fillRect(w/2 - 5 - w/6, 0, w/6, h/3);

    // Cockpit area
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(-w/8, -h/3, w/4, h/6);

    // Detail panels
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(-w/4, -h/4 + (i * h/6), w/2, 2);
    }
  }

  /**
   * Interceptor (Ultra-sleek speed demon)
   */
  drawInterceptor(ctx, w, h, color, glowColor) {
    const gradient = ctx.createLinearGradient(0, -h/2, 0, h/2);
    gradient.addColorStop(0, this.lighten(color, 60));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, this.darken(color, 20));

    ctx.fillStyle = gradient;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 25;

    // Needle-like design
    ctx.beginPath();
    ctx.moveTo(0, -h/2); // Sharp nose
    ctx.quadraticCurveTo(-w/8, -h/3, -w/6, 0);
    ctx.lineTo(-w/5, h/2);
    ctx.lineTo(-w/8, h/2);
    ctx.lineTo(w/8, h/2);
    ctx.lineTo(w/5, h/2);
    ctx.lineTo(w/6, 0);
    ctx.quadraticCurveTo(w/8, -h/3, 0, -h/2);
    ctx.fill();

    // Speed fins
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 3; i++) {
      const offset = -h/4 + (i * h/4);
      ctx.beginPath();
      ctx.moveTo(-w/6, offset);
      ctx.lineTo(-w/3, offset + h/12);
      ctx.lineTo(-w/6, offset + h/8);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w/6, offset);
      ctx.lineTo(w/3, offset + h/12);
      ctx.lineTo(w/6, offset + h/8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Cockpit streak
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -h/2 + 5, 2, h/4);
  }

  /**
   * Stealth Ship (Angular and mysterious)
   */
  drawStealthShip(ctx, w, h, color, glowColor) {
    ctx.fillStyle = this.darken(color, 40);
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;

    // Angular stealth design
    ctx.beginPath();
    ctx.moveTo(0, -h/2);
    ctx.lineTo(-w/3, -h/6);
    ctx.lineTo(-w/2, h/6);
    ctx.lineTo(-w/3, h/2);
    ctx.lineTo(w/3, h/2);
    ctx.lineTo(w/2, h/6);
    ctx.lineTo(w/3, -h/6);
    ctx.closePath();
    ctx.fill();

    // Stealth coating effect
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.globalAlpha = 1;

    // Angular details
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -h/2);
    ctx.lineTo(0, h/2);
    ctx.moveTo(-w/4, 0);
    ctx.lineTo(w/4, 0);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /**
   * Carrier (Large command ship)
   */
  drawCarrier(ctx, w, h, color, glowColor) {
    const gradient = ctx.createLinearGradient(0, -h/2, 0, h/2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, this.darken(color, 20));
    gradient.addColorStop(1, this.darken(color, 40));

    ctx.fillStyle = gradient;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;

    // Large rectangular main body
    ctx.fillRect(-w/2, -h/2, w, h);

    // Bridge tower
    ctx.fillStyle = this.lighten(color, 30);
    ctx.fillRect(-w/6, -h/2 - h/6, w/3, h/6);

    // Hangar bays
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(-w/3, -h/6, w/8, h/4);
    ctx.fillRect(w/3 - w/8, -h/6, w/8, h/4);
    ctx.globalAlpha = 1;

    // Detail panels
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(-w/2 + 5, -h/2 + 10 + (i * h/5), w - 10, 2);
    }

    // Antenna array
    ctx.strokeStyle = this.lighten(color, 50);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -h/2 - h/6);
    ctx.lineTo(0, -h/2 - h/4);
    ctx.stroke();
  }

  /**
   * Destroyer (Aggressive warship)
   */
  drawDestroyer(ctx, w, h, color, glowColor) {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, w/2);
    gradient.addColorStop(0, this.lighten(color, 30));
    gradient.addColorStop(0.7, color);
    gradient.addColorStop(1, this.darken(color, 30));

    ctx.fillStyle = gradient;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 18;

    // Hexagonal main body
    const sides = 6;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const x = Math.cos(angle) * w/2.5;
      const y = Math.sin(angle) * h/2.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Weapon hardpoints
    ctx.fillStyle = this.darken(color, 40);
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const x = Math.cos(angle) * w/3;
      const y = Math.sin(angle) * h/3;
      ctx.beginPath();
      ctx.arc(x, y, w/12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central core
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, w/6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /**
   * Corvette (Small, nimble warship)
   */
  drawCorvette(ctx, w, h, color, glowColor) {
    const gradient = ctx.createLinearGradient(0, -h/2, 0, h/2);
    gradient.addColorStop(0, this.lighten(color, 40));
    gradient.addColorStop(0.6, color);
    gradient.addColorStop(1, this.darken(color, 30));

    ctx.fillStyle = gradient;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;

    // Sleek arrow design
    ctx.beginPath();
    ctx.moveTo(0, -h/2);
    ctx.lineTo(-w/4, -h/4);
    ctx.lineTo(-w/3, h/6);
    ctx.lineTo(-w/4, h/2);
    ctx.lineTo(-w/6, h/2);
    ctx.lineTo(w/6, h/2);
    ctx.lineTo(w/4, h/2);
    ctx.lineTo(w/3, h/6);
    ctx.lineTo(w/4, -h/4);
    ctx.closePath();
    ctx.fill();

    // Side panels
    ctx.fillStyle = this.lighten(color, 20);
    ctx.fillRect(-w/6, -h/4, w/12, h/2);
    ctx.fillRect(w/6 - w/12, -h/4, w/12, h/2);

    // Cockpit
    const cockpitGradient = ctx.createRadialGradient(0, -h/3, 0, 0, -h/3, w/8);
    cockpitGradient.addColorStop(0, 'rgba(150, 220, 255, 1)');
    cockpitGradient.addColorStop(1, 'rgba(0, 100, 200, 0.7)');
    ctx.fillStyle = cockpitGradient;
    ctx.beginPath();
    ctx.arc(0, -h/3, w/8, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Cruiser (Medium battleship)
   */
  drawCruiser(ctx, w, h, color, glowColor) {
    const gradient = ctx.createLinearGradient(0, -h/2, 0, h/2);
    gradient.addColorStop(0, this.lighten(color, 30));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, this.darken(color, 35));

    ctx.fillStyle = gradient;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;

    // Main hull (octagonal)
    ctx.beginPath();
    ctx.moveTo(0, -h/2);
    ctx.lineTo(-w/4, -h/3);
    ctx.lineTo(-w/3, 0);
    ctx.lineTo(-w/3, h/3);
    ctx.lineTo(-w/4, h/2);
    ctx.lineTo(w/4, h/2);
    ctx.lineTo(w/3, h/3);
    ctx.lineTo(w/3, 0);
    ctx.lineTo(w/4, -h/3);
    ctx.closePath();
    ctx.fill();

    // Dual engine pods
    ctx.fillStyle = this.darken(color, 20);
    ctx.fillRect(-w/2, h/4, w/6, h/3);
    ctx.fillRect(w/2 - w/6, h/4, w/6, h/3);

    // Command bridge
    ctx.fillStyle = this.lighten(color, 40);
    ctx.fillRect(-w/8, -h/2 + 5, w/4, h/8);

    // Weapon arrays
    ctx.fillStyle = '#ff6600';
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 3; i++) {
      const y = -h/4 + (i * h/4);
      ctx.fillRect(-w/3 - 3, y, 6, 3);
      ctx.fillRect(w/3 - 3, y, 6, 3);
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Battleship (Massive capital ship)
   */
  drawBattleship(ctx, w, h, color, glowColor) {
    const gradient = ctx.createLinearGradient(0, -h/2, 0, h/2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, this.darken(color, 15));
    gradient.addColorStop(0.7, this.darken(color, 30));
    gradient.addColorStop(1, this.darken(color, 50));

    ctx.fillStyle = gradient;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20;

    // Massive rectangular hull
    ctx.fillRect(-w/2, -h/2, w, h);

    // Multiple deck layers
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = this.lighten(color, 10 + i * 5);
      const deckY = -h/2 + (i * h/5);
      ctx.fillRect(-w/2 + 3, deckY, w - 6, h/5 - 2);
    }

    // Bridge superstructure
    ctx.fillStyle = this.lighten(color, 40);
    ctx.fillRect(-w/5, -h/2 - h/5, w/2.5, h/5);

    // Turret emplacements
    ctx.fillStyle = this.darken(color, 30);
    const turrets = [
      { x: -w/3, y: -h/4 },
      { x: w/3, y: -h/4 },
      { x: -w/3, y: h/4 },
      { x: w/3, y: h/4 }
    ];
    turrets.forEach(turret => {
      ctx.beginPath();
      ctx.arc(turret.x, turret.y, w/10, 0, Math.PI * 2);
      ctx.fill();
    });

    // Hull plating details
    ctx.strokeStyle = this.darken(color, 60);
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.strokeRect(-w/2 + 5, -h/2 + 5 + (i * h/9), w - 10, h/10);
    }
  }

  /**
   * Engine Glow (Animated pulsing)
   */
  drawEngineGlow(ctx, w, h, glowColor) {
    const pulse = 0.7 + Math.sin(this.animationTime * 0.1) * 0.3;
    
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20 * pulse;
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = pulse;

    // Dual engine exhausts
    ctx.beginPath();
    ctx.arc(-w/6, h/2, w/12 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(w/6, h/2, w/12 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Engine trails
    const trailGradient = ctx.createLinearGradient(0, h/2, 0, h/2 + h/3);
    trailGradient.addColorStop(0, glowColor);
    trailGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = trailGradient;
    ctx.fillRect(-w/6 - w/16, h/2, w/8, h/3 * pulse);
    ctx.fillRect(w/6 - w/16, h/2, w/8, h/3 * pulse);

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  /**
   * Color manipulation utilities
   */
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

  /**
   * Get shape for ship tier
   */
  static getShapeForTier(tierIndex, shipIndex) {
    const shapes = [
      // Common (Tier 0)
      ['advanced_triangle', 'fighter_jet', 'corvette'],
      // Uncommon (Tier 1)
      ['interceptor', 'fighter_jet', 'corvette', 'advanced_triangle'],
      // Rare (Tier 2)
      ['heavy_bomber', 'cruiser', 'stealth_ship', 'destroyer'],
      // Epic (Tier 3)
      ['cruiser', 'destroyer', 'battleship', 'carrier'],
      // Legendary (Tier 4)
      ['battleship', 'carrier', 'destroyer', 'cruiser']
    ];

    const tierShapes = shapes[Math.min(tierIndex, shapes.length - 1)];
    return tierShapes[shipIndex % tierShapes.length];
  }
}

export default AdvancedShipRenderer;

