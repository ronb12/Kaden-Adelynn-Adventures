import Foundation

struct GameState {
    var score: Int = 0
    var lives: Int = 3
    var coins: Int = 0
    var wave: Int = 1
    var level: Int = 1
    var enemiesKilled: Int = 0
    var gameOver: Bool = false
    var isPaused: Bool = false
    
    mutating func update() {
        // Update game state
    }
}
