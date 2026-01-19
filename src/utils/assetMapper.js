// Maps character IDs used in iOS to portrait assets in the web public folder
// Uses verified character sprites from KA_final_individual_sprites_VERIFIED
export function portraitForCharacterId(id) {
  switch (id) {
    // Default characters - using verified sprites
    // Adelynn is the pink character, Orion is yellow/orange
    case 'kaden':
      return '/KA_character_1.png'
    case 'adelynn':
      return '/KA_character_3.png' // Pink character (swapped with Orion)
    case 'orion':
      return '/KA_character_2.png' // Yellow/orange character (swapped with Adelynn)
    
    // Unlockable characters - using verified sprites
    // Mapping based on iOS character order: kaden, adelynn, orion, lyra, jax, vega, kael, nova, rio, mira
    // We have 8 verified sprites, so mapping first 8 characters to sprites 1-8
    case 'lyra':
      return '/KA_character_4.png'
    case 'jax':
      return '/KA_character_5.png'
    case 'vega':
      return '/KA_character_6.png'
    case 'kael':
      return '/KA_character_7.png'
    case 'nova':
      return '/KA_character_8.png'
    
    // Characters with character images from iOS assets
    case 'rio':
      return '/rio_character.png'
    case 'mira':
      return '/mira_character.png'
    
    // Ship selector ships (matching ShipSelector.jsx)
    case 'falcon':
      return '/falcon_portrait.png'
    case 'comet':
      return '/comet_portrait.png'
    case 'phantom':
      return '/phantom_portrait.png'
    case 'meteor':
      return '/meteor_portrait.png'
    case 'viper':
      return '/viper_portrait.png'
    case 'shadow':
      return '/shadow_portrait.png'
    case 'raptor':
      return '/raptor_portrait.png'
    case 'titan':
      return '/titan_portrait.png'
    case 'aurora':
      return '/aurora_portrait.png'
    
    // Legacy support
    case 'hero8':
      return '/KA_character_8.png' // Nova
    case 'hero9':
      return '/hero9_portrait.png' // Rio
    
    default:
      return '/KA_character_1.png' // Default to Kaden
  }
}

// Maps ship IDs to ship image assets
// Uses ship-specific images when available, falls back to ship icons
export function imageForShipId(id) {
  // Try ship image first (if ship-specific images exist)
  const shipImagePath = `/ships/${id}_ship.png`
  
  // For now, use ship icons/portraits that represent the ship
  // In the future, these can be replaced with actual ship sprite images
  switch (id) {
    case 'kaden':
      return '/kaden_portrait.png' // Kaden's ship uses Kaden's portrait
    case 'adelynn':
      return '/adelynn_portrait.png' // Adelynn's ship uses Adelynn's portrait
    case 'falcon':
      return '/falcon_portrait.png'
    case 'comet':
      return '/comet_portrait.png'
    case 'phantom':
      return '/phantom_portrait.png'
    case 'meteor':
      return '/meteor_portrait.png'
    case 'viper':
      return '/viper_portrait.png'
    case 'nova':
      return '/nova_portrait.png'
    case 'shadow':
      return '/shadow_portrait.png'
    case 'raptor':
      return '/raptor_portrait.png'
    case 'titan':
      return '/titan_portrait.png'
    case 'aurora':
      return '/aurora_portrait.png'
    default:
      return '/kaden_portrait.png'
  }
}
