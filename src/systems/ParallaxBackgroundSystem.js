/**
 * Parallax Background System
 * Multi-layer scrolling backgrounds with nebulas, planets, and stars
 */

export class BackgroundLayer {
  constructor(type, speed, density, color, size) {
    this.type = type; // 'stars', 'nebula', 'planet', 'asteroid'
    this.speed = speed; // Scroll speed multiplier
    this.density = density; // Number of elements
    this.color = color;
    this.size = size;
    this.elements = [];
    this.initialized = false;
  }

  initialize(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.elements = [];
    
    switch (this.type) {
      case 'stars':
        this.initializeStars();
        break;
      case 'nebula':
        this.initializeNebula();
        break;
      case 'planets':
        this.initializePlanets();
        break;
      case 'asteroids':
        this.initializeAsteroids();
        break;
      default:
        break;
    }
    
    this.initialized = true;
  }

  initializeStars() {
    for (let i = 0; i < this.density; i++) {
      this.elements.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        size: 0.5 + Math.random() * this.size,
        brightness: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  initializeNebula() {
    for (let i = 0; i < this.density; i++) {
      this.elements.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        width: 200 + Math.random() * 400,
        height: 150 + Math.random() * 300,
        rotation: Math.random() * Math.PI * 2,
        opacity: 0.1 + Math.random() * 0.2,
        color: this.getNebulaColor()
      });
    }
  }

