# Kaden & Adelynn Adventures - iOS Edition

A native iOS Swift implementation of the Kaden & Adelynn Adventures space shooter game using SwiftUI and Metal for high-performance graphics rendering.

## Features

- **Native Swift Development**: Built 100% in Swift using SwiftUI and Metal
- **High-Performance Rendering**: Uses Metal API for optimized graphics
- **Touch Controls**: Full touch input support for iOS devices
- **Game Engine**: Complete game engine with player, enemies, bullets, asteroids, and collectibles
- **Responsive Design**: Adapts to different screen sizes and orientations

## Project Structure

```
ios/
├── KadenAdelynnAdventures/
│   ├── KadenAdelynnAdventures/
│   │   ├── KadenAdelynnAdventuresApp.swift    # App entry point
│   │   ├── Views/
│   │   │   └── GameView.swift                 # SwiftUI view wrapper
│   │   ├── Models/
│   │   │   └── GameEngine.swift               # Game logic & entities
│   │   └── Utilities/
│   │       └── GameRenderer.swift             # Metal rendering
│   └── KadenAdelynnAdventuresTests/
│       └── KadenAdelynnAdventuresTests.swift  # Unit tests
└── README.md
```

## Requirements

- iOS 17.0+
- Xcode 15.2+
- Swift 5.0+
- Metal-capable device (all modern iPhones and iPads)

## Building

1. Open `KadenAdelynnAdventures.xcodeproj` in Xcode
2. Select your target device or simulator
3. Press `Cmd + B` to build or `Cmd + R` to run

## Game Controls

- **Left Half of Screen**: Move player left and fire
- **Right Half of Screen**: Move player right and fire
- **Full Screen Tap**: Fire weapon

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
