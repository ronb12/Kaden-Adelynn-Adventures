/**
 * Campaign Screen Component
 * 300 EPIC Levels with objectives, boss battles, and progression
 */

import React, { useState } from 'react';
import { ALL_CAMPAIGN_LEVELS } from '../../constants/CampaignConstants';
import './CampaignScreen.css';

const CampaignScreen = ({ 
  onStartLevel,
  onBack,
  currentLevel = 1,
  completedLevels = [],
  levelStars = {} // { levelId: starCount }
}) => {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Get all campaign levels
  const allLevels = Object.values(ALL_CAMPAIGN_LEVELS).sort((a, b) => a.id - b.id);
  
  // Check if level is unlocked
  const isLevelUnlocked = (levelId) => {
    if (levelId === 1) return true; // First level always unlocked
    return completedLevels.includes(levelId - 1); // Must complete previous level
  };
  
  // Get level completion status
  const getLevelStatus = (levelId) => {
    if (!isLevelUnlocked(levelId)) return 'locked';
    if (completedLevels.includes(levelId)) return 'completed';
    return 'available';
  };
  
  // Get stars for level
  const getStars = (levelId) => {
    return levelStars[levelId] || 0;
  };
  
  // Get selected level data
  const selectedLevelData = allLevels.find(l => l.id === selectedLevel);
  
  // Handle level selection
  const handleSelectLevel = (levelId) => {
    if (isLevelUnlocked(levelId)) {
      setSelectedLevel(levelId);
    }
  };
  
  // Handle start level
  const handleStartLevel = () => {
    if (selectedLevelData && isLevelUnlocked(selectedLevel)) {
      onStartLevel(selectedLevel, selectedLevelData);
    }
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      tutorial: '#00ff88',
      easy: '#00ccff',
      medium: '#ffaa00',
      hard: '#ff6600',
      extreme: '#ff0066',
      nightmare: '#aa00ff',
      impossible: '#ff0000'
    };
    return colors[difficulty] || '#ffffff';
  };
  
  return (
    <div className="campaign-screen">
      <div className="campaign-header">
        <h1>📋 Campaign Mode</h1>
        <button className="back-button" onClick={onBack}>← Back</button>
      </div>
      
      <div className="campaign-info">
        <div className="campaign-stats">
          <span>🏆 Completed: {completedLevels.length}/300</span>
          <span>⭐ Total Stars: {Object.values(levelStars).reduce((a, b) => a + b, 0)}/900</span>
          <span>📊 Progress: {Math.floor((completedLevels.length / 300) * 100)}%</span>
        </div>
        <div className="view-toggle">
          <button 
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </button>
          <button 
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>
      </div>
      
      <div className="campaign-content">
        {/* Level Grid/List */}
        <div className={`campaign-levels ${viewMode}`}>
          {allLevels.map((level) => {
            const status = getLevelStatus(level.id);
            const stars = getStars(level.id);
            const isSelected = selectedLevel === level.id;
            const isBoss = level.id % 10 === 0;
            
            return (
              <div
                key={level.id}
                className={`level-card ${status} ${isSelected ? 'selected' : ''} ${isBoss ? 'boss' : ''}`}
                onClick={() => handleSelectLevel(level.id)}
                style={{ cursor: status === 'locked' ? 'not-allowed' : 'pointer' }}
              >
                {status === 'locked' && <div className="level-lock">🔒</div>}
                
                <div className="level-number">{level.id}</div>
                
                {isBoss && <div className="boss-badge">👑 BOSS</div>}
                
                <div className="level-name">{level.name}</div>
                
                {status === 'completed' && (
                  <div className="level-stars">
                    {[1, 2, 3].map(star => (
                      <span key={star} className={star <= stars ? 'star-filled' : 'star-empty'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                )}
                
                <div 
                  className="level-difficulty"
                  style={{ color: getDifficultyColor(level.difficulty) }}
                >
                  {level.difficulty}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Level Details Panel */}
        {selectedLevelData && (
          <div className="level-details-panel">
            <h2>Level {selectedLevelData.id}: {selectedLevelData.name}</h2>
            
            <p className="level-description">{selectedLevelData.description}</p>
            
            <div className="level-objectives">
              <h3>🎯 Primary Objective:</h3>
              <p>{formatObjective(selectedLevelData.objectives.primary)}</p>
              
              {selectedLevelData.objectives.bonus && selectedLevelData.objectives.bonus.length > 0 && (
                <>
                  <h3>⭐ Bonus Objectives:</h3>
                  <ul>
                    {selectedLevelData.objectives.bonus.map((bonus, idx) => (
                      <li key={idx}>{formatObjective(bonus)}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            
            <div className="level-rewards">
              <h3>🎁 Rewards:</h3>
              <div className="reward-items">
                <span>💎 {selectedLevelData.rewards.credits} Credits</span>
                <span>⭐ {selectedLevelData.rewards.xp} XP</span>
              </div>
            </div>
            
            <div 
              className="level-difficulty-badge"
              style={{ 
                backgroundColor: getDifficultyColor(selectedLevelData.difficulty) + '22',
                borderColor: getDifficultyColor(selectedLevelData.difficulty)
              }}
            >
              Difficulty: {selectedLevelData.difficulty.toUpperCase()}
            </div>
            
            <button 
              className="start-level-button"
              onClick={handleStartLevel}
              disabled={!isLevelUnlocked(selectedLevel)}
            >
              {isLevelUnlocked(selectedLevel) ? 
                `🚀 Launch Level ${selectedLevel}` : 
                `🔒 Complete Level ${selectedLevel - 1} First`
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper: Format objective text
const formatObjective = (objective) => {
  switch (objective.type) {
    case 'kill_enemies':
      return `Destroy ${objective.target} enemies`;
    case 'survive_time':
      return `Survive for ${objective.target} seconds`;
    case 'defeat_boss':
      return `Defeat the boss`;
    case 'collect_powerups':
      return `Collect ${objective.target} power-ups`;
    case 'no_damage':
      return `Complete without taking damage`;
    case 'time_limit':
      return `Complete in under ${objective.target} seconds`;
    case 'combo_streak':
      return `Achieve ${objective.target}x combo`;
    case 'accuracy':
      return `Maintain ${objective.target}% accuracy`;
    default:
      return objective.description || 'Complete the level';
  }
};

export default CampaignScreen;

