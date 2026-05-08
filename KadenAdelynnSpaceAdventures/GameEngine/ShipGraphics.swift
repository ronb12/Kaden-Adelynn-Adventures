//
//  ShipGraphics.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced ship graphics using Space Pack images
//

import SpriteKit
import UIKit

class ShipGraphics {
    // Map ship IDs to Space Pack image indices
    private static func getSpaceshipImageName(for shipId: String) -> String {
        switch shipId.lowercased() {
        case "kaden": return "Spaceship_0"
        case "adelynn": return "Spaceship_1"
        case "falcon": return "Spaceship_2"
        case "phantom": return "Spaceship_3"
        case "nova": return "Spaceship_4"
        case "titan": return "Spaceship_5"
        case "viper": return "Spaceship_6"
        case "shadow": return "Spaceship_7"
        case "meteor": return "Spaceship_8"
        case "comet": return "Spaceship_9"
        case "raptor": return "Spaceship_10"
        case "aurora": return "Spaceship_11"
        case "starblade": return "Spaceship_12"
        case "nebula": return "Spaceship_13"
        default:
            // Fallback to character-based mapping
            switch shipId.lowercased() {
            case "kaden": return "Spaceship_0"
            case "adelynn": return "Spaceship_1"
            default: return "Spaceship_0"
            }
        }
    }
    
    static func createPlayerShip(size: CGSize, characterId: String = "kaden", shipId: String = "kaden") -> SKNode {
        let ship = SKNode()
        
        // Get the image name for this ship
        let imageName = getSpaceshipImageName(for: shipId)
        
        // Try to load the image from assets
        guard let image = UIImage(named: imageName) else {
            // Fallback: create a simple colored rectangle if image not found
            let fallback = SKShapeNode(rect: CGRect(origin: CGPoint(x: -size.width/2, y: -size.height/2), size: size))
            fallback.fillColor = .blue
            fallback.strokeColor = .cyan
            ship.addChild(fallback)
            return ship
        }
        
        // Create sprite node with the image
        let texture = SKTexture(image: image)
        let sprite = SKSpriteNode(texture: texture)
        
        // Scale to fit the requested size while maintaining aspect ratio
        let imageAspect = image.size.width / image.size.height
        let targetAspect = size.width / size.height
        
        var finalSize = size
        if imageAspect > targetAspect {
            // Image is wider - fit to height
            finalSize = CGSize(width: size.height * imageAspect, height: size.height)
        } else {
            // Image is taller - fit to width
            finalSize = CGSize(width: size.width, height: size.width / imageAspect)
        }
        
        sprite.size = finalSize
        sprite.zPosition = 1
        
        // Get base colors for character/ship
        var baseShipColor: UIColor?
        var baseAccentColor: UIColor?
        
        // Add pink tint for Adelynn's ship (base color)
        if shipId.lowercased() == "adelynn" || characterId.lowercased() == "adelynn" {
            baseShipColor = UIColor(red: 1.0, green: 0.4, blue: 0.8, alpha: 1.0) // Pink
            baseAccentColor = UIColor(red: 1.0, green: 0.0, blue: 1.0, alpha: 1.0) // Magenta
        } else {
            baseShipColor = UIColor(red: 0.31, green: 0.80, blue: 0.77, alpha: 1.0) // Default cyan
            baseAccentColor = UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0) // Cyan
        }
        
        // Get selected skin from customization
        let selectedSkin = SkinManager.getSelectedSkin()
        let skinColors = SkinManager.getSkinColors(skinName: selectedSkin, baseShipColor: baseShipColor, baseAccentColor: baseAccentColor)
        
        // Apply skin color tinting
        sprite.color = skinColors.shipColor
        sprite.colorBlendFactor = 0.6 // Blend 60% of skin color with original image
        
        // Apply skin effects (glow, pulse, shine, etc.)
        SkinManager.applySkinEffects(to: sprite, skinName: selectedSkin, colors: skinColors)
        
        ship.addChild(sprite)
        
