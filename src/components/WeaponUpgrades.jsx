import { useState, useEffect } from 'react'
import { getWeaponUpgrades, upgradeWeapon, getUpgradeCost, weaponUpgradeTypes } from '../utils/weaponUpgrades'
import { getCoins } from '../utils/wallet'
import './WeaponUpgrades.css'

function WeaponUpgrades({ onClose }) {
  const [selectedWeapon, setSelectedWeapon] = useState('laser')
  const [coins, setCoins] = useState(getCoins())
  const [upgrades, setUpgrades] = useState({})

  const weapons = ['laser', 'spread', 'plasma', 'missile', 'homing', 'shotgun', 'electric', 'freeze', 'railgun', 'beam']

  useEffect(() => {
    updateUpgrades()
  }, [selectedWeapon])

  const updateUpgrades = () => {
    setUpgrades(getWeaponUpgrades(selectedWeapon))
    setCoins(getCoins())
  }

  const handleUpgrade = (upgradeType) => {
    const result = upgradeWeapon(selectedWeapon, upgradeType, coins)
    if (result.success) {
      updateUpgrades()
      // Show success message
      alert(`Upgrade successful! ${weaponUpgradeTypes[upgradeType].name} upgraded to level ${result.newLevel}`)
    } else {
      alert(result.error || 'Upgrade failed')
    }
  }

  return (
    <div className="weapon-upgrades-overlay">
      <div className="weapon-upgrades-container">
        <div className="weapon-upgrades-header">
          <h1>⚔️ Weapon Upgrades</h1>
          <div className="coins-display">💰 {coins.toLocaleString()} Coins</div>
          <button className="weapon-upgrades-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="weapon-selector">
          <h3>Select Weapon</h3>
          <div className="weapon-buttons">
            {weapons.map((weapon) => (
              <button
                key={weapon}
                className={`weapon-btn ${selectedWeapon === weapon ? 'active' : ''}`}
                onClick={() => setSelectedWeapon(weapon)}
              >
                {weapon.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="upgrades-section">
          <h3>{selectedWeapon.toUpperCase()} Upgrades</h3>
          <div className="upgrades-grid">
            {Object.entries(weaponUpgradeTypes).map(([type, upgradeDef]) => {
              const currentLevel = upgrades[type] || 0
              const cost = getUpgradeCost(selectedWeapon, type)
              const isMaxLevel = currentLevel >= upgradeDef.maxLevel
              const canAfford = cost && coins >= cost

              return (
                <div key={type} className="upgrade-card">
                  <div className="upgrade-header">
                    <div className="upgrade-name">{upgradeDef.name}</div>
                    <div className="upgrade-level">
                      Level {currentLevel}/{upgradeDef.maxLevel}
                    </div>
                  </div>
                  <div className="upgrade-description">{upgradeDef.description}</div>
                  <div className="upgrade-effect">
                    Effect: +{Math.round(upgradeDef.effectPerLevel * 100)}% per level
                  </div>
                  {!isMaxLevel ? (
                    <div className="upgrade-footer">
                      <div className="upgrade-cost">
                        Cost: {cost ? `${cost.toLocaleString()} coins` : 'N/A'}
                      </div>
                      <button
                        className={`upgrade-btn ${canAfford ? 'affordable' : 'expensive'}`}
                        onClick={() => handleUpgrade(type)}
                        disabled={!canAfford}
                      >
                        Upgrade
                      </button>
                    </div>
                  ) : (
                    <div className="upgrade-max">MAX LEVEL</div>
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

export default WeaponUpgrades
