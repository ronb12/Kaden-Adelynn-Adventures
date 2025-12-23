//
//  HapticManager.swift
//  KadenAdelynnSpaceAdventures
//
//  Centralized haptic feedback manager
//

import UIKit

class HapticManager {
    static let shared = HapticManager()
    
    private var isEnabled: Bool {
        UserDefaults.standard.bool(forKey: "hapticFeedback")
    }
    
    private init() {
        // Default to enabled if not set
        if UserDefaults.standard.object(forKey: "hapticFeedback") == nil {
            UserDefaults.standard.set(true, forKey: "hapticFeedback")
        }
    }
    
    func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        guard isEnabled else { return }
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.impactOccurred()
    }
    
    func notification(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        guard isEnabled else { return }
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(type)
    }
    
    func selection() {
        guard isEnabled else { return }
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }
    
    // Game-specific haptics
    func buttonPress() {
        impact(.light)
    }
    
    func enemyKilled() {
        impact(.medium)
    }
    
    func powerUpCollected() {
        notification(.success)
    }
    
    func playerHit() {
        impact(.heavy)
    }
    
    func saveSuccess() {
        notification(.success)
    }
    
    func saveError() {
        notification(.error)
    }
    
    func waveComplete() {
        notification(.success)
    }
    
    func bossSpawn() {
        impact(.heavy)
    }
}

