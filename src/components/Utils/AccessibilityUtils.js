/**
 * AccessibilityUtils - Utilities for making the game accessible
 */

/**
 * Screen reader announcements
 */
export class ScreenReaderAnnouncer {
  constructor() {
    this.announcer = this.createAnnouncer();
  }

  createAnnouncer() {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('class', 'sr-only');
    announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    document.body.appendChild(announcer);
    return announcer;
  }

  announce(message, priority = 'polite') {
    if (!message) return;
    
    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;
    
    // Clear after announcement to allow repeat announcements
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 1000);
  }

  announceScore(score) {
    this.announce(`Score: ${score} points`);
  }

  announceHealth(health, maxHealth) {
    const percentage = Math.round((health / maxHealth) * 100);
    this.announce(`Health: ${percentage}%`);
  }

  announceWeapon(weaponName) {
    this.announce(`Weapon changed to ${weaponName}`);
  }

  announcePowerUp(powerUpType) {
    this.announce(`Power-up collected: ${powerUpType}`);
  }

  announceEnemyDestroyed() {
    this.announce('Enemy destroyed');
  }

  announceGameOver(finalScore) {
    this.announce(`Game Over! Final score: ${finalScore} points`, 'assertive');
  }

  announceLevelUp(level) {
    this.announce(`Level up! Now level ${level}`, 'assertive');
  }

  cleanup() {
    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
    }
  }
}

/**
 * Keyboard navigation helper
 */
export class KeyboardNavigation {
  constructor() {
    this.focusableElements = [];
    this.currentIndex = 0;
    this.isActive = false;
  }

  activate() {
    this.isActive = true;
    this.updateFocusableElements();
    this.focusFirst();
  }

  deactivate() {
    this.isActive = false;
  }

  updateFocusableElements() {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'a[href]'
    ].join(', ');
    
    this.focusableElements = Array.from(document.querySelectorAll(selectors))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
  }

  focusFirst() {
    if (this.focusableElements.length > 0) {
      this.currentIndex = 0;
      this.focusableElements[0].focus();
    }
  }

  focusNext() {
    if (!this.isActive || this.focusableElements.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentIndex].focus();
  }

  focusPrevious() {
    if (!this.isActive || this.focusableElements.length === 0) return;
    
    this.currentIndex = this.currentIndex === 0 
      ? this.focusableElements.length - 1 
      : this.currentIndex - 1;
    this.focusableElements[this.currentIndex].focus();
  }

  handleKeyDown(event) {
    if (!this.isActive) return;

    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        if (event.shiftKey) {
          this.focusPrevious();
        } else {
          this.focusNext();
        }
        break;
      case 'Escape':
        event.preventDefault();
        // Let parent handle escape
        return false;
      default:
        return true;
    }
    return true;
  }
}

/**
 * High contrast mode helper
 */
export class HighContrastMode {
  constructor() {
    this.isEnabled = false;
    this.originalStyles = new Map();
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  enable() {
    if (this.isEnabled) return;

    this.isEnabled = true;
    document.body.classList.add('high-contrast');
    
    // Store original canvas styles and apply high contrast
    const canvas = document.querySelector('.game-canvas');
    if (canvas) {
      this.originalStyles.set('canvas-filter', canvas.style.filter || '');
      canvas.style.filter = 'contrast(200%) brightness(150%)';
    }

    // Announce the change
    const announcer = new ScreenReaderAnnouncer();
    announcer.announce('High contrast mode enabled', 'assertive');
  }

  disable() {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    document.body.classList.remove('high-contrast');

    // Restore original styles
    const canvas = document.querySelector('.game-canvas');
    if (canvas && this.originalStyles.has('canvas-filter')) {
      canvas.style.filter = this.originalStyles.get('canvas-filter');
    }

    // Announce the change
    const announcer = new ScreenReaderAnnouncer();
    announcer.announce('High contrast mode disabled', 'assertive');
  }
}

/**
 * Reduced motion helper
 */
export class ReducedMotionMode {
  constructor() {
    this.isEnabled = this.checkSystemPreference();
    this.observers = [];
  }

  checkSystemPreference() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  enable() {
    this.isEnabled = true;
    document.body.classList.add('reduced-motion');
    this.notifyObservers();
  }

