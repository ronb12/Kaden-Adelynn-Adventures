// Mission Generator - Creates 365 missions across multiple chapters
import { MissionObjectiveType, StoryCharacter, RunBiome, RunMutator, DialogueTiming } from './storyModeModels'

const missionTitles = [
  'First Steps', 'Into the Unknown', 'Asteroid Field', 'Nebula Crossing', 'Enemy Encounter',
  'Speed Test', 'Precision Strike', 'Survival Run', 'Boss Battle', 'Star Collection',
  'Wave Rider', 'Combo Master', 'Perfect Aim', 'No Damage Run', 'Endurance Test',
  'Deep Space', 'Void Explorer', 'Storm Chaser', 'Planet Approach', 'Station Defense',
  'Black Hole Edge', 'Nebula Drift', 'Asteroid Mining', 'Enemy Fleet', 'Rescue Mission',
  'Data Recovery', 'Supply Run', 'Patrol Duty', 'Scout Mission', 'Escort Mission'
]

const missionDescriptions = [
  'Complete your objective', 'Survive the challenge', 'Defeat all enemies', 'Reach the target',
  'Collect resources', 'Master the waves', 'Perfect your skills', 'Test your limits',
  'Explore the unknown', 'Defend the position', 'Navigate the hazards', 'Prove your worth'
]

const briefings = [
  'This mission will test your skills. Stay focused and remember your training.',
  'The path ahead is dangerous, but you\'re ready for this challenge.',
  'Enemies are closing in. Use everything you\'ve learned to survive.',
  'This is a critical mission. Success here will unlock new possibilities.',
  'The environment is hostile, but you have what it takes to succeed.',
  'Team up and work together. Your combined skills will see you through.',
  'This won\'t be easy, but nothing worth doing ever is.',
  'Trust your instincts and stay alert. You\'ve got this.',
  'The stakes are high, but so is your determination.',
  'Every mission makes you stronger. This one is no different.'
]

const completionTexts = [
  'Excellent work! You\'ve completed the mission successfully.',
  'Outstanding performance! You\'re getting stronger with each mission.',
  'Mission accomplished! Your skills are improving.',
  'Well done! You\'ve proven yourself once again.',
  'Perfect execution! You\'re ready for greater challenges.',
  'Impressive! You handled that like a true professional.',
  'Success! Your training is paying off.',
  'Mission complete! You\'re becoming a force to be reckoned with.',
  'Excellent! You\'ve mastered this challenge.',
  'Outstanding! You\'re ready for what comes next.'
]

