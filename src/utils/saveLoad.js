// Save/Load system for game state
// Supports multiple save slots and checkpoint saves

const SAVE_SLOTS_KEY = 'gameSaveSlots'
const MAX_SAVE_SLOTS = 5

export function getSaveSlots() {
  try {
    const saved = localStorage.getItem(SAVE_SLOTS_KEY)
    if (!saved) return {}
    return JSON.parse(saved)
  } catch {
    return {}
  }
}

export function saveGame(slot, gameState) {
  try {
    const slots = getSaveSlots()
    
    // Prepare save data (exclude functions and refs)
    const saveData = {
      timestamp: Date.now(),
      slot: slot,
      player: {
        x: gameState.player.x,
        y: gameState.player.y,
        health: gameState.player.health || 100,
        lives: gameState.player.lives || 25,
      },
      score: gameState.currentScore || 0,
      wave: gameState.wave || 1,
      level: gameState.level || 1,
      kills: gameState.currentKills || 0,
      combo: gameState.streakCombo || 0,
      weapon: gameState.currentWeapon || 'laser',
      coins: gameState.coins || 0,
      difficulty: gameState.difficulty || 'medium',
      ship: gameState.selectedShip || 'kaden',
      character: gameState.selectedCharacter || 'kaden',
      playerName: gameState.playerName || 'Player',
      // Power-up states
      rapidFire: gameState.rapidFire || false,
      rapidFireTimer: gameState.rapidFireTimer || 0,
      shield: gameState.shield || false,
      shieldTimer: gameState.shieldTimer || 0,
      slowMotion: gameState.slowMotion || false,
      slowMotionTimer: gameState.slowMotionTimer || 0,
      speedBoostTimer: gameState.speedBoostTimer || 0,
      coinDoubler: gameState.coinDoubler || false,
      coinDoublerTimer: gameState.coinDoublerTimer || 0,
      // Game mode
      gameMode: gameState.gameMode || 'classic',
      isBossFight: gameState.isBossFight || false,
      boss: gameState.boss ? {
        type: gameState.boss.type,
        health: gameState.boss.health,
        maxHealth: gameState.boss.maxHealth,
        x: gameState.boss.x,
        y: gameState.boss.y,
      } : null,
      // Statistics snapshot
      shotsFired: gameState.shotsFired || 0,
      shotsHit: gameState.shotsHit || 0,
      enemiesSpawned: gameState.enemiesSpawned || 0,
    }
    
    slots[slot] = saveData
    
    // Limit to max slots
    const slotKeys = Object.keys(slots).sort((a, b) => slots[b].timestamp - slots[a].timestamp)
    if (slotKeys.length > MAX_SAVE_SLOTS) {
      for (let i = MAX_SAVE_SLOTS; i < slotKeys.length; i++) {
        delete slots[slotKeys[i]]
      }
    }
    
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots))
    return true
  } catch (error) {
    console.error('Save failed:', error)
    return false
  }
}

export function loadGame(slot) {
  try {
    const slots = getSaveSlots()
    const saveData = slots[slot]
    if (!saveData) return null
    
    return saveData
  } catch (error) {
    console.error('Load failed:', error)
    return null
  }
}

export function deleteSave(slot) {
  try {
    const slots = getSaveSlots()
    delete slots[slot]
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots))
    return true
  } catch {
    return false
  }
}

export function getAllSaves() {
  return getSaveSlots()
}

export function getSaveSlotInfo(slot) {
  const saveData = loadGame(slot)
  if (!saveData) return null
  
  return {
    slot,
    timestamp: saveData.timestamp,
    date: new Date(saveData.timestamp).toLocaleString(),
    score: saveData.score,
    wave: saveData.wave,
    level: saveData.level,
    kills: saveData.kills,
    weapon: saveData.weapon,
    difficulty: saveData.difficulty,
    playerName: saveData.playerName,
  }
}

export function getAvailableSlots() {
  const slots = getSaveSlots()
  const available = []
  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    const slotKey = `slot${i}`
    if (slots[slotKey]) {
      available.push(getSaveSlotInfo(slotKey))
    } else {
      available.push({ slot: slotKey, empty: true })
    }
  }
  return available
}

// Auto-save checkpoint system
const CHECKPOINT_KEY = 'gameCheckpoint'

export function saveCheckpoint(gameState) {
  try {
    const checkpoint = {
      timestamp: Date.now(),
      score: gameState.currentScore || 0,
      wave: gameState.wave || 1,
      level: gameState.level || 1,
      kills: gameState.currentKills || 0,
      health: gameState.player?.health || 100,
      lives: gameState.player?.lives || 25,
      weapon: gameState.currentWeapon || 'laser',
    }
    sessionStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoint))
    return true
  } catch {
    return false
  }
}

export function loadCheckpoint() {
  try {
    const saved = sessionStorage.getItem(CHECKPOINT_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function clearCheckpoint() {
  try {
    sessionStorage.removeItem(CHECKPOINT_KEY)
    return true
  } catch {
    return false
  }
}
