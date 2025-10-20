/**
 * EnvironmentSystem - Manages environmental hazards and interactive elements
 */

export class EnvironmentSystem {
  constructor() {
    this.asteroids = [];
    this.blackHoles = [];
    this.meteors = [];
    this.debris = [];
    this.safeZones = [];
    this.wormholes = [];
    this.lastAsteroidSpawn = 0;
    this.lastMeteorShower = 0;
    this.lastBlackHoleSpawn = 0;
    this.meteorShowerActive = false;
  }

  /**
   * Update all environmental elements
   */
  update(deltaTime, game, canvas) {
    const now = Date.now();

    // Spawn asteroids periodically
    if (now - this.lastAsteroidSpawn > 8000) {
      this.spawnAsteroid(canvas);
      this.lastAsteroidSpawn = now;
    }

    // Meteor shower event
    if (now - this.lastMeteorShower > 30000 && !this.meteorShowerActive) {
      this.startMeteorShower(canvas);
      this.lastMeteorShower = now;
    }

    // Spawn black holes rarely
    if (now - this.lastBlackHoleSpawn > 45000 && this.blackHoles.length === 0) {
      this.spawnBlackHole(canvas);
      this.lastBlackHoleSpawn = now;
    }

    // Update asteroids
    this.updateAsteroids(deltaTime, game, canvas);

    // Update black holes
    this.updateBlackHoles(deltaTime, game, canvas);

    // Update meteors
    this.updateMeteors(deltaTime, game, canvas);

    // Update debris
    this.updateDebris(deltaTime, canvas);

    // Update safe zones
    this.updateSafeZones(deltaTime, canvas);

    // Update wormholes
    this.updateWormholes(deltaTime, game);
  }

  /**
   * Spawn asteroid
   */
  spawnAsteroid(canvas) {
    const size = 30 + Math.random() * 40;
    const speed = 1 + Math.random() * 2;
    const rotation = Math.random() * Math.PI * 2;
    const rotationSpeed = (Math.random() - 0.5) * 0.1;

    this.asteroids.push({
      x: Math.random() * (canvas.width - size),
      y: -size,
      width: size,
      height: size,
      speed: speed,
      rotation: rotation,
      rotationSpeed: rotationSpeed,
      health: Math.floor(size / 10),
      maxHealth: Math.floor(size / 10),
      vx: (Math.random() - 0.5) * 2
    });
  }

  /**
   * Update asteroids
   */
  updateAsteroids(deltaTime, game, canvas) {
    this.asteroids = this.asteroids.filter(asteroid => {
      asteroid.y += asteroid.speed;
      asteroid.x += asteroid.vx;
      asteroid.rotation += asteroid.rotationSpeed;

      // Bounce off walls
      if (asteroid.x <= 0 || asteroid.x >= canvas.width - asteroid.width) {
        asteroid.vx *= -1;
      }

      // Check collision with player
      if (this.checkCollision(asteroid, game.player)) {
        this.handlePlayerAsteroidCollision(game, asteroid);
      }

      // Check collision with bullets
      game.bullets = game.bullets.filter(bullet => {
        if (this.checkCollision(bullet, asteroid)) {
          asteroid.health -= bullet.damage || 10;
          
          // Create impact particles
          for (let i = 0; i < 3; i++) {
            game.particles.push({
              x: bullet.x,
              y: bullet.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 20,
              maxLife: 20,
              size: 3,
              color: '#888888'
            });
          }

          return false; // Remove bullet
        }
        return true;
      });

      // Destroy asteroid if health depleted
      if (asteroid.health <= 0) {
        this.destroyAsteroid(asteroid, game);
        return false;
      }

      // Remove if off screen
      return asteroid.y < canvas.height + asteroid.height;
    });
  }

  /**
   * Handle player-asteroid collision
   */
  handlePlayerAsteroidCollision(game, asteroid) {
    if (game.player.invincible || game.respawnInvincible > 0) return;

    game.player.health -= 15;
    
    // Create collision particles
    for (let i = 0; i < 8; i++) {
      game.particles.push({
        x: asteroid.x + asteroid.width / 2,
        y: asteroid.y + asteroid.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 25,
        maxLife: 25,
        size: 4,
        color: '#ff8800'
      });
    }

    // Screen shake
    game.screenShakeX = 5;
    game.screenShakeY = 5;
  }