  disable() {
    this.isEnabled = false;
    document.body.classList.remove('reduced-motion');
    this.notifyObservers();
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  addObserver(callback) {
    this.observers.push(callback);
  }

  removeObserver(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  notifyObservers() {
    this.observers.forEach(callback => callback(this.isEnabled));
  }

  shouldReduceMotion() {
    return this.isEnabled;
  }
}

/**
 * Color blind accessibility helper
 */
export class ColorBlindSupport {
  constructor() {
    this.patterns = {
      enemy: '▲', // Triangle for enemies
      powerup: '●', // Circle for power-ups
      bullet: '|', // Line for bullets
      player: '♦', // Diamond for player
      collectible: '★' // Star for collectibles
    };
  }

  getPatternForType(type) {
    return this.patterns[type] || '?';
  }

  addPatternOverlay(ctx, x, y, width, height, type, color = '#ffffff') {
    const pattern = this.getPatternForType(type);
    const fontSize = Math.min(width, height) * 0.6;
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pattern, x + width / 2, y + height / 2);
    ctx.restore();
  }
}

/**
 * Game state announcer for screen readers
 */
export class GameStateAnnouncer {
  constructor() {
    this.announcer = new ScreenReaderAnnouncer();
    this.lastScore = 0;
    this.lastHealth = 100;
    this.lastWeapon = '';
    this.scoreInterval = null;
    this.healthInterval = null;
  }

  startGame() {
    this.announcer.announce('Game started! Use WASD or arrow keys to move, spacebar to shoot', 'assertive');
    
    // Start periodic announcements
    this.scoreInterval = setInterval(() => {
      // Score announcements will be triggered by score changes
    }, 5000);
  }

  endGame(finalScore) {
    this.announcer.announceGameOver(finalScore);
    this.cleanup();
  }

  updateScore(newScore) {
    // Announce score milestones
    const milestones = [100, 500, 1000, 2500, 5000, 10000];
    const passedMilestone = milestones.find(milestone => 
      this.lastScore < milestone && newScore >= milestone
    );
    
    if (passedMilestone) {
      this.announcer.announce(`Score milestone reached: ${passedMilestone} points!`, 'assertive');
    }
    
    this.lastScore = newScore;
  }

  updateHealth(health, maxHealth) {
    const percentage = Math.round((health / maxHealth) * 100);
    const lastPercentage = Math.round((this.lastHealth / maxHealth) * 100);
    
    // Announce health warnings
    if (percentage <= 25 && lastPercentage > 25) {
      this.announcer.announce('Warning: Health critically low!', 'assertive');
    } else if (percentage <= 50 && lastPercentage > 50) {
      this.announcer.announce('Warning: Health below 50%', 'assertive');
    }
    
    this.lastHealth = health;
  }

  updateWeapon(weaponName) {
    if (weaponName !== this.lastWeapon) {
      this.announcer.announceWeapon(weaponName);
      this.lastWeapon = weaponName;
    }
  }

  announcePickup(type, value) {
    switch (type) {
      case 'powerup':
        this.announcer.announcePowerUp(value);
        break;
      case 'weapon':
        this.announcer.announce(`Weapon pickup: ${value}`);
        break;
      case 'health':
        this.announcer.announce('Health restored');
        break;
      case 'score':
        this.announcer.announce(`Bonus points: ${value}`);
        break;
      default:
        this.announcer.announce(`Item collected: ${type}`);
    }
  }

  announceCombo(comboCount) {
    if (comboCount >= 5) {
      this.announcer.announce(`Combo: ${comboCount} hits!`, 'assertive');
    }
  }

  cleanup() {
    if (this.scoreInterval) {
      clearInterval(this.scoreInterval);
      this.scoreInterval = null;
    }
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }
    this.announcer.cleanup();
  }
}

// Singleton instances
export const screenReader = new ScreenReaderAnnouncer();
export const keyboardNav = new KeyboardNavigation();
export const highContrast = new HighContrastMode();
export const reducedMotion = new ReducedMotionMode();
export const colorBlindSupport = new ColorBlindSupport();
export const gameStateAnnouncer = new GameStateAnnouncer();

// Utility functions
export const addAccessibilityAttributes = (element, role, label, description) => {
  if (role) element.setAttribute('role', role);
  if (label) element.setAttribute('aria-label', label);
  if (description) element.setAttribute('aria-describedby', description);
};

export const createAccessibleButton = (text, onClick, ariaLabel) => {
  const button = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', onClick);
  if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
  return button;
};

export const announceToScreenReader = (message, priority = 'polite') => {
  screenReader.announce(message, priority);
};

// Initialize accessibility features
export const initializeAccessibility = () => {
  // Add high contrast CSS if not present
  if (!document.getElementById('accessibility-styles')) {
    const style = document.createElement('style');
    style.id = 'accessibility-styles';
    style.textContent = `
      .high-contrast {
        filter: contrast(200%) brightness(150%);
      }
      
      .high-contrast .game-canvas {
        border: 3px solid #ffffff !important;
      }
      
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
      
      .focus-visible {
        outline: 3px solid #00ffff !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Set up keyboard event listeners
  document.addEventListener('keydown', (event) => {
    // Global accessibility shortcuts
    if (event.ctrlKey && event.altKey) {
      switch (event.key) {
        case 'h':
          event.preventDefault();
          highContrast.toggle();
          break;
        case 'm':
          event.preventDefault();
          reducedMotion.toggle();
          break;
      }
    }
  });
};

// Cleanup function
export const cleanupAccessibility = () => {
  screenReader.cleanup();
  gameStateAnnouncer.cleanup();
};
