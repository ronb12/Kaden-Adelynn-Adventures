import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
import Customization from './components/Customization'
import DailyVault from './components/DailyVault'
import ChallengeLadder from './components/ChallengeLadder'
import SeasonTrack from './components/SeasonTrack'
import Missions from './components/Missions'
import Leagues from './components/Leagues'
import './App.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get initial state from URL
  const getStateFromPath = (pathname) => {
    const path = pathname.replace('/', '') || 'menu'
    return path === '' ? 'menu' : path
  }
  
  const [gameState, setGameState] = useState(() => getStateFromPath(location.pathname))
  const [gameConfig, setGameConfig] = useState({
    difficulty: 'medium',
    ship: 'kaden',
    character: 'kaden',
  })
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || 'Player')

  useEffect(() => {
    localStorage.setItem('playerName', playerName)
  }, [playerName])

  // Sync state with URL changes (browser back/forward)
  useEffect(() => {
    const newState = getStateFromPath(location.pathname)
    if (newState !== gameState) {
      setGameState(newState)
    }
  }, [location.pathname])

  // Sync gameState with URL
  useEffect(() => {
    if (gameState && gameState !== 'menu') {
      const currentPath = location.pathname.replace('/', '') || 'menu'
      if (currentPath !== gameState) {
        navigate(`/${gameState}`, { replace: true })
      }
    } else if (gameState === 'menu' && location.pathname !== '/' && location.pathname !== '/menu') {
      navigate('/', { replace: true })
    }
  }, [gameState, navigate, location.pathname])
  
  const [gameStats, setGameStats] = useState({ score: 0, wave: 1, level: 1, kills: 0, combo: 0 })
  const [paused, setPaused] = useState(false)

  const handleStartGame = (difficulty, ship, character, name) => {
    if (name) setPlayerName(name)
    setGameConfig({ difficulty, ship, character })
    setGameState('playing')
    navigate('/playing')
  }

  const handleOpenStoryMode = () => {
    setGameState('storymode')
    navigate('/storymode')
  }

  const handleCloseStoryMode = () => {
    setGameState('menu')
    navigate('/')
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
    navigate('/playing')
  }
  const handlePauseToggle = () => setPaused((p) => !p)
  
  const handleGameOver = (finalScore, wave, level, kills, combo) => {
    setGameStats({ score: finalScore, wave, level, kills, combo })
    setGameState('gameover')
    navigate('/gameover')
  }

  const handleRestart = () => {
    setGameState('playing')
    navigate('/playing')
  }
  const handleReturnToMenu = () => {
    setGameState('menu')
    navigate('/')
  }
  const handleOpenStore = () => {
    setGameState('store')
    navigate('/store')
  }
  const handleCloseStore = () => {
    setGameState('menu')
    navigate('/')
  }
  const handleOpenShips = () => {
    setGameState('ships')
    navigate('/ships')
  }
  const handleCloseShips = () => {
    setGameState('menu')
    navigate('/')
  }
  
  const handleSelectShip = (shipId) => {
    setGameConfig((prev) => ({ ...prev, ship: shipId }))
    localStorage.setItem('selectedShip', shipId)
  }

  const handleOpenCharacters = () => {
    setGameState('characters')
    navigate('/characters')
  }
  const handleCloseCharacters = () => {
    setGameState('menu')
    navigate('/')
  }
  
  const handleSelectCharacter = (characterId) => {
    setGameConfig((prev) => ({ ...prev, character: characterId }))
    localStorage.setItem('selectedCharacter', characterId)
  }

  const handleOpenScores = () => {
    setGameState('scores')
    navigate('/scores')
  }
  const handleCloseScores = () => {
    setGameState('menu')
    navigate('/')
  }
  const handleOpenTerms = () => {
    setGameState('terms')
    navigate('/terms')
  }
  const handleCloseTerms = () => {
    setGameState('menu')
    navigate('/')
  }
  const handleOpenPrivacy = () => {
    setGameState('privacy')
    navigate('/privacy')
  }
  const handleClosePrivacy = () => {
    setGameState('menu')
    navigate('/')
  }
  
  // Additional feature handlers
  const handleOpenStats = () => {
    setGameState('stats')
    navigate('/stats')
  }
  const handleCloseStats = () => {
    setGameState('menu')
    navigate('/')
  }
  const handleOpenSaveLoad = () => {
    setGameState('saveload')
    navigate('/saveload')
  }
  const handleCloseSaveLoad = () => {
    setGameState('menu')
    navigate('/')
  }
  const handleOpenWeaponUpgrades = () => {
    setGameState('upgrades')
    navigate('/upgrades')
  }
  const handleOpenCustomization = () => {
    setGameState('customization')
    navigate('/customization')
  }
  const handleCloseCustomization = () => {
    setGameState('menu')
    navigate('/')
  }
  const handleOpenDailyVault = () => {
    setGameState('dailyvault')
    navigate('/dailyvault')
  }
  const handleCloseDailyVault = () => {
    setGameState('menu')
    navigate('/')
  }
  const handleOpenChallengeLadder = () => {
    setGameState('challengeladder')
    navigate('/challengeladder')
  }
  const handleCloseChallengeLadder = () => {
    setGameState('menu')
    navigate('/')
  }
  const handleOpenSeasonTrack = () => {
    setGameState('seasontrack')
    navigate('/seasontrack')
  }
  const handleCloseSeasonTrack = () => {
    setGameState('menu')
    navigate('/')
  }
  const handleOpenMissions = () => {
    setGameState('missions')
    navigate('/missions')
  }
  const handleCloseMissions = () => {
    setGameState('menu')
    navigate('/')
  }
  const handleOpenLeagues = () => {
    setGameState('leagues')
    navigate('/leagues')
  }
  const handleCloseLeagues = () => {
    setGameState('menu')
    navigate('/')
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={
          <MainMenu
            onStartGame={handleStartGame}
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
        } />
        <Route path="/menu" element={
          <MainMenu
            onStartGame={handleStartGame}
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
        } />
        <Route path="/store" element={<Store onClose={handleCloseStore} />} />
        <Route path="/upgrades" element={<Store onClose={handleCloseStore} initialTab="weapon" />} />
        <Route path="/ships" element={
          <ShipSelector
            onClose={handleCloseShips}
            onSelectShip={handleSelectShip}
            selectedShip={gameConfig.ship}
          />
        } />
        <Route path="/characters" element={
          <CharacterSelector
            onClose={handleCloseCharacters}
            onSelectCharacter={handleSelectCharacter}
            selectedCharacter={gameConfig.character}
          />
        } />
        <Route path="/scores" element={<TopScores onClose={handleCloseScores} />} />
        <Route path="/terms" element={<TermsOfService onClose={handleCloseTerms} />} />
        <Route path="/privacy" element={<PrivacyPolicy onClose={handleClosePrivacy} />} />
        <Route path="/stats" element={<Statistics onClose={handleCloseStats} />} />
        <Route path="/saveload" element={<SaveLoadManager onClose={handleCloseSaveLoad} />} />
        <Route path="/customization" element={<Customization onClose={handleCloseCustomization} />} />
        <Route path="/dailyvault" element={<DailyVault onClose={handleCloseDailyVault} />} />
        <Route path="/challengeladder" element={<ChallengeLadder onClose={handleCloseChallengeLadder} />} />
        <Route path="/seasontrack" element={<SeasonTrack onClose={handleCloseSeasonTrack} />} />
        <Route path="/missions" element={<Missions onClose={handleCloseMissions} />} />
        <Route path="/leagues" element={<Leagues onClose={handleCloseLeagues} />} />
        <Route path="/storymode" element={
          <Story
            onContinue={handleCloseStoryMode}
            onStartMission={handleStartStoryMission}
          />
        } />
        <Route path="/playing" element={
          <Game
            onPause={handlePauseToggle}
            onGameOver={handleGameOver}
            onReturnToMenu={handleReturnToMenu}
            difficulty={gameConfig.difficulty}
            selectedShip={gameConfig.ship}
            selectedCharacter={gameConfig.character}
            playerName={playerName}
            isPaused={paused}
            mission={gameConfig.mission}
            runMode={gameConfig.runMode}
          />
        } />
        <Route path="/gameover" element={
          <GameOver
            score={gameStats.score}
            wave={gameStats.wave}
            level={gameStats.level}
            kills={gameStats.kills}
            combo={gameStats.combo}
            onRestart={handleRestart}
            onMenu={handleReturnToMenu}
          />
        } />
      </Routes>
    </div>
  )
}

export default App
