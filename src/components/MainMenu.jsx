import { useState, useEffect } from 'react'
import { getCoins, addCoins } from '../utils/wallet'
import { playMenuMusic, playGameplayMusic, stopMusic } from '../utils/music'
import './MainMenu.css'

function MainMenu({ onStartGame, onOpenStore, onOpenShips, onOpenCharacters, onOpenScores, onOpenTerms, onOpenPrivacy, onOpenStats, onOpenSaveLoad, onOpenWeaponUpgrades, onOpenCustomization }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [selectedShip, setSelectedShip] = useState(() => localStorage.getItem('selectedShip') || 'kaden')
  const [selectedCharacter, setSelectedCharacter] = useState(() => localStorage.getItem('selectedCharacter') || 'kaden')
  const [showSettings, setShowSettings] = useState(false)
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || 'Player')
  const [coins, setCoins] = useState(() => getCoins())
  const [toast, setToast] = useState('')
  const [soundVolume, setSoundVolume] = useState(() => {
    const saved = localStorage.getItem('soundVolume')
    return saved ? parseInt(saved) : 100
  })
  const [musicVolume, setMusicVolume] = useState(() => {
    const saved = localStorage.getItem('musicVolume')
    return saved ? parseInt(saved) : 50
  })
  const [controllerEnabled, setControllerEnabled] = useState(() => {
    const saved = localStorage.getItem('controllerEnabled')
    return saved ? saved === 'true' : true
  })
  const [controllerDeadzone, setControllerDeadzone] = useState(() => {
    const saved = localStorage.getItem('controllerDeadzone')
    return saved ? parseFloat(saved) : 0.2
  })
  const [fullscreen, setFullscreen] = useState(false)
  const isGamepadSupported = typeof navigator !== 'undefined' && !!navigator.getGamepads

  // Daily Challenge helpers
  const getDailyIdx = () => {
    const override = localStorage.getItem('challengeOverride')
    if (override !== null) {
      const v = parseInt(override, 10)
      if (!Number.isNaN(v)) return Math.max(0, Math.min(2, v))
    }
    const daySeed = new Date().toISOString().slice(0, 10)
    const hash = Array.from(daySeed).reduce((a, c) => (((a << 5) - a) + c.charCodeAt(0)) | 0, 0)
    return Math.abs(hash) % 3
  }
  const challengeIdx = getDailyIdx()
  const challengeLabel = ['Fast Enemies', 'Low Gravity', 'Double Powerups'][challengeIdx]

  useEffect(() => {
    // Save sound volume to localStorage
    localStorage.setItem('soundVolume', soundVolume.toString())
  }, [soundVolume])

  useEffect(() => {
    // Save music volume to localStorage
    localStorage.setItem('musicVolume', musicVolume.toString())
  }, [musicVolume])

  useEffect(() => {
    localStorage.setItem('controllerEnabled', controllerEnabled ? 'true' : 'false')
  }, [controllerEnabled])

  useEffect(() => {
    localStorage.setItem('controllerDeadzone', controllerDeadzone.toString())
  }, [controllerDeadzone])

  useEffect(() => {
    // Start menu music
    playMenuMusic()
    
    // Also ensure it starts on first user interaction
    const startMenuMusic = () => {
      playMenuMusic()
    }
    
    // Listen for first interaction to ensure music starts
    const events = ['click', 'touchstart', 'keydown']
    events.forEach(event => {
      window.addEventListener(event, startMenuMusic, { once: true })
    })
    
    return () => {
      stopMusic()
      events.forEach(event => {
        window.removeEventListener(event, startMenuMusic)
      })
    }
  }, [])

  const handleStart = () => {
    stopMusic()
    // start gameplay music on user gesture
    playGameplayMusic()
    localStorage.setItem('playerName', playerName)
    onStartGame(selectedDifficulty, selectedShip, selectedCharacter, playerName)
  }

  const handleFullscreen = (e) => {
    const isFullscreen = e.target.checked
    setFullscreen(isFullscreen)

    if (isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }


  return (
    <div className="main-menu">
      <div className="menu-container glass">
        <h1 className="game-title">
          <span className="title-emoji">🌟</span>
          <span className="title-text">
            <span className="title-line-1">Kaden & Adelynn</span>
          <br />
            <span className="title-line-2">
              <span className="title-emoji-inline">🌌</span>
              Space Adventures
              <span className="title-emoji-inline">🌌</span>
            </span>
          </span>
        </h1>
        <div className="menu-topbar">
          <p className="game-subtitle">
            <span className="subtitle-icon">⚡</span>
            <span className="subtitle-text">Epic Space Shooter</span>
            <span className="subtitle-icon">⚡</span>
          </p>
          <div className="wallet-container">
            <div className="wallet-label">Your Coins</div>
          <div className="wallet">
              <div className="coin-badge">
                <span className="coin-icon">💰</span>
                <span className="coin-amount">{coins.toLocaleString()}</span>
              </div>
            <button
                className="coin-add-button"
              onClick={() => {
                addCoins(100)
                setCoins(getCoins())
              }}
                title="Earn coins by playing! Defeat enemies and complete waves to collect coins."
            >
                <span className="coin-add-icon">+</span>
                <span className="coin-add-amount">100</span>
            </button>
            </div>
            <div className="wallet-hint">
              💡 Earn coins by playing • Spend in the Store
            </div>
            <div className="wallet-storage-info">
              <small>💾 Coins are saved locally on this device/browser</small>
            </div>
          </div>
        </div>

        <div className="currency-disclaimer">
          <span className="disclaimer-icon">ℹ️</span>
          <span className="disclaimer-text">In-game currency only • No real money required</span>
        </div>

        <div className="button-row centered">
          <button className="settings-button compact" onClick={onOpenStore}>
            <span className="cart-icon">🛒</span> Open Store
          </button>
          <button className="settings-button compact" onClick={onOpenShips}>
            <span className="ship-icon">🚀</span> Choose Ship
          </button>
          <button className="settings-button compact" onClick={onOpenCharacters}>
            <span className="character-icon">🧑‍🚀</span> Choose Character
          </button>
          <button className="settings-button compact" onClick={onOpenScores}>
            <span className="trophy-icon">🏆</span> Top Scores
          </button>
        </div>

        <div className="button-row centered">
          <button className="settings-button compact smaller" onClick={onOpenStats}>
            <span className="stats-icon">📊</span> Statistics
          </button>
          <button className="settings-button compact smaller" onClick={onOpenSaveLoad}>
            <span className="save-icon">💾</span> Save/Load
          </button>
          <button className="settings-button compact smaller" onClick={onOpenWeaponUpgrades}>
            <span className="upgrade-icon">⚔️</span> Upgrades
          </button>
          <button className="settings-button compact smaller" onClick={onOpenCustomization}>
            <span className="custom-icon">🎨</span> Customize
          </button>
        </div>

        <div className="menu-section">
          <h3>🗓️ Daily Challenge</h3>
          <div className="daily-challenge-container">
            <div className="challenge-active">
              <span className="challenge-label">Active:</span>
              <span className="challenge-name">{challengeLabel}</span>
            </div>
            <div className="challenge-description">
              {challengeIdx === 0 && '⚡ Enemies spawn 20% faster and move 20% faster'}
              {challengeIdx === 1 && '🌌 Reduced gravity affects enemy movement patterns'}
              {challengeIdx === 2 && '✨ Powerups spawn at double the normal rate'}
            </div>
            <div className="challenge-controls">
            <button
              className="settings-button small"
              onClick={() => {
                const next = (challengeIdx + 1) % 3
                localStorage.setItem('challengeOverride', String(next))
                setToast('Daily Challenge cycled')
                setTimeout(() => setToast(''), 1200)
              }}
            >
              Cycle
            </button>
            <button
              className="settings-button small"
              onClick={() => {
                localStorage.removeItem('challengeOverride')
                setToast('Daily Challenge reset')
                setTimeout(() => setToast(''), 1200)
              }}
            >
              Reset
            </button>
            </div>
            <div className="challenge-info">
              <small>3 Daily Challenges rotate automatically each day</small>
            </div>
          </div>
        </div>

        <div className="menu-section">
          <h3>Difficulty</h3>
          <div className="difficulty-selector">
            <button
              className={`diff-btn ${selectedDifficulty === 'easy' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty('easy')}
            >
              🟢 Easy
            </button>
            <button
              className={`diff-btn ${selectedDifficulty === 'medium' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty('medium')}
            >
              🟡 Medium
            </button>
            <button
              className={`diff-btn ${selectedDifficulty === 'hard' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty('hard')}
            >
              🔴 Hard
            </button>
          </div>
        </div>

        <button className="start-button" onClick={handleStart}>
          🎮 Start Game
        </button>

        <div className="button-row">
          <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>
            ⚙️ Settings
          </button>
        </div>

        {showSettings && (
          <div className="settings-panel">
            <h4>⚙️ Game Settings</h4>
            <div className="settings-content">
              <div className="setting-item">
                <label>Sound Effects: {soundVolume}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseInt(e.target.value))}
                />
              </div>
              <div className="setting-item">
                <label>Music: {musicVolume}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                />
              </div>
              <div className="setting-item">
                <label>Fullscreen</label>
                <input type="checkbox" checked={fullscreen} onChange={handleFullscreen} />
              </div>
              <div className="setting-item">
                <label style={{ fontWeight: 700 }}>🎮 Game Controller</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={controllerEnabled}
                    onChange={(e) => setControllerEnabled(e.target.checked)}
                    disabled={!isGamepadSupported}
                  />
                  Enable Handheld Game Controllers
                </label>
                {!isGamepadSupported && (
                  <small style={{ color: 'rgba(255,255,255,0.75)' }}>
                    Gamepad not detected in this browser/device.
                  </small>
                )}
                <label>Controller Deadzone: {controllerDeadzone.toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={controllerDeadzone}
                  onChange={(e) => setControllerDeadzone(parseFloat(e.target.value))}
                />
                <small style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Left stick/D‑pad move • A/RT shoot • Start pause
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Player name input */}
        <div className="menu-section">
          <h3>🎮 Create Your Gamer Tag</h3>
          <div className="player-name-safety-notice">
            <span className="safety-icon">🛡️</span>
            <span className="safety-text">
              <strong>For Your Safety:</strong> Use a gamer tag only. Do not use your real name.
            </span>
          </div>
          <div className="player-name-container">
            <div className="player-name-input-wrapper">
              <span className="player-name-icon">🎮</span>
            <input
                className="player-name-input"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value)
              }}
                placeholder="Create your gamer tag..."
                maxLength={20}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    try {
                      localStorage.setItem('playerName', playerName)
                      setToast('Gamer tag saved')
                      setTimeout(() => setToast(''), 1200)
                    } catch (_) {}
                  }
                }}
              />
            </div>
            <button
              className="settings-button small player-name-save"
              onClick={() => {
                try {
                  localStorage.setItem('playerName', playerName)
                  setToast('Gamer tag saved')
                  setTimeout(() => setToast(''), 1200)
                } catch (_) {}
              }}
            >
              💾 Save
            </button>
          </div>
          <div className="player-name-hint">
            <small>💡 Create a unique gamer tag! Examples: "SpaceWarrior", "StarHunter", "CosmicPilot"</small>
          </div>
          <div className="player-name-privacy">
            <small>🔒 Your gamer tag appears on the global leaderboard. Keep it fun and safe!</small>
          </div>
              </div>


        <div className="game-features">
          <h4>🌟 Key Features</h4>
          <ul>
            <li>25 Lives System</li>
            <li>15+ Weapon Types</li>
            <li>Boss Battles</li>
            <li>Achievements</li>
            <li>Combo System</li>
            <li>Power-ups and Upgrades</li>
            <li>Ship and Character Unlocks</li>
            <li>Store with Coin Economy</li>
          </ul>
        </div>

        <div className="menu-footer">
          <div className="footer-buttons">
            <button className="settings-button compact footer-button" onClick={onOpenTerms}>
              📜 Terms of Service
            </button>
            <button className="settings-button compact footer-button" onClick={onOpenPrivacy}>
              🔒 Privacy Policy
            </button>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Bradley Virtual Solutions, LLC. All rights reserved.
        </div>
      </div>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 12,
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
            zIndex: 1100,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

export default MainMenu
