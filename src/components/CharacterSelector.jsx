import { useState, useEffect } from 'react'
import { getCoins, spendCoins, getOwned, ownItem } from '../utils/wallet'
import { portraitForCharacterId } from '../utils/assetMapper'
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
      speed: 'Balanced',
      strength: 'Balanced',
      cost: 0,
      isDefault: true,
      description: 'A balanced pilot with reliable laser weapons. Good for all situations.',
      playstyle: 'Best for: New players',
      bio: 'A skilled pilot from the outer colonies. Known for his tactical thinking and protective nature.',
      abilities: ['Shield Master: Shields last 50% longer', 'Tactical Precision: Bullets slightly home toward enemies', 'Adaptive Systems: Gains bonus stats in new biomes'],
    },
    {
      id: 'adelynn',
      icon: '👩‍🚀',
      color: ['#ff6b9a', '#ff00ff'],
      label: 'Adelynn',
      weapon: 'Spread',
      speed: 'High',
      strength: 'Low',
      cost: 0,
      isDefault: true,
      description: 'Lightning-fast pilot with spread shot capability. High mobility, lower durability.',
      playstyle: 'Best for: Advanced players',
      bio: 'A fearless explorer with unmatched speed. Her spread-shot technique is legendary throughout the galaxy.',
      abilities: ['Speed Demon: Can dash through enemies, damaging them', 'Multi-Target: Fires extra bullets at nearest 3 enemies', 'Momentum Boost: Speed increases with combo multiplier'],
    },
    {
      id: 'orion',
      icon: '🧑🏽‍🚀',
      color: ['#ffd166', '#ef476f'],
      label: 'Orion',
      weapon: 'Plasma',
      speed: 'Medium',
      strength: 'High',
      cost: 1000,
      isDefault: false,
      description: 'Powerful warrior with plasma weapons. High damage output and durability.',
      playstyle: 'Best for: Damage dealers',
      bio: 'A powerful warrior specializing in plasma weaponry. Known for devastating damage output.',
      abilities: ['Plasma Overload: Plasma weapons deal 25% more damage and explode on impact'],
    },
    {
      id: 'lyra',
      icon: '👩🏻‍🚀',
      color: ['#06d6a0', '#118ab2'],
      label: 'Lyra',
      weapon: 'Lightning',
      speed: 'High',
      strength: 'Medium',
      cost: 1500,
      isDefault: false,
      description: 'Swift electric warrior. Fast movement with chain lightning attacks.',
      playstyle: 'Best for: Speed and control',
      bio: 'A swift electric warrior with incredible speed and chain lightning capabilities.',
      abilities: ['Chain Lightning: Lightning attacks chain to 2 additional enemies'],
    },
    {
      id: 'jax',
      icon: '🧔‍🚀',
      color: ['#8d99ae', '#2b2d42'],
      label: 'Jax',
      weapon: 'Shotgun',
      speed: 'Low',
      strength: 'High',
      cost: 2000,
      isDefault: false,
      description: 'Heavy armored fighter. Slow but devastating close-range power.',
      playstyle: 'Best for: Tank players',
      bio: 'A heavy armored fighter with devastating close-range capabilities.',
      abilities: ['Tank Armor: +30% health and damage resistance'],
    },
    {
      id: 'vega',
      icon: '👩🏾‍🚀',
      color: ['#a1c4fd', '#c2e9fb'],
      label: 'Vega',
      weapon: 'Homing',
      speed: 'Medium',
      strength: 'Medium',
      cost: 1250,
      isDefault: false,
      description: 'Well-rounded pilot with homing missiles. Balanced stats for versatility.',
      playstyle: 'Best for: Versatile gameplay',
      bio: 'A well-rounded pilot with advanced homing missile technology.',
      abilities: ['Homing Precision: Missiles track enemies more accurately'],
    },
    {
      id: 'kael',
      icon: '🧑🏼‍🚀',
      color: ['#f7971e', '#ffd200'],
      label: 'Kael',
      weapon: 'Railgun',
      speed: 'Low',
      strength: 'High',
      cost: 5000,
      isDefault: false,
      description: 'Heavy weapons specialist. MAXIMUM firepower with railgun technology.',
      playstyle: 'Best for: Maximum damage',
      bio: 'A heavy weapons specialist with maximum firepower railgun technology.',
      abilities: ['Railgun Penetration: Railgun shots pierce through all enemies'],
    },
    {
      id: 'nova',
      icon: '👩🏼‍🚀',
      color: ['#7f00ff', '#e100ff'],
      label: 'Nova',
      weapon: 'Beam',
      speed: 'High',
      strength: 'Low',
      cost: 3000,
      isDefault: false,
      description: 'Fast interceptor with continuous beam weapons. High speed, lower health.',
      playstyle: 'Best for: Fast-paced action',
      bio: 'A fast interceptor pilot with continuous beam weapon technology.',
      abilities: ['Beam Focus: Continuous beam damage increases over time'],
    },
    {
      id: 'rio',
      icon: '🧑🏻‍🚀',
      color: ['#00c6ff', '#0072ff'],
      label: 'Rio',
      weapon: 'Missile',
      speed: 'Medium',
      strength: 'High',
      cost: 4000,
      isDefault: false,
      description: 'Explosive expert with missile launchers. High damage, balanced mobility.',
      playstyle: 'Best for: Explosive combat',
      bio: 'An explosive expert with advanced missile launcher systems.',
      abilities: ['Explosive Expert: Missiles have larger blast radius'],
    },
    {
      id: 'mira',
      icon: '👩🏽‍🚀',
      color: ['#ff9966', '#ff5e62'],
      label: 'Mira',
      weapon: 'Ice',
      speed: 'Medium',
      strength: 'Medium',
      cost: 2500,
      isDefault: false,
      description: 'Cryo-warrior with freeze weapons. Balanced stats with crowd control.',
      playstyle: 'Best for: Balanced gameplay',
      bio: 'A cryo-warrior specializing in freeze weapons and crowd control.',
      abilities: ['Frost Mastery: Ice attacks slow enemies by 30%'],
    },
  ]

  const buyChar = (id) => {
    if (ownedChars.includes(id)) return
    const character = CHARACTERS.find(c => c.id === id)
    if (!character) return
    const cost = character.cost || 300
    if (spendCoins(cost)) {
      setCoins(getCoins())
      const list = ownItem('ownedChars', id)
      setOwnedChars(list)
      setToast(`🧑‍🚀 ${character.label} unlocked!`)
      setTimeout(() => setToast(''), 2000)
    } else {
      setToast(`Not enough stars! Need ${cost}`)
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
    <div className="selector-page character-selector-page" data-page="characters">
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
            <span className="balance-amount">⭐ {coins.toLocaleString()}</span>
          </div>
        </div>

        <div className="selector-section">
          <h2 className="selector-section-title">Available Characters</h2>
          <div className="selector-grid">
            {CHARACTERS.map((character) => {
              const owned = ownedChars.includes(character.id) || character.isDefault
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
                    <img
                      src={portraitForCharacterId(character.id)}
                      alt={character.label}
                      className="character-avatar"
                      style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  </div>
                  <div className="selector-card-content">
                    <h3 className="selector-card-title">{character.label}</h3>
                    {character.description && (
                      <p className="character-description" style={{ fontSize: '0.85em', color: '#ccc', marginTop: '4px', marginBottom: '8px' }}>
                        {character.description}
                      </p>
                    )}
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
                    {character.playstyle && (
                      <div style={{ fontSize: '0.8em', color: '#4ecdc4', marginTop: '4px', fontStyle: 'italic' }}>
                        {character.playstyle}
                      </div>
                    )}
                    {character.abilities && character.abilities.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '0.75em', color: '#aaa' }}>
                        <strong style={{ color: '#4ecdc4' }}>Abilities:</strong>
                        <ul style={{ marginTop: '4px', paddingLeft: '16px' }}>
                          {character.abilities.map((ability, idx) => (
                            <li key={idx}>{ability}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!owned && (
                      <div className="selector-card-price">
                        <span className="price-icon">⭐</span>
                        <span className="price-amount">{character.cost || 300}</span>
                      </div>
                    )}
                    {owned && !character.isDefault && (
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

