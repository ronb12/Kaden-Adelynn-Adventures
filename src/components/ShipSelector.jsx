import { useState, useEffect, useRef } from 'react'
import { getCoins, spendCoins, getOwned, ownItem } from '../utils/wallet'
import { imageForShipId } from '../utils/assetMapper'
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

  // Ships match iOS ShipSelectView - ship names, stats, descriptions, and playstyles
  const SHIPS = [
    {
      id: 'kaden',
      label: "🚀 Kaden's Ship",
      icon: '🚀',
      weapon: 'Laser',
      speed: 'High',
      durability: 'Medium',
      firepower: 'Medium',
      maneuverability: 'High',
      cost: 0,
      isDefault: true,
      description: 'A balanced starter ship perfect for beginners. Reliable and versatile.',
      playstyle: 'Best for: Beginners'
    },
    {
      id: 'adelynn',
      label: "✨ Adelynn's Ship",
      icon: '✨',
      weapon: 'Spread Shot',
      speed: 'Very High',
      durability: 'Low',
      firepower: 'High',
      maneuverability: 'Very High',
      cost: 0,
      isDefault: true,
      description: 'Lightning-fast ship with spread shot capability. High risk, high reward.',
      playstyle: 'Best for: Advanced players'
    },
    {
      id: 'falcon',
      label: '🦅 Falcon',
      icon: '🦅',
      weapon: 'Homing',
      speed: 'Very High',
      durability: 'Low',
      firepower: 'Medium',
      maneuverability: 'Very High',
      cost: 300,
      isDefault: false,
      description: 'Swift interceptor with homing missiles. Perfect for hit-and-run tactics.',
      playstyle: 'Best for: Speed enthusiasts'
    },
    {
      id: 'comet',
      label: '🌠 Comet',
      icon: '🌠',
      weapon: 'Freeze',
      speed: 'Very High',
      durability: 'Low',
      firepower: 'Medium',
      maneuverability: 'Very High',
      cost: 300,
      isDefault: false,
      description: 'Ultra-fast interceptor with freeze weapons. Control the battlefield.',
      playstyle: 'Best for: Speed and control'
    },
    {
      id: 'phantom',
      label: '👻 Phantom',
      icon: '👻',
      weapon: 'Electric',
      speed: 'High',
      durability: 'Medium',
      firepower: 'Medium',
      maneuverability: 'High',
      cost: 350,
      isDefault: false,
      description: 'Stealthy ship with electric weapons. Balanced stats for all situations.',
      playstyle: 'Best for: Versatile gameplay'
    },
    {
      id: 'meteor',
      label: '☄️ Meteor',
      icon: '☄️',
      weapon: 'Missile',
      speed: 'Very High',
      durability: 'Low',
      firepower: 'High',
      maneuverability: 'High',
      cost: 600,
      isDefault: false,
      description: 'Fast-attack craft with explosive missiles. Speed and power combined.',
      playstyle: 'Best for: Fast-paced action'
    },
    {
      id: 'viper',
      label: '🐍 Viper',
      icon: '🐍',
      weapon: 'Shotgun',
      speed: 'High',
      durability: 'Medium',
      firepower: 'High',
      maneuverability: 'High',
      cost: 700,
      isDefault: false,
      description: 'Close-range specialist with devastating shotgun blasts.',
      playstyle: 'Best for: Aggressive players'
    },
    {
      id: 'nova',
      label: '🌟 Nova',
      icon: '🌟',
      weapon: 'Plasma',
      speed: 'High',
      durability: 'Medium',
      firepower: 'High',
      maneuverability: 'Medium',
      cost: 750,
      isDefault: false,
      description: 'Plasma-powered destroyer. Devastating firepower at medium range.',
      playstyle: 'Best for: Damage dealers'
    },
    {
      id: 'shadow',
      label: '🌑 Shadow',
      icon: '🌑',
      weapon: 'Beam',
      speed: 'Medium',
      durability: 'High',
      firepower: 'Medium',
      maneuverability: 'Medium',
      cost: 1400,
      isDefault: false,
      description: 'Stealth fighter with continuous beam weapons. Well-rounded performance.',
      playstyle: 'Best for: Balanced gameplay'
    },
    {
      id: 'raptor',
      label: '🦖 Raptor',
      icon: '🦖',
      weapon: 'Laser Rifle',
      speed: 'High',
      durability: 'High',
      firepower: 'High',
      maneuverability: 'Medium',
      cost: 1600,
      isDefault: false,
      description: 'Heavy fighter with rapid-fire laser rifles. Power and durability.',
      playstyle: 'Best for: Sustained combat'
    },
    {
      id: 'titan',
      label: '🛡️ Titan',
      icon: '🛡️',
      weapon: 'Railgun',
      speed: 'Low',
      durability: 'Very High',
      firepower: 'Very High',
      maneuverability: 'Low',
      cost: 3500,
      isDefault: false,
      description: 'Heavy armored battleship. NEARLY INDESTRUCTIBLE with MAXIMUM firepower.',
      playstyle: 'Best for: Tank players'
    },
    {
      id: 'aurora',
      label: '🌈 Aurora',
      icon: '🌈',
      weapon: 'Plasma Rifle',
      speed: 'Medium',
      durability: 'Medium',
      firepower: 'Very High',
      maneuverability: 'Medium',
      cost: 4000,
      isDefault: false,
      description: 'ULTIMATE damage dealer with plasma rifles. MAXIMUM firepower.',
      playstyle: 'Best for: Maximum damage'
    }
  ]

  const buyShip = (ship) => {
    if (ownedShips.includes(ship.id) || ship.isDefault) return
    if (spendCoins(ship.cost)) {
      setCoins(getCoins())
      const list = ownItem('ownedShips', ship.id)
      setOwnedShips(list)
      setToast(`🚀 ${ship.label} unlocked!`)
      setTimeout(() => setToast(''), 2000)
    } else {
      setToast(`Not enough stars! Need ${ship.cost}`)
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

  // Ship thumbnail component: displays actual ship images
  const ShipThumb = ({ id, icon }) => {
    const shipImage = imageForShipId(id)
    return (
      <div 
        className="ship-thumb-container" 
        style={{ 
          width: 64, 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(102, 126, 234, 0.1))',
          borderRadius: 8, 
          border: '2px solid rgba(255,255,255,0.3)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <img
          src={shipImage}
          alt={id}
          className="ship-thumb"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            padding: '4px'
          }}
          onError={(e) => {
            // Fallback to emoji icon if image fails to load
            e.target.style.display = 'none'
            const parent = e.target.parentElement
            if (parent && !parent.querySelector('.ship-icon-fallback')) {
              const fallback = document.createElement('div')
              fallback.className = 'ship-icon-fallback'
              fallback.style.cssText = 'font-size: 32px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;'
              fallback.textContent = icon || '🚀'
              parent.appendChild(fallback)
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="selector-page ship-selector-page" data-page="ships">
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
                      buyShip(ship)
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
                    <ShipThumb id={ship.id} icon={ship.icon} />
                  </div>
                  <div className="selector-card-content">
                    <h3 className="selector-card-title">{ship.label}</h3>
                    {ship.description && (
                      <p className="ship-description" style={{ fontSize: '0.85em', color: '#ccc', marginTop: '4px', marginBottom: '8px' }}>
                        {ship.description}
                      </p>
                    )}
                    <div className="ship-stats">
                      <div className="stat-item">
                        <span className="stat-icon">⚔️</span>
                        <span className="stat-label">Weapon:</span>
                        <span className="stat-value weapon-value">{ship.weapon}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">💨</span>
                        <span className="stat-label">Speed:</span>
                        <span className="stat-value">{ship.speed}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">🛡️</span>
                        <span className="stat-label">Durability:</span>
                        <span className="stat-value">{ship.durability}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">💥</span>
                        <span className="stat-label">Firepower:</span>
                        <span className="stat-value">{ship.firepower}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-label">Maneuver:</span>
                        <span className="stat-value">{ship.maneuverability}</span>
                      </div>
                    </div>
                    {ship.playstyle && (
                      <div style={{ fontSize: '0.8em', color: '#4ecdc4', marginTop: '4px', fontStyle: 'italic' }}>
                        {ship.playstyle}
                      </div>
                    )}
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


