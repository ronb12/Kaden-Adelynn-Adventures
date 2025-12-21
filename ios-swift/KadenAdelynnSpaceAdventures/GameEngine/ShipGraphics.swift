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
        
        // Add pink tint for Adelynn's ship
        if shipId.lowercased() == "adelynn" || characterId.lowercased() == "adelynn" {
            sprite.color = UIColor(red: 1.0, green: 0.4, blue: 0.8, alpha: 1.0) // Pink
            sprite.colorBlendFactor = 0.4 // Blend 40% pink with original image
        }
        
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
        
        // Boss ship colors - menacing red/magenta theme
        let bossColor = UIColor(red: 0.8, green: 0.0, blue: 0.2, alpha: 1.0) // dark red
        let accentColor = UIColor(red: 1.0, green: 0.0, blue: 0.5, alpha: 1.0) // magenta
        let glowColor = UIColor(red: 1.0, green: 0.3, blue: 0.0, alpha: 1.0) // orange-red
        let coreColor = UIColor(red: 1.0, green: 0.8, blue: 0.0, alpha: 1.0) // yellow-orange
        
        // Outer glow layers for menacing presence
        for i in 1...3 {
            let glowSize = CGFloat(i) * 8
            let glow = SKShapeNode(rect: CGRect(
                x: -size.width/2 - glowSize,
                y: -size.height/2 - glowSize,
                width: size.width + glowSize * 2,
                height: size.height + glowSize * 2
            ), cornerRadius: 15)
            glow.fillColor = glowColor.withAlphaComponent(0.15 / CGFloat(i))
            glow.strokeColor = .clear
            glow.zPosition = CGFloat(-i)
            ship.addChild(glow)
        }
        
        // Main central body (hexagonal/octagonal shape for more interesting silhouette)
        let bodyPath = createBossBodyPath(size: size)
        let mainBody = SKShapeNode(path: bodyPath)
        mainBody.fillColor = bossColor
        mainBody.strokeColor = accentColor
        mainBody.lineWidth = 3
        mainBody.zPosition = 0
        ship.addChild(mainBody)
        
        // Central core (glowing energy source)
        let coreSize = size.width * 0.3
        let core = SKShapeNode(circleOfRadius: coreSize / 2)
        core.fillColor = coreColor
        core.strokeColor = .clear
        core.position = CGPoint(x: 0, y: 0)
        core.zPosition = 2
        
        // Core pulsing glow
        let coreGlow = SKShapeNode(circleOfRadius: coreSize / 2 + 5)
        coreGlow.fillColor = coreColor.withAlphaComponent(0.6)
        coreGlow.strokeColor = .clear
        coreGlow.zPosition = 1
        ship.addChild(coreGlow)
        ship.addChild(core)
        
        // Left wing section
        let leftWing = createBossWing(size: size, side: .left)
        leftWing.fillColor = bossColor
        leftWing.strokeColor = accentColor
        leftWing.lineWidth = 2
        leftWing.zPosition = 0
        ship.addChild(leftWing)
        
        // Right wing section
        let rightWing = createBossWing(size: size, side: .right)
        rightWing.fillColor = bossColor
        rightWing.strokeColor = accentColor
        rightWing.lineWidth = 2
        rightWing.zPosition = 0
        ship.addChild(rightWing)
        
        // Weapon turrets (4 total - top, bottom, left, right)
        let turretSize = size.width * 0.15
        let turretPositions: [CGPoint] = [
            CGPoint(x: 0, y: size.height * 0.4), // Top
            CGPoint(x: 0, y: -size.height * 0.4), // Bottom
            CGPoint(x: -size.width * 0.4, y: 0), // Left
            CGPoint(x: size.width * 0.4, y: 0) // Right
        ]
        
        for pos in turretPositions {
            // Turret base
            let turret = SKShapeNode(circleOfRadius: turretSize / 2)
            turret.fillColor = bossColor
            turret.strokeColor = accentColor
            turret.lineWidth = 2
            turret.position = pos
            turret.zPosition = 1
            ship.addChild(turret)
            
            // Turret glow
            let turretGlow = SKShapeNode(circleOfRadius: turretSize / 2 + 3)
            turretGlow.fillColor = accentColor.withAlphaComponent(0.4)
            turretGlow.strokeColor = .clear
            turretGlow.position = pos
            turretGlow.zPosition = 0
            ship.addChild(turretGlow)
            
            // Turret barrel
            let barrel = SKShapeNode(rect: CGRect(
                x: -turretSize * 0.3,
                y: -turretSize * 0.1,
                width: turretSize * 0.6,
                height: turretSize * 0.2
            ))
            barrel.fillColor = accentColor
            barrel.strokeColor = .clear
            barrel.position = CGPoint(x: pos.x, y: pos.y + turretSize * 0.3)
            barrel.zPosition = 2
            ship.addChild(barrel)
        }
        
        // Side panels/details for more complexity
        for i in 0..<3 {
            let panelY = CGFloat(i) - 1.0 * size.height * 0.25
            let panel = SKShapeNode(rect: CGRect(
                x: -size.width * 0.45,
                y: -size.height * 0.08,
                width: size.width * 0.15,
                height: size.height * 0.16
            ))
            panel.fillColor = accentColor.withAlphaComponent(0.6)
            panel.strokeColor = accentColor
            panel.lineWidth = 1
            panel.position = CGPoint(x: 0, y: panelY)
            panel.zPosition = 1
            ship.addChild(panel)
        }
        
        // Bottom thruster/exhaust ports
        let thrusterCount = 3
        for i in 0..<thrusterCount {
            let thrusterX = (CGFloat(i) - 1.0) * size.width * 0.2
            let thruster = SKShapeNode(rect: CGRect(
                x: -size.width * 0.08,
                y: -size.height * 0.5,
                width: size.width * 0.16,
                height: size.height * 0.15
            ))
            thruster.fillColor = glowColor
            thruster.strokeColor = .clear
            thruster.position = CGPoint(x: thrusterX, y: 0)
            thruster.zPosition = 1
            ship.addChild(thruster)
            
            // Thruster glow
            let thrusterGlow = SKShapeNode(rect: CGRect(
                x: -size.width * 0.1,
                y: -size.height * 0.5,
                width: size.width * 0.2,
                height: size.height * 0.2
            ))
            thrusterGlow.fillColor = glowColor.withAlphaComponent(0.5)
            thrusterGlow.strokeColor = .clear
            thrusterGlow.position = CGPoint(x: thrusterX, y: -size.height * 0.05)
            thrusterGlow.zPosition = 0
            ship.addChild(thrusterGlow)
        }
        
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
