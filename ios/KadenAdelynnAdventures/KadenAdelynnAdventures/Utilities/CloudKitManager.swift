import Foundation
import CloudKit

/// CloudKit manager for cloud save/load, statistics, upgrades, and customization
/// Apple's native alternative to Firebase Firestore
class CloudKitManager {
    static let shared = CloudKitManager()
    
    private let container: CKContainer
    private let privateDatabase: CKDatabase
    
    // Record types
    private let saveSlotRecordType = "GameSave"
    private let statisticsRecordType = "Statistics"
    private let upgradesRecordType = "WeaponUpgrades"
    private let customizationRecordType = "Customization"
    
    private init() {
        container = CKContainer.default()
        privateDatabase = container.privateCloudDatabase
    }
    
    // MARK: - Save/Load Game
    
    func saveSaveSlot(slotId: String, saveData: GameSaveData, completion: @escaping (Result<Void, Error>) -> Void) {
        let recordID = CKRecord.ID(recordName: "save_\(slotId)")
        let record = CKRecord(recordType: saveSlotRecordType, recordID: recordID)
        
        record["slotId"] = slotId as CKRecordValue
        record["score"] = saveData.score as CKRecordValue
        record["wave"] = saveData.wave as CKRecordValue
        record["level"] = saveData.level as CKRecordValue
        record["lives"] = saveData.lives as CKRecordValue
        record["playerX"] = saveData.playerX as CKRecordValue
        record["playerY"] = saveData.playerY as CKRecordValue
        record["timestamp"] = saveData.timestamp as CKRecordValue
        
        privateDatabase.save(record) { savedRecord, error in
            if let error = error {
                // Fallback to UserDefaults
                self.saveToUserDefaults(key: "save_\(slotId)", data: saveData)
                completion(.failure(error))
            } else {
                print("✅ Game saved to iCloud")
                completion(.success(()))
            }
        }
    }
    
    func loadSaveSlot(slotId: String, completion: @escaping (Result<GameSaveData?, Error>) -> Void) {
        let recordID = CKRecord.ID(recordName: "save_\(slotId)")
        
        privateDatabase.fetch(withRecordID: recordID) { record, error in
            if let error = error {
                // Fallback to UserDefaults
                if let localData = self.loadFromUserDefaults(key: "save_\(slotId)") {
                    completion(.success(localData))
                } else {
                    completion(.failure(error))
                }
                return
            }
            
            guard let record = record else {
                completion(.success(nil))
                return
            }
            
            let saveData = GameSaveData(
                score: record["score"] as? Int ?? 0,
                wave: record["wave"] as? Int ?? 1,
                level: record["level"] as? Int ?? 1,
                lives: record["lives"] as? Int ?? 3,
                playerX: record["playerX"] as? Float ?? 0,
                playerY: record["playerY"] as? Float ?? 0,
                timestamp: record["timestamp"] as? Double ?? Date().timeIntervalSince1970
            )
            
            print("✅ Game loaded from iCloud")
            completion(.success(saveData))
        }
    }
    
    // MARK: - Statistics
    
    func saveStatistics(_ stats: GameStatistics, completion: @escaping (Result<Void, Error>) -> Void) {
        let recordID = CKRecord.ID(recordName: "user_statistics")
        let record = CKRecord(recordType: statisticsRecordType, recordID: recordID)
        
        record["gamesPlayed"] = stats.gamesPlayed as CKRecordValue
        record["totalScore"] = stats.totalScore as CKRecordValue
        record["totalKills"] = stats.totalKills as CKRecordValue
        record["highestWave"] = stats.highestWave as CKRecordValue
        record["totalPlayTime"] = stats.totalPlayTime as CKRecordValue
        record["totalShots"] = stats.totalShots as CKRecordValue
        record["totalHits"] = stats.totalHits as CKRecordValue
        
        privateDatabase.save(record) { savedRecord, error in
            if let error = error {
                self.saveToUserDefaults(key: "statistics", data: stats)
                completion(.failure(error))
            } else {
                print("✅ Statistics saved to iCloud")
                completion(.success(()))
            }
        }
    }
    
    func loadStatistics(completion: @escaping (Result<GameStatistics, Error>) -> Void) {
        let recordID = CKRecord.ID(recordName: "user_statistics")
        
        privateDatabase.fetch(withRecordID: recordID) { record, error in
            if let error = error {
                if let localData: GameStatistics = self.loadFromUserDefaults(key: "statistics") {
                    completion(.success(localData))
                } else {
                    completion(.success(GameStatistics()))
                }
                return
            }
            
            guard let record = record else {
                completion(.success(GameStatistics()))
                return
            }
            
            let stats = GameStatistics(
                gamesPlayed: record["gamesPlayed"] as? Int ?? 0,
                totalScore: record["totalScore"] as? Int ?? 0,
                totalKills: record["totalKills"] as? Int ?? 0,
                highestWave: record["highestWave"] as? Int ?? 0,
                totalPlayTime: record["totalPlayTime"] as? Double ?? 0,
                totalShots: record["totalShots"] as? Int ?? 0,
                totalHits: record["totalHits"] as? Int ?? 0
            )
            
            print("✅ Statistics loaded from iCloud")
            completion(.success(stats))
        }
    }
    
    // MARK: - Weapon Upgrades
    
    func saveUpgrades(_ upgrades: WeaponUpgrades, completion: @escaping (Result<Void, Error>) -> Void) {
        let recordID = CKRecord.ID(recordName: "weapon_upgrades")
        let record = CKRecord(recordType: upgradesRecordType, recordID: recordID)
        
        record["damage"] = upgrades.damage as CKRecordValue
        record["fireRate"] = upgrades.fireRate as CKRecordValue
        record["range"] = upgrades.range as CKRecordValue
        record["pierce"] = upgrades.pierce as CKRecordValue
        record["spread"] = upgrades.spread as CKRecordValue
        record["homing"] = upgrades.homing as CKRecordValue
        
        privateDatabase.save(record) { savedRecord, error in
            if let error = error {
                self.saveToUserDefaults(key: "upgrades", data: upgrades)
                completion(.failure(error))
            } else {
                print("✅ Upgrades saved to iCloud")
                completion(.success(()))
            }
        }
    }
    
    func loadUpgrades(completion: @escaping (Result<WeaponUpgrades, Error>) -> Void) {
        let recordID = CKRecord.ID(recordName: "weapon_upgrades")
        
        privateDatabase.fetch(withRecordID: recordID) { record, error in
            if let error = error {
                if let localData: WeaponUpgrades = self.loadFromUserDefaults(key: "upgrades") {
                    completion(.success(localData))
                } else {
                    completion(.success(WeaponUpgrades()))
                }
                return
            }
            
            guard let record = record else {
                completion(.success(WeaponUpgrades()))
                return
            }
            
            let upgrades = WeaponUpgrades(
                damage: record["damage"] as? Int ?? 1,
                fireRate: record["fireRate"] as? Int ?? 1,
                range: record["range"] as? Int ?? 1,
                pierce: record["pierce"] as? Int ?? 0,
                spread: record["spread"] as? Int ?? 0,
                homing: record["homing"] as? Int ?? 0
            )
            
            print("✅ Upgrades loaded from iCloud")
            completion(.success(upgrades))
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
