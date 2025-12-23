-- Script to check and display package state in Xcode
-- This helps diagnose why packages aren't linking

tell application "Xcode"
	activate
	
	if (count of workspace documents) = 0 then
		display dialog "Please open the project in Xcode first" buttons {"OK"} default button "OK"
		return
	end if
	
	set workspaceDoc to item 1 of workspace documents
	
	-- Give Xcode time to load
	delay 2
	
	log "Checking package state..."
	log "Please check the following in Xcode:"
	log ""
	log "1. Project Navigator > Click project (blue icon)"
	log "2. Select PROJECT (not target)"
	log "3. Go to 'Package Dependencies' tab"
	log "4. Look for 'firebase-ios-sdk'"
	log "5. Click on it to see products"
	log ""
	log "If you see the products, they should be checked for your target."
	log "If they're not checked, check them now."
	
	-- Try to get package info via System Events
	tell application "System Events"
		tell process "Xcode"
			-- Try to find and click on Package Dependencies
			try
				-- This is complex UI automation - just provide instructions
				log "Use the instructions above to verify package state"
			end try
		end tell
	end tell
end tell

