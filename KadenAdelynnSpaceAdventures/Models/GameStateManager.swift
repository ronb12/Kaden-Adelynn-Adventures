//
//  GameStateManager.swift
//  KadenAdelynnSpaceAdventures
//
//  Central game state management
//

import Foundation
import Combine

enum Screen {
    case signIn
    case mainMenu
    case characterSelect
    case shipSelect
    case story
    case playing
    case gameOver
    case store
    case scores
    case settings
    case privacyPolicy
    case termsOfService
    case statistics
    case saveLoad
    case weaponUpgrades
    case customization
    case credits
}

class GameStateManager: ObservableObject {
    // Services
    let signInService = AppleSignInService()
    let cloudKitService = CloudKitService.shared
    let firebaseService = FirebaseService.shared
    let statsManager = GameStatsManager.shared
    @Published var currentScreen: Screen = .signIn  // Default to landing page, will be updated based on auth state
    @Published var selectedCharacter: String = "kaden"
    @Published var selectedShip: String = "kaden"
    @Published var playerName: String = "Player"
    @Published var difficulty: String = "medium"  // "easy", "medium", "hard"
    
    // Daily Challenge
    var isDailyChallengeActive: Bool {
        // Daily challenge is always active - it's a daily feature
        // The challenge is to complete 5 games per day
        return true
    }
    
    var dailyChallengeMultiplier: Float {
        // Daily challenge makes enemies 20% faster
        // This multiplier is always active as part of the daily challenge
        return isDailyChallengeActive ? 1.2 : 1.0
    }
    
    // Difficulty multipliers
    var difficultyMultiplier: Float {
        switch difficulty.lowercased() {
        case "easy": return 0.7   // 30% easier
        case "hard": return 1.5   // 50% harder
        default: return 1.0       // Medium (normal)
        }
    }
    
    var waveProgressionSpeed: TimeInterval {
        switch difficulty.lowercased() {
        case "easy": return 40.0  // Waves every 40 seconds
        case "hard": return 20.0  // Waves every 20 seconds
        default: return 30.0      // Medium: waves every 30 seconds
        }
    }
    @Published var score: Int = 0
    @Published var wave: Int = 1
    @Published var level: Int = 1
    @Published var lives: Int = 25
    @Published var health: Int = 100
    @Published var coins: Int = 0
    @Published var stars: Int = 0  // Alias for coins - used in UI
    @Published var isPaused: Bool = false
    
    // Game statistics
    @Published var enemiesKilled: Int = 0
    @Published var shotsFired: Int = 0
    @Published var shotsHit: Int = 0
    @Published var combo: Int = 0
    @Published var killStreak: Int = 0
    @Published var scoreMultiplier: Float = 1.0  // Score multiplier based on combo
    @Published var timeSurvived: TimeInterval = 0  // Time played in current session
    @Published var currentFPS: Int = 60
    @Published var activePowerUps: [String: TimeInterval] = [:]
    
    // Store upgrades
    var upgradeShield: Bool {
        get { UserDefaults.standard.bool(forKey: "upgrade_shield") }
        set { UserDefaults.standard.set(newValue, forKey: "upgrade_shield") }
    }
    
    var upgradeSpeed: Bool {
        get { UserDefaults.standard.bool(forKey: "upgrade_speed") }
        set { UserDefaults.standard.set(newValue, forKey: "upgrade_speed") }
    }
    
    var upgradeRapid: Bool {
        get { UserDefaults.standard.bool(forKey: "upgrade_rapid") }
        set { UserDefaults.standard.set(newValue, forKey: "upgrade_rapid") }
    }
    
    var upgradeLife: Bool {
        get { UserDefaults.standard.bool(forKey: "upgrade_life") }
        set { UserDefaults.standard.set(newValue, forKey: "upgrade_life") }
    }
    
    var upgradeDoubler: Bool {
        get { UserDefaults.standard.bool(forKey: "upgrade_doubler") }
        set { UserDefaults.standard.set(newValue, forKey: "upgrade_doubler") }
    }
    
    // Store collectibles - check if purchased
    func isCollectiblePurchased(_ key: String) -> Bool {
        return UserDefaults.standard.bool(forKey: "collectible_\(key)")
    }
    
    // Get all purchased collectible keys
    func getPurchasedCollectibles() -> Set<String> {
        var purchased: Set<String> = []
        let collectibleKeys = [
            "energy_core", "overcharge_core", "speed_thruster_shield", "speed_thruster_rocket",
            "freeze_pulse", "homing_chip", "rapid_fire_module", "mega_bomb", "extra_life",
            "multiplier_orb", "xp_core", "armor_core", "alloy_coin", "skull_token",
            "star_magnet", "rapid_fire_module_2", "star_crystal", "freeze_pulse_10",
            "speed_thruster_boost", "star_magnet_power"
        ]
        for key in collectibleKeys {
            if isCollectiblePurchased(key) {
                purchased.insert(key)
            }
        }
        return purchased
    }
    
