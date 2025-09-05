/**
 * Music Constants - Pixels API Music Configuration
 * Exciting soundtracks that match gameplay and storyline
 */

export const MUSIC_SCENARIOS = {
  // 🌟 STORY CHAPTERS - Epic Narrative Music
  PROLOGUE: {
    name: "The Call to Adventure",
    prompt: "Epic orchestral space adventure theme, mysterious and tense, building anticipation, cinematic, 120 BPM",
    mood: "mysterious",
    tempo: 120,
    duration: 45,
    description: "Sets the stage for the epic space opera, building tension and mystery"
  },
  
  CHAPTER_1: {
    name: "First Contact",
    prompt: "High-energy space combat music, fast-paced action, laser sounds, heroic theme, 140 BPM",
    mood: "heroic",
    tempo: 140,
    duration: 60,
    description: "Intense combat music for first encounters with Void Empire forces"
  },
  
  CHAPTER_2: {
    name: "The Shadow Fleet",
    prompt: "Dramatic space battle music, intense orchestral, alien technology sounds, epic scale, 160 BPM",
    mood: "epic",
    tempo: 160,
    duration: 75,
    description: "Escalating battle music as the conflict intensifies with AI-controlled ships"
  },
  
  CHAPTER_3: {
    name: "The Void Awakens",
    prompt: "Final boss battle music, maximum intensity, orchestral with electronic elements, apocalyptic, 180 BPM",
    mood: "apocalyptic",
    tempo: 180,
    duration: 90,
    description: "Ultimate battle music for the final confrontation with the Void Emperor"
  },
  
  EPILOGUE: {
    name: "Heroes of the Federation",
    prompt: "Triumphant victory music, heroic orchestral, celebration theme, hopeful and inspiring, 100 BPM",
    mood: "triumphant",
    tempo: 100,
    duration: 30,
    description: "Victory celebration music honoring the heroes' triumph"
  },

  // 🎮 GAMEPLAY MUSIC - Dynamic Action Tracks
  MENU: {
    name: "Space Station Ambient",
    prompt: "Space station ambient music, futuristic, calm but mysterious, electronic ambient, 80 BPM",
    mood: "ambient",
    tempo: 80,
    duration: 120,
    description: "Calm but mysterious background music for the main menu"
  },
  
  COMBAT: {
    name: "Intense Combat",
    prompt: "Intense space combat music, fast-paced, electronic and orchestral, adrenaline-pumping, 150 BPM",
    mood: "intense",
    tempo: 150,
    duration: 30,
    description: "High-energy combat music that adapts to enemy density"
  },
  
  BOSS: {
    name: "Epic Boss Battle",
    prompt: "Epic boss battle music, dramatic orchestral, maximum intensity, cinematic, 170 BPM",
    mood: "dramatic",
    tempo: 170,
    duration: 60,
    description: "Dramatic music for boss encounters with multiple phases"
  },
  
  VICTORY: {
    name: "Triumphant Victory",
    prompt: "Triumphant victory fanfare, heroic orchestral, celebration, inspiring, 120 BPM",
    mood: "celebratory",
    tempo: 120,
    duration: 20,
    description: "Short victory fanfare for boss defeats and achievements"
  },
  
  GAME_OVER: {
    name: "Melancholic Defeat",
    prompt: "Melancholic space music, somber orchestral, defeat but with hope, 60 BPM",
    mood: "melancholic",
    tempo: 60,
    duration: 30,
    description: "Somber music for game over, maintaining hope for the future"
  },

  // 👥 CHARACTER THEMES - Unique Musical Identities
  KADEN: {
    name: "Elite Pilot Theme",
    prompt: "Heroic space pilot theme, bold and aggressive, electronic rock, 130 BPM",
    mood: "bold",
    tempo: 130,
    duration: 40,
    description: "Bold and aggressive theme representing Kaden's elite pilot skills"
  },
  
  ADELYNN: {
    name: "Tactical Genius Theme",
    prompt: "Tactical genius theme, intelligent and methodical, orchestral with electronic elements, 110 BPM",
    mood: "intelligent",
    tempo: 110,
    duration: 40,
    description: "Intelligent and methodical theme representing Adelynn's tactical brilliance"
  },

  // 🎯 SPECIAL EVENTS - Dynamic Sound Effects
  WEAPON_DISCOVERY: {
    name: "Technology Salvaged",
    prompt: "Discovery music, mysterious and exciting, electronic, 100 BPM",
    mood: "exciting",
    tempo: 100,
    duration: 10,
    description: "Exciting discovery music when collecting Void weapon technology"
  },
  
  POWER_UP: {
    name: "Enhancement Detected",
    prompt: "Upgrade sound, electronic chime, short and satisfying, 120 BPM",
    mood: "satisfying",
    tempo: 120,
    duration: 5,
    description: "Short, satisfying sound for power-up collection"
  },
  
  BOSS_APPROACHING: {
    name: "Massive Energy Signature",
    prompt: "Warning music, tense and foreboding, building suspense, 90 BPM",
    mood: "foreboding",
    tempo: 90,
    duration: 15,
    description: "Tense warning music when a boss is approaching"
  }
};

