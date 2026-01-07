import { useState, useEffect, useRef } from 'react'
import { getCoins, spendCoins, getOwned, ownItem } from '../utils/wallet'
import './ShipSelector.css'

function ShipSelector({ onClose, onSelectShip, selectedShip: initialSelectedShip }) {
  const [selectedShip, setSelectedShip] = useState(initialSelectedShip)
  const [coins, setCoins] = useState(() => getCoins())
  const [toast, setToast] = useState('')
  const [ownedShips, setOwnedShips] = useState(() => getOwned('ownedShips'))

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(getCoins())
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Ship capabilities match character stats from iOS
  const SHIP_CAPABILITIES = {
    kaden: { 
      speed: 'Medium', 
      durability: 'Medium', 
      firepower: 'Medium', 
      maneuverability: 'Medium',
      weapon: 'Laser'
    },
    adelynn: { 
      speed: 'High', 
      durability: 'Low', 
      firepower: 'Low', 
      maneuverability: 'High',
      weapon: 'Spread'
    },
    orion: { 
      speed: 'Medium', 
      durability: 'High', 
      firepower: 'High', 
      maneuverability: 'Medium',
      weapon: 'Plasma'
    },
    lyra: { 
      speed: 'High', 
      durability: 'Medium', 
      firepower: 'Medium', 
      maneuverability: 'High',
      weapon: 'Lightning'
    },
    vega: { 
      speed: 'Medium', 
      durability: 'Medium', 
      firepower: 'Medium', 
      maneuverability: 'Medium',
      weapon: 'Homing'
    },
    mira: { 
      speed: 'Medium', 
      durability: 'Medium', 
      firepower: 'Medium', 
      maneuverability: 'Medium',
      weapon: 'Ice'
    },
    hero8: { 
      speed: 'High', 
      durability: 'Low', 
      firepower: 'Low', 
      maneuverability: 'High',
      weapon: 'Beam'
    },
    hero9: { 
      speed: 'Medium', 
      durability: 'High', 
      firepower: 'High', 
      maneuverability: 'Medium',
      weapon: 'Missile'
    },
    jax: { 
      speed: 'Low', 
      durability: 'High', 
      firepower: 'High', 
      maneuverability: 'Low',
      weapon: 'Shotgun'
    },
    kael: { 
      speed: 'Low', 
      durability: 'High', 
      firepower: 'High', 
      maneuverability: 'Low',
      weapon: 'Railgun'
    },
  }

  // Ships match character IDs to align with iOS
  const SHIPS = [
    { id: 'kaden', label: "🚀 Kaden's Ship", cost: 0 },
    { id: 'adelynn', label: "✨ Adelynn's Ship", cost: 0 },
    { id: 'orion', label: '🌟 Orion', cost: 300 },
    { id: 'lyra', label: '⚡ Lyra', cost: 350 },
    { id: 'vega', label: '🎯 Vega', cost: 300 },
    { id: 'mira', label: '❄️ Mira', cost: 300 },
    { id: 'hero8', label: '💫 Nova', cost: 600 },
    { id: 'hero9', label: '💥 Rio', cost: 700 },
    { id: 'jax', label: '🛡️ Jax', cost: 1500 },
    { id: 'kael', label: '🔫 Kael', cost: 3500 },
  ]

  const buyShip = (id, cost) => {
    if (ownedShips.includes(id)) return
    if (cost === 0 || spendCoins(cost)) {
      setCoins(getCoins())
      const list = ownItem('ownedShips', id)
      setOwnedShips(list)
      setToast('🚀 Ship unlocked!')
      setTimeout(() => setToast(''), 2000)
    } else {
      setToast('Not enough coins!')
      setTimeout(() => setToast(''), 1500)
    }
  }

  const handleSelectShip = (shipId) => {
    setSelectedShip(shipId)
    if (onSelectShip) {
      onSelectShip(shipId)
    }
    onClose()
  }

  // Ship thumbnail component (draws a mini ship on canvas)
  const ShipThumb = ({ id }) => {
    const canvasRef = useRef(null)
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const palette = {
        kaden: ['#4ecdc4', '#667eea'],
        adelynn: ['#ff6b9a', '#ff00ff'],
        orion: ['#ffd166', '#ef476f'],
        lyra: ['#06d6a0', '#118ab2'],
        vega: ['#a1c4fd', '#c2e9fb'],
        mira: ['#ff9966', '#ff5e62'],
        hero8: ['#7f00ff', '#e100ff'],
        hero9: ['#00c6ff', '#0072ff'],
        jax: ['#8d99ae', '#2b2d42'],
        kael: ['#f7971e', '#ffd200'],
      }
      const colors = palette[id] || palette.kaden
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.fillStyle = colors[0]
      ctx.beginPath()
      ctx.moveTo(0, -canvas.height / 2 + 4)
      ctx.lineTo(-canvas.width / 4, canvas.height / 2 - 4)
      ctx.lineTo(0, canvas.height / 2 - 8)
      ctx.lineTo(canvas.width / 4, canvas.height / 2 - 4)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }, [id])
    return <canvas ref={canvasRef} width={64} height={44} className="ship-thumb" />
  }

  return (
    <div className="selector-page">
      <div className="selector-background">
        <div className="selector-stars"></div>
      </div>

      <div className="selector-container">
        <header className="selector-header">
          <div className="selector-header-content">
            <h1 className="selector-main-title">
              <span className="selector-title-icon">🚀</span>
              Choose Your Ship
            </h1>
            <p className="selector-header-subtitle">Select the perfect vessel for your space adventure</p>
          </div>
          <button className="selector-back-button" onClick={onClose}>
            <span className="back-icon">←</span>
            Back to Menu
          </button>
        </header>

        <div className="selector-balance-card">
          <div className="balance-content">
            <span className="balance-label">Your Balance</span>
            <span className="balance-amount">⭐ {coins.toLocaleString()}</span>
          </div>
        </div>

        <div className="selector-section">
          <h2 className="selector-section-title">Available Ships</h2>
          <div className="selector-grid">
            {SHIPS.map((ship) => {
              const owned = ownedShips.includes(ship.id) || ship.cost === 0
              const active = selectedShip === ship.id
              return (
                <div
                  key={ship.id}
                  className={`selector-card ${active ? 'active' : ''} ${!owned ? 'locked' : ''}`}
                  onClick={() => {
                    if (owned) {
                      handleSelectShip(ship.id)
                    } else {
                      buyShip(ship.id, ship.cost)
                    }
                  }}
                >
                  {active && (
                    <div className="selector-card-active-badge">
                      <span className="active-icon">✓</span>
                      Selected
                    </div>
                  )}
                  <div className="selector-card-icon">
                    <ShipThumb id={ship.id} />
                  </div>
                  <div className="selector-card-content">
                    <h3 className="selector-card-title">{ship.label}</h3>
                    <div className="ship-stats">
                      <div className="stat-item">
                        <span className="stat-icon">⚔️</span>
                        <span className="stat-label">Weapon:</span>
                        <span className="stat-value weapon-value">{SHIP_CAPABILITIES[ship.id]?.weapon || 'Laser'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">💨</span>
                        <span className="stat-label">Speed:</span>
                        <span className="stat-value">{SHIP_CAPABILITIES[ship.id]?.speed || 'Medium'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">🛡️</span>
                        <span className="stat-label">Durability:</span>
                        <span className="stat-value">{SHIP_CAPABILITIES[ship.id]?.durability || 'Medium'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">💥</span>
                        <span className="stat-label">Firepower:</span>
                        <span className="stat-value">{SHIP_CAPABILITIES[ship.id]?.firepower || 'Medium'}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-label">Maneuver:</span>
                        <span className="stat-value">{SHIP_CAPABILITIES[ship.id]?.maneuverability || 'Medium'}</span>
                      </div>
                    </div>
                    {!owned && (
                      <div className="selector-card-price">
                        <span className="price-icon">⭐</span>
                        <span className="price-amount">{ship.cost.toLocaleString()}</span>
                      </div>
                    )}
                    {owned && ship.cost > 0 && (
                      <div className="selector-card-owned">Owned</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {toast && (
        <div className="selector-toast">
          <span className="toast-content">{toast}</span>
        </div>
      )}
    </div>
  )
}

export default ShipSelector

