// Story Mode Models - Matching iOS StoryModeModels.swift

export const MissionObjectiveType = {
  SURVIVE: 'survive',
  KILL_ENEMIES: 'kill_enemies',
  REACH_WAVE: 'reach_wave',
  COLLECT_STARS: 'collect_stars',
  DEFEAT_BOSS: 'defeat_boss',
  ACCURACY: 'accuracy',
  COMBO: 'combo',
  NO_DAMAGE: 'no_damage',
}

export const DialogueTiming = {
  PRE_MISSION: 'pre_mission',
  MID_MISSION: 'mid_mission',
  POST_MISSION: 'post_mission',
  OBJECTIVE_COMPLETE: 'objective_complete',
  BOSS_ENCOUNTER: 'boss_encounter',
}

export const StoryCharacter = {
  KADEN: 'kaden',
  ADELYNN: 'adelynn',
  BOTH: 'both',
}

export const RunBiome = {
  NEBULA: 'nebula',
  ASTEROID_BELT: 'asteroidBelt',
  ION_STORM: 'ionStorm',
  VOID: 'void',
  PLANET_SURFACE: 'planetSurface',
  SPACE_STATION: 'spaceStation',
  BLACK_HOLE: 'blackHole',
  NEBULA_DRIFT: 'nebulaDrift',
}

export const RunMutator = {
  FAST_ENEMY_BULLETS: 'fastEnemyBullets',
  DOUBLE_BOSS_MINIONS: 'doubleBossMinions',
  FRAGILE_PLAYER: 'fragilePlayer',
  NO_POWERUPS: 'noPowerups',
}

