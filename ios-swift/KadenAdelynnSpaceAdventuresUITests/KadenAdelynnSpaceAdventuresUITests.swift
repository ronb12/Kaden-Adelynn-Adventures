import XCTest

final class KadenAdelynnSpaceAdventuresUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    func testGameplaySimulation() throws {
        // Wait for app to fully launch
        sleep(2)
        
        // Find the game screen (SpriteKit view)
        let gameScreen = app.windows.firstMatch
        
        // Get center coordinates of the screen
        let screenCenter = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
        
        // Simulate gameplay: Tap to start shooting
        screenCenter.tap()
        sleep(1)
        
        // Simulate dragging the ship around (continuous touch + movement)
        // This simulates the player moving and shooting
        let startPoint = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.7))
        let endPoint1 = app.coordinate(withNormalizedOffset: CGVector(dx: 0.6, dy: 0.6))
        let endPoint2 = app.coordinate(withNormalizedOffset: CGVector(dx: 0.4, dy: 0.6))
        let endPoint3 = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.8))
        
        // Simulate multiple drag gestures (ship movement + continuous shooting)
        startPoint.press(forDuration: 0.1, thenDragTo: endPoint1)
        sleep(1)
        
        let currentPoint = app.coordinate(withNormalizedOffset: CGVector(dx: 0.6, dy: 0.6))
        currentPoint.press(forDuration: 0.1, thenDragTo: endPoint2)
        sleep(1)
        
        let currentPoint2 = app.coordinate(withNormalizedOffset: CGVector(dx: 0.4, dy: 0.6))
        currentPoint2.press(forDuration: 0.1, thenDragTo: endPoint3)
        sleep(1)
        
        // Continuous touch and drag (simulates holding and moving)
        let dragStart = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.7))
        let dragEnd = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.6))
        dragStart.press(forDuration: 1.0, thenDragTo: dragEnd)
        
        // Wait for enemies and collectibles to spawn
        // Enemies spawn every 1-2 seconds, collectibles every 3 seconds
        sleep(5)
        
        // Take a screenshot to verify game state
        let screenshot = XCUIScreen.main.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = "Gameplay After 5 Seconds"
        attachment.lifetime = .keepAlways
        add(attachment)
        
        // Additional gameplay: More taps to simulate continuous shooting
        let positions: [(dx: Double, dy: Double)] = [
            (0.4, 0.7), (0.5, 0.6), (0.6, 0.7), (0.5, 0.8), (0.45, 0.65), (0.55, 0.65)
        ]
        
        for position in positions {
            let coord = app.coordinate(withNormalizedOffset: CGVector(dx: position.dx, dy: position.dy))
            coord.tap()
            usleep(100000) // 0.1 seconds between taps (simulating 50ms shooting interval)
        }
        
        // Final wait to see enemies and collectibles
        sleep(3)
        
        // Final screenshot
        let finalScreenshot = XCUIScreen.main.screenshot()
        let finalAttachment = XCTAttachment(screenshot: finalScreenshot)
        finalAttachment.name = "Gameplay Final State"
        finalAttachment.lifetime = .keepAlways
        add(finalAttachment)
    }
}
