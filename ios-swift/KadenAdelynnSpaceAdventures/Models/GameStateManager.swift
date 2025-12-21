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
}

class GameStateManager: ObservableObject {
    // Services
    let signInService = AppleSignInService()
    let cloudKitService = CloudKitService.shared
    let statsManager = GameStatsManager.shared
    @Published var currentScreen: Screen = .mainMenu
    @Published var selectedCharacter: String = "kaden"
    @Published var selectedShip: String = "kaden"
    @Published var playerName: String = "Player"
    @Published var difficulty: String = "medium"
    @Published var score: Int = 0
    @Published var wave: Int = 1
    @Published var level: Int = 1
    @Published var lives: Int = 25
    @Published var health: Int = 100
    @Published var coins: Int = 0
    @Published var isPaused: Bool = false
    
    // Game statistics
    @Published var enemiesKilled: Int = 0
    @Published var shotsFired: Int = 0
    @Published var shotsHit: Int = 0
    @Published var combo: Int = 0
    @Published var killStreak: Int = 0
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
    
    init() {
        loadPlayerName()
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
        guard signInService.isSignedIn else { return }
        
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
            
            try? await cloudKitService.saveHighScore(highScore)
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
        coins = UserDefaults.standard.integer(forKey: "walletCoins")
    }
    
    var accuracy: Double {
        guard shotsFired > 0 else { return 0.0 }
        return Double(shotsHit) / Double(shotsFired) * 100.0
    }
}
