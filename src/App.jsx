import { useState, useEffect } from 'react'
import Game from './components/Game'
import MainMenu from './components/MainMenu'
import Story from './components/Story'
import GameOver from './components/GameOver'
import Store from './components/Store'
import ShipSelector from './components/ShipSelector'
import CharacterSelector from './components/CharacterSelector'
import TopScores from './components/TopScores'
import TermsOfService from './components/TermsOfService'
import PrivacyPolicy from './components/PrivacyPolicy'
import './App.css'

function App() {
  const [gameState, setGameState] = useState('menu')
  const [gameConfig, setGameConfig] = useState({
    difficulty: 'medium',
    ship: 'kaden',
    character: 'kaden',
  })
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
    setPaused((p) => !p)
  }

  const handleGameOver = (finalScore, wave, level, kills, combo) => {
    setGameStats({ score: finalScore, wave, level, kills, combo })
    setGameState('gameover')
  }

  const handleRestart = () => {
    setGameState('playing')
  }

  const handleReturnToMenu = () => {
    setGameState('menu')
  }

  const handleOpenStore = () => {
    setGameState('store')
  }

  const handleCloseStore = () => {
    setGameState('menu')
  }

  const handleOpenShips = () => {
    setGameState('ships')
  }

  const handleCloseShips = () => {
    setGameState('menu')
  }

  const handleSelectShip = (shipId) => {
    setGameConfig((prev) => ({ ...prev, ship: shipId }))
    localStorage.setItem('selectedShip', shipId)
  }

  const handleOpenCharacters = () => {
    setGameState('characters')
  }

  const handleCloseCharacters = () => {
    setGameState('menu')
  }

  const handleSelectCharacter = (characterId) => {
    setGameConfig((prev) => ({ ...prev, character: characterId }))
    localStorage.setItem('selectedCharacter', characterId)
  }

  const handleOpenScores = () => {
    setGameState('scores')
  }

  const handleCloseScores = () => {
    setGameState('menu')
  }

  const handleOpenTerms = () => {
    setGameState('terms')
  }

  const handleCloseTerms = () => {
    setGameState('menu')
  }

  const handleOpenPrivacy = () => {
    setGameState('privacy')
  }

  const handleClosePrivacy = () => {
    setGameState('menu')
  }

  return (
    <div className="app">
      {gameState === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenStore={handleOpenStore}
          onOpenShips={handleOpenShips}
          onOpenCharacters={handleOpenCharacters}
          onOpenScores={handleOpenScores}
          onOpenTerms={handleOpenTerms}
          onOpenPrivacy={handleOpenPrivacy}
        />
      )}
      {gameState === 'store' && <Store onClose={handleCloseStore} />}
      {gameState === 'ships' && (
        <ShipSelector
          onClose={handleCloseShips}
          onSelectShip={handleSelectShip}
          selectedShip={gameConfig.ship}
        />
      )}
      {gameState === 'characters' && (
        <CharacterSelector
          onClose={handleCloseCharacters}
          onSelectCharacter={handleSelectCharacter}
          selectedCharacter={gameConfig.character}
        />
      )}
      {gameState === 'scores' && <TopScores onClose={handleCloseScores} />}
      {gameState === 'terms' && <TermsOfService onClose={handleCloseTerms} />}
      {gameState === 'privacy' && <PrivacyPolicy onClose={handleClosePrivacy} />}
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
