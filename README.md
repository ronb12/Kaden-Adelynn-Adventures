# 🚀 Kaden & Adelynn Space Adventures

An epic space shooter game built with React, Vite, and deployed on Firebase Hosting.

## 🌟 Game Overview

Embark on an intergalactic adventure with Kaden and Adelynn! Battle through waves of enemies, collect power-ups, defeat massive bosses, and unlock achievements in this action-packed space shooter.

### 🎮 Live Demo
Play the game at: **https://kaden---adelynn-adventures.web.app**

## ✨ Features

### Core Gameplay Features
- 🎯 **25 Lives System**
- 🎮 **15+ Weapon Types** (Laser, Spread, Plasma, Missile, Shotgun, Beam, Railgun, etc.)
- 👾 **Boss Battles** with movement and aimed shots
- 🛡️ **Power-ups** (Shield, Rapid Fire, Slow Motion, Doubler, more)
- 💥 **Combo System** and score multipliers
- 🌊 **Endless Waves & Levels** (level increases every 5 waves)
- 🟥/🟪 **Enemy Mix** including tougher silver ships
- 📊 **Top Scores** (local) and optional **Cloud Scores** (Firestore) with player names
- 📱 **Mobile-optimized HUD** and iOS PWA pull-to-refresh

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

## 🚀 Deployment (Manual)

```bash
# Install Firebase CLI (once)
npm install -g firebase-tools

# Build & deploy
npm run build
firebase deploy --only hosting
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
- Laser/explosion/power-up effects
- Boss/achievement/missile/shield sounds
- Background music (menu/gameplay/boss)

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

