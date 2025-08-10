class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.7;
        this.init();
    }

    init() {
        // Create audio context for better sound control
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported, using fallback');
            this.audioContext = null;
        }

        // Pre-load sound effects
        this.loadSounds();
    }

    loadSounds() {
        // Missile launch sound
        this.createMissileSound();
        
        // Explosion sound
        this.createExplosionSound();
        
        // Collectible sounds
        this.createCollectibleSound();
        this.createPowerupSound();
        this.createMoneySound();
        
        // Game sounds
        this.createGameOverSound();
        this.createLevelUpSound();
    }

    createMissileSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        this.sounds.missile = { oscillator, gainNode, duration: 0.1 };
    }

    createExplosionSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        this.sounds.explosion = { oscillator, gainNode, filter, duration: 0.3 };
    }

    createCollectibleSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        this.sounds.collectible = { oscillator, gainNode, duration: 0.1 };
    }

    createPowerupSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        this.sounds.powerup = { oscillator, gainNode, duration: 0.15 };
    }

    createMoneySound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1500, this.audioContext.currentTime + 0.08);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
        
        this.sounds.money = { oscillator, gainNode, duration: 0.08 };
    }

    createGameOverSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        this.sounds.gameOver = { oscillator, gainNode, duration: 0.5 };
    }

    createLevelUpSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        this.sounds.levelUp = { oscillator, gainNode, duration: 0.2 };
    }

    playSound(soundName) {
        if (!this.enabled || !this.audioContext || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName];
        
        // Reset audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Create new instances for overlapping sounds
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Copy sound properties
        if (sound.filter) {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = sound.filter.type;
            filter.frequency.setValueAtTime(sound.filter.frequency.value, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(sound.filter.frequency.value * 0.1, this.audioContext.currentTime + sound.duration);
            
            oscillator.connect(filter);
            filter.connect(gainNode);
        } else {
            oscillator.connect(gainNode);
        }
        
        gainNode.connect(this.audioContext.destination);
        
        // Set frequency and gain
        oscillator.frequency.setValueAtTime(sound.oscillator.frequency.value, this.audioContext.currentTime);
        if (sound.oscillator.frequency.exponentialRampToValueAtTime) {
            oscillator.frequency.exponentialRampToValueAtTime(sound.oscillator.frequency.value * 0.5, this.audioContext.currentTime + sound.duration);
        }
        
        gainNode.gain.setValueAtTime(sound.gainNode.gain.value * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        // Start and stop
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    }

    playMissile() {
        this.playSound('missile');
    }

    playExplosion() {
        this.playSound('explosion');
    }

    playCollectible() {
        this.playSound('collectible');
    }

    playPowerup() {
        this.playSound('powerup');
    }

    playMoney() {
        this.playSound('money');
    }

    playGameOver() {
        this.playSound('gameOver');
    }

    playLevelUp() {
        this.playSound('levelUp');
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled && this.audioContext) {
            this.audioContext.suspend();
        } else if (this.enabled && this.audioContext) {
            this.audioContext.resume();
        }
    }

    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}


