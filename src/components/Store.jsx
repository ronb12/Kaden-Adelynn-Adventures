import { useState, useEffect } from 'react'
import { getCoins, spendCoins } from '../utils/wallet'
import { loadUpgrades, saveUpgrades } from '../utils/firebaseData'
import './Store.css'

// Define upgrades array outside component to avoid scoping issues
const UPGRADES_LIST = [
  // Basic Tier (250-500 stars)
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
  {
    key: 'bullet_size',
    icon: '🔵',
    title: 'Bigger Bullets',
    description: 'Bullets are 50% larger and deal more damage',
    cost: 450,
    emoji: '🔵',
    tier: 'basic',
  },
  {
    key: 'luck_boost',
    icon: '🍀',
    title: 'Lucky Star',
    description: 'Increases power-up drop rate by 50%',
    cost: 500,
    emoji: '🍀',
    tier: 'basic',
  },
  // Mid-Tier (600-1000 stars)
  {
    key: 'damage',
    icon: '💥',
    title: 'Damage Boost',
    description: 'Increases weapon damage by 40%',
    cost: 600,
    emoji: '💥',
    tier: 'mid',
  },
  {
    key: 'health',
    icon: '❤️‍🩹',
    title: 'Health Boost',
    description: 'Increases maximum health by 50%',
    cost: 700,
    emoji: '❤️‍🩹',
    tier: 'mid',
  },
  {
    key: 'multishot',
    icon: '🎯',
    title: 'Multi-Shot',
    description: 'Fire 3 bullets instead of 1',
    cost: 800,
    emoji: '🎯',
    tier: 'mid',
  },
  {
    key: 'crit_chance',
    icon: '⭐',
    title: 'Critical Hits',
    description: '15% chance for bullets to deal 3x damage',
    cost: 850,
    emoji: '⭐',
    tier: 'mid',
  },
  {
    key: 'doubler',
    icon: '💰',
    title: 'Star Doubler',
    description: 'PERMANENTLY double ALL stars earned FOREVER',
    cost: 1000,
    emoji: '💰',
    tier: 'mid',
    featured: true,
  },
  // Advanced Tier (1,200-2,500 stars)
  {
    key: 'penetration',
    icon: '🔫',
    title: 'Penetration Shot',
    description: 'Bullets pierce through ALL enemies',
    cost: 1200,
    emoji: '🔫',
    tier: 'advanced',
  },
  {
    key: 'homing',
    icon: '🎯',
    title: 'Homing Missiles',
    description: 'Bullets automatically track nearest enemies',
    cost: 1400,
    emoji: '🎯',
    tier: 'advanced',
  },
  {
    key: 'explosive',
    icon: '💣',
    title: 'Explosive Rounds',
    description: 'Bullets explode on impact, damaging nearby enemies',
    cost: 1600,
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
    key: 'armor_piercing',
    icon: '⚔️',
    title: 'Armor Piercing',
    description: 'Bullets ignore enemy armor and shields',
    cost: 2000,
    emoji: '⚔️',
    tier: 'advanced',
  },
  {
    key: 'shield_master',
    icon: '🛡️',
    title: 'Shield Master',
    description: 'Shields last 3x longer and recharge faster',
    cost: 2200,
    emoji: '🛡️',
    tier: 'advanced',
  },
  {
    key: 'energy_shield',
    icon: '⚡',
    title: 'Energy Shield',
    description: 'Passive shield that blocks 1 hit every 10 seconds',
    cost: 2400,
    emoji: '⚡',
    tier: 'advanced',
  },
  {
    key: 'auto_aim',
    icon: '🎯',
    title: 'Auto-Aim System',
    description: 'Bullets automatically target nearest enemies',
    cost: 2500,
    emoji: '🎯',
    tier: 'advanced',
  },
  // Premium Tier (3,000-4,500 stars)
  {
    key: 'plasma_core',
    icon: '🌟',
    title: 'Plasma Core',
    description: 'EXTREME damage boost - All weapons deal 3x damage',
    cost: 3000,
    emoji: '🌟',
    tier: 'premium',
  },
  {
    key: 'chain_lightning',
    icon: '⚡',
    title: 'Chain Lightning',
    description: 'Bullets chain to 3 nearby enemies',
    cost: 3200,
    emoji: '⚡',
    tier: 'premium',
  },
  {
    key: 'freeze_shot',
    icon: '❄️',
    title: 'Freeze Shot',
    description: 'Bullets slow enemies by 50% for 3 seconds',
    cost: 3400,
    emoji: '❄️',
    tier: 'premium',
  },
  {
    key: 'poison_shot',
    icon: '☠️',
    title: 'Poison Shot',
    description: 'Bullets poison enemies, dealing damage over time',
    cost: 3600,
    emoji: '☠️',
    tier: 'premium',
  },
  {
    key: 'time_dilation',
    icon: '⏱️',
    title: 'Time Dilation',
    description: 'Slow down time - enemies move 50% slower',
    cost: 3800,
    emoji: '⏱️',
    tier: 'premium',
  },
  {
    key: 'magnetic_pull',
    icon: '🧲',
    title: 'Magnetic Pull',
    description: 'Automatically collect nearby stars and power-ups',
    cost: 4000,
    emoji: '🧲',
    tier: 'premium',
  },
  {
    key: 'immortality',
    icon: '✨',
    title: 'Near Immortality',
    description: 'Take 90% less damage from all sources',
    cost: 4200,
    emoji: '✨',
    tier: 'premium',
  },
  {
    key: 'double_jump',
    icon: '🚀',
    title: 'Double Jump',
    description: 'Gain ability to dash/teleport short distances',
    cost: 4400,
    emoji: '🚀',
    tier: 'premium',
  },
  {
    key: 'phase_shift',
    icon: '👻',
    title: 'Phase Shift',
    description: 'Become invulnerable for 1 second after taking damage',
    cost: 4500,
    emoji: '👻',
    tier: 'premium',
  },
  // Ultimate Tier (5,000+ stars)
  {
    key: 'berserker',
    icon: '🔥',
    title: 'Berserker Mode',
    description: 'Damage increases by 10% for each enemy killed (stacks)',
    cost: 5000,
    emoji: '🔥',
    tier: 'ultimate',
  },
  {
    key: 'ultimate_power',
    icon: '👑',
    title: 'Ultimate Power',
    description: 'MAXIMUM capabilities - All stats boosted to extreme levels',
    cost: 10000,
    emoji: '👑',
    tier: 'ultimate',
    featured: true,
  },
]

