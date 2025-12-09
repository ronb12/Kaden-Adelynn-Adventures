import { useState, useEffect } from 'react'
import { getCoins, spendCoins, getOwned, ownItem } from '../utils/wallet'
import './CharacterSelector.css'

function CharacterSelector({ onClose, onSelectCharacter, selectedCharacter: initialSelectedCharacter }) {
  const [selectedCharacter, setSelectedCharacter] = useState(initialSelectedCharacter)
  const [coins, setCoins] = useState(() => getCoins())
  const [toast, setToast] = useState('')
  const [ownedChars, setOwnedChars] = useState(() => getOwned('ownedChars'))

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(getCoins())
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const CHARACTERS = [
    {
      id: 'kaden',
      icon: '🧑🏿‍🚀',
      color: ['#4ecdc4', '#667eea'],
      label: 'Kaden',
      weapon: 'Laser',
      speed: 'Medium',
      strength: 'Medium',
    },
    {
      id: 'adelynn',
      icon: '👩‍🚀',
      color: ['#ff6b9a', '#ff00ff'],
      label: 'Adelynn',
      weapon: 'Spread',
      speed: 'High',
      strength: 'Low',
    },
    {
      id: 'hero3',
      icon: '🧑🏽‍🚀',
      color: ['#ffd166', '#ef476f'],
      label: 'Orion',
      weapon: 'Plasma',
      speed: 'Medium',
      strength: 'High',
    },
    {
      id: 'hero4',
      icon: '👩🏻‍🚀',
      color: ['#06d6a0', '#118ab2'],
      label: 'Lyra',
      weapon: 'Lightning',
      speed: 'High',
      strength: 'Medium',
    },
    {
      id: 'hero5',
      icon: '🧔‍🚀',
      color: ['#8d99ae', '#2b2d42'],
      label: 'Jax',
      weapon: 'Shotgun',
      speed: 'Low',
      strength: 'High',
    },
    {
      id: 'hero6',
      icon: '👩🏾‍🚀',
      color: ['#a1c4fd', '#c2e9fb'],
      label: 'Vega',
      weapon: 'Homing',
      speed: 'Medium',
      strength: 'Medium',
    },
    {
      id: 'hero7',
      icon: '🧑🏼‍🚀',
      color: ['#f7971e', '#ffd200'],
      label: 'Kael',
      weapon: 'Railgun',
      speed: 'Low',
      strength: 'High',
    },
    {
      id: 'hero8',
      icon: '👩🏼‍🚀',
      color: ['#7f00ff', '#e100ff'],
      label: 'Nova',
      weapon: 'Beam',
      speed: 'High',
      strength: 'Low',
    },
    {
      id: 'hero9',
      icon: '🧑🏻‍🚀',
      color: ['#00c6ff', '#0072ff'],
      label: 'Rio',
      weapon: 'Missile',
      speed: 'Medium',
      strength: 'High',
    },
    {
      id: 'hero10',
      icon: '👩🏽‍🚀',
      color: ['#ff9966', '#ff5e62'],
      label: 'Mira',
      weapon: 'Ice',
      speed: 'Medium',
      strength: 'Medium',
    },
  ]

  const buyChar = (id) => {
    if (ownedChars.includes(id)) return
    const cost = 150
    if (spendCoins(cost)) {
      setCoins(getCoins())
      const list = ownItem('ownedChars', id)
      setOwnedChars(list)
      setToast('🧑‍🚀 Character unlocked!')
      setTimeout(() => setToast(''), 2000)
    } else {
      setToast('Not enough coins!')
      setTimeout(() => setToast(''), 1500)
    }
  }

  const handleSelectCharacter = (charId) => {
    setSelectedCharacter(charId)
    if (onSelectCharacter) {
      onSelectCharacter(charId)
    }
    onClose()
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
              <span className="selector-title-icon">🧑‍🚀</span>
              Choose Your Character
            </h1>
            <p className="selector-header-subtitle">Select your space adventurer</p>
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
          <h2 className="selector-section-title">Available Characters</h2>
          <div className="selector-grid">
            {CHARACTERS.map((character) => {
              const owned = ownedChars.includes(character.id) || character.id === 'kaden' || character.id === 'adelynn'
              const active = selectedCharacter === character.id
              return (
                <div
                  key={character.id}
                  className={`selector-card ${active ? 'active' : ''} ${!owned ? 'locked' : ''}`}
                  onClick={() => {
                    if (owned) {
                      handleSelectCharacter(character.id)
                    } else {
                      buyChar(character.id)
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
                    <div
                      className="character-avatar"
                      style={{
                        background: `linear-gradient(135deg, ${character.color[0]}, ${character.color[1]})`,
                      }}
                    >
                      {character.icon}
                    </div>
                  </div>
                  <div className="selector-card-content">
                    <h3 className="selector-card-title">{character.label}</h3>
                    <div className="character-stats">
                      <div className="stat-item">
                        <span className="stat-icon">⚔️</span>
                        <span className="stat-label">Weapon:</span>
                        <span className="stat-value">{character.weapon}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">🏃</span>
                        <span className="stat-label">Speed:</span>
                        <span className="stat-value">{character.speed}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">💪</span>
                        <span className="stat-label">Strength:</span>
                        <span className="stat-value">{character.strength}</span>
                      </div>
                    </div>
                    {!owned && (
                      <div className="selector-card-price">
                        <span className="price-icon">💰</span>
                        <span className="price-amount">150</span>
                      </div>
                    )}
                    {owned && (character.id !== 'kaden' && character.id !== 'adelynn') && (
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

export default CharacterSelector

