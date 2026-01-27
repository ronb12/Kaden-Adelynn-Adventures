// Music Manager - Handles background music playback with looping
let currentMusic = null
let musicVolume = 0.3
let currentTrack = null
let pendingTrack = null // Track waiting for user gesture
let isInitialized = false

// Audio context for better control - DO NOT CREATE AT MODULE LOAD
let audioContext = null
let hasUserGesture = false

// Track sources (root-level paths; /music/* can 404 behind SPA rewrites)
const TRACKS = {
  gameplay: '/gameplay.mp3',
  boss: '/boss.mp3',
  menu: '/menu.mp3',
}

// Set flag on first user interaction
if (typeof window !== 'undefined') {
  const setUserGesture = () => {
    const wasBlocked = !hasUserGesture
    hasUserGesture = true
    
    // Try to create and resume audio context after gesture
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        console.log('AudioContext created on user gesture')
      } catch (e) {
        console.error('AudioContext creation failed:', e)
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {})
    }
    
    // If there's a pending track, play it now
    if (wasBlocked && pendingTrack) {
      console.log('Playing pending track after user gesture:', pendingTrack)
      const track = pendingTrack
      pendingTrack = null
      playTrack(track)
    }
    // If music was blocked before, retry playing it now
    else if (wasBlocked && currentMusic && currentMusic.paused) {
      console.log('Retrying music playback after user gesture')
      currentMusic.play().catch((err) => console.warn('Retry failed:', err))
    }
  }
  
  const events = ['click', 'keydown', 'touchstart', 'touchend']
  events.forEach((event) => {
    window.addEventListener(event, setUserGesture, { once: true })
  })
}

// Explicitly expose a way to mark a user gesture from app code
// Useful when menu wants to unlock audio immediately on first tap.
export const forceUserGesture = () => {
  const wasBlocked = !hasUserGesture
  hasUserGesture = true

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('AudioContext created via forceUserGesture')
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {})
    }
  } catch (e) {
    console.error('AudioContext creation failed in forceUserGesture:', e)
  }

  if (wasBlocked && pendingTrack) {
    const track = pendingTrack
    pendingTrack = null
    console.log('forceUserGesture: playing pending track:', track)
    playTrack(track)
  }
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

// Single reused Audio element (avoids WebMediaPlayer limit crbug.com/1144736)
let musicAudioEl = null

const getMusicAudio = () => {
  if (musicAudioEl) return musicAudioEl
  musicAudioEl = new Audio()
  musicAudioEl.loop = true
  musicAudioEl.preload = 'auto'
  musicAudioEl.onerror = (e) => {
    console.error('Music loading error:', musicAudioEl?.src, e)
  }
  musicAudioEl.oncanplaythrough = () => {
    console.log('Music loaded successfully:', musicAudioEl?.src)
  }
  musicAudioEl.addEventListener('ended', () => {
    if (musicAudioEl?.loop) {
      musicAudioEl.currentTime = 0
      musicAudioEl.play().catch(() => {})
    }
  })
  musicAudioEl.addEventListener('pause', () => {
    if (currentMusic === musicAudioEl && currentTrack) {
      setTimeout(() => {
        if (currentMusic === musicAudioEl && musicAudioEl.paused) {
          musicAudioEl.play().catch(() => {})
        }
      }, 100)
    }
  })
  return musicAudioEl
}

// Play a specific music track
const playTrack = (trackName) => {
  console.log('playTrack called:', trackName, 'hasUserGesture:', hasUserGesture)
  
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
  
  // If no user gesture yet, store the pending track and return
  if (!hasUserGesture) {
    console.log('No user gesture yet - storing pending track:', trackName)
    pendingTrack = trackName
    return
  }
  
  // Reuse single Audio element; switch src when changing track
  const audio = getMusicAudio()
  audio.pause()
  audio.currentTime = 0
  audio.volume = musicVolume
  audio.src = src
  currentMusic = audio
  currentTrack = trackName
  pendingTrack = null

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      console.error('AudioContext creation failed:', e)
    }
  }
  initAudio()

  console.log('Starting playback:', trackName)

  const playPromise = currentMusic.play()
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log('Music playing successfully:', trackName)
      })
      .catch((err) => {
        // Ignore benign rejections caused by rapid track transitions (e.g., menu -> gameplay)
        const interruptedByTransition = currentTrack !== trackName || (currentMusic && currentMusic.paused)
        if (interruptedByTransition) return
        console.warn('Playback failed:', trackName, err.message)
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

// Stop menu music specifically without interrupting gameplay/boss transitions
export const stopMenuMusic = () => {
  if (currentMusic && currentTrack === 'menu') {
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
