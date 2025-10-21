/**
 * Main Menu Screen Component
 * Separated for better maintainability and easier bug fixes
 */

import React from 'react';

function MenuScreen({ 
  onStartGame, 
  onShowControls, 
  onShowHighScores, 
  onShowSettings, 
  onShowAdvancedSettings,
  onShowShipSelection,
  onShowDailyMissions,
  onStartCampaign,
  onToggleFullscreen,
  onShowStarbase,
  onShowTutorial,
  highScore,
  unlockedShipsCount = 2,
  totalShips = 150,
  totalCampaignLevels = 300,
  isFullscreen = false,
  playerLevel = 1,
  playerXP = 0
}) {
  return (
    <div className="game-menu">
      <div className="menu-header">
        <h1 className="menu-title">
          🚀 Kaden & Adelynn Space Adventures 🚀
        </h1>
        <div className="menu-subtitle-container">
          <p className="menu-subtitle">
            🌟 Epic space shooter with {totalShips} ships and {totalCampaignLevels} levels! 🌟
          </p>
        </div>
      </div>

      <div className="menu-characters">
        <div className="character kaden">🚀 Kaden</div>
        <div className="character adelynn">🌟 Adelynn</div>
      </div>

      {highScore > 0 && (
        <div className="score-display">
          <p>🏆 High Score: {highScore.toLocaleString()}</p>
          <p>⭐ Level {playerLevel} • {playerXP.toLocaleString()} XP</p>
        </div>
      )}

      <div className="menu-buttons">
        {/* Primary Actions */}
        <button className="menu-button primary" onClick={onStartGame}>
          🚀 Start Game (Endless Mode)
        </button>
        
        {/* Starbase HQ - Industry First! */}
        {onShowStarbase && (
          <button className="menu-button featured" onClick={onShowStarbase}>
            🏢 Starbase HQ
          </button>
        )}
        
        {/* Main Features */}
        <button className="menu-button secondary" onClick={onShowShipSelection}>
          🛸 Ship Selection ({unlockedShipsCount}/{totalShips})
        </button>
        
        <button className="menu-button secondary" onClick={onStartCampaign}>
          📋 Campaign ({totalCampaignLevels} Levels)
        </button>
        
        <button className="menu-button secondary" onClick={onShowDailyMissions}>
          ⭐ Daily Missions
        </button>
        
        {/* Information & Settings */}
        <button className="menu-button secondary" onClick={onShowControls}>
          🎮 How to Play
        </button>
        
        <button className="menu-button secondary" onClick={onShowHighScores}>
          🏆 High Scores
        </button>
        
        {/* Tutorial */}
        {onShowTutorial && (
          <button className="menu-button secondary" onClick={onShowTutorial}>
            📚 Tutorial
          </button>
        )}
        
        {/* Settings */}
        <button className="menu-button secondary" onClick={onShowSettings}>
          ⚙️ Settings
        </button>
        
        {onShowAdvancedSettings && (
          <button className="menu-button secondary" onClick={onShowAdvancedSettings}>
            🔧 Advanced Settings
          </button>
        )}
        
        {/* Fullscreen Toggle */}
        {onToggleFullscreen && (
          <button className="menu-button secondary" onClick={onToggleFullscreen}>
            {isFullscreen ? '📱 Exit Fullscreen' : '🖥️ Fullscreen'}
          </button>
        )}
      </div>

      {/* Game Info Footer */}
      <div className="menu-footer">
        <p>Made with ❤️ for Kaden & Adelynn</p>
        <p className="menu-stats">
          {totalShips} Ships • {totalCampaignLevels} Levels • 300 Unique Backgrounds
        </p>
      </div>
    </div>
  );
}

export default MenuScreen;