const characterDialogueOptions = {
  kaden: [
    'Let\'s do this!',
    'I\'m ready for anything.',
    'Time to show what I can do.',
    'This is what I trained for.',
    'I won\'t let you down.',
    'Here we go!',
    'I\'ve got this!',
    'Let\'s make this count!'
  ],
  adelynn: [
    'Ready when you are!',
    'Let\'s show them what we can do!',
    'I love a good challenge!',
    'This is going to be fun!',
    'Let\'s do this together!',
    'I\'m excited!',
    'Time to shine!',
    'Let\'s go!'
  ],
  both: [
    'We\'ve got this!',
    'Together we\'re unstoppable!',
    'Let\'s work as a team!',
    'Our combined skills will see us through!',
    'We make a great team!',
    'Let\'s do this together!',
    'We\'ve got each other\'s backs!',
    'Teamwork makes the dream work!'
  ]
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function generateObjectives(missionNumber) {
  const objectives = []
  const numObjectives = missionNumber <= 10 ? 2 : missionNumber <= 50 ? 2 + Math.floor(Math.random() * 2) : 3
  
  const objectiveTypes = [
    MissionObjectiveType.SURVIVE,
    MissionObjectiveType.KILL_ENEMIES,
    MissionObjectiveType.REACH_WAVE,
    MissionObjectiveType.COLLECT_STARS,
    MissionObjectiveType.ACCURACY,
    MissionObjectiveType.COMBO,
    MissionObjectiveType.NO_DAMAGE,
    MissionObjectiveType.DEFEAT_BOSS
  ]
  
  // Scale difficulty with mission number
  const difficultyMultiplier = 1 + (missionNumber * 0.05)
  
  for (let i = 0; i < numObjectives; i++) {
    const type = objectiveTypes[Math.floor(Math.random() * objectiveTypes.length)]
    let target = 1
    let description = ''
    
    switch (type) {
      case MissionObjectiveType.SURVIVE:
        target = Math.floor(30 + (missionNumber * 2) * difficultyMultiplier)
        description = `Survive for ${target} seconds`
        break
      case MissionObjectiveType.KILL_ENEMIES:
        target = Math.floor(5 + (missionNumber * 1.5) * difficultyMultiplier)
        description = `Defeat ${target} enemies`
        break
      case MissionObjectiveType.REACH_WAVE:
        target = Math.floor(1 + (missionNumber * 0.3) * difficultyMultiplier)
        description = `Reach wave ${target}`
        break
      case MissionObjectiveType.COLLECT_STARS:
        target = Math.floor(20 + (missionNumber * 3) * difficultyMultiplier)
        description = `Collect ${target} stars`
        break
      case MissionObjectiveType.ACCURACY:
        target = Math.min(95, 50 + Math.floor(missionNumber * 0.5))
        description = `Maintain ${target}% accuracy`
        break
      case MissionObjectiveType.COMBO:
        target = Math.floor(3 + (missionNumber * 0.2) * difficultyMultiplier)
        description = `Achieve a ${target}x combo`
        break
      case MissionObjectiveType.NO_DAMAGE:
        target = Math.floor(10 + (missionNumber * 0.5) * difficultyMultiplier)
        description = `Avoid damage for ${target} seconds`
        break
      case MissionObjectiveType.DEFEAT_BOSS:
        target = 1
        description = 'Defeat the boss'
        break
    }
    
    objectives.push({
      id: `${i + 1}`,
      type,
      target,
      description,
      progress: 0,
      isCompleted: false
    })
  }
  
  return objectives
}

function generateMission(missionNumber, chapterNumber, chapterId) {
  const titleIndex = (missionNumber - 1) % missionTitles.length
  const title = missionTitles[titleIndex] + (missionNumber > missionTitles.length ? ` ${Math.floor((missionNumber - 1) / missionTitles.length) + 1}` : '')
  
  // Determine character based on mission number
  let character = StoryCharacter.KADEN
  if (missionNumber % 3 === 0) {
    character = StoryCharacter.ADELYNN
  } else if (missionNumber % 5 === 0) {
    character = StoryCharacter.BOTH
  }
  
  // Rotate biomes
  const biomes = Object.values(RunBiome)
  const biome = biomes[(missionNumber - 1) % biomes.length]
  
  // Add mutators for harder missions
  let mutator = null
  if (missionNumber > 50 && missionNumber % 10 === 0) {
    const mutators = Object.values(RunMutator)
    mutator = mutators[Math.floor(Math.random() * mutators.length)]
  }
  
  // Generate dialogue
  const charKey = character === StoryCharacter.KADEN ? 'kaden' : 
                  character === StoryCharacter.ADELYNN ? 'adelynn' : 'both'
  const dialogueOptions = characterDialogueOptions[charKey]
  
  const characterDialogue = [
    {
      id: '1',
      character: charKey,
      text: getRandomElement(dialogueOptions),
      timing: DialogueTiming.PRE_MISSION
    }
  ]
  
  if (missionNumber > 20) {
    characterDialogue.push({
      id: '2',
      character: charKey,
      text: getRandomElement(dialogueOptions),
      timing: DialogueTiming.MID_MISSION
    })
  }
  
  if (missionNumber % 10 === 0) {
    characterDialogue.push({
      id: '3',
      character: charKey,
      text: getRandomElement(dialogueOptions),
      timing: DialogueTiming.OBJECTIVE_COMPLETE
    })
  }
  
  return {
    id: `mission_${chapterNumber}_${missionNumber}`,
    missionNumber,
    title,
    description: getRandomElement(missionDescriptions),
    briefing: getRandomElement(briefings),
    completionText: getRandomElement(completionTexts),
    characterDialogue,
    objectives: generateObjectives(missionNumber),
    biome,
    mutator,
    isUnlocked: missionNumber === 1,
    isCompleted: false,
    starsEarned: 0
  }
}

function generateChapter(chapterNumber, missionsPerChapter, startMissionNumber) {
  const chapterTitles = [
    'First Flight', 'Partners in Space', 'The Nebula Mystery', 'Ion Storm Challenge', 'Boss Encounter',
    'Deep Space Exploration', 'Asteroid Belt Run', 'Void Crossing', 'Planet Approach', 'Station Defense',
    'Black Hole Edge', 'Nebula Drift', 'Enemy Territory', 'Rescue Mission', 'Data Recovery',
    'Supply Run', 'Patrol Duty', 'Scout Mission', 'Escort Mission', 'Reconnaissance',
    'Combat Training', 'Advanced Tactics', 'Elite Challenge', 'Master Class', 'Legendary Quest',
    'Epic Journey', 'Final Frontier', 'Ultimate Test', 'Supreme Challenge', 'Cosmic Mastery'
  ]
  
  const chapterDescriptions = [
    'Begin your space adventure', 'Team up with allies', 'Explore mysterious regions',
    'Face dangerous challenges', 'Battle powerful enemies', 'Discover new territories',
    'Master advanced techniques', 'Prove your skills', 'Reach new heights', 'Become a legend'
  ]
  
  const titleIndex = (chapterNumber - 1) % chapterTitles.length
  const title = chapterTitles[titleIndex] + (chapterNumber > chapterTitles.length ? ` ${Math.floor((chapterNumber - 1) / chapterTitles.length) + 1}` : '')
  
  // Determine character for chapter
  let character = StoryCharacter.KADEN
  if (chapterNumber % 3 === 0) {
    character = StoryCharacter.ADELYNN
  } else if (chapterNumber % 5 === 0) {
    character = StoryCharacter.BOTH
  }
  
  // Rotate biomes for chapters
  const biomes = Object.values(RunBiome)
  const biome = biomes[(chapterNumber - 1) % biomes.length]
  
  const missions = []
  for (let i = 0; i < missionsPerChapter; i++) {
    const missionNumber = startMissionNumber + i
    missions.push(generateMission(missionNumber, chapterNumber, `chapter_${chapterNumber}`))
  }
  
  return {
    id: `chapter_${chapterNumber}`,
    chapterNumber,
    title,
    description: getRandomElement(chapterDescriptions),
    character,
    biome,
    missions,
    isUnlocked: chapterNumber === 1,
    isCompleted: false
  }
}

export function generateAllMissions() {
  // We already have 5 missions in the first 5 chapters
  // Need to generate 360 more missions (365 total - 5 existing = 360)
  const existingMissions = 5
  const totalMissionsNeeded = 365
  const missionsToGenerate = totalMissionsNeeded - existingMissions
  
  const chapters = []
  
  // Distribute remaining missions across new chapters
  // Use varying chapter sizes for variety
  let missionCount = 0
  let chapterNumber = 6 // Start from chapter 6 (chapters 1-5 already exist)
  let globalMissionNumber = existingMissions + 1 // Start mission numbering from 6
  
  while (missionCount < missionsToGenerate) {
    // Vary missions per chapter: 5-15 missions per chapter
    const missionsPerChapter = missionCount < 50 ? 5 : 
                               missionCount < 150 ? 7 : 
                               missionCount < 250 ? 10 : 12
    
    const remainingMissions = missionsToGenerate - missionCount
    const missionsThisChapter = Math.min(missionsPerChapter, remainingMissions)
    
    if (missionsThisChapter > 0) {
      chapters.push(generateChapter(chapterNumber, missionsThisChapter, globalMissionNumber))
      missionCount += missionsThisChapter
      globalMissionNumber += missionsThisChapter
      chapterNumber++
    } else {
      break
    }
  }
  
  return chapters
}
