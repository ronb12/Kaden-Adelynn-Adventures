import { useState } from 'react'
import './Store.css'

function SaveLoadManager({ onClose }) {
  const [saves, setSaves] = useState([])
  const [message, setMessage] = useState('')

  const loadSaves = () => {
    const savedGames = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('save-slot-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          savedGames.push({ slot: key.replace('save-slot-', ''), ...data })
        } catch (e) {}
      }
    }
    setSaves(savedGames)
  }

  const handleLoad = (slot) => {
    const saveData = localStorage.getItem(`save-slot-${slot}`)
    if (saveData) {
      localStorage.setItem('kaden-adelynn-save', saveData)
      setMessage(`✅ Loaded save slot ${slot}`)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDelete = (slot) => {
    if (confirm(`Delete save slot ${slot}?`)) {
      localStorage.removeItem(`save-slot-${slot}`)
      loadSaves()
      setMessage(`🗑️ Deleted save slot ${slot}`)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleCreateSlot = () => {
    const currentSave = localStorage.getItem('kaden-adelynn-save')
    if (currentSave) {
      const newSlot = saves.length + 1
      localStorage.setItem(`save-slot-${newSlot}`, currentSave)
      loadSaves()
      setMessage(`✅ Saved to slot ${newSlot}`)
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('❌ No active game to save')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  useState(() => {
    loadSaves()
  }, [])

  return (
    <div className="store-overlay">
      <div className="store-container">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        
        <h2 className="store-title">💾 Save & Load Game</h2>
        
        <div className="store-content" style={{maxHeight: '70vh', overflowY: 'auto'}}>
          
          <div style={{marginBottom: '20px', padding: '15px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '10px', border: '2px solid rgba(102, 126, 234, 0.3)'}}>
            <p style={{marginBottom: '10px', color: 'rgba(255,255,255,0.9)'}}>
              💡 Save your current game progress to a slot, or load a previous save.
            </p>
            <button
              onClick={handleCreateSlot}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              💾 Create New Save Slot
            </button>
          </div>

          {saves.length === 0 && (
            <div style={{padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)'}}>
              <div style={{fontSize: '3rem', marginBottom: '15px'}}>📁</div>
              <p>No saved games yet</p>
              <p style={{fontSize: '0.9rem', marginTop: '10px'}}>Play a game and create a save slot!</p>
            </div>
          )}

          {saves.map((save) => (
            <div
              key={save.slot}
              style={{
                marginBottom: '15px',
                padding: '20px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '15px',
                border: '2px solid rgba(102, 126, 234, 0.3)'
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <h3 style={{marginBottom: '10px', color: '#667eea'}}>Slot {save.slot}</h3>
                  <p style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>
                    Score: {save.score?.toLocaleString() || 0} | Wave: {save.wave || 1} | Level: {save.level || 1}
                  </p>
                  <p style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '5px'}}>
                    {save.timestamp ? new Date(save.timestamp).toLocaleString() : 'Unknown date'}
                  </p>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button
                    onClick={() => handleLoad(save.slot)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(76, 209, 55, 0.8)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    📁 Load
                  </button>
                  <button
                    onClick={() => handleDelete(save.slot)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 107, 107, 0.8)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {message && (
            <div style={{
              marginTop: '20px',
              padding: '12px',
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 'bold',
              border: '2px solid rgba(102, 126, 234, 0.5)'
            }}>
              {message}
            </div>
          )}

          <div style={{marginTop: '20px', padding: '12px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 193, 7, 0.3)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)'}}>
            💡 Tip: Use the in-game pause menu (P key) for quick save/load during gameplay
          </div>
        </div>
      </div>
    </div>
  )
}

export default SaveLoadManager