function Store({ onClose, initialTab = 'permanent' }) {
  const [activeTab, setActiveTab] = useState(initialTab) // 'permanent' or 'weapon'
  const [coins, setCoins] = useState(() => getCoins())
  const [toast, setToast] = useState('')
  const [purchasedUpgrades, setPurchasedUpgrades] = useState(() => {
    // Initialize all upgrade states
    const upgradeKeys = [
      'life', 'shield', 'speed', 'rapid', 'damage', 'health', 'multishot', 'doubler',
      'penetration', 'homing', 'explosive', 'regeneration', 'shield_master',
      'plasma_core', 'time_dilation', 'immortality', 'ultimate_power',
      'bullet_size', 'crit_chance', 'armor_piercing', 'energy_shield', 'auto_aim',
      'chain_lightning', 'freeze_shot', 'poison_shot', 'magnetic_pull',
      'double_jump', 'phase_shift', 'berserker', 'luck_boost'
    ]
    const upgradeStates = {}
    upgradeKeys.forEach(key => {
      upgradeStates[key] = localStorage.getItem(`upgrade_${key}`) === '1'
    })
    return upgradeStates
  })
  
  // Weapon upgrades state
  const [weaponUpgrades, setWeaponUpgrades] = useState({
    damage: 1,
    fireRate: 1,
    range: 1,
    pierce: 0,
    spread: 0,
    homing: 0
  })
  const [weaponLoading, setWeaponLoading] = useState(true)

  const weaponUpgradeData = {
    damage: { name: 'Damage', icon: '💥', max: 10, cost: (level) => 100 * level, desc: 'Increase weapon damage' },
    fireRate: { name: 'Fire Rate', icon: '⚡', max: 10, cost: (level) => 150 * level, desc: 'Shoot faster' },
    range: { name: 'Range', icon: '🎯', max: 10, cost: (level) => 120 * level, desc: 'Bullets travel further' },
    pierce: { name: 'Pierce', icon: '🔫', max: 5, cost: (level) => 250 * level, desc: 'Bullets pierce enemies' },
    spread: { name: 'Spread Shot', icon: '🌟', max: 5, cost: (level) => 300 * level, desc: 'Fire multiple bullets' },
    homing: { name: 'Homing', icon: '🎯', max: 5, cost: (level) => 400 * level, desc: 'Bullets track enemies' }
  }

  useEffect(() => {
    // Refresh coins periodically
    const interval = setInterval(() => {
      setCoins(getCoins())
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Load weapon upgrades
    loadUpgrades().then(loadedUpgrades => {
      setWeaponUpgrades(loadedUpgrades)
      setWeaponLoading(false)
    }).catch(err => {
      console.error('Failed to load weapon upgrades:', err)
      setWeaponLoading(false)
    })
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

  const handleWeaponUpgrade = async (key) => {
    const current = weaponUpgrades[key]
    const data = weaponUpgradeData[key]
    
    if (current >= data.max) {
      setToast(`❌ ${data.name} is already maxed out!`)
      setTimeout(() => setToast(''), 2000)
      return
    }

    const cost = data.cost(current + 1)
    if (coins < cost) {
      setToast(`❌ Not enough coins! Need ${cost}`)
      setTimeout(() => setToast(''), 2000)
      return
    }

    spendCoins(cost)
    const newUpgrades = { ...weaponUpgrades, [key]: current + 1 }
    setWeaponUpgrades(newUpgrades)
    setCoins(getCoins())
    await saveUpgrades(newUpgrades)
    setToast(`✅ Upgraded ${data.name} to level ${current + 1}!`)
    setTimeout(() => setToast(''), 2000)
  }

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

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTab('permanent')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'permanent' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.1)',
              border: `2px solid ${activeTab === 'permanent' ? 'rgba(102, 126, 234, 0.6)' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ⭐ Permanent Upgrades
          </button>
          <button
            onClick={() => setActiveTab('weapon')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'weapon' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.1)',
              border: `2px solid ${activeTab === 'weapon' ? 'rgba(102, 126, 234, 0.6)' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ⚔️ Weapon Upgrades
          </button>
        </div>

        {/* Permanent Upgrades Tab */}
        {activeTab === 'permanent' && (
        <div className="store-upgrades-section">
          <h2 className="store-section-title">Permanent Upgrades</h2>
          <div className="store-grid">
            {UPGRADES_LIST.map((upgrade) => {
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
        )}

        {/* Weapon Upgrades Tab */}
        {activeTab === 'weapon' && (
        <div className="store-upgrades-section">
          <h2 className="store-section-title">Weapon Upgrades</h2>
          {weaponLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
              Loading upgrades...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {Object.entries(weaponUpgradeData).map(([key, data]) => {
                const level = weaponUpgrades[key]
                const cost = level < data.max ? data.cost(level + 1) : 0
                const isMaxed = level >= data.max
                const canAfford = coins >= cost

                return (
                  <div
                    key={key}
                    className={`store-card ${isMaxed ? 'purchased' : ''}`}
                  >
                    {isMaxed && (
                      <div className="store-card-purchased-badge">
                        <span className="purchased-icon">✓</span>
                        Maxed
                      </div>
                    )}
                    <div className="store-card-icon">{data.icon}</div>
                    <div className="store-card-content">
                      <h3 className="store-card-title">{data.name}</h3>
                      <p className="store-card-description">{data.desc}</p>
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                          <span>Level {level}/{data.max}</span>
                          {!isMaxed && <span style={{ color: canAfford ? '#ffd700' : '#ff6b6b' }}>⭐ {cost}</span>}
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${(level / data.max) * 100}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                      <div className="store-card-footer">
                        <button
                          className={`store-card-button ${isMaxed ? 'owned' : canAfford ? 'affordable' : 'expensive'}`}
                          onClick={() => handleWeaponUpgrade(key)}
                          disabled={isMaxed || !canAfford}
                        >
                          {isMaxed ? 'Maxed Out' : canAfford ? 'Upgrade' : 'Need More Coins'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {!weaponLoading && (
            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '8px', border: '1px solid rgba(78, 205, 196, 0.3)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
              ☁️ Weapon upgrades synced with Firebase - permanent across all devices!
            </div>
          )}
        </div>
        )}
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

