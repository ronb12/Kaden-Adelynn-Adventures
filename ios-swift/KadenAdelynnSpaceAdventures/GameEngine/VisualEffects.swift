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
        // Default to true, but check UserDefaults
        if UserDefaults.standard.object(forKey: "visualEffectsEnabled") == nil {
            return true  // Default enabled
        }
        return UserDefaults.standard.bool(forKey: "visualEffectsEnabled")
    }
    
    static func screenShake(intensity: CGFloat, duration: TimeInterval, in scene: SKScene) {
        // Skip screen shake if visual effects are disabled (accessibility)
        guard areVisualEffectsEnabled else { return }
        
        let camera = scene.camera ?? SKCameraNode()
        if scene.camera == nil {
            scene.addChild(camera)
            scene.camera = camera
        }
        
        let originalPosition = camera.position
        let shake = SKAction.sequence([
            SKAction.moveBy(x: -intensity, y: intensity, duration: 0.05),
            SKAction.moveBy(x: intensity * 2, y: -intensity * 2, duration: 0.05),
            SKAction.moveBy(x: -intensity * 2, y: intensity * 2, duration: 0.05),
            SKAction.moveBy(x: intensity, y: -intensity, duration: 0.05),
            SKAction.move(to: originalPosition, duration: 0.05)
        ])
        
        camera.run(shake)
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