  /**
   * Destroy asteroid
   */
  destroyAsteroid(asteroid, game) {
    // Explosion particles
    for (let i = 0; i < 15; i++) {
      game.particles.push({
        x: asteroid.x + asteroid.width / 2,
        y: asteroid.y + asteroid.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        maxLife: 30,
        size: 5,
        color: '#888888'
      });
    }

    // Spawn debris
    for (let i = 0; i < 3; i++) {
      this.spawnDebris(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
    }

    // Award points
    game.score += 50;
  }

  /**
   * Spawn black hole
   */
  spawnBlackHole(canvas) {
    this.blackHoles.push({
      x: canvas.width / 2,
      y: 100 + Math.random() * 200,
      radius: 40,
      pullRadius: 200,
      pullStrength: 0.5,
      life: 15000, // 15 seconds
      createdAt: Date.now()
    });
  }

  /**
   * Update black holes
   */
  updateBlackHoles(deltaTime, game, canvas) {
    const now = Date.now();

    this.blackHoles = this.blackHoles.filter(hole => {
      const age = now - hole.createdAt;

      // Pull player towards black hole
      if (game.player) {
        const dx = hole.x - (game.player.x + game.player.width / 2);
        const dy = hole.y - (game.player.y + game.player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < hole.pullRadius) {
          const pullFactor = (1 - distance / hole.pullRadius) * hole.pullStrength;
          game.player.x += (dx / distance) * pullFactor * 3;
          game.player.y += (dy / distance) * pullFactor * 3;

          // Damage if too close
          if (distance < hole.radius && !game.player.invincible && game.respawnInvincible <= 0) {
            game.player.health -= 0.5;
          }
        }
      }

      // Pull enemies
      game.enemies.forEach(enemy => {
        const dx = hole.x - (enemy.x + enemy.width / 2);
        const dy = hole.y - (enemy.y + enemy.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < hole.pullRadius) {
          const pullFactor = (1 - distance / hole.pullRadius) * hole.pullStrength;
          enemy.x += (dx / distance) * pullFactor * 2;
          enemy.y += (dy / distance) * pullFactor * 2;
        }
      });

      // Pull bullets
      game.bullets.forEach(bullet => {
        const dx = hole.x - bullet.x;
        const dy = hole.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < hole.pullRadius) {
          const pullFactor = (1 - distance / hole.pullRadius) * hole.pullStrength;
          bullet.x += (dx / distance) * pullFactor * 2;
          bullet.y += (dy / distance) * pullFactor * 2;
        }
      });

      return age < hole.life;
    });
  }

  /**
   * Start meteor shower
   */
  startMeteorShower(canvas) {
    this.meteorShowerActive = true;
    let count = 0;
    const maxMeteors = 15;

    const spawnMeteor = () => {
      if (count >= maxMeteors) {
        this.meteorShowerActive = false;
        return;
      }

      this.meteors.push({
        x: Math.random() * canvas.width,
        y: -30,
        width: 20,
        height: 20,
        vx: (Math.random() - 0.5) * 4,
        vy: 8 + Math.random() * 4,
        damage: 20,
        trail: []
      });

      count++;
      setTimeout(spawnMeteor, 300);
    };

    spawnMeteor();
  }

