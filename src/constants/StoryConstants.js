// Story Constants - Narrative content and progression
export const STORY_CHAPTERS = {
  PROLOGUE: {
    id: 'prologue',
    title: 'The Call to Adventure',
    content: `In the year 2157, the galaxy faces its greatest threat. The mysterious Void Empire has emerged from the dark reaches of space, consuming entire star systems with their shadow fleets.

Kaden and Adelynn, two young space cadets from the United Earth Federation, have been chosen for a critical mission. Their task: pilot experimental fighter ships and gather intelligence on the Void Empire's weaponry and tactics.

But first, they must prove themselves worthy of this dangerous assignment...`,
    background: 'space-station',
    music: 'tense'
  },
  
  CHAPTER_1: {
    id: 'chapter_1',
    title: 'First Contact',
    content: `As Kaden and Adelynn begin their training mission, they encounter their first Void Empire scout ships. These are just the beginning - the Empire's forces are vast and their technology is unlike anything humanity has seen.

The cadets must learn to adapt quickly, collecting weapon fragments and power-ups from destroyed enemies to upgrade their ships. Every victory brings them closer to understanding the true nature of their enemy.

But the Void Empire is watching...`,
    background: 'asteroid-field',
    music: 'action',
    unlockScore: 1000
  },
  
  CHAPTER_2: {
    id: 'chapter_2',
    title: 'The Shadow Fleet',
    content: `The training intensifies as more powerful Void ships appear. Kaden and Adelynn discover that the Empire's ships are not just piloted by organic beings - many are controlled by ancient AI systems that have been dormant for centuries.

Their mission becomes clear: gather enough intelligence to help the Federation develop countermeasures before the full Void Fleet arrives at Earth's doorstep.

The fate of humanity rests in their hands...`,
    background: 'nebula',
    music: 'epic',
    unlockScore: 5000
  },
  
  CHAPTER_3: {
    id: 'chapter_3',
    title: 'The Void Awakens',
    content: `A massive Void battleship emerges from hyperspace, its dark hull blotting out the stars. This is no ordinary enemy - it's a living ship, a fusion of organic and mechanical technology that defies understanding.

Kaden and Adelynn must work together to defeat this colossal threat. Their experimental ships, now upgraded with the latest Federation technology, are humanity's last hope.

The final battle for the galaxy begins...`,
    background: 'void-battlefield',
    music: 'final-battle',
    unlockScore: 10000
  },
  
  EPILOGUE: {
    id: 'epilogue',
    title: 'Heroes of the Federation',
    content: `Against all odds, Kaden and Adelynn have succeeded. The Void battleship lies in ruins, and the Empire's advance has been halted. The intelligence they gathered will help the Federation prepare for the coming war.

But this is only the beginning. The Void Empire is vast, and their true strength remains hidden in the dark corners of the galaxy. Kaden and Adelynn's journey is far from over.

The galaxy needs heroes. The galaxy needs them.

*End of Part I*`,
    background: 'victory',
    music: 'triumphant'
  }
};

export const STORY_EVENTS = {
  FIRST_KILL: {
    id: 'first_kill',
    title: 'First Blood',
    message: 'You\'ve destroyed your first Void scout! The enemy is not invincible.',
    trigger: 'enemy_killed',
    condition: { count: 1 }
  },
  
  WEAPON_DISCOVERY: {
    id: 'weapon_discovery',
    title: 'Technology Salvaged',
    message: 'You\'ve collected Void weapon technology! The Federation can reverse-engineer this.',
    trigger: 'weapon_collected',
    condition: { count: 1 }
  },
  
  POWER_UP_FOUND: {
    id: 'power_up_found',
    title: 'Enhancement Detected',
    message: 'Your ship\'s systems are being upgraded with alien technology.',
    trigger: 'power_up_collected',
    condition: { count: 1 }
  },
  
  BOSS_APPROACHING: {
    id: 'boss_approaching',
    title: 'Massive Energy Signature',
    message: 'Warning! A large Void vessel is approaching. This is no ordinary enemy...',
    trigger: 'boss_spawn',
    condition: { score: 1000 }
  },
  
  BOSS_DEFEATED: {
    id: 'boss_defeated',
    title: 'Victory!',
    message: 'The Void battleship has been destroyed! But more threats await in the darkness...',
    trigger: 'boss_killed',
    condition: { count: 1 }
  },
  
  HIGH_SCORE: {
    id: 'high_score',
    title: 'Elite Pilot',
    message: 'Your combat rating has reached elite status. The Federation is impressed.',
    trigger: 'score_milestone',
    condition: { score: 5000 }
  }
};

