/**
 * GamepadController - Universal controller support for Bluetooth, WiFi, and wired controllers
 * Supports Xbox, PlayStation, Nintendo Switch Pro, and generic controllers
 */
export class GamepadController {
  constructor() {
    this.gamepads = new Map();
    this.connectedGamepads = new Set();
    this.buttonStates = new Map();
    this.axisStates = new Map();
    this.deadzone = 0.15; // Deadzone for analog sticks
    this.isEnabled = true;
    this.vibrationEnabled = true;
    this.autoConnect = true;
    
    // Controller mapping configurations
    this.controllerMappings = {
      // Xbox Controller (Standard)
      'xbox': {
        buttons: {
          A: 0,      // Jump/Shoot
          B: 1,      // Secondary action
          X: 2,      // Weapon switch
          Y: 3,      // Special ability
          LB: 4,     // Left bumper
          RB: 5,     // Right bumper
          LT: 6,     // Left trigger
          RT: 7,     // Right trigger
          BACK: 8,   // Pause/Menu
          START: 9,  // Start game
          LS: 10,    // Left stick press
          RS: 11     // Right stick press
        },
        axes: {
          LX: 0,     // Left stick X
          LY: 1,     // Left stick Y
          RX: 2,     // Right stick X
          RY: 3      // Right stick Y
        }
      },
      
      // PlayStation Controller (DualShock/DualSense)
      'playstation': {
        buttons: {
          CROSS: 0,    // Jump/Shoot
          CIRCLE: 1,   // Secondary action
          SQUARE: 2,   // Weapon switch
          TRIANGLE: 3, // Special ability
          L1: 4,       // Left bumper
          R1: 5,       // Right bumper
          L2: 6,       // Left trigger
          R2: 7,       // Right trigger
          SHARE: 8,    // Pause/Menu
          OPTIONS: 9,  // Start game
          L3: 10,      // Left stick press
          R3: 11       // Right stick press
        },
        axes: {
          LX: 0,       // Left stick X
          LY: 1,       // Left stick Y
          RX: 2,       // Right stick X
          RY: 3        // Right stick Y
        }
      },
      
      // Nintendo Switch Pro Controller
      'switch': {
        buttons: {
          B: 0,        // Jump/Shoot
          A: 1,        // Secondary action
          Y: 2,        // Weapon switch
          X: 3,        // Special ability
          L: 4,        // Left bumper
          R: 5,        // Right bumper
          ZL: 6,       // Left trigger
          ZR: 7,       // Right trigger
          MINUS: 8,    // Pause/Menu
          PLUS: 9,     // Start game
          LS: 10,      // Left stick press
          RS: 11       // Right stick press
        },
        axes: {
          LX: 0,       // Left stick X
          LY: 1,       // Left stick Y
          RX: 2,       // Right stick X
          RY: 3        // Right stick Y
        }
      },
      
      // Generic controller fallback
      'generic': {
        buttons: {
          A: 0,        // Primary action
          B: 1,        // Secondary action
          X: 2,        // Tertiary action
          Y: 3,        // Quaternary action
          L1: 4,       // Left bumper
          R1: 5,       // Right bumper
          L2: 6,       // Left trigger
          R2: 7,       // Right trigger
          SELECT: 8,   // Pause/Menu
          START: 9,    // Start game
          L3: 10,      // Left stick press
          R3: 11       // Right stick press
        },
        axes: {
          LX: 0,       // Left stick X
          LY: 1,       // Left stick Y
          RX: 2,       // Right stick X
          RY: 3        // Right stick Y
        }
      }
    };
    
    // Game action mappings
    this.actionMappings = {
      MOVE_LEFT: ['LX', 'DPAD_LEFT'],
      MOVE_RIGHT: ['LX', 'DPAD_RIGHT'],
      MOVE_UP: ['LY', 'DPAD_UP'],
      MOVE_DOWN: ['LY', 'DPAD_DOWN'],
      SHOOT: ['A', 'RT', 'R2', 'ZR'],
      WEAPON_SWITCH: ['X', 'Y', 'B'],
      PAUSE: ['START', 'OPTIONS', 'PLUS'],
      MENU: ['BACK', 'SHARE', 'MINUS'],
      SPECIAL: ['Y', 'TRIANGLE', 'X']
    };
    
    this.initialize();
  }

  /**
   * Initialize the gamepad controller system
   */
  initialize() {
    // Check for Gamepad API support
    if (!navigator.getGamepads) {
      console.warn('Gamepad API not supported in this browser');
      this.isEnabled = false;
      return false;
    }

    // Set up event listeners
    window.addEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
    
    // Start polling for gamepad input
    this.startPolling();
    
    console.log('🎮 GamepadController initialized successfully');
    return true;
  }

