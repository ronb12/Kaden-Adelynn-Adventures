//
//  AppStoreScreenshotsUITests.swift
//  KadenAdelynnSpaceAdventuresUITests
//
//  Automated screenshot capture for App Store submission
//

import XCTest

final class AppStoreScreenshotsUITests: XCTestCase {
    var app: XCUIApplication!
    var screenshotDir: String {
        // Use home directory + known path
        let homeDir = NSHomeDirectory()
        return "\(homeDir)/Library/Mobile Documents/com~apple~CloudDocs/Desktop/kaden-adelynn-space-adventures/ios/AppStoreAssets/screenshots/6.5-inch"
    }
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        
        // Create screenshot directory if it doesn't exist
        let fileManager = FileManager.default
        let dir = screenshotDir
        if !fileManager.fileExists(atPath: dir) {
            try? fileManager.createDirectory(atPath: dir, withIntermediateDirectories: true, attributes: nil)
        }
        
        app.launch()
        sleep(2) // Wait for app to fully launch
    }
    
    func testCaptureAppStoreScreenshots() throws {
        // 1. Main Menu
        captureScreenshot(name: "01-main-menu")
        sleep(1)
        
        // Navigate to Character Select
        if let characterButton = findButton(containing: "Character") ?? findButton(containing: "Select Character") {
            characterButton.tap()
            sleep(2)
            captureScreenshot(name: "02-character-select")
        } else {
            // Try to find by accessibility identifier or other means
            let buttons = app.buttons
            if buttons.count > 0 {
                // Try tapping the second button (usually character select)
                buttons.element(boundBy: min(1, buttons.count - 1)).tap()
                sleep(2)
                captureScreenshot(name: "02-character-select")
            }
        }
        
        // Navigate to Ship Select (if available)
        if let shipButton = findButton(containing: "Ship") ?? findButton(containing: "Select Ship") {
            shipButton.tap()
            sleep(2)
            captureScreenshot(name: "03-ship-select")
        }
        
        // Navigate to Customization
        // Go back to main menu first
        if let backButton = app.buttons["xmark.circle.fill"].firstMatch,
           backButton.exists {
            backButton.tap()
            sleep(1)
        }
        
        // Try to find customization button
        if let customButton = findButton(containing: "Customization") ?? findButton(containing: "Customize") {
            customButton.tap()
            sleep(2)
            captureScreenshot(name: "05-customization")
        }
        
        // Navigate to Store
        // Go back to main menu
        if let backButton = app.buttons["xmark.circle.fill"].firstMatch,
           backButton.exists {
            backButton.tap()
            sleep(1)
        }
        
        if let storeButton = findButton(containing: "Store") ?? findButton(containing: "Shop") {
            storeButton.tap()
            sleep(2)
            captureScreenshot(name: "06-store")
        }
        
        // Navigate to Gameplay
        // Go back to main menu
        if let backButton = app.buttons["xmark.circle.fill"].firstMatch,
           backButton.exists {
            backButton.tap()
            sleep(1)
        }
        
        // Try to start a game
        if let playButton = findButton(containing: "Play") ?? findButton(containing: "Start") ?? findButton(containing: "Story") {
            playButton.tap()
            sleep(2)
            
            // If we're on story screen, continue to game
            if let continueButton = findButton(containing: "Continue") ?? findButton(containing: "Start Game") {
                continueButton.tap()
                sleep(3)
            }
            
            // Wait for gameplay to start and enemies to appear
            sleep(5)
            
            // Simulate some gameplay
            let center = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.7))
            center.tap()
            sleep(1)
            
            // Move ship around
            let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.4, dy: 0.7))
            let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.6, dy: 0.7))
            start.press(forDuration: 0.5, thenDragTo: end)
            sleep(2)
            
            // Take gameplay screenshot
            captureScreenshot(name: "04-gameplay")
        }
    }
    
    // Helper function to find buttons by text
    private func findButton(containing text: String) -> XCUIElement? {
        let buttons = app.buttons
        for i in 0..<buttons.count {
            let button = buttons.element(boundBy: i)
            if button.label.localizedCaseInsensitiveContains(text) {
                return button
            }
        }
        return nil
    }
    
    // Helper function to capture and save screenshot
    private func captureScreenshot(name: String) {
        let screenshot = XCUIScreen.main.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
        
        // Also save to file system
        let dir = screenshotDir
        let filePath = "\(dir)/\(name).png"
        if let imageData = screenshot.pngRepresentation {
            try? imageData.write(to: URL(fileURLWithPath: filePath))
            print("📸 Saved screenshot: \(filePath)")
        }
    }
}

