/**
 * Ship Selection Screen
 * Allows players to choose and unlock ships
 */

import React, { useState, useEffect } from 'react';
import { SHIP_TYPES, SHIP_UNLOCK_REQUIREMENTS } from '../../constants/ShipConstants';
import './ShipSelectionScreen.css';

const ShipSelectionScreen = ({ 
  onSelect, 
  onBack, 
  playerStats = {},
  unlockedShips = []
}) => {
  const [selectedShip, setSelectedShip] = useState('phoenixWing');
  const [filter, setFilter] = useState('all'); // all, unlocked, locked
  const [sortBy, setSortBy] = useState('tier'); // tier, speed, health, damage

  // Check if ship is unlocked
  const isShipUnlocked = (shipId) => {
    const ship = SHIP_TYPES[shipId.toUpperCase().replace(/-/g, '_')];
    if (!ship) return false;
    
    if (ship.unlocked) return true;
    if (unlockedShips.includes(shipId)) return true;
    
    const requirements = SHIP_UNLOCK_REQUIREMENTS[shipId];
    if (!requirements) return false;
    
    // Check if all requirements are met
    if (requirements.score && playerStats.highestScore < requirements.score) return false;
    if (requirements.level && playerStats.level < requirements.level) return false;
    if (requirements.kills && playerStats.totalKills < requirements.kills) return false;
    if (requirements.bossesDefeated && playerStats.bossesDefeated < requirements.bossesDefeated) return false;
    
    return true;
  };

  // Get all ships as array
  const allShips = Object.entries(SHIP_TYPES).map(([key, ship]) => ({
    ...ship,
    key: key,
    unlocked: isShipUnlocked(ship.id)
  }));

  // Filter ships
  const filteredShips = allShips.filter(ship => {
    if (filter === 'unlocked') return ship.unlocked;
    if (filter === 'locked') return !ship.unlocked;
    return true;
  });

  // Sort ships
  const sortedShips = [...filteredShips].sort((a, b) => {
    switch (sortBy) {
      case 'speed':
        return b.stats.speed - a.stats.speed;
      case 'health':
        return b.stats.maxHealth - a.stats.maxHealth;
      case 'damage':
        return b.stats.damageMultiplier - a.stats.damageMultiplier;
      case 'tier':
      default:
        return a.cost - b.cost;
    }
  });

  // Get selected ship data
  const selectedShipData = allShips.find(s => s.id === selectedShip);

  // Handle ship selection
  const handleSelect = (shipId, unlocked) => {
    if (!unlocked) return;
    setSelectedShip(shipId);
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedShipData && selectedShipData.unlocked) {
      onSelect(selectedShip);
    }
  };

  return (
    <div className="ship-selection-screen">
      <div className="ship-selection-header">
        <h1>🚀 Ship Hangar</h1>
        <button className="back-button" onClick={onBack}>← Back</button>
      </div>

      <div className="ship-selection-controls">
        <div className="filter-controls">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Ships ({allShips.length})</option>
            <option value="unlocked">Unlocked ({allShips.filter(s => s.unlocked).length})</option>
            <option value="locked">Locked ({allShips.filter(s => !s.unlocked).length})</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="tier">Tier</option>
            <option value="speed">Speed</option>
            <option value="health">Health</option>
            <option value="damage">Damage</option>
          </select>
        </div>
      </div>

      <div className="ship-selection-content">
        <div className="ship-grid">
          {sortedShips.map((ship) => (
            <div
              key={ship.id}
              className={`ship-card ${selectedShip === ship.id ? 'selected' : ''} ${!ship.unlocked ? 'locked' : ''}`}
              onClick={() => handleSelect(ship.id, ship.unlocked)}
            >
              {!ship.unlocked && <div className="lock-icon">🔒</div>}
              
              <div className="ship-preview" style={{ backgroundColor: ship.color + '22', border: `2px solid ${ship.color}` }}>
                <div className="ship-icon" style={{ color: ship.color }}>
                  {ship.unlocked ? '🚀' : '❓'}
                </div>
              </div>
              
              <div className="ship-info">
                <h3>{ship.unlocked ? ship.name : '???'}</h3>
                <p className="ship-character">{ship.character}</p>
                
                {ship.unlocked && (
                  <>
                    <div className="ship-stats-mini">
                      <span title="Speed">⚡ {ship.stats.speed}</span>
                      <span title="Health">❤️ {ship.stats.maxHealth}</span>
                      <span title="Damage">⚔️ {ship.stats.damageMultiplier}x</span>
                    </div>
                    <div className="ship-cost">
                      {ship.cost > 0 ? `${ship.cost} credits` : 'Default'}
                    </div>
                  </>
                )}
                
                {!ship.unlocked && SHIP_UNLOCK_REQUIREMENTS[ship.id] && (
                  <div className="unlock-requirements">
                    <p>Unlock at:</p>
                    <ul>
                      {SHIP_UNLOCK_REQUIREMENTS[ship.id].level && (
                        <li>Level {SHIP_UNLOCK_REQUIREMENTS[ship.id].level}</li>
                      )}
                      {SHIP_UNLOCK_REQUIREMENTS[ship.id].score && (
                        <li>Score {SHIP_UNLOCK_REQUIREMENTS[ship.id].score.toLocaleString()}</li>
                      )}
                      {SHIP_UNLOCK_REQUIREMENTS[ship.id].specialCondition && (
                        <li>{SHIP_UNLOCK_REQUIREMENTS[ship.id].specialCondition}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedShipData && (
          <div className="ship-details-panel">
            <h2>{selectedShipData.name}</h2>
            <p className="ship-description">{selectedShipData.description}</p>
            
            <div className="ship-stats-detailed">
              <h3>Statistics</h3>
              <div className="stat-bar">
                <label>Speed</label>
                <div className="stat-bar-fill">
                  <div className="stat-bar-value" style={{ width: `${(selectedShipData.stats.speed / 10) * 100}%`, backgroundColor: '#00ff88' }}></div>
                </div>
                <span>{selectedShipData.stats.speed}/10</span>
              </div>
              
              <div className="stat-bar">
                <label>Health</label>
                <div className="stat-bar-fill">
                  <div className="stat-bar-value" style={{ width: `${(selectedShipData.stats.maxHealth / 200) * 100}%`, backgroundColor: '#ff4444' }}></div>
                </div>
                <span>{selectedShipData.stats.maxHealth}</span>
              </div>
              
              <div className="stat-bar">
                <label>Damage</label>
                <div className="stat-bar-fill">
                  <div className="stat-bar-value" style={{ width: `${(selectedShipData.stats.damageMultiplier / 3) * 100}%`, backgroundColor: '#ffaa00' }}></div>
                </div>
                <span>{selectedShipData.stats.damageMultiplier}x</span>
              </div>
              
              <div className="stat-bar">
                <label>Fire Rate</label>
                <div className="stat-bar-fill">
                  <div className="stat-bar-value" style={{ width: `${(selectedShipData.stats.fireRateMultiplier / 2) * 100}%`, backgroundColor: '#ff00ff' }}></div>
                </div>
                <span>{selectedShipData.stats.fireRateMultiplier}x</span>
              </div>
              
              <div className="stat-bar">
                <label>Shield</label>
                <div className="stat-bar-fill">
                  <div className="stat-bar-value" style={{ width: `${(selectedShipData.stats.shieldCapacity / 200) * 100}%`, backgroundColor: '#00ccff' }}></div>
                </div>
                <span>{selectedShipData.stats.shieldCapacity}</span>
              </div>
            </div>
            
            <div className="ship-special-ability">
              <h3>Special Ability</h3>
              <div className="ability-card">
                <h4>{selectedShipData.special.name}</h4>
                <p>{selectedShipData.special.description}</p>
              </div>
            </div>
            
            <button 
              className="select-ship-button"
              onClick={handleConfirm}
              disabled={!selectedShipData.unlocked}
            >
              {selectedShipData.unlocked ? 'Select Ship' : '🔒 Locked'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipSelectionScreen;

