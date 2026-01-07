// Firebase Data Operations for PWA Features
// Handles all Firestore read/write operations with fallback to localStorage

const COLLECTIONS = {
  STATISTICS: 'userStatistics',
  SAVES: 'gameSaves',
  UPGRADES: 'weaponUpgrades',
  CUSTOMIZATION: 'customization'
}

// Check if Firebase is available
export function isFirebaseAvailable() {
  return typeof window !== 'undefined' && 
         window.firebase && 
         window.firebase.apps && 
         window.firebase.apps.length > 0
}

// Get user ID (using device fingerprint or generated ID)
function getUserId() {
  let userId = localStorage.getItem('userId')
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now()
    localStorage.setItem('userId', userId)
  }
  return userId
}

// ===== STATISTICS =====
export async function saveStatistics(stats) {
  const userId = getUserId()
  
  if (isFirebaseAvailable()) {
    try {
      const db = window.firebase.firestore()
      await db.collection(COLLECTIONS.STATISTICS).doc(userId).set(stats, { merge: true })
      console.log('Statistics saved to Firebase')
      return true
    } catch (error) {
      console.warn('Firebase save failed, using localStorage:', error)
      localStorage.setItem('gameStatistics', JSON.stringify(stats))
      return false
    }
  } else {
    localStorage.setItem('gameStatistics', JSON.stringify(stats))
    return false
  }
}

export async function loadStatistics() {
  const userId = getUserId()
  
  if (isFirebaseAvailable()) {
    try {
      const db = window.firebase.firestore()
      const doc = await db.collection(COLLECTIONS.STATISTICS).doc(userId).get()
      
      if (doc.exists) {
        console.log('Statistics loaded from Firebase')
        return doc.data()
      }
    } catch (error) {
      console.warn('Firebase load failed, using localStorage:', error)
    }
  }
  
  // Fallback to localStorage
  const localData = localStorage.getItem('gameStatistics')
  return localData ? JSON.parse(localData) : {
    gamesPlayed: 0,
    totalScore: 0,
    totalKills: 0,
    highestWave: 0,
    totalPlayTime: 0,
    totalShots: 0,
    totalHits: 0,
    weaponUsage: {}
  }
}

// ===== SAVE SLOTS =====
export async function saveSaveSlot(slotId, saveData) {
  const userId = getUserId()
  
  if (isFirebaseAvailable()) {
    try {
      const db = window.firebase.firestore()
      await db.collection(COLLECTIONS.SAVES).doc(`${userId}_${slotId}`).set({
        ...saveData,
        userId,
        slotId,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      })
      console.log(`Save slot ${slotId} saved to Firebase`)
      return true
    } catch (error) {
      console.warn('Firebase save failed, using localStorage:', error)
      localStorage.setItem(`save-slot-${slotId}`, JSON.stringify(saveData))
      return false
    }
  } else {
    localStorage.setItem(`save-slot-${slotId}`, JSON.stringify(saveData))
    return false
  }
}

export async function loadAllSaves() {
  const userId = getUserId()
  const saves = []
  
  if (isFirebaseAvailable()) {
    try {
      const db = window.firebase.firestore()
      const snapshot = await db.collection(COLLECTIONS.SAVES)
        .where('userId', '==', userId)
        .get()
      
      snapshot.forEach(doc => {
        const data = doc.data()
        saves.push({
          ...data,
          slotId: data.slotId || doc.id.split('_')[1]
        })
      })
      
      if (saves.length > 0) {
        console.log('Saves loaded from Firebase')
        return saves
      }
    } catch (error) {
      console.warn('Firebase load failed, using localStorage:', error)
    }
  }
  
  // Fallback to localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('save-slot-')) {
      const slotId = key.replace('save-slot-', '')
      const data = JSON.parse(localStorage.getItem(key))
      saves.push({ ...data, slotId })
    }
  }
  
  return saves
}

