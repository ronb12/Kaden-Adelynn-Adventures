/**
 * Enhanced Particle System
 * Advanced particle effects for explosions, trails, and visual feedback
 */

export class Particle {
  constructor(x, y, vx, vy, color, life, size = 3, type = 'circle') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.type = type;
    this.alpha = 1;
    this.gravity = 0;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.shrink = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.rotation += this.rotationSpeed;
    this.life--;
    
    const lifeRatio = this.life / this.maxLife;
    this.alpha = lifeRatio;
    
    if (this.shrink) {
      this.size = Math.max(0.5, this.size * 0.95);
    }
    
    // Slow down particles over time
    this.vx *= 0.98;
    this.vy *= 0.98;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    switch (this.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'square':
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;
        
      case 'star':
        this.drawStar(ctx, this.size);
        break;
        
      case 'spark':
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
        
      default:
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
  }

  drawStar(ctx, size) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  isDead() {
    return this.life <= 0;
  }
}

export class EnhancedParticleSystem {
  constructor() {
    this.particles = [];
    this.trails = [];
    this.maxParticles = 500;
    this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
  }

  /**
   * Create explosion effect
   */
  createExplosion(x, y, size = 'medium', color = '#ff6600') {
    const particleCounts = { small: 10, medium: 25, large: 50, huge: 100 };
    const count = particleCounts[size] || 25;
    
    const colors = this.getExplosionColors(color);
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const particleColor = colors[Math.floor(Math.random() * colors.length)];
      const particleSize = 2 + Math.random() * 4;
      const life = 20 + Math.random() * 20;
      const type = Math.random() > 0.7 ? 'star' : 'circle';
      
      const particle = new Particle(x, y, vx, vy, particleColor, life, particleSize, type);
      particle.gravity = 0.1;
      this.particles.push(particle);
    }
    
    // Screen shake
    this.addScreenShake(size === 'huge' ? 15 : size === 'large' ? 10 : size === 'medium' ? 5 : 2);
  }

  /**
   * Get explosion color palette
   */
  getExplosionColors(baseColor) {
    const palettes = {
      '#ff6600': ['#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ffffff'],
      '#00ff00': ['#00ff00', '#00ff88', '#88ff88', '#ffffff'],
      '#0088ff': ['#0044ff', '#0088ff', '#00ccff', '#ffffff'],
      '#ff00ff': ['#ff00ff', '#ff88ff', '#ffccff', '#ffffff'],
      '#ffff00': ['#ffff00', '#ffff88', '#ffffcc', '#ffffff']
    };
    
    return palettes[baseColor] || palettes['#ff6600'];
  }

  /**
   * Create ship trail effect
   */
  createTrail(x, y, color = '#0088ff', intensity = 1) {
    if (Math.random() > 0.3 / intensity) return;
    
    const vx = (Math.random() - 0.5) * 0.5;
    const vy = (Math.random() - 0.5) * 0.5;
    const size = 2 + Math.random() * 2;
    const life = 15 + Math.random() * 10;
    
    const particle = new Particle(x, y, vx, vy, color, life, size, 'circle');
    particle.shrink = true;
    this.particles.push(particle);
  }

  /**
   * Create bullet trail
   */
  createBulletTrail(x, y, vx, vy, color = '#ffff00') {
    if (Math.random() > 0.5) return;
    
    const trailVx = vx * -0.1 + (Math.random() - 0.5) * 0.5;
    const trailVy = vy * -0.1 + (Math.random() - 0.5) * 0.5;
    const size = 1 + Math.random() * 2;
    const life = 10 + Math.random() * 5;
    
    const particle = new Particle(x, y, trailVx, trailVy, color, life, size, 'spark');
    particle.shrink = true;
    this.particles.push(particle);
  }

  /**
   * Create power-up collection effect
   */
  createPowerUpEffect(x, y, color = '#ffff00') {
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 2 + Math.random() * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const particle = new Particle(x, y, vx, vy, color, 30, 3, 'star');
      particle.gravity = -0.05; // Float upward
      this.particles.push(particle);
    }
  }

  /**
   * Create hit spark effect
   */
  createHitSpark(x, y, angle, color = '#ffffff') {
    for (let i = 0; i < 5; i++) {
      const spreadAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
      const speed = 3 + Math.random() * 3;
      const vx = Math.cos(spreadAngle) * speed;
      const vy = Math.sin(spreadAngle) * speed;
      
      const particle = new Particle(x, y, vx, vy, color, 15, 2, 'spark');
      this.particles.push(particle);
    }
  }

  /**
   * Create level up effect
   */
  createLevelUpEffect(x, y) {
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const radius = 50 + Math.random() * 30;
      const particleX = x + Math.cos(angle) * radius;
      const particleY = y + Math.sin(angle) * radius;
      
      const vx = Math.cos(angle) * -2;
      const vy = Math.sin(angle) * -2 - 1;
      
      const colors = ['#ffff00', '#ffaa00', '#ff6600', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle = new Particle(particleX, particleY, vx, vy, color, 40, 3, 'star');
      particle.gravity = 0.05;
      this.particles.push(particle);
    }
    
    this.addScreenShake(8);
  }

  /**
   * Create shield hit effect
   */
  createShieldHit(x, y, radius = 40, color = '#00ffff') {
    const count = 15;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const particleX = x + Math.cos(angle) * radius;
      const particleY = y + Math.sin(angle) * radius;
      
      const vx = Math.cos(angle) * 2;
      const vy = Math.sin(angle) * 2;
      
      const particle = new Particle(particleX, particleY, vx, vy, color, 20, 3, 'circle');
      this.particles.push(particle);
    }
  }

  /**
   * Create warp effect
   */
  createWarpEffect(x, y, color = '#00ccff') {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 10;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const particle = new Particle(x, y, vx, vy, color, 25, 2, 'spark');
      this.particles.push(particle);
    }
  }

  /**
   * Screen shake effect
   */
  addScreenShake(intensity = 5, duration = 10) {
    this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
    this.screenShake.duration = Math.max(this.screenShake.duration, duration);
  }

  getScreenShake() {
    if (this.screenShake.duration > 0) {
      const intensity = this.screenShake.intensity * (this.screenShake.duration / 10);
      return {
        x: (Math.random() - 0.5) * intensity,
        y: (Math.random() - 0.5) * intensity
      };
    }
    return { x: 0, y: 0 };
  }

  /**
   * Update all particles
   */
  update() {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }

    // Limit particle count
    if (this.particles.length > this.maxParticles) {
      this.particles.splice(0, this.particles.length - this.maxParticles);
    }

    // Update screen shake
    if (this.screenShake.duration > 0) {
      this.screenShake.duration--;
      if (this.screenShake.duration === 0) {
        this.screenShake.intensity = 0;
      }
    }
  }

  /**
   * Draw all particles
   */
  draw(ctx) {
    this.particles.forEach(particle => particle.draw(ctx));
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
    this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
  }

  /**
   * Get particle count
   */
  getCount() {
    return this.particles.length;
  }
}

export default EnhancedParticleSystem;

