//
//  GameStatsManager.swift
//  KadenAdelynnSpaceAdventures
//
//  Game statistics manager with CloudKit sync
//

import Foundation
import Combine

class GameStatsManager: ObservableObject {
    static let shared = GameStatsManager()
    
    @Published var stats: GameStatsData
    @Published var achievements: [AchievementData]
    
    private let statsKey = "gameStats"
    private let achievementsKey = "achievements"
    
    private init() {
        self.stats = GameStatsData()
        self.achievements = []
        loadStats()
        loadAchievements()
        
        // Add sample data if stats are empty
        if stats.totalGamesPlayed == 0 {
            addSampleStats()
        }
    }
    
    // MARK: - Local Storage
    
    func loadStats() {
        if let data = UserDefaults.standard.data(forKey: statsKey),
           let decoded = try? JSONDecoder().decode(GameStatsData.self, from: data) {
            stats = decoded
        }
    }
    
    func saveStats() {
        if let encoded = try? JSONEncoder().encode(stats) {
            UserDefaults.standard.set(encoded, forKey: statsKey)
        }
    }
    
    func loadAchievements() {
        if let data = UserDefaults.standard.data(forKey: achievementsKey),
           let decoded = try? JSONDecoder().decode([AchievementData].self, from: data) {
            achievements = decoded
        } else {
            // Initialize default achievements
            achievements = createDefaultAchievements()
        }
    }
    
    func saveAchievements() {
        if let encoded = try? JSONEncoder().encode(achievements) {
            UserDefaults.standard.set(encoded, forKey: achievementsKey)
        }
    }
    
    // MARK: - Stats Updates
    
    func updateStats(gameData: GameSessionData) {
        stats.totalGamesPlayed += 1
        stats.totalPlayTime += gameData.playTime
        stats.totalScore += gameData.score
        stats.totalKills += gameData.kills
        stats.totalWavesCompleted += gameData.wave
        stats.totalBossesDefeated += gameData.bossesDefeated ?? 0
        stats.totalShotsFired += gameData.shotsFired
        stats.totalShotsHit += gameData.shotsHit
        stats.totalPowerUpsCollected += gameData.powerUpsCollected
        
        // Update highests
        if gameData.score > stats.highestScore {
            stats.highestScore = gameData.score
        }
        if gameData.wave > stats.highestWave {
            stats.highestWave = gameData.wave
        }
        if gameData.combo > stats.highestCombo {
            stats.highestCombo = gameData.combo
        }
        
        // Update accuracy
        if stats.totalShotsFired > 0 {
            stats.bestAccuracy = Double(stats.totalShotsHit) / Double(stats.totalShotsFired) * 100.0
        }
        
        saveStats()
        
        // Sync to CloudKit if signed in
        Task {
            try? await CloudKitService.shared.saveGameStats(stats)
        }
    }
    
    // MARK: - Achievements
    
    func checkAchievement(id: String) -> AchievementData? {
        guard let achievement = achievements.first(where: { $0.id == id }),
              !achievement.unlocked else {
            return nil
        }
        
        var updatedAchievement = achievement
        updatedAchievement.unlocked = true
        updatedAchievement.unlockedDate = Date()
        
        if let index = achievements.firstIndex(where: { $0.id == id }) {
            achievements[index] = updatedAchievement
            stats.achievementsUnlocked += 1
            saveAchievements()
            saveStats()
            
            // Sync to CloudKit
            Task {
                try? await CloudKitService.shared.saveAchievements(achievements)
            }
            
            return updatedAchievement
        }
        
        return nil
    }
    
    func getAchievements() -> [AchievementData] {
        return achievements
    }
    
    func createDefaultAchievements() -> [AchievementData] {
        return [
            AchievementData(id: "first-kill", name: "First Victory", description: "Destroy your first enemy", unlocked: false, unlockedDate: nil, reward: 100),
            AchievementData(id: "combo-10", name: "Combo Master", description: "Achieve a 10-hit combo", unlocked: false, unlockedDate: nil, reward: 200),
            AchievementData(id: "no-damage-boss", name: "Untouchable", description: "Defeat a boss without taking damage", unlocked: false, unlockedDate: nil, reward: 500),
            AchievementData(id: "perfect-wave", name: "Perfect Wave", description: "Complete a wave without missing", unlocked: false, unlockedDate: nil, reward: 300),
            AchievementData(id: "speed-runner", name: "Speed Runner", description: "Complete level 5 in under 5 minutes", unlocked: false, unlockedDate: nil, reward: 400),
            AchievementData(id: "collector", name: "Collector", description: "Collect 50 power-ups", unlocked: false, unlockedDate: nil, reward: 250),
            AchievementData(id: "survivor", name: "Survivor", description: "Survive 1000 enemies", unlocked: false, unlockedDate: nil, reward: 500),
            AchievementData(id: "millionaire", name: "Millionaire", description: "Score 1 million points", unlocked: false, unlockedDate: nil, reward: 1000),
            AchievementData(id: "destroyer", name: "Destroyer", description: "Destroy 10,000 enemies", unlocked: false, unlockedDate: nil, reward: 2000)
        ]
    }
    
    func updateFromCloud(_ cloudStats: GameStatsData) {
        // Merge cloud stats with local (keep highest values)
        stats.highestScore = max(stats.highestScore, cloudStats.highestScore)
        stats.highestWave = max(stats.highestWave, cloudStats.highestWave)
        stats.highestCombo = max(stats.highestCombo, cloudStats.highestCombo)
        stats.totalGamesPlayed = max(stats.totalGamesPlayed, cloudStats.totalGamesPlayed)
        saveStats()
    }
    
    func getStats() -> GameStatsData {
        return stats
    }
    
    private func addSampleStats() {
        stats.totalGamesPlayed = 47
        stats.totalPlayTime = 12450 // ~3.5 hours in seconds
        stats.totalScore = 1250000
        stats.totalKills = 3420
        stats.totalWavesCompleted = 285
        stats.totalBossesDefeated = 23
        stats.totalShotsFired = 15680
        stats.totalShotsHit = 12890
        stats.totalPowerUpsCollected = 187
        stats.highestScore = 125000
        stats.highestWave = 18
        stats.highestCombo = 42
        stats.bestAccuracy = 82.3
        stats.achievementsUnlocked = 6
        saveStats()
    }
}

// MARK: - Supporting Types

struct GameSessionData {
    let score: Int
    let wave: Int
    let level: Int
    let kills: Int
    let combo: Int
    let shotsFired: Int
    let shotsHit: Int
    let playTime: Int
    let powerUpsCollected: Int
    let bossesDefeated: Int?
}

// AchievementData is already Codable in CloudKitService.swift, no extension needed