export const CHARACTER_BIOGRAPHIES = {
  KADEN: {
    name: 'Kaden',
    title: 'Elite Pilot',
    age: 22,
    background: `Born on Mars Colony, Kaden showed exceptional piloting skills from a young age. His father was a legendary fighter pilot who disappeared during the first Void Empire encounter. Kaden joined the Federation Academy to follow in his father's footsteps and uncover the truth about his disappearance.

Kaden is known for his aggressive flying style and his ability to think on his feet in combat situations. He prefers energy weapons and has a natural talent for evasive maneuvers.`,
    personality: 'Bold, determined, and fiercely loyal to his friends',
    special_ability: 'Enhanced reflexes and combat instincts',
    ship_name: 'Phoenix Wing'
  },
  
  ADELYNN: {
    name: 'Adelynn',
    title: 'Tactical Genius',
    age: 21,
    background: `Adelynn grew up on Earth in the orbital city of New Tokyo. A brilliant strategist and engineer, she designed many of the experimental systems used in Federation fighter ships. Her analytical mind and calm demeanor make her an excellent pilot under pressure.

Adelynn specializes in tactical analysis and has developed several innovative combat techniques. She prefers projectile weapons and excels at long-range combat.`,
    personality: 'Intelligent, methodical, and deeply caring',
    special_ability: 'Advanced tactical analysis and system optimization',
    ship_name: 'Stellar Arrow'
  }
};

export const VOID_EMPIRE_LORE = {
  ORIGIN: `The Void Empire emerged from the Andromeda Galaxy, a civilization that had mastered the fusion of organic and mechanical technology. Their ships are not just vehicles - they are living entities that grow and adapt.

The Empire's goal is to consume all life in the universe, converting it into their own twisted form of existence. They see other civilizations as primitive and believe they are doing the galaxy a favor by "evolving" them.`,
  
  TECHNOLOGY: `Void technology is based on dark matter manipulation and quantum entanglement. Their ships can phase in and out of reality, making them nearly impossible to track or predict.

Their weapons fire concentrated dark energy that can disrupt matter at the molecular level. The Federation's shields are only partially effective against these attacks.`,
  
  HIERARCHY: `The Void Empire is ruled by the Shadow Council, a group of ancient beings who have transcended physical form. They communicate through quantum entanglement and can control their fleets across vast distances.

Below them are the Void Lords, powerful entities that command individual fleets. The lowest rank are the Void Drones, the foot soldiers of the Empire.`
};

export const FEDERATION_LORE = {
  HISTORY: `The United Earth Federation was formed in 2089 after humanity made first contact with several alien species. Together, they created a peaceful alliance dedicated to exploration and scientific advancement.

The Federation's military was designed for defense, not conquest. Their ships are built for speed and maneuverability, with advanced shield technology and a wide variety of weapon systems.`,
  
  TECHNOLOGY: `Federation technology is based on clean energy and advanced materials science. Their ships use fusion reactors and quantum computers, making them highly efficient and reliable.

The experimental fighter program that Kaden and Adelynn are part of represents the Federation's most advanced technology. These ships can adapt and upgrade themselves using salvaged alien technology.`,
  
  VALUES: `The Federation believes in the value of all life and the importance of peaceful cooperation. They see the Void Empire as a threat to everything they stand for.

Their motto: "Unity through diversity, strength through cooperation, hope through courage."`
};

export const STORY_PROGRESSION = {
  // Story unlocks based on game progress
  UNLOCKS: [
    { trigger: 'game_start', chapter: 'PROLOGUE' },
    { trigger: 'score_1000', chapter: 'CHAPTER_1' },
    { trigger: 'score_5000', chapter: 'CHAPTER_2' },
    { trigger: 'score_10000', chapter: 'CHAPTER_3' },
    { trigger: 'boss_defeated', chapter: 'EPILOGUE' }
  ],
  
  // Story events that can trigger during gameplay
  EVENTS: [
    { trigger: 'first_kill', event: 'FIRST_KILL' },
    { trigger: 'weapon_collected', event: 'WEAPON_DISCOVERY' },
    { trigger: 'power_up_collected', event: 'POWER_UP_FOUND' },
    { trigger: 'boss_spawn', event: 'BOSS_APPROACHING' },
    { trigger: 'boss_killed', event: 'BOSS_DEFEATED' },
    { trigger: 'score_5000', event: 'HIGH_SCORE' }
  ]
};
