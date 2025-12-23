import Foundation

struct Statistics {
    var highScore: Int = 0
    var totalGames: Int = 0
    var totalKills: Int = 0
    var totalCoins: Int = 0
    var maxCombo: Int = 0
    var achievementsUnlocked: Int = 0
    var powerUpsCollected: Int = 0
    var bossesDefeated: Int = 0
    var playTime: TimeInterval = 0
    var lastPlayed: Date = Date()
    
    // Add more stats as needed
    
    mutating func updateFromGame(gameState: GameState) {
        if gameState.score > highScore { highScore = gameState.score }
        if gameState.maxCombo > maxCombo { maxCombo = gameState.maxCombo }
        totalKills += gameState.enemiesKilled
        totalCoins += gameState.coins
        powerUpsCollected += gameState.powerUpsCollected
        achievementsUnlocked = gameState.achievements.count
        // ...other stats
        lastPlayed = Date()
    }
}
