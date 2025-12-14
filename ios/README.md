# Kaden & Adelynn Adventures - iOS Edition

A native iOS Swift implementation of the Kaden & Adelynn Adventures space shooter game using SwiftUI, Metal for high-performance graphics rendering, and CloudKit for cloud storage.

## Features

- **Native Swift Development**: Built 100% in Swift using SwiftUI and Metal
- **High-Performance Rendering**: Uses Metal API for optimized graphics
- **CloudKit Integration**: Cloud save/load, statistics, and upgrades using Apple's native iCloud
- **Touch Controls**: Full touch input support for iOS devices
- **Haptic Feedback**: Vibration feedback for save/load actions
- **Game Engine**: Complete game engine with player, enemies, bullets, asteroids, and collectibles
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Centered Player Ship**: Player starts centered horizontally at bottom of screen

## Project Structure

```
ios/
├── KadenAdelynnAdventures/
│   ├── KadenAdelynnAdventures/
│   │   ├── KadenAdelynnAdventuresApp.swift    # App entry point
│   │   ├── Views/
│   │   │   └── GameView.swift                 # SwiftUI view with FAB menu & toast
│   │   ├── Models/
│   │   │   ├── GameEngine.swift               # Game logic with save/load
│   │   │   ├── GameState.swift                # Game state with toast support
│   │   │   ├── Player.swift                   # Player entity
│   │   │   ├── Enemy.swift                    # Enemy entity
│   │   │   ├── Boss.swift                     # Boss entity
│   │   │   ├── Bullet.swift                   # Bullet entity
│   │   │   ├── Asteroid.swift                 # Asteroid entity
│   │   │   └── Collectible.swift              # Collectible entity
│   │   └── Utilities/
│   │       ├── GameRenderer.swift             # Metal rendering
│   │       └── CloudKitManager.swift          # iCloud/CloudKit integration
│   └── KadenAdelynnAdventuresTests/
│       └── KadenAdelynnAdventuresTests.swift  # Unit tests
└── README.md
```

## Requirements

- iOS 17.0+
- Xcode 15.2+
- Swift 5.0+
- Metal-capable device (all modern iPhones and iPads)
- iCloud account (for cloud save/load features)

## Setup

### Enable CloudKit

1. Open `KadenAdelynnAdventures.xcodeproj` in Xcode
2. Select the project in the navigator
3. Select the target "KadenAdelynnAdventures"
4. Go to "Signing & Capabilities" tab
5. Click "+ Capability" and add:
   - **iCloud**
   - Check "CloudKit"
   - Select or create a CloudKit container
6. Build and run on a device (CloudKit requires a real device, not simulator for full functionality)

## Building

1. Open `KadenAdelynnAdventures.xcodeproj` in Xcode
2. Select your target device or simulator
3. Press `Cmd + B` to build or `Cmd + R` to run

## Game Controls

- **Touch Screen**: Tap and hold to move player and fire
- **FAB Menu (☰)**: Access pause, save, and load options
  - **⏸ Pause**: Pause/resume game
  - **💾 Save**: Save game to iCloud
  - **📁 Load**: Load saved game from iCloud

## Cloud Features

### CloudKit Integration
The iOS version uses Apple's native **CloudKit** instead of Firebase:

- **Save/Load**: Game progress saved to iCloud private database
- **Statistics**: Track games played, total score, kills, highest wave
- **Weapon Upgrades**: Sync upgrade levels across devices
- **Fallback**: Automatically uses UserDefaults for local storage if iCloud is unavailable

### Data Models
- `GameSaveData`: Score, wave, level, lives, player position
- `GameStatistics`: Games played, scores, kills, play time
- `WeaponUpgrades`: Damage, fire rate, range, pierce, spread, homing levels

## Game Objects

### Player
- Spawns at bottom center
- Moves left/right based on touch input
- Can fire bullets

### Enemies
- Spawn randomly from top
- Move downward at varying speeds
- Defeat to gain points

### Asteroids
- Spawn randomly from top
- Move downward with rotation
- Breakable obstacles

### Collectibles
- Spawn from defeated enemies
- Award coins when collected
- Fall downward

### Bullets
- Fired by player
- Travel upward
- Destroy enemies on contact

## Game State

- **Score**: Points earned from destroying enemies
- **Lives**: Player health (lose on enemy collision)
- **Coins**: Currency from collectibles
- **Wave**: Current challenge level
- **Level**: Current difficulty

## Architecture

### GameEngine
Core game logic handling:
- Entity updates (player, enemies, bullets, asteroids, collectibles)
- Collision detection
- Spawning mechanics
- Game state management

### GameRenderer
Metal-based rendering:
- Viewport management
- Real-time rendering pipeline
- UI overlay rendering

### GameView
SwiftUI integration:
- UIViewControllerRepresentable wrapper
- Touch event handling
- Display link integration for smooth 60 FPS gameplay

## Testing

Run the test suite with `Cmd + U` in Xcode. Tests cover:
- Game engine initialization
- Player movement
- Bullet spawning
- Enemy spawning
- Collision detection

## Future Enhancements

- [ ] Sound effects and music
- [ ] Power-up system
- [ ] Boss encounters
- [ ] Particle effects
- [ ] Leaderboard integration
- [ ] Game saves and progression
- [ ] Difficulty scaling
- [ ] More ship skins
- [ ] Network multiplayer
- [ ] iCloud sync

## License

Proprietary - Kaden & Adelynn Adventures

## Support

For issues or questions, contact the development team.
