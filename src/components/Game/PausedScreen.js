import React from 'react';

function PausedScreen({ onResume, onMainMenu }) {
  return (
    <div className="game-paused">
      <h2>Game Paused</h2>
      
      <div className="pause-info">
        <p>Press ESC or P to resume</p>
      </div>

      <div className="menu-buttons">
        <button className="menu-button primary" onClick={onResume}>
          Resume Game
        </button>
        <button className="menu-button secondary" onClick={onMainMenu}>
          Quit to Menu
        </button>
      </div>
    </div>
  );
}

export default PausedScreen;



