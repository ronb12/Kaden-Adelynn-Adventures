# Character Portraits Setup Guide

## ✅ Assets Verified

All 10 character portraits have been successfully integrated into the iOS project:

- ✓ kaden_character.imageset
- ✓ adelynn_character.imageset  
- ✓ hero3_character.imageset (Orion)
- ✓ hero4_character.imageset (Lyra)
- ✓ hero5_character.imageset (Jax)
- ✓ hero6_character.imageset (Vega)
- ✓ hero7_character.imageset (Kael)
- ✓ hero8_character.imageset (Nova)
- ✓ hero9_character.imageset (Rio)
- ✓ hero10_character.imageset (Mira)

## 📍 Location

All assets are in:
```
ios-swift/KadenAdelynnSpaceAdventures/Assets.xcassets/
```

Each character has:
- `{character_id}_character.imageset/` directory
- `{character_id}_portrait.png` (1024x1024 PNG)
- `Contents.json` (properly configured)

## 🔧 Code Implementation

The `CharacterSelectView.swift` has been updated to use the portraits:

```swift
Image("\(character.id)_character")
    .resizable()
    .aspectRatio(contentMode: .fill)
    .frame(width: 80, height: 80)
    .clipShape(Circle())
```

## ⚠️ If Images Don't Show in Xcode

If the character portraits are not showing in Xcode or the simulator:

### 1. Refresh Xcode Project
- Close Xcode
- Delete `DerivedData` folder (if exists)
- Reopen the project in Xcode
- Clean Build Folder (Cmd+Shift+K)
- Build again (Cmd+B)

### 2. Verify Assets.xcassets is in Project
- Open Xcode
- In Project Navigator, check if `Assets.xcassets` is listed
- If not, right-click on project → "Add Files to Project"
- Select `Assets.xcassets` folder
- Make sure "Create groups" is selected (not "Create folder references")
- Ensure "Add to targets: KadenAdelynnSpaceAdventures" is checked

### 3. Verify Image Sets
- In Xcode, open `Assets.xcassets`
- You should see all 10 character image sets
- Click on each one to verify the PNG is there
- Check that the image set name matches: `{character_id}_character`

### 4. Test Image Loading
Add this to a Swift file temporarily to test:
```swift
let testImage = UIImage(named: "kaden_character")
print("Image loaded: \(testImage != nil)")
```

### 5. Check Build Settings
- In Xcode, select the project
- Go to Build Settings
- Search for "Asset Catalog"
- Verify `ASSETCATALOG_COMPILER_APPICON_NAME` is set to `AppIcon`
- Assets should be automatically included

## 🎨 Usage

### In SwiftUI:
```swift
Image("kaden_character")
Image("adelynn_character")
Image("hero3_character")
// etc.
```

### In UIKit:
```swift
UIImage(named: "kaden_character")
UIImage(named: "adelynn_character")
UIImage(named: "hero3_character")
// etc.
```

## 📝 Verification Script

Run this to verify all assets:
```bash
cd blender
./verify_assets.sh
```

## 🔄 Regenerating Portraits

If you need to regenerate the portraits:
```bash
cd blender
./run_generation.sh 0 1 eevee
./integrate_portraits.sh
```

Then refresh Xcode project as described above.


