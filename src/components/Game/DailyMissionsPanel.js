import React from 'react';

function DailyMissionsPanel({ missions, onClose, onClaimReward }) {
  const timeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content daily-missions" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>⭐ Daily Missions</h2>
        <p style={{ fontSize: '0.9em', color: '#888', marginBottom: '20px' }}>
          Resets in: {timeUntilReset()}
        </p>

        {missions && missions.length > 0 ? (
          <div className="missions-list">
            {missions.map((mission) => (
              <div 
                key={mission.id} 
                className={`mission-card ${mission.completed ? 'completed' : ''} ${mission.claimed ? 'claimed' : ''}`}
                style={{
                  background: mission.completed ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: mission.completed ? '2px solid #00ff00' : '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#00ccff' }}>{mission.name}</h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.9em' }}>{mission.description}</p>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${mission.getProgressPercent()}%`,
                          height: '100%',
                          background: mission.completed ? '#00ff00' : 'linear-gradient(90deg, #00ccff, #0088ff)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <p style={{ fontSize: '0.8em', margin: '4px 0 0 0', color: '#aaa' }}>
                        Progress: {mission.progress} / {mission.target}
                      </p>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      fontSize: '0.85em',
                      color: '#ffaa00'
                    }}>
                      <span>🎖️ {mission.reward.xp} XP</span>
                      <span>💰 {mission.reward.credits} Credits</span>
                    </div>
                  </div>

                  {mission.completed && !mission.claimed && (
                    <button
                      onClick={() => onClaimReward(mission.id)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #00ff88, #00ccff)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#000',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginLeft: '12px'
                      }}
                    >
                      Claim!
                    </button>
                  )}

                  {mission.claimed && (
                    <div style={{
                      padding: '8px 16px',
                      background: 'rgba(0, 255, 0, 0.2)',
                      border: '1px solid #00ff00',
                      borderRadius: '6px',
                      color: '#00ff00',
                      marginLeft: '12px'
                    }}>
                      ✓ Claimed
                    </div>
                  )}
                </div>

                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  fontSize: '0.75em',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: mission.difficulty === 'hard' ? '#ff4400' : mission.difficulty === 'normal' ? '#ffaa00' : '#00ff88',
                  color: '#000',
                  fontWeight: 'bold'
                }}>
                  {mission.difficulty.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#888' }}>No missions available</p>
        )}

        <button 
          className="menu-button primary" 
          onClick={onClose}
          style={{ width: '100%', marginTop: '20px' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default DailyMissionsPanel;

