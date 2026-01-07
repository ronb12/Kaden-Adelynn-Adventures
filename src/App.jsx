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
import Statistics from './components/Statistics'
import SaveLoadManager from './components/SaveLoadManager'
import WeaponUpgrades from './components/WeaponUpgrades'
import Customization from './components/Customization'
import DailyVault from './components/DailyVault'
import ChallengeLadder from './components/ChallengeLadder'
import SeasonTrack from './components/SeasonTrack'
import Missions from './components/Missions'
import Leagues from './components/Leagues'
import './App.css'

function App() {
  const [gameState, setGameState] = useState(() => 'menu')
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
    setGameState('playing')
  }

  const handleOpenStoryMode = () => {
    setGameState('storymode')
  }

  const handleCloseStoryMode = () => {
    setGameState('menu')
  }

  const handleStartStoryMission = (mission) => {
    // Set game config for story mission
    const characterId = mission.characterId || 'kaden'
    setGameConfig({
      difficulty: 'medium',
      ship: characterId,
      character: characterId,
      mission: mission,
      runMode: 'storyMode',
    })
    setGameState('playing')
  }
  const handlePauseToggle = () => setPaused((p) => !p)
  
  const handleGameOver = (finalScore, wave, level, kills, combo) => {
    setGameStats({ score: finalScore, wave, level, kills, combo })
    setGameState('gameover')
  }

  const handleRestart = () => setGameState('playing')
  const handleReturnToMenu = () => setGameState('menu')
  const handleOpenStore = () => setGameState('store')
  const handleCloseStore = () => setGameState('menu')
  const handleOpenShips = () => setGameState('ships')
  const handleCloseShips = () => setGameState('menu')
  
  const handleSelectShip = (shipId) => {
    setGameConfig((prev) => ({ ...prev, ship: shipId }))
    localStorage.setItem('selectedShip', shipId)
  }

  const handleOpenCharacters = () => setGameState('characters')
  const handleCloseCharacters = () => setGameState('menu')
  
  const handleSelectCharacter = (characterId) => {
    setGameConfig((prev) => ({ ...prev, character: characterId }))
    localStorage.setItem('selectedCharacter', characterId)
  }

  const handleOpenScores = () => setGameState('scores')
  const handleCloseScores = () => setGameState('menu')
  const handleOpenTerms = () => setGameState('terms')
  const handleCloseTerms = () => setGameState('menu')
  const handleOpenPrivacy = () => setGameState('privacy')
  const handleClosePrivacy = () => setGameState('menu')
  
  // Additional feature handlers
  const handleOpenStats = () => setGameState('stats')
  const handleCloseStats = () => setGameState('menu')
  const handleOpenSaveLoad = () => setGameState('saveload')
  const handleCloseSaveLoad = () => setGameState('menu')
  const handleOpenWeaponUpgrades = () => setGameState('upgrades')
  const handleCloseWeaponUpgrades = () => setGameState('menu')
  const handleOpenCustomization = () => setGameState('customization')
  const handleCloseCustomization = () => setGameState('menu')
  const handleOpenDailyVault = () => setGameState('dailyvault')
  const handleCloseDailyVault = () => setGameState('menu')
  const handleOpenChallengeLadder = () => setGameState('challengeladder')
  const handleCloseChallengeLadder = () => setGameState('menu')
  const handleOpenSeasonTrack = () => setGameState('seasontrack')
  const handleCloseSeasonTrack = () => setGameState('menu')
  const handleOpenMissions = () => setGameState('missions')
  const handleCloseMissions = () => setGameState('menu')
  const handleOpenLeagues = () => setGameState('leagues')
  const handleCloseLeagues = () => setGameState('menu')

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
          onOpenStats={handleOpenStats}
          onOpenSaveLoad={handleOpenSaveLoad}
          onOpenWeaponUpgrades={handleOpenWeaponUpgrades}
          onOpenCustomization={handleOpenCustomization}
          onOpenStoryMode={handleOpenStoryMode}
          onOpenDailyVault={handleOpenDailyVault}
          onOpenChallengeLadder={handleOpenChallengeLadder}
          onOpenSeasonTrack={handleOpenSeasonTrack}
          onOpenMissions={handleOpenMissions}
          onOpenLeagues={handleOpenLeagues}
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
      {gameState === 'stats' && <Statistics onClose={handleCloseStats} />}
      {gameState === 'saveload' && <SaveLoadManager onClose={handleCloseSaveLoad} />}
      {gameState === 'upgrades' && <WeaponUpgrades onClose={handleCloseWeaponUpgrades} />}
      {gameState === 'customization' && <Customization onClose={handleCloseCustomization} />}
      {gameState === 'dailyvault' && <DailyVault onClose={handleCloseDailyVault} />}
      {gameState === 'challengeladder' && <ChallengeLadder onClose={handleCloseChallengeLadder} />}
      {gameState === 'seasontrack' && <SeasonTrack onClose={handleCloseSeasonTrack} />}
      {gameState === 'missions' && <Missions onClose={handleCloseMissions} />}
      {gameState === 'leagues' && <Leagues onClose={handleCloseLeagues} />}
      {gameState === 'storymode' && (
        <Story
          onContinue={handleCloseStoryMode}
          onStartMission={handleStartStoryMission}
        />
      )}
      {gameState === 'playing' && (
        <Game
          onPause={handlePauseToggle}
          onGameOver={handleGameOver}
          difficulty={gameConfig.difficulty}
          selectedShip={gameConfig.ship}
          selectedCharacter={gameConfig.character}
          playerName={playerName}
          isPaused={paused}
          mission={gameConfig.mission}
          runMode={gameConfig.runMode}
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
