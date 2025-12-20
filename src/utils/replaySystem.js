// Replay system for recording and playback of game sessions

const REPLAY_KEY_PREFIX = 'gameReplay_'
const MAX_REPLAYS = 10

// Record game state at regular intervals
export class ReplayRecorder {
  constructor() {
    this.frames = []
    this.startTime = null
    this.isRecording = false
    this.frameInterval = 2 // Record every 2 frames (30fps recording from 60fps game)
    this.frameCount = 0
  }
  
  start(gameState) {
    this.frames = []
    this.startTime = Date.now()
    this.isRecording = true
    this.frameCount = 0
    
    // Record initial state
    this.recordFrame(gameState, true)
  }
  
  recordFrame(gameState, isInitial = false) {
    if (!this.isRecording) return
    
    this.frameCount++
    if (!isInitial && this.frameCount % this.frameInterval !== 0) {
      return // Skip frames based on interval
    }
    
    const frame = {
      time: Date.now() - this.startTime,
      frame: this.frameCount,
      player: {
        x: gameState.player.x,
        y: gameState.player.y,
        health: gameState.player.health,
      },
      score: gameState.currentScore,
      wave: gameState.wave,
      kills: gameState.currentKills,
      weapon: gameState.currentWeapon,
      // Record key events
      enemies: gameState.enemies.map(e => ({
        type: e.type,
        x: e.x,
        y: e.y,
        health: e.health,
      })),
      bullets: gameState.bullets.map(b => ({
        x: b.x,
        y: b.y,
        vx: b.vx,
        vy: b.vy,
      })),
      boss: gameState.boss ? {
        type: gameState.boss.type,
        x: gameState.boss.x,
        y: gameState.boss.y,
        health: gameState.boss.health,
      } : null,
    }
    
    this.frames.push(frame)
  }
  
  stop() {
    this.isRecording = false
    return this.getReplay()
  }
  
  getReplay() {
    if (this.frames.length === 0) return null
    
    return {
      id: `replay_${Date.now()}`,
      timestamp: this.startTime,
      duration: Date.now() - this.startTime,
      frames: this.frames,
      metadata: {
        finalScore: this.frames[this.frames.length - 1]?.score || 0,
        finalWave: this.frames[this.frames.length - 1]?.wave || 1,
        finalKills: this.frames[this.frames.length - 1]?.kills || 0,
        frameCount: this.frames.length,
      },
    }
  }
  
  saveReplay(replay) {
    try {
      const replays = getSavedReplays()
      
      // Add new replay
      replays.push(replay)
      
      // Sort by timestamp (newest first)
      replays.sort((a, b) => b.timestamp - a.timestamp)
      
      // Keep only max replays
      const toKeep = replays.slice(0, MAX_REPLAYS)
      
      // Save each replay
      toKeep.forEach((r, index) => {
        localStorage.setItem(`${REPLAY_KEY_PREFIX}${index}`, JSON.stringify(r))
      })
      
      // Remove old replays
      for (let i = MAX_REPLAYS; i < replays.length; i++) {
        localStorage.removeItem(`${REPLAY_KEY_PREFIX}${i}`)
      }
      
      return true
    } catch (error) {
      console.error('Failed to save replay:', error)
      return false
    }
  }
}

export function getSavedReplays() {
  const replays = []
  
  for (let i = 0; i < MAX_REPLAYS; i++) {
    try {
      const saved = localStorage.getItem(`${REPLAY_KEY_PREFIX}${i}`)
      if (saved) {
        replays.push(JSON.parse(saved))
      }
    } catch {
      // Skip corrupted replays
    }
  }
  
  return replays.sort((a, b) => b.timestamp - a.timestamp)
}

export function getReplay(id) {
  const replays = getSavedReplays()
  return replays.find(r => r.id === id) || null
}

export function deleteReplay(id) {
  try {
    const replays = getSavedReplays()
    const filtered = replays.filter(r => r.id !== id)
    
    // Resave all replays
    filtered.forEach((r, index) => {
      localStorage.setItem(`${REPLAY_KEY_PREFIX}${index}`, JSON.stringify(r))
    })
    
    // Remove extra slot if needed
    if (filtered.length < MAX_REPLAYS) {
      localStorage.removeItem(`${REPLAY_KEY_PREFIX}${filtered.length}`)
    }
    
    return true
  } catch {
    return false
  }
}

// Replay player for playback
export class ReplayPlayer {
  constructor(replay, onFrame) {
    this.replay = replay
    this.onFrame = onFrame
    this.currentFrameIndex = 0
    this.isPlaying = false
    this.playbackSpeed = 1.0
    this.lastFrameTime = null
  }
  
  play(speed = 1.0) {
    this.playbackSpeed = speed
    this.isPlaying = true
    this.currentFrameIndex = 0
    this.lastFrameTime = Date.now()
    this.playFrame()
  }
  
  playFrame() {
    if (!this.isPlaying || this.currentFrameIndex >= this.replay.frames.length) {
      this.stop()
      return
    }
    
    const frame = this.replay.frames[this.currentFrameIndex]
    this.onFrame(frame)
    
    this.currentFrameIndex++
    
    if (this.currentFrameIndex < this.replay.frames.length) {
      const nextFrame = this.replay.frames[this.currentFrameIndex]
      const delay = (nextFrame.time - frame.time) / this.playbackSpeed
      
      setTimeout(() => {
        if (this.isPlaying) {
          this.playFrame()
        }
      }, Math.max(16, delay)) // Minimum 16ms (60fps)
    } else {
      this.stop()
    }
  }
  
  pause() {
    this.isPlaying = false
  }
  
  stop() {
    this.isPlaying = false
    this.currentFrameIndex = 0
  }
  
  seek(frameIndex) {
    this.currentFrameIndex = Math.max(0, Math.min(frameIndex, this.replay.frames.length - 1))
    if (this.replay.frames[this.currentFrameIndex]) {
      this.onFrame(this.replay.frames[this.currentFrameIndex])
    }
  }
  
  getProgress() {
    return this.replay.frames.length > 0
      ? this.currentFrameIndex / this.replay.frames.length
      : 0
  }
}