        return ship
    }
    
    // MARK: - Player Ship Helper Methods
    
    // Create simple, clean upward-pointing triangle path (for player) - FIXED orientation
    private static func createSimpleTrianglePath(size: CGSize, scale: CGFloat) -> CGPath {
        let path = CGMutablePath()
        let w = size.width * scale
        let h = size.height * scale
        
        // Proper upward-pointing triangle (pointing UP - top point at top, wide base at bottom)
        // Start at bottom left
        path.move(to: CGPoint(x: -w / 2, y: -h / 2 + 5)) // Bottom left
        path.addLine(to: CGPoint(x: -w * 0.2, y: -h / 2)) // Bottom left inner
        path.addLine(to: CGPoint(x: w * 0.2, y: -h / 2)) // Bottom right inner
        path.addLine(to: CGPoint(x: w / 2, y: -h / 2 + 5)) // Bottom right
        path.addLine(to: CGPoint(x: 0, y: h / 2)) // Top point (center top)
        path.closeSubpath()
        
        return path
    }
    
    // Create enhanced upward-pointing triangle path (for player) - compatibility
    private static func createEnhancedTrianglePath(size: CGSize, scale: CGFloat) -> CGPath {
        return createSimpleTrianglePath(size: size, scale: scale)
    }
    
    static func createEnemyShip(size: CGSize, type: Enemy.EnemyType, variant: Int = 0) -> SKNode {
        let ship = SKNode()
        
        let palette = enemyPalette(for: type, variant: variant)
        let body = SKShapeNode(path: enemyBodyPath(size: size, type: type, variant: variant))
        body.fillColor = palette.body
        body.strokeColor = palette.stroke
        body.lineWidth = max(1.5, size.width * 0.055)
        body.glowWidth = type == .shooter ? 3 : 1.4
        body.zPosition = 2
        ship.addChild(body)
        
        let wingPath = enemyWingPath(size: size, type: type, variant: variant)
        switch type {
        case .basic, .fast, .shooter:
            let wings = SKShapeNode(path: wingPath)
            wings.fillColor = palette.wing
            wings.strokeColor = palette.stroke
            wings.lineWidth = max(1, size.width * 0.035)
            wings.zPosition = 1
            ship.addChild(wings)
        case .tank:
            let armor = SKShapeNode(rectOf: CGSize(width: size.width * 0.86, height: size.height * 0.46), cornerRadius: size.width * 0.12)
            armor.fillColor = palette.wing
            armor.strokeColor = palette.stroke
            armor.lineWidth = max(1, size.width * 0.035)
            armor.zPosition = 1
            ship.addChild(armor)
        }
        
        let cockpit = SKShapeNode(ellipseOf: CGSize(width: size.width * 0.24, height: size.height * 0.2))
        cockpit.position = CGPoint(x: 0, y: size.height * 0.08)
        cockpit.fillColor = palette.accent
        cockpit.strokeColor = .white.withAlphaComponent(0.75)
        cockpit.lineWidth = 1
        cockpit.glowWidth = 2
        cockpit.zPosition = 3
        ship.addChild(cockpit)
        
        let stripe = SKShapeNode(rectOf: CGSize(width: max(3, size.width * 0.12), height: size.height * 0.58), cornerRadius: 2)
        stripe.position = CGPoint(x: 0, y: -size.height * 0.03)
        stripe.fillColor = palette.accent.withAlphaComponent(0.82)
        stripe.strokeColor = .clear
        stripe.zPosition = 3
        ship.addChild(stripe)
        
        if type == .shooter {
            addEnemyCannons(to: ship, size: size, color: palette.accent)
        } else if type == .fast {
            addEnemyEngineTrails(to: ship, size: size, color: palette.accent)
        } else if type == .tank {
            addEnemyArmorBolts(to: ship, size: size, color: palette.accent)
        }
        
        ship.setScale(enemyScale(for: type, variant: variant))
        return ship
    }
    
    private static func enemyPalette(for type: Enemy.EnemyType, variant: Int) -> (body: UIColor, wing: UIColor, accent: UIColor, stroke: UIColor) {
        let index = abs(variant) % 3
        switch type {
        case .basic:
            let palettes = [
                (UIColor(red: 0.78, green: 0.08, blue: 0.16, alpha: 1), UIColor(red: 0.38, green: 0.03, blue: 0.08, alpha: 1), UIColor(red: 1.0, green: 0.72, blue: 0.18, alpha: 1), UIColor(red: 1.0, green: 0.35, blue: 0.38, alpha: 1)),
                (UIColor(red: 0.93, green: 0.22, blue: 0.08, alpha: 1), UIColor(red: 0.45, green: 0.08, blue: 0.03, alpha: 1), UIColor(red: 1.0, green: 0.88, blue: 0.28, alpha: 1), UIColor(red: 1.0, green: 0.52, blue: 0.28, alpha: 1)),
                (UIColor(red: 0.62, green: 0.02, blue: 0.20, alpha: 1), UIColor(red: 0.26, green: 0.01, blue: 0.10, alpha: 1), UIColor(red: 0.97, green: 0.36, blue: 0.75, alpha: 1), UIColor(red: 1.0, green: 0.35, blue: 0.62, alpha: 1))
            ]
            return palettes[index]
        case .fast:
            let palettes = [
                (UIColor(red: 0.67, green: 0.0, blue: 0.88, alpha: 1), UIColor(red: 0.20, green: 0.03, blue: 0.48, alpha: 1), UIColor(red: 0.27, green: 0.98, blue: 1.0, alpha: 1), UIColor(red: 0.89, green: 0.31, blue: 1.0, alpha: 1)),
                (UIColor(red: 0.07, green: 0.43, blue: 0.94, alpha: 1), UIColor(red: 0.02, green: 0.11, blue: 0.45, alpha: 1), UIColor(red: 0.24, green: 1.0, blue: 0.62, alpha: 1), UIColor(red: 0.24, green: 0.78, blue: 1.0, alpha: 1)),
                (UIColor(red: 0.08, green: 0.72, blue: 0.84, alpha: 1), UIColor(red: 0.02, green: 0.26, blue: 0.38, alpha: 1), UIColor(red: 1.0, green: 0.95, blue: 0.36, alpha: 1), UIColor(red: 0.30, green: 1.0, blue: 0.96, alpha: 1))
            ]
            return palettes[index]
        case .tank:
            let palettes = [
                (UIColor(red: 0.82, green: 0.44, blue: 0.06, alpha: 1), UIColor(red: 0.35, green: 0.24, blue: 0.12, alpha: 1), UIColor(red: 1.0, green: 0.82, blue: 0.18, alpha: 1), UIColor(red: 1.0, green: 0.61, blue: 0.18, alpha: 1)),
                (UIColor(red: 0.46, green: 0.48, blue: 0.55, alpha: 1), UIColor(red: 0.17, green: 0.18, blue: 0.24, alpha: 1), UIColor(red: 0.95, green: 0.24, blue: 0.24, alpha: 1), UIColor(red: 0.86, green: 0.86, blue: 0.92, alpha: 1)),
                (UIColor(red: 0.26, green: 0.52, blue: 0.18, alpha: 1), UIColor(red: 0.10, green: 0.25, blue: 0.12, alpha: 1), UIColor(red: 0.98, green: 0.70, blue: 0.12, alpha: 1), UIColor(red: 0.62, green: 0.95, blue: 0.32, alpha: 1))
            ]
            return palettes[index]
        case .shooter:
            let palettes = [
                (UIColor(red: 0.18, green: 0.20, blue: 0.78, alpha: 1), UIColor(red: 0.09, green: 0.09, blue: 0.35, alpha: 1), UIColor(red: 1.0, green: 0.22, blue: 0.82, alpha: 1), UIColor(red: 0.42, green: 0.68, blue: 1.0, alpha: 1)),
                (UIColor(red: 0.56, green: 0.12, blue: 0.68, alpha: 1), UIColor(red: 0.22, green: 0.04, blue: 0.34, alpha: 1), UIColor(red: 1.0, green: 0.44, blue: 0.20, alpha: 1), UIColor(red: 0.92, green: 0.44, blue: 1.0, alpha: 1)),
                (UIColor(red: 0.10, green: 0.58, blue: 0.50, alpha: 1), UIColor(red: 0.04, green: 0.24, blue: 0.26, alpha: 1), UIColor(red: 0.68, green: 1.0, blue: 0.22, alpha: 1), UIColor(red: 0.35, green: 1.0, blue: 0.80, alpha: 1))
            ]
            return palettes[index]
        }
    }
    
    private static func enemyBodyPath(size: CGSize, type: Enemy.EnemyType, variant: Int) -> CGPath {
        let path = CGMutablePath()
        let w = size.width
        let h = size.height
        let index = abs(variant) % 3
        
        switch type {
        case .basic:
            path.move(to: CGPoint(x: 0, y: -h * 0.48))
            path.addLine(to: CGPoint(x: w * 0.34, y: h * 0.18))
            path.addLine(to: CGPoint(x: w * 0.18, y: h * 0.44))
            path.addLine(to: CGPoint(x: -w * 0.18, y: h * 0.44))
            path.addLine(to: CGPoint(x: -w * 0.34, y: h * 0.18))
        case .fast:
            let nose = index == 1 ? h * 0.56 : h * 0.50
            path.move(to: CGPoint(x: 0, y: -nose))
            path.addLine(to: CGPoint(x: w * 0.22, y: h * 0.04))
            path.addLine(to: CGPoint(x: w * 0.12, y: h * 0.48))
            path.addLine(to: CGPoint(x: -w * 0.12, y: h * 0.48))
            path.addLine(to: CGPoint(x: -w * 0.22, y: h * 0.04))
        case .tank:
            path.move(to: CGPoint(x: 0, y: -h * 0.43))
            path.addLine(to: CGPoint(x: w * 0.38, y: -h * 0.16))
            path.addLine(to: CGPoint(x: w * 0.34, y: h * 0.34))
            path.addLine(to: CGPoint(x: w * 0.12, y: h * 0.48))
            path.addLine(to: CGPoint(x: -w * 0.12, y: h * 0.48))
            path.addLine(to: CGPoint(x: -w * 0.34, y: h * 0.34))
            path.addLine(to: CGPoint(x: -w * 0.38, y: -h * 0.16))
        case .shooter:
            path.move(to: CGPoint(x: 0, y: -h * 0.42))
            path.addLine(to: CGPoint(x: w * 0.28, y: -h * 0.10))
            path.addLine(to: CGPoint(x: w * 0.22, y: h * 0.42))
            path.addLine(to: CGPoint(x: 0, y: h * 0.52))
            path.addLine(to: CGPoint(x: -w * 0.22, y: h * 0.42))
            path.addLine(to: CGPoint(x: -w * 0.28, y: -h * 0.10))
        }
        
        path.closeSubpath()
        return path
    }
    
    private static func enemyWingPath(size: CGSize, type: Enemy.EnemyType, variant: Int) -> CGPath {
        let path = CGMutablePath()
        let w = size.width
        let h = size.height
        let index = abs(variant) % 3
        
        switch type {
        case .basic:
            let span = index == 2 ? w * 0.62 : w * 0.52
            path.move(to: CGPoint(x: -w * 0.18, y: h * 0.18))
            path.addLine(to: CGPoint(x: -span, y: h * 0.02))
            path.addLine(to: CGPoint(x: -w * 0.28, y: -h * 0.22))
            path.move(to: CGPoint(x: w * 0.18, y: h * 0.18))
            path.addLine(to: CGPoint(x: span, y: h * 0.02))
            path.addLine(to: CGPoint(x: w * 0.28, y: -h * 0.22))
        case .fast:
            path.move(to: CGPoint(x: -w * 0.12, y: h * 0.20))
            path.addLine(to: CGPoint(x: -w * 0.58, y: h * 0.34))
            path.addLine(to: CGPoint(x: -w * 0.20, y: -h * 0.08))
            path.move(to: CGPoint(x: w * 0.12, y: h * 0.20))
            path.addLine(to: CGPoint(x: w * 0.58, y: h * 0.34))
            path.addLine(to: CGPoint(x: w * 0.20, y: -h * 0.08))
        case .tank:
            break
        case .shooter:
            path.move(to: CGPoint(x: -w * 0.22, y: h * 0.18))
            path.addLine(to: CGPoint(x: -w * 0.56, y: h * 0.24))
            path.addLine(to: CGPoint(x: -w * 0.48, y: -h * 0.18))
            path.addLine(to: CGPoint(x: -w * 0.18, y: -h * 0.06))
            path.move(to: CGPoint(x: w * 0.22, y: h * 0.18))
            path.addLine(to: CGPoint(x: w * 0.56, y: h * 0.24))
            path.addLine(to: CGPoint(x: w * 0.48, y: -h * 0.18))
            path.addLine(to: CGPoint(x: w * 0.18, y: -h * 0.06))
        }
        
        return path
    }
    
    private static func addEnemyCannons(to ship: SKNode, size: CGSize, color: UIColor) {
        for x in [-size.width * 0.22, size.width * 0.22] {
            let cannon = SKShapeNode(rectOf: CGSize(width: size.width * 0.12, height: size.height * 0.38), cornerRadius: size.width * 0.04)
            cannon.position = CGPoint(x: x, y: -size.height * 0.18)
            cannon.fillColor = color
            cannon.strokeColor = .white.withAlphaComponent(0.7)
            cannon.lineWidth = 1
            cannon.zPosition = 4
            ship.addChild(cannon)
        }
    }
    
    private static func addEnemyEngineTrails(to ship: SKNode, size: CGSize, color: UIColor) {
        for x in [-size.width * 0.12, size.width * 0.12] {
            let trail = SKShapeNode(ellipseOf: CGSize(width: size.width * 0.12, height: size.height * 0.2))
            trail.position = CGPoint(x: x, y: size.height * 0.46)
            trail.fillColor = color.withAlphaComponent(0.8)
            trail.strokeColor = .clear
            trail.glowWidth = 4
            trail.zPosition = 0
            ship.addChild(trail)
        }
    }
    
    private static func addEnemyArmorBolts(to ship: SKNode, size: CGSize, color: UIColor) {
        for x in [-size.width * 0.22, size.width * 0.22] {
            for y in [-size.height * 0.05, size.height * 0.20] {
                let bolt = SKShapeNode(circleOfRadius: max(2, size.width * 0.045))
                bolt.position = CGPoint(x: x, y: y)
                bolt.fillColor = color
                bolt.strokeColor = .clear
                bolt.zPosition = 4
                ship.addChild(bolt)
            }
        }
    }
    
    private static func enemyScale(for type: Enemy.EnemyType, variant: Int) -> CGFloat {
        let index = abs(variant) % 3
        switch type {
        case .basic:
            return [1.0, 0.94, 1.06][index]
        case .fast:
            return [0.92, 1.0, 0.96][index]
        case .tank:
            return [1.04, 1.12, 1.0][index]
        case .shooter:
            return [1.0, 1.05, 0.98][index]
        }
    }
    
    static func createBossShip(size: CGSize) -> SKNode {
        let ship = SKNode()
        
        // Select random boss ship design from available assets (1-10)
        let bossShips = ["boss_ship_1", "boss_ship_2", "boss_ship_3", "boss_ship_4", "boss_ship_5", "boss_ship_6", "boss_ship_7", "boss_ship_8", "boss_ship_9", "boss_ship_10"]
        let imageName = bossShips.randomElement() ?? "boss_ship_1"
        
        // Try to load the boss ship image from assets
        guard let image = UIImage(named: imageName) else {
            // Fallback: create a simple colored shape if image not found
            let fallback = SKShapeNode(rect: CGRect(origin: CGPoint(x: -size.width/2, y: -size.height/2), size: size))
            fallback.fillColor = UIColor(red: 0.8, green: 0.0, blue: 0.2, alpha: 1.0) // dark red
            fallback.strokeColor = UIColor(red: 1.0, green: 0.0, blue: 0.5, alpha: 1.0) // magenta
            fallback.lineWidth = 3
            ship.addChild(fallback)
            return ship
        }
        
        // Create sprite node with the boss ship image
        let texture = SKTexture(image: image)
        let sprite = SKSpriteNode(texture: texture)
        
        // Scale to fit the requested size while maintaining aspect ratio
        let imageAspect = image.size.width / image.size.height
        let targetAspect = size.width / size.height
        
        var finalSize = size
        if imageAspect > targetAspect {
            // Image is wider - fit to height
            finalSize = CGSize(width: size.height * imageAspect, height: size.height)
        } else {
            // Image is taller - fit to width
            finalSize = CGSize(width: size.width, height: size.width / imageAspect)
        }
        
        sprite.size = finalSize
        sprite.zPosition = 1
        
        // Add subtle glow effect for boss presence
        let glow = SKShapeNode(rect: CGRect(
            x: -finalSize.width/2 - 10,
            y: -finalSize.height/2 - 10,
            width: finalSize.width + 20,
            height: finalSize.height + 20
        ), cornerRadius: 15)
        glow.fillColor = UIColor(red: 1.0, green: 0.3, blue: 0.0, alpha: 0.2) // orange-red glow
        glow.strokeColor = .clear
        glow.zPosition = -1
        
        ship.addChild(glow)
        ship.addChild(sprite)
        
        return ship
    }
    
    // MARK: - Boss Ship Helper Methods
    
    private enum WingSide {
        case left, right
    }
    
    // Create boss body path (hexagonal/octagonal shape)
    private static func createBossBodyPath(size: CGSize) -> CGPath {
        let path = CGMutablePath()
        let w = size.width
        let h = size.height
        
        // Create an octagonal shape for more interesting silhouette
        let points: [CGPoint] = [
            CGPoint(x: 0, y: h * 0.4), // Top
            CGPoint(x: w * 0.3, y: h * 0.35), // Top-right
            CGPoint(x: w * 0.4, y: 0), // Right
            CGPoint(x: w * 0.3, y: -h * 0.35), // Bottom-right
            CGPoint(x: 0, y: -h * 0.4), // Bottom
            CGPoint(x: -w * 0.3, y: -h * 0.35), // Bottom-left
            CGPoint(x: -w * 0.4, y: 0), // Left
            CGPoint(x: -w * 0.3, y: h * 0.35) // Top-left
        ]
        
        path.move(to: points[0])
        for i in 1..<points.count {
            path.addLine(to: points[i])
        }
        path.closeSubpath()
        
        return path
    }
    
    // Create boss wing (asymmetrical design)
    private static func createBossWing(size: CGSize, side: WingSide) -> SKShapeNode {
        let path = CGMutablePath()
        let w = size.width
        let h = size.height
        let offset: CGFloat = side == .left ? -1 : 1
        
        // Create wing shape extending from the side
        path.move(to: CGPoint(x: offset * w * 0.35, y: h * 0.2))
        path.addLine(to: CGPoint(x: offset * w * 0.6, y: h * 0.15))
        path.addLine(to: CGPoint(x: offset * w * 0.7, y: 0))
        path.addLine(to: CGPoint(x: offset * w * 0.6, y: -h * 0.15))
        path.addLine(to: CGPoint(x: offset * w * 0.35, y: -h * 0.2))
        path.addLine(to: CGPoint(x: offset * w * 0.4, y: 0))
        path.closeSubpath()
        
        let wing = SKShapeNode(path: path)
        return wing
    }
    
    // MARK: - Helper Methods
    
    // Create upward-pointing triangle path (for player) - FIXED orientation
    private static func createTrianglePath(size: CGSize, scale: CGFloat) -> CGPath {
        // Use the corrected createSimpleTrianglePath function
        return createSimpleTrianglePath(size: size, scale: scale)
    }
    
    // Create downward-pointing triangle path (for enemies) - FIXED to proper triangle
    private static func createInvertedTrianglePath(size: CGSize, scale: CGFloat) -> CGPath {
        let path = CGMutablePath()
        let w = size.width * scale
        let h = size.height * scale
        
        // Proper downward-pointing triangle (pointing down to bottom)
        // Start at top left
        path.move(to: CGPoint(x: -w / 2, y: h / 2 - 5)) // Top left
        path.addLine(to: CGPoint(x: -w * 0.2, y: h / 2)) // Top left inner
        path.addLine(to: CGPoint(x: w * 0.2, y: h / 2)) // Top right inner
        path.addLine(to: CGPoint(x: w / 2, y: h / 2 - 5)) // Top right
        path.addLine(to: CGPoint(x: 0, y: -h / 2)) // Bottom point (center bottom)
        path.closeSubpath()
        
        return path
    }
}