  /**
   * Update meteors
   */
  updateMeteors(deltaTime, game, canvas) {
    this.meteors = this.meteors.filter(meteor => {
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;

      // Add trail
      meteor.trail.push({ x: meteor.x, y: meteor.y, life: 10 });
      meteor.trail = meteor.trail.filter(t => t.life-- > 0);

      // Check collision with player
      if (this.checkCollision(meteor, game.player)) {
        if (!game.player.invincible && game.respawnInvincible <= 0) {
          game.player.health -= meteor.damage;
          
          // Create impact
          for (let i = 0; i < 10; i++) {
            game.particles.push({
              x: meteor.x,
              y: meteor.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              life: 25,
              maxLife: 25,
              size: 4,
              color: '#ff4400'
            });
          }
        }
        return false;
      }

      // Check collision with enemies
      game.enemies = game.enemies.filter(enemy => {
        if (this.checkCollision(meteor, enemy)) {
          game.score += 100;
          
          // Explosion
          for (let i = 0; i < 8; i++) {
            game.particles.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 20,
              maxLife: 20,
              size: 3,
              color: enemy.color
            });
          }
          
          return false;
        }
        return true;
      });

      return meteor.y < canvas.height + meteor.height;
    });
  }

  /**
   * Spawn debris
   */
  spawnDebris(x, y) {
    const size = 10 + Math.random() * 15;
    this.debris.push({
      x: x,
      y: y,
      width: size,
      height: size,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 2 + 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      resources: Math.floor(Math.random() * 3) + 1
    });
  }

  /**
   * Update debris
   */
  updateDebris(deltaTime, canvas) {
    this.debris = this.debris.filter(d => {
      d.y += d.vy;
      d.x += d.vx;
      d.rotation += d.rotationSpeed;

      return d.y < canvas.height + d.height;
    });
  }

  /**
   * Check collision between two objects
   */
  checkCollision(obj1, obj2) {
    if (!obj1 || !obj2) return false;
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  /**
   * Update safe zones
   */
  updateSafeZones(deltaTime, canvas) {
    // Implement safe zone logic if needed
  }

  /**
   * Update wormholes
   */
  updateWormholes(deltaTime, game) {
    // Implement wormhole logic if needed
  }

  /**
   * Render all environmental elements
   */
  render(ctx, canvas) {
    // Render asteroids
    this.asteroids.forEach(asteroid => {
      ctx.save();
      ctx.translate(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
      ctx.rotate(asteroid.rotation);

      // Asteroid body
      ctx.fillStyle = '#666666';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const radius = asteroid.width / 2 + (Math.random() * 5 - 2.5);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Health indicator
      if (asteroid.health < asteroid.maxHealth) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-asteroid.width / 2, -asteroid.height / 2 - 5, (asteroid.health / asteroid.maxHealth) * asteroid.width, 3);
      }

      ctx.restore();
    });

    // Render black holes
    this.blackHoles.forEach(hole => {
      ctx.save();

      // Accretion disk
      const gradient = ctx.createRadialGradient(hole.x, hole.y, 0, hole.x, hole.y, hole.radius * 2);
      gradient.addColorStop(0, 'rgba(100, 0, 200, 0)');
      gradient.addColorStop(0.5, 'rgba(100, 0, 200, 0.5)');
      gradient.addColorStop(1, 'rgba(100, 0, 200, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, hole.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Black hole center
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
      ctx.fill();

      // Event horizon
      ctx.strokeStyle = '#8800ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Pull radius indicator
      ctx.strokeStyle = 'rgba(136, 0, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, hole.pullRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    });

    // Render meteors
    this.meteors.forEach(meteor => {
      // Trail
      ctx.save();
      meteor.trail.forEach((t, i) => {
        const alpha = t.life / 10;
        ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(t.x + meteor.width / 2, t.y + meteor.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Meteor
      ctx.fillStyle = '#ff4400';
      ctx.beginPath();
      ctx.arc(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2, meteor.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      const gradient = ctx.createRadialGradient(
        meteor.x + meteor.width / 2, meteor.y + meteor.height / 2, 0,
        meteor.x + meteor.width / 2, meteor.y + meteor.height / 2, meteor.width
      );
      gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2, meteor.width, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render debris
    this.debris.forEach(d => {
      ctx.save();
      ctx.translate(d.x + d.width / 2, d.y + d.height / 2);
      ctx.rotate(d.rotation);

      ctx.fillStyle = '#999999';
      ctx.fillRect(-d.width / 2, -d.height / 2, d.width, d.height);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-d.width / 2, -d.height / 2, d.width, d.height);

      ctx.restore();
    });

    // Render meteor shower warning
    if (this.meteorShowerActive && Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ METEOR SHOWER! ⚠️', canvas.width / 2, 50);
      ctx.restore();
    }
  }

  /**
   * Reset system
   */
  reset() {
    this.asteroids = [];
    this.blackHoles = [];
    this.meteors = [];
    this.debris = [];
    this.safeZones = [];
    this.wormholes = [];
    this.lastAsteroidSpawn = 0;
    this.lastMeteorShower = 0;
    this.lastBlackHoleSpawn = 0;
    this.meteorShowerActive = false;
  }
}

export const environmentSystem = new EnvironmentSystem();

