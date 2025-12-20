//
// GameCenterManager.swift
// KadenAdelynnAdventures
//
// Handles Game Center authentication, leaderboard, and achievements integration.
//

import Foundation
import GameKit

class GameCenterManager: NSObject, ObservableObject {
    static let shared = GameCenterManager()
    @Published var isAuthenticated = false
    @Published var playerName: String = ""
    @Published var error: Error?
    
    private override init() {
        super.init()
    }
    
    func authenticateLocalPlayer() {
        let localPlayer = GKLocalPlayer.local
        localPlayer.authenticateHandler = { [weak self] viewController, error in
            DispatchQueue.main.async {
                if let vc = viewController {
                    // Present the Game Center login view controller
                    if let rootVC = UIApplication.shared.windows.first?.rootViewController {
                        rootVC.present(vc, animated: true, completion: nil)
                    }
                } else if localPlayer.isAuthenticated {
                    self?.isAuthenticated = true
                    self?.playerName = localPlayer.displayName
                } else {
                    self?.isAuthenticated = false
                    self?.error = error
                }
            }
        }
    }
    
    func reportScore(_ score: Int, leaderboardID: String) {
        guard GKLocalPlayer.local.isAuthenticated else { return }
        let scoreReporter = GKScore(leaderboardIdentifier: leaderboardID)
        scoreReporter.value = Int64(score)
        GKScore.report([scoreReporter]) { error in
            if let error = error {
                print("Game Center score report error: \(error.localizedDescription)")
            }
        }
    }
    
    func showLeaderboard(leaderboardID: String? = nil) {
        guard let rootVC = UIApplication.shared.windows.first?.rootViewController else { return }
        let gcVC = GKGameCenterViewController()
        gcVC.gameCenterDelegate = self
        if let leaderboardID = leaderboardID {
            gcVC.viewState = .leaderboards
            gcVC.leaderboardIdentifier = leaderboardID
        }
        rootVC.present(gcVC, animated: true, completion: nil)
    }
}

extension GameCenterManager: GKGameCenterControllerDelegate {
    func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true, completion: nil)
    }
}
