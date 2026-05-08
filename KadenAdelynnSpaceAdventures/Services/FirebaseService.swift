//
//  FirebaseService.swift
//  KadenAdelynnSpaceAdventures
//
//  Firebase service for leaderboards and cloud data sync
//

import Foundation
import Combine
import GameKit
import FirebaseCore
import FirebaseFirestore

class FirebaseService: ObservableObject {
    static let shared = FirebaseService()
    
    @Published var isAvailable: Bool = false
    @Published var lastSyncDate: Date?
    
    private let collectionName = "highScores"
    private let userScoresCollectionName = "userScores"  // Per-user personal best scores
    
    // Firebase configuration
    // Note: Actual config comes from GoogleService-Info.plist
    // iOS App Details:
    // - App ID: 1:265116401918:ios:edc1e0c21bf24fece0e5af
    // - Bundle ID: Kaden---Adelynn-Space-Adventures
    // - Project ID: kaden---adelynn-adventures
    // - Team ID: 4SQJ3AH62S
    // - App Store ID: 6749645849
    
    private init() {
        checkAvailability()
    }
    
    // MARK: - Availability Check
    
    func checkAvailability() {
        isAvailable = FirebaseApp.app() != nil
    }
    
    // MARK: - High Scores
    
    func saveHighScore(_ score: HighScoreData) async throws {
        guard isAvailable else {
            // Fallback to local storage
            return try await saveHighScoreLocally(score)
        }
        
        let db = Firestore.firestore()
        let scoreData: [String: Any] = [
            "playerName": score.playerName,
            "score": score.score,
            "wave": score.wave,
            "level": score.level,
            "kills": score.kills,
            "combo": score.combo,
            "accuracy": score.accuracy,
            "date": Timestamp(date: score.date)
        ]
        
        try await db.collection(collectionName).addDocument(data: scoreData)
        lastSyncDate = Date()
    }
    
    func fetchHighScores(limit: Int = 100) async throws -> [HighScoreData] {
        guard isAvailable else {
            return loadHighScoresFromDefaults()
        }
        
        let db = Firestore.firestore()
        let querySnapshot = try await db.collection(collectionName)
            .order(by: "score", descending: true)
            .limit(to: limit)
            .getDocuments()
        
        var scores: [HighScoreData] = []
        for document in querySnapshot.documents {
            let data = document.data()
            if let playerName = data["playerName"] as? String,
               let score = data["score"] as? Int,
               let wave = data["wave"] as? Int,
               let level = data["level"] as? Int,
               let kills = data["kills"] as? Int,
               let combo = data["combo"] as? Int,
               let accuracy = data["accuracy"] as? Double,
               let timestamp = data["date"] as? Timestamp {
                
                let scoreData = HighScoreData(
                    playerName: playerName,
                    score: score,
                    wave: wave,
                    level: level,
                    kills: kills,
                    combo: combo,
                    accuracy: accuracy,
                    date: timestamp.dateValue()
                )
                scores.append(scoreData)
            }
        }
        
        return scores
    }
    
    // MARK: - Local Storage Fallback
    
    private func loadHighScoresFromDefaults() -> [HighScoreData] {
        if let data = UserDefaults.standard.data(forKey: "highScores"),
           let scores = try? JSONDecoder().decode([HighScoreData].self, from: data) {
            return scores
        }
        return []
    }
    
    private func saveHighScoreLocally(_ score: HighScoreData) async throws {
        var scores = loadHighScoresFromDefaults()
        scores.append(score)
        scores.sort { $0.score > $1.score }
        let topScores = Array(scores.prefix(100))
        if let encoded = try? JSONEncoder().encode(topScores) {
            UserDefaults.standard.set(encoded, forKey: "highScores")
            lastSyncDate = Date()
        }
    }
    
    // MARK: - Per-User Personal Best Scores
    
    /// Save personal best score for the current user
    /// This syncs across all user's devices
    func savePersonalBestScore(_ score: HighScoreData, userId: String) async throws {
        guard isAvailable else {
            // Fallback to local storage
            let key = "personalBest_\(userId)"
            if let encoded = try? JSONEncoder().encode(score) {
                UserDefaults.standard.set(encoded, forKey: key)
            }
            return
        }
        
        let db = Firestore.firestore()
        let scoreData: [String: Any] = [
            "playerName": score.playerName,
            "score": score.score,
            "wave": score.wave,
            "level": score.level,
            "kills": score.kills,
            "combo": score.combo,
            "accuracy": score.accuracy,
            "date": Timestamp(date: score.date),
            "updatedAt": Timestamp(date: Date())
        ]
        
        // Save to userScores collection with userId as document ID
        // This allows easy lookup and ensures one document per user
        try await db.collection(userScoresCollectionName)
            .document(userId)
            .setData(scoreData, merge: false)  // Overwrite to keep only the best
        
        lastSyncDate = Date()
    }
    
    /// Fetch personal best score for the current user
    /// Returns the user's best score across all their devices
    func fetchPersonalBestScore(userId: String) async throws -> HighScoreData? {
        guard isAvailable else {
            // Fallback to local storage
            let key = "personalBest_\(userId)"
            if let data = UserDefaults.standard.data(forKey: key),
               let score = try? JSONDecoder().decode(HighScoreData.self, from: data) {
                return score
            }
            return nil
        }
        
        let db = Firestore.firestore()
        let document = try await db.collection(userScoresCollectionName)
            .document(userId)
            .getDocument()
        
        guard document.exists,
              let data = document.data(),
              let playerName = data["playerName"] as? String,
              let score = data["score"] as? Int,
              let wave = data["wave"] as? Int,
              let level = data["level"] as? Int,
              let kills = data["kills"] as? Int,
              let combo = data["combo"] as? Int,
              let accuracy = data["accuracy"] as? Double,
              let timestamp = data["date"] as? Timestamp else {
            return nil
        }
        
        return HighScoreData(
            playerName: playerName,
            score: score,
            wave: wave,
            level: level,
            kills: kills,
            combo: combo,
            accuracy: accuracy,
            date: timestamp.dateValue()
        )
    }
    
    /// Sync personal best score - saves if new score is better than existing
    func syncPersonalBestScore(_ newScore: HighScoreData, userId: String) async throws {
        // Get current personal best
        if let currentBest = try? await fetchPersonalBestScore(userId: userId) {
            // Only save if new score is better
            if newScore.score > currentBest.score {
                try await savePersonalBestScore(newScore, userId: userId)
            }
        } else {
            // No existing score, save this one
            try await savePersonalBestScore(newScore, userId: userId)
        }
    }
    
    /// Get user ID from authentication services
    /// Returns Game Center player ID, Apple Sign In user ID, or Firebase UID
    func getCurrentUserId() -> String? {
        // Try Game Center first
        if GameCenterService.shared.isAuthenticated,
           !GameCenterService.shared.playerID.isEmpty {
            return "gc_\(GameCenterService.shared.playerID)"  // Prefix to identify Game Center users
        }
        
        // Try Apple Sign In
        if let appleUserID = AppleSignInService().userIdentifier, !appleUserID.isEmpty {
            return "apple_\(appleUserID)"  // Prefix to identify Apple Sign In users
        }
        
        // Try Firebase Auth
        if let firebaseUID = FirebaseAuthService.shared.currentUser?.uid, !firebaseUID.isEmpty {
            return firebaseUID  // Firebase UID is already unique
        }
        
        return nil
    }
}

