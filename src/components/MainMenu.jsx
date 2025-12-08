import { useState, useEffect, useRef, useCallback } from 'react'
import { getCoins, spendCoins, addCoins, getOwned, ownItem, ensureWalletSchema } from '../utils/wallet'
import { getHighScores, getMergedTopScores } from '../utils/scoreTracking'
import { playMenuMusic, playGameplayMusic, stopMusic } from '../utils/music'
import './MainMenu.css'
import { storageGet, storageSet, storageRemove } from '../utils/storage'

function MainMenu({ onStartGame }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [selectedShip, setSelectedShip] = useState('kaden')
  const [selectedCharacter, setSelectedCharacter] = useState('kaden')
  const [showSettings, setShowSettings] = useState(false)
  const [showStore, setShowStore] = useState(false)
  const [showShips, setShowShips] = useState(false)
  const [showCharacters, setShowCharacters] = useState(false)
  const [showScores, setShowScores] = useState(false)
  const [playerName, setPlayerName] = useState(() => storageGet('playerName', 'Player'))
  const [coins, setCoins] = useState(() => getCoins())
  const [toast, setToast] = useState('')
  const [ownedShips, setOwnedShips] = useState(() => getOwned('ownedShips'))
  const [ownedChars, setOwnedChars] = useState(() => getOwned('ownedChars'))
  const [soundVolume, setSoundVolume] = useState(() => {
    const saved = storageGet('soundVolume')
    return saved ? parseInt(saved, 10) : 100
  })
  const [musicVolume, setMusicVolume] = useState(() => {
    const saved = storageGet('musicVolume')
    return saved ? parseInt(saved, 10) : 50
  })
  const [controllerEnabled, setControllerEnabled] = useState(() => {
    const saved = storageGet('controllerEnabled')
    return saved ? saved === 'true' : true
  })
  const [controllerDeadzone, setControllerDeadzone] = useState(() => {
    const saved = storageGet('controllerDeadzone')
    return saved ? parseFloat(saved) : 0.2
  })
  const [fullscreen, setFullscreen] = useState(false)
  const [localScores, setLocalScores] = useState(() => getHighScores())
  const [cloudScores, setCloudScores] = useState([])
  const [cloudError, setCloudError] = useState('')
  const [loadingCloudScores, setLoadingCloudScores] = useState(false)
  const [bestScore, setBestScore] = useState(() => {
    const currentScores = getHighScores()
    return currentScores[0]?.score || 0
  })
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [dailyBonusReady, setDailyBonusReady] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      return storageGet('dailyBonusClaimed') !== today
    } catch {
      return false
    }
  })
  const isGamepadSupported = typeof navigator !== 'undefined' && !!navigator.getGamepads

  // Daily Challenge helpers
  const getDailyIdx = () => {
    const override = storageGet('challengeOverride')
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
    storageSet('soundVolume', soundVolume.toString())
  }, [soundVolume])

  useEffect(() => {
    // Save music volume to localStorage
    storageSet('musicVolume', musicVolume.toString())
  }, [musicVolume])

  useEffect(() => {
    storageSet('controllerEnabled', controllerEnabled ? 'true' : 'false')
  }, [controllerEnabled])

  useEffect(() => {
    storageSet('controllerDeadzone', controllerDeadzone.toString())
  }, [controllerDeadzone])

  useEffect(() => {
    ensureWalletSchema()
    setCoins(getCoins())
    setOwnedShips(getOwned('ownedShips'))
    setOwnedChars(getOwned('ownedChars'))
  }, [])

  useEffect(() => {
    if (showScores) {
      setLocalScores(getHighScores())
    }
  }, [showScores])

  useEffect(() => {
    setBestScore(localScores[0]?.score || 0)
  }, [localScores])

  useEffect(() => {
    // Start menu music
    playMenuMusic()
    return () => stopMusic()
  }, [])

  const handleStart = () => {
    stopMusic()
    // start gameplay music on user gesture
    playGameplayMusic()
    storageSet('playerName', playerName)
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

  const SHIPS = [
    { id: 'kaden', label: "🚀 Kaden's Ship", cost: 0 },
    { id: 'adelynn', label: "✨ Adelynn's Ship", cost: 0 },
    { id: 'falcon', label: '🦅 Falcon', cost: 200 },
    { id: 'phantom', label: '👻 Phantom', cost: 250 },
    { id: 'nova', label: '🌟 Nova', cost: 300 },
    { id: 'titan', label: '🛡️ Titan', cost: 350 },
    { id: 'viper', label: '🐍 Viper', cost: 300 },
    { id: 'shadow', label: '🌑 Shadow', cost: 320 },
    { id: 'meteor', label: '☄️ Meteor', cost: 280 },
    { id: 'comet', label: '🌠 Comet', cost: 260 },
    { id: 'raptor', label: '🦖 Raptor', cost: 330 },
    { id: 'aurora', label: '🌈 Aurora', cost: 340 },
  ]

  const CHARACTERS = [
    {
      id: 'kaden',
      icon: '🧑🏿‍🚀',
      color: ['#4ecdc4', '#667eea'],
      label: 'Kaden',
      weapon: 'Laser',
      speed: 'Medium',
      strength: 'Medium',
    },
    {
      id: 'adelynn',
      icon: '👩‍🚀',
      color: ['#ff6b9a', '#ff00ff'],
      label: 'Adelynn',
      weapon: 'Spread',
      speed: 'High',
      strength: 'Low',
    },
    {
      id: 'hero3',
      icon: '🧑🏽‍🚀',
      color: ['#ffd166', '#ef476f'],
      label: 'Orion',
      weapon: 'Plasma',
      speed: 'Medium',
      strength: 'High',
    },
    {
      id: 'hero4',
      icon: '👩🏻‍🚀',
      color: ['#06d6a0', '#118ab2'],
      label: 'Lyra',
      weapon: 'Lightning',
      speed: 'High',
      strength: 'Medium',
    },
    {
      id: 'hero5',
      icon: '🧔‍🚀',
      color: ['#8d99ae', '#2b2d42'],
      label: 'Jax',
      weapon: 'Shotgun',
      speed: 'Low',
      strength: 'High',
    },
    {
      id: 'hero6',
      icon: '👩🏾‍🚀',
      color: ['#a1c4fd', '#c2e9fb'],
      label: 'Vega',
      weapon: 'Homing',
      speed: 'Medium',
      strength: 'Medium',
    },
    {
      id: 'hero7',
      icon: '🧑🏼‍🚀',
      color: ['#f7971e', '#ffd200'],
      label: 'Kael',
      weapon: 'Railgun',
      speed: 'Low',
      strength: 'High',
    },
    {
      id: 'hero8',
      icon: '👩🏼‍🚀',
      color: ['#7f00ff', '#e100ff'],
      label: 'Nova',
      weapon: 'Beam',
      speed: 'High',
      strength: 'Low',
    },
    {
      id: 'hero9',
      icon: '🧑🏻‍🚀',
      color: ['#00c6ff', '#0072ff'],
      label: 'Rio',
      weapon: 'Missile',
      speed: 'Medium',
      strength: 'High',
    },
    {
      id: 'hero10',
      icon: '👩🏽‍🚀',
      color: ['#ff9966', '#ff5e62'],
      label: 'Mira',
      weapon: 'Ice',
      speed: 'Medium',
      strength: 'Medium',
    },
  ]

  const buyShip = (id, cost) => {
    if (ownedShips.includes(id)) return
    if (cost === 0 || spendCoins(cost)) {
      setCoins(getCoins())
      const list = ownItem('ownedShips', id)
      setOwnedShips(list)
      setToast('Ship unlocked!')
      setTimeout(() => setToast(''), 1500)
    }
  }

  const buyChar = (id) => {
    if (ownedChars.includes(id)) return
    const cost = 150
    if (spendCoins(cost)) {
      setCoins(getCoins())
      const list = ownItem('ownedChars', id)
      setOwnedChars(list)
      setToast('Character unlocked!')
      setTimeout(() => setToast(''), 1500)
    }
  }

  const claimDailyBonus = () => {
    if (!dailyBonusReady) return
    const reward = 200
    addCoins(reward)
    setCoins(getCoins())
    try {
      const today = new Date().toISOString().slice(0, 10)
      storageSet('dailyBonusClaimed', today)
    } catch (_) {}
    setDailyBonusReady(false)
    setToast(`Daily bonus +${reward}!`)
    setTimeout(() => setToast(''), 1500)
  }

  const refreshCloudScores = useCallback(async () => {
    setCloudError('')
    setLoadingCloudScores(true)
    try {
      const merged = await getMergedTopScores()
      setCloudScores(merged)
      if (merged.length === 0) {
        setCloudError('No cloud scores yet. Play a game online to seed the board!')
      }
    } catch (err) {
      console.warn(err)
      setCloudError('Unable to reach cloud leaderboard right now.')
    } finally {
      setLoadingCloudScores(false)
    }
  }, [])

  // Ship thumbnail component (draws a mini ship on canvas)
  const ShipThumb = ({ id }) => {
    const canvasRef = useRef(null)
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // palette by ship id
      const palette = {
        kaden: ['#4ecdc4', '#00ffff'],
        adelynn: ['#ff6b9a', '#ff00ff'],
        falcon: ['#ffd166', '#ef476f'],
        phantom: ['#95a5a6', '#bdc3c7'],
        nova: ['#7f00ff', '#e100ff'],
        titan: ['#f39c12', '#d35400'],
        viper: ['#2ecc71', '#27ae60'],
        shadow: ['#34495e', '#2c3e50'],
        meteor: ['#e67e22', '#d35400'],
        comet: ['#00c6ff', '#0072ff'],
        raptor: ['#e74c3c', '#c0392b'],
        aurora: ['#a1c4fd', '#c2e9fb'],
      }[id] || ['#4ecdc4', '#00ffff']
      const [body, accent] = palette
      // draw simple triangle ship
      ctx.save()
      ctx.translate(32, 22)
      ctx.shadowBlur = 10
      ctx.shadowColor = body
      ctx.fillStyle = body
      ctx.beginPath()
      ctx.moveTo(0, -16)
      ctx.lineTo(14, 10)
      ctx.lineTo(-14, 10)
      ctx.closePath()
      ctx.fill()
      // accent cockpit
      ctx.fillStyle = accent
      ctx.fillRect(-5, -2, 10, 6)
      // engine glow
      const grad = ctx.createLinearGradient(-6, 10, 6, 10)
      grad.addColorStop(0, 'yellow')
      grad.addColorStop(1, accent)
      ctx.fillStyle = grad
      ctx.fillRect(-6, 10, 12, 3)
      ctx.restore()
    }, [id])
    return <canvas ref={canvasRef} width={64} height={44} className="ship-thumb" />
  }

  return (
    <div className="main-menu">
      <div className="menu-container glass">
        <div className="menu-hero">
          <div className="hero-copy">
            <p className="eyebrow">Bradley Virtual Solutions</p>
            <h1 className="game-title">Kaden & Adelynn</h1>
            <p className="hero-subtitle">
              Lead fearless pilots through cascading boss fights, roguelite waves, and a constantly evolving arsenal.
            </p>
            <div className="hero-stats">
              <div className="stat-pill">
                <span>Best Score</span>
                <strong>{String(bestScore || 0).padStart(8, '0')}</strong>
              </div>
              <div className="stat-pill">
                <span>Unlocked Ships</span>
                <strong>{ownedShips.length}</strong>
              </div>
              <div className="stat-pill">
                <span>Daily Challenge</span>
                <strong>{challengeLabel}</strong>
              </div>
            </div>
            <div className="hero-actions">
              <button className="start-button" onClick={handleStart}>
                Launch Mission
              </button>
              <button className="ghost-button" onClick={() => setShowSettings((s) => !s)}>
                {showSettings ? 'Hide Settings' : 'Settings'}
              </button>
            </div>
          </div>
          <div className="hero-panel">
            <div className="wallet-card">
              <div className="wallet-card__header">
                <span>Fleet Wallet</span>
                <span className="coin-badge">💰 {coins}</span>
              </div>
              <p>Earn coins in runs or redeem your free daily stipend.</p>
              <button
                className="settings-button small"
                onClick={claimDailyBonus}
                disabled={!dailyBonusReady}
                title={
                  dailyBonusReady ? 'Redeem your daily 200-coin stipend' : 'Come back tomorrow for more coins'
                }
              >
                {dailyBonusReady ? 'Claim Daily +200' : 'Bonus claimed'}
              </button>
            </div>
            <div className="loadout-summary">
              <div>
                <span>Difficulty</span>
                <strong>{selectedDifficulty}</strong>
              </div>
              <div>
                <span>Ship</span>
                <strong>{selectedShip}</strong>
              </div>
              <div>
                <span>Character</span>
                <strong>{selectedCharacter}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="menu-panels">
          <section className="panel">
            <div className="panel-header">
              <h3>Mission Setup</h3>
              <p>Select your challenge level and callsign.</p>
            </div>
            <div className="panel-body">
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
              <div className="player-field">
                <label htmlFor="playerName">Callsign</label>
                <div className="player-input-row">
                  <input
                    id="playerName"
                    value={playerName}
                    onChange={(e) => {
                      setPlayerName(e.target.value)
                    }}
                    placeholder="Type game name here"
                  />
                  <button
                    className="settings-button small"
                    onClick={() => {
                      try {
                        storageSet('playerName', playerName)
                        setToast('Name saved')
                        setTimeout(() => setToast(''), 1200)
                      } catch (_) {}
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h3>Daily Challenge</h3>
              <p>Modifiers rotate every day — push for new scores.</p>
            </div>
            <div className="panel-body challenge-panel">
              <div className="challenge-chip">{challengeLabel}</div>
              <div className="challenge-actions">
                <button
                  className="settings-button small"
                  onClick={() => {
                    const next = (challengeIdx + 1) % 3
                    storageSet('challengeOverride', String(next))
                    setToast('Daily Challenge cycled')
                    setTimeout(() => setToast(''), 1200)
                  }}
                >
                  Cycle
                </button>
                <button
                  className="settings-button small"
                  onClick={() => {
                    storageRemove('challengeOverride')
                    setToast('Daily Challenge reset')
                    setTimeout(() => setToast(''), 1200)
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h3>Hangar & Records</h3>
              <p>Manage unlocks, gear, and leaderboards.</p>
            </div>
            <div className="panel-body action-grid">
              <button className="action-card" onClick={() => setShowStore((s) => !s)}>
                <span>🛒 Store</span>
                <small>Upgrade shields & boosts</small>
              </button>
              <button className="action-card" onClick={() => setShowShips(true)}>
                <span>🚀 Ship Hangar</span>
                <small>Select or unlock hulls</small>
              </button>
              <button className="action-card" onClick={() => setShowCharacters(true)}>
                <span>🧑‍🚀 Crew</span>
                <small>Swap playable heroes</small>
              </button>
              <button className="action-card" onClick={() => setShowScores(true)}>
                <span>🏆 Top Scores</span>
                <small>View global leaderboard</small>
              </button>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h3>Top Pilots</h3>
              <button className="text-button" onClick={() => setShowScores(true)}>
                View all
              </button>
            </div>
            <div className="panel-body mini-leaderboard">
              {localScores.slice(0, 3).map((s, i) => (
                <div key={i} className="leaderboard-row">
                  <span>{String(i + 1).padStart(2, '0')}.</span>
                  <span>{s.player || 'Player'}</span>
                  <span>{String(s.score || 0).padStart(8, '0')}</span>
                </div>
              ))}
              {localScores.length === 0 && (
                <div className="leaderboard-empty">No scores yet. Play a game to set a record!</div>
              )}
              <button className="ghost-button" onClick={refreshCloudScores} disabled={loadingCloudScores}>
                {loadingCloudScores ? 'Refreshing…' : 'Refresh from Cloud'}
              </button>
              {cloudError && <small className="inline-error">{cloudError}</small>}
            </div>
          </section>

          <section className="panel panel-features">
            <div className="panel-header">
              <h3>Feature Highlights</h3>
              <p>Everything included in this build.</p>
            </div>
            <div className="panel-body">
              <div className="game-features">
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
            </div>
          </section>
        </div>

        <div className="legal-links">
          <button type="button" onClick={() => setShowTerms(true)}>
            Terms of Service
          </button>
          <span>•</span>
          <button type="button" onClick={() => setShowPrivacy(true)}>
            Privacy Policy
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

        {showTerms && (
          <div className="legal-modal" role="dialog" aria-modal="true" onClick={() => setShowTerms(false)}>
            <div className="legal-modal__card glass" onClick={(e) => e.stopPropagation()}>
              <div className="legal-modal__header">
                <h3>Terms of Service</h3>
                <button className="settings-button small" onClick={() => setShowTerms(false)}>
                  Close
                </button>
              </div>
              <div className="legal-modal__content">
                <section>
                  <h4>1. Acceptance</h4>
                  <p>
                    By launching this build you agree to play fairly, respect other players, and adhere to applicable
                    laws. If you disagree with these terms, do not use the software.
                  </p>
                </section>
                <section>
                  <h4>2. License</h4>
                  <p>
                    You receive a personal, non-transferable license to access the game for entertainment. Reverse
                    engineering, resale, and automated exploitation are prohibited.
                  </p>
                </section>
                <section>
                  <h4>3. Gameplay Data</h4>
                  <p>
                    Scores, upgrades, and settings saved locally or to the cloud may be reset during updates. We are not
                    responsible for loss of progress caused by tampering or hardware failure.
                  </p>
                </section>
                <section>
                  <h4>4. Updates & Availability</h4>
                  <p>
                    Features may change without notice. Online services such as leaderboards are provided on a
                    best-effort basis and may be suspended for maintenance.
                  </p>
                </section>
                <section>
                  <h4>5. Liability</h4>
                  <p>
                    This game is provided “as-is” with no warranties. To the fullest extent permitted by law, Bradley
                    Virtual Solutions, LLC disclaims liability for damages arising from use of the software.
                  </p>
                </section>
                <p className="legal-note">Questions? Contact support@bradleyvirtual.com.</p>
              </div>
            </div>
          </div>
        )}

        {showPrivacy && (
          <div className="legal-modal" role="dialog" aria-modal="true" onClick={() => setShowPrivacy(false)}>
            <div className="legal-modal__card glass" onClick={(e) => e.stopPropagation()}>
              <div className="legal-modal__header">
                <h3>Privacy Policy</h3>
                <button className="settings-button small" onClick={() => setShowPrivacy(false)}>
                  Close
                </button>
              </div>
              <div className="legal-modal__content">
                <section>
                  <h4>1. Data We Store</h4>
                  <p>
                    Local storage keeps settings such as coins, unlocks, difficulty, and controller preferences. If you
                    opt in to cloud leaderboards we store your display name and score history.
                  </p>
                </section>
                <section>
                  <h4>2. Analytics</h4>
                  <p>
                    We may use anonymous analytics to understand performance (crash logs, loading times, device type).
                    This information is aggregated and not sold.
                  </p>
                </section>
                <section>
                  <h4>3. Third Parties</h4>
                  <p>
                    Firebase Hosting and optional Firestore services provide infrastructure. Their policies govern how
                    data is processed on their systems.
                  </p>
                </section>
                <section>
                  <h4>4. Your Choices</h4>
                  <p>
                    You can reset local data at any time from your browser storage settings. To remove cloud leaderboard
                    entries, reach us at privacy@bradleyvirtual.com with your player name.
                  </p>
                </section>
                <section>
                  <h4>5. Children</h4>
                  <p>
                    The game targets general audiences but collects minimal personal information. Guardians should
                    supervise minors and disable cloud features if desired.
                  </p>
                </section>
                <p className="legal-note">Effective Date: Dec 7, 2025</p>
              </div>
            </div>
          </div>
        )}

        {showStore && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowStore(false)}
          >
            <div
              className="glass"
              style={{
                background: 'rgba(10,14,39,0.9)',
                borderRadius: '12px',
                padding: '20px',
                width: 'min(900px, 92vw)',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h4 style={{ margin: 0 }}>🛒 Store Upgrades</h4>
                <button className="settings-button" onClick={() => setShowStore(false)}>
                  Close
                </button>
              </div>
              <div className="grid" style={{ marginTop: '12px' }}>
                <button
                  className="card"
                  onClick={() => {
                    if (spendCoins(200)) {
                      setCoins(getCoins())
                      storageSet('upgrade_shield', '1')
                    }
                  }}
                >
                  🛡️ Shield+ (200)
                </button>
                <button
                  className="card"
                  onClick={() => {
                    if (spendCoins(200)) {
                      setCoins(getCoins())
                      storageSet('upgrade_speed', '1')
                    }
                  }}
                >
                  💨 Speed+ (200)
                </button>
                <button
                  className="card"
                  onClick={() => {
                    if (spendCoins(300)) {
                      setCoins(getCoins())
                      storageSet('upgrade_rapid', '1')
                    }
                  }}
                >
                  ⚡ Rapid+ (300)
                </button>
                <button
                  className="card"
                  onClick={() => {
                    if (spendCoins(400)) {
                      setCoins(getCoins())
                      storageSet('upgrade_doubler', '1')
                    }
                  }}
                >
                  💰 Coin Doubler (400)
                </button>
                <button
                  className="card"
                  onClick={() => {
                    if (spendCoins(150)) {
                      setCoins(getCoins())
                      storageSet('upgrade_life', '1')
                    }
                  }}
                >
                  ❤️ Extra Life (150)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player name input */}
        <div className="menu-section">
          <h3>Player</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <input
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value)
              }}
              placeholder="Type game name here"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                width: 240,
              }}
            />
            <button
              className="settings-button small"
              onClick={() => {
                try {
                  storageSet('playerName', playerName)
                  setToast('Name saved')
                  setTimeout(() => setToast(''), 1200)
                } catch (_) {}
              }}
            >
              Save
            </button>
          </div>
        </div>

        {showCharacters && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowCharacters(false)}
          >
            <div
              className="glass"
              style={{
                background: 'rgba(10,14,39,0.9)',
                borderRadius: '12px',
                padding: '20px',
                width: 'min(900px, 92vw)',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h3 style={{ margin: 0 }}>Select Your Character</h3>
                <button className="settings-button" onClick={() => setShowCharacters(false)}>
                  Close
                </button>
              </div>
              <div className="grid selector-grid" style={{ marginTop: '12px' }}>
                {CHARACTERS.map((c) => {
                  const owned = ownedChars.includes(c.id) || c.id === 'kaden' || c.id === 'adelynn'
                  const active = selectedCharacter === c.id
                  return (
                    <button
                      key={c.id}
                      className={`card ${owned ? '' : 'locked'} ${active ? 'active' : ''}`}
                      onClick={() => {
                        if (owned) {
                          setSelectedCharacter(c.id)
                          setShowCharacters(false)
                        } else {
                          buyChar(c.id)
                        }
                      }}
                    >
                      <div className="row" style={{ marginBottom: '6px' }}>
                        <div
                          className="avatar"
                          style={{
                            background: `linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})`,
                          }}
                        >
                          {c.icon}
                        </div>
                        <div style={{ fontSize: '18px' }}>{c.label}</div>
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.9, lineHeight: 1.4 }}>
                        <div>⚔️ Weapon: {c.weapon}</div>
                        <div>🏃 Speed: {c.speed}</div>
                        <div>💪 Strength: {c.strength}</div>
                      </div>
                      {!owned && <div className="price">💰 150</div>}
                      {active && <div style={{ fontSize: '12px', opacity: 0.8 }}>Selected</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {showScores && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowScores(false)}
          >
            <div
              className="glass"
              style={{
                background: 'rgba(10,14,39,0.9)',
                borderRadius: '12px',
                padding: '20px',
                width: 'min(700px, 92vw)',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h3 style={{ margin: 0 }}>🏆 Top Scores</h3>
                <button className="settings-button" onClick={() => setShowScores(false)}>
                  Close
                </button>
              </div>
              <div style={{ marginTop: 12 }}>
                {localScores.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ color: '#ffd700' }}>{String(i + 1).padStart(2, '0')}.</div>
                    <div style={{ flex: 1, marginLeft: 10, color: '#fff' }}>
                      {s.player || 'Player'}
                    </div>
                    <div style={{ color: '#4ecdc4', fontWeight: 700 }}>
                      {String(s.score).padStart(8, '0')}
                    </div>
                  </div>
                ))}
                {localScores.length === 0 && (
                  <div style={{ color: '#95a5a6' }}>
                    No scores yet. Play a game to set a record!
                  </div>
                )}
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    className="settings-button small"
                    onClick={refreshCloudScores}
                    disabled={loadingCloudScores}
                  >
                    {loadingCloudScores ? 'Refreshing…' : 'Refresh from Cloud'}
                  </button>
                  {cloudError && (
                    <div style={{ color: '#ff9f43', fontSize: 12, textAlign: 'center' }}>{cloudError}</div>
                  )}
                  {cloudScores.length > 0 && (
                    <div
                      className="dynamic-scores"
                      style={{
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        paddingTop: 6,
                      }}
                    >
                      {cloudScores.map((s, i) => (
                        <div
                          key={`${s.player || 'player'}-${s.score || 0}-${i}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                          }}
                        >
                          <div style={{ color: '#ffd700' }}>{String(i + 1).padStart(2, '0')}.</div>
                          <div style={{ flex: 1, marginLeft: 10, color: '#fff' }}>{s.player || 'Player'}</div>
                          <div style={{ color: '#4ecdc4', fontWeight: 700 }}>
                            {String(s.score || 0).padStart(8, '0')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showShips && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowShips(false)}
          >
            <div
              className="glass"
              style={{
                background: 'rgba(10,14,39,0.9)',
                borderRadius: '12px',
                padding: '20px',
                width: 'min(900px, 92vw)',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h3 style={{ margin: 0 }}>Select Your Ship</h3>
                <button className="settings-button" onClick={() => setShowShips(false)}>
                  Close
                </button>
              </div>
              <div className="grid selector-grid" style={{ marginTop: '12px' }}>
                {SHIPS.map((s) => {
                  const owned = ownedShips.includes(s.id) || s.cost === 0
                  const active = selectedShip === s.id
                  return (
                    <button
                      key={s.id}
                      className={`card ${owned ? '' : 'locked'} ${active ? 'active' : ''}`}
                      onClick={() => {
                        if (owned) {
                          setSelectedShip(s.id)
                          setShowShips(false)
                        } else {
                          buyShip(s.id, s.cost)
                        }
                      }}
                    >
                      <div className="row" style={{ marginBottom: '6px', alignItems: 'center' }}>
                        <ShipThumb id={s.id} />
                        <div style={{ fontSize: '18px' }}>{s.label}</div>
                      </div>
                      {!owned && <div className="price">💰 {s.cost}</div>}
                      {active && <div style={{ fontSize: '12px', opacity: 0.8 }}>Selected</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

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
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 8,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.75)',
          fontSize: 12,
          pointerEvents: 'none'
        }}
      >
        This is a Product of Bradley Virtual Solutions, LLC.
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
