let current = null
let currentTrack = null
let volume = 0.3

const tracks = {
  menu: '/music/menu.mp3', // place a CC0 menu track here
  gameplay: '/music/gameplay.mp3', // place a CC0 gameplay track here
  boss: '/music/boss.mp3', // place a CC0 boss track here
}

function play(src) {
  try {
    if (current) {
      current.pause()
      current.removeEventListener('ended', handleMusicEnd)
      current.removeEventListener('error', handleMusicError)
      current = null
    }
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = volume
    currentTrack = src
    
    // Add event listeners to ensure continuous playback
    audio.addEventListener('ended', handleMusicEnd)
    audio.addEventListener('error', handleMusicError)
    audio.addEventListener('pause', handleMusicPause)
    
    // Try to play and handle autoplay restrictions
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Music started successfully
          current = audio
        })
        .catch((error) => {
          // Autoplay was prevented - user interaction required
          console.log('Music autoplay prevented, will start on user interaction')
          // Store the audio for later play
          current = audio
        })
    } else {
      current = audio
    }
  } catch (error) {
    console.warn('Error playing music:', error)
  }
}

function handleMusicEnd() {
  // If music ends (shouldn't happen with loop=true, but just in case)
  if (current && currentTrack) {
    current.currentTime = 0
    current.play().catch(() => {})
  }
}

function handleMusicError(e) {
  console.warn('Music playback error, attempting to restart:', e)
  // Try to restart the same track
  if (currentTrack) {
    setTimeout(() => {
      play(currentTrack)
    }, 1000)
  }
}

function handleMusicPause() {
  // If music gets paused unexpectedly, try to resume
  if (current && current.paused && currentTrack) {
    // Only auto-resume if it wasn't intentionally paused
    setTimeout(() => {
      if (current && current.paused && currentTrack) {
        current.play().catch(() => {})
      }
    }, 100)
  }
}

export function playMenuMusic() {
  play(tracks.menu)
}
export function playGameplayMusic() {
  play(tracks.gameplay)
}
export function playBossMusic() {
  play(tracks.boss)
}
export function stopMusic() {
  if (current) {
    current.pause()
    current = null
  }
}
export function setMusicVolume(v) {
  volume = Math.max(0, Math.min(1, v))
  if (current) current.volume = volume
}

export function ensureMusicPlaying() {
  // Check if music should be playing but isn't
  if (current && currentTrack && current.paused) {
    current.play().catch(() => {})
  }
}

export function isMusicPlaying() {
  return current && !current.paused && !current.ended
}
