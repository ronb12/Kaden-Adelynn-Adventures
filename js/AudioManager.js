class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        this.volume = 0.7;
        this.musicVolume = 0.5;
        
        // Sound effect definitions
        this.soundEffects = {
            shoot: { src: 'assets/sounds/shoot.wav', volume: 0.3 },
            explosion: { src: 'assets/sounds/explosion.wav', volume: 0.4 },
            powerup: { src: 'assets/sounds/powerup.wav', volume: 0.5 },
            enemyHit: { src: 'assets/sounds/enemy_hit.wav', volume: 0.3 },
            playerHit: { src: 'assets/sounds/player_hit.wav', volume: 0.4 },
            levelUp: { src: 'assets/sounds/level_up.wav', volume: 0.6 },
            gameOver: { src: 'assets/sounds/game_over.wav', volume: 0.5 }
        };
        
        this.loadSounds();
    }

    loadSounds() {
        // Load sound effects
        Object.keys(this.soundEffects).forEach(soundName => {
            const soundEffect = this.soundEffects[soundName];
            const audio = new Audio();
            audio.src = soundEffect.src;
            audio.volume = soundEffect.volume * this.volume;
            audio.preload = 'auto';
            
            // Handle loading errors gracefully
            audio.addEventListener('error', () => {
                console.log(`Failed to load sound: ${soundEffect.src}`);
            });
            
            this.sounds[soundName] = audio;
        });

        // Load background music
        this.music = new Audio();
        this.music.src = 'assets/sounds/background_music.mp3';
        this.music.volume = this.musicVolume;
        this.music.loop = true;
        this.music.preload = 'auto';
        
        this.music.addEventListener('error', () => {
            console.log('Failed to load background music');
        });
    }

    playSound(soundName) {
        if (this.isMuted) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            // Clone the audio to allow overlapping sounds
            const soundClone = sound.cloneNode();
            soundClone.volume = sound.volume * this.volume;
            soundClone.play().catch(error => {
                console.log(`Failed to play sound ${soundName}:`, error);
            });
        }
    }

    playMusic() {
        if (this.isMuted || !this.music) return;
        
        this.music.volume = this.musicVolume * this.volume;
        this.music.play().catch(error => {
            console.log('Failed to play background music:', error);
        });
    }

    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }

    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
    }

    resumeMusic() {
        if (this.music && !this.isMuted) {
            this.music.play().catch(error => {
                console.log('Failed to resume background music:', error);
            });
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update all sound volumes
        Object.values(this.sounds).forEach(sound => {
            const soundName = Object.keys(this.sounds).find(key => this.sounds[key] === sound);
            const originalVolume = this.soundEffects[soundName]?.volume || 0.5;
            sound.volume = originalVolume * this.volume;
        });
        
        // Update music volume
        if (this.music) {
            this.music.volume = this.musicVolume * this.volume;
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume * this.volume;
        }
    }

    mute() {
        this.isMuted = true;
        this.pauseMusic();
    }

    unmute() {
        this.isMuted = false;
        this.resumeMusic();
    }

    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    // Game-specific sound methods
    playShoot() {
        this.playSound('shoot');
    }

    playExplosion() {
        this.playSound('explosion');
    }

    playPowerup() {
        this.playSound('powerup');
    }

    playEnemyHit() {
        this.playSound('enemyHit');
    }

    playPlayerHit() {
        this.playSound('playerHit');
    }

    playLevelUp() {
        this.playSound('levelUp');
    }

    playGameOver() {
        this.playSound('gameOver');
    }

    // Initialize audio context (required for some browsers)
    initAudioContext() {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                const audioContext = new AudioContextClass();
                
                // Resume audio context on user interaction
                const resumeAudio = () => {
                    if (audioContext.state === 'suspended') {
                        audioContext.resume();
                    }
                    document.removeEventListener('click', resumeAudio);
                    document.removeEventListener('keydown', resumeAudio);
                };
                
                document.addEventListener('click', resumeAudio);
                document.addEventListener('keydown', resumeAudio);
                
                console.log('Audio context initialized');
            } catch (error) {
                console.log('Failed to initialize audio context:', error);
            }
        }
    }

    // Get audio status
    getAudioStatus() {
        return {
            isMuted: this.isMuted,
            volume: this.volume,
            musicVolume: this.musicVolume,
            soundsLoaded: Object.keys(this.sounds).length,
            musicLoaded: this.music !== null
        };
    }
} 