// Story Mode Data
export const storyChapters = [
  {
    id: 'chapter_1',
    chapterNumber: 1,
    title: 'First Flight',
    description: 'Kaden embarks on his first space mission',
    character: StoryCharacter.KADEN,
    biome: RunBiome.NEBULA,
    missions: [
      {
        id: 'mission_1_1',
        missionNumber: 1,
        title: 'The Initiation',
        description: 'Complete your first mission',
        briefing: 'This is it, Kaden. Your first real mission in deep space. Keep your wits about you and remember your training.',
        completionText: 'Excellent work, Kaden! You\'ve proven yourself ready for bigger challenges.',
        characterDialogue: [
          { id: '1', character: 'kaden', text: 'Here we go. First mission, here I come.', timing: DialogueTiming.PRE_MISSION },
          { id: '2', character: 'kaden', text: 'I\'ve got this!', timing: DialogueTiming.OBJECTIVE_COMPLETE },
        ],
        objectives: [
          { id: '1', type: MissionObjectiveType.SURVIVE, target: 60, description: 'Survive for 60 seconds', progress: 0, isCompleted: false },
          { id: '2', type: MissionObjectiveType.KILL_ENEMIES, target: 10, description: 'Defeat 10 enemies', progress: 0, isCompleted: false },
        ],
        biome: RunBiome.NEBULA,
        isUnlocked: true,
        isCompleted: false,
        starsEarned: 0,
      },
    ],
    isUnlocked: true,
    isCompleted: false,
  },
  {
    id: 'chapter_2',
    chapterNumber: 2,
    title: 'Partners in Space',
    description: 'Adelynn joins the adventure',
    character: StoryCharacter.ADELYNN,
    biome: RunBiome.ASTEROID_BELT,
    missions: [
      {
        id: 'mission_2_1',
        missionNumber: 2,
        title: 'New Ally',
        description: 'Meet Adelynn in the asteroid belt',
        briefing: 'I\'ve heard about your skills, Kaden. Let\'s see if we can work together. The asteroid belt won\'t be easy, but with my speed and your precision, we\'ve got this!',
        completionText: 'Well done, team! We make a great pair, don\'t we?',
        characterDialogue: [
          { id: '1', character: 'adelynn', text: 'Hey Kaden! Ready to see what real speed looks like?', timing: DialogueTiming.PRE_MISSION },
          { id: '2', character: 'kaden', text: 'I\'m right behind you, Adelynn!', timing: DialogueTiming.MID_MISSION },
        ],
        objectives: [
          { id: '1', type: MissionObjectiveType.REACH_WAVE, target: 3, description: 'Reach wave 3', progress: 0, isCompleted: false },
          { id: '2', type: MissionObjectiveType.COLLECT_STARS, target: 50, description: 'Collect 50 stars', progress: 0, isCompleted: false },
          { id: '3', type: MissionObjectiveType.COMBO, target: 5, description: 'Achieve a 5x combo', progress: 0, isCompleted: false },
        ],
        biome: RunBiome.ASTEROID_BELT,
        isUnlocked: true,
        isCompleted: false,
        starsEarned: 0,
      },
    ],
    isUnlocked: true,
    isCompleted: false,
  },
  {
    id: 'chapter_3',
    chapterNumber: 3,
    title: 'The Nebula Mystery',
    description: 'Investigate strange signals in the nebula',
    character: StoryCharacter.BOTH,
    biome: RunBiome.NEBULA,
    missions: [
      {
        id: 'mission_3_1',
        missionNumber: 3,
        title: 'Unknown Signals',
        description: 'Explore the mysterious nebula',
        briefing: 'Kaden, I\'m picking up strange signals from the nebula. Something\'s not right. Let\'s investigate together, but stay close - we don\'t know what we\'re dealing with.',
        completionText: 'Those signals... they\'re coming from somewhere deep in the nebula. We need to go deeper.',
        characterDialogue: [
          { id: '1', character: 'kaden', text: 'Adelynn, what do you make of these readings?', timing: DialogueTiming.PRE_MISSION },
          { id: '2', character: 'adelynn', text: 'I don\'t like it, Kaden. Something feels off.', timing: DialogueTiming.MID_MISSION },
          { id: '3', character: 'kaden', text: 'We need to see what\'s making these signals.', timing: DialogueTiming.POST_MISSION },
        ],
        objectives: [
          { id: '1', type: MissionObjectiveType.SURVIVE, target: 120, description: 'Survive for 2 minutes', progress: 0, isCompleted: false },
          { id: '2', type: MissionObjectiveType.KILL_ENEMIES, target: 30, description: 'Defeat 30 enemies', progress: 0, isCompleted: false },
          { id: '3', type: MissionObjectiveType.REACH_WAVE, target: 5, description: 'Reach wave 5', progress: 0, isCompleted: false },
        ],
        biome: RunBiome.NEBULA,
        isUnlocked: true,
        isCompleted: false,
        starsEarned: 0,
      },
    ],
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 'chapter_4',
    chapterNumber: 4,
    title: 'Ion Storm Challenge',
    description: 'Survive the dangerous ion storm',
    character: StoryCharacter.BOTH,
    biome: RunBiome.ION_STORM,
    missions: [
      {
        id: 'mission_4_1',
        missionNumber: 4,
        title: 'Storm Survival',
        description: 'Navigate through the ion storm',
        briefing: 'The ion storm is approaching! Our shields won\'t last long. We need to push through quickly, but carefully. Adelynn, your speed will be crucial here. Kaden, watch our backs!',
        completionText: 'We made it through! That was intense, but we\'re stronger together.',
        characterDialogue: [
          { id: '1', character: 'adelynn', text: 'Ion storm detected! This is going to be rough!', timing: DialogueTiming.PRE_MISSION },
          { id: '2', character: 'kaden', text: 'Stay focused! We can do this!', timing: DialogueTiming.MID_MISSION },
          { id: '3', character: 'adelynn', text: 'We\'re through! Great teamwork!', timing: DialogueTiming.POST_MISSION },
        ],
        objectives: [
          { id: '1', type: MissionObjectiveType.SURVIVE, target: 180, description: 'Survive for 3 minutes', progress: 0, isCompleted: false },
          { id: '2', type: MissionObjectiveType.ACCURACY, target: 70, description: 'Maintain 70% accuracy', progress: 0, isCompleted: false },
          { id: '3', type: MissionObjectiveType.NO_DAMAGE, target: 30, description: 'Avoid damage for 30 seconds', progress: 0, isCompleted: false },
        ],
        biome: RunBiome.ION_STORM,
        mutator: RunMutator.FAST_ENEMY_BULLETS,
        isUnlocked: false,
        isCompleted: false,
        starsEarned: 0,
      },
    ],
    isUnlocked: false,
    isCompleted: false,
  },
  {
    id: 'chapter_5',
    chapterNumber: 5,
    title: 'Boss Encounter',
    description: 'Face your first major threat',
    character: StoryCharacter.BOTH,
    biome: RunBiome.VOID,
    missions: [
      {
        id: 'mission_5_1',
        missionNumber: 5,
        title: 'The First Boss',
        description: 'Defeat the boss in the void',
        briefing: 'Kaden, Adelynn - this is it. A massive enemy ship is blocking our path. It\'s heavily armed and won\'t go down easily. We\'ll need perfect coordination. Adelynn, use your speed to draw its fire. Kaden, hit it hard when it\'s distracted!',
        completionText: 'Incredible! We defeated it! This is just the beginning of our adventure together.',
        characterDialogue: [
          { id: '1', character: 'kaden', text: 'That ship is massive! How do we take it down?', timing: DialogueTiming.PRE_MISSION },
          { id: '2', character: 'adelynn', text: 'I\'ll distract it - you hit it with everything you\'ve got!', timing: DialogueTiming.BOSS_ENCOUNTER },
          { id: '3', character: 'kaden', text: 'We did it! That was incredible!', timing: DialogueTiming.POST_MISSION },
          { id: '4', character: 'adelynn', text: 'Perfect teamwork! What\'s next, partner?', timing: DialogueTiming.POST_MISSION },
        ],
        objectives: [
          { id: '1', type: MissionObjectiveType.DEFEAT_BOSS, target: 1, description: 'Defeat the boss', progress: 0, isCompleted: false },
          { id: '2', type: MissionObjectiveType.KILL_ENEMIES, target: 50, description: 'Defeat 50 enemies total', progress: 0, isCompleted: false },
          { id: '3', type: MissionObjectiveType.SURVIVE, target: 300, description: 'Survive for 5 minutes', progress: 0, isCompleted: false },
        ],
        biome: RunBiome.VOID,
        mutator: RunMutator.DOUBLE_BOSS_MINIONS,
        isUnlocked: false,
        isCompleted: false,
        starsEarned: 0,
      },
    ],
    isUnlocked: false,
    isCompleted: false,
  },
]

