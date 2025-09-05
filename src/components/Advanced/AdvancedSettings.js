import React, { useState, useEffect } from 'react';
import './AdvancedSettings.css';

const AdvancedSettings = ({ isOpen, onClose, onSettingsChange }) => {
  const [settings, setSettings] = useState({
    // Visual Settings
    particleDensity: 'high', // low, medium, high
    visualEffects: true,
    screenShake: false,
    backgroundParallax: true,
    
    // Audio Settings
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    dynamicMusic: true,
    
    // Accessibility
    highContrast: false,
    largeText: false,
    colorBlindMode: 'none', // none, protanopia, deuteranopia, tritanopia
    screenReader: false,
    hapticFeedback: true,
    
    // Controls
    touchSensitivity: 1.5,
    autoFire: true,
    showTouchControls: true,
    
    // Performance
    targetFPS: 60,
    objectPooling: true,
    performanceMode: false,
    
    // Gameplay
    difficulty: 'medium',
    lives: 25,
    invincibilityTime: 2000,
    comboWindow: 2000,
    
    // Controller Settings
    controllerEnabled: true,
    controllerDeadzone: 0.15,
    controllerVibration: true
  });

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('advancedSettings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('advancedSettings', JSON.stringify(newSettings));
    onSettingsChange && onSettingsChange(newSettings);
    
    // Update embedded music volume if applicable
    if (key === 'musicVolume' && window.embeddedMusicSystem) {
      window.embeddedMusicSystem.setVolume(value);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      particleDensity: 'high',
      visualEffects: true,
      screenShake: false,
      backgroundParallax: true,
      masterVolume: 0.7,
      musicVolume: 0.5,
      sfxVolume: 0.8,
      dynamicMusic: true,
      highContrast: false,
      largeText: false,
      colorBlindMode: 'none',
      screenReader: false,
      hapticFeedback: true,
      touchSensitivity: 1.5,
      autoFire: true,
      showTouchControls: true,
      targetFPS: 60,
      objectPooling: true,
      performanceMode: false,
      difficulty: 'medium',
      lives: 25,
      invincibilityTime: 2000,
      comboWindow: 2000
    };
    setSettings(defaultSettings);
    localStorage.setItem('advancedSettings', JSON.stringify(defaultSettings));
    onSettingsChange && onSettingsChange(defaultSettings);
  };

  return (
    <div className={`advanced-settings-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="advanced-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Advanced Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="settings-content">
          <div className="settings-section">
            <h3>🎨 Visual Settings</h3>
            <div className="setting-group">
              <label>
                <span>Particle Density</span>
                <select 
                  value={settings.particleDensity}
                  onChange={(e) => handleSettingChange('particleDensity', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.visualEffects}
                  onChange={(e) => handleSettingChange('visualEffects', e.target.checked)}
                />
                <span>Visual Effects</span>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.screenShake}
                  onChange={(e) => handleSettingChange('screenShake', e.target.checked)}
                />
                <span>Screen Shake</span>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.backgroundParallax}
                  onChange={(e) => handleSettingChange('backgroundParallax', e.target.checked)}
                />
                <span>Background Parallax</span>
              </label>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>🔊 Audio Settings</h3>
            <div className="setting-group">
              <label>
                <span>Master Volume: {Math.round(settings.masterVolume * 100)}%</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.masterVolume}
                  onChange={(e) => handleSettingChange('masterVolume', parseFloat(e.target.value))}
                />
              </label>
              
              <label>
                <span>Music Volume: {Math.round(settings.musicVolume * 100)}%</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.musicVolume}
                  onChange={(e) => handleSettingChange('musicVolume', parseFloat(e.target.value))}
                />
              </label>
              
              <label>
                <span>SFX Volume: {Math.round(settings.sfxVolume * 100)}%</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.sfxVolume}
                  onChange={(e) => handleSettingChange('sfxVolume', parseFloat(e.target.value))}
                />
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.dynamicMusic}
                  onChange={(e) => handleSettingChange('dynamicMusic', e.target.checked)}
                />
                <span>Dynamic Music</span>
              </label>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>♿ Accessibility</h3>
            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                />
                <span>High Contrast Mode</span>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.largeText}
                  onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                />
                <span>Large Text</span>
              </label>
              
              <label>
                <span>Color Blind Mode</span>
                <select 
                  value={settings.colorBlindMode}
                  onChange={(e) => handleSettingChange('colorBlindMode', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="protanopia">Protanopia</option>
                  <option value="deuteranopia">Deuteranopia</option>
                  <option value="tritanopia">Tritanopia</option>
                </select>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.screenReader}
                  onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
                />
                <span>Screen Reader Support</span>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.hapticFeedback}
                  onChange={(e) => handleSettingChange('hapticFeedback', e.target.checked)}
                />
                <span>Haptic Feedback</span>
              </label>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>🎮 Controls</h3>
            <div className="setting-group">
              <label>
                <span>Touch Sensitivity: {settings.touchSensitivity}</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={settings.touchSensitivity}
                  onChange={(e) => handleSettingChange('touchSensitivity', parseFloat(e.target.value))}
                />
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoFire}
                  onChange={(e) => handleSettingChange('autoFire', e.target.checked)}
                />
                <span>Auto Fire (Mobile)</span>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.showTouchControls}
                  onChange={(e) => handleSettingChange('showTouchControls', e.target.checked)}
                />
                <span>Show Touch Controls</span>
              </label>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>🎮 Controller Settings</h3>
            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.controllerEnabled}
                  onChange={(e) => handleSettingChange('controllerEnabled', e.target.checked)}
                />
                <span>Enable Controller Support</span>
              </label>
              
              <label>
                <span>Controller Deadzone: {Math.round(settings.controllerDeadzone * 100)}%</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={settings.controllerDeadzone}
                  onChange={(e) => handleSettingChange('controllerDeadzone', parseFloat(e.target.value))}
                />
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.controllerVibration}
                  onChange={(e) => handleSettingChange('controllerVibration', e.target.checked)}
                />
                <span>Controller Vibration</span>
              </label>
              
              <div className="controller-info">
                <h4>Supported Controllers:</h4>
                <ul>
                  <li>🎮 Xbox Controllers (Bluetooth/Wired)</li>
                  <li>🎮 PlayStation Controllers (Bluetooth/Wired)</li>
                  <li>🎮 Nintendo Switch Pro Controller</li>
                  <li>🎮 Generic USB Controllers</li>
                </ul>
                <p><strong>Controls:</strong></p>
                <ul>
                  <li>Left Stick: Move ship</li>
                  <li>A/Cross/B: Shoot</li>
                  <li>X/Square/Y: Switch weapons</li>
                  <li>Start/Options/Plus: Pause</li>
                  <li>Triggers: Shoot (alternative)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>⚡ Performance</h3>
            <div className="setting-group">
              <label>
                <span>Target FPS: {settings.targetFPS}</span>
                <select 
                  value={settings.targetFPS}
                  onChange={(e) => handleSettingChange('targetFPS', parseInt(e.target.value))}
                >
                  <option value="30">30 FPS</option>
                  <option value="60">60 FPS</option>
                  <option value="120">120 FPS</option>
                </select>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.objectPooling}
                  onChange={(e) => handleSettingChange('objectPooling', e.target.checked)}
                />
                <span>Object Pooling</span>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={settings.performanceMode}
                  onChange={(e) => handleSettingChange('performanceMode', e.target.checked)}
                />
                <span>Performance Mode</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="settings-footer">
          <button className="reset-btn" onClick={resetToDefaults}>
            🔄 Reset to Defaults
          </button>
          <button className="close-btn" onClick={onClose}>
            ✅ Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;
