import React from 'react';

function GameOverScreen({ score, highScore, wave, onRestart, onMainMenu }) {
  const isNewHighScore = score > highScore;

  return (
    <div className="game-over">
      <h2>Game Over</h2>
      
      {isNewHighScore && (
        <div className="new-high-score">
          <h3>🏆 New High Score! 🏆</h3>
        </div>
      )}

      <div className="score-display">
        <p>Final Score: {score.toLocaleString()}</p>
        <p>Waves Completed: {wave}</p>
        {!isNewHighScore && (
          <p>High Score: {highScore.toLocaleString()}</p>
        )}
      </div>

      <div className="game-over-stats">
        <p>Great effort! Try again to beat your high score!</p>
      </div>

      <div className="menu-buttons">
        <button className="menu-button primary" onClick={onRestart}>
          Play Again
        </button>
        <button className="menu-button secondary" onClick={onMainMenu}>
          Main Menu
        </button>
      </div>
    </div>
  );
}

export default GameOverScreen;