export const MUSIC_TRIGGERS = {
  // Story progression triggers
  STORY_CHAPTERS: {
    'PROLOGUE': 'game_start',
    'CHAPTER_1': 'score_1000',
    'CHAPTER_2': 'score_5000', 
    'CHAPTER_3': 'score_10000',
    'EPILOGUE': 'boss_defeated'
  },
  
  // Gameplay triggers
  GAMEPLAY: {
    'MENU': 'menu_state',
    'COMBAT': 'enemies_present',
    'BOSS': 'boss_active',
    'VICTORY': 'boss_defeated',
    'GAME_OVER': 'player_death'
  },
  
  // Event triggers
  EVENTS: {
    'WEAPON_DISCOVERY': 'weapon_collected',
    'POWER_UP': 'power_up_collected',
    'BOSS_APPROACHING': 'boss_spawn'
  }
};

export const MUSIC_FEATURES = {
  // Dynamic music features
  COMBAT_INTENSITY: {
    LOW: { threshold: 0.3, description: "Light combat with few enemies" },
    MEDIUM: { threshold: 0.6, description: "Moderate combat with several enemies" },
    HIGH: { threshold: 1.0, description: "Intense combat with many enemies" }
  },
  
  // Fade effects
  FADE_EFFECTS: {
    FADE_IN_TIME: 2000, // 2 seconds
    FADE_OUT_TIME: 2000, // 2 seconds
    CROSSFADE_TIME: 1000 // 1 second
  },
  
  // Volume levels
  VOLUME_LEVELS: {
    MASTER: 0.7,
    MUSIC: 0.5,
    SFX: 0.8,
    VOICE: 0.6
  }
};

export const MUSIC_QUALITY_SETTINGS = {
  // Audio quality settings
  QUALITY: {
    HIGH: {
      sampleRate: 44100,
      bitDepth: 16,
      channels: 2,
      compression: 'lossless'
    },
    MEDIUM: {
      sampleRate: 22050,
      bitDepth: 16,
      channels: 2,
      compression: 'high'
    },
    LOW: {
      sampleRate: 11025,
      bitDepth: 8,
      channels: 1,
      compression: 'medium'
    }
  }
};

export const MUSIC_EMOTIONS = {
  // Emotional mapping for music
  EMOTIONS: {
    HEROIC: ['bold', 'triumphant', 'celebratory'],
    TENSE: ['mysterious', 'foreboding', 'dramatic'],
    ACTION: ['intense', 'heroic', 'epic'],
    CALM: ['ambient', 'mysterious'],
    VICTORY: ['triumphant', 'celebratory', 'heroic'],
    DEFEAT: ['melancholic', 'somber']
  }
};

export default {
  MUSIC_SCENARIOS,
  MUSIC_TRIGGERS,
  MUSIC_FEATURES,
  MUSIC_QUALITY_SETTINGS,
  MUSIC_EMOTIONS
};
