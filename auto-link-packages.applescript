-- Enhanced AppleScript to automatically link Firebase packages
-- This script attempts to interact with Xcode's Package Dependencies UI

tell application "Xcode"
	activate
	
	if (count of workspace documents) = 0 then
		display dialog "Please open KadenAdelynnSpaceAdventures.xcodeproj in Xcode first" buttons {"OK"} default button "OK"
		return
	end if
	
	delay 2
	log "Starting package linking automation..."
end tell

tell application "System Events"
	tell process "Xcode"
		-- Wait for Xcode to be ready
		repeat until exists window 1
			delay 1
		end repeat
		
		delay 2
		
		-- Try to navigate to Package Dependencies
		try
			-- Click on project in navigator (first item)
			set projectItem to row 1 of outline 1 of scroll area 1 of splitter group 1 of window 1
			click projectItem
			delay 1
			
			-- Try to find and click Package Dependencies tab
			-- This is tricky as UI structure varies
			log "Attempting to access Package Dependencies..."
			
			-- Alternative: Use keyboard shortcuts or menu
			-- Press Cmd+1 to show project settings if needed
			key code 18 using command down -- Cmd+1
			delay 1
			
		on error errMsg
			log "Could not navigate to Package Dependencies automatically: " & errMsg
			log "Please manually:"
			log "1. Click project in navigator"
			log "2. Select PROJECT (blue icon)"
			log "3. Go to 'Package Dependencies' tab"
			log "4. Click 'firebase-ios-sdk'"
			log "5. Verify products are checked for target"
		end try
		
		-- Try File > Packages menu approach
		try
			click menu bar item "File" of menu bar 1
			delay 0.5
			click menu item "Packages" of menu "File" of menu bar 1
			delay 0.5
			click menu item "Resolve Package Versions" of menu "Packages" of menu item "Packages" of menu "File" of menu bar 1
			delay 1
			log "Package resolution triggered"
		on error
			log "Menu approach failed"
		end try
	end tell
end tell

log ""
log "⚠️  IMPORTANT: UI automation for Package Dependencies is limited."
log ""
log "You MUST manually verify in Xcode:"
log "1. Project > Package Dependencies tab"
log "2. Click 'firebase-ios-sdk'"
log "3. In the right panel, verify these products are CHECKED:"
log "   ☑️ FirebaseCore"
log "   ☑️ FirebaseAuth"
log "   ☑️ FirebaseFirestore"
log "   ☑️ FirebaseFunctions"
log "4. If unchecked, check them for 'KadenAdelynnSpaceAdventures' target"
log "5. Wait for Xcode to update"
log "6. Build again"

