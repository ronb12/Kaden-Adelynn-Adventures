//
//  GameManager.swift
//  Kaden & Adelynn Adventures Shared
//
//  Created by Ronell Bradley on 8/2/25.
//

import Foundation
import GameKit

class GameManager {
    static let shared = GameManager()
    
    private let userDefaults = UserDefaults.standard
    private let highScoreKey = "HighScore"
    private let totalGamesKey = "TotalGames"
    private let totalScoreKey = "TotalScore"
    
    var highScore: Int {
        get { userDefaults.integer(forKey: highScoreKey) }
        set { userDefaults.set(newValue, forKey: highScoreKey) }
    }
    
    var totalGames: Int {
        get { userDefaults.integer(forKey: totalGamesKey) }
        set { userDefaults.set(newValue, forKey: totalGamesKey) }
    }
    
    var totalScore: Int {
        get { userDefaults.integer(forKey: totalScoreKey) }
        set { userDefaults.set(newValue, forKey: totalScoreKey) }
    }
    
    private init() {}
    
    func updateHighScore(_ score: Int) {
        if score > highScore {
            highScore = score
            submitScoreToGameCenter(score)
        }
    }
    
    func recordGame(score: Int) {
        totalGames += 1
        totalScore += score
        updateHighScore(score)
    }
    
    func submitScoreToGameCenter(_ score: Int) {
        if GKLocalPlayer.local.isAuthenticated {
            GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: ["kaden_adelynn_adventures_leaderboard"]) { error in
                if let error = error {
                    print("Failed to submit score to Game Center: \(error.localizedDescription)")
                } else {
                    print("Score submitted to Game Center successfully")
                }
            }
        }
    }
    
    func authenticateGameCenter() {
        GKLocalPlayer.local.authenticateHandler = { viewController, error in
            if let viewController = viewController {
                // Present the view controller if needed
                if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                   let window = windowScene.windows.first {
                    window.rootViewController?.present(viewController, animated: true)
                }
            } else if let error = error {
                print("Game Center authentication error: \(error.localizedDescription)")
            } else {
                print("Game Center authenticated successfully")
            }
        }
    }
}
