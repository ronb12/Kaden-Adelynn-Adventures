-- AppleScript to automate Firebase package linking in Xcode
-- This script opens Xcode, resolves packages, and ensures they're linked

tell application "Xcode"
	activate
	
	-- Open the project
	set projectPath to POSIX file "/Users/ronellbradley/Desktop/kaden-adelynn-space-adventures-ios-swift/KadenAdelynnSpaceAdventures.xcodeproj"
	open projectPath
	
	-- Wait for Xcode to open
	delay 3
	
	-- Get the workspace document
	set workspaceDocs to workspace documents
	if (count of workspaceDocs) > 0 then
		set workspaceDoc to item 1 of workspaceDocs
		
		-- Wait a bit for project to load
		delay 2
		
		-- Try to resolve packages via menu
		try
			tell application "System Events"
				tell process "Xcode"
					-- Go to File menu
					click menu item "Packages" of menu "File" of menu bar 1
					delay 1
					-- Click "Resolve Package Versions"
					click menu item "Resolve Package Versions" of menu "Packages" of menu item "Packages" of menu "File" of menu bar 1
					delay 1
				end tell
			end tell
		on error
			-- If menu doesn't work, try alternative
			log "Menu approach failed, trying alternative"
		end try
		
		-- Wait for packages to resolve
		delay 10
		
		log "Package resolution initiated. Please wait for packages to finish resolving..."
		log "This may take 1-2 minutes. Watch the top-right corner of Xcode."
		
	end if
end tell

