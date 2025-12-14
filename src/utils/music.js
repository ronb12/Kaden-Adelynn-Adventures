// Music Manager - Handles background music playback with looping
let currentMusic = null
let musicVolume = 0.3
let currentTrack = null
let isInitialized = false

// Audio context for better control - DO NOT CREATE AT MODULE LOAD
let audioContext = null
let hasUserGesture = false

// Track sources
const TRACKS = {
  gameplay: '/music/gameplay.mp3',
  boss: '/music/boss.mp3',
  menu: '/music/menu.mp3',
}

// Set flag on first user interaction
if (typeof window !== 'undefined') {
  const setUserGesture = () => {
    hasUserGesture = true
    // Try to create and resume audio context after gesture
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
      } catch (e) {
        // Silently fail, will retry next time
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {})
    }
  }
  
  const events = ['click', 'keydown', 'touchstart', 'touchend']
  events.forEach((event) => {
    window.addEventListener(event, setUserGesture, { once: true })
  })
}

// Initialize audio context lazily - only when actually needed
const initAudio = () => {
  if (isInitialized) return true
  
  // Don't create AudioContext without user gesture
  if (!hasUserGesture) {
    return false
  }
  
  try {
    // Create AudioContext if needed
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {})
    }
    
    isInitialized = true
    return true
  } catch (e) {
    return false
  }
}

// Create and configure audio element
const createAudioElement = (src) => {
  const audio = new Audio(src)
  audio.volume = musicVolume
  audio.loop = true // CRITICAL: Enable looping so music never stops
  audio.preload = 'auto'
  
  // Handle errors with logging for debugging
  audio.onerror = (e) => {
    console.error('Music loading error:', src, e)
  }
  
  // Log when music loads successfully
  audio.oncanplaythrough = () => {
    console.log('Music loaded successfully:', src)
  }
  
  // Add multiple event listeners to ensure looping
  audio.addEventListener('ended', () => {
    if (audio.loop) {
      audio.currentTime = 0
      audio.play().catch((err) => console.warn('Auto-restart failed:', err))
    }
  })
  
  // Monitor and restart if paused unexpectedly
  audio.addEventListener('pause', () => {
    if (currentMusic === audio && currentTrack) {
      setTimeout(() => {
        if (currentMusic === audio && audio.paused) {
          audio.play().catch((err) => console.warn('Unpause failed:', err))
        }
      }, 100)
    }
  })
  
  return audio
}

// Play a specific music track
const playTrack = (trackName) => {
  console.log('playTrack called:', trackName, 'hasUserGesture:', hasUserGesture)
  
  // Only attempt to create AudioContext after user gesture
  if (hasUserGesture && !audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('AudioContext created')
    } catch (e) {
      console.error('AudioContext creation failed:', e)
    }
  }
  
  // Try to initialize/resume audio context
  initAudio()
  
  const src = TRACKS[trackName]
  if (!src) {
    console.error('Track not found:', trackName)
    return
  }
  // Don't restart if already playing the same track
  if (currentTrack === trackName && currentMusic && !currentMusic.paused) {
    console.log('Track already playing:', trackName)
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
  
  console.log('Starting playback:', trackName)
  
  // Add ended event listener as backup (even though loop is true)
  currentMusic.addEventListener('ended', () => {
    // Restart if loop somehow failed
    if (currentMusic) {
      currentMusic.currentTime = 0
      currentMusic.play().catch((err) => console.warn('Loop restart failed:', err))
    }
  })
  
  // Play with promise handling for autoplay policy
  const playPromise = currentMusic.play()
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log('Music playing successfully:', trackName)
      })
      .catch((err) => {
        console.warn('Autoplay blocked for', trackName, '- waiting for user interaction:', err.message)
      })
  }
}

// Public API exports
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

export const pauseMusic = () => {
  if (currentMusic && !currentMusic.paused) {
    currentMusic.pause()
  }
}

export const resumeMusic = () => {
  if (currentMusic && currentMusic.paused) {
    currentMusic.play().catch(() => {})
  }
}

// Ensure music is playing (call this periodically to handle browser tab switching etc)
export const ensureMusicPlaying = () => {
  if (!currentMusic || !currentTrack) return
  
  // Resume audio context if suspended
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }
  
  // Check if music is paused or ended unexpectedly
  if (currentMusic.paused || currentMusic.ended) {
    // Reset to beginning if ended
    if (currentMusic.ended) {
      currentMusic.currentTime = 0
    }
    // Restart playback
    currentMusic.play().catch(() => {})
  }
}

export const setMusicVolume = (volume) => {
  musicVolume = Math.max(0, Math.min(1, volume))
  if (currentMusic) {
    currentMusic.volume = musicVolume
  }
}

export const getMusicVolume = () => musicVolume

export const isMusicPlaying = () => {
  return currentMusic && !currentMusic.paused && !currentMusic.ended
}

// Fade out music over duration (ms)
export const fadeOutMusic = (duration = 1000) => {
  if (!currentMusic) return Promise.resolve()
  
  return new Promise((resolve) => {
    const startVolume = currentMusic.volume
    const startTime = Date.now()
    
    const fade = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      if (currentMusic) {
        currentMusic.volume = startVolume * (1 - progress)
        
        if (progress < 1) {
          requestAnimationFrame(fade)
        } else {
          stopMusic()
          resolve()
        }
      } else {
        resolve()
      }
    }
    
    fade()
  })
}

// Crossfade to a new track
export const crossfadeTo = (trackName, duration = 500) => {
  if (currentTrack === trackName) return
  
  const oldMusic = currentMusic
  const oldVolume = musicVolume
  
  // Start new track at zero volume
  currentMusic = null
  currentTrack = null
  playTrack(trackName)
  
  if (currentMusic) {
    currentMusic.volume = 0
  }
  
  const startTime = Date.now()
  
  const fade = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Fade out old
    if (oldMusic) {
      oldMusic.volume = oldVolume * (1 - progress)
      if (progress >= 1) {
        oldMusic.pause()
      }
    }
    
    // Fade in new
    if (currentMusic) {
      currentMusic.volume = musicVolume * progress
    }
    
    if (progress < 1) {
      requestAnimationFrame(fade)
    }
  }
  
  fade()
}
