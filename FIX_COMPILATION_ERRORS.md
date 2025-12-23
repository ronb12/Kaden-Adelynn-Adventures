# Fix Compilation Errors

## Errors to Fix

1. **`LandingView` not found in ContentView.swift**
2. **`GameCenterService` not found in FirebaseService.swift**
3. **`FirebaseAuthService` not found in FirebaseService.swift**

## Solution

These errors occur because the files might not be added to the Xcode project target. Here's how to fix:

### Step 1: Add Files to Xcode Project

1. Open Xcode
2. Right-click on the `KadenAdelynnSpaceAdventures` folder in the Project Navigator
3. Select **"Add Files to KadenAdelynnSpaceAdventures..."**
4. Navigate to and select these files:
   - `Views/LandingView.swift`
   - `Services/GameCenterService.swift`
   - `Services/FirebaseAuthService.swift`
5. Make sure **"Copy items if needed"** is UNCHECKED (files are already in the project folder)
6. Make sure **"Add to targets: KadenAdelynnSpaceAdventures"** is CHECKED
7. Click **"Add"**

### Step 2: Verify Files Are in Target

1. Select each file in the Project Navigator
2. In the File Inspector (right panel), check **"Target Membership"**
3. Make sure **"KadenAdelynnSpaceAdventures"** is checked for:
   - `LandingView.swift`
   - `GameCenterService.swift`
   - `FirebaseAuthService.swift`

### Step 3: Clean and Rebuild

1. In Xcode: **Product → Clean Build Folder** (Shift+Cmd+K)
2. **Product → Build** (Cmd+B)

## Alternative: Quick Fix

If the files are already in the project but not being found:

1. In Xcode, select the project in the Project Navigator
2. Select the **"KadenAdelynnSpaceAdventures"** target
3. Go to **"Build Phases"** tab
4. Expand **"Compile Sources"**
5. Click **"+"** and add:
   - `LandingView.swift`
   - `GameCenterService.swift`
   - `FirebaseAuthService.swift`
6. Clean and rebuild

## File Locations

All files are in the correct locations:
- ✅ `Views/LandingView.swift` - Exists
- ✅ `Services/GameCenterService.swift` - Exists
- ✅ `Services/FirebaseAuthService.swift` - Exists

The code is correct - the issue is just that Xcode needs to know these files are part of the build target.

