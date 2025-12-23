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
    
    static func createEnemyShip(size: CGSize, type: Enemy.EnemyType) -> SKNode {
        let ship = SKNode()
        
        // Select different enemy ship designs based on type
        // Use new enemy ship sprites for visual variety
        let imageName: String
        switch type {
        case .basic:
            // Basic enemies: use enemy ships 1-3 for variety
            let basicShips = ["enemy_ship_1", "enemy_ship_2", "enemy_ship_3"]
            imageName = basicShips.randomElement() ?? "enemy_ship_1"
        case .fast:
            // Fast enemies: use enemy ships 4-5 (sleeker designs)
            let fastShips = ["enemy_ship_4", "enemy_ship_5"]
            imageName = fastShips.randomElement() ?? "enemy_ship_4"
        case .tank:
            // Tank enemies: use enemy ships 6-7 (heavier designs)
            let tankShips = ["enemy_ship_6", "enemy_ship_7"]
            imageName = tankShips.randomElement() ?? "enemy_ship_6"
        case .shooter:
            // Shooter enemies: use enemy ships 8-10 (specialized designs)
            let shooterShips = ["enemy_ship_8", "enemy_ship_9", "enemy_ship_10"]
            imageName = shooterShips.randomElement() ?? "enemy_ship_8"
        }
        
        // Try to load the image from assets
        guard let image = UIImage(named: imageName) else {
            // Fallback: try EnemyEvilEye images if spaceship not found
            let fallbackName = type == .fast || type == .tank ? "EnemyEvilEye_2" : "EnemyEvilEye_1"
            guard let fallbackImage = UIImage(named: fallbackName) else {
                // Final fallback: create a simple colored shape
                let fallback = SKShapeNode(rect: CGRect(origin: CGPoint(x: -size.width/2, y: -size.height/2), size: size))
                fallback.fillColor = .red
                fallback.strokeColor = .white
                ship.addChild(fallback)
                return ship
            }
            let texture = SKTexture(image: fallbackImage)
            let sprite = SKSpriteNode(texture: texture)
            sprite.size = size
            sprite.zPosition = 1
            
            // Add color tint based on enemy type
            switch type {
            case .fast:
                sprite.color = UIColor(red: 1.0, green: 0.0, blue: 1.0, alpha: 1.0) // Magenta
                sprite.colorBlendFactor = 0.5
            case .tank:
                sprite.color = UIColor(red: 1.0, green: 0.65, blue: 0.0, alpha: 1.0) // Orange
                sprite.colorBlendFactor = 0.5
            case .shooter:
                sprite.color = UIColor(red: 0.6, green: 0.6, blue: 0.6, alpha: 1.0) // Grey
                sprite.colorBlendFactor = 0.5
            default:
                sprite.color = UIColor(red: 1.0, green: 0.3, blue: 0.3, alpha: 1.0) // Red
                sprite.colorBlendFactor = 0.3
            }
            ship.addChild(sprite)
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
        
        // Add color tint based on enemy type for visual distinction
        switch type {
        case .fast:
            sprite.color = UIColor(red: 1.0, green: 0.0, blue: 1.0, alpha: 1.0) // Magenta
            sprite.colorBlendFactor = 0.4
        case .tank:
            sprite.color = UIColor(red: 1.0, green: 0.65, blue: 0.0, alpha: 1.0) // Orange
            sprite.colorBlendFactor = 0.4
        case .shooter:
            sprite.color = UIColor(red: 0.5, green: 0.5, blue: 0.7, alpha: 1.0) // Blue-grey
            sprite.colorBlendFactor = 0.4
        default:
            sprite.color = UIColor(red: 1.0, green: 0.3, blue: 0.3, alpha: 1.0) // Red
            sprite.colorBlendFactor = 0.3
        }
        
        ship.addChild(sprite)
        
        return ship
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
