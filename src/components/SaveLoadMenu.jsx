import { useState, useEffect } from 'react'
import { getAvailableSlots, loadGame, deleteSave, getSaveSlotInfo } from '../utils/saveLoad'
import './SaveLoadMenu.css'

function SaveLoadMenu({ onClose, onLoadGame }) {
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)

  useEffect(() => {
    updateSlots()
  }, [])

  const updateSlots = () => {
    setSlots(getAvailableSlots())
  }

  const handleLoad = (slot) => {
    const saveData = loadGame(slot)
    if (saveData && onLoadGame) {
      onLoadGame(saveData)
      onClose()
    }
  }

  const handleDelete = (slot) => {
    if (window.confirm('Are you sure you want to delete this save?')) {
      deleteSave(slot)
      updateSlots()
    }
  }

  return (
    <div className="save-load-overlay">
      <div className="save-load-container">
        <div className="save-load-header">
          <h1>💾 Save/Load Game</h1>
          <button className="save-load-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="save-load-content">
          <div className="save-slots-grid">
            {slots.map((slotInfo, index) => (
              <div key={slotInfo.slot} className="save-slot-card">
                {slotInfo.empty ? (
                  <div className="empty-slot">
                    <div className="slot-icon">📁</div>
                    <div className="slot-label">Slot {index + 1}</div>
                    <div className="slot-status">Empty</div>
                  </div>
                ) : (
                  <div className="filled-slot">
                    <div className="slot-header">
                      <div className="slot-icon">💾</div>
                      <div className="slot-info">
                        <div className="slot-label">Slot {index + 1}</div>
                        <div className="slot-date">{slotInfo.date}</div>
                      </div>
                    </div>
                    <div className="slot-details">
                      <div className="slot-stat">
                        <span className="stat-label">Score:</span>
                        <span className="stat-value">{slotInfo.score.toLocaleString()}</span>
                      </div>
                      <div className="slot-stat">
                        <span className="stat-label">Wave:</span>
                        <span className="stat-value">{slotInfo.wave}</span>
                      </div>
                      <div className="slot-stat">
                        <span className="stat-label">Kills:</span>
                        <span className="stat-value">{slotInfo.kills}</span>
                      </div>
                      <div className="slot-stat">
                        <span className="stat-label">Weapon:</span>
                        <span className="stat-value">{slotInfo.weapon}</span>
                      </div>
                      <div className="slot-stat">
                        <span className="stat-label">Difficulty:</span>
                        <span className="stat-value">{slotInfo.difficulty}</span>
                      </div>
                    </div>
                    <div className="slot-actions">
                      <button
                        className="slot-btn load-btn"
                        onClick={() => handleLoad(slotInfo.slot)}
                      >
                        Load
                      </button>
                      <button
                        className="slot-btn delete-btn"
                        onClick={() => handleDelete(slotInfo.slot)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="save-load-footer">
          <p className="save-hint">
            💡 Tip: The game auto-saves checkpoints every 30 seconds. You can also manually save from the pause menu.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SaveLoadMenu