  /**
   * Handle gamepad connection
   */
  handleGamepadConnected(event) {
    const gamepad = event.gamepad;
    const gamepadId = this.getGamepadId(gamepad);
    
    this.connectedGamepads.add(gamepadId);
    this.gamepads.set(gamepadId, {
      gamepad: gamepad,
      mapping: this.detectControllerType(gamepad),
      lastUpdate: 0
    });
    
    // Initialize button and axis states
    this.buttonStates.set(gamepadId, new Array(gamepad.buttons.length).fill(false));
    this.axisStates.set(gamepadId, new Array(gamepad.axes.length).fill(0));
    
    console.log(`🎮 Controller connected: ${gamepad.id} (${gamepadId})`);
    
    // Haptic feedback for connection
    if (this.vibrationEnabled && gamepad.vibrationActuator) {
      this.vibrate(gamepadId, 0.5, 200);
    }
  }

  /**
   * Handle gamepad disconnection
   */
  handleGamepadDisconnected(event) {
    const gamepad = event.gamepad;
    const gamepadId = this.getGamepadId(gamepad);
    
    this.connectedGamepads.delete(gamepadId);
    this.gamepads.delete(gamepadId);
    this.buttonStates.delete(gamepadId);
    this.axisStates.delete(gamepadId);
    
    console.log(`🎮 Controller disconnected: ${gamepad.id} (${gamepadId})`);
  }

  /**
   * Get unique gamepad ID
   */
  getGamepadId(gamepad) {
    return `${gamepad.index}_${gamepad.id}`;
  }

  /**
   * Detect controller type based on gamepad ID
   */
  detectControllerType(gamepad) {
    const id = gamepad.id.toLowerCase();
    
    if (id.includes('xbox') || id.includes('microsoft')) {
      return 'xbox';
    } else if (id.includes('playstation') || id.includes('sony') || id.includes('dualshock') || id.includes('dualsense')) {
      return 'playstation';
    } else if (id.includes('nintendo') || id.includes('switch') || id.includes('pro controller')) {
      return 'switch';
    } else {
      return 'generic';
    }
  }

  /**
   * Start polling for gamepad input
   */
  startPolling() {
    if (!this.isEnabled) return;
    
    const pollGamepads = () => {
      this.updateGamepads();
      requestAnimationFrame(pollGamepads);
    };
    
    pollGamepads();
  }

