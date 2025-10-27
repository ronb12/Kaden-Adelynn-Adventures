import { useState, useEffect } from 'react'
import './MainMenu.css'

function MainMenu({ onStartGame }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [selectedShip, setSelectedShip] = useState('kaden')
  const [showSettings, setShowSettings] = useState(false)
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
    onStartGame(selectedDifficulty, selectedShip)
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
        <h1 className="game-title">🌟 Kaden & Adelynn<br />🌌 Space Adventures 🌌</h1>
        <p className="game-subtitle">Epic Space Shooter</p>
        
        <div className="menu-section">
          <h3>Select Ship</h3>
          <div className="ship-selector">
            <button 
              className={`ship-option ${selectedShip === 'kaden' ? 'active' : ''}`}
              onClick={() => setSelectedShip('kaden')}
            >
              🚀 Kaden's Ship
            </button>
            <button 
              className={`ship-option ${selectedShip === 'adelynn' ? 'active' : ''}`}
              onClick={() => setSelectedShip('adelynn')}
            >
              ✨ Adelynn's Ship
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
                <input 
                  type="checkbox" 
                  checked={fullscreen}
                  onChange={handleFullscreen}
                />
              </div>
            </div>
          </div>
        )}

        <div className="game-features">
          <h4>🌟 100+ Features Included</h4>
          <ul>
            <li>25 Lives System</li>
            <li>6 Weapon Types</li>
            <li>Boss Battles</li>
            <li>Achievement System</li>
            <li>Combo System</li>
            <li>Daily Challenges</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MainMenu

