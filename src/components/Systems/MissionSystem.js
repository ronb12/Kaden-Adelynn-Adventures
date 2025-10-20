/**
 * MissionSystem - Manages story missions and objectives
 */

export class MissionSystem {
  constructor() {
    this.currentMission = null;
    this.completedMissions = [];
    this.missionObjectives = [];
    this.missionProgress = {};
    this.missions = this.initializeMissions();
  }

  /**
   * Initialize mission definitions
   */
  initializeMissions() {
    return {
      tutorial: {
        id: 'tutorial',
        name: 'First Flight',
        chapter: 'PROLOGUE',
        description: 'Complete your first training mission',
        objectives: [
          { id: 'destroy_5', type: 'kill', target: 5, description: 'Destroy 5 enemies' },
          { id: 'collect_powerup', type: 'collect', target: 1, description: 'Collect a power-up' }
        ],
        rewards: {
          xp: 100,
          credits: 500,
          unlock: 'weapon_plasma'
        },
        nextMission: 'first_contact'
      },

      first_contact: {
        id: 'first_contact',
        name: 'First Contact',
        chapter: 'CHAPTER_1',
        description: 'Encounter the Void Scout Commander',
        objectives: [
          { id: 'survive_60', type: 'time', target: 60, description: 'Survive for 60 seconds' },
          { id: 'score_500', type: 'score', target: 500, description: 'Reach 500 points' },
          { id: 'defeat_boss', type: 'boss', target: 1, description: 'Defeat the Void Scout Commander' }
        ],
        rewards: {
          xp: 250,
          credits: 1000,
          unlock: 'ship_voidHunter'
        },
        nextMission: 'weapon_research'
      },

      weapon_research: {
        id: 'weapon_research',
        name: 'Weapon Research',
        chapter: 'CHAPTER_1',
        description: 'Test experimental weapons',
        objectives: [
          { id: 'try_weapons', type: 'weapon_switch', target: 3, description: 'Use 3 different weapons' },
          { id: 'kill_30', type: 'kill', target: 30, description: 'Destroy 30 enemies' },
          { id: 'ultimate', type: 'ultimate', target: 1, description: 'Use ultimate ability' }
        ],
        rewards: {
          xp: 200,
          credits: 750,
          unlock: 'upgrade_damage'
        },
        nextMission: 'shadow_fleet'
      },

      shadow_fleet: {
        id: 'shadow_fleet',
        name: 'Shadow Fleet',
        chapter: 'CHAPTER_2',
        description: 'Battle the Shadow Fleet Admiral',
        objectives: [
          { id: 'wave_10', type: 'wave', target: 10, description: 'Complete wave 10' },
          { id: 'combo_10', type: 'combo', target: 10, description: 'Achieve 10x combo' },
          { id: 'boss_admiral', type: 'boss', target: 1, description: 'Defeat Shadow Fleet Admiral' }
        ],
        rewards: {
          xp: 500,
          credits: 2000,
          unlock: 'ship_starDancer'
        },
        nextMission: 'hazard_training'
      },

      hazard_training: {
        id: 'hazard_training',
        name: 'Hazard Training',
        chapter: 'CHAPTER_2',
        description: 'Navigate environmental hazards',
        objectives: [
          { id: 'destroy_asteroids', type: 'asteroid', target: 5, description: 'Destroy 5 asteroids' },
          { id: 'survive_blackhole', type: 'blackhole_survive', target: 1, description: 'Survive a black hole' },
          { id: 'meteor_dodge', type: 'meteor_dodge', target: 10, description: 'Dodge 10 meteors' }
        ],
        rewards: {
          xp: 300,
          credits: 1500,
          unlock: 'upgrade_speed'
        },
        nextMission: 'void_emperor'
      },

      void_emperor: {
        id: 'void_emperor',
        name: 'The Void Emperor',
        chapter: 'CHAPTER_3',
        description: 'Face the ancient ruler of the Void Empire',
        objectives: [
          { id: 'score_5000', type: 'score', target: 5000, description: 'Reach 5000 points' },
          { id: 'perfect_wave', type: 'perfect_wave', target: 1, description: 'Complete wave without damage' },
          { id: 'void_emperor', type: 'boss', target: 1, description: 'Defeat the Void Emperor' }
        ],
        rewards: {
          xp: 1000,
          credits: 5000,
          unlock: 'ship_cosmicDefender'
        },
        nextMission: 'endless_vigilance'
      },

      endless_vigilance: {
        id: 'endless_vigilance',
        name: 'Endless Vigilance',
        chapter: 'EPILOGUE',
        description: 'Prove yourself in endless combat',
        objectives: [
          { id: 'endless_10', type: 'endless_level', target: 10, description: 'Reach endless level 10' },
          { id: 'total_kills_100', type: 'kill', target: 100, description: 'Destroy 100 enemies' },
          { id: 'all_combos', type: 'combo_unlock', target: 3, description: 'Unlock 3 power-up combos' }
        ],
        rewards: {
          xp: 2000,
          credits: 10000,
          unlock: 'ultimate_power'
        },
        nextMission: null
      }
    };
  }