  /**
   * Update all connected gamepads
   */
  updateGamepads() {
    const gamepads = navigator.getGamepads();
    
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        const gamepadId = this.getGamepadId(gamepad);
        this.updateGamepadState(gamepadId, gamepad);
      }
    }
  }

  /**
   * Update individual gamepad state
   */
  updateGamepadState(gamepadId, gamepad) {
    if (!this.gamepads.has(gamepadId)) return;
    
    const gamepadData = this.gamepads.get(gamepadId);
    const mapping = gamepadData.mapping;
    const buttonStates = this.buttonStates.get(gamepadId);
    const axisStates = this.axisStates.get(gamepadId);
    
    // Update button states
    for (let i = 0; i < gamepad.buttons.length; i++) {
      const button = gamepad.buttons[i];
      buttonStates[i] = button.pressed;
    }
    
    // Update axis states
    for (let i = 0; i < gamepad.axes.length; i++) {
      let value = gamepad.axes[i];
      
      // Apply deadzone
      if (Math.abs(value) < this.deadzone) {
        value = 0;
      }
      
      axisStates[i] = value;
    }
    
    gamepadData.lastUpdate = Date.now();
  }

  /**
   * Check if a button is pressed
   */
  isButtonPressed(gamepadId, buttonName) {
    if (!this.gamepads.has(gamepadId)) return false;
    
    const mapping = this.gamepads.get(gamepadId).mapping;
    const buttonStates = this.buttonStates.get(gamepadId);
    const buttonIndex = this.controllerMappings[mapping].buttons[buttonName];
    
    return buttonStates && buttonStates[buttonIndex] === true;
  }

  /**
   * Check if a button was just pressed (not held)
   */
  isButtonJustPressed(gamepadId, buttonName) {
    // This would require tracking previous frame states
    // For now, return the current state
    return this.isButtonPressed(gamepadId, buttonName);
  }

  /**
   * Get axis value
   */
  getAxisValue(gamepadId, axisName) {
    if (!this.gamepads.has(gamepadId)) return 0;
    
    const mapping = this.gamepads.get(gamepadId).mapping;
    const axisStates = this.axisStates.get(gamepadId);
    const axisIndex = this.controllerMappings[mapping].axes[axisName];
    
    return axisStates ? axisStates[axisIndex] || 0 : 0;
  }

  /**
   * Get movement input from left stick
   */
  getMovementInput(gamepadId) {
    const lx = this.getAxisValue(gamepadId, 'LX');
    const ly = this.getAxisValue(gamepadId, 'LY');
    
    return {
      x: lx,
      y: -ly, // Invert Y axis for screen coordinates
      magnitude: Math.sqrt(lx * lx + ly * ly)
    };
  }

  /**
   * Get aim input from right stick
   */
  getAimInput(gamepadId) {
    const rx = this.getAxisValue(gamepadId, 'RX');
    const ry = this.getAxisValue(gamepadId, 'RY');
    
    return {
      x: rx,
      y: -ry, // Invert Y axis for screen coordinates
      magnitude: Math.sqrt(rx * rx + ry * ry)
    };
  }

  /**
   * Check if shooting button is pressed
   */
  isShooting(gamepadId) {
    const mapping = this.gamepads.get(gamepadId).mapping;
    const shootButtons = this.actionMappings.SHOOT;
    
    for (const button of shootButtons) {
      if (this.isButtonPressed(gamepadId, button)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if weapon switch button is pressed
   */
  isWeaponSwitching(gamepadId) {
    const mapping = this.gamepads.get(gamepadId).mapping;
    const switchButtons = this.actionMappings.WEAPON_SWITCH;
    
    for (const button of switchButtons) {
      if (this.isButtonPressed(gamepadId, button)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if pause button is pressed
   */
  isPausePressed(gamepadId) {
    const mapping = this.gamepads.get(gamepadId).mapping;
    const pauseButtons = this.actionMappings.PAUSE;
    
    for (const button of pauseButtons) {
      if (this.isButtonPressed(gamepadId, button)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Vibrate controller (haptic feedback)
   */
  vibrate(gamepadId, intensity = 0.5, duration = 200) {
    if (!this.vibrationEnabled) return;
    
    const gamepadData = this.gamepads.get(gamepadId);
    if (!gamepadData || !gamepadData.gamepad.vibrationActuator) return;
    
    const gamepad = gamepadData.gamepad;
    
    // Different vibration patterns for different events
    if (gamepad.vibrationActuator.playEffect) {
      // Modern vibration API
      gamepad.vibrationActuator.playEffect('dual-rumble', {
        duration: duration,
        strongMagnitude: intensity,
        weakMagnitude: intensity * 0.5
      });
    } else if (gamepad.vibrationActuator.playEffect) {
      // Fallback vibration
      gamepad.vibrationActuator.playEffect('dual-rumble', {
        duration: duration,
        strongMagnitude: intensity,
        weakMagnitude: intensity * 0.5
      });
    }
  }

  /**
   * Get all connected gamepads
   */
  getConnectedGamepads() {
    return Array.from(this.connectedGamepads);
  }

  /**
   * Get gamepad info
   */
  getGamepadInfo(gamepadId) {
    if (!this.gamepads.has(gamepadId)) return null;
    
    const gamepadData = this.gamepads.get(gamepadId);
    return {
      id: gamepadId,
      name: gamepadData.gamepad.id,
      mapping: gamepadData.mapping,
      buttons: gamepadData.gamepad.buttons.length,
      axes: gamepadData.gamepad.axes.length,
      connected: this.connectedGamepads.has(gamepadId)
    };
  }

  /**
   * Set deadzone for analog sticks
   */
  setDeadzone(deadzone) {
    this.deadzone = Math.max(0, Math.min(1, deadzone));
  }

  /**
   * Enable/disable vibration
   */
  setVibrationEnabled(enabled) {
    this.vibrationEnabled = enabled;
  }

  /**
   * Enable/disable auto-connect
   */
  setAutoConnect(enabled) {
    this.autoConnect = enabled;
  }

  /**
   * Enable/disable the entire controller system
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Get controller status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      connectedCount: this.connectedGamepads.size,
      vibrationEnabled: this.vibrationEnabled,
      autoConnect: this.autoConnect,
      deadzone: this.deadzone
    };
  }

  /**
   * Cleanup
   */
  cleanup() {
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
    this.gamepads.clear();
    this.connectedGamepads.clear();
    this.buttonStates.clear();
    this.axisStates.clear();
  }
}

// Export singleton instance
export const gamepadController = new GamepadController();
