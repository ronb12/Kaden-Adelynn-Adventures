//
//  SkinManager.swift
//  KadenAdelynnSpaceAdventures
//
//  Manages ship skin colors and effects for customization
//

import UIKit
import SpriteKit

struct SkinColors {
    let shipColor: UIColor
    let accentColor: UIColor
    let glowColor: UIColor
    let glowIntensity: CGFloat
    let hasPulse: Bool
    let pulseSpeed: CGFloat
    let hasShine: Bool
    let hasFrost: Bool
    let hasFlame: Bool
}

class SkinManager {
    // Get the currently selected skin from UserDefaults
    static func getSelectedSkin() -> String {
        let key = "customization_skins_selected"
        return UserDefaults.standard.string(forKey: key) ?? "default"
    }
    
    // Get skin colors and effects based on skin name
    static func getSkinColors(skinName: String, baseShipColor: UIColor? = nil, baseAccentColor: UIColor? = nil) -> SkinColors {
        let defaultShipColor = baseShipColor ?? UIColor(red: 0.31, green: 0.80, blue: 0.77, alpha: 1.0) // #4ecdc4
        let defaultAccentColor = baseAccentColor ?? UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0) // #00ffff
        
        switch skinName.lowercased() {
        case "neon", "neon blue":
            return SkinColors(
                shipColor: UIColor(red: 0.0, green: 0.8, blue: 1.0, alpha: 1.0), // Bright cyan
                accentColor: UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0), // Cyan
                glowColor: UIColor(red: 0.0, green: 0.8, blue: 1.0, alpha: 0.8),
                glowIntensity: 20.0,
                hasPulse: false,
                pulseSpeed: 0.0,
                hasShine: false,
                hasFrost: false,
                hasFlame: false
            )
            
        case "fire", "fire red":
            return SkinColors(
                shipColor: UIColor(red: 1.0, green: 0.3, blue: 0.0, alpha: 1.0), // Red-orange
                accentColor: UIColor(red: 1.0, green: 0.65, blue: 0.0, alpha: 1.0), // Orange
                glowColor: UIColor(red: 1.0, green: 0.3, blue: 0.0, alpha: 0.8),
                glowIntensity: 25.0,
                hasPulse: true,
                pulseSpeed: 8.0, // Flicker effect
                hasShine: false,
                hasFrost: false,
                hasFlame: true
            )
            
        case "electric", "electric yellow":
            return SkinColors(
                shipColor: UIColor(red: 1.0, green: 0.9, blue: 0.0, alpha: 1.0), // Yellow
                accentColor: UIColor(red: 1.0, green: 0.65, blue: 0.0, alpha: 1.0), // Orange-yellow
                glowColor: UIColor(red: 1.0, green: 1.0, blue: 0.0, alpha: 0.9),
                glowIntensity: 30.0,
                hasPulse: true,
                pulseSpeed: 10.0, // Electric pulse
                hasShine: false,
                hasFrost: false,
                hasFlame: false
            )
            
        case "ice", "ice blue":
            return SkinColors(
                shipColor: UIColor(red: 0.5, green: 0.9, blue: 1.0, alpha: 1.0), // Light blue
                accentColor: UIColor(red: 0.7, green: 1.0, blue: 1.0, alpha: 1.0), // Ice blue
                glowColor: UIColor(red: 0.7, green: 1.0, blue: 1.0, alpha: 0.7),
                glowIntensity: 18.0,
                hasPulse: false,
                pulseSpeed: 0.0,
                hasShine: false,
                hasFrost: true,
                hasFlame: false
            )
            
        case "plasma", "plasma purple":
            return SkinColors(
                shipColor: UIColor(red: 0.8, green: 0.2, blue: 1.0, alpha: 1.0), // Purple
                accentColor: UIColor(red: 1.0, green: 0.4, blue: 0.8, alpha: 1.0), // Pink-purple
                glowColor: UIColor(red: 0.8, green: 0.2, blue: 1.0, alpha: 0.9),
                glowIntensity: 25.0,
                hasPulse: true,
                pulseSpeed: 6.0, // Plasma pulse
                hasShine: false,
                hasFrost: false,
                hasFlame: false
            )
            
        case "camouflage", "green camouflage":
            return SkinColors(
                shipColor: UIColor(red: 0.2, green: 0.6, blue: 0.2, alpha: 1.0), // Forest green
                accentColor: UIColor(red: 0.3, green: 0.5, blue: 0.2, alpha: 1.0), // Dark green
                glowColor: UIColor(red: 0.2, green: 0.6, blue: 0.2, alpha: 0.6),
                glowIntensity: 12.0, // Subtle glow for camouflage
                hasPulse: false,
                pulseSpeed: 0.0,
                hasShine: false,
                hasFrost: false,
                hasFlame: false
            )
            
        case "kaden", "kaden_camo", "kaden - blue camouflage":
            return SkinColors(
                shipColor: UIColor(red: 0.2, green: 0.4, blue: 0.8, alpha: 1.0), // Blue camouflage
                accentColor: UIColor(red: 0.3, green: 0.5, blue: 0.9, alpha: 1.0), // Light blue
                glowColor: UIColor(red: 0.2, green: 0.4, blue: 0.8, alpha: 0.6),
                glowIntensity: 12.0, // Subtle glow for camouflage
                hasPulse: false,
                pulseSpeed: 0.0,
                hasShine: false,
                hasFrost: false,
                hasFlame: false
            )
            
