//
//  GameCenterService.swift
//  KadenAdelynnSpaceAdventures
//
//  Game Center authentication and integration
//

import Foundation
import GameKit
import Combine

class GameCenterService: NSObject, ObservableObject {
    static let shared = GameCenterService()
    
    @Published var isAuthenticated: Bool = false
    @Published var playerName: String = ""
    @Published var playerID: String = ""
    @Published var error: Error?
    
    private let localPlayer = GKLocalPlayer.local
    
    override init() {
        super.init()
        authenticateLocalPlayer()
    }
    
    func authenticateLocalPlayer() {
        localPlayer.authenticateHandler = { [weak self] viewController, error in
            DispatchQueue.main.async {
                if let vc = viewController {
                    // Present Game Center login view controller
                    if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                       let rootViewController = windowScene.windows.first?.rootViewController {
                        rootViewController.present(vc, animated: true)
                    }
                } else if self?.localPlayer.isAuthenticated == true {
                    self?.isAuthenticated = true
                    self?.playerName = self?.localPlayer.displayName ?? "Player"
                    if let self = self {
                        self.playerID = self.localPlayer.gamePlayerID
                    }
                } else {
                    self?.isAuthenticated = false
                    self?.error = error
                }
            }
        }
    }
    
    func signIn(completion: @escaping (Bool, Error?) -> Void) {
        if localPlayer.isAuthenticated {
            isAuthenticated = true
            playerName = localPlayer.displayName
            playerID = localPlayer.gamePlayerID
            completion(true, nil)
        } else {
            authenticateLocalPlayer()
            // Wait a bit for authentication to complete
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                if self.localPlayer.isAuthenticated {
                    self.isAuthenticated = true
                    self.playerName = self.localPlayer.displayName
                    self.playerID = self.localPlayer.gamePlayerID
                    completion(true, nil)
                } else {
                    completion(false, self.error)
                }
            }
        }
    }
    
    func getPlayerCredentials() -> (playerID: String, displayName: String)? {
        guard localPlayer.isAuthenticated else { return nil }
        return (localPlayer.gamePlayerID, localPlayer.displayName)
    }
}

