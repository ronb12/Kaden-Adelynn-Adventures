// Sound effects manager
export const sounds = {
  shoot: { name: 'laser-shoot', volume: 0.3 },
  hit: { name: 'explosion', volume: 0.5 },
  'laser-shoot': { name: 'laser-shoot', volume: 0.2 },
  explosion: { name: 'explosion', volume: 0.5 },
  'powerup-pickup': { name: 'powerup-pickup', volume: 0.4 },
  'enemy-destroy': { name: 'enemy-destroy', volume: 0.4 },
  'boss-scream': { name: 'boss-scream', volume: 0.6 },
  'game-over': { name: 'game-over', volume: 0.5 },
  'level-complete': { name: 'level-complete', volume: 0.6 },
  achievement: { name: 'achievement', volume: 0.5 },
  'missile-launch': { name: 'missile-launch', volume: 0.4 },
  'shield-up': { name: 'shield-up', volume: 0.4 },
  powerup: { name: 'powerup-pickup', volume: 0.4 },
  enemyDestroy: { name: 'enemy-destroy', volume: 0.4 },
  bossSpawn: { name: 'boss-scream', volume: 0.6 },
  gameOver: { name: 'game-over', volume: 0.5 },
  levelComplete: { name: 'level-complete', volume: 0.6 },
  missile: { name: 'missile-launch', volume: 0.4 },
  shield: { name: 'shield-up', volume: 0.4 },
}

// Prefer OGG then MP3
const audioCache = {}
const soundFiles = {
  'laser-shoot': ['/sfx/laser.ogg', '/sfx/laser.mp3'],
  'missile-launch': ['/sfx/missile.ogg', '/sfx/missile.mp3'],
  explosion: ['/sfx/explosion.ogg', '/sfx/explosion.mp3'],
  'powerup-pickup': ['/sfx/powerup.ogg', '/sfx/powerup.mp3'],
  'enemy-destroy': ['/sfx/explosion.ogg', '/sfx/explosion.mp3'],
  'boss-scream': ['/sfx/boss.ogg', '/sfx/boss.mp3'],
  'game-over': ['/sfx/gameover.ogg', '/sfx/gameover.mp3'],
  'level-complete': ['/sfx/level-complete.ogg', '/sfx/level-complete.mp3'],
  achievement: ['/sfx/achievement.ogg', '/sfx/achievement.mp3'],
  'shield-up': ['/sfx/shield.ogg', '/sfx/shield.mp3'],
}

export const playSound = (soundName, volume = 0.5) => {
  try {
    const sources = soundFiles[soundName] || soundFiles[sounds[soundName]?.name]
    const file = Array.isArray(sources) ? sources.find(Boolean) : sources
    if (file) {
      if (!audioCache[file]) {
        const a = new Audio(file)
        a.preload = 'auto'
        audioCache[file] = a
      }
      const audio = audioCache[file].cloneNode()
      // mix adjustments
      if (soundName.includes('missile') || soundName.includes('explosion')) volume = Math.min(volume, 0.4)
      if (soundName.includes('laser') || soundName.includes('shoot')) volume = Math.min(volume, 0.3)
      if (soundName.includes('boss')) volume = Math.min(volume, 0.5)
      audio.volume = volume
      audio.play().catch(() => {})
      return
    }
  } catch {}
  // Fallback beep if assets unavailable
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const audioContext = Ctx ? new Ctx() : null
    if (!audioContext) return
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    gainNode.gain.value = volume
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = soundName.includes('explosion') ? 150 : 440
    oscillator.type = soundName.includes('explosion') ? 'sawtooth' : 'square'
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.1)
  } catch {}
}
