/**
 * Starbase Headquarters System
 * Industry-first living starbase hub for mobile space shooters
 * Features: Interactive rooms, NPCs, visual progression, animations
 */

export class StarbaseSystem {
  constructor() {
    this.currentRoom = 'command'; // Starting room
    this.baseLevel = 1; // Base upgrade level
    this.unlockedRooms = ['hangar', 'operations', 'command']; // Start with 3 rooms
    this.visitCount = 0;
    this.lastVisit = Date.now();
    
    // Room definitions
    this.rooms = {
      hangar: {
        id: 'hangar',
        name: 'Hangar Bay',
        icon: '🛸',
        description: 'Select and customize your ships',
        position: { x: 100, y: 200 },
        size: { width: 180, height: 140 },
        unlockLevel: 1,
        backgroundColor: '#1a1a2a',
        accentColor: '#00ffff'
      },
      operations: {
        id: 'operations',
        name: 'Mission Operations',
        icon: '📡',
        description: 'Launch missions and view objectives',
        position: { x: 320, y: 180 },
        size: { width: 200, height: 160 },
        unlockLevel: 1,
        backgroundColor: '#2a1a1a',
        accentColor: '#ff8800'
      },
      command: {
        id: 'command',
        name: 'Command Center',
        icon: '👨‍✈️',
        description: 'View stats and leaderboards',
        position: { x: 560, y: 200 },
        size: { width: 180, height: 140 },
        unlockLevel: 1,
        backgroundColor: '#1a2a1a',
        accentColor: '#00ff88'
      },
      techlab: {
        id: 'techlab',
        name: 'Tech Lab',
        icon: '🔬',
        description: 'Research upgrades and buy equipment',
        position: { x: 100, y: 380 },
        size: { width: 180, height: 140 },
        unlockLevel: 3,
        backgroundColor: '#2a2a1a',
        accentColor: '#ffff00'
      },
      quarters: {
        id: 'quarters',
        name: 'Living Quarters',
        icon: '🛏️',
        description: 'Customize profile and view achievements',
        position: { x: 320, y: 400 },
        size: { width: 180, height: 120 },
        unlockLevel: 5,
        backgroundColor: '#1a1a3a',
        accentColor: '#ff00ff'
      },
      dock: {
        id: 'dock',
        name: 'Docking Bay',
        icon: '🌐',
        description: 'Multiplayer and co-op missions',
        position: { x: 560, y: 380 },
        size: { width: 180, height: 140 },
        unlockLevel: 10,
        backgroundColor: '#3a1a1a',
        accentColor: '#ff0088'
      }
    };
    
    // Load saved data
    this.loadProgress();
  }
  
  /**
   * Get all available rooms based on base level
   */
  getAvailableRooms() {
    return Object.values(this.rooms).filter(room => 
      room.unlockLevel <= this.baseLevel
    );
  }
  
  /**
   * Check if room is unlocked
   */
  isRoomUnlocked(roomId) {
    const room = this.rooms[roomId];
    return room && room.unlockLevel <= this.baseLevel;
  }
  
  /**
   * Navigate to a room
   */
  navigateToRoom(roomId) {
    if (this.isRoomUnlocked(roomId)) {
      this.currentRoom = roomId;
      this.visitCount++;
      return true;
    }
    return false;
  }
  
  /**
   * Upgrade starbase level
   */
  upgradeBase() {
    this.baseLevel++;
    
    // Unlock new rooms
    Object.values(this.rooms).forEach(room => {
      if (room.unlockLevel === this.baseLevel && !this.unlockedRooms.includes(room.id)) {
        this.unlockedRooms.push(room.id);
      }
    });
    
    this.saveProgress();
    return this.baseLevel;
  }
  
  /**
   * Get current room data
   */
  getCurrentRoom() {
    return this.rooms[this.currentRoom];
  }
  
  /**
   * Get upgrade cost for next level
   */
  getUpgradeCost() {
    return Math.floor(1000 * Math.pow(1.5, this.baseLevel));
  }
  
  /**
   * Check what new rooms would unlock at next level
   */
  getNextUnlocks() {
    const nextLevel = this.baseLevel + 1;
    return Object.values(this.rooms).filter(room => 
      room.unlockLevel === nextLevel
    );
  }
  
  /**
   * Save progress
   */
  saveProgress() {
    try {
      const data = {
        baseLevel: this.baseLevel,
        unlockedRooms: this.unlockedRooms,
        visitCount: this.visitCount,
        lastVisit: this.lastVisit
      };
      localStorage.setItem('starbase_progress', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save starbase progress:', e);
    }
  }
  
  /**
   * Load progress
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem('starbase_progress');
      if (saved) {
        const data = JSON.parse(saved);
        this.baseLevel = data.baseLevel || 1;
        this.unlockedRooms = data.unlockedRooms || ['hangar', 'operations', 'command'];
        this.visitCount = data.visitCount || 0;
        this.lastVisit = data.lastVisit || Date.now();
      }
    } catch (e) {
      console.error('Failed to load starbase progress:', e);
    }
  }
  
  /**
   * Reset progress (for testing)
   */
  reset() {
    this.baseLevel = 1;
    this.unlockedRooms = ['hangar', 'operations', 'command'];
    this.visitCount = 0;
    this.currentRoom = 'command';
    this.saveProgress();
  }
}

export default StarbaseSystem;

