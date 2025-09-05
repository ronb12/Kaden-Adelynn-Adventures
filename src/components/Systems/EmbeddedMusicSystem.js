/**
 * EmbeddedMusicSystem - Hardcoded space adventure music
 * No external dependencies, works offline, perfect for kids
 */
export class EmbeddedMusicSystem {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
    this.currentTrack = null;
    this.isPlaying = false;
    this.volume = 0.5;
    this.musicData = {
      // Menu Theme - Calm and mysterious
      MENU: {
        name: "Space Station",
        tempo: 80,
        mood: "calm",
        duration: 30,
        instruments: ["synth", "pad", "bass"]
      },
      
      // Combat Music - Fast and exciting
      COMBAT: {
        name: "Space Battle",
        tempo: 140,
        mood: "intense",
        duration: 45,
        instruments: ["lead", "bass", "drums"]
      },
      
      // Boss Music - Epic and dramatic
      BOSS: {
        name: "Boss Battle",
        tempo: 160,
        mood: "epic",
        duration: 60,
        instruments: ["orchestra", "choir", "drums"]
      },
      
      // Victory Music - Triumphant
      VICTORY: {
        name: "Victory Fanfare",
        tempo: 120,
        mood: "triumphant",
        duration: 15,
        instruments: ["trumpet", "strings", "drums"]
      },
      
      // Game Over Music - Somber but hopeful
      GAME_OVER: {
        name: "Defeat Theme",
        tempo: 60,
        mood: "melancholic",
        duration: 20,
        instruments: ["strings", "piano"]
      },
      
      // Story Music - Cinematic
      PROLOGUE: {
        name: "Adventure Begins",
        tempo: 100,
        mood: "mysterious",
        duration: 40,
        instruments: ["orchestra", "synth"]
      },
      
      CHAPTER_1: {
        name: "First Mission",
        tempo: 120,
        mood: "heroic",
        duration: 50,
        instruments: ["brass", "strings", "drums"]
      },
      
      CHAPTER_2: {
        name: "Deeper Space",
        tempo: 130,
        mood: "dramatic",
        duration: 55,
        instruments: ["orchestra", "electronic"]
      },
      
      CHAPTER_3: {
        name: "Final Battle",
        tempo: 150,
        mood: "epic",
        duration: 65,
        instruments: ["full orchestra", "choir", "drums"]
      },
      
      EPILOGUE: {
        name: "New Horizons",
        tempo: 90,
        mood: "hopeful",
        duration: 35,
        instruments: ["strings", "piano", "flute"]
      }
    };
  }

  /**
   * Initialize the music system
   */
  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume;
      
      console.log('🎵 Embedded Music System initialized successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Embedded Music System:', error);
      return false;
    }
  }

  /**
   * Play music for a specific scenario
   */
  playMusic(scenario) {
    if (!this.audioContext || !this.musicData[scenario]) {
      console.warn(`No music data for scenario: ${scenario}`);
      return;
    }

    // Stop current track
    this.stopMusic();

    const musicInfo = this.musicData[scenario];
    console.log(`🎵 Playing: ${musicInfo.name} (${musicInfo.tempo} BPM)`);

    // Generate and play the music
    this.generateAndPlayMusic(musicInfo);
  }

  /**
   * Generate and play music using Web Audio API
   */
  generateAndPlayMusic(musicInfo) {
    const { tempo, mood, duration, instruments } = musicInfo;
    const bpm = tempo;
    const beatDuration = 60 / bpm;
    const durationInSeconds = duration;

    // Create oscillator nodes for different instruments
    const oscillators = [];
    const filters = [];

    // Create instruments based on mood
    if (instruments.includes('synth')) {
      const synth = this.createSynth(mood, beatDuration);
      oscillators.push(synth);
    }
    
    if (instruments.includes('bass')) {
      const bass = this.createBass(mood, beatDuration);
      oscillators.push(bass);
    }
    
    if (instruments.includes('lead')) {
      const lead = this.createLead(mood, beatDuration);
      oscillators.push(lead);
    }
    
    if (instruments.includes('pad')) {
      const pad = this.createPad(mood, beatDuration);
      oscillators.push(pad);
    }
    
    if (instruments.includes('drums')) {
      const drums = this.createDrums(mood, beatDuration);
      oscillators.push(drums);
    }

    // Connect all oscillators to gain node
    oscillators.forEach(osc => {
      if (osc) {
        osc.connect(this.gainNode);
        osc.start();
      }
    });

    // Stop after duration
    setTimeout(() => {
      this.stopMusic();
    }, durationInSeconds * 1000);

    this.isPlaying = true;
  }

  /**
   * Create synth instrument
   */
  createSynth(mood, beatDuration) {
    const oscillator = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
    filter.Q.setValueAtTime(1, this.audioContext.currentTime);
    
    oscillator.connect(filter);
    filter.connect(this.gainNode);
    
    // Add some modulation for spacey effect
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.setValueAtTime(0.5, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(50, this.audioContext.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    lfo.start();
    
    return oscillator;
  }

  /**
   * Create bass instrument
   */
  createBass(mood, beatDuration) {
    const oscillator = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(55, this.audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
    filter.Q.setValueAtTime(2, this.audioContext.currentTime);
    
    oscillator.connect(filter);
    filter.connect(this.gainNode);
    
    return oscillator;
  }

  /**
   * Create lead instrument
   */
  createLead(mood, beatDuration) {
    const oscillator = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filter.Q.setValueAtTime(5, this.audioContext.currentTime);
    
    oscillator.connect(filter);
    filter.connect(this.gainNode);
    
    return oscillator;
  }

  /**
   * Create pad instrument
   */
  createPad(mood, beatDuration) {
    const oscillator = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(330, this.audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
    filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
    
    oscillator.connect(filter);
    filter.connect(this.gainNode);
    
    return oscillator;
  }

  /**
   * Create drums
   */
  createDrums(mood, beatDuration) {
    // Simple drum pattern using noise
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.3;
    }
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);
    
    // Create drum pattern
    const playDrum = () => {
      const drumSource = this.audioContext.createBufferSource();
      drumSource.buffer = buffer;
      drumSource.connect(this.gainNode);
      drumSource.start();
    };
    
    // Simple drum pattern
    const interval = setInterval(playDrum, beatDuration * 1000);
    
    // Stop after duration
    setTimeout(() => {
      clearInterval(interval);
    }, 30000); // 30 seconds max
    
    return source;
  }

  /**
   * Stop current music
   */
  stopMusic() {
    if (this.currentTrack) {
      this.currentTrack.stop();
      this.currentTrack = null;
    }
    this.isPlaying = false;
  }

  /**
   * Set volume
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  /**
   * Play sound effect
   */
  playSoundEffect(effectType) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Different sound effects
    switch (effectType) {
      case 'WEAPON_DISCOVERY':
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
        break;
        
      case 'POWER_UP':
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
        break;
        
      case 'VICTORY':
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
        break;
        
      case 'BOSS_APPROACHING':
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
        break;
        
      case 'GAME_OVER':
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.8);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.8);
        break;
    }
  }

  /**
   * Update music based on game state
   */
  updateMusic(gameState, currentChapter, combatIntensity, bossActive) {
    if (!this.isPlaying) {
      let scenario = 'MENU';
      
      if (gameState === 'playing') {
        if (bossActive) {
          scenario = 'BOSS';
        } else if (combatIntensity > 0.5) {
          scenario = 'COMBAT';
        } else {
          scenario = currentChapter || 'CHAPTER_1';
        }
      } else if (gameState === 'menu') {
        scenario = 'MENU';
      }
      
      this.playMusic(scenario);
    }
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
export const embeddedMusicSystem = new EmbeddedMusicSystem();
