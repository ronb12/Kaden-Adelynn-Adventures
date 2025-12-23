//
//  SimpleScreenshotsUITests.swift
//  KadenAdelynnSpaceAdventuresUITests
//
//  Simple coordinate-based screenshot capture
//

import XCTest

final class SimpleScreenshotsUITests: XCTestCase {
    var app: XCUIApplication!
    var screenshotDir: String {
        let homeDir = NSHomeDirectory()
        return "\(homeDir)/Library/Mobile Documents/com~apple~CloudDocs/Desktop/kaden-adelynn-space-adventures/ios/AppStoreAssets/screenshots/6.5-inch"
    }
    
    override func setUpWithError() throws {
        continueAfterFailure = true // Continue even if some steps fail
        app = XCUIApplication()
        
        let fileManager = FileManager.default
        let dir = screenshotDir
        if !fileManager.fileExists(atPath: dir) {
            try? fileManager.createDirectory(atPath: dir, withIntermediateDirectories: true, attributes: nil)
        }
        
        app.launch()
        sleep(3) // Wait for app to fully launch
    }
    
    func testCaptureScreenshots() throws {
        // 1. Main Menu (already on it)
        captureScreenshot(name: "01-main-menu")
        sleep(1)
        
        // 2. Navigate to Character Select - tap "Choose Character" button
        // Button is in secondary grid, try tapping around middle area
        let charButton = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.65))
        charButton.tap()
        sleep(2)
        captureScreenshot(name: "02-character-select")
        
        // Go back
        if let backBtn = app.buttons.matching(identifier: "xmark.circle.fill").firstMatch, backBtn.exists {
            backBtn.tap()
        } else {
            // Try coordinate-based back
            app.coordinate(withNormalizedOffset: CGVector(dx: 0.05, dy: 0.1)).tap()
        }
        sleep(2)
        
        // 3. Navigate to Ship Select - tap "Choose Ship"
        let shipButton = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.55))
        shipButton.tap()
        sleep(2)
        captureScreenshot(name: "03-ship-select")
        
        // Go back
        if let backBtn = app.buttons.matching(identifier: "xmark.circle.fill").firstMatch, backBtn.exists {
            backBtn.tap()
        } else {
            app.coordinate(withNormalizedOffset: CGVector(dx: 0.05, dy: 0.1)).tap()
        }
        sleep(2)
        
        // 4. Navigate to Customization - tap "Customize" button (in secondary grid, bottom right area)
        let customButton = app.coordinate(withNormalizedOffset: CGVector(dx: 0.75, dy: 0.75))
        customButton.tap()
        sleep(2)
        captureScreenshot(name: "05-customization")
        
        // Go back
        if let backBtn = app.buttons.matching(identifier: "xmark.circle.fill").firstMatch, backBtn.exists {
            backBtn.tap()
        } else {
            app.coordinate(withNormalizedOffset: CGVector(dx: 0.05, dy: 0.1)).tap()
        }
        sleep(2)
        
        // 5. Navigate to Store - tap "Open Store"
        let storeButton = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
        storeButton.tap()
        sleep(2)
        captureScreenshot(name: "06-store")
        
        // Go back
        if let backBtn = app.buttons.matching(identifier: "xmark.circle.fill").firstMatch, backBtn.exists {
            backBtn.tap()
        } else {
            app.coordinate(withNormalizedOffset: CGVector(dx: 0.05, dy: 0.1)).tap()
        }
        sleep(2)
        
        // 6. Start gameplay - tap "Start Game" or "Story Mode"
        let playButton = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.45))
        playButton.tap()
        sleep(3)
        
        // If on story screen, continue
        let continueBtn = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.8))
        continueBtn.tap()
        sleep(4)
        
        // Wait for gameplay and simulate some action
        let center = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.7))
        center.tap()
        sleep(1)
        
        // Move ship
        let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.4, dy: 0.7))
        let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.6, dy: 0.7))
        start.press(forDuration: 0.5, thenDragTo: end)
        sleep(3)
        
        captureScreenshot(name: "04-gameplay")
    }
    
    private func captureScreenshot(name: String) {
        let screenshot = XCUIScreen.main.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
        
        let dir = screenshotDir
        let filePath = "\(dir)/\(name).png"
        if let imageData = screenshot.pngRepresentation {
            try? imageData.write(to: URL(fileURLWithPath: filePath))
            print("📸 Saved: \(filePath)")
        }
    }
}

