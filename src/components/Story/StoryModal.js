import React, { useState, useEffect } from 'react';
import { STORY_CHAPTERS, CHARACTER_BIOGRAPHIES, VOID_EMPIRE_LORE, FEDERATION_LORE } from '../../constants/StoryConstants.js';
import './StoryModal.css';

const StoryModal = ({ isOpen, onClose, chapterId, characterId, onCharacterSelect }) => {
  const [currentTab, setCurrentTab] = useState('story');
  const [currentChapter, setCurrentChapter] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && chapterId) {
      setCurrentChapter(STORY_CHAPTERS[chapterId]);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [isOpen, chapterId]);

  if (!isOpen || !currentChapter) return null;

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const renderStoryContent = () => {
    switch (currentTab) {
      case 'story':
        return (
          <div className="story-content">
            <h2 className="story-title">{currentChapter.title}</h2>
            <div className="story-text">
              {currentChapter.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="story-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
            {currentChapter.unlockScore && (
              <div className="story-unlock">
                <span className="unlock-label">Unlocked at:</span>
                <span className="unlock-score">{currentChapter.unlockScore.toLocaleString()} points</span>
              </div>
            )}
          </div>
        );
      
      case 'characters':
        return (
          <div className="characters-content">
            <h2 className="characters-title">Meet the Heroes</h2>
            <div className="characters-grid">
              {Object.entries(CHARACTER_BIOGRAPHIES).map(([key, character]) => (
                <div 
                  key={key} 
                  className={`character-card ${characterId === key.toLowerCase() ? 'selected' : ''}`}
                  onClick={() => onCharacterSelect && onCharacterSelect(key.toLowerCase())}
                >
                  <div className="character-avatar">
                    {key === 'KADEN' ? '👨‍🚀' : '👩‍🚀'}
                  </div>
                  <h3 className="character-name">{character.name}</h3>
                  <p className="character-title">{character.title}</p>
                  <div className="character-details">
                    <p><strong>Age:</strong> {character.age}</p>
                    <p><strong>Ship:</strong> {character.ship_name}</p>
                    <p><strong>Specialty:</strong> {character.special_ability}</p>
                  </div>
                  <div className="character-bio">
                    <p>{character.background}</p>
                  </div>
                  <div className="character-personality">
                    <em>"{character.personality}"</em>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'lore':
        return (
          <div className="lore-content">
            <h2 className="lore-title">Galaxy Lore</h2>
            <div className="lore-sections">
              <div className="lore-section">
                <h3 className="lore-section-title">🌌 The Void Empire</h3>
                <div className="lore-text">
                  <h4>Origin</h4>
                  <p>{VOID_EMPIRE_LORE.ORIGIN}</p>
                  
                  <h4>Technology</h4>
                  <p>{VOID_EMPIRE_LORE.TECHNOLOGY}</p>
                  
                  <h4>Hierarchy</h4>
                  <p>{VOID_EMPIRE_LORE.HIERARCHY}</p>
                </div>
              </div>
              
              <div className="lore-section">
                <h3 className="lore-section-title">🛡️ United Earth Federation</h3>
                <div className="lore-text">
                  <h4>History</h4>
                  <p>{FEDERATION_LORE.HISTORY}</p>
                  
                  <h4>Technology</h4>
                  <p>{FEDERATION_LORE.TECHNOLOGY}</p>
                  
                  <h4>Values</h4>
                  <p>{FEDERATION_LORE.VALUES}</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`story-modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`story-modal ${isAnimating ? 'animating' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="story-modal-header">
          <div className="story-tabs">
            <button 
              className={`story-tab ${currentTab === 'story' ? 'active' : ''}`}
              onClick={() => handleTabChange('story')}
            >
              📖 Story
            </button>
            <button 
              className={`story-tab ${currentTab === 'characters' ? 'active' : ''}`}
              onClick={() => handleTabChange('characters')}
            >
              👥 Characters
            </button>
            <button 
              className={`story-tab ${currentTab === 'lore' ? 'active' : ''}`}
              onClick={() => handleTabChange('lore')}
            >
              🌌 Lore
            </button>
          </div>
          <button className="story-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="story-modal-content">
          {renderStoryContent()}
        </div>
        
        <div className="story-modal-footer">
          <button className="story-button primary" onClick={onClose}>
            Continue Mission
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryModal;
