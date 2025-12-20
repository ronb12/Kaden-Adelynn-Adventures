# Quick Start Guide - iOS Swift Version

## What's Included

This folder contains a **100% native iOS Swift version** of the Kaden & Adelynn Space Adventures game, built with:
- **SwiftUI** for modern, declarative UI
- **SpriteKit** for high-performance game rendering
- **Swift 5.7+** for all game logic

## Quick Setup (5 minutes)

### 1. Create Xcode Project
- Open Xcode
- File → New → Project
- iOS → App
- Name: `KadenAdelynnSpaceAdventures`
- Interface: **SwiftUI**
- Language: **Swift**

### 2. Add Files
- Copy all `.swift` files from this folder into your Xcode project
- Maintain the folder structure (Models, Views, GameEngine)

### 3. Add SpriteKit Framework
- Select project → Target → General
- Frameworks → Add **SpriteKit.framework**

### 4. Build & Run
- Select a simulator or device
- Press ⌘R to run!

## Project Structure

```
KadenAdelynnSpaceAdventures/
├── App Entry
│   ├── KadenAdelynnSpaceAdventuresApp.swift
│   └── ContentView.swift
│
├── Models (Game Data)
│   ├── GameStateManager.swift    # Central state
│   └── GameModels.swift          # Entities & Enums
│
├── Views (UI Screens)
│   ├── MainMenuView.swift
│   ├── CharacterSelectView.swift
│   ├── ShipSelectView.swift
│   ├── StoryView.swift
│   ├── GameOverView.swift
│   ├── StoreView.swift
│   ├── ScoresView.swift
│   └── SettingsView.swift
│
└── GameEngine (Core Logic)
    ├── GameEngine.swift          # SpriteKit scene
    └── GameLogic.swift            # Game mechanics
```

## Features Implemented

✅ **Complete Game Loop**
- Player movement (touch & drag)
- Enemy spawning & AI
- Bullet system
- Collision detection
- Power-up system
- Boss battles (framework ready)

✅ **UI Screens**
- Main menu
- Character selection (10 characters)
- Ship selection (12 ships)
- Story intro
- Game over with stats
- Store with upgrades
- High scores
- Settings

✅ **Game Mechanics**
- Multiple weapon types
- Power-ups (25+ types)
- Enemy varieties (8 types)
- Wave progression
- Score tracking
- Accuracy tracking
- Combo system

✅ **Persistence**
- High scores (UserDefaults)
- Store upgrades
- Player preferences
- Settings

## Game Controls

- **Move**: Touch and drag on screen
- **Shoot**: Automatically shoots while touching
- **Pause**: Tap pause button in top-right

## Next Steps

1. **Add Graphics**: Replace colored rectangles with sprite images
2. **Add Audio**: Add sound effects and background music
3. **Polish**: Add particle effects, animations, transitions
4. **Test**: Test on physical iOS devices
5. **Publish**: Configure for App Store if desired

## Differences from PWA Version

- **Native Performance**: 60 FPS guaranteed with SpriteKit
- **Touch Optimized**: Controls designed specifically for iOS
- **Offline First**: No internet required
- **Native Feel**: Uses iOS design patterns and conventions

## Requirements

- iOS 15.0+
- Xcode 14.0+
- Swift 5.7+

## Support

For detailed setup instructions, see `PROJECT_SETUP.md`
For full documentation, see `README.md`
