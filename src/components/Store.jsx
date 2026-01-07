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
    // Basic Tier (250-400 stars)
    {
      key: 'life',
      icon: '❤️',
      title: 'Extra Life',
      description: 'Gain an additional life',
      cost: 250,
      emoji: '❤️',
      tier: 'basic',
    },
    {
      key: 'shield',
      icon: '🛡️',
      title: 'Shield Boost',
      description: 'Increases shield duration by 50%',
      cost: 300,
      emoji: '🛡️',
      tier: 'basic',
    },
    {
      key: 'speed',
      icon: '💨',
      title: 'Speed Boost',
      description: 'Increases ship movement speed by 30%',
      cost: 350,
      emoji: '💨',
      tier: 'basic',
    },
    {
      key: 'rapid',
      icon: '⚡',
      title: 'Rapid Fire',
      description: 'Doubles your firing rate',
      cost: 400,
      emoji: '⚡',
      tier: 'basic',
    },
    // Mid-Tier (500-800 stars)
    {
      key: 'damage',
      icon: '💥',
      title: 'Damage Boost',
      description: 'Increases weapon damage by 40%',
      cost: 500,
      emoji: '💥',
      tier: 'mid',
    },
    {
      key: 'health',
      icon: '❤️‍🩹',
      title: 'Health Boost',
      description: 'Increases maximum health by 50%',
      cost: 600,
      emoji: '❤️‍🩹',
      tier: 'mid',
    },
    {
      key: 'multishot',
      icon: '🎯',
      title: 'Multi-Shot',
      description: 'Fire 3 bullets instead of 1',
      cost: 700,
      emoji: '🎯',
      tier: 'mid',
    },
    {
      key: 'doubler',
      icon: '💰',
      title: 'Star Doubler',
      description: 'PERMANENTLY double ALL stars earned FOREVER',
      cost: 800,
      emoji: '💰',
      tier: 'mid',
      featured: true,
    },
    // Advanced Tier (1,000-2,000 stars)
    {
      key: 'penetration',
      icon: '🔫',
      title: 'Penetration Shot',
      description: 'Bullets pierce through ALL enemies',
      cost: 1000,
      emoji: '🔫',
      tier: 'advanced',
    },
    {
      key: 'homing',
      icon: '🎯',
      title: 'Homing Missiles',
      description: 'Bullets automatically track nearest enemies',
      cost: 1200,
      emoji: '🎯',
      tier: 'advanced',
    },
    {
      key: 'explosive',
      icon: '💣',
      title: 'Explosive Rounds',
      description: 'Bullets explode on impact, damaging nearby enemies',
      cost: 1500,
      emoji: '💣',
      tier: 'advanced',
    },
    {
      key: 'regeneration',
      icon: '⚡',
      title: 'Health Regeneration',
      description: 'Slowly regenerate health over time',
      cost: 1800,
      emoji: '⚡',
      tier: 'advanced',
    },
    {
      key: 'shield_master',
      icon: '🛡️',
      title: 'Shield Master',
      description: 'Shields last 3x longer and recharge faster',
      cost: 2000,
      emoji: '🛡️',
      tier: 'advanced',
    },
    // Premium/Ultimate Tier (2,500-5,000 stars)
    {
      key: 'plasma_core',
      icon: '🌟',
      title: 'Plasma Core',
      description: 'EXTREME damage boost - All weapons deal 3x damage',
      cost: 2500,
      emoji: '🌟',
      tier: 'premium',
    },
    {
      key: 'time_dilation',
      icon: '⏱️',
      title: 'Time Dilation',
      description: 'Slow down time - enemies move 50% slower',
      cost: 3000,
      emoji: '⏱️',
      tier: 'premium',
    },
    {
      key: 'immortality',
      icon: '✨',
      title: 'Near Immortality',
      description: 'Take 90% less damage from all sources',
      cost: 4000,
      emoji: '✨',
      tier: 'premium',
    },
    {
      key: 'ultimate_power',
      icon: '👑',
      title: 'Ultimate Power',
      description: 'MAXIMUM capabilities - All stats boosted to extreme levels',
      cost: 5000,
      emoji: '👑',
      tier: 'ultimate',
      featured: true,
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
            <span className="balance-amount">⭐ {coins.toLocaleString()}</span>
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
                        <span className="price-icon">⭐</span>
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

