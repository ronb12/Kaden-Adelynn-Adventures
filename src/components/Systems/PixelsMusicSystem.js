/**
 * PixelsMusicSystem - Dynamic music system using Pixels API
 * Creates exciting soundtracks that match gameplay and storyline
 */
export class PixelsMusicSystem {
  constructor() {
    this.apiKey = 'fukzfUyQBBPXqfJyNeXsFvIFOXhIjkRWFaeNVLSggxEZ9aKhqnWa3lgR';
    this.baseUrl = 'https://api.pixels.xyz/v1';
    this.currentTrack = null;
    this.audioContext = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.currentChapter = 'PROLOGUE';
    this.gameState = 'menu';
    this.combatIntensity = 0;
    this.bossActive = false;
    this.musicQueue = [];
    this.fadeTime = 2000; // 2 seconds fade
  }

  /**
   * Initialize the music system
   */
  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.5; // Default volume
      
      // Pre-generate music for different scenarios
      await this.preGenerateMusic();
      return true;
    } catch (error) {
      console.error('Failed to initialize Pixels music system:', error);
      return false;
    }
  }

  /**
   * Pre-generate music for different game scenarios
   */
  async preGenerateMusic() {
    // Check if Pixels API is accessible first
    const canAccessAPI = await this.checkAPIAccess();
    
    if (!canAccessAPI) {
      console.log('🎵 Pixels API not accessible, generating Web Audio fallback music');
      // Generate fallback music for all scenarios
      await this.generateAllFallbackMusic();
      return;
    }

    const musicPrompts = {
      // Story Chapter Music
      PROLOGUE: "Epic orchestral space adventure theme, mysterious and tense, building anticipation, cinematic, 120 BPM",
      CHAPTER_1: "High-energy space combat music, fast-paced action, laser sounds, heroic theme, 140 BPM",
      CHAPTER_2: "Dramatic space battle music, intense orchestral, alien technology sounds, epic scale, 160 BPM",
      CHAPTER_3: "Final boss battle music, maximum intensity, orchestral with electronic elements, apocalyptic, 180 BPM",
      EPILOGUE: "Triumphant victory music, heroic orchestral, celebration theme, hopeful and inspiring, 100 BPM",
      
      // Gameplay Music
      MENU: "Space station ambient music, futuristic, calm but mysterious, electronic ambient, 80 BPM",
      COMBAT: "Intense space combat music, fast-paced, electronic and orchestral, adrenaline-pumping, 150 BPM",
      BOSS: "Epic boss battle music, dramatic orchestral, maximum intensity, cinematic, 170 BPM",
      VICTORY: "Triumphant victory fanfare, heroic orchestral, celebration, inspiring, 120 BPM",
      GAME_OVER: "Melancholic space music, somber orchestral, defeat but with hope, 60 BPM",
      
      // Character Themes
      KADEN: "Heroic space pilot theme, bold and aggressive, electronic rock, 130 BPM",
      ADELYNN: "Tactical genius theme, intelligent and methodical, orchestral with electronic elements, 110 BPM",
      
      // Special Events
      WEAPON_DISCOVERY: "Discovery music, mysterious and exciting, electronic, 100 BPM",
      POWER_UP: "Upgrade sound, electronic chime, short and satisfying, 120 BPM",
      BOSS_APPROACHING: "Warning music, tense and foreboding, building suspense, 90 BPM"
    };

    // Generate music for each scenario (limit to 3 to avoid CORS spam)
    const limitedPrompts = Object.entries(musicPrompts).slice(0, 3);
    
    for (const [scenario, prompt] of limitedPrompts) {
      try {
        const musicData = await this.generateMusic(prompt, scenario);
        this.musicQueue[scenario] = musicData;
      } catch (error) {
        console.warn(`Failed to generate music for ${scenario}:`, error);
        // Stop trying if we get CORS errors
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
          console.log('🔒 CORS error detected, stopping music generation');
          break;
        }
      }
    }
  }

  /**
   * Check if Pixels API is accessible
   */
  async checkAPIAccess() {
    // Simple check - if we're on a production domain, assume CORS issues
    const isProduction = window.location.hostname.includes('web.app') || 
                        window.location.hostname.includes('firebase') ||
                        window.location.hostname.includes('github.io');
    
    if (isProduction) {
      console.log('🔒 Production environment detected, skipping Pixels API to avoid CORS');
      return false;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.ok;
    } catch (error) {
      console.log('🔒 Pixels API not accessible due to CORS policy');
      return false;
    }
  }

  /**
   * Generate music using Pixels API
   */
  async generateMusic(prompt, scenario) {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: this.getDurationForScenario(scenario),
          style: 'cinematic',
          mood: this.getMoodForScenario(scenario),
          tempo: this.getTempoForScenario(scenario),
          format: 'wav'
        })
      });

      if (!response.ok) {
        throw new Error(`Pixels API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        url: data.audio_url,
        prompt: prompt,
        scenario: scenario,
        duration: data.duration || 30
      };
    } catch (error) {
      // Check if it's a CORS error
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        console.log('🔒 CORS error detected, using fallback music');
        return this.generateFallbackMusic(scenario);
      }
      console.error('Error generating music:', error);
      // Fallback to procedural music
      return this.generateFallbackMusic(scenario);
    }
  }

  /**
   * Get duration for different scenarios
   */
  getDurationForScenario(scenario) {
    const durations = {
      PROLOGUE: 45,
      CHAPTER_1: 60,
      CHAPTER_2: 75,
      CHAPTER_3: 90,
      EPILOGUE: 30,
      MENU: 120,
      COMBAT: 30,
      BOSS: 60,
      VICTORY: 20,
      GAME_OVER: 30,
      KADEN: 40,
      ADELYNN: 40,
      WEAPON_DISCOVERY: 10,
      POWER_UP: 5,
      BOSS_APPROACHING: 15
    };
    return durations[scenario] || 30;
  }

  /**
   * Get mood for different scenarios
   */
  getMoodForScenario(scenario) {
    const moods = {
      PROLOGUE: 'mysterious',
      CHAPTER_1: 'heroic',
      CHAPTER_2: 'epic',
      CHAPTER_3: 'apocalyptic',
      EPILOGUE: 'triumphant',
      MENU: 'ambient',
      COMBAT: 'intense',
      BOSS: 'dramatic',
      VICTORY: 'celebratory',
      GAME_OVER: 'melancholic',
      KADEN: 'bold',
      ADELYNN: 'intelligent',
      WEAPON_DISCOVERY: 'exciting',
      POWER_UP: 'satisfying',
      BOSS_APPROACHING: 'foreboding'
    };
    return moods[scenario] || 'neutral';
  }

  /**
   * Get tempo for different scenarios
   */
  getTempoForScenario(scenario) {
    const tempos = {
      PROLOGUE: 120,
      CHAPTER_1: 140,
      CHAPTER_2: 160,
      CHAPTER_3: 180,
      EPILOGUE: 100,
      MENU: 80,
      COMBAT: 150,
      BOSS: 170,
      VICTORY: 120,
      GAME_OVER: 60,
      KADEN: 130,
      ADELYNN: 110,
      WEAPON_DISCOVERY: 100,
      POWER_UP: 120,
      BOSS_APPROACHING: 90
    };
    return tempos[scenario] || 120;
  }

  /**
   * Generate fallback procedural music
   */
  generateFallbackMusic(scenario) {
    return {
      url: null,
      prompt: `Fallback music for ${scenario}`,
      scenario: scenario,
      duration: 30,
      isFallback: true
    };
  }

  /**
   * Play music for specific scenario
   */
  async playMusic(scenario, fadeIn = true) {
    try {
      // Stop current music if playing
      if (this.isPlaying) {
        await this.stopMusic();
      }

      const musicData = this.musicQueue[scenario];
      if (!musicData) {
        console.warn(`No music data for scenario: ${scenario}`);
        return;
      }

      if (musicData.isFallback) {
        this.playFallbackMusic(scenario);
        return;
      }

      // Load and play the music
      const audio = new Audio(musicData.url);
      audio.loop = this.shouldLoop(scenario);
      audio.volume = 0;

      audio.addEventListener('canplaythrough', () => {
        this.currentTrack = audio;
        this.isPlaying = true;
        
        if (fadeIn) {
          this.fadeIn();
        } else {
          audio.volume = this.gainNode.gain.value;
        }
        
        audio.play();
      });

      audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.currentTrack = null;
      });

    } catch (error) {
      console.error('Error playing music:', error);
      this.playFallbackMusic(scenario);
    }
  }

  /**
   * Play fallback procedural music
   */
  playFallbackMusic(scenario) {
    if (this.currentTrack) {
      this.currentTrack.pause();
    }

    // Create procedural music based on scenario
    const frequencies = this.getFrequenciesForScenario(scenario);
    const duration = this.getDurationForScenario(scenario);
    
    this.playProceduralMusic(frequencies, duration);
  }

  /**
   * Get frequencies for procedural music
   */
  getFrequenciesForScenario(scenario) {
    const frequencySets = {
      PROLOGUE: [220, 330, 440, 554, 659],
      CHAPTER_1: [440, 554, 659, 740, 880],
      CHAPTER_2: [330, 440, 554, 659, 880, 1108],
      CHAPTER_3: [220, 330, 440, 554, 659, 740, 880, 1108],
      EPILOGUE: [440, 554, 659, 880, 1108, 1318],
      MENU: [220, 330, 440],
      COMBAT: [440, 554, 659, 740],
      BOSS: [220, 330, 440, 554, 659, 740, 880],
      VICTORY: [440, 554, 659, 880, 1108],
      GAME_OVER: [220, 330, 440],
      KADEN: [440, 554, 659, 740],
      ADELYNN: [330, 440, 554, 659],
      WEAPON_DISCOVERY: [554, 659, 740],
      POWER_UP: [659, 740],
      BOSS_APPROACHING: [220, 330, 440]
    };
    return frequencySets[scenario] || [440, 554, 659];
  }

  /**
   * Play procedural music
   */
  playProceduralMusic(frequencies, duration) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Create melody
    const noteDuration = 0.5;
    const totalNotes = Math.floor(duration / noteDuration);
    
    let currentTime = this.audioContext.currentTime;
    
    for (let i = 0; i < totalNotes; i++) {
      const frequency = frequencies[i % frequencies.length];
      const noteGain = 0.1 * (1 - i / totalNotes); // Fade out
      
      oscillator.frequency.setValueAtTime(frequency, currentTime);
      gainNode.gain.setValueAtTime(noteGain, currentTime);
      gainNode.gain.setValueAtTime(0, currentTime + noteDuration);
      
      currentTime += noteDuration;
    }
    
    oscillator.start();
    oscillator.stop(currentTime);
    
    this.currentTrack = { stop: () => oscillator.stop() };
    this.isPlaying = true;
  }

  /**
   * Check if music should loop
   */
  shouldLoop(scenario) {
    const loopScenarios = ['MENU', 'COMBAT', 'BOSS', 'PROLOGUE', 'CHAPTER_1', 'CHAPTER_2', 'CHAPTER_3'];
    return loopScenarios.includes(scenario);
  }

  /**
   * Fade in music
   */
  fadeIn() {
    if (!this.currentTrack) return;
    
    const targetVolume = this.gainNode.gain.value;
    this.currentTrack.volume = 0;
    
    const fadeInTime = this.fadeTime / 1000;
    const startTime = this.audioContext.currentTime;
    
    const fadeInInterval = setInterval(() => {
      const elapsed = (this.audioContext.currentTime - startTime) * 1000;
      const progress = Math.min(elapsed / this.fadeTime, 1);
      
      this.currentTrack.volume = targetVolume * progress;
      
      if (progress >= 1) {
        clearInterval(fadeInInterval);
      }
    }, 50);
  }

  /**
   * Fade out music
   */
  fadeOut() {
    if (!this.currentTrack) return;
    
    const startVolume = this.currentTrack.volume;
    const startTime = this.audioContext.currentTime;
    
    const fadeOutInterval = setInterval(() => {
      const elapsed = (this.audioContext.currentTime - startTime) * 1000;
      const progress = Math.min(elapsed / this.fadeTime, 1);
      
      this.currentTrack.volume = startVolume * (1 - progress);
      
      if (progress >= 1) {
        clearInterval(fadeOutInterval);
        this.stopMusic();
      }
    }, 50);
  }

  /**
   * Stop current music
   */
  async stopMusic() {
    if (this.currentTrack) {
      if (this.currentTrack.pause) {
        this.currentTrack.pause();
      } else if (this.currentTrack.stop) {
        this.currentTrack.stop();
      }
      this.currentTrack = null;
    }
    this.isPlaying = false;
  }

  /**
   * Update music based on game state
   */
  updateMusic(gameState, chapter, combatIntensity = 0, bossActive = false) {
    this.gameState = gameState;
    this.currentChapter = chapter;
    this.combatIntensity = combatIntensity;
    this.bossActive = bossActive;

    let targetScenario = this.getTargetScenario();
    
    if (targetScenario !== this.currentScenario) {
      this.currentScenario = targetScenario;
      this.playMusic(targetScenario);
    }
  }

  /**
   * Get target music scenario based on game state
   */
  getTargetScenario() {
    if (this.gameState === 'menu') return 'MENU';
    if (this.gameState === 'gameOver') return 'GAME_OVER';
    if (this.bossActive) return 'BOSS';
    if (this.combatIntensity > 0.5) return 'COMBAT';
    if (this.currentChapter) return this.currentChapter;
    return 'MENU';
  }

  /**
   * Play sound effect
   */
  playSoundEffect(effectType) {
    const soundEffects = {
      WEAPON_DISCOVERY: 'WEAPON_DISCOVERY',
      POWER_UP: 'POWER_UP',
      BOSS_APPROACHING: 'BOSS_APPROACHING',
      VICTORY: 'VICTORY',
      GAME_OVER: 'GAME_OVER'
    };

    const scenario = soundEffects[effectType];
    if (scenario) {
      this.playMusic(scenario, false);
    }
  }

  /**
   * Set volume
   */
  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
    if (this.currentTrack && this.currentTrack.volume !== undefined) {
      this.currentTrack.volume = volume;
    }
  }

  /**
   * Get current volume
   */
  getVolume() {
    return this.gainNode ? this.gainNode.gain.value : 0.5;
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.stopMusic();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Export singleton instance
export const pixelsMusicSystem = new PixelsMusicSystem();
