# 🚀 Kaden & Adelynn Space Adventures

<div align="center">

![Space Adventures](https://img.shields.io/badge/Game-Space%20Shooter-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-FFCA28?style=for-the-badge&logo=firebase)

**An epic space shooter game featuring Kaden and Adelynn on their intergalactic adventure!**

[Play Now](https://kaden---adelynn-adventures.web.app) • [Report Bug](https://github.com/ronb12/Kaden-Adelynn-Adventures/issues) • [Request Feature](https://github.com/ronb12/Kaden-Adelynn-Adventures/issues)

</div>

---

## ✨ Features

### 🎮 Core Gameplay
- **Intense Space Combat**: Battle through waves of enemies in fast-paced space shooter action
- **Multiple Waves & Levels**: Progress through increasingly challenging waves and levels
- **Boss Battles**: Face epic boss encounters at the end of each wave
- **Real-time Shooting Accuracy**: Track your shooting accuracy percentage in real-time on the scoreboard
- **Combo System**: Build combos for bonus points and multipliers

### 🎯 Game Mechanics
- **Character Selection**: Choose between Kaden and Adelynn
- **Ship Customization**: Select from multiple ship designs
- **Weapon Variety**: 
  - Laser rifles
  - Spread shots
  - Plasma beams
  - Missiles & rockets
  - Shotgun blasts
  - And many more!
- **Power-ups**: 
  - 🛡️ Shields for protection
  - ⚡ Rapid fire for increased firepower
  - ⏰ Slow motion for tactical advantage
  - 💰 Coin doubler for extra rewards

### 📊 Scoring & Progression
- **Score Tracking**: Earn points by defeating enemies and bosses
- **Shooting Accuracy**: Real-time accuracy percentage with color-coded feedback
  - 🟢 Green (≥70%): Excellent accuracy
  - 🟠 Orange (50-69%): Good accuracy
  - 🔴 Red (<50%): Needs improvement
- **High Score Leaderboards**: 
  - Local leaderboard for personal bests
  - Cloud leaderboard for global competition
- **Achievement System**: Unlock achievements as you play
- **In-Game Store**: Purchase upgrades with coins earned during gameplay

### 📱 Platform Support
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Touch Controls**: Optimized touch controls for mobile gameplay
- **Gamepad Support**: Full controller support for enhanced gaming experience

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/ronb12/Kaden-Adelynn-Adventures.git

# Navigate to the project directory
cd Kaden-Adelynn-Adventures

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the project
npm run build
```

### Deploy to Firebase

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## 🎮 How to Play

1. **Start the Game**: Click "Play" from the main menu
2. **Select Character**: Choose Kaden or Adelynn
3. **Choose Your Ship**: Pick a ship that matches your playstyle
4. **Battle Enemies**: 
   - Use arrow keys/WASD or touch controls to move
   - Spacebar or touch to shoot
   - Destroy enemies to earn points
   - Watch your accuracy percentage in real-time!
5. **Collect Power-ups**: Grab power-ups that drop from enemies
6. **Face Bosses**: Defeat bosses to advance to the next wave
7. **Climb the Leaderboard**: Compete for the highest scores!

### Controls

- **Desktop**: 
  - Arrow Keys / WASD: Move
  - Spacebar: Shoot
  - P: Pause
- **Mobile**: 
  - Touch and drag: Move
  - Tap: Shoot
- **Gamepad**: 
  - Left Stick / D-pad: Move
  - A Button / Right Trigger: Shoot

---

## 🛠️ Technologies

- **Frontend Framework**: [React](https://react.dev/) 18.2.0
- **Build Tool**: [Vite](https://vitejs.dev/) 5.0
- **Game Rendering**: HTML5 Canvas API
- **Hosting**: [Firebase Hosting](https://firebase.google.com/docs/hosting)
- **Cloud Services**: Firebase for leaderboards and data storage

---

## 📱 iOS App (Native) – Build & Run

The repo includes a native iOS app under `ios/KadenAdelynnAdventures/`.

### Run from Xcode
- Open Xcode and load the project at: `ios/KadenAdelynnAdventures/KadenAdelynnAdventures.xcodeproj`
- Select the scheme: `KadenAdelynnAdventures`
- Choose a destination: `iPhone 16 Pro Max` (or any simulator/device)
- Click Run ▶ to build and launch.

### Run from Terminal
```bash
cd ios/KadenAdelynnAdventures
# Build for simulator (iPhone 16 Pro Max)
xcodebuild -scheme KadenAdelynnAdventures -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 16 Pro Max'

# Launch in Simulator (if build succeeded)
open -a Simulator
xcrun simctl boot "iPhone 16 Pro Max"
APP_PATH=$(ls -d ~/Library/Developer/Xcode/DerivedData/KadenAdelynnAdventures-*/Build/Products/Debug-iphonesimulator/KadenAdelynnAdventures.app | head -1)
xcrun simctl install booted "$APP_PATH"
xcrun simctl launch booted com.kaden-adelynn.adventures
```

### Simulator Troubleshooting
- If you see CoreSimulatorService interruptions, try quitting Simulator and Xcode, then relaunch.
- Ensure the iOS Simulator runtime is installed (Xcode → Settings → Platforms).
- As a last resort: `xcrun simctl erase "iPhone 16 Pro Max"` (will reset that device)

---

## 📁 Project Structure

```
kaden-adelynn-space-adventures/
├── src/
│   ├── components/          # React components
│   │   ├── Game.jsx         # Main game component
│   │   ├── MainMenu.jsx     # Main menu
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── scoreTracking.js # Score management
│   │   ├── sounds.js        # Audio handling
│   │   └── ...
│   └── ...
├── public/                   # Static assets
│   ├── music/               # Background music
│   ├── sfx/                 # Sound effects
│   └── ...
├── firebase.json            # Firebase configuration
├── docs/                    # Consolidated documentation (security, gameplay, music)
└── package.json             # Dependencies

Optional helpers live in `scripts/` and are not required for normal builds. See `scripts/README.md` for details.
```

---

## 🎯 Key Features in Detail

### Shooting Accuracy Tracking

The game tracks your shooting accuracy in real-time:
- **Shots Fired**: Every bullet, missile, and plasma beam is counted
- **Shots Hit**: Successful hits on enemies, bosses, and asteroids
- **Accuracy Display**: Shown as a percentage on the scoreboard with color coding
- **Real-time Updates**: Updates instantly as you play

### Score System

- Points are awarded for:
  - Destroying enemies (base points × multiplier)
  - Defeating bosses (bonus points)
  - Building combos (multiplier increases)
  - Destroying asteroids (bonus coins)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for Kaden and Adelynn
- Special thanks to all contributors and players!

---

<div align="center">

**Made with React, Vite, and lots of fun! 🎮**

Documentation lives in `docs/`:
- Bug fixes: `docs/BUG_FIXES.md`
- Security: `docs/SECURITY.md`, `docs/RESOLVE_SECURITY_ALERT.md`
- Gameplay tuning: `docs/DIFFICULTY_SCALING.md`, `docs/FORMATION_SYSTEM.md`
- Audio setup: `docs/MUSIC_SETUP.md`

[⭐ Star this repo](https://github.com/ronb12/Kaden-Adelynn-Adventures) if you enjoy the game!

</div>
