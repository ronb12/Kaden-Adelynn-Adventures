//
//  AchievementManager.swift
//  KadenAdelynnSpaceAdventures
//
//  Achievement system with notifications
//

import Foundation
import SwiftUI

class AchievementManager {
    static let shared = AchievementManager()
    
    struct Achievement {
        let id: String
        let name: String
        let description: String
        let icon: String
        var unlocked: Bool
        var unlockedDate: Date?
    }
    
    @Published var achievements: [Achievement] = []
    @Published var recentUnlock: Achievement?
    
    private init() {
        loadAchievements()
    }
    
    private func loadAchievements() {
        achievements = [
            Achievement(id: "first-kill", name: "First Victory", description: "Destroy your first enemy", icon: "🎯", unlocked: false, unlockedDate: nil),
            Achievement(id: "combo-10", name: "Combo Master", description: "Achieve a 10-hit combo", icon: "⚡", unlocked: false, unlockedDate: nil),
            Achievement(id: "combo-25", name: "Combo Legend", description: "Achieve a 25-hit combo", icon: "🔥", unlocked: false, unlockedDate: nil),
            Achievement(id: "wave-10", name: "Wave Warrior", description: "Reach wave 10", icon: "🌊", unlocked: false, unlockedDate: nil),
            Achievement(id: "wave-25", name: "Wave Master", description: "Reach wave 25", icon: "🌌", unlocked: false, unlockedDate: nil),
            Achievement(id: "boss-killer", name: "Boss Slayer", description: "Defeat a boss", icon: "👹", unlocked: false, unlockedDate: nil),
            Achievement(id: "perfect-accuracy", name: "Sharpshooter", description: "Achieve 90% accuracy", icon: "🎯", unlocked: false, unlockedDate: nil),
            Achievement(id: "score-100k", name: "High Scorer", description: "Score 100,000 points", icon: "⭐", unlocked: false, unlockedDate: nil),
            Achievement(id: "score-500k", name: "Elite Scorer", description: "Score 500,000 points", icon: "🌟", unlocked: false, unlockedDate: nil),
            Achievement(id: "survivor", name: "Survivor", description: "Survive 1000 enemies", icon: "💪", unlocked: false, unlockedDate: nil)
        ]
        
        // Load unlocked achievements
        if let data = UserDefaults.standard.data(forKey: "achievements"),
           let unlocked = try? JSONDecoder().decode([String].self, from: data) {
            for i in 0..<achievements.count {
                if unlocked.contains(achievements[i].id) {
                    achievements[i].unlocked = true
                }
            }
        }
    }
    
    func checkAchievements(gameState: GameStateManager) {
        // First kill
        if gameState.enemiesKilled >= 1 {
            unlockAchievement("first-kill")
        }
        
        // Combo achievements
        if gameState.combo >= 10 {
            unlockAchievement("combo-10")
        }
        if gameState.combo >= 25 {
            unlockAchievement("combo-25")
        }
        
        // Wave achievements
        if gameState.wave >= 10 {
            unlockAchievement("wave-10")
        }
        if gameState.wave >= 25 {
            unlockAchievement("wave-25")
        }
        
        // Score achievements
        if gameState.score >= 100000 {
            unlockAchievement("score-100k")
        }
        if gameState.score >= 500000 {
            unlockAchievement("score-500k")
        }
        
        // Accuracy achievement
        if gameState.accuracy >= 90.0 && gameState.shotsFired >= 100 {
            unlockAchievement("perfect-accuracy")
        }
        
        // Survivor achievement
        if gameState.enemiesKilled >= 1000 {
            unlockAchievement("survivor")
        }
    }
    
    func checkBossKill() {
        unlockAchievement("boss-killer")
    }
    
    private func unlockAchievement(_ id: String) {
        guard let index = achievements.firstIndex(where: { $0.id == id }),
              !achievements[index].unlocked else {
            return
        }
        
        achievements[index].unlocked = true
        achievements[index].unlockedDate = Date()
        recentUnlock = achievements[index]
        
        // Save
        let unlocked = achievements.filter { $0.unlocked }.map { $0.id }
        if let data = try? JSONEncoder().encode(unlocked) {
            UserDefaults.standard.set(data, forKey: "achievements")
        }
        
        // Haptic feedback
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
}

import Combine

extension AchievementManager: ObservableObject {}

