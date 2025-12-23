import XCTest

final class KadenAdelynnAdventuresTests: XCTestCase {
    
    override func setUp() {
        super.setUp()
    }
    
    override func tearDown() {
        super.tearDown()
    }
    
    func testGameEngineInitialization() {
        let gameEngine = GameEngine()
        let gameState = gameEngine.getGameState()
        
        XCTAssertEqual(gameState.score, 0)
        XCTAssertEqual(gameState.lives, 3)
        XCTAssertEqual(gameState.coins, 0)
    }
    
    func testPlayerMovement() {
        let gameEngine = GameEngine()
        let initialX = gameEngine.getPlayer().position.x
        
        gameEngine.setPlayerInput(moveLeft: true, moveRight: false, fire: false)
        gameEngine.update()
        
        let newX = gameEngine.getPlayer().position.x
        XCTAssertLessThan(newX, initialX)
    }
    
    func testBulletSpawning() {
        let gameEngine = GameEngine()
        
        gameEngine.setPlayerInput(moveLeft: false, moveRight: false, fire: true)
        gameEngine.update()
        
        let bullets = gameEngine.getBullets()
        XCTAssertGreaterThan(bullets.count, 0)
    }
    
    func testEnemySpawning() {
        let gameEngine = GameEngine()
        
        for _ in 0..<100 {
            gameEngine.update()
        }
        
        let enemies = gameEngine.getEnemies()
        XCTAssertGreaterThan(enemies.count, 0)
    }
}
