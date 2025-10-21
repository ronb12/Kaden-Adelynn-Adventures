import React, { useState } from 'react';

function CharacterSelectScreen({ onSelectCharacter, onBack }) {
  const [selectedCharacter, setSelectedCharacter] = useState('kaden');

  const handleStart = () => {
    onSelectCharacter(selectedCharacter);
  };

  return (
    <div className="game-menu">
      <h1 className="menu-title">Choose Your Hero</h1>
      
      <div className="character-selection">
        <div 
          className={`character-card ${selectedCharacter === 'kaden' ? 'selected' : ''}`}
          onClick={() => setSelectedCharacter('kaden')}
        >
          <div className="character-emoji">🚀</div>
          <h3>Kaden</h3>
          <p className="character-description">
            Speed specialist with turbo boost ultimate
          </p>
          <div className="character-stats">
            <div className="stat">⚡ Speed: ★★★★★</div>
            <div className="stat">❤️ Health: ★★★☆☆</div>
            <div className="stat">🔫 Power: ★★★★☆</div>
          </div>
          <div className="character-ultimate">
            <strong>Ultimate:</strong> Turbo Boost<br />
            <small>Extreme speed + invulnerability</small>
          </div>
        </div>

        <div 
          className={`character-card ${selectedCharacter === 'adelynn' ? 'selected' : ''}`}
          onClick={() => setSelectedCharacter('adelynn')}
        >
          <div className="character-emoji">🌟</div>
          <h3>Adelynn</h3>
          <p className="character-description">
            Defense specialist with star shield ultimate
          </p>
          <div className="character-stats">
            <div className="stat">⚡ Speed: ★★★★☆</div>
            <div className="stat">❤️ Health: ★★★★★</div>
            <div className="stat">🔫 Power: ★★★☆☆</div>
          </div>
          <div className="character-ultimate">
            <strong>Ultimate:</strong> Star Shield<br />
            <small>Absorbs damage & reflects bullets</small>
          </div>
        </div>
      </div>

      <div className="menu-buttons">
        <button className="menu-button primary" onClick={handleStart}>
          Start Game
        </button>
        <button className="menu-button secondary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

export default CharacterSelectScreen;



