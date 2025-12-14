import { useState } from 'react'
import './Store.css'

function Customization({ onClose }) {
  const [customization, setCustomization] = useState(() => {
    const saved = localStorage.getItem('gameCustomization')
    return saved ? JSON.parse(saved) : {
      bulletColor: '#00ffff',
      explosionColor: '#ff6b6b',
      trailEffect: 'default',
      screenShake: true,
      particleEffects: true,
      soundEffects: true,
      hudOpacity: 100
    }
  })
  const [message, setMessage] = useState('')

  const colors = [
    { name: 'Cyan', value: '#00ffff' },
    { name: 'Red', value: '#ff3333' },
    { name: 'Green', value: '#00ff00' },
    { name: 'Purple', value: '#9b59b6' },
    { name: 'Yellow', value: '#ffff00' },
    { name: 'Orange', value: '#ff9f40' },
    { name: 'Pink', value: '#ff69b4' },
    { name: 'White', value: '#ffffff' }
  ]

  const trails = [
    { name: 'Default', value: 'default' },
    { name: 'Long', value: 'long' },
    { name: 'Short', value: 'short' },
    { name: 'None', value: 'none' }
  ]

  const handleSave = () => {
    localStorage.setItem('gameCustomization', JSON.stringify(customization))
    setMessage('✅ Customization saved!')
    setTimeout(() => setMessage(''), 2000)
  }

  const updateSetting = (key, value) => {
    setCustomization(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="store-overlay">
      <div className="store-container">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        
        <h2 className="store-title">🎨 Customization</h2>
        
        <div className="store-content" style={{maxHeight: '70vh', overflowY: 'auto'}}>
          
          <div style={{marginBottom: '25px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', border: '2px solid rgba(102, 126, 234, 0.3)'}}>
            <h3 style={{marginBottom: '15px', color: '#667eea'}}>🎨 Bullet Color</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px'}}>
              {colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => updateSetting('bulletColor', color.value)}
                  style={{
                    padding: '15px',
                    background: color.value,
                    border: customization.bulletColor === color.value ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: customization.bulletColor === color.value ? '0 0 15px ' + color.value : 'none',
                    fontWeight: customization.bulletColor === color.value ? 'bold' : 'normal',
                    color: '#000'
                  }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom: '25px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', border: '2px solid rgba(255, 107, 107, 0.3)'}}>
            <h3 style={{marginBottom: '15px', color: '#ff6b6b'}}>💥 Explosion Color</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px'}}>
              {colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => updateSetting('explosionColor', color.value)}
                  style={{
                    padding: '15px',
                    background: color.value,
                    border: customization.explosionColor === color.value ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: customization.explosionColor === color.value ? '0 0 15px ' + color.value : 'none',
                    fontWeight: customization.explosionColor === color.value ? 'bold' : 'normal',
                    color: '#000'
                  }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom: '25px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', border: '2px solid rgba(155, 89, 182, 0.3)'}}>
            <h3 style={{marginBottom: '15px', color: '#9b59b6'}}>✨ Trail Effect</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'}}>
              {trails.map(trail => (
                <button
                  key={trail.value}
                  onClick={() => updateSetting('trailEffect', trail.value)}
                  style={{
                    padding: '15px',
                    background: customization.trailEffect === trail.value ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(100,100,100,0.3)',
                    color: '#fff',
                    border: customization.trailEffect === trail.value ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {trail.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom: '25px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', border: '2px solid rgba(52, 231, 228, 0.3)'}}>
            <h3 style={{marginBottom: '15px', color: '#34e7e4'}}>⚙️ Effects</h3>
            
            <label style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px'}}>
              <span style={{fontSize: '1.1rem'}}>📳 Screen Shake</span>
              <input
                type="checkbox"
                checked={customization.screenShake}
                onChange={(e) => updateSetting('screenShake', e.target.checked)}
                style={{width: '24px', height: '24px', cursor: 'pointer'}}
              />
            </label>

            <label style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px'}}>
              <span style={{fontSize: '1.1rem'}}>✨ Particle Effects</span>
              <input
                type="checkbox"
                checked={customization.particleEffects}
                onChange={(e) => updateSetting('particleEffects', e.target.checked)}
                style={{width: '24px', height: '24px', cursor: 'pointer'}}
              />
            </label>

            <label style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px'}}>
              <span style={{fontSize: '1.1rem'}}>🔊 Sound Effects</span>
              <input
                type="checkbox"
                checked={customization.soundEffects}
                onChange={(e) => updateSetting('soundEffects', e.target.checked)}
                style={{width: '24px', height: '24px', cursor: 'pointer'}}
              />
            </label>

            <div style={{padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px'}}>
              <label style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <span style={{fontSize: '1.1rem'}}>📊 HUD Opacity: {customization.hudOpacity}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customization.hudOpacity}
                  onChange={(e) => updateSetting('hudOpacity', parseInt(e.target.value))}
                  style={{width: '100%'}}
                />
              </label>
            </div>
          </div>

          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, #4cd137 0%, #44bd32 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            💾 Save Customization
          </button>

          {message && (
            <div style={{
              padding: '12px',
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 'bold',
              border: '2px solid rgba(76, 209, 55, 0.5)'
            }}>
              {message}
            </div>
          )}

          <div style={{marginTop: '15px', padding: '12px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 193, 7, 0.3)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)'}}>
            💡 Customization settings apply to your next game
          </div>
        </div>
      </div>
    </div>
  )
}

export default Customization
