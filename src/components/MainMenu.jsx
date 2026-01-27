import { useState, useEffect, useRef } from 'react'
import { getCoins } from '../utils/wallet'
import { playMenuMusic, playGameplayMusic, stopMenuMusic, forceUserGesture } from '../utils/music'
import './MainMenu.css'

function MainMenu({ onStartGame, onOpenShips, onOpenCharacters, onOpenScores, onOpenTerms, onOpenPrivacy, onOpenStats, onOpenSaveLoad, onOpenWeaponUpgrades, onOpenCustomization, onOpenStoryMode, onOpenDailyVault, onOpenChallengeLadder, onOpenSeasonTrack, onOpenMissions, onOpenLeagues }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [selectedShip, setSelectedShip] = useState(() => localStorage.getItem('selectedShip') || 'kaden')
  const [selectedCharacter, setSelectedCharacter] = useState(() => localStorage.getItem('selectedCharacter') || 'kaden')
  const [showSettings, setShowSettings] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [showFeatures, setShowFeatures] = useState(false)
  const dropdownRef = useRef(null)
  const legalRef = useRef(null)
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
    const close = (e) => {
      const inMain = dropdownRef.current?.contains(e.target)
      const inLegal = legalRef.current?.contains(e.target)
      if (!inMain && !inLegal) setOpenDropdown(null)
    }
    if (openDropdown) {
      document.addEventListener('click', close, true)
      return () => document.removeEventListener('click', close, true)
    }
  }, [openDropdown])

  useEffect(() => {
    // Try to start menu music immediately
    console.log('MainMenu mounted - starting menu music')
    playMenuMusic()

    // Ensure audio unlocks and menu music starts on first interaction
    const startMenuMusic = () => {
      console.log('User interaction detected - unlocking audio and starting menu music')
      forceUserGesture()
      playMenuMusic()
    }

    const events = ['click', 'touchstart', 'keydown', 'touchend', 'mousedown']
    events.forEach(event => {
      document.addEventListener(event, startMenuMusic, { once: true, capture: true })
    })

    return () => {
      console.log('MainMenu unmounting - stopping menu music')
      // Only stop if menu is currently playing to avoid interrupting gameplay start
      stopMenuMusic()
      events.forEach(event => {
        document.removeEventListener(event, startMenuMusic, { capture: true })
      })
    }
  }, [])

  const handleStart = () => {
    // Stop menu music only; avoid interrupting the new track's play()
    stopMenuMusic()
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
        <div className="menu-app-icon">
          <img src="/app-icon-ios.png" alt="Kaden & Adelynn Space Adventures" />
        </div>
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
            <div className="wallet-label">Your Stars</div>
          <div className="wallet">
              <div className="coin-badge">
                <span className="coin-icon">⭐</span>
                <span className="coin-amount">{coins.toLocaleString()}</span>
              </div>
            </div>
            <div className="wallet-hint">
              💡 Earn stars by playing • Spend in the Store
            </div>
            <div className="wallet-storage-info">
              <small>💾 Stars are saved locally on this device/browser</small>
            </div>
          </div>
        </div>

        <div className="currency-disclaimer">
          <span className="disclaimer-icon">ℹ️</span>
          <span className="disclaimer-text">In-game stars only • No real money required</span>
        </div>

        <div className="button-row centered">
          <button className="start-button featured" onClick={onOpenStoryMode} style={{ background: 'linear-gradient(135deg, #00d4ff, #0066ff)', fontSize: '1.2em', padding: '16px 32px' }}>
            <span className="story-icon">📖</span> Story Mode
          </button>
        </div>

        <div className="button-row centered">
          <button className="start-button" onClick={handleStart} style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)', fontSize: '1.1em' }}>
            <span className="play-icon">⚡</span> Quick Play
          </button>
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

        <div className="menu-dropdowns" ref={dropdownRef}>
          <div className="menu-dropdown-wrap">
            <button
              className={`menu-dropdown-trigger ${openDropdown === 'customize' ? 'open' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'customize' ? null : 'customize')}
            >
              🎨 Customize <span className="dropdown-chevron">▾</span>
            </button>
            {openDropdown === 'customize' && (
              <div className="menu-dropdown-panel">
                <button className="menu-dropdown-item" onClick={() => { onOpenShips(); setOpenDropdown(null); }}>🚀 Choose Ship</button>
                <button className="menu-dropdown-item" onClick={() => { onOpenCharacters(); setOpenDropdown(null); }}>🧑‍🚀 Choose Character</button>
                <button className="menu-dropdown-item" onClick={() => { onOpenWeaponUpgrades(); setOpenDropdown(null); }}>⚔️ Upgrades</button>
                <button className="menu-dropdown-item" onClick={() => { onOpenCustomization(); setOpenDropdown(null); }}>🎨 Customize</button>
              </div>
            )}
          </div>
          <div className="menu-dropdown-wrap">
            <button
              className={`menu-dropdown-trigger ${openDropdown === 'progress' ? 'open' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'progress' ? null : 'progress')}
            >
              📊 Progress <span className="dropdown-chevron">▾</span>
            </button>
            {openDropdown === 'progress' && (
              <div className="menu-dropdown-panel">
                <button className="menu-dropdown-item" onClick={() => { onOpenScores(); setOpenDropdown(null); }}>🏆 Top Scores</button>
                <button className="menu-dropdown-item" onClick={() => { onOpenStats(); setOpenDropdown(null); }}>📊 Statistics</button>
                <button className="menu-dropdown-item" onClick={() => { onOpenSaveLoad(); setOpenDropdown(null); }}>💾 Save/Load</button>
                <button className="menu-dropdown-item" onClick={() => { onOpenMissions(); setOpenDropdown(null); }}>🎯 Missions</button>
              </div>
            )}
          </div>
          <div className="menu-dropdown-wrap">
            <button
              className={`menu-dropdown-trigger ${openDropdown === 'challenges' ? 'open' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'challenges' ? null : 'challenges')}
            >
              🏁 Challenges <span className="dropdown-chevron">▾</span>
            </button>
            {openDropdown === 'challenges' && (
              <div className="menu-dropdown-panel">
                <button className="menu-dropdown-item" onClick={() => { onOpenDailyVault(); setOpenDropdown(null); }}>🗓️ Daily Vault</button>
                <button className="menu-dropdown-item" onClick={() => { onOpenChallengeLadder(); setOpenDropdown(null); }}>🏁 Challenge Ladder</button>
                <button className="menu-dropdown-item" onClick={() => { onOpenSeasonTrack(); setOpenDropdown(null); }}>📅 Season Track</button>
                <button className="menu-dropdown-item" onClick={() => { onOpenLeagues(); setOpenDropdown(null); }}>🏆 Leagues</button>
                <div className="menu-dropdown-daily">
                  <span className="daily-label">Today: {challengeLabel}</span>
                  <div className="daily-actions">
                    <button type="button" className="menu-dropdown-item small" onClick={() => { const next = (challengeIdx + 1) % 3; localStorage.setItem('challengeOverride', String(next)); setToast('Challenge cycled'); setTimeout(() => setToast(''), 1200); }}>Cycle</button>
                    <button type="button" className="menu-dropdown-item small" onClick={() => { localStorage.removeItem('challengeOverride'); setToast('Challenge reset'); setTimeout(() => setToast(''), 1200); }}>Reset</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="button-row">
          <button className="settings-button" onClick={() => { setShowSettings(!showSettings); setOpenDropdown(null); }}>
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
          <button type="button" className="game-features-toggle" onClick={() => setShowFeatures(!showFeatures)}>
            🌟 Key Features <span className="dropdown-chevron">{showFeatures ? '▴' : '▾'}</span>
          </button>
          {showFeatures && (
            <ul className="game-features-list">
              <li>25 Lives System</li>
              <li>15+ Weapon Types</li>
              <li>Boss Battles</li>
              <li>Achievements</li>
              <li>Combo System</li>
              <li>Power-ups and Upgrades</li>
              <li>Ship and Character Unlocks</li>
              <li>Store with Star Economy</li>
            </ul>
          )}
        </div>

        <div className="menu-footer">
          <div className="footer-buttons" ref={legalRef}>
            <div className="menu-dropdown-wrap footer-dropdown">
              <button
                type="button"
                className={`menu-dropdown-trigger footer-trigger ${openDropdown === 'legal' ? 'open' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'legal' ? null : 'legal')}
              >
                📜 Legal <span className="dropdown-chevron">▾</span>
              </button>
              {openDropdown === 'legal' && (
                <div className="menu-dropdown-panel footer-panel">
                  <button type="button" className="menu-dropdown-item" onClick={() => { onOpenTerms(); setOpenDropdown(null); }}>Terms of Service</button>
                  <button type="button" className="menu-dropdown-item" onClick={() => { onOpenPrivacy(); setOpenDropdown(null); }}>Privacy Policy</button>
                </div>
              )}
            </div>
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
