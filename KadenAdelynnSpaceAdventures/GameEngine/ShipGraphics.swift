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
            // Image is wider - fit to width
            finalSize = CGSize(width: size.width, height: size.width / imageAspect)
        } else {
            // Image is taller - fit to height
            finalSize = CGSize(width: size.height * imageAspect, height: size.height)
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

        if let image = UIImage(named: enemySpaceshipImageName(for: type, variant: variant)) {
            let texture = SKTexture(image: image)
            let sprite = SKSpriteNode(texture: texture)
            sprite.size = fittedSize(for: image.size, target: size)
            sprite.zRotation = .pi
            sprite.color = palette.body
            sprite.colorBlendFactor = enemySpriteTintStrength(for: type)
            sprite.zPosition = 2

            let glow = SKShapeNode(ellipseOf: CGSize(width: sprite.size.width * 0.82, height: sprite.size.height * 0.92))
            glow.fillColor = palette.stroke.withAlphaComponent(0.13)
            glow.strokeColor = palette.stroke.withAlphaComponent(0.48)
            glow.lineWidth = max(0.8, size.width * 0.022)
            glow.glowWidth = type == .tank ? 4 : 2.5
            glow.zPosition = 0
            ship.addChild(glow)

            ship.addChild(sprite)
            addEnemyHullMarkings(to: ship, size: sprite.size, type: type, palette: palette)

            switch type {
            case .basic:
                addEnemyEngineTrails(to: ship, size: sprite.size, color: palette.accent)
            case .fast:
                addEnemySpeedFins(to: ship, size: sprite.size, color: palette.stroke)
                addEnemyEngineTrails(to: ship, size: sprite.size, color: palette.accent)
            case .tank:
                addEnemyArmorPlates(to: ship, size: sprite.size, palette: palette)
                addEnemyArmorBolts(to: ship, size: sprite.size, color: palette.accent)
            case .shooter:
                addEnemyCannons(to: ship, size: sprite.size, color: palette.accent)
                addEnemyTargetingArray(to: ship, size: sprite.size, color: palette.stroke)
            }

            ship.setScale(enemyScale(for: type, variant: variant))
            return ship
        }

        let body = SKShapeNode(path: enemyBodyPath(size: size, type: type, variant: variant))
        body.fillColor = palette.body
        body.strokeColor = palette.stroke.withAlphaComponent(0.9)
        body.lineWidth = max(1.2, size.width * 0.04)
        body.glowWidth = type == .shooter ? 1.4 : 0.7
        body.zPosition = 2

        let shadow = SKShapeNode(path: enemyBodyPath(size: CGSize(width: size.width * 1.08, height: size.height * 1.08), type: type, variant: variant))
        shadow.fillColor = palette.stroke.withAlphaComponent(0.12)
        shadow.strokeColor = .clear
        shadow.glowWidth = 3
        shadow.zPosition = 0
        ship.addChild(shadow)
        ship.addChild(body)
        
        let wingPath = enemyWingPath(size: size, type: type, variant: variant)
        switch type {
        case .basic, .fast, .shooter:
            let wings = SKShapeNode(path: wingPath)
            wings.fillColor = palette.wing
            wings.strokeColor = palette.stroke.withAlphaComponent(0.76)
            wings.lineWidth = max(1, size.width * 0.028)
            wings.zPosition = 1
            ship.addChild(wings)
        case .tank:
            let armor = SKShapeNode(rectOf: CGSize(width: size.width * 0.86, height: size.height * 0.42), cornerRadius: size.width * 0.05)
            armor.fillColor = palette.wing
            armor.strokeColor = palette.stroke.withAlphaComponent(0.75)
            armor.lineWidth = max(1, size.width * 0.028)
            armor.zPosition = 1
            ship.addChild(armor)
        }
        
        let cockpit = SKShapeNode(ellipseOf: CGSize(width: size.width * 0.18, height: size.height * 0.16))
        cockpit.position = CGPoint(x: 0, y: size.height * 0.04)
        cockpit.fillColor = palette.accent.withAlphaComponent(0.78)
        cockpit.strokeColor = palette.stroke.withAlphaComponent(0.8)
        cockpit.lineWidth = 0.8
        cockpit.glowWidth = 1.2
        cockpit.zPosition = 3
        ship.addChild(cockpit)
        
        let stripe = SKShapeNode(rectOf: CGSize(width: max(2, size.width * 0.07), height: size.height * 0.54), cornerRadius: 1)
        stripe.position = CGPoint(x: 0, y: -size.height * 0.03)
        stripe.fillColor = palette.accent.withAlphaComponent(0.36)
        stripe.strokeColor = .clear
        stripe.zPosition = 3
        ship.addChild(stripe)

        addEnemyPanelLines(to: ship, size: size, type: type, palette: palette)
        
        if type == .shooter {
            addEnemyCannons(to: ship, size: size, color: palette.accent)
            addEnemyTargetingArray(to: ship, size: size, color: palette.stroke)
        } else if type == .fast {
            addEnemySpeedFins(to: ship, size: size, color: palette.stroke)
            addEnemyEngineTrails(to: ship, size: size, color: palette.accent)
        } else if type == .tank {
            addEnemyArmorPlates(to: ship, size: size, palette: palette)
            addEnemyArmorBolts(to: ship, size: size, color: palette.accent)
        }
        
        ship.setScale(enemyScale(for: type, variant: variant))
        return ship
    }

    private static func enemySpaceshipImageName(for type: Enemy.EnemyType, variant: Int) -> String {
        let index = abs(variant)
        switch type {
        case .basic:
            return ["Spaceship_2", "Spaceship_3", "Spaceship_10"][index % 3]
        case .fast:
            return ["Spaceship_8", "Spaceship_9", "Spaceship_12"][index % 3]
        case .tank:
            return ["Spaceship_5", "Spaceship_13", "Spaceship_7"][index % 3]
        case .shooter:
            return ["Spaceship_4", "Spaceship_6", "Spaceship_11"][index % 3]
        }
    }

    private static func fittedSize(for imageSize: CGSize, target: CGSize) -> CGSize {
        guard imageSize.width > 0, imageSize.height > 0 else { return target }
        let imageAspect = imageSize.width / imageSize.height
        let targetAspect = target.width / target.height
        if imageAspect > targetAspect {
            return CGSize(width: target.width, height: target.width / imageAspect)
        }
        return CGSize(width: target.height * imageAspect, height: target.height)
    }

    private static func enemySpriteTintStrength(for type: Enemy.EnemyType) -> CGFloat {
        switch type {
        case .basic: return 0.58
        case .fast: return 0.50
        case .tank: return 0.62
        case .shooter: return 0.54
        }
    }

    private static func addEnemyHullMarkings(
        to ship: SKNode,
        size: CGSize,
        type: Enemy.EnemyType,
        palette: (body: UIColor, wing: UIColor, accent: UIColor, stroke: UIColor)
    ) {
        let core = SKShapeNode(circleOfRadius: max(2.5, size.width * 0.055))
        core.position = CGPoint(x: 0, y: -size.height * 0.08)
        core.fillColor = palette.accent.withAlphaComponent(0.82)
        core.strokeColor = UIColor.black.withAlphaComponent(0.55)
        core.lineWidth = 0.8
        core.glowWidth = 2
        core.zPosition = 5
        ship.addChild(core)

        let slashCount = type == .tank ? 3 : 2
        for index in 0..<slashCount {
            let slash = SKShapeNode(rectOf: CGSize(width: max(1.5, size.width * 0.035), height: size.height * 0.28), cornerRadius: 0.5)
            slash.position = CGPoint(
                x: CGFloat(index - slashCount / 2) * size.width * 0.12,
                y: size.height * 0.04
            )
            slash.zRotation = CGFloat(index % 2 == 0 ? 0.34 : -0.34)
            slash.fillColor = palette.accent.withAlphaComponent(0.34)
            slash.strokeColor = palette.stroke.withAlphaComponent(0.48)
            slash.lineWidth = 0.5
            slash.zPosition = 5
            ship.addChild(slash)
        }
    }

    private static func enemyPalette(for type: Enemy.EnemyType, variant: Int) -> (body: UIColor, wing: UIColor, accent: UIColor, stroke: UIColor) {
        let index = abs(variant) % 3
        switch type {
        case .basic:
            let palettes = [
                (UIColor(red: 0.36, green: 0.04, blue: 0.08, alpha: 1), UIColor(red: 0.14, green: 0.02, blue: 0.04, alpha: 1), UIColor(red: 0.92, green: 0.20, blue: 0.16, alpha: 1), UIColor(red: 0.72, green: 0.18, blue: 0.18, alpha: 1)),
                (UIColor(red: 0.42, green: 0.12, blue: 0.05, alpha: 1), UIColor(red: 0.16, green: 0.05, blue: 0.03, alpha: 1), UIColor(red: 0.98, green: 0.45, blue: 0.12, alpha: 1), UIColor(red: 0.76, green: 0.34, blue: 0.16, alpha: 1)),
                (UIColor(red: 0.30, green: 0.02, blue: 0.12, alpha: 1), UIColor(red: 0.12, green: 0.01, blue: 0.06, alpha: 1), UIColor(red: 0.82, green: 0.18, blue: 0.46, alpha: 1), UIColor(red: 0.65, green: 0.18, blue: 0.36, alpha: 1))
            ]
            return palettes[index]
        case .fast:
            let palettes = [
                (UIColor(red: 0.26, green: 0.04, blue: 0.42, alpha: 1), UIColor(red: 0.10, green: 0.02, blue: 0.23, alpha: 1), UIColor(red: 0.44, green: 0.76, blue: 0.92, alpha: 1), UIColor(red: 0.45, green: 0.25, blue: 0.74, alpha: 1)),
                (UIColor(red: 0.04, green: 0.18, blue: 0.42, alpha: 1), UIColor(red: 0.02, green: 0.07, blue: 0.20, alpha: 1), UIColor(red: 0.28, green: 0.74, blue: 0.64, alpha: 1), UIColor(red: 0.20, green: 0.45, blue: 0.74, alpha: 1)),
                (UIColor(red: 0.02, green: 0.28, blue: 0.34, alpha: 1), UIColor(red: 0.01, green: 0.12, blue: 0.17, alpha: 1), UIColor(red: 0.82, green: 0.70, blue: 0.26, alpha: 1), UIColor(red: 0.20, green: 0.62, blue: 0.62, alpha: 1))
            ]
            return palettes[index]
        case .tank:
            let palettes = [
                (UIColor(red: 0.38, green: 0.25, blue: 0.10, alpha: 1), UIColor(red: 0.17, green: 0.12, blue: 0.08, alpha: 1), UIColor(red: 0.88, green: 0.55, blue: 0.12, alpha: 1), UIColor(red: 0.64, green: 0.48, blue: 0.26, alpha: 1)),
                (UIColor(red: 0.26, green: 0.28, blue: 0.34, alpha: 1), UIColor(red: 0.11, green: 0.12, blue: 0.17, alpha: 1), UIColor(red: 0.82, green: 0.18, blue: 0.18, alpha: 1), UIColor(red: 0.56, green: 0.60, blue: 0.70, alpha: 1)),
                (UIColor(red: 0.15, green: 0.30, blue: 0.18, alpha: 1), UIColor(red: 0.06, green: 0.14, blue: 0.09, alpha: 1), UIColor(red: 0.78, green: 0.48, blue: 0.12, alpha: 1), UIColor(red: 0.35, green: 0.56, blue: 0.30, alpha: 1))
            ]
            return palettes[index]
        case .shooter:
            let palettes = [
                (UIColor(red: 0.09, green: 0.10, blue: 0.42, alpha: 1), UIColor(red: 0.04, green: 0.04, blue: 0.20, alpha: 1), UIColor(red: 0.82, green: 0.22, blue: 0.56, alpha: 1), UIColor(red: 0.24, green: 0.42, blue: 0.74, alpha: 1)),
                (UIColor(red: 0.31, green: 0.08, blue: 0.39, alpha: 1), UIColor(red: 0.12, green: 0.03, blue: 0.19, alpha: 1), UIColor(red: 0.92, green: 0.32, blue: 0.16, alpha: 1), UIColor(red: 0.55, green: 0.28, blue: 0.68, alpha: 1)),
                (UIColor(red: 0.05, green: 0.31, blue: 0.28, alpha: 1), UIColor(red: 0.02, green: 0.14, blue: 0.15, alpha: 1), UIColor(red: 0.52, green: 0.78, blue: 0.24, alpha: 1), UIColor(red: 0.20, green: 0.58, blue: 0.48, alpha: 1))
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
            let cannon = SKShapeNode(rectOf: CGSize(width: size.width * 0.10, height: size.height * 0.38), cornerRadius: size.width * 0.015)
            cannon.position = CGPoint(x: x, y: -size.height * 0.18)
            cannon.fillColor = color.withAlphaComponent(0.56)
            cannon.strokeColor = UIColor.black.withAlphaComponent(0.55)
            cannon.lineWidth = 0.8
            cannon.zPosition = 4
            ship.addChild(cannon)
        }
    }

    private static func addEnemySpeedFins(to ship: SKNode, size: CGSize, color: UIColor) {
        for side in [-1.0, 1.0] as [CGFloat] {
            let path = CGMutablePath()
            path.move(to: CGPoint(x: side * size.width * 0.18, y: size.height * 0.08))
            path.addLine(to: CGPoint(x: side * size.width * 0.58, y: size.height * 0.25))
            path.addLine(to: CGPoint(x: side * size.width * 0.28, y: -size.height * 0.28))
            path.closeSubpath()

            let fin = SKShapeNode(path: path)
            fin.fillColor = color.withAlphaComponent(0.18)
            fin.strokeColor = color.withAlphaComponent(0.66)
            fin.lineWidth = 1.2
            fin.glowWidth = 1.2
            fin.zPosition = 1
            ship.addChild(fin)
        }
    }

    private static func addEnemyPanelLines(
        to ship: SKNode,
        size: CGSize,
        type: Enemy.EnemyType,
        palette: (body: UIColor, wing: UIColor, accent: UIColor, stroke: UIColor)
    ) {
        let panelCount = type == .tank ? 3 : 2
        for index in 0..<panelCount {
            let xOffset = CGFloat(index - (panelCount - 1) / 2) * size.width * 0.16
            let panel = SKShapeNode(rectOf: CGSize(width: max(1.4, size.width * 0.035), height: size.height * 0.42), cornerRadius: 0.5)
            panel.position = CGPoint(x: xOffset, y: size.height * 0.02)
            panel.zRotation = CGFloat(index % 2 == 0 ? -0.16 : 0.16)
            panel.fillColor = UIColor.black.withAlphaComponent(0.26)
            panel.strokeColor = palette.stroke.withAlphaComponent(0.36)
            panel.lineWidth = 0.6
            panel.zPosition = 4
            ship.addChild(panel)
        }

        for side in [-1.0, 1.0] as [CGFloat] {
            let edge = SKShapeNode(rectOf: CGSize(width: size.width * 0.06, height: size.height * 0.24), cornerRadius: 0.5)
            edge.position = CGPoint(x: side * size.width * 0.29, y: -size.height * 0.04)
            edge.zRotation = side * 0.45
            edge.fillColor = palette.accent.withAlphaComponent(0.22)
            edge.strokeColor = palette.stroke.withAlphaComponent(0.45)
            edge.lineWidth = 0.6
            edge.zPosition = 4
            ship.addChild(edge)
        }
    }
    
    private static func addEnemyEngineTrails(to ship: SKNode, size: CGSize, color: UIColor) {
        for x in [-size.width * 0.12, size.width * 0.12] {
            let trail = SKShapeNode(ellipseOf: CGSize(width: size.width * 0.12, height: size.height * 0.2))
            trail.position = CGPoint(x: x, y: size.height * 0.46)
            trail.fillColor = color.withAlphaComponent(0.38)
            trail.strokeColor = .clear
            trail.glowWidth = 2
            trail.zPosition = 0
            ship.addChild(trail)
        }
    }
    
    private static func addEnemyArmorBolts(to ship: SKNode, size: CGSize, color: UIColor) {
        for x in [-size.width * 0.22, size.width * 0.22] {
            for y in [-size.height * 0.05, size.height * 0.20] {
                let bolt = SKShapeNode(circleOfRadius: max(1.4, size.width * 0.034))
                bolt.position = CGPoint(x: x, y: y)
                bolt.fillColor = color.withAlphaComponent(0.64)
                bolt.strokeColor = .clear
                bolt.zPosition = 4
                ship.addChild(bolt)
            }
        }
    }

    private static func addEnemyArmorPlates(
        to ship: SKNode,
        size: CGSize,
        palette: (body: UIColor, wing: UIColor, accent: UIColor, stroke: UIColor)
    ) {
        for y in [-size.height * 0.16, size.height * 0.14] {
            let plate = SKShapeNode(rectOf: CGSize(width: size.width * 0.74, height: size.height * 0.10), cornerRadius: 1)
            plate.position = CGPoint(x: 0, y: y)
            plate.fillColor = palette.wing.withAlphaComponent(0.72)
            plate.strokeColor = palette.stroke.withAlphaComponent(0.5)
            plate.lineWidth = 0.8
            plate.glowWidth = 0.6
            plate.zPosition = 4
            ship.addChild(plate)
        }
    }

    private static func addEnemyTargetingArray(to ship: SKNode, size: CGSize, color: UIColor) {
        let reticle = SKShapeNode(circleOfRadius: max(6, size.width * 0.17))
        reticle.position = CGPoint(x: 0, y: -size.height * 0.12)
        reticle.fillColor = .clear
        reticle.strokeColor = color.withAlphaComponent(0.46)
        reticle.lineWidth = 0.8
        reticle.glowWidth = 1.2
        reticle.zPosition = 6
        ship.addChild(reticle)

        for angle in stride(from: CGFloat(0), to: .pi * 2, by: .pi / 2) {
            let tick = SKShapeNode(rectOf: CGSize(width: 2, height: size.height * 0.13), cornerRadius: 1)
            tick.position = CGPoint(
                x: reticle.position.x + cos(angle) * size.width * 0.17,
                y: reticle.position.y + sin(angle) * size.width * 0.17
            )
            tick.zRotation = angle
            tick.fillColor = color.withAlphaComponent(0.62)
            tick.strokeColor = .clear
            tick.glowWidth = 0.8
            tick.zPosition = 7
            ship.addChild(tick)
        }

        reticle.run(SKAction.repeatForever(SKAction.rotate(byAngle: .pi * 2, duration: 2.6)), withKey: "enemyReticleSpin")
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
    
    static func createBossShip(size: CGSize, variant: Int? = nil) -> SKNode {
        let ship = SKNode()
        
        // Select random boss ship design from available assets (1-10)
        let bossShips = ["boss_ship_1", "boss_ship_2", "boss_ship_3", "boss_ship_4", "boss_ship_5", "boss_ship_6", "boss_ship_7", "boss_ship_8", "boss_ship_9", "boss_ship_10"]
        let imageName = variant.map { bossShips[abs($0) % bossShips.count] } ?? (bossShips.randomElement() ?? "boss_ship_1")
        
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
        
        let trimmedImage = image.removingCardBackgroundAndTrimming() ?? image

        // Create sprite node with the boss ship image
        let texture = SKTexture(image: trimmedImage)
        let sprite = SKSpriteNode(texture: texture)

        // Scale to fit the requested size while maintaining aspect ratio
        let imageAspect = trimmedImage.size.width / trimmedImage.size.height
        let targetAspect = size.width / size.height

        var finalSize = size
        if imageAspect > targetAspect {
            // Image is wider - fit to width
            finalSize = CGSize(width: size.width, height: size.width / imageAspect)
        } else {
            // Image is taller - fit to height
            finalSize = CGSize(width: size.height * imageAspect, height: size.height)
        }
        
        sprite.size = finalSize
        sprite.zPosition = 1
        
        ship.addChild(sprite)
        addBossAnimatedParts(to: ship, size: finalSize, variantSeed: abs(imageName.hashValue))

        return ship
    }

    private static func addBossAnimatedParts(to ship: SKNode, size: CGSize, variantSeed: Int) {
        let accentPalette: [(UIColor, UIColor)] = [
            (UIColor(red: 1.0, green: 0.20, blue: 0.22, alpha: 1.0), UIColor(red: 1.0, green: 0.75, blue: 0.16, alpha: 1.0)),
            (UIColor(red: 0.25, green: 0.95, blue: 1.0, alpha: 1.0), UIColor(red: 0.9, green: 0.25, blue: 1.0, alpha: 1.0)),
            (UIColor(red: 0.55, green: 1.0, blue: 0.35, alpha: 1.0), UIColor(red: 1.0, green: 0.35, blue: 0.15, alpha: 1.0)),
            (UIColor(red: 1.0, green: 0.38, blue: 0.85, alpha: 1.0), UIColor(red: 0.35, green: 0.75, blue: 1.0, alpha: 1.0))
        ]
        let (coreColor, engineColor) = accentPalette[variantSeed % accentPalette.count]
        let width = max(size.width, 72)
        let height = max(size.height, 72)

        addBossShieldField(to: ship, width: width, height: height, color: coreColor)
        addBossTechRails(to: ship, width: width, height: height, color: coreColor)
        addBossScanningLights(to: ship, width: width, height: height, color: engineColor)

        let core = SKShapeNode(circleOfRadius: min(width, height) * 0.11)
        core.name = "boss_core"
        core.fillColor = coreColor.withAlphaComponent(0.78)
        core.strokeColor = .white.withAlphaComponent(0.9)
        core.lineWidth = 2
        core.glowWidth = 8
        core.zPosition = 4
        ship.addChild(core)

        core.run(SKAction.repeatForever(SKAction.sequence([
            SKAction.group([
                SKAction.scale(to: 1.28, duration: 0.42),
                SKAction.fadeAlpha(to: 0.72, duration: 0.42)
            ]),
            SKAction.group([
                SKAction.scale(to: 0.92, duration: 0.42),
                SKAction.fadeAlpha(to: 1.0, duration: 0.42)
            ])
        ])), withKey: "bossCorePulse")

        for side in [-1.0, 1.0] as [CGFloat] {
            let sideNode = SKNode()
            sideNode.name = side < 0 ? "boss_left_parts" : "boss_right_parts"
            sideNode.position = CGPoint(x: side * width * 0.31, y: -height * 0.02)
            sideNode.zPosition = 3

            let cannon = SKShapeNode(rectOf: CGSize(width: width * 0.12, height: height * 0.34), cornerRadius: 4)
            cannon.fillColor = UIColor(white: 0.08, alpha: 0.86)
            cannon.strokeColor = coreColor
            cannon.lineWidth = 2
            cannon.glowWidth = 2
            sideNode.addChild(cannon)

            let chargePort = SKShapeNode(circleOfRadius: width * 0.04)
            chargePort.position = CGPoint(x: 0, y: height * 0.13)
            chargePort.fillColor = engineColor.withAlphaComponent(0.88)
            chargePort.strokeColor = .white.withAlphaComponent(0.82)
            chargePort.lineWidth = 1.2
            chargePort.glowWidth = 7
            chargePort.zPosition = 2
            sideNode.addChild(chargePort)

            let fin = SKShapeNode()
            let path = CGMutablePath()
            path.move(to: CGPoint(x: side * width * 0.02, y: height * 0.19))
            path.addLine(to: CGPoint(x: side * width * 0.20, y: 0))
            path.addLine(to: CGPoint(x: side * width * 0.02, y: -height * 0.19))
            path.closeSubpath()
            fin.path = path
            fin.fillColor = coreColor.withAlphaComponent(0.48)
            fin.strokeColor = .white.withAlphaComponent(0.75)
            fin.lineWidth = 1.4
            fin.zPosition = -1
            sideNode.addChild(fin)

            ship.addChild(sideNode)

            let sway = SKAction.sequence([
                SKAction.group([
                    SKAction.moveBy(x: side * width * 0.035, y: 0, duration: 0.58),
                    SKAction.rotate(byAngle: side * 0.06, duration: 0.58)
                ]),
                SKAction.group([
                    SKAction.moveBy(x: -side * width * 0.035, y: 0, duration: 0.58),
                    SKAction.rotate(byAngle: -side * 0.06, duration: 0.58)
                ])
            ])
            sideNode.run(SKAction.repeatForever(sway), withKey: "bossSideSway")
            chargePort.run(SKAction.repeatForever(SKAction.sequence([
                SKAction.scale(to: 1.35, duration: 0.22),
                SKAction.scale(to: 0.86, duration: 0.22),
                SKAction.wait(forDuration: 0.3)
            ])), withKey: "bossChargePort")
        }

        for index in 0..<3 {
            let offset = CGFloat(index - 1) * width * 0.14
            let engine = SKShapeNode(circleOfRadius: width * 0.045)
            engine.name = "boss_engine_flame"
            engine.position = CGPoint(x: offset, y: -height * 0.39)
            engine.fillColor = engineColor.withAlphaComponent(0.86)
            engine.strokeColor = .white.withAlphaComponent(0.7)
            engine.lineWidth = 1.2
            engine.glowWidth = 10
            engine.zPosition = 0
            ship.addChild(engine)

            let flame = SKAction.sequence([
                SKAction.group([
                    SKAction.scaleX(to: 0.82, y: 1.65, duration: 0.13),
                    SKAction.fadeAlpha(to: 0.58, duration: 0.13)
                ]),
                SKAction.group([
                    SKAction.scaleX(to: 1.18, y: 0.9, duration: 0.13),
                    SKAction.fadeAlpha(to: 1.0, duration: 0.13)
                ])
            ])
            engine.run(SKAction.repeatForever(flame), withKey: "bossEngineFlicker")
        }

        let armorPulse = SKAction.sequence([
            SKAction.colorize(with: coreColor, colorBlendFactor: 0.18, duration: 0.7),
            SKAction.colorize(withColorBlendFactor: 0.0, duration: 0.7)
        ])
        for case let sprite as SKSpriteNode in ship.children {
            sprite.run(SKAction.repeatForever(armorPulse), withKey: "bossArmorPulse")
        }
    }

    private static func addBossShieldField(to ship: SKNode, width: CGFloat, height: CGFloat, color: UIColor) {
        let shield = SKShapeNode(ellipseOf: CGSize(width: width * 1.12, height: height * 0.82))
        shield.name = "boss_shield_field"
        shield.fillColor = .clear
        shield.strokeColor = color.withAlphaComponent(0.42)
        shield.lineWidth = 1.4
        shield.glowWidth = 9
        shield.zPosition = -2
        ship.addChild(shield)

        let inner = SKShapeNode(ellipseOf: CGSize(width: width * 0.86, height: height * 0.58))
        inner.fillColor = .clear
        inner.strokeColor = .white.withAlphaComponent(0.22)
        inner.lineWidth = 0.9
        inner.glowWidth = 4
        inner.zPosition = -1
        ship.addChild(inner)

        let pulse = SKAction.sequence([
            SKAction.group([
                SKAction.scale(to: 1.06, duration: 0.75),
                SKAction.fadeAlpha(to: 0.45, duration: 0.75)
            ]),
            SKAction.group([
                SKAction.scale(to: 0.98, duration: 0.75),
                SKAction.fadeAlpha(to: 0.9, duration: 0.75)
            ])
        ])
        shield.run(SKAction.repeatForever(pulse), withKey: "bossShieldPulse")
        inner.run(SKAction.repeatForever(SKAction.rotate(byAngle: -.pi * 2, duration: 4.8)), withKey: "bossShieldRotate")
    }

    private static func addBossTechRails(to ship: SKNode, width: CGFloat, height: CGFloat, color: UIColor) {
        for side in [-1.0, 1.0] as [CGFloat] {
            let railPath = CGMutablePath()
            railPath.move(to: CGPoint(x: side * width * 0.10, y: height * 0.24))
            railPath.addLine(to: CGPoint(x: side * width * 0.28, y: height * 0.10))
            railPath.addLine(to: CGPoint(x: side * width * 0.25, y: -height * 0.20))

            let rail = SKShapeNode(path: railPath)
            rail.name = side < 0 ? "boss_left_energy_rail" : "boss_right_energy_rail"
            rail.strokeColor = color.withAlphaComponent(0.86)
            rail.lineWidth = 2.2
            rail.glowWidth = 5
            rail.lineCap = .round
            rail.lineJoin = .round
            rail.zPosition = 5
            ship.addChild(rail)

            let nodeCount = 4
            for index in 0..<nodeCount {
                let y = height * (0.18 - CGFloat(index) * 0.12)
                let x = side * width * (0.14 + CGFloat(index % 2) * 0.11)
                let node = SKShapeNode(rectOf: CGSize(width: width * 0.055, height: height * 0.035), cornerRadius: 3)
                node.position = CGPoint(x: x, y: y)
                node.fillColor = UIColor.black.withAlphaComponent(0.65)
                node.strokeColor = color
                node.lineWidth = 1
                node.glowWidth = 3
                node.zPosition = 6
                ship.addChild(node)

                node.run(SKAction.repeatForever(SKAction.sequence([
                    SKAction.fadeAlpha(to: 0.38, duration: 0.28 + Double(index) * 0.05),
                    SKAction.fadeAlpha(to: 1.0, duration: 0.28)
                ])), withKey: "bossRailBlink")
            }
        }
    }

    private static func addBossScanningLights(to ship: SKNode, width: CGFloat, height: CGFloat, color: UIColor) {
        let scan = SKShapeNode(rectOf: CGSize(width: width * 0.78, height: 3), cornerRadius: 1.5)
        scan.name = "boss_scanline"
        scan.fillColor = color.withAlphaComponent(0.72)
        scan.strokeColor = .clear
        scan.glowWidth = 8
        scan.zPosition = 7
        scan.position = CGPoint(x: 0, y: height * 0.24)
        ship.addChild(scan)

        scan.run(SKAction.repeatForever(SKAction.sequence([
            SKAction.group([
                SKAction.moveTo(y: -height * 0.26, duration: 1.15),
                SKAction.fadeAlpha(to: 0.25, duration: 1.15)
            ]),
            SKAction.moveTo(y: height * 0.24, duration: 0.01),
            SKAction.fadeAlpha(to: 0.82, duration: 0.12),
            SKAction.wait(forDuration: 0.55)
        ])), withKey: "bossScanline")

        for index in 0..<6 {
            let pip = SKShapeNode(circleOfRadius: 2.1)
            let side: CGFloat = index % 2 == 0 ? -1 : 1
            pip.position = CGPoint(
                x: side * width * CGFloat.random(in: 0.16...0.43),
                y: height * CGFloat.random(in: -0.18...0.26)
            )
            pip.fillColor = .white.withAlphaComponent(0.92)
            pip.strokeColor = color
            pip.lineWidth = 0.8
            pip.glowWidth = 4
            pip.zPosition = 8
            ship.addChild(pip)

            pip.run(SKAction.repeatForever(SKAction.sequence([
                SKAction.fadeAlpha(to: 0.18, duration: 0.2 + Double(index) * 0.04),
                SKAction.fadeAlpha(to: 1.0, duration: 0.22),
                SKAction.wait(forDuration: 0.75)
            ])), withKey: "bossTargetPip")
        }
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

private extension UIImage {
    func removingCardBackgroundAndTrimming() -> UIImage? {
        guard let cgImage else {
            return nil
        }

        let width = cgImage.width
        let height = cgImage.height
        let bytesPerPixel = 4
        let bytesPerRow = width * bytesPerPixel
        var pixels = [UInt8](repeating: 0, count: height * bytesPerRow)

        guard let context = CGContext(
            data: &pixels,
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: bytesPerRow,
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else {
            return nil
        }

        context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))

        var visited = [Bool](repeating: false, count: width * height)
        var queue: [(x: Int, y: Int)] = []

        func pixelIndex(x: Int, y: Int) -> Int {
            y * width + x
        }

        func byteOffset(x: Int, y: Int) -> Int {
            y * bytesPerRow + x * bytesPerPixel
        }

        func isCardBackground(x: Int, y: Int) -> Bool {
            let offset = byteOffset(x: x, y: y)
            let red = pixels[offset]
            let green = pixels[offset + 1]
            let blue = pixels[offset + 2]
            let alpha = pixels[offset + 3]
            let isTransparent = alpha <= 12
            let isDarkMatte = red < 32 && green < 32 && blue < 32
            let isLightMatte = red > 232 && green > 232 && blue > 210
            return isTransparent || isDarkMatte || isLightMatte
        }

        func enqueueIfBackground(x: Int, y: Int) {
            guard x >= 0, x < width, y >= 0, y < height else { return }
            let index = pixelIndex(x: x, y: y)
            guard !visited[index], isCardBackground(x: x, y: y) else { return }
            visited[index] = true
            queue.append((x, y))
        }

        for x in 0..<width {
            enqueueIfBackground(x: x, y: 0)
            enqueueIfBackground(x: x, y: height - 1)
        }

        for y in 0..<height {
            enqueueIfBackground(x: 0, y: y)
            enqueueIfBackground(x: width - 1, y: y)
        }

        var cursor = 0
        while cursor < queue.count {
            let point = queue[cursor]
            cursor += 1

            let offset = byteOffset(x: point.x, y: point.y)
            pixels[offset + 3] = 0

            enqueueIfBackground(x: point.x - 1, y: point.y)
            enqueueIfBackground(x: point.x + 1, y: point.y)
            enqueueIfBackground(x: point.x, y: point.y - 1)
            enqueueIfBackground(x: point.x, y: point.y + 1)
        }

        var minX = width
        var minY = height
        var maxX = 0
        var maxY = 0

        for y in 0..<height {
            for x in 0..<width {
                let offset = byteOffset(x: x, y: y)
                if pixels[offset + 3] > 12 {
                    minX = min(minX, x)
                    minY = min(minY, y)
                    maxX = max(maxX, x)
                    maxY = max(maxY, y)
                }
            }
        }

        guard minX <= maxX, minY <= maxY else { return nil }

        let inset = 2
        let cropRect = CGRect(
            x: max(minX - inset, 0),
            y: max(minY - inset, 0),
            width: min(maxX - minX + 1 + inset * 2, width - max(minX - inset, 0)),
            height: min(maxY - minY + 1 + inset * 2, height - max(minY - inset, 0))
        )

        guard let processedImage = context.makeImage(),
              let cropped = processedImage.cropping(to: cropRect) else {
            return nil
        }

        return UIImage(cgImage: cropped, scale: scale, orientation: imageOrientation)
    }
}
