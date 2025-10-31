// Sound effects manager
export const sounds = {
  shoot: { name: 'laser-shoot', volume: 0.3 },
  hit: { name: 'explosion', volume: 0.5 },
  'laser-shoot': { name: 'laser-shoot', volume: 0.2 },
  'explosion': { name: 'explosion', volume: 0.5 },
  'powerup-pickup': { name: 'powerup-pickup', volume: 0.4 },
  'enemy-destroy': { name: 'enemy-destroy', volume: 0.4 },
  'boss-scream': { name: 'boss-scream', volume: 0.6 },
  'game-over': { name: 'game-over', volume: 0.5 },
  'level-complete': { name: 'level-complete', volume: 0.6 },
  'achievement': { name: 'achievement', volume: 0.5 },
  'missile-launch': { name: 'missile-launch', volume: 0.4 },
  'shield-up': { name: 'shield-up', volume: 0.4 },
  powerup: { name: 'powerup-pickup', volume: 0.4 },
  enemyDestroy: { name: 'enemy-destroy', volume: 0.4 },
  bossSpawn: { name: 'boss-scream', volume: 0.6 },
  gameOver: { name: 'game-over', volume: 0.5 },
  levelComplete: { name: 'level-complete', volume: 0.6 },
  achievement: { name: 'achievement', volume: 0.5 },
  missile: { name: 'missile-launch', volume: 0.4 },
  shield: { name: 'shield-up', volume: 0.4 }
}

export const playSound = (soundName, volume = 0.5) => {
  // Lightweight mix adjustments
  if (soundName.includes('missile') || soundName.includes('explosion')) volume = Math.min(volume, 0.4)
  if (soundName.includes('laser') || soundName.includes('shoot')) volume = Math.min(volume, 0.3)
  if (soundName.includes('boss')) volume = Math.min(volume, 0.5)
  // Web Audio API implementation
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  gainNode.gain.value = volume
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  // Simple tone generation for different sounds
  switch(soundName) {
    case 'laser-shoot':
      oscillator.frequency.value = 440
      oscillator.type = 'square'
      break
    case 'explosion':
      oscillator.frequency.value = 150
      oscillator.type = 'sawtooth'
      break
    case 'powerup-pickup':
      oscillator.frequency.value = 523.25
      oscillator.type = 'sine'
      break
    case 'hit':
      oscillator.frequency.value = 200
      oscillator.type = 'sawtooth'
      break
    default:
      oscillator.frequency.value = 330
  }
  
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.1)
}

