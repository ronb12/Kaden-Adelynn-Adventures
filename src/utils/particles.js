// Particle effects system
export class ParticleSystem {
  static createExplosion(x, y, color = '#ff6b6b', count = 20) {
    const particles = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        maxLife: 30,
        color,
        size: Math.random() * 3 + 2
      })
    }
    return particles
  }

  static createTrail(x, y, color = '#4ecdc4') {
    return {
      x,
      y,
      life: 15,
      maxLife: 15,
      color,
      size: 3
    }
  }

  static createStar(x, y) {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 60,
      maxLife: 60,
      color: '#fff',
      size: Math.random() * 2
    }
  }

  static createPowerUpGlow(x, y, color = '#ffd700') {
    const particles = []
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: x + Math.cos(i * Math.PI / 4) * 15,
        y: y + Math.sin(i * Math.PI / 4) * 15,
        vx: 0,
        vy: 0,
        life: 20,
        maxLife: 20,
        color,
        size: 2
      })
    }
    return particles
  }
}

