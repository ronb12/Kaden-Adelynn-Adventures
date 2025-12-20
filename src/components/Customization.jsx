import { useState, useEffect } from 'react'
import { getCustomization, unlockCustomization, selectCustomization, customizationOptions, isUnlocked } from '../utils/customization'
import { getCoins } from '../utils/wallet'
import './Customization.css'

function Customization({ onClose }) {
  const [custom, setCustom] = useState(getCustomization())
  const [coins, setCoins] = useState(getCoins())
  const [activeCategory, setActiveCategory] = useState('shipSkins')

  useEffect(() => {
    setCustom(getCustomization())
    setCoins(getCoins())
  }, [])

  const handleUnlock = (category, item) => {
    const result = unlockCustomization(category, item, coins)
    if (result.success) {
      setCustom(getCustomization())
      setCoins(getCoins())
      alert(`Unlocked ${customizationOptions[category][item].name}!`)
    } else {
      alert(result.error || 'Failed to unlock')
    }
  }

  const handleSelect = (category, item) => {
    const result = selectCustomization(category, item)
    if (result.success) {
      setCustom(getCustomization())
      alert(`Selected ${customizationOptions[category][item].name}!`)
    } else {
      alert(result.error || 'Failed to select')
    }
  }

  const categories = [
    { key: 'shipSkins', name: 'Ship Skins', icon: '🚀' },
    { key: 'trailEffects', name: 'Trail Effects', icon: '✨' },
    { key: 'bulletStyles', name: 'Bullet Styles', icon: '💫' },
    { key: 'uiThemes', name: 'UI Themes', icon: '🎨' },
  ]

  return (
    <div className="customization-overlay">
      <div className="customization-container">
        <div className="customization-header">
          <h1>🎨 Customization</h1>
          <div className="coins-display">💰 {coins.toLocaleString()} Coins</div>
          <button className="customization-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="customization-tabs">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`customization-tab ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span className="tab-icon">{cat.icon}</span>
              <span className="tab-name">{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="customization-content">
          <div className="customization-grid">
            {Object.entries(customizationOptions[activeCategory]).map(([key, item]) => {
              const unlocked = isUnlocked(activeCategory, key)
              const isSelected = custom[`selected${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1).replace('Skins', 'ShipSkin').replace('Effects', 'Trail').replace('Styles', 'BulletStyle').replace('Themes', 'UITheme')}`] === key

              return (
                <div
                  key={key}
                  className={`customization-item ${unlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`}
                >
                  <div className="item-icon">
                    {unlocked ? '✅' : '🔒'}
                  </div>
                  <div className="item-name">{item.name}</div>
                  {unlocked ? (
                    <div className="item-actions">
                      {isSelected ? (
                        <div className="selected-badge">SELECTED</div>
                      ) : (
                        <button
                          className="select-btn"
                          onClick={() => handleSelect(activeCategory, key)}
                        >
                          Select
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="item-actions">
                      <div className="item-cost">💰 {item.cost.toLocaleString()}</div>
                      <button
                        className={`unlock-btn ${coins >= item.cost ? 'affordable' : 'expensive'}`}
                        onClick={() => handleUnlock(activeCategory, key)}
                        disabled={coins < item.cost}
                      >
                        Unlock
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Customization
