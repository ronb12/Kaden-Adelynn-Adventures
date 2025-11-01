import { useState, useEffect } from 'react'
import Game from './components/Game'
import MainMenu from './components/MainMenu'
import Story from './components/Story'
import GameOver from './components/GameOver'
import { saveScore } from './utils/scoreTracking'
import './App.css'

function App() {
  const [gameState, setGameState] = useState('menu')
  const [gameConfig, setGameConfig] = useState({ difficulty: 'medium', ship: 'kaden', character: 'kaden' })
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || 'Player')

  useEffect(() => {
    localStorage.setItem('playerName', playerName)
  }, [playerName])
  const [gameStats, setGameStats] = useState({ score: 0, wave: 1, level: 1, kills: 0, combo: 0 })
  const [paused, setPaused] = useState(false)

  const handleStartGame = (difficulty, ship, character, name) => {
    if (name) setPlayerName(name)
    setGameConfig({ difficulty, ship, character })
    setGameState('story')
  }

  const handleStoryComplete = () => {
    setGameState('playing')
  }

  const handlePauseToggle = () => {
    setPaused(p => !p)
  }

  const handleGameOver = (finalScore, wave, level, kills, combo) => {
    if (finalScore > 0) {
      saveScore(finalScore)
    }
    setGameStats({ score: finalScore, wave, level, kills, combo })
    setGameState('gameover')
  }

  const handleRestart = () => {
    setGameState('playing')
  }

  const handleReturnToMenu = () => {
    setGameState('menu')
  }

  return (
    <div className="app">
      {gameState === 'menu' && <MainMenu onStartGame={handleStartGame} />}
      {gameState === 'story' && <Story onContinue={handleStoryComplete} />}
      {gameState === 'playing' && (
        <Game 
          onPause={handlePauseToggle}
          onGameOver={handleGameOver}
          difficulty={gameConfig.difficulty}
          selectedShip={gameConfig.ship}
          selectedCharacter={gameConfig.character}
          playerName={playerName}
          isPaused={paused}
        />
      )}
      {gameState === 'gameover' && (
        <GameOver 
          score={gameStats.score}
          wave={gameStats.wave}
          level={gameStats.level}
          kills={gameStats.kills}
          combo={gameStats.combo}
          onRestart={handleRestart}
          onMenu={handleReturnToMenu}
        />
      )}
    </div>
  )
}

export default App

