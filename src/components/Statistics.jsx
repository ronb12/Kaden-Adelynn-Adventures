import { useState, useEffect } from 'react'
import './Store.css' // Reuse Store styling
import { loadStatistics } from '../utils/firebaseData'

function Statistics({ onClose }) {
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    totalKills: 0,
    highestWave: 0,
    totalPlayTime: 0,
    favoriteWeapon: 'Laser',
    accuracy: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load stats from Firebase
    loadStatistics().then(loadedStats => {
      setStats({
        gamesPlayed: loadedStats.gamesPlayed || 0,
        totalScore: loadedStats.totalScore || 0,
        totalKills: loadedStats.totalKills || 0,
        highestWave: loadedStats.highestWave || 0,
        totalPlayTime: loadedStats.totalPlayTime || 0,
        accuracy: loadedStats.totalShots > 0 
          ? Math.round((loadedStats.totalHits / loadedStats.totalShots) * 100) 
          : 0,
        favoriteWeapon: loadedStats.favoriteWeapon || 'Laser'
      })
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load stats:', err)
      setLoading(false)
    })
  }, [])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="store-overlay">
      <div className="store-modal-container">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        
        <h2 className="store-title">📊 Your Statistics</h2>
        
        {loading ? (
          <div style={{textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)'}}>
            <div style={{fontSize: '2rem', marginBottom: '10px'}}>⏳</div>
            Loading your stats...
          </div>
        ) : (
          <div className="store-content">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
            
            <div className="stat-card" style={{background: 'rgba(102, 126, 234, 0.1)', padding: '20px', borderRadius: '15px', border: '2px solid rgba(102, 126, 234, 0.3)'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>🎮</div>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#667eea'}}>{stats.gamesPlayed}</div>
              <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>Games Played</div>
            </div>

            <div className="stat-card" style={{background: 'rgba(255, 107, 107, 0.1)', padding: '20px', borderRadius: '15px', border: '2px solid rgba(255, 107, 107, 0.3)'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>💯</div>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b'}}>{stats.totalScore.toLocaleString()}</div>
              <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>Total Score</div>
            </div>

            <div className="stat-card" style={{background: 'rgba(76, 209, 55, 0.1)', padding: '20px', borderRadius: '15px', border: '2px solid rgba(76, 209, 55, 0.3)'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>💥</div>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#4cd137'}}>{stats.totalKills.toLocaleString()}</div>
              <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>Total Kills</div>
            </div>

            <div className="stat-card" style={{background: 'rgba(255, 159, 64, 0.1)', padding: '20px', borderRadius: '15px', border: '2px solid rgba(255, 159, 64, 0.3)'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>🌊</div>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#ff9f40'}}>{stats.highestWave}</div>
              <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>Highest Wave</div>
            </div>

            <div className="stat-card" style={{background: 'rgba(155, 89, 182, 0.1)', padding: '20px', borderRadius: '15px', border: '2px solid rgba(155, 89, 182, 0.3)'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>⏱️</div>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#9b59b6'}}>{formatTime(stats.totalPlayTime)}</div>
              <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>Play Time</div>
            </div>

            <div className="stat-card" style={{background: 'rgba(52, 231, 228, 0.1)', padding: '20px', borderRadius: '15px', border: '2px solid rgba(52, 231, 228, 0.3)'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '10px'}}>🎯</div>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#34e7e4'}}>{stats.accuracy}%</div>
              <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>Accuracy</div>
            </div>

          </div>

          <div style={{marginTop: '30px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px'}}>
            <h3 style={{marginBottom: '15px', color: '#667eea'}}>⚔️ Favorite Weapon</h3>
            <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{stats.favoriteWeapon}</div>
          </div>

          <div style={{marginTop: '20px', padding: '15px', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '10px', border: '1px solid rgba(78, 205, 196, 0.3)', textAlign: 'center'}}>
            <small style={{color: 'rgba(255,255,255,0.8)'}}>☁️ Statistics synced with Firebase and update after each game</small>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default Statistics