// Story Mode Manager
export class StoryModeManager {
  constructor() {
    this.chapters = [...storyChapters]
    this.currentChapter = null
    this.currentMission = null
    this.loadStoryProgress()
  }

  loadStoryProgress() {
    try {
      const saved = localStorage.getItem('storyProgress')
      if (saved) {
        const progress = JSON.parse(saved)
        // Update chapters with saved progress
        this.chapters.forEach((chapter, idx) => {
          if (progress.unlockedChapterIds?.includes(chapter.id)) {
            chapter.isUnlocked = true
          }
          if (progress.completedChapterIds?.includes(chapter.id)) {
            chapter.isCompleted = true
          }
          chapter.missions.forEach((mission) => {
            if (progress.completedMissionIds?.includes(mission.id)) {
              mission.isCompleted = true
            }
          })
        })
      } else {
        // First chapter is always unlocked
        if (this.chapters.length > 0) {
          this.chapters[0].isUnlocked = true
          if (this.chapters[0].missions.length > 0) {
            this.chapters[0].missions[0].isUnlocked = true
          }
        }
      }
    } catch (e) {
      console.error('Error loading story progress:', e)
    }
  }

  saveStoryProgress() {
    try {
      const progress = {
        completedMissionIds: [],
        unlockedChapterIds: [],
        completedChapterIds: [],
        currentChapterId: this.currentChapter?.id,
        currentMissionId: this.currentMission?.id,
      }
      this.chapters.forEach((chapter) => {
        if (chapter.isUnlocked) {
          progress.unlockedChapterIds.push(chapter.id)
        }
        if (chapter.isCompleted) {
          progress.completedChapterIds.push(chapter.id)
        }
        chapter.missions.forEach((mission) => {
          if (mission.isCompleted) {
            progress.completedMissionIds.push(mission.id)
          }
        })
      })
      localStorage.setItem('storyProgress', JSON.stringify(progress))
    } catch (e) {
      console.error('Error saving story progress:', e)
    }
  }

  completeMission(missionId, starsEarned) {
    this.chapters.forEach((chapter) => {
      const mission = chapter.missions.find((m) => m.id === missionId)
      if (mission) {
        mission.isCompleted = true
        mission.starsEarned = starsEarned
        // Check if all missions in chapter are complete
        const allComplete = chapter.missions.every((m) => m.isCompleted)
        if (allComplete) {
          chapter.isCompleted = true
        }
        this.updateChapterUnlocks()
        this.saveStoryProgress()
      }
    })
  }

  updateChapterUnlocks() {
    this.chapters.forEach((chapter, idx) => {
      if (idx === 0) {
        chapter.isUnlocked = true
      } else if (this.chapters[idx - 1].isCompleted) {
        chapter.isUnlocked = true
      }
      // Unlock first mission of unlocked chapters
      if (chapter.isUnlocked && chapter.missions.length > 0) {
        chapter.missions[0].isUnlocked = true
        // Unlock subsequent missions if previous is completed
        for (let i = 1; i < chapter.missions.length; i++) {
          if (chapter.missions[i - 1].isCompleted) {
            chapter.missions[i].isUnlocked = true
          }
        }
      }
    })
  }
}

export const storyModeManager = new StoryModeManager()

