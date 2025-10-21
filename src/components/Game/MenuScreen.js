import React from 'react';

function MenuScreen({ 
  onStartGame, 
  onShowControls, 
  onShowHighScores, 
  onShowSettings, 
  onShowShipSelection,
  onShowDailyMissions,
  onStartCampaign,
  highScore,
  unlockedShipsCount = 2
}) {
  return (
    <div className="game-menu">
      <h1 className="menu-title">
        🚀 Kaden & Adelynn<br />
        Space Adventures 🌟
      </h1>
      <p className="menu-subtitle">
        Join Kaden and Adelynn on an epic space adventure!<br />
        Defeat aliens, collect power-ups, and save the galaxy!
      </p>

      <div className="menu-characters">
        <div className="character kaden">🚀 Kaden</div>
        <div className="character adelynn">🌟 Adelynn</div>
      </div>

      {highScore > 0 && (
        <div className="score-display">
          <p>High Score: {highScore.toLocaleString()}</p>
        </div>
      )}

      <div className="menu-buttons">
        <button className="menu-button primary" onClick={onStartGame}>
          🚀 Endless Mode
        </button>
        <button className="menu-button secondary" onClick={onShowShipSelection}>
          🛸 Ship Selection ({unlockedShipsCount}/20)
        </button>
        <button className="menu-button secondary" onClick={onStartCampaign}>
          📋 Campaign (50 Levels)
        </button>
        <button className="menu-button secondary" onClick={onShowDailyMissions}>
          ⭐ Daily Missions
        </button>
        <button className="menu-button secondary" onClick={onShowControls}>
          🎮 Controls
        </button>
        <button className="menu-button secondary" onClick={onShowHighScores}>
          🏆 High Scores
        </button>
        <button className="menu-button secondary" onClick={onShowSettings}>
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}

export default MenuScreen;



