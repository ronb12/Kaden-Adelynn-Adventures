import Foundation
// CloudKit disabled - using local storage only

/// CloudKit manager for cloud save/load, statistics, upgrades, and customization
/// DISABLED: Now uses UserDefaults only
class CloudKitManager {
    static let shared = CloudKitManager()
    
    // CloudKit disabled - using UserDefaults only
    private let container: Any? = nil
    private let privateDatabase: Any? = nil
    
    // Record types
    private let saveSlotRecordType = "GameSave"
    private let statisticsRecordType = "Statistics"
    private let upgradesRecordType = "WeaponUpgrades"
    private let customizationRecordType = "Customization"
    
    private init() {
        // CloudKit disabled - using UserDefaults only
    }
    
    // MARK: - Save/Load Game
    
    func saveSaveSlot(slotId: String, saveData: GameSaveData, completion: @escaping (Result<Void, Error>) -> Void) {
        // CloudKit disabled - save to UserDefaults only
        saveToUserDefaults(key: "save_\(slotId)", data: saveData)
        print("✅ Game saved locally")
        completion(.success(()))
    }
    
    func loadSaveSlot(slotId: String, completion: @escaping (Result<GameSaveData?, Error>) -> Void) {
        // CloudKit disabled - load from UserDefaults only
        if let localData: GameSaveData = self.loadFromUserDefaults(key: "save_\(slotId)") {
            print("✅ Game loaded locally")
            completion(.success(localData))
        } else {
            completion(.success(nil))
        }
    }
    
    // MARK: - Statistics
    
    func saveStatistics(_ stats: GameStatistics, completion: @escaping (Result<Void, Error>) -> Void) {
        // CloudKit disabled - save to UserDefaults only
        saveToUserDefaults(key: "statistics", data: stats)
        print("✅ Statistics saved locally")
        completion(.success(()))
    }
    
    func loadStatistics(completion: @escaping (Result<GameStatistics, Error>) -> Void) {
        // CloudKit disabled - load from UserDefaults only
        if let localData: GameStatistics = self.loadFromUserDefaults(key: "statistics") {
            print("✅ Statistics loaded locally")
            completion(.success(localData))
        } else {
            completion(.success(GameStatistics()))
        }
    }
    
    // MARK: - Weapon Upgrades
    
    func saveUpgrades(_ upgrades: WeaponUpgrades, completion: @escaping (Result<Void, Error>) -> Void) {
        // CloudKit disabled - save to UserDefaults only
        saveToUserDefaults(key: "upgrades", data: upgrades)
        print("✅ Upgrades saved locally")
        completion(.success(()))
    }
    
    func loadUpgrades(completion: @escaping (Result<WeaponUpgrades, Error>) -> Void) {
        // CloudKit disabled - load from UserDefaults only
        if let localData: WeaponUpgrades = self.loadFromUserDefaults(key: "upgrades") {
            print("✅ Upgrades loaded locally")
            completion(.success(localData))
        } else {
            completion(.success(WeaponUpgrades()))
        }
    }
    
    // MARK: - UserDefaults Fallback
    
    private func saveToUserDefaults<T: Codable>(key: String, data: T) {
        if let encoded = try? JSONEncoder().encode(data) {
            UserDefaults.standard.set(encoded, forKey: key)
            print("💾 Saved to local UserDefaults: \(key)")
        }
    }
    
    private func loadFromUserDefaults<T: Codable>(key: String) -> T? {
        guard let data = UserDefaults.standard.data(forKey: key),
              let decoded = try? JSONDecoder().decode(T.self, from: data) else {
            return nil
        }
        print("📁 Loaded from local UserDefaults: \(key)")
        return decoded
    }
}

// MARK: - Data Models

struct GameSaveData: Codable {
    let score: Int
    let wave: Int
    let level: Int
    let lives: Int
    let playerX: Float
    let playerY: Float
    let timestamp: Double
}

struct GameStatistics: Codable {
    var gamesPlayed: Int = 0
    var totalScore: Int = 0
    var totalKills: Int = 0
    var highestWave: Int = 0
    var totalPlayTime: Double = 0
    var totalShots: Int = 0
    var totalHits: Int = 0
}

struct WeaponUpgrades: Codable {
    var damage: Int = 1
    var fireRate: Int = 1
    var range: Int = 1
    var pierce: Int = 0
    var spread: Int = 0
    var homing: Int = 0
}
