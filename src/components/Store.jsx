import { useState, useEffect } from 'react'
import { getCoins, spendCoins } from '../utils/wallet'
import './Store.css'

function Store({ onClose }) {
  const [coins, setCoins] = useState(() => getCoins())
  const [toast, setToast] = useState('')
  const [purchasedUpgrades, setPurchasedUpgrades] = useState({
    shield: localStorage.getItem('upgrade_shield') === '1',
    speed: localStorage.getItem('upgrade_speed') === '1',
    rapid: localStorage.getItem('upgrade_rapid') === '1',
    doubler: localStorage.getItem('upgrade_doubler') === '1',
    life: localStorage.getItem('upgrade_life') === '1',
  })

  useEffect(() => {
    // Refresh coins periodically
    const interval = setInterval(() => {
      setCoins(getCoins())
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const handlePurchase = (upgradeKey, cost, name, emoji) => {
    if (purchasedUpgrades[upgradeKey]) {
      setToast(`${emoji} ${name} is already purchased!`)
      setTimeout(() => setToast(''), 2000)
      return
    }

    if (spendCoins(cost)) {
      setCoins(getCoins())
      localStorage.setItem(`upgrade_${upgradeKey}`, '1')
      setPurchasedUpgrades((prev) => ({ ...prev, [upgradeKey]: true }))
      setToast(`${emoji} ${name} Purchased!`)
      setTimeout(() => setToast(''), 2000)
    } else {
      setToast('Not enough coins!')
      setTimeout(() => setToast(''), 1500)
    }
  }

  const upgrades = [
    {
      key: 'shield',
      icon: '🛡️',
      title: 'Shield Boost',
      description: 'Increases shield duration by 50%',
      cost: 200,
      emoji: '🛡️',
    },
    {
      key: 'speed',
      icon: '💨',
      title: 'Speed Boost',
      description: 'Increases ship movement speed by 30%',
      cost: 200,
      emoji: '💨',
    },
    {
      key: 'rapid',
      icon: '⚡',
      title: 'Rapid Fire',
      description: 'Doubles your firing rate',
      cost: 300,
      emoji: '⚡',
    },
    {
      key: 'doubler',
      icon: '💰',
      title: 'Coin Doubler',
      description: 'Double all coins earned in-game',
      cost: 400,
      emoji: '💰',
      featured: true,
    },
    {
      key: 'life',
      icon: '❤️',
      title: 'Extra Life',
      description: 'Gain an additional life',
      cost: 150,
      emoji: '❤️',
    },
  ]

  return (
    <div className="store-page">
      <div className="store-background">
        <div className="store-stars"></div>
      </div>

      <div className="store-container">
        <header className="store-header">
          <div className="store-header-content">
            <h1 className="store-main-title">
              <span className="store-title-icon">🛒</span>
              Upgrade Store
            </h1>
            <p className="store-header-subtitle">Enhance your ship with powerful upgrades</p>
          </div>
          <button className="store-back-button" onClick={onClose}>
            <span className="back-icon">←</span>
            Back to Menu
          </button>
        </header>

        <div className="store-balance-card">
          <div className="balance-content">
            <span className="balance-label">Your Balance</span>
            <span className="balance-amount">💰 {coins.toLocaleString()}</span>
          </div>
        </div>

        <div className="store-currency-notice">
          <span className="notice-icon">ℹ️</span>
          <span className="notice-text">
            <strong>In-Game Currency Only:</strong> All purchases use coins earned during gameplay. 
            No real money is required or accepted.
          </span>
        </div>

        <div className="store-upgrades-section">
          <h2 className="store-section-title">Available Upgrades</h2>
          <div className="store-grid">
            {upgrades.map((upgrade) => {
              const purchased = purchasedUpgrades[upgrade.key]
              const canAfford = coins >= upgrade.cost
              return (
                <div
                  key={upgrade.key}
                  className={`store-card ${upgrade.featured ? 'featured' : ''} ${purchased ? 'purchased' : ''}`}
                >
                  {upgrade.featured && (
                    <div className="store-card-badge">
                      <span className="badge-icon">⭐</span>
                      Popular
                    </div>
                  )}
                  {purchased && (
                    <div className="store-card-purchased-badge">
                      <span className="purchased-icon">✓</span>
                      Owned
                    </div>
                  )}
                  <div className="store-card-icon">{upgrade.icon}</div>
                  <div className="store-card-content">
                    <h3 className="store-card-title">{upgrade.title}</h3>
                    <p className="store-card-description">{upgrade.description}</p>
                    <div className="store-card-footer">
                      <div className="store-card-price">
                        <span className="price-icon">💰</span>
                        <span className="price-amount">{upgrade.cost.toLocaleString()}</span>
                      </div>
                      <button
                        className={`store-card-button ${purchased ? 'owned' : canAfford ? 'affordable' : 'expensive'}`}
                        onClick={() => handlePurchase(upgrade.key, upgrade.cost, upgrade.title, upgrade.emoji)}
                        disabled={purchased}
                      >
                        {purchased ? 'Owned' : canAfford ? 'Purchase' : 'Need More Coins'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {toast && (
        <div className="store-toast">
          <span className="toast-content">{toast}</span>
        </div>
      )}
    </div>
  )
}

export default Store