    init() {
        loadPlayerName()
        // Load coins and sync to stars
        coins = UserDefaults.standard.integer(forKey: "walletCoins")
        stars = UserDefaults.standard.integer(forKey: "walletStars")
        // If stars not set, use coins value
        if stars == 0 && coins > 0 {
            stars = coins
        }
        // If coins not set, use stars value
        if coins == 0 && stars > 0 {
            coins = stars
        }
        setupCloudKitSync()
    }
    
    func loadPlayerName() {
        // Use Apple Sign In name if available, otherwise use saved name
        if let appleName = signInService.userName {
            playerName = appleName
        } else {
            // Defensive: handle if value is not a String
            let value = UserDefaults.standard.object(forKey: "playerName")
            if let str = value as? String {
                playerName = str
            } else {
                playerName = "Player"
            }
        }
    }
    
    func savePlayerName() {
        UserDefaults.standard.set(playerName, forKey: "playerName")
    }
    
    func setupCloudKitSync() {
        // Sync data when signed in
        if signInService.isSignedIn {
            Task {
                await syncWithCloudKit()
            }
        }
    }
    
    func syncWithCloudKit() async {
        guard signInService.isSignedIn else { return }
        
        // Sync game stats
        let localStats = statsManager.getStats()
        let cloudStats = try? await cloudKitService.fetchGameStats()
        
        if let cloudStats = cloudStats {
            // Merge: use highest values
            var mergedStats = GameStatsData()
            mergedStats.totalGamesPlayed = max(localStats.totalGamesPlayed, cloudStats.totalGamesPlayed)
            mergedStats.highestScore = max(localStats.highestScore, cloudStats.highestScore)
            mergedStats.highestWave = max(localStats.highestWave, cloudStats.highestWave)
            // ... merge other stats
            
            statsManager.updateFromCloud(mergedStats)
            try? await cloudKitService.saveGameStats(mergedStats)
        } else {
            // Upload local stats
            try? await cloudKitService.saveGameStats(localStats)
        }
        
        // Sync achievements
        let localAchievements = statsManager.getAchievements()
        try? await cloudKitService.saveAchievements(localAchievements)
        
        // Sync player progress
        var progress = PlayerProgressData()
        progress.coins = coins
        progress.storeUpgrades = getStoreUpgrades()
        try? await cloudKitService.savePlayerProgress(progress)
    }
    
    func getStoreUpgrades() -> [String: Bool] {
        return [
            "upgrade_shield": upgradeShield,
            "upgrade_speed": upgradeSpeed,
            "upgrade_rapid": upgradeRapid,
            "upgrade_life": upgradeLife,
            "upgrade_doubler": upgradeDoubler
        ]
    }
    
    func saveHighScoreToCloud() {
        // No sign-in required for Firebase leaderboards
        // Scores can be saved anonymously
        
        Task {
            let highScore = HighScoreData(
                playerName: playerName,
                score: score,
                wave: wave,
                level: level,
                kills: enemiesKilled,
                combo: combo,
                accuracy: accuracy,
                date: Date(),
                id: UUID()
            )
            
            // Save to global leaderboard
            try? await cloudKitService.saveHighScore(highScore)
            
            // Also save personal best if user is authenticated
            if let userId = firebaseService.getCurrentUserId() {
                try? await firebaseService.syncPersonalBestScore(highScore, userId: userId)
            }
        }
    }
    
    func resetGame() {
        score = 0
        wave = 1
        level = 1
        lives = 25
        health = 100
        enemiesKilled = 0
        shotsFired = 0
        shotsHit = 0
        combo = 0
        killStreak = 0
        isPaused = false
        coins = 0  // Start with 0 coins each new game
        stars = 0  // Sync stars with coins
    }
    
    // MARK: - Save/Load Game
    
    func saveGame(toSlot slotId: Int = 1) -> Bool {
        // Only save if game is actually in progress (not on main menu)
        guard currentScreen == .playing else {
            #if DEBUG
            print("⚠️ Cannot save: Game is not in progress")
            #endif
            return false
        }
        
        let saveData = SaveLoadMenuView.SaveData(
            score: score,
            wave: wave,
            level: level,
            lives: lives,
            timestamp: Date()
        )
        
        if let encoded = try? JSONEncoder().encode(saveData) {
            UserDefaults.standard.set(encoded, forKey: "saveSlot_\(slotId)")
            UserDefaults.standard.synchronize() // Force immediate write
            #if DEBUG
            print("💾 Game saved to slot \(slotId)")
            print("   Score: \(score), Wave: \(wave), Lives: \(lives)")
            #endif
            return true
        }
        #if DEBUG
        print("❌ Failed to save game: Encoding failed")
        #endif
        return false
    }
    
    var isAutoSaveEnabled: Bool {
        get { UserDefaults.standard.bool(forKey: "autoSave") }
        set { UserDefaults.standard.set(newValue, forKey: "autoSave") }
    }
    
    var accuracy: Double {
        guard shotsFired > 0 else { return 0.0 }
        return Double(shotsHit) / Double(shotsFired) * 100.0
    }
}
