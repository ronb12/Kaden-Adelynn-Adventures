let current = null
let volume = 0.3

const tracks = {
  menu: '/music/menu.mp3',       // place a CC0 menu track here
  gameplay: '/music/gameplay.mp3', // place a CC0 gameplay track here
  boss: '/music/boss.mp3'        // place a CC0 boss track here
}

function play(src) {
  try {
    if (current) {
      current.pause()
      current = null
    }
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = volume
    audio.play().catch(() => {})
    current = audio
  } catch (_) {
    // noop
  }
}

export function playMenuMusic() { play(tracks.menu) }
export function playGameplayMusic() { play(tracks.gameplay) }
export function playBossMusic() { play(tracks.boss) }
export function stopMusic() { if (current) { current.pause(); current = null } }
export function setMusicVolume(v) { volume = Math.max(0, Math.min(1, v)); if (current) current.volume = volume }
