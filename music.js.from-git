// Music Manager - Handles background music playback with looping
let currentMusic = null
let musicVolume = 0.3
let currentTrack = null
let isInitialized = false

// Audio context for better control
let audioContext = null

// Track sources
const TRACKS = {
  gameplay: '/music/gameplay.mp3',
  boss: '/music/boss.mp3',
  menu: '/music/menu.mp3',
}

// Initialize audio context on first user interaction
const initAudio = () => {
  if (isInitialized) return true
  
  try {
    // Create audio context if needed
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    
    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    
    isInitialized = true
    return true
  } catch (e) {
    console.warn('Audio initialization failed:', e)
    return false
  }
}

// Create and configure audio element
const createAudioElement = (src) => {
  const audio = new Audio(src)
  audio.volume = musicVolume
  audio.loop = true // CRITICAL: Enable looping so music never stops
  audio.preload = 'auto'
  
  // Handle errors gracefully
  audio.onerror = () => {
    console.warn(`Failed to load music: ${src}`)
  }
  
  return audio
}

// Play a specific music track
const playTrack = (trackName) => {
  initAudio()
  
  const src = TRACKS[trackName]
  if (!src) {
    console.warn(`Unknown track: ${trackName}`)
    return
  }
  
  // Don't restart if already playing the same track
  if (currentTrack === trackName && currentMusic && !currentMusic.paused) {
    return
  }
  
  // Stop current music if playing
  if (currentMusic) {
    currentMusic.pause()
    currentMusic.currentTime = 0
    currentMusic = null
  }
  
  // Create new audio element
  currentMusic = createAudioElement(src)
  currentTrack = trackName
  
  // Add ended event listener as backup (even though loop is true)
  currentMusic.addEventListener('ended', () => {
    // Restart if loop somehow failed
    if (currentMusic) {
      currentMusic.currentTime = 0
      currentMusic.play().catch(() => {})
    }
  })
  
  // Play with promise handling for autoplay policy
  const playPromise = currentMusic.play()
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      // Autoplay was prevented, will try again on user interaction
      console.warn('Music autoplay prevented, waiting for user interaction')
    })
  }
}

// Public API

export const playGameplayMusic = () => {
  playTrack('gameplay')
}

export const playBossMusic = () => {
  playTrack('boss')
}

export const playMenuMusic = () => {
  playTrack('menu')
}

export const stopMusic = () => {
  if (currentMusic) {
    currentMusic.pause()
    currentMusic.currentTime = 0
    currentMusic = null
    currentTrack = null
  }
}

export const pauseMu