import { useState } from 'react'
import Game from './components/Game'
import MainMenu from './components/MainMenu'
import Story from './components/Story'
import { saveScore } from './utils/scoreTracking'
import './App.css'

function App() {
  const [gameState, setGameState] = useState('menu')
  const [gameConfig, setGameConfig] = useState({ difficulty: 'medium', ship: 'kaden' })

  const handleStartGame = (difficulty, ship) => {
    setGameConfig({ difficulty, ship })
    setGameState('story')
  }

  const handleStoryComplete = () => {
    setGameState('playing')
  }

  const handleGameOver = (finalScore) => {
    if (finalScore > 0) {
      saveScore(finalScore)
    }
    setGameState('menu')
  }

  return (
    <div className="app">
      {gameState === 'menu' && <MainMenu onStartGame={handleStartGame} />}
      {gameState === 'story' && <Story onContinue={handleStoryComplete} />}
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

