import { useState } from 'react'
import Game from './components/Game'
import MainMenu from './components/MainMenu'
import './App.css'

function App() {
  const [gameState, setGameState] = useState('menu')
  const [gameConfig, setGameConfig] = useState({ difficulty: 'medium', ship: 'kaden' })

  const handleStartGame = (difficulty, ship) => {
    setGameConfig({ difficulty, ship })
    setGameState('playing')
  }

  const handleGameOver = () => {
    setGameState('menu')
  }

  return (
    <div className="app">
      {gameState === 'menu' && <MainMenu onStartGame={handleStartGame} />}
      {gameState === 'playing' && (
        <Game 
          onPause={() => {}}
          onGameOver={handleGameOver}
          difficulty={gameConfig.difficulty}
          selectedShip={gameConfig.ship}
          isPaused={false}
        />
      )}
    </div>
  )
}

export default App

