/**
 * Enhanced Background Renderer
 * Professional-quality space backgrounds to compete with top games
 */

export class ShootingStar {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight);
  }

  reset(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = -50;
    this.speed = 5 + Math.random() * 10;
    this.length = 20 + Math.random() * 40;
    this.brightness = 0.6 + Math.random() * 0.4;
    this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    this.active = true;
    this.canvasHeight = canvasHeight;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    if (this.y > this.canvasHeight + 50) {
      this.active = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.brightness;
    
    const gradient = ctx.createLinearGradient(
      this.x, this.y,
      this.x - Math.cos(this.angle) * this.length,
      this.y - Math.sin(this.angle) * this.length
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#aaccff');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x - Math.cos(this.angle) * this.length,
      this.y - Math.sin(this.angle) * this.length
    );
    ctx.stroke();

    // Glow core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export class EnhancedNebula {
  constructor(x, y, size, colors) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.colors = colors;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.001;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.arms = 3 + Math.floor(Math.random() * 4);
  }

  update() {
    this.rotation += this.rotationSpeed;
    this.pulsePhase += 0.02;
  }

  draw(ctx, time) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const pulse = 0.8 + Math.sin(this.pulsePhase) * 0.2;

    // Multi-colored spiral nebula
    for (let arm = 0; arm < this.arms; arm++) {
      const armAngle = (Math.PI * 2 / this.arms) * arm;
      
      for (let i = 0; i < 8; i++) {
        const radius = this.size * (i / 8) * pulse;
        const angle = armAngle + (i * 0.3);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.size / 8);
        gradient.addColorStop(0, this.colors[i % this.colors.length]);
        gradient.addColorStop(0.5, this.adjustAlpha(this.colors[i % this.colors.length], 0.3));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.4 - (i * 0.04);
        ctx.beginPath();
        ctx.arc(x, y, this.size / 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  adjustAlpha(color, alpha) {
    return color.replace(/[\d.]+\)/, alpha + ')');
  }
}

export class DistantPlanet {
  constructor(x, y, radius, type) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.type = type; // 'gas', 'rocky', 'ice', 'lava'
    this.rotation = 0;
    this.rotationSpeed = 0.001 + Math.random() * 0.002;
    this.hasRings = Math.random() > 0.6;
    this.hasMoons = Math.random() > 0.7;
    this.moons = this.hasMoons ? Math.floor(1 + Math.random() * 3) : 0;
  }

  update() {
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Planet body with atmospheric layers
    const planetGradient = ctx.createRadialGradient(
      -this.radius * 0.3, -this.radius * 0.3, 0,
      0, 0, this.radius
    );

    const colors = this.getPlanetColors();
    planetGradient.addColorStop(0, colors.light);
    planetGradient.addColorStop(0.5, colors.main);
    planetGradient.addColorStop(0.9, colors.dark);
    planetGradient.addColorStop(1, colors.shadow);

    ctx.fillStyle = planetGradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Atmospheric glow
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = colors.glow;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
    ctx.stroke();

    // Surface details (craters, clouds)
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = colors.dark;
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i + this.rotation;
      const dist = this.radius * 0.6;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(x, y, this.radius * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Rings (if applicable)
    if (this.hasRings) {
      ctx.globalAlpha = 0.6;
      const ringGradient = ctx.createLinearGradient(
        -this.radius * 2, 0,
        this.radius * 2, 0
      );
      ringGradient.addColorStop(0, 'rgba(200, 180, 150, 0)');
      ringGradient.addColorStop(0.4, 'rgba(200, 180, 150, 0.8)');
      ringGradient.addColorStop(0.6, 'rgba(200, 180, 150, 0.8)');
      ringGradient.addColorStop(1, 'rgba(200, 180, 150, 0)');

      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = this.radius * 0.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 1.6, this.radius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Ring shadow on planet
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 1.5, this.radius * 0.25, 0, 0, Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Moons
    if (this.hasMoons) {
      ctx.globalAlpha = 0.8;
      for (let i = 0; i < this.moons; i++) {
        const moonAngle = (Math.PI * 2 / this.moons) * i + this.rotation * 0.5;
        const moonDist = this.radius * (2 + i * 0.5);
        const moonX = Math.cos(moonAngle) * moonDist;
        const moonY = Math.sin(moonAngle) * moonDist * 0.5; // Elliptical orbit
        const moonSize = this.radius * 0.15;

        const moonGradient = ctx.createRadialGradient(
          moonX - moonSize * 0.3, moonY - moonSize * 0.3, 0,
          moonX, moonY, moonSize
        );
        moonGradient.addColorStop(0, '#cccccc');
        moonGradient.addColorStop(1, '#666666');

        ctx.fillStyle = moonGradient;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  getPlanetColors() {
    const types = {
      gas: {
        light: '#9370DB',
        main: '#8A2BE2',
        dark: '#4B0082',
        shadow: '#2F1B3C',
        glow: '#BA55D3'
      },
      rocky: {
        light: '#D2B48C',
        main: '#CD853F',
        dark: '#8B4513',
        shadow: '#3E2723',
        glow: '#DEB887'
      },
      ice: {
        light: '#E0FFFF',
        main: '#87CEEB',
        dark: '#4682B4',
        shadow: '#191970',
        glow: '#ADD8E6'
      },
      lava: {
        light: '#FFD700',
        main: '#FF6347',
        dark: '#DC143C',
        shadow: '#8B0000',
        glow: '#FF4500'
      }
    };

    return types[this.type] || types.rocky;
  }
}

export class EnhancedBackgroundRenderer {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.shootingStars = [];
    this.nebulae = [];
    this.planets = [];
    this.initialized = false;
  }

  initialize() {
    // Create shooting stars (spawn periodically)
    this.shootingStarTimer = 0;

    // Create 3-4 nebulae
    const nebulaColors = [
      ['rgba(138, 43, 226, 0.4)', 'rgba(255, 20, 147, 0.3)', 'rgba(147, 112, 219, 0.2)'], // Purple/Pink
      ['rgba(0, 191, 255, 0.4)', 'rgba(30, 144, 255, 0.3)', 'rgba(65, 105, 225, 0.2)'], // Blue
      ['rgba(255, 140, 0, 0.4)', 'rgba(255, 69, 0, 0.3)', 'rgba(220, 20, 60, 0.2)'], // Orange/Red
      ['rgba(34, 139, 34, 0.4)', 'rgba(0, 250, 154, 0.3)', 'rgba(50, 205, 50, 0.2)'] // Green
    ];

    for (let i = 0; i < 4; i++) {
      this.nebulae.push(new EnhancedNebula(
        Math.random() * this.canvasWidth,
        Math.random() * this.canvasHeight,
        150 + Math.random() * 250,
        nebulaColors[i]
      ));
    }

    // Create 2-3 distant planets
    const planetTypes = ['gas', 'rocky', 'ice', 'lava'];
    for (let i = 0; i < 3; i++) {
      this.planets.push(new DistantPlanet(
        Math.random() * this.canvasWidth,
        Math.random() * this.canvasHeight,
        30 + Math.random() * 60,
        planetTypes[Math.floor(Math.random() * planetTypes.length)]
      ));
    }

    this.initialized = true;
  }

  update() {
    if (!this.initialized) this.initialize();

    // Update nebulae
    this.nebulae.forEach(nebula => nebula.update());

    // Update planets
    this.planets.forEach(planet => planet.update());

    // Update shooting stars
    this.shootingStars = this.shootingStars.filter(star => {
      star.update();
      return star.active;
    });

    // Spawn new shooting stars periodically
    this.shootingStarTimer++;
    if (this.shootingStarTimer > 180 && Math.random() > 0.98) { // ~2% chance per frame
      this.shootingStars.push(new ShootingStar(this.canvasWidth, this.canvasHeight));
      this.shootingStarTimer = 0;
    }
  }

  draw(ctx, time) {
    // Draw nebulae (farthest back)
    this.nebulae.forEach(nebula => nebula.draw(ctx, time));

    // Draw planets
    this.planets.forEach(planet => planet.draw(ctx));

    // Draw shooting stars (foreground effect)
    this.shootingStars.forEach(star => star.draw(ctx));

    // Add atmospheric dust/particles
    this.drawSpaceDust(ctx, time);
  }

  /**
   * Draw subtle space dust particles
   */
  drawSpaceDust(ctx, time) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    
    for (let i = 0; i < 30; i++) {
      const x = (i * 47 + time * 0.2) % this.canvasWidth;
      const y = (i * 73 + time * 0.15) % this.canvasHeight;
      const size = 0.5 + (i % 3) * 0.3;
      
      ctx.fillStyle = i % 3 === 0 ? '#aaccff' : '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * Resize for responsive canvas
   */
  resize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.initialized = false; // Reinitialize on next frame
  }
}

export default EnhancedBackgroundRenderer;

