import { useState, useEffect, useRef } from 'react'
import { getCoins, spendCoins, addCoins, getOwned, ownItem } from '../utils/wallet'
import { getHighScores, getMergedTopScores } from '../utils/scoreTracking'
import { playMenuMusic, playGameplayMusic, stopMusic } from '../utils/music'
import './MainMenu.css'

function MainMenu({ onStartGame }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [selectedShip, setSelectedShip] = useState('kaden')
  const [selectedCharacter, setSelectedCharacter] = useState('kaden')
  const [showSettings, setShowSettings] = useState(false)
  const [showStore, setShowStore] = useState(false)
  const [showShips, setShowShips] = useState(false)
  const [showCharacters, setShowCharacters] = useState(false)
  const [showScores, setShowScores] = useState(false)
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || 'Player')
  const [coins, setCoins] = useState(() => getCoins())
  const [toast, setToast] = useState('')
  const [ownedShips, setOwnedShips] = useState(() => getOwned('ownedShips'))
  const [ownedChars, setOwnedChars] = useState(() => getOwned('ownedChars'))
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
    return () => stopMusic()
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
        <h1 className="game-title">
          🌟 Kaden & Adelynn
          <br />
          🌌 Space Adventures 🌌
        </h1>
        <div className="menu-topbar">
          <p className="game-subtitle">Epic Space Shooter</p>
          <div className="wallet">
            <span className="coin-badge">💰 {coins}</span>
            <button
              className="settings-button small"
              onClick={() => {
                addCoins(100)
                setCoins(getCoins())
              }}
            >
              +100
            </button>
          </div>
        </div>

        <div className="button-row centered">
          <button className="settings-button" onClick={() => setShowStore((s) => !s)}>
            {showStore ? 'Close Store' : '🛒 Open Store'}
          </button>
          <button className="settings-button" onClick={() => setShowShips(true)}>
            🚀 Choose Ship
          </button>
          <button className="settings-button" onClick={() => setShowCharacters(true)}>
            🧑‍🚀 Choose Character
          </button>
          <button className="settings-button" onClick={() => setShowScores(true)}>
            🏆 Top Scores
          </button>
        </div>

        <div className="menu-section">
          <h3>🗓️ Daily Challenge</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="glass" style={{ padding: '8px 12px', borderRadius: 10 }}>
              Active: <strong>{challengeLabel}</strong>
            </div>
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
                      localStorage.setItem('upgrade_shield', '1')
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
                      localStorage.setItem('upgrade_speed', '1')
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
                      localStorage.setItem('upgrade_rapid', '1')
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
                      localStorage.setItem('upgrade_doubler', '1')
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
                      localStorage.setItem('upgrade_life', '1')
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
                  localStorage.setItem('playerName', playerName)
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
                {getHighScores().map((s, i) => (
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
                {getHighScores().length === 0 && (
                  <div style={{ color: '#95a5a6' }}>
                    No scores yet. Play a game to set a record!
                  </div>
                )}
                <div style={{ marginTop: 10 }}>
                  <button
                    className="settings-button small"
                    onClick={async (e) => {
                      const list = await getMergedTopScores()
                      const wrap = document.createElement('div')
                      wrap.innerHTML = list
                        .map(
                          (s, i) =>
                            `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.08)"><div style="color:#ffd700">${String(i + 1).padStart(2, '0')}.</div><div style="flex:1;margin-left:10px;color:#fff">${s.player || 'Player'}</div><div style="color:#4ecdc4;font-weight:700">${String(s.score).padStart(8, '0')}</div></div>`
                        )
                        .join('')
                      const container = e.currentTarget.parentElement.parentElement
                      container.querySelectorAll('.dynamic-scores').forEach((n) => n.remove())
                      wrap.className = 'dynamic-scores'
                      container.appendChild(wrap)
                    }}
                  >
                    Refresh from Cloud
                  </button>
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