export async function loadSaveSlot(slotId) {
  const userId = getUserId()
  
  if (isFirebaseAvailable()) {
    try {
      const db = window.firebase.firestore()
      const doc = await db.collection(COLLECTIONS.SAVES).doc(`${userId}_${slotId}`).get()
      
      if (doc.exists) {
        console.log(`Save slot ${slotId} loaded from Firebase`)
        return doc.data()
      }
    } catch (error) {
      console.warn('Firebase load failed, using localStorage:', error)
    }
  }
  
  // Fallback to localStorage
  const localData = localStorage.getItem(`save-slot-${slotId}`)
  return localData ? JSON.parse(localData) : null
}

export async function deleteSaveSlot(slotId) {
  const userId = getUserId()
  
  if (isFirebaseAvailable()) {
    try {
      const db = window.firebase.firestore()
      await db.collection(COLLECTIONS.SAVES).doc(`${userId}_${slotId}`).delete()
      console.log(`Save slot ${slotId} deleted from Firebase`)
      return true
    } catch (error) {
      console.warn('Firebase delete failed, using localStorage:', error)
      localStorage.removeItem(`save-slot-${slotId}`)
      return false
    }
  } else {
    localStorage.removeItem(`save-slot-${slotId}`)
    return false
  }
}

// ===== WEAPON UPGRADES =====
export async function saveUpgrades(upgrades) {
  const userId = getUserId()
  
  if (isFirebaseAvailable()) {
    try {
      const db = window.firebase.firestore()
      await db.collection(COLLECTIONS.UPGRADES).doc(userId).set(upgrades, { merge: true })
      console.log('Upgrades saved to Firebase')
      return true
    } catch (error) {
      console.warn('Firebase save failed, using localStorage:', error)
      localStorage.setItem('weaponUpgrades', JSON.stringify(upgrades))
      return false
    }
  } else {
    localStorage.setItem('weaponUpgrades', JSON.stringify(upgrades))
    return false
  }
}

export async function loadUpgrades() {
  const userId = getUserId()
  
  if (isFirebaseAvailable()) {
    try {
      const db = window.firebase.firestore()
      const doc = await db.collection(COLLECTIONS.UPGRADES).doc(userId).get()
      
      if (doc.exists) {
        console.log('Upgrades loaded from Firebase')
        return doc.data()
      }
    } catch (error) {
      console.warn('Firebase load failed, using localStorage:', error)
    }
  }
  
  // Fallback to localStorage
  const localData = localStorage.getItem('weaponUpgrades')
  return localData ? JSON.parse(localData) : {
    damage: 0,
    fireRate: 0,
    range: 0,
    pierce: 0,
    spread: 0,
    homing: 0
  }
}

// ===== CUSTOMIZATION =====
export async function saveCustomization(customization) {
  const userId = getUserId()
  
  if (isFirebaseAvailable()) {
    try {
      const db = window.firebase.firestore()
      await db.collection(COLLECTIONS.CUSTOMIZATION).doc(userId).set(customization, { merge: true })
      console.log('Customization saved to Firebase')
      return true
    } catch (error) {
      console.warn('Firebase save failed, using localStorage:', error)
      localStorage.setItem('gameCustomization', JSON.stringify(customization))
      return false
    }
  } else {
    localStorage.setItem('gameCustomization', JSON.stringify(customization))
    return false
  }
}

export async function loadCustomization() {
  const userId = getUserId()
  
  if (isFirebaseAvailable()) {
    try {
      const db = window.firebase.firestore()
      const doc = await db.collection(COLLECTIONS.CUSTOMIZATION).doc(userId).get()
      
      if (doc.exists) {
        console.log('Customization loaded from Firebase')
        return doc.data()
      }
    } catch (error) {
      console.warn('Firebase load failed, using localStorage:', error)
    }
  }
  
  // Fallback to localStorage
  const localData = localStorage.getItem('gameCustomization')
  return localData ? JSON.parse(localData) : {
    bulletColor: '#00f7ff',
    explosionColor: '#ff6b35',
    trailEffect: 'default',
    screenShake: true,
    particleEffects: true,
    soundEffects: true,
    hudOpacity: 0.9
  }
}
