//
//  CloudKitService.swift
//  KadenAdelynnSpaceAdventures
//
//  CloudKit service for syncing game data
//

import Foundation
// CloudKit disabled - using local storage only
import Combine

class CloudKitService: ObservableObject {
    static let shared = CloudKitService()

    // CloudKit disabled - all properties set to nil
    private let container: Any? = nil
    private let privateDatabase: Any? = nil
    private let publicDatabase: Any? = nil
    
    // Record types
    private let highScoreRecordType = "HighScore"
    private let gameStatsRecordType = "GameStats"
    private let achievementRecordType = "Achievement"
    private let playerProgressRecordType = "PlayerProgress"
    private let storeUpgradeRecordType = "StoreUpgrade"
    
    @Published var isCloudAvailable: Bool = false
    @Published var lastSyncDate: Date?
    
    private init() {
        print("[CloudKitService] CloudKit is disabled.")
    }
    
    // MARK: - Account Status
    
    func checkAccountStatus() {
        // CloudKit disabled - always set to unavailable
        self.isCloudAvailable = false
    }
    
    // MARK: - High Scores
    
    func saveHighScore(_ score: HighScoreData) async throws {
        // Save to UserDefaults (CloudKit disabled)
        var scores = loadHighScoresFromDefaults()
        scores.append(score)
        scores.sort { $0.score > $1.score }
        let topScores = Array(scores.prefix(100))
        if let encoded = try? JSONEncoder().encode(topScores) {
            UserDefaults.standard.set(encoded, forKey: "highScores")
            lastSyncDate = Date()
        }
    }
    
    func fetchHighScores(limit: Int = 100) async throws -> [HighScoreData] {
        // Load from UserDefaults (CloudKit disabled)
        let scores = loadHighScoresFromDefaults()
        return Array(scores.prefix(limit))
    }
    
    private func loadHighScoresFromDefaults() -> [HighScoreData] {
        if let data = UserDefaults.standard.data(forKey: "highScores"),
           let scores = try? JSONDecoder().decode([HighScoreData].self, from: data) {
            return scores
        }
        return []
    }
    
    // MARK: - Game Statistics
    
    func saveGameStats(_ stats: GameStatsData) async throws {
        // CloudKit disabled - save to UserDefaults
        guard isCloudAvailable else { return }
        if let encoded = try? JSONEncoder().encode(stats) {
            UserDefaults.standard.set(encoded, forKey: "userGameStats")
            lastSyncDate = Date()
        }
    }
    
    func fetchGameStats() async throws -> GameStatsData? {
        // CloudKit disabled - load from UserDefaults
        guard isCloudAvailable else { return nil }
        if let data = UserDefaults.standard.data(forKey: "userGameStats"),
           let decoded = try? JSONDecoder().decode(GameStatsData.self, from: data) {
            return decoded
        }
        return nil
    }
    
    // MARK: - Achievements
    
    func saveAchievements(_ achievements: [AchievementData]) async throws {
        // CloudKit disabled - save to UserDefaults
        guard isCloudAvailable else { return }
        if let encoded = try? JSONEncoder().encode(achievements) {
            UserDefaults.standard.set(encoded, forKey: "achievements")
            lastSyncDate = Date()
        }
    }
    
    func fetchAchievements() async throws -> [AchievementData] {
        // CloudKit disabled - load from UserDefaults
        guard isCloudAvailable else { return [] }
        if let data = UserDefaults.standard.data(forKey: "achievements"),
           let decoded = try? JSONDecoder().decode([AchievementData].self, from: data) {
            return decoded
        }
        return []
    }
    
    // MARK: - Player Progress
    
    func savePlayerProgress(_ progress: PlayerProgressData) async throws {
        // CloudKit disabled - save to UserDefaults
        guard isCloudAvailable else { return }
        if let encoded = try? JSONEncoder().encode(progress) {
            UserDefaults.standard.set(encoded, forKey: "userProgress")
            lastSyncDate = Date()
        }
    }
    
    func fetchPlayerProgress() async throws -> PlayerProgressData? {
        // CloudKit disabled - load from UserDefaults
        guard isCloudAvailable else { return nil }
        if let data = UserDefaults.standard.data(forKey: "userProgress"),
           let decoded = try? JSONDecoder().decode(PlayerProgressData.self, from: data) {
            return decoded
        }
        return nil
    }
    
    // MARK: - Sync All Data
    
    func syncAllData(localStats: GameStatsData, localAchievements: [AchievementData], localProgress: PlayerProgressData) async {
        guard isCloudAvailable else { return }
        
        do {
            // Sync in parallel
            async let statsTask: Void = saveGameStats(localStats)
            async let achievementsTask: Void = saveAchievements(localAchievements)
            async let progressTask: Void = savePlayerProgress(localProgress)
            
            _ = try await (statsTask, achievementsTask, progressTask)
            lastSyncDate = Date()
        } catch {
            print("Error syncing data to CloudKit: \(error.localizedDescription)")
        }
    }
}

// MARK: - Data Models

struct HighScoreData: Codable, Identifiable {
    let id: UUID
    let playerName: String
    let score: Int
    let wave: Int
    let level: Int
    let kills: Int
    let combo: Int
    let accuracy: Double
    let date: Date
    
    init(playerName: String, score: Int, wave: Int, level: Int, kills: Int, combo: Int, accuracy: Double, date: Date = Date(), id: UUID = UUID()) {
        self.id = id
        self.playerName = playerName
        self.score = score
        self.wave = wave
        self.level = level
        self.kills = kills
        self.combo = combo
        self.accuracy = accuracy
        self.date = date
    }
    
    // CloudKit record initializer removed - using JSON encoding instead
}

struct GameStatsData: Codable {
    var totalGamesPlayed: Int
    var totalPlayTime: Int
    var totalScore: Int
    var totalKills: Int
    var totalWavesCompleted: Int
    var totalBossesDefeated: Int
    var highestScore: Int
    var highestWave: Int
    var highestCombo: Int
    var totalShotsFired: Int
    var totalShotsHit: Int
    var bestAccuracy: Double
    var totalPowerUpsCollected: Int
    var achievementsUnlocked: Int
    
    // CloudKit record initializer removed - using JSON encoding instead
    
    init() {
        self.totalGamesPlayed = 0
        self.totalPlayTime = 0
        self.totalScore = 0
        self.totalKills = 0
        self.totalWavesCompleted = 0
        self.totalBossesDefeated = 0
        self.highestScore = 0
        self.highestWave = 0
        self.highestCombo = 0
        self.totalShotsFired = 0
        self.totalShotsHit = 0
        self.bestAccuracy = 0.0
        self.totalPowerUpsCollected = 0
        self.achievementsUnlocked = 0
    }
}

struct AchievementData: Codable {
    let id: String
    let name: String
    let description: String
    var unlocked: Bool
    var unlockedDate: Date?
    let reward: Int
    
    // Memberwise initializer
    init(id: String, name: String, description: String, unlocked: Bool, unlockedDate: Date?, reward: Int) {
        self.id = id
        self.name = name
        self.description = description
        self.unlocked = unlocked
        self.unlockedDate = unlockedDate
        self.reward = reward
    }

    // CloudKit record initializer removed - using JSON encoding instead
}

struct PlayerProgressData: Codable {
    var coins: Int
    var unlockedShips: [String]
    var unlockedCharacters: [String]
    var storeUpgrades: [String: Bool]
    
    // CloudKit record initializer removed - using JSON encoding instead
    
    init() {
        self.coins = 0
        self.unlockedShips = []
        self.unlockedCharacters = []
        self.storeUpgrades = [:]
    }
}
