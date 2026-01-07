import { useState } from 'react'
import './Missions.css'

function Missions({ onClose }) {
  const [missions] = useState([
    { id: 'daily', title: 'Daily Mission', description: 'Complete today\'s challenge', reward: '100 ⭐', completed: false },
    { id: 'wave5', title: 'Wave Warrior', description: 'Reach wave 5', reward: '200 ⭐', completed: false },
    { id: 'boss', title: 'Boss Slayer', description: 'Defeat a boss', reward: '300 ⭐', completed: false },
    { id: 'combo', title: 'Combo Master', description: 'Achieve 10x combo', reward: '250 ⭐', completed: false },
    { id: 'accuracy', title: 'Sharpshooter', description: 'Maintain 80% accuracy', reward: '150 ⭐', completed: false },
  ])

  return (
    <div className="missions-page">
      <div className="missions-background">
        <div className="missions-stars"></div>
      </div>

      <div className="missions-container">
        <header className="missions-header">
          <div className="missions-header-content">
            <h1 className="missions-main-title">
              <span className="missions-title-icon">🎯</span>
              Missions
            </h1>
            <p className="missions-header-subtitle">Complete missions to earn rewards</p>
          </div>
          <button className="missions-back-button" onClick={onClose}>
            <span className="back-icon">←</span>
            Back to Menu
          </button>
        </header>

        <div className="missions-section">
          <div className="missions-list">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className={`missions-card ${mission.completed ? 'completed' : ''}`}
              >
                <div className="missions-card-content">
                  <h3 className="missions-card-title">{mission.title}</h3>
                  <p className="missions-card-description">{mission.description}</p>
                </div>
                <div className="missions-card-reward">{mission.reward}</div>
                <div className="missions-card-status">
                  {mission.completed ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Missions

