import { useState, useEffect } from 'react'
import { getCoins, spendCoins } from '../utils/wallet'
import './Store.css'
import { loadUpgrades, saveUpgrades } from '../utils/firebaseData'

function WeaponUpgrades({ onClose }) {
  const [coins, setCoins] = useState(getCoins())
  const [upgrades, setUpgrades] = useState({
    damage: 1,
    fireRate: 1,
    range: 1,
    pierce: 0,
    spread: 0,
    homing: 0
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUpgrades().then(loadedUpgrades => {
      setUpgrades(loadedUpgrades)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load upgrades:', err)
      setLoading(false)
    })
  }, [])

  const upgradeData = {
    damage: { name: 'Damage', icon: '💥', max: 10, cost: (level) => 100 * level, desc: 'Increase weapon damage' },
    fireRate: { name: 'Fire Rate', icon: '⚡', max: 10, cost: (level) => 150 * level, desc: 'Shoot faster' },
    range: { name: 'Range', icon: '🎯', max: 10, cost: (level) => 120 * level, desc: 'Bullets travel further' },
    pierce: { name: 'Pierce', icon: '🔫', max: 5, cost: (level) => 250 * level, desc: 'Bullets pierce enemies' },
    spread: { name: 'Spread Shot', icon: '🌟', max: 5, cost: (level) => 300 * level, desc: 'Fire multiple bullets' },
    homing: { name: 'Homing', icon: '🎯', max: 5, cost: (level) => 400 * level, desc: 'Bullets track enemies' }
  }

  const handleUpgrade = async (key) => {
    const current = upgrades[key]
    const data = upgradeData[key]
    
    if (current >= data.max) {
      setMessage(`❌ ${data.name} is already maxed out!`)
      setTimeout(() => setMessage(''), 2000)
      return
    }

    const cost = data.cost(current + 1)
    if (coins < cost) {
      setMessage(`❌ Not enough stars! Need ${cost}`)
      setTimeout(() => setMessage(''), 2000)
      return
    }

    spendCoins(cost)
    const newUpgrades = { ...upgrades, [key]: current + 1 }
    setUpgrades(newUpgrades)
    setCoins(getCoins())
    await saveUpgrades(newUpgrades)
    setMessage(`✅ Upgraded ${data.name} to level ${current + 1}!`)
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <div className="store-overlay">
      <div className="store-modal-container">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        
        <h2 className="store-title">⚔️ Weapon Upgrades</h2>
        
        <div style={{textAlign: 'center', marginBottom: '20px', padding: '15px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '10px', border: '2px solid rgba(255, 193, 7, 0.3)'}}>
          <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#ffc107'}}>
            ⭐ {coins.toLocaleString()} Stars
          </div>
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)'}}>
            <div style={{fontSize: '2rem', marginBottom: '10px'}}>⏳</div>
            Loading upgrades...
          </div>
        ) : (
        <div className="store-content">
          {Object.entries(upgradeData).map(([key, data]) => {
            const level = upgrades[key]
            const cost = level < data.max ? data.cost(level + 1) : 0
            const isMaxed = level >= data.max
            const canAfford = coins >= cost

            return (
              <div
                key={key}
                style={{
                  marginBottom: '15px',
                  padding: '20px',
                  background: isMaxed ? 'rgba(76, 209, 55, 0.1)' : 'rgba(0,0,0,0.3)',
                  borderRadius: '15px',
                  border: `2px solid ${isMaxed ? 'rgba(76, 209, 55, 0.5)' : 'rgba(102, 126, 234, 0.3)'}`
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <div style={{fontSize: '2rem'}}>{data.icon}</div>
                    <div>
                      <h3 style={{margin: 0, color: '#667eea'}}>{data.name}</h3>
                      <p style={{margin: '5px 0 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)'}}>{data.desc}</p>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: isMaxed ? '#4cd137' : '#fff'}}>
                      Level {level}/{data.max}
                    </div>
                    {!isMaxed && (
                      <div style={{fontSize: '0.9rem', color: canAfford ? '#ffc107' : '#ff6b6b', marginTop: '5px'}}>
                        💰 {cost}
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{width: '100%', height: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px'}}>
                  <div style={{
                    width: `${(level / data.max) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={isMaxed || !canAfford}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: isMaxed ? 'rgba(76, 209, 55, 0.5)' : canAfford ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(100,100,100,0.3)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: isMaxed || !canAfford ? 'not-allowed' : 'pointer',
                    opacity: isMaxed || !canAfford ? 0.5 : 1
                  }}
                >
                  {isMaxed ? '✅ Maxed Out' : canAfford ? '⬆️ Upgrade' : '❌ Not Enough Stars'}
                </button>
              </div>
            )
          })}

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
            ☁️ Upgrades synced with Firebase - permanent across all devices!
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default WeaponUpgrades
