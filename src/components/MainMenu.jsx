import { useState, useEffect } from 'react'
import { getCoins, spendCoins, addCoins, getOwned, ownItem } from '../utils/wallet'
import './MainMenu.css'

function MainMenu({ onStartGame }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [selectedShip, setSelectedShip] = useState('kaden')
  const [selectedCharacter, setSelectedCharacter] = useState('hero1')
  const [showSettings, setShowSettings] = useState(false)
  const [showStore, setShowStore] = useState(false)
  const [showShips, setShowShips] = useState(false)
  const [showCharacters, setShowCharacters] = useState(false)
  const [coins, setCoins] = useState(() => getCoins())
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
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    // Save sound volume to localStorage
    localStorage.setItem('soundVolume', soundVolume.toString())
  }, [soundVolume])

  useEffect(() => {
    // Save music volume to localStorage
    localStorage.setItem('musicVolume', musicVolume.toString())
  }, [musicVolume])

  const handleStart = () => {
    onStartGame(selectedDifficulty, selectedShip, selectedCharacter)
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
    { id: 'adelynn', label: '✨ Adelynn\'s Ship', cost: 0 },
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
    { id: 'hero1', label: '🧑‍🚀 Alex' },
    { id: 'hero2', label: '👩‍🚀 Zaya' },
    { id: 'hero3', label: '🧑‍🚀 Orion' },
    { id: 'hero4', label: '👩‍🚀 Lyra' },
    { id: 'hero5', label: '🧑‍🚀 Jax' },
    { id: 'hero6', label: '👩‍🚀 Vega' },
    { id: 'hero7', label: '🧑‍🚀 Kael' },
    { id: 'hero8', label: '👩‍🚀 Nova' },
    { id: 'hero9', label: '🧑‍🚀 Rio' },
    { id: 'hero10', label: '👩‍🚀 Mira' },
  ]

  const buyShip = (id, cost) => {
    if (ownedShips.includes(id)) return
    if (cost === 0 || spendCoins(cost)) {
      setCoins(getCoins())
      const list = ownItem('ownedShips', id)
      setOwnedShips(list)
    }
  }

  const buyChar = (id) => {
    if (ownedChars.includes(id)) return
    const cost = 150
    if (spendCoins(cost)) {
      setCoins(getCoins())
      const list = ownItem('ownedChars', id)
      setOwnedChars(list)
    }
  }

  return (
    <div className="main-menu">
      <div className="menu-container glass">
        <h1 className="game-title">🌟 Kaden & Adelynn<br />🌌 Space Adventures 🌌</h1>
        <div className="menu-topbar">
          <p className="game-subtitle">Epic Space Shooter</p>
          <div className="wallet">
            <span className="coin-badge">💰 {coins}</span>
            <button className="settings-button small" onClick={() => { addCoins(100); setCoins(getCoins()) }}>+100</button>
          </div>
        </div>
        
        

        

        <div className="button-row centered">
          <button className="settings-button" onClick={() => setShowStore(s => !s)}>
            {showStore ? 'Close Store' : '🛒 Open Store'}
          </button>
          <button className="settings-button" onClick={() => setShowShips(true)}>🚀 Choose Ship</button>
          <button className="settings-button" onClick={() => setShowCharacters(true)}>🧑‍🚀 Choose Character</button>
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
                <input 
                  type="checkbox" 
                  checked={fullscreen}
                  onChange={handleFullscreen}
                />
              </div>
            </div>
          </div>
        )}

        {showStore && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowStore(false)}
          >
            <div
              className="glass"
              style={{
                background: 'rgba(10,14,39,0.9)',
                borderRadius: '12px', padding: '20px', width: 'min(900px, 92vw)',
                maxHeight: '80vh', overflow: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>🛒 Store Upgrades</h4>
                <button className="settings-button" onClick={() => setShowStore(false)}>Close</button>
              </div>
              <div className="grid" style={{ marginTop: '12px' }}>
                <button className="card" onClick={() => { if (spendCoins(200)) { setCoins(getCoins()); localStorage.setItem('upgrade_shield', '1') } }}>🛡️ Shield+ (200)</button>
                <button className="card" onClick={() => { if (spendCoins(200)) { setCoins(getCoins()); localStorage.setItem('upgrade_speed', '1') } }}>💨 Speed+ (200)</button>
                <button className="card" onClick={() => { if (spendCoins(300)) { setCoins(getCoins()); localStorage.setItem('upgrade_rapid', '1') } }}>⚡ Rapid+ (300)</button>
                <button className="card" onClick={() => { if (spendCoins(400)) { setCoins(getCoins()); localStorage.setItem('upgrade_doubler', '1') } }}>💰 Coin Doubler (400)</button>
                <button className="card" onClick={() => { if (spendCoins(150)) { setCoins(getCoins()); localStorage.setItem('upgrade_life', '1') } }}>❤️ Extra Life (150)</button>
              </div>
            </div>
          </div>
        )}

        {showCharacters && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowCharacters(false)}
          >
            <div
              className="glass"
              style={{
                background: 'rgba(10,14,39,0.9)',
                borderRadius: '12px', padding: '20px', width: 'min(900px, 92vw)',
                maxHeight: '80vh', overflow: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Select Your Character</h3>
                <button className="settings-button" onClick={() => setShowCharacters(false)}>Close</button>
              </div>
              <div className="grid selector-grid" style={{ marginTop: '12px' }}>
                {CHARACTERS.map(c => {
                  const owned = ownedChars.includes(c.id) || c.id === 'hero1'
                  const active = selectedCharacter === c.id
                  return (
                    <button key={c.id}
                      className={`card ${owned ? '' : 'locked'} ${active ? 'active' : ''}`}
                      onClick={() => {
                        if (owned) {
                          setSelectedCharacter(c.id)
                          setShowCharacters(false)
                        } else {
                          buyChar(c.id)
                        }
                      }}>
                      <div style={{ fontSize: '18px', marginBottom: '6px' }}>{c.label}</div>
                      {!owned && <div className="price">💰 150</div>}
                      {active && <div style={{ fontSize: '12px', opacity: 0.8 }}>Selected</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {showShips && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowShips(false)}
          >
            <div
              className="glass"
              style={{
                background: 'rgba(10,14,39,0.9)',
                borderRadius: '12px', padding: '20px', width: 'min(900px, 92vw)',
                maxHeight: '80vh', overflow: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Select Your Ship</h3>
                <button className="settings-button" onClick={() => setShowShips(false)}>Close</button>
              </div>
              <div className="grid selector-grid" style={{ marginTop: '12px' }}>
                {SHIPS.map(s => {
                  const owned = ownedShips.includes(s.id) || s.cost === 0
                  const active = selectedShip === s.id
                  return (
                    <button key={s.id}
                      className={`card ${owned ? '' : 'locked'} ${active ? 'active' : ''}`}
                      onClick={() => {
                        if (owned) {
                          setSelectedShip(s.id)
                          setShowShips(false)
                        } else {
                          buyShip(s.id, s.cost)
                        }
                      }}>
                      <div style={{ fontSize: '18px', marginBottom: '6px' }}>{s.label}</div>
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

      
    </div>
  )
}

export default MainMenu

