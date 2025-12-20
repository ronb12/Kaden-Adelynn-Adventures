// Sound Effects Manager - Handles game sound effects
let soundVolume = 0.5
let soundEnabled = true

// Audio context for synthesized sounds
let audioContext = null

// Sound effect cache
const soundCache = new Map()

// Preloaded audio elements
const preloadedSounds = {}

// Sound file paths
const SOUND_FILES = {
  'laser-shoot': '/sfx/laser.mp3',
  'laser': '/sfx/laser.mp3',
  'explosion': '/sfx/explosion.mp3',
  'powerup': '/sfx/powerup.mp3',
  'hit': '/sfx/hit.mp3',
  'missile': '/sfx/missile.mp3',
  'shield': '/sfx/shield.mp3',
  'achievement': '/sfx/achievement.mp3',
  'bossSpawn': '/sfx/boss-spawn.mp3',
  'gameover': '/sfx/gameover.mp3',
  'levelUp': '/sfx/level-up.mp3',
  'coin': '/sfx/coin.mp3',
}

// Initialize audio context
const initAudio = () => {
  if (audioContext) return audioContext
  
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    return audioContext
  } catch (e) {
    console.warn('Web Audio API not supported')
    return null
  }
}

// Synthesize sounds when files aren't available
const synthesizeSound = (type, volume = 1) => {
  const ctx = initAudio()
  if (!ctx) return
  
  // Resume audio context if suspended
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  
  const now = ctx.currentTime
  const masterGain = ctx.createGain()
  masterGain.connect(ctx.destination)
  masterGain.gain.value = volume * soundVolume
  
  switch (type) {
    case 'laser-shoot':
    case 'laser': {
      // Pew pew laser sound
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(masterGain)
      osc.type = 'square'
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.1)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      osc.start(now)
      osc.stop(now + 0.1)
      break
    }
    
    case 'explosion': {
      // Noise-based explosion
      const bufferSize = ctx.sampleRate * 0.3
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 1000
      noise.connect(filter)
      filter.connect(masterGain)
      noise.start(now)
      break
    }
    
    case 'powerup': {
      // Ascending arpeggio
      const notes = [523, 659, 784, 1047]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(masterGain)
        osc.type = 'sine'
        osc.frequency.value = freq
        const start = now + i * 0.08
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(0.2, start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.15)
        osc.start(start)
        osc.stop(start + 0.15)
      })
      break
    }
    
    case 'hit': {
      // Short impact sound
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(masterGain)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(200, now)
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1)
      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      osc.start(now)
      osc.stop(now + 0.1)
      break
    }
    
    case 'missile': {
      // Whoosh sound
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(masterGain)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(100, now)
      osc.frequency.linearRampToValueAtTime(400, now + 0.2)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      osc.start(now)
      osc.stop(now + 0.3)
      break
    }
    
    case 'shield': {
      // Shield activation sound
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(masterGain)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(300, now)
      osc.frequency.linearRampToValueAtTime(600, now + 0.2)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      osc.start(now)
      osc.stop(now + 0.3)
      break
    }
    
    case 'achievement': {
      // Victory fanfare
      const notes = [523, 659, 784, 1047, 784, 1047]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(masterGain)
        osc.type = 'sine'
        osc.frequency.value = freq
        const start = now + i * 0.1
     