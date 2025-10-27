# 🚀 Kaden & Adelynn Space Adventures

An epic space shooter game built with React, Vite, and deployed on Firebase Hosting.

## 🌟 Game Overview

Embark on an intergalactic adventure with Kaden and Adelynn! Battle through waves of enemies, collect power-ups, defeat massive bosses, and unlock achievements in this action-packed space shooter.

### 🎮 Live Demo
Play the game at: **https://kaden---adelynn-adventures.web.app**

## ✨ Features

### Core Gameplay Features (100+)
- 🎯 **25 Lives System** - Extended gameplay with multiple chances
- 🎮 **6+ Weapon Types** - Laser, Spread, Plasma, Missiles, and more
- 👾 **Boss Battles** - Multiple boss types with unique attack patterns
- 🏆 **Achievement System** - 10+ unlockable achievements with rewards
- 💥 **Combo System** - Chain kills for massive score multipliers
- 🌊 **Wave System** - Progressive difficulty with multiple levels
- 💰 **Currency System** - Earn coins and spend on upgrades
- 🛡️ **Shield Power** - Temporary invulnerability
- ⚡ **Rapid Fire** - Temporary shooting speed boost
- 🎯 **Multi-Shot** - Fire multiple projectiles at once
- ⏰ **Slow Motion** - Time-bending power-up
- 🚀 **Missile Pack** - Launch devastating missiles
- 💨 **Speed Boost** - Enhanced movement speed
- 💎 **Score Doubler** - Double your points
- 📊 **Statistics Tracking** - Monitor your progress
- 🎨 **Visual Effects** - Screen shake, explosions, particle effects
- 🌠 **Animated Background** - Dynamic starfield and nebula effects
- 💫 **Hit-Stop Effects** - Impact feedback
- 🎭 **Perfect Wave Bonus** - Complete waves flawlessly
- 📈 **Kill Streaks** - Consecutive kill bonuses

### Enemy Types (8+)
- 🔴 **Basic Enemy** - Standard foes
- 🎯 **Shooters** - Enemy fighters that fire back
- 💣 **Kamikaze** - Fast, suicide attackers
- 🛡️ **Tanks** - Heavy armor, slow but deadly
- ⚡ **Fast Movers** - Quick, agile enemies
- 🌊 **Zigzag** - Patterned movement enemies
- 👑 **Elite** - Advanced fighters with special abilities
- 💥 **Bombers** - Explosive enemies

### Power-Up System
- ❤️ **Health Boost** - Restore 50 health
- 🛡️ **Shield** - Temporary invulnerability
- ⚡ **Rapid Fire** - Faster shooting
- 🎯 **Multi-Shot** - Spread shot ability
- ⏰ **Slow Motion** - Slow down time
- 🚀 **Missile Pack** - Launch missiles
- 💨 **Speed Boost** - Enhanced movement
- 💰 **Score Doubler** - Double points earned

### Boss Battles
- 🌍 **Asteroid King** - Rock-hard first boss
- 👽 **Alien Mothership** - Advanced alien technology
- 🤖 **Mechanical Overlord** - Cybernetic threat
- 🐉 **Space Dragon** - Epic final boss

### Achievement System
Unlock achievements and earn rewards:
- 🎯 **First Victory** - Destroy your first enemy (100 coins)
- 🔥 **Combo Master** - Achieve a 10-hit combo (200 coins)
- 🛡️ **Untouchable** - Defeat boss without damage (500 coins)
- ⭐ **Perfect Wave** - Complete wave flawlessly (300 coins)
- 🏃 **Speed Runner** - Complete level 5 in under 5 minutes (400 coins)
- 📦 **Collector** - Collect 50 power-ups (250 coins)
- 🎯 **Sharpshooter** - Get 100 headshots (350 coins)
- 💪 **Survivor** - Survive 1000 enemies (500 coins)
- 💰 **Millionaire** - Score 1 million points (1000 coins)
- 🔥 **Destroyer** - Destroy 10,000 enemies (2000 coins)

## 🛠️ Technology Stack

- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Firebase Hosting** - Web deployment platform
- **Canvas API** - 2D game rendering
- **Web Audio API** - Sound effects

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/ronb12/Kaden-Adelynn-Adventures.git

# Navigate to the project directory
cd "Kaden & Adelynn Space Adventures"

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Play

### Controls
- **W/↑** - Move up
- **S/↓** - Move down
- **A/←** - Move left
- **D/→** - Move right
- **Spacebar** - Shoot
- **P** - Pause game

### Gameplay Tips
1. Use arrow keys or WASD to maneuver your ship
2. Collect power-ups to gain temporary advantages
3. Build combos by destroying enemies quickly
4. Watch for boss spawns every few waves
5. Use different weapon types strategically
6. Complete perfect waves for bonus rewards
7. Unlock achievements to earn coins
8. Spend coins on permanent upgrades (coming soon!)

## 🚀 Deployment

The game is automatically deployed to Firebase Hosting:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy to production
firebase deploy
```

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Game.jsx          # Main game component
│   │   ├── Game.css          # Game styles
│   │   ├── MainMenu.jsx      # Main menu component
│   │   └── MainMenu.css      # Menu styles
│   ├── utils/
│   │   ├── achievements.js   # Achievement system
│   │   ├── bosses.js         # Boss patterns & logic
│   │   ├── enemyTypes.js     # Enemy varieties
│   │   ├── particles.js      # Particle effects
│   │   ├── powerups.js       # Power-up system
│   │   └── sounds.js         # Audio effects
│   ├── App.jsx               # Main app component
│   ├── App.css               # App styles
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── public/
│   └── manifest.json         # PWA manifest
├── index.html                # HTML entry
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
├── firebase.json             # Firebase config
└── .firebaserc               # Firebase project config
```

## 🎨 Game Features Breakdown

### Visual Features
- Animated starfield background
- Particle explosion effects
- Muzzle flash effects
- Trail effects for projectiles
- Screen shake on impact
- Nebula gradient backgrounds
- Boss glow effects
- Power-up pick-up animations
- UI animations and transitions

### Audio Features
- Laser shooting sounds
- Explosion effects
- Power-up collection sounds
- Boss spawn audio
- Achievement unlock sounds
- Missile launch sounds
- Shield activation sounds

### Gameplay Mechanics
- Multiple difficulty levels (Easy, Medium, Hard)
- Progressive enemy difficulty
- Dynamic spawn rates
- Collision detection
- Health and lives system
- Combo multiplier system
- Score multiplier system
- Invulnerability frames
- Weapon switching
- Power-up duration timers

## 🤝 Contributing

This is a personal project for Kaden & Adelynn, but suggestions and feedback are welcome!

## 📝 License

This project is a personal creation for Kaden & Adelynn's gaming adventures.

## 🙏 Acknowledgments

- Built with love for Kaden & Adelynn
- Powered by React and Firebase
- Special thanks to the open-source gaming community

## 📧 Contact

For questions or feedback, reach out to: Ronellbradley@gmail.com

---

**Enjoy the game! May the stars guide your adventure! ⭐🚀**

