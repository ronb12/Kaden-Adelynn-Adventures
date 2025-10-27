import { useState } from 'react'
import './MainMenu.css'

function MainMenu({ onStartGame }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [selectedShip, setSelectedShip] = useState('kaden')

  const handleStart = () => {
    onStartGame(selectedDifficulty, selectedShip)
  }

  return (
    <div className="main-menu">
      <div className="menu-container glass">
        <h1 className="game-title">🌟 Kaden & Adelynn<br />Space Adventures 🌟</h1>
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

