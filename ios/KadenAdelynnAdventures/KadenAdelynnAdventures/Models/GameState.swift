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
    var showToast: String = ""
    var toastDuration: TimeInterval = 0
    
    mutating func update() {
        // Update game state
        
        // Handle toast timeout
        if !showToast.isEmpty && toastDuration > 0 {
            toastDuration -= 0.016 // ~60fps
            if toastDuration <= 0 {
                showToast = ""
            }
        }
    }
    
    mutating func displayToast(_ message: String, duration: TimeInterval = 3.0) {
        showToast = message
        toastDuration = duration
    }
}
