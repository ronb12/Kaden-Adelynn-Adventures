// Character Abilities Manager - Matching iOS CharacterAbilitiesManager.swift

export const AbilityType = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
}

export const characterAbilities = {
  kaden: [
    {
      id: 'kaden_shield_master',
      name: 'Shield Master',
      description: 'Shields last 50% longer',
      icon: '🛡️',
      type: AbilityType.PASSIVE,
      characterId: 'kaden',
    },
    {
      id: 'kaden_tactical_precision',
      name: 'Tactical Precision',
      description: 'Bullets slightly home toward enemies',
      icon: '🎯',
      type: AbilityType.PASSIVE,
      characterId: 'kaden',
    },
    {
      id: 'kaden_adaptive_systems',
      name: 'Adaptive Systems',
      description: 'Gains bonus stats in new biomes',
      icon: '⚙️',
      type: AbilityType.PASSIVE,
      characterId: 'kaden',
    },
  ],
  adelynn: [
    {
      id: 'adelynn_speed_demon',
      name: 'Speed Demon',
      description: 'Can dash through enemies, damaging them',
      icon: '💨',
      type: AbilityType.ACTIVE,
      cooldown: 15.0,
      duration: 1.0,
      characterId: 'adelynn',
    },
    {
      id: 'adelynn_multi_target',
      name: 'Multi-Target',
      description: 'Fires extra bullets at nearest 3 enemies',
      icon: '💥',
      type: AbilityType.PASSIVE,
      characterId: 'adelynn',
    },
    {
      id: 'adelynn_momentum_boost',
      name: 'Momentum Boost',
      description: 'Speed increases with combo multiplier',
      icon: '⚡',
      type: AbilityType.PASSIVE,
      characterId: 'adelynn',
    },
  ],
  orion: [
    {
      id: 'orion_plasma_overload',
      name: 'Plasma Overload',
      description: 'Plasma weapons deal 25% more damage and explode on impact',
      icon: '🌟',
      type: AbilityType.PASSIVE,
      characterId: 'orion',
    },
  ],
  lyra: [
    {
      id: 'lyra_chain_lightning',
      name: 'Chain Lightning',
      description: 'Lightning attacks chain to 2 additional enemies',
      icon: '⚡',
      type: AbilityType.PASSIVE,
      characterId: 'lyra',
    },
  ],
  jax: [
    {
      id: 'jax_tank_armor',
      name: 'Tank Armor',
      description: '+30% health and damage resistance',
      icon: '🪖',
      type: AbilityType.PASSIVE,
      characterId: 'jax',
    },
  ],
  kael: [
    {
      id: 'kael_railgun_penetration',
      name: 'Railgun Penetration',
      description: 'Railgun shots pierce through all enemies',
      icon: '🔫',
      type: AbilityType.PASSIVE,
      characterId: 'kael',
    },
  ],
}

export class CharacterAbilitiesManager {
  constructor() {
    this.activeAbilities = {}
  }

  getAbilities(characterId) {
    return characterAbilities[characterId] || []
  }

  activateAbility(abilityId, characterId) {
    const abilities = this.getAbilities(characterId)
    const ability = abilities.find((a) => a.id === abilityId)
    if (!ability) return false

    // Check cooldown
    if (ability.lastUsed && Date.now() - ability.lastUsed < (ability.cooldown || 0) * 1000) {
      console.log(`Ability ${ability.name} is on cooldown.`)
      return false
    }

    ability.isActive = true
    ability.lastUsed = Date.now()
    this.activeAbilities[abilityId] = ability

    console.log(`Ability ${ability.name} activated!`)

    // Schedule deactivation
    if (ability.duration > 0) {
      setTimeout(() => {
        this.deactivateAbility(abilityId)
      }, ability.duration * 1000)
    }

    return true
  }

  deactivateAbility(abilityId) {
    if (this.activeAbilities[abilityId]) {
      this.activeAbilities[abilityId].isActive = false
      console.log(`Ability ${this.activeAbilities[abilityId].name} deactivated.`)
      delete this.activeAbilities[abilityId]
    }
  }

  isAbilityOnCooldown(abilityId) {
    const ability = this.activeAbilities[abilityId]
    if (!ability || !ability.lastUsed) return false
    const elapsed = (Date.now() - ability.lastUsed) / 1000
    return elapsed < (ability.cooldown || 0)
  }

  remainingCooldown(abilityId) {
    const ability = this.activeAbilities[abilityId]
    if (!ability || !ability.lastUsed) return 0.0
    const elapsed = (Date.now() - ability.lastUsed) / 1000
    return Math.max(0.0, (ability.cooldown || 0) - elapsed)
  }

  getAbilityModifier(characterId, type) {
    // Health multiplier
    if (type === 'healthMultiplier') {
      if (characterId === 'jax' && this.activeAbilities['jax_tank_armor']?.isActive) {
        return 1.3 // 30% extra health
      }
      return 1.0
    }

    // Damage multiplier
    if (type === 'damageMultiplier') {
      if (characterId === 'orion' && this.activeAbilities['orion_plasma_overload']?.isActive) {
        return 1.25 // 25% extra damage
      }
      return 1.0
    }

    // Speed multiplier
    if (type === 'speedMultiplier') {
      if (characterId === 'adelynn' && this.activeAbilities['adelynn_momentum_boost']?.isActive) {
        // Example: speed scales with combo, for now a flat boost
        return 1.15
      }
      return 1.0
    }

    // Shield duration multiplier
    if (type === 'shieldDurationMultiplier') {
      if (characterId === 'kaden' && this.activeAbilities['kaden_shield_master']?.isActive) {
        return 1.5 // 50% longer shields
      }
      return 1.0
    }

    return 1.0
  }
}

export const characterAbilitiesManager = new CharacterAbilitiesManager()

