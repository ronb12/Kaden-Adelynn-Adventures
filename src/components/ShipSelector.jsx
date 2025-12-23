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

  const SHIP_CAPABILITIES = {
    kaden: { 
      speed: 'High', 
      durability: 'Medium', 
      firepower: 'Medium', 
      maneuverability: 'High',
      weapon: 'Laser'
    },
    adelynn: { 
      speed: 'Very High', 
      durability: 'Low', 
      firepower: 'High', 
      maneuverability: 'Very High',
      weapon: 'Spread Shot'
    },
    falcon: { 
      speed: 'Very High', 
      durability: 'Low', 
      firepower: 'Medium', 
      maneuverability: 'Very High',
      weapon: 'Homing'
    },
    phantom: { 
      speed: 'High', 
      durability: 'Medium', 
      firepower: 'Medium', 
      maneuverability: 'High',
      weapon: 'Electric'
    },
    nova: { 
      speed: 'High', 
      durability: 'Medium', 
      firepower: 'High', 
      maneuverability: 'Medium',
      weapon: 'Plasma'
    },
    titan: { 
      speed: 'Low', 
      durability: 'Very High', 
      firepower: 'Very High', 
      maneuverability: 'Low',
      weapon: 'Railgun'
    },
    viper: { 
      speed: 'High', 
      durability: 'Medium', 
      firepower: 'High', 
      maneuverability: 'High',
      weapon: 'Shotgun'
    },
    shadow: { 
      speed: 'Medium', 
      durability: 'High', 
      firepower: 'Medium', 
      maneuverability: 'Medium',
      weapon: 'Beam'
    },
    meteor: { 
      speed: 'Very High', 
      durability: 'Low', 
      firepower: 'High', 
      maneuverability: 'High',
      weapon: 'Missile'
    },
    comet: { 
      speed: 'Very High', 
      durability: 'Low', 
      firepower: 'Medium', 
      maneuverability: 'Very High',
      weapon: 'Freeze'
    },
    raptor: { 
      speed: 'High', 
      durability: 'High', 
      firepower: 'High', 
      maneuverability: 'Medium',
      weapon: 'Laser Rifle'
    },
    aurora: { 
      speed: 'Medium', 
      durability: 'Medium', 
      firepower: 'Very High', 
      maneuverability: 'Medium',
      weapon: 'Plasma Rifle'
    },
  }

  const SHIPS = [
    { id: 'kaden', label: "🚀 Kaden's Ship", cost: 0 },
    { id: 'adelynn', label: "✨ Adelynn's Ship", cost: 0 },
    { id: 'falcon', label: '🦅 Falcon', cost: 200 },
    { id: 'phantom', label: '👻 Phantom', cost: 250 },
    { id: 'nova', label: '🌟 Nova', cost: 300 },
    { id: 'titan', label: '🛡️ Titan', cost: 350 },
    { id: 'viper', label: '🐍 Viper', cost: 300 },
    { id: 'shadow', label: '🌑 Shadow', cost: 320 },
    { id: 'meteor', label: '☄️ Meteor', cost: 280 },
    { id: 'comet', label: '🌠 Comet', cost: 260 },
    { id: 'raptor', label: '🦖 Raptor', cost: 330 },
    { id: 'aurora', label: '🌈 Aurora', cost: 340 },
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
        kaden: ['#4ecdc4', '#00ffff'],
        adelynn: ['#ff6b9a', '#ff00ff'],
        falcon: ['#ffd166', '#ef476f'],
        phantom: ['#95a5a6', '#bdc3c7'],
        nova: ['#7f00ff', '#e100ff'],
        titan: ['#f39c12', '#d35400'],
        viper: ['#2ecc71', '#27ae60'],
        shadow: ['#34495e', '#2c3e50'],
        meteor: ['#e67e22', '#d35400'],
        comet: ['#3498db', '#2980b9'],
        raptor: ['#e74c3c', '#c0392b'],
        aurora: ['#9b59b6', '#8e44ad'],
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
            <span className="balance-amount">💰 {coins.toLocaleString()}</span>
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
                        <span className="price-icon">💰</span>
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

