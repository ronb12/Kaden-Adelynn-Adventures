/**
 * AudioSystem - Centralized audio management with proper cleanup
 */
import { GAME_CONFIG } from '../../constants/GameConstants.js';

class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.backgroundMusicOscillators = null;
    this.isMusicPlaying = false;
    this.isInitialized = false;
    this.masterVolume = 1.0;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
  }

  /**
   * Initialize audio context with error handling
   * @returns {AudioContext|null} Initialized audio context
   */
  init() {
    if (this.isInitialized && this.audioContext) {
      return this.audioContext;
    }

    try {
      // Check if AudioContext is available
      if (!window.AudioContext && !window.webkitAudioContext) {
        console.warn('AudioContext not supported');
        return null;
      }
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Handle audio context state
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(err => {
          console.warn('Failed to resume audio context:', err);
        });
      }
      
      this.isInitialized = true;
      return this.audioContext;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      return null;
    }
  }

  /**
   * Start layered background music
   */
  startBackgroundMusic() {
    try {
      const ctx = this.init();
      if (!ctx || this.isMusicPlaying) return;
      
      const layers = [];
      
      // Create music layers from configuration
      GAME_CONFIG.AUDIO.BACKGROUND_MUSIC.LAYERS.forEach(layerConfig => {
        const layer = this.createMusicLayer(
          ctx,
          layerConfig.frequency,
          layerConfig.type,
          layerConfig.volume * this.musicVolume,
          layerConfig.detune
        );
        layers.push(layer);
      });
      
      // Start all layers
      layers.forEach(layer => {
        layer.oscillator.start(ctx.currentTime);
      });
      
      // Start melody after delay
      setTimeout(() => this.playMelody(ctx), 2000);
      
      this.isMusicPlaying = true;
      this.backgroundMusicOscillators = layers;
      
    } catch (error) {
      console.warn('Background music failed:', error);
    }
  }

  /**
   * Create a music layer
   * @param {AudioContext} ctx - Audio context
   * @param {number} frequency - Oscillator frequency
   * @param {string} type - Oscillator type
   * @param {number} volume - Layer volume
   * @param {number} detune - Detune amount
   * @returns {Object} Layer object with oscillator and gain node
   */
  createMusicLayer(ctx, frequency, type, volume, detune = 0) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;
    oscillator.detune.setValueAtTime(detune, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);
    
    return { oscillator, gainNode };
  }

  /**
   * Play melody pattern
   * @param {AudioContext} ctx - Audio context
   */
  playMelody(ctx) {
    if (!this.isMusicPlaying) return;
    
    const melody = GAME_CONFIG.AUDIO.BACKGROUND_MUSIC.MELODY_NOTES;
    let noteIndex = 0;
    
    const playNote = () => {
      if (!this.isMusicPlaying) return;
      
      const note = melody[noteIndex % melody.length];
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(note, ctx.currentTime);
      oscillator.type = 'triangle';
      
      const volume = 0.03 * this.musicVolume;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + GAME_CONFIG.AUDIO.BACKGROUND_MUSIC.MELODY_NOTE_DURATION);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + GAME_CONFIG.AUDIO.BACKGROUND_MUSIC.MELODY_NOTE_DURATION);
      
      noteIndex++;
      setTimeout(playNote, GAME_CONFIG.AUDIO.BACKGROUND_MUSIC.MELODY_INTERVAL);
    };
    
    playNote();
  }

  /**
   * Stop background music and clean up
   */
  stopBackgroundMusic() {
    try {
      if (this.backgroundMusicOscillators) {
        this.backgroundMusicOscillators.forEach(layer => {
          try {
            layer.oscillator.stop();
          } catch (e) {
            // Oscillator might already be stopped
          }
        });
        this.backgroundMusicOscillators = null;
      }
      this.isMusicPlaying = false;
    } catch (error) {
      console.warn('Failed to stop background music:', error);
    }
  }

  /**
   * Play a sound effect
   * @param {number} frequency - Sound frequency
   * @param {number} duration - Sound duration
   * @param {string} type - Oscillator type
   * @param {number} volume - Sound volume
   */
  playSound(frequency, duration, type = 'sine', volume = 0.1) {
    try {
      const ctx = this.init();
      if (!ctx) return;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = type;
      
      const adjustedVolume = volume * this.sfxVolume * this.masterVolume;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(adjustedVolume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  // Predefined sound effects
  playShootSound() {
    this.playSound(800, 0.1, 'square', GAME_CONFIG.AUDIO.VOLUME.SHOOT);
  }

  playExplosionSound() {
    this.playSound(150, 0.3, 'sawtooth', GAME_CONFIG.AUDIO.VOLUME.EXPLOSION);
  }

  playPowerUpSound() {
    this.playSound(600, 0.2, 'sine', GAME_CONFIG.AUDIO.VOLUME.POWER_UP);
  }

  playGameOverSound() {
    this.playSound(200, 0.5, 'triangle', GAME_CONFIG.AUDIO.VOLUME.GAME_OVER);
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0-1)
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set music volume
   * @param {number} volume - Volume level (0-1)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set sound effects volume
   * @param {number} volume - Volume level (0-1)
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current volume levels
   * @returns {Object} Volume levels
   */
  getVolumeLevels() {
    return {
      master: this.masterVolume,
      music: this.musicVolume,
      sfx: this.sfxVolume
    };
  }

  /**
   * Clean up audio resources
   */
  cleanup() {
    this.stopBackgroundMusic();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(err => {
        console.warn('Failed to close audio context:', err);
      });
    }
    
    this.audioContext = null;
    this.isInitialized = false;
  }

  /**
   * Get audio system status
   * @returns {Object} Audio system status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isMusicPlaying: this.isMusicPlaying,
      contextState: this.audioContext ? this.audioContext.state : 'not initialized',
      volumes: this.getVolumeLevels()
    };
  }
}

// Export singleton instance
export const audioSystem = new AudioSystem();

// Legacy compatibility exports
export const initAudio = () => audioSystem.init();
export const startBackgroundMusic = () => audioSystem.startBackgroundMusic();
export const stopBackgroundMusic = () => audioSystem.stopBackgroundMusic();
export const playSound = (freq, dur, type, vol) => audioSystem.playSound(freq, dur, type, vol);
export const playShootSound = () => audioSystem.playShootSound();
export const playExplosionSound = () => audioSystem.playExplosionSound();
export const playPowerUpSound = () => audioSystem.playPowerUpSound();
export const playGameOverSound = () => audioSystem.playGameOverSound();
