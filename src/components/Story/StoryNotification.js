import React, { useState, useEffect } from 'react';
import './StoryNotification.css';

const StoryNotification = ({ event, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (event) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [event, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible || !event) return null;

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'chapter':
        return '📖';
      case 'event':
        return '✨';
      default:
        return '📢';
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'chapter':
        return '#00ffff';
      case 'event':
        return '#ffff00';
      default:
        return '#ff6b6b';
    }
  };

  return (
    <div className={`story-notification ${isAnimating ? 'animating' : ''}`}>
      <div 
        className="story-notification-content"
        style={{ borderColor: getEventColor(event.type) }}
      >
        <div className="story-notification-header">
          <span className="story-notification-icon">
            {getEventIcon(event.type)}
          </span>
          <span className="story-notification-title">
            {event.type === 'chapter' ? event.data.title : event.data.title}
          </span>
          <button 
            className="story-notification-close"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>
        
        <div className="story-notification-body">
          <p className="story-notification-message">
            {event.type === 'chapter' ? 
              `New chapter unlocked: ${event.data.title}` : 
              event.data.message
            }
          </p>
          
          {event.type === 'chapter' && event.data.unlockScore && (
            <div className="story-notification-unlock">
              <span className="unlock-text">Unlocked at {event.data.unlockScore.toLocaleString()} points</span>
            </div>
          )}
        </div>
        
        <div className="story-notification-footer">
          <button 
            className="story-notification-button"
            onClick={handleClose}
          >
            {event.type === 'chapter' ? 'Read Story' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryNotification;
