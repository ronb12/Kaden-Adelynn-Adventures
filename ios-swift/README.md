# Kaden & Adelynn Space Adventures - iOS Swift Version

This is the native iOS Swift version of the Kaden & Adelynn Space Adventures game, built with SwiftUI and SpriteKit.

## Features

- **100% Native iOS**: Built entirely in Swift using SwiftUI and SpriteKit
- **Full Game Mechanics**: All features from the PWA version ported to iOS
- **Touch Controls**: Optimized touch controls for iOS devices
- **Character Selection**: Choose from multiple characters (Kaden, Adelynn, and more)
- **Ship Selection**: Select from various ships with unique abilities
- **Weapon System**: Multiple weapon types (laser, spread, plasma, missiles, etc.)
- **Power-ups**: Collect power-ups during gameplay
- **Boss Battles**: Face challenging boss encounters
- **Store System**: Purchase upgrades with coins
- **High Scores**: Track your best scores locally
- **Settings**: Customize sound, music, and difficulty

## Requirements

- iOS 15.0 or later
- Xcode 14.0 or later
- Swift 5.7 or later

## Setup Instructions

### Option 1: Create New Xcode Project

1. Open Xcode
2. Create a new project:
   - Choose "iOS" → "App"
   - Product Name: `KadenAdelynnSpaceAdventures`
   - Interface: `SwiftUI`
   - Language: `Swift`
   - Storage: `None`

3. Replace the default files with the files from this directory:
   - Copy all `.swift` files to your Xcode project
   - Maintain the folder structure (Models, Views, GameEngine)

4. Build and run!

### Option 2: Use Existing Project Structure

The project is organized as follows:

```
KadenAdelynnSpaceAdventures/
├── KadenAdelynnSpaceAdventuresApp.swift    # App entry point
├── ContentView.swift                        # Main view router
├── Models/
│   ├── GameStateManager.swift              # Central state management
│   └── GameModels.swift                    # Game data models
├── Views/
│   ├── MainMenuView.swift                  # Main menu
│   ├── CharacterSelectView.swift          # Character selection
│   ├── ShipSelectView.swift               # Ship selection
│   ├── StoryView.swift                     # Story intro
│   ├── GameOverView.swift                 # Game over screen
│   ├── StoreView.swift                    # In-game store
│   ├── ScoresView.swift                    # High scores
│   └── SettingsView.swift                  # Settings
└── GameEngine/
    ├── GameEngine.swift                    # SpriteKit scene setup
    └── GameLogic.swift                     # Core game logic
```

## Project Structure

### Models
- **GameStateManager**: Centralized game state using `@Published` properties and `ObservableObject`
- **GameModels**: All game entities (Player, Enemy, Bullet, PowerUp, Boss) and enums

### Views
- All views use SwiftUI for modern, declarative UI
- Views are connected through the `GameStateManager` which manages screen navigation

### Game Engine
- **GameScene**: SpriteKit scene that handles rendering
- **GameLogic**: Core game mechanics, collision detection, spawning, and updates

## Game Mechanics

### Player
- Touch and drag to move
- Auto-shoots when touching the screen
- Multiple weapons with different fire rates and damage
- Health and shield system
- Power-up effects

### Enemies
- Multiple enemy types with different behaviors
- Movement patterns: straight, zigzag, wave, circle
- Some enemies can shoot back
- Drop power-ups when destroyed

### Weapons
- Laser: Basic rapid-fire weapon
- Spread: Shoots multiple bullets
- Plasma: High damage, slower fire rate
- Missile: Explosive damage
- Shotgun: Close-range spread
- Homing: Tracks enemies
- Electric: Chain damage
- Railgun: Very high damage, slow fire rate
- Beam: Continuous beam
- Freeze: Slows enemies

### Power-ups
- Health: Restore health
- Shield: Temporary protection
- Rapid Fire: Increased fire rate
- Multi Shot: Multiple bullets
- Slow Motion: Slow down time
- Missile Pack: Temporary missiles
- Speed Boost: Increased movement speed
- Coin Doubler: Double coin rewards
- Extra Life: Add a life
- And many more!

## Customization

### Characters
Each character has unique traits:
- Speed
- Default weapon
- Health bonus
- Damage multiplier

### Ships
Each ship has a default weapon type that can be changed with power-ups.

### Store Upgrades
- Shield Upgrade: Start with shield
- Speed Upgrade: +1 movement speed
- Rapid Fire: Start with rapid fire
- Extra Life: +1 starting life
- Coin Doubler: Double coin rewards

## Building for Release

1. Select your target device or simulator
2. Product → Archive (for App Store)
3. Or Product → Run for testing

## Future Enhancements

- Add sprite graphics instead of colored rectangles
- Add sound effects and background music
- Add particle effects for explosions
- Add animations for transitions
- Add Game Center integration for leaderboards
- Add achievements system
- Add cloud save functionality

## Notes

- The game currently uses colored rectangles for sprites. Replace with actual sprite images for better visuals.
- Sound effects and music need to be added to the project bundle.
- The game saves high scores locally using UserDefaults.
- All game state persists between sessions using UserDefaults.

## License

Same license as the main project.
