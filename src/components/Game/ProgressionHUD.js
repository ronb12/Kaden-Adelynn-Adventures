import React from 'react';

function ProgressionHUD({ metaProgression }) {
  if (!metaProgression || !metaProgression.playerData) return null;
  
  const { level, credits, totalXP } = metaProgression.playerData;
  const progress = metaProgression.getLevelProgress();
  
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.7)',
      border: '2px solid rgba(0, 200, 255, 0.5)',
      borderRadius: '8px',
      padding: '12px 16px',
      minWidth: '200px',
      zIndex: 100
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{ color: '#00ccff', fontWeight: 'bold', fontSize: '1.1em' }}>
          LEVEL {level}
        </span>
        <span style={{ color: '#ffaa00', fontSize: '0.9em' }}>
          💰 {credits.toLocaleString()}
        </span>
      </div>
      
      {/* XP Progress Bar */}
      <div style={{
        width: '100%',
        height: '12px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '6px',
        overflow: 'hidden',
        marginBottom: '4px'
      }}>
        <div style={{
          width: `${Math.min(100, progress.percent)}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #00ff88, #00ccff)',
          boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      <div style={{ 
        fontSize: '0.75em', 
        color: '#aaa',
        textAlign: 'right'
      }}>
        {progress.current.toLocaleString()} / {progress.needed.toLocaleString()} XP
      </div>
    </div>
  );
}

export default ProgressionHUD;

