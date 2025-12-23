# Xcode Project Setup Guide

This guide will help you create the Xcode project for the iOS Swift version of Kaden & Adelynn Space Adventures.

## Step 1: Create New Xcode Project

1. Open **Xcode**
2. Select **File** → **New** → **Project**
3. Choose **iOS** → **App**
4. Fill in the project details:
   - **Product Name**: `KadenAdelynnSpaceAdventures`
   - **Team**: (Select your development team)
   - **Organization Identifier**: `com.yourcompany` (or your domain)
   - **Bundle Identifier**: Will auto-generate
   - **Interface**: **SwiftUI**
   - **Language**: **Swift**
   - **Storage**: **None**
   - **Include Tests**: (Optional)
5. Click **Next** and choose a location to save the project
6. Click **Create**

## Step 2: Add Files to Project

1. In Xcode, right-click on the project folder in the navigator
2. Select **New Group** and create the following groups:
   - `Models`
   - `Views`
   - `GameEngine`

3. Add the Swift files:
   - Drag and drop or use **File** → **Add Files to "KadenAdelynnSpaceAdventures"...**
   - Add all files from the `KadenAdelynnSpaceAdventures` directory
   - Make sure **"Copy items if needed"** is checked
   - Select **"Create groups"** (not folder references)
   - Click **Add**

## Step 3: Replace Default Files

1. Replace `KadenAdelynnSpaceAdventuresApp.swift` with the provided version
2. Replace or update `ContentView.swift` with the provided version

## Step 4: Configure Project Settings

1. Select the project in the navigator
2. Select the **KadenAdelynnSpaceAdventures** target
3. Go to **General** tab:
   - Set **Minimum Deployments** to **iOS 15.0** or later
   - Set **Supported Device Families** to **iPhone** and/or **iPad**

4. Go to **Info** tab:
   - Update `Info.plist` with the provided content if needed
   - Set **Supported Interface Orientations** as desired

5. Go to **Build Settings**:
   - Ensure **Swift Language Version** is set to **Swift 5** or later

## Step 5: Add SpriteKit Framework

1. Select the project in the navigator
2. Select the **KadenAdelynnSpaceAdventures** target
3. Go to **General** tab → **Frameworks, Libraries, and Embedded Content**
4. Click **+** and add:
   - **SpriteKit.framework**

## Step 6: Build and Run

1. Select a simulator or connected device
2. Press **⌘R** or click the **Run** button
3. The app should build and launch!

## Troubleshooting

### Import Errors
- Make sure all files are added to the target (check Target Membership in File Inspector)
- Clean build folder: **Product** → **Clean Build Folder** (⇧⌘K)

### SpriteKit Errors
- Ensure SpriteKit framework is linked
- Check that `import SpriteKit` is present in files that use it

### SwiftUI Preview Errors
- Some views may not preview due to dependencies on `GameStateManager`
- This is normal - run the app instead

## Next Steps

1. Add sprite images to replace colored rectangles
2. Add sound effects and music files to the project bundle
3. Customize the app icon and launch screen
4. Test on physical devices
5. Configure App Store Connect for distribution (if publishing)

## Project Structure in Xcode

Your project should look like this:

```
KadenAdelynnSpaceAdventures
├── KadenAdelynnSpaceAdventuresApp.swift
├── ContentView.swift
├── Models/
│   ├── GameStateManager.swift
│   └── GameModels.swift
├── Views/
│   ├── MainMenuView.swift
│   ├── CharacterSelectView.swift
│   ├── ShipSelectView.swift
│   ├── StoryView.swift
│   ├── GameOverView.swift
│   ├── StoreView.swift
│   ├── ScoresView.swift
│   └── SettingsView.swift
└── GameEngine/
    ├── GameEngine.swift
    └── GameLogic.swift
```

## Notes

- The game uses UserDefaults for persistence (scores, upgrades, settings)
- All game logic runs at 60 FPS using SpriteKit's update loop
- Touch controls are optimized for iOS devices
- The game supports both portrait and landscape orientations (configurable)