  initializePlanets() {
    for (let i = 0; i < this.density; i++) {
      this.elements.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        radius: 30 + Math.random() * 70,
        color: this.getPlanetColor(),
        hasRing: Math.random() > 0.7,
        ringColor: this.getRingColor(),
        rotationSpeed: 0.001 + Math.random() * 0.002,
        rotation: 0
      });
    }
  }

  initializeAsteroids() {
    for (let i = 0; i < this.density; i++) {
      this.elements.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        size: 5 + Math.random() * 15,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        sides: 5 + Math.floor(Math.random() * 3)
      });
    }
  }

  getNebulaColor() {
    const colors = [
      'rgba(138, 43, 226, 0.3)',   // Purple
      'rgba(255, 20, 147, 0.3)',   // Pink
      'rgba(0, 191, 255, 0.3)',    // Blue
      'rgba(34, 139, 34, 0.3)',    // Green
      'rgba(255, 140, 0, 0.3)'     // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getPlanetColor() {
    const colors = [
      ['#8B4513', '#CD853F'],  // Brown/Tan - Desert planet
      ['#4169E1', '#87CEEB'],  // Blue - Water planet
      ['#DC143C', '#FF6347'],  // Red - Mars-like
      ['#9370DB', '#BA55D3'],  // Purple - Gas giant
      ['#FFD700', '#FFA500'],  // Yellow/Orange - Hot planet
      ['#2F4F4F', '#708090']   // Grey - Rocky planet
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getRingColor() {
    const colors = ['#D4AF37', '#C0C0C0', '#B87333', '#E5E4E2'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update(scrollSpeed = 1) {
    this.elements.forEach((element, index) => {
      // Scroll downward
      element.y += this.speed * scrollSpeed;
      
      // Wrap around when off screen
      if (element.y > this.canvasHeight + 100) {
        element.y = -100;
        element.x = Math.random() * this.canvasWidth;
      }
      
      // Update rotation for planets and asteroids
      if (element.rotationSpeed) {
        element.rotation += element.rotationSpeed;
      }
    });
  }

  draw(ctx, time = 0) {
    if (!this.initialized) return;
    
    this.elements.forEach(element => {
      switch (this.type) {
        case 'stars':
          this.drawStar(ctx, element, time);
          break;
        case 'nebula':
          this.drawNebula(ctx, element);
          break;
        case 'planets':
          this.drawPlanet(ctx, element);
          break;
        case 'asteroids':
          this.drawAsteroid(ctx, element);
          break;
        default:
          break;
      }
    });
  }

  drawStar(ctx, star, time) {
    const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
    const alpha = star.brightness * twinkle;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color || '#ffffff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow for larger stars
    if (star.size > 1.5) {
      ctx.globalAlpha = alpha * 0.3;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  drawNebula(ctx, nebula) {
    ctx.save();
    ctx.globalAlpha = nebula.opacity;
    ctx.translate(nebula.x, nebula.y);
    ctx.rotate(nebula.rotation);
    
    // Create radial gradient for nebula
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.width / 2);
    gradient.addColorStop(0, nebula.color);
    gradient.addColorStop(0.5, nebula.color.replace('0.3', '0.15'));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(-nebula.width / 2, -nebula.height / 2, nebula.width, nebula.height);
    
    ctx.restore();
  }

  drawPlanet(ctx, planet) {
    ctx.save();
    ctx.translate(planet.x, planet.y);
    ctx.rotate(planet.rotation);
    
    // Draw planet body with gradient
    const gradient = ctx.createRadialGradient(
      -planet.radius * 0.3, -planet.radius * 0.3, 0,
      0, 0, planet.radius
    );
    gradient.addColorStop(0, planet.color[1]);
    gradient.addColorStop(1, planet.color[0]);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw atmospheric glow
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = planet.color[1];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, planet.radius + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // Draw ring if applicable
    if (planet.hasRing) {
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = planet.ringColor;
      ctx.lineWidth = planet.radius * 0.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, planet.radius * 1.5, planet.radius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    
    ctx.restore();
  }

  drawAsteroid(ctx, asteroid) {
    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);
    
    ctx.fillStyle = this.color || '#888888';
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    for (let i = 0; i < asteroid.sides; i++) {
      const angle = (Math.PI * 2 / asteroid.sides) * i;
      const radius = asteroid.size * (0.8 + Math.random() * 0.4);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
}

export class ParallaxBackgroundSystem {
  constructor() {
    this.layers = [];
    this.time = 0;
    this.scrollSpeed = 1;
    this.initialized = false;
  }

  /**
   * Initialize background layers
   */
  initialize(canvasWidth, canvasHeight, preset = 'space') {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.layers = [];
    
    switch (preset) {
      case 'space':
        this.initializeSpacePreset();
        break;
      case 'nebula':
        this.initializeNebulaPreset();
        break;
      case 'asteroid':
        this.initializeAsteroidPreset();
        break;
      case 'deep_space':
        this.initializeDeepSpacePreset();
        break;
      default:
        this.initializeSpacePreset();
    }
    
    // Initialize all layers
    this.layers.forEach(layer => layer.initialize(canvasWidth, canvasHeight));
    this.initialized = true;
  }

  /**
   * Initialize from preset config (supports 150 presets!)
   */
  initializeFromConfig(canvasWidth, canvasHeight, config) {
    if (!config) {
      console.warn('⚠️ No background config provided, using default space preset');
      this.initialize(canvasWidth, canvasHeight, 'space');
      return;
    }
    
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.layers = [];
    this.config = config;
    this.darkness = config.darkness || 0.5;
    this.backgroundColor = config.color || '#000033';
    
    // Apply darkness overlay
    this.darknessOverlay = config.darkness || 0;
    
    // Add layers based on config (with safety checks)
    const stars = config.stars || 0;
    const nebulae = config.nebulae || 0;
    const planets = config.planets || 0;
    const asteroids = config.asteroids || 0;
    
    if (stars > 0) {
      // Far stars
      this.layers.push(new BackgroundLayer('stars', 0.1, Math.max(1, Math.floor(stars * 0.4)), '#ffffff', 1));
      // Mid stars
      this.layers.push(new BackgroundLayer('stars', 0.3, Math.max(1, Math.floor(stars * 0.3)), '#ccccff', 1.5));
      // Close stars
      this.layers.push(new BackgroundLayer('stars', 0.6, Math.max(1, Math.floor(stars * 0.3)), '#ffffcc', 2));
    }
    
    if (nebulae > 0) {
      // Background nebulae
      this.layers.push(new BackgroundLayer('nebula', 0.05, Math.min(nebulae, 3), config.nebulaColor || null, null));
      // Mid nebulae if many
      if (nebulae > 3) {
        this.layers.push(new BackgroundLayer('nebula', 0.2, nebulae - 3, config.nebulaColor || null, null));
      }
    }
    
    if (planets > 0) {
      this.layers.push(new BackgroundLayer('planets', 0.15, Math.min(planets, 5), null, null));
    }
    
    if (asteroids > 0) {
      // Distant asteroids
      this.layers.push(new BackgroundLayer('asteroids', 0.2, Math.max(1, Math.floor(asteroids * 0.5)), '#666666', null));
      // Close asteroids
      this.layers.push(new BackgroundLayer('asteroids', 0.5, Math.max(1, Math.ceil(asteroids * 0.5)), '#888888', null));
    }
    
    // Always have at least one layer (fallback to stars)
    if (this.layers.length === 0) {
      console.warn('⚠️ Background config had no elements, adding default stars');
      this.layers.push(new BackgroundLayer('stars', 0.3, 50, '#ffffff', 1));
    }
    
    // Initialize all layers
    this.layers.forEach(layer => layer.initialize(canvasWidth, canvasHeight));
    this.initialized = true;
  }

  /**
   * Standard space preset
   */
  initializeSpacePreset() {
    // Far stars (slowest)
    this.layers.push(new BackgroundLayer('stars', 0.1, 50, '#ffffff', 1));
    
    // Mid stars
    this.layers.push(new BackgroundLayer('stars', 0.3, 30, '#ccccff', 1.5));
    
    // Close stars (fastest)
    this.layers.push(new BackgroundLayer('stars', 0.6, 20, '#ffffcc', 2));
    
    // Distant planets
    this.layers.push(new BackgroundLayer('planets', 0.15, 2, null, null));
  }

  /**
   * Nebula-heavy preset
   */
  initializeNebulaPreset() {
    // Background nebulae
    this.layers.push(new BackgroundLayer('nebula', 0.05, 3, null, null));
    
    // Far stars
    this.layers.push(new BackgroundLayer('stars', 0.1, 40, '#ffffff', 1));
    
    // Mid nebulae
    this.layers.push(new BackgroundLayer('nebula', 0.2, 2, null, null));
    
    // Close stars
    this.layers.push(new BackgroundLayer('stars', 0.4, 25, '#ffffcc', 2));
  }

  /**
   * Asteroid field preset
   */
  initializeAsteroidPreset() {
    // Far stars
    this.layers.push(new BackgroundLayer('stars', 0.1, 40, '#ffffff', 1));
    
    // Distant asteroids
    this.layers.push(new BackgroundLayer('asteroids', 0.2, 15, '#666666', null));
    
    // Mid asteroids
    this.layers.push(new BackgroundLayer('asteroids', 0.4, 10, '#888888', null));
    
    // Close asteroids
    this.layers.push(new BackgroundLayer('asteroids', 0.7, 5, '#aaaaaa', null));
  }

  /**
   * Deep space preset
   */
  initializeDeepSpacePreset() {
    // Very distant nebulae
    this.layers.push(new BackgroundLayer('nebula', 0.03, 4, null, null));
    
    // Far stars
    this.layers.push(new BackgroundLayer('stars', 0.08, 60, '#ffffff', 0.8));
    
    // Distant planets
    this.layers.push(new BackgroundLayer('planets', 0.1, 3, null, null));
    
    // Mid stars
    this.layers.push(new BackgroundLayer('stars', 0.2, 35, '#ccccff', 1.2));
    
    // Close stars
    this.layers.push(new BackgroundLayer('stars', 0.5, 20, '#ffffcc', 2));
  }

  /**
   * Update all layers
   */
  update(deltaTime = 1) {
    this.time += deltaTime;
    this.layers.forEach(layer => layer.update(this.scrollSpeed));
  }

  /**
   * Draw all layers
   */
  draw(ctx) {
    if (!this.initialized) return;
    
    // Draw background color if set
    if (this.backgroundColor) {
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    // Draw layers from back to front
    this.layers.forEach(layer => layer.draw(ctx, this.time));
    
    // Apply darkness overlay (REDUCED for better mobile visibility)
    if (this.darknessOverlay > 0) {
      // Cap darkness at 0.15 max (was 0.3) for better visibility
      const maxDarknessAlpha = 0.15;
      const darknessAlpha = Math.min(this.darknessOverlay * 0.15, maxDarknessAlpha);
      ctx.fillStyle = `rgba(0, 0, 0, ${darknessAlpha})`;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
  }

  /**
   * Change scroll speed (for slow-mo effects, etc.)
   */
  setScrollSpeed(speed) {
    this.scrollSpeed = speed;
  }

  /**
   * Change preset
   */
  changePreset(preset) {
    this.initialize(this.canvasWidth, this.canvasHeight, preset);
  }

  /**
   * Resize canvas
   */
  resize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.layers.forEach(layer => layer.initialize(width, height));
  }
}

export default ParallaxBackgroundSystem;