  /**
   * Start a mission
   */
  startMission(missionId) {
    const mission = this.missions[missionId];
    if (!mission) {
      console.warn(`Mission ${missionId} not found`);
      return false;
    }

    this.currentMission = { ...mission };
    this.missionProgress = {};

    // Initialize progress tracking
    mission.objectives.forEach(obj => {
      this.missionProgress[obj.id] = {
        current: 0,
        target: obj.target,
        completed: false
      };
    });

    return true;
  }

  /**
   * Update mission progress
   */
  updateProgress(type, value = 1) {
    if (!this.currentMission) return;

    this.currentMission.objectives.forEach(obj => {
      if (obj.type === type && !this.missionProgress[obj.id].completed) {
        this.missionProgress[obj.id].current += value;

        if (this.missionProgress[obj.id].current >= this.missionProgress[obj.id].target) {
          this.missionProgress[obj.id].completed = true;
          this.onObjectiveComplete(obj);
        }
      }
    });

    // Check if mission complete
    if (this.isMissionComplete()) {
      this.completeMission();
    }
  }

  /**
   * Check if mission is complete
   */
  isMissionComplete() {
    if (!this.currentMission) return false;

    return Object.values(this.missionProgress).every(progress => progress.completed);
  }

  /**
   * Complete current mission
   */
  completeMission() {
    if (!this.currentMission) return;

    this.completedMissions.push(this.currentMission.id);

    const result = {
      missionId: this.currentMission.id,
      name: this.currentMission.name,
      rewards: this.currentMission.rewards,
      nextMission: this.currentMission.nextMission
    };

    this.currentMission = null;
    this.missionProgress = {};

    return result;
  }

  /**
   * On objective complete
   */
  onObjectiveComplete(objective) {
    console.log(`Objective complete: ${objective.description}`);
  }

  /**
   * Get available missions
   */
  getAvailableMissions() {
    return Object.values(this.missions).filter(mission => {
      // Check if mission is unlocked based on completed missions
      if (mission.id === 'tutorial') return !this.completedMissions.includes('tutorial');
      
      // Check previous mission completion
      const previousMissions = Object.values(this.missions).filter(m => m.nextMission === mission.id);
      return previousMissions.some(m => this.completedMissions.includes(m.id));
    });
  }

  /**
   * Get current mission status
   */
  getMissionStatus() {
    if (!this.currentMission) return null;

    return {
      mission: this.currentMission,
      progress: this.missionProgress,
      objectives: this.currentMission.objectives.map(obj => ({
        ...obj,
        progress: this.missionProgress[obj.id]
      }))
    };
  }

  /**
   * Render mission UI
   */
  render(ctx, canvas) {
    if (!this.currentMission) return;

    const panelWidth = 300;
    const panelHeight = 30 + this.currentMission.objectives.length * 25;
    const x = canvas.width / 2 - panelWidth / 2;
    const y = 10;

    ctx.save();

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, panelWidth, panelHeight);

    // Border
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, panelWidth, panelHeight);

    // Mission name
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(this.currentMission.name, x + 10, y + 20);

    // Objectives
    ctx.font = '12px Arial';
    this.currentMission.objectives.forEach((obj, i) => {
      const progress = this.missionProgress[obj.id];
      const completed = progress.completed;

      ctx.fillStyle = completed ? '#00ff00' : '#ffffff';
      const checkmark = completed ? '✓' : '○';
      const progressText = `${checkmark} ${obj.description} (${progress.current}/${progress.target})`;
      
      ctx.fillText(progressText, x + 15, y + 40 + i * 25);

      // Progress bar
      if (!completed) {
        const barWidth = 250;
        const barX = x + 20;
        const barY = y + 45 + i * 25;
        const fillWidth = (progress.current / progress.target) * barWidth;

        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.fillRect(barX, barY, barWidth, 8);

        ctx.fillStyle = '#00ffff';
        ctx.fillRect(barX, barY, fillWidth, 8);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, 8);
      }
    });

    ctx.restore();
  }

  /**
   * Save progress
   */
  saveProgress() {
    try {
      const data = {
        completedMissions: this.completedMissions,
        currentMission: this.currentMission?.id || null,
        missionProgress: this.missionProgress
      };
      localStorage.setItem('kadenAdelynnMissions', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save mission progress:', error);
    }
  }

  /**
   * Load progress
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem('kadenAdelynnMissions');
      if (saved) {
        const data = JSON.parse(saved);
        this.completedMissions = data.completedMissions || [];
        if (data.currentMission) {
          this.startMission(data.currentMission);
          this.missionProgress = data.missionProgress || {};
        }
      }
    } catch (error) {
      console.warn('Failed to load mission progress:', error);
    }
  }

  /**
   * Reset all missions
   */
  reset() {
    this.currentMission = null;
    this.completedMissions = [];
    this.missionProgress = {};
  }
}

export const missionSystem = new MissionSystem();

