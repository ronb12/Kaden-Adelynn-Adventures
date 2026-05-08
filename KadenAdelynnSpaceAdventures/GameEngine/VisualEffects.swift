//
//  VisualEffects.swift
//  KadenAdelynnSpaceAdventures
//
//  Visual effects like screen shake, flashes, etc.
//

import SpriteKit

class VisualEffects {
    // Check if visual effects are enabled (for accessibility - prevents seizures)
    static var areVisualEffectsEnabled: Bool {
        // Check system reduced motion setting first
        if UIAccessibility.isReduceMotionEnabled {
            return false
        }
        // Then check user preference
        if UserDefaults.standard.object(forKey: "visualEffectsEnabled") == nil {
            return true  // Default enabled
        }
        return UserDefaults.standard.bool(forKey: "visualEffectsEnabled")
    }
    
    static func screenShake(intensity: CGFloat, duration: TimeInterval, in scene: SKScene) {
        // Keep the camera and world layer fixed so gameplay bounds never appear to move.
        // Use an anchored border impact instead of translating the scene camera.
        guard areVisualEffectsEnabled else { return }

        let borderWidth = max(5, min(12, intensity * 0.65))
        let border = SKShapeNode(rect: scene.frame.insetBy(dx: -borderWidth / 2, dy: -borderWidth / 2))
        border.fillColor = .clear
        border.strokeColor = UIColor.white.withAlphaComponent(0.9)
        border.lineWidth = borderWidth
        border.glowWidth = borderWidth * 0.65
        border.alpha = 0
        border.zPosition = 1_000
        scene.addChild(border)

        let pulseDuration = max(0.12, min(duration, 0.28))
        border.run(SKAction.sequence([
            SKAction.group([
                SKAction.fadeAlpha(to: 0.65, duration: pulseDuration * 0.25),
                SKAction.scale(to: 1.012, duration: pulseDuration * 0.25)
            ]),
            SKAction.group([
                SKAction.fadeOut(withDuration: pulseDuration * 0.75),
                SKAction.scale(to: 1.0, duration: pulseDuration * 0.75)
            ]),
            SKAction.removeFromParent()
        ]))
    }
    
    static func flashScreen(color: UIColor, duration: TimeInterval, in scene: SKScene) {
        // Replace flash with safe border effect (no rapid flashing for photosensitive users)
        // Use a subtle border pulse instead of full-screen flash
        borderPulse(color: color, duration: duration, in: scene)
    }
    
    static func borderPulse(color: UIColor, duration: TimeInterval, in scene: SKScene) {
        // Safe border pulse effect (no rapid flashing for photosensitive users)
        let borderWidth: CGFloat = 8.0
        let border = SKShapeNode(rect: scene.frame.insetBy(dx: -borderWidth/2, dy: -borderWidth/2))
        border.fillColor = .clear
        border.strokeColor = color
        border.lineWidth = borderWidth
        border.alpha = 0.0  // Start invisible
        border.zPosition = 999
        scene.addChild(border)
        
        // Gentle pulse effect
        border.run(SKAction.sequence([
            SKAction.group([
                SKAction.fadeAlpha(to: 0.8, duration: duration * 0.3),
                SKAction.scale(to: 1.02, duration: duration * 0.3)
            ]),
            SKAction.group([
                SKAction.fadeOut(withDuration: duration * 0.7),
                SKAction.scale(to: 1.0, duration: duration * 0.7)
            ]),
            SKAction.removeFromParent()
        ]))
    }
    
    static func createFloatingText(_ text: String, at position: CGPoint, color: UIColor = .white, size: CGFloat = 24) -> SKLabelNode {
        let label = SKLabelNode(text: text)
        label.fontName = "Arial-BoldMT"
        label.fontSize = size
        label.fontColor = color
        label.position = position
        label.zPosition = 100
        
        // Animate floating up and fading out
        label.run(SKAction.sequence([
            SKAction.group([
                SKAction.moveBy(x: 0, y: 50, duration: 1.0),
                SKAction.fadeOut(withDuration: 1.0),
                SKAction.scale(to: 1.5, duration: 1.0)
            ]),
            SKAction.removeFromParent()
        ]))
        
        return label
    }
    
    static func createDamageNumber(_ damage: Int, at position: CGPoint) -> SKLabelNode {
        return createFloatingText("-\(damage)", at: position, color: .red, size: 20)
    }
    
    static func createScorePopup(_ points: Int, at position: CGPoint) -> SKLabelNode {
        return createFloatingText("+\(points)", at: position, color: .yellow, size: 18)
    }
    
    static func createComboText(_ combo: Int, at position: CGPoint) -> SKLabelNode {
        let label = SKLabelNode(text: "\(combo)x COMBO!")
        label.fontName = "Arial-BoldMT"
        label.fontSize = 32
        label.fontColor = .yellow
        label.position = position
        label.zPosition = 100
        
        label.run(SKAction.sequence([
            SKAction.group([
                SKAction.moveBy(x: 0, y: 100, duration: 1.5),
                SKAction.fadeOut(withDuration: 1.5),
                SKAction.scale(to: 1.8, duration: 1.5)
            ]),
            SKAction.removeFromParent()
        ]))
        
        return label
    }
}