        case "adelynn", "adelynn_camo", "adelynn - pink camouflage":
            return SkinColors(
                shipColor: UIColor(red: 1.0, green: 0.4, blue: 0.8, alpha: 1.0), // Pink camouflage
                accentColor: UIColor(red: 0.9, green: 0.3, blue: 0.7, alpha: 1.0), // Dark pink
                glowColor: UIColor(red: 1.0, green: 0.4, blue: 0.8, alpha: 0.6),
                glowIntensity: 12.0, // Subtle glow for camouflage
                hasPulse: false,
                pulseSpeed: 0.0,
                hasShine: false,
                hasFrost: false,
                hasFlame: false
            )
            
        case "gold", "gold elite":
            return SkinColors(
                shipColor: UIColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0), // Gold
                accentColor: UIColor(red: 1.0, green: 0.65, blue: 0.0, alpha: 1.0), // Orange-gold
                glowColor: UIColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 0.8),
                glowIntensity: 22.0,
                hasPulse: false,
                pulseSpeed: 0.0,
                hasShine: true,
                hasFrost: false,
                hasFlame: false
            )
            
        case "rainbow":
            // Rainbow uses animated colors, default to cyan for base
            return SkinColors(
                shipColor: UIColor(red: 0.0, green: 0.8, blue: 1.0, alpha: 1.0), // Cyan base
                accentColor: UIColor(red: 1.0, green: 0.4, blue: 0.8, alpha: 1.0), // Pink
                glowColor: UIColor(red: 1.0, green: 0.0, blue: 1.0, alpha: 0.8),
                glowIntensity: 28.0,
                hasPulse: true,
                pulseSpeed: 3.0, // Slow rainbow cycle
                hasShine: false,
                hasFrost: false,
                hasFlame: false
            )
            
        default: // "default"
            return SkinColors(
                shipColor: defaultShipColor,
                accentColor: defaultAccentColor,
                glowColor: defaultAccentColor.withAlphaComponent(0.6),
                glowIntensity: 15.0,
                hasPulse: false,
                pulseSpeed: 0.0,
                hasShine: false,
                hasFrost: false,
                hasFlame: false
            )
        }
    }
    
    // Apply skin effects to a sprite node
    static func applySkinEffects(to sprite: SKSpriteNode, skinName: String, colors: SkinColors) {
        // Note: Color tinting is already applied in ShipGraphics, so we just add effects here
        
        guard let parent = sprite.parent else { return }
        
        // Add glow effect
        if colors.glowIntensity > 0 {
            let glow = SKShapeNode(circleOfRadius: max(sprite.size.width, sprite.size.height) * 0.6)
            glow.fillColor = colors.glowColor
            glow.strokeColor = .clear
            glow.alpha = 0.3
            glow.zPosition = sprite.zPosition - 1
            glow.name = "skinGlow"
            glow.position = sprite.position
            parent.addChild(glow)
            
            // Animate glow for pulse effects
            if colors.hasPulse && colors.pulseSpeed > 0 {
                let pulseAction = SKAction.sequence([
                    SKAction.fadeAlpha(to: 0.5, duration: 1.0 / colors.pulseSpeed),
                    SKAction.fadeAlpha(to: 0.2, duration: 1.0 / colors.pulseSpeed)
                ])
                glow.run(SKAction.repeatForever(pulseAction), withKey: "pulse")
            }
        }
        
        // Add shine effect for gold skin
        if colors.hasShine {
            let shine = SKShapeNode(rect: CGRect(
                x: -sprite.size.width/2,
                y: -sprite.size.height/2,
                width: sprite.size.width,
                height: sprite.size.height
            ))
            shine.fillColor = UIColor.white.withAlphaComponent(0.3)
            shine.strokeColor = .clear
            shine.zPosition = sprite.zPosition + 0.5
            shine.name = "skinShine"
            shine.position = sprite.position
            
            // Animate shine sweep
            let shineAction = SKAction.sequence([
                SKAction.moveBy(x: sprite.size.width * 2, y: 0, duration: 1.5),
                SKAction.moveBy(x: -sprite.size.width * 2, y: 0, duration: 0.0)
            ])
            shine.run(SKAction.repeatForever(shineAction), withKey: "shine")
            parent.addChild(shine)
        }
        
        // Add frost effect for ice skin
        if colors.hasFrost {
            let frost = SKShapeNode(rect: CGRect(
                x: -sprite.size.width/2,
                y: -sprite.size.height/2,
                width: sprite.size.width,
                height: sprite.size.height
            ))
            frost.fillColor = UIColor(red: 0.7, green: 1.0, blue: 1.0, alpha: 0.2)
            frost.strokeColor = UIColor(red: 0.7, green: 1.0, blue: 1.0, alpha: 0.5)
            frost.lineWidth = 1.0
            frost.zPosition = sprite.zPosition + 0.3
            frost.name = "skinFrost"
            frost.position = sprite.position
            parent.addChild(frost)
        }
    }
    
    // Get rainbow color for animated rainbow skin
    static func getRainbowColor(time: TimeInterval) -> UIColor {
        let hue = (time.truncatingRemainder(dividingBy: 1.0))
        return UIColor(hue: CGFloat(hue), saturation: 1.0, brightness: 1.0, alpha: 1.0)
    }
}

