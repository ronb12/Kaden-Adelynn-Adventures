import { useState, useEffect } from 'react'
import { playMenuMusic } from '../utils/music'
import './MainMenu.css'

function MainMenu({ onStartGame, onOpenStore, onOpenShips, onOpenCharacters, onOpenScores, onOpenTerms, onOpenPrivacy }) {
  const [difficulty, setDifficulty] = useState('medium')
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || 'Player')

  useEffect(() => {
    playMenuMusic()
  }, [])

  const handleStart = () => {
    const ship = localStorage.getItem('selectedShip') || 'kaden'
    const character = localStorage.getItem('selectedCharacter') || 'kaden'
    onStartGame(difficulty, ship, character, playerName)
  }

  return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="game-title">Kaden & Adelynn Space Adventures</h1>
        
        <div className="player-name-input">
          <label>Player Name:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value)
              localStorage.setItem('playerName', e.target.value)
            }}
            placeholder="Enter your name"
            maxLength={20}
          />
        </div>

        <div className="difficulty-selector">
          <label>Difficulty:</label>
          <div className="difficulty-buttons">
            <button
              className={difficulty === 'easy' ? 'active' : ''}
              onClick={() => setDifficulty('easy')}
            >
              Easy
            </button>
            <button
              className={difficulty === 'medium' ? 'active' : ''}
              onClick={() => setDifficulty('medium')}
            >
              Medium
            </button>
            <button
              className={difficulty === 'hard' ? 'active' : ''}
              onClick={() => setDifficulty('hard')}
            >
              Hard
            </button>
          </div>
        </div>

        <div className="menu-buttons">
          <button className="menu-button play-button" onClick={handleStart}>
            Play
          </button>
          <button className="menu-button" onClick={onOpenShips}>
            Select Ship
          </button>
          <button className="menu-button" onClick={onOpenCharacters}>
            Select Character
          </button>
          <button className="menu-button" onClick={onOpenStore}>
            Store
          </button>
          <button className="menu-button" onClick={onOpenScores}>
            High Scores
          </button>
        </div>

        <div className="menu-footer">
          <button className="footer-link" onClick={onOpenTerms}>
            Terms of Service
          </button>
          <span> | </span>
          <button className="footer-link" onClick={onOpenPrivacy}>
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  )
}

export default MainMenu
