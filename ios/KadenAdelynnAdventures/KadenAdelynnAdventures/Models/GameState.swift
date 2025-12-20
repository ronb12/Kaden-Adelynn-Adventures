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

    // Achievements and combo system
    var achievements: Set<String> = []
    var comboCount: Int = 0
    var maxCombo: Int = 0
    var powerUpsCollected: Int = 0
    var bossNoDamage: Bool = true
    var wavePerfect: Bool = true
    var enemiesSurvived: Int = 0

    struct Player {
        var position: SIMD2<Float>
        var color: SIMD4<Float>
        var size: Float
    }

    var player: Player
    // Add more game objects as needed

    static func sample() -> GameState {
        return GameState(player: Player(position: SIMD2<Float>(0, 0), color: SIMD4<Float>(0, 1, 0, 1), size: 40))
    }

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

    mutating func unlockAchievement(_ id: String) {
        if !achievements.contains(id) {
            achievements.insert(id)
            displayToast("🏆 Achievement: \(id)")
        }
    }
}
