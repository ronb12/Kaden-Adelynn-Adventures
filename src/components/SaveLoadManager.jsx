import { useState, useEffect } from 'react'
import './Store.css'
import { loadAllSaves, loadSaveSlot, saveSaveSlot, deleteSaveSlot } from '../utils/firebaseData'

function SaveLoadManager({ onClose }) {
  const [saves, setSaves] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadSaves = async () => {
    setLoading(true)
    try {
      const savedGames = await loadAllSaves()
      setSaves(savedGames.sort((a, b) => a.slotId - b.slotId))
    } catch (error) {
      console.error('Failed to load saves:', error)
      setMessage('❌ Failed to load saves')
      setTimeout(() => setMessage(''), 3000)
    }
    setLoading(false)
  }

  const handleLoad = async (slot) => {
    try {
      const saveData = await loadSaveSlot(slot)
      if (saveData) {
        localStorage.setItem('kaden-adelynn-save', JSON.stringify(saveData))
        setMessage(`✅ Loaded save slot ${slot}`)
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage(`❌ Failed to load slot ${slot}`)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDelete = async (slot) => {
    if (confirm(`Delete save slot ${slot}?`)) {
      try {
        await deleteSaveSlot(slot)
        await loadSaves()
        setMessage(`🗑️ Deleted save slot ${slot}`)
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        setMessage(`❌ Failed to delete slot ${slot}`)
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  const handleCreateSlot = async () => {
    const currentSave = localStorage.getItem('kaden-adelynn-save')
    if (currentSave) {
      try {
        const saveData = JSON.parse(currentSave)
        const newSlot = saves.length + 1
        await saveSaveSlot(newSlot, {
          ...saveData,
          timestamp: Date.now()
        })
        await loadSaves()
        setMessage(`✅ Saved to slot ${newSlot}`)
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        setMessage('❌ Failed to create save')
        setTimeout(() => setMessage(''), 3000)
      }
    } else {
      setMessage('❌ No active game to save')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  useEffect(() => {
    loadSaves()
  }, [])

  return (
    <div className="store-overlay">
      <div className="store-container">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        
        <h2 className="store-title">💾 Save & Load Game</h2>
        
        {loading ? (
          <div style={{textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)'}}>
            <div style={{fontSize: '2rem', marginBottom: '10px'}}>⏳</div>
            Loading saves...
          </div>
        ) : (
        <div className="store-content">
          
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
              key={save.slotId}
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
                  <h3 style={{marginBottom: '10px', color: '#667eea'}}>Slot {save.slotId}</h3>
                  <p style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>
                    Score: {save.score?.toLocaleString() || 0} | Wave: {save.wave || 1} | Level: {save.level || 1}
                  </p>
                  <p style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '5px'}}>
                    {save.timestamp ? new Date(save.timestamp).toLocaleString() : 'Unknown date'}
                  </p>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button
                    onClick={() => handleLoad(save.slotId)}
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
                    onClick={() => handleDelete(save.slotId)}
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

          <div style={{marginTop: '20px', padding: '12px', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '8px', border: '1px solid rgba(78, 205, 196, 0.3)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)'}}>
            ☁️ Saves synced with Firebase - access from any device!
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default SaveLoadManager
