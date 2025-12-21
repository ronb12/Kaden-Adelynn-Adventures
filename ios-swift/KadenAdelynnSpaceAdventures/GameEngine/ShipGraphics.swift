//
//  ShipGraphics.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced ship graphics matching PWA design
//

import SpriteKit

class ShipGraphics {
    static func createPlayerShip(size: CGSize) -> SKNode {
        let ship = SKNode()
        
        // Bright cyan-blue colors for maximum visibility
        let shipColor = UIColor(red: 0.31, green: 0.80, blue: 0.77, alpha: 1.0) // #4ecdc4
        let accentColor = UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0) // #00ffff
        
        // Strong outer glow - very visible
        let outerGlow = createSimpleTrianglePath(size: size, scale: 1.5)
        let glow = SKShapeNode(path: outerGlow)
        glow.fillColor = accentColor.withAlphaComponent(0.4)
        glow.strokeColor = .clear
        glow.zPosition = -2
        ship.addChild(glow)
        
        // Middle glow
        let middleGlow = createSimpleTrianglePath(size: size, scale: 1.2)
        let glow2 = SKShapeNode(path: middleGlow)
        glow2.fillColor = shipColor.withAlphaComponent(0.5)
        glow2.strokeColor = .clear
        glow2.zPosition = -1
        ship.addChild(glow2)
        
        // Main triangle body - simple and clean
        let trianglePath = createSimpleTrianglePath(size: size, scale: 1.0)
        let body = SKShapeNode(path: trianglePath)
        body.fillColor = shipColor
        body.strokeColor = accentColor
        body.lineWidth = 3
        body.zPosition = 0
        ship.addChild(body)
        
        // Simple glowing cockpit - bright and visible
        let cockpitSize = size.width * 0.3
        let cockpit = SKShapeNode(rect: CGRect(
            x: -cockpitSize / 2,
            y: size.height * 0.15,
            width: cockpitSize,
            height: size.height * 0.3
        ), cornerRadius: 3)
        cockpit.fillColor = accentColor
        cockpit.strokeColor = .white
        cockpit.lineWidth = 2
        cockpit.zPosition = 1
        ship.addChild(cockpit)
        
        return ship
    }
    
    // MARK: - Player Ship Helper Methods
    
    // Create simple, clean upward-pointing triangle path (for player)
    private static func createSimpleTrianglePath(size: CGSize, scale: CGFloat) -> CGPath {
        let path = CGMutablePath()
        let w = size.width * scale
        let h = size.height * scale
        
        // Simple, clean upward-pointing triangle
        path.move(to: CGPoint(x: 0, y: h / 2)) // Top point
        path.addLine(to: CGPoint(x: -w / 2, y: -h / 2 + 10)) // Bottom left
        path.addLine(to: CGPoint(x: w * 0.2, y: -h / 2)) // Bottom left inner
        path.addLine(to: CGPoint(x: w * 0.8, y: -h / 2)) // Bottom right inner
        path.addLine(to: CGPoint(x: w / 2, y: -h / 2 + 10)) // Bottom right
        path.closeSubpath()
        
        return path
    }
    
    // Create enhanced upward-pointing triangle path (for player) - compatibility
    private static func createEnhancedTrianglePath(size: CGSize, scale: CGFloat) -> CGPath {
        return createSimpleTrianglePath(size: size, scale: scale)
    }
    
    static func createEnemyShip(size: CGSize, type: Enemy.EnemyType) -> SKNode {
        let ship = SKNode()
        
        // Determine colors based on enemy type
        let primaryColor: UIColor
        let accentColor: UIColor
        let shadowColor: UIColor
        
        switch type {
        case .fast:
            // Fast enemies: magenta
            primaryColor = UIColor(red: 1.0, green: 0.0, blue: 1.0, alpha: 1.0) // #ff00ff
            accentColor = UIColor(red: 1.0, green: 0.67, blue: 1.0, alpha: 1.0) // #ffaaff
            shadowColor = UIColor(red: 1.0, green: 0.0, blue: 1.0, alpha: 1.0)
        case .tank:
            // Tank enemies: orange
            primaryColor = UIColor(red: 1.0, green: 0.6, blue: 0.0, alpha: 1.0) // #ff9900
            accentColor = UIColor(red: 1.0, green: 0.8, blue: 0.4, alpha: 1.0) // #ffcc66
            shadowColor = UIColor(red: 1.0, green: 0.6, blue: 0.0, alpha: 1.0)
        case .shooter:
            // Shooter enemies: cyan
            primaryColor = UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0) // #00ffff
            accentColor = UIColor(red: 0.4, green: 1.0, blue: 1.0, alpha: 1.0) // #66ffff
            shadowColor = UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0)
        default:
            // Basic enemies: red
            primaryColor = UIColor(red: 1.0, green: 0.2, blue: 0.2, alpha: 1.0) // #ff3333
            accentColor = UIColor(red: 1.0, green: 0.6, blue: 0.6, alpha: 1.0) // #ff9999
            shadowColor = UIColor(red: 1.0, green: 0.4, blue: 0.4, alpha: 1.0) // #ff6666
        }
        
        // Outer glow
        let outerGlow = createInvertedTrianglePath(size: size, scale: 1.2)
        let glow = SKShapeNode(path: outerGlow)
        glow.fillColor = shadowColor.withAlphaComponent(0.3)
        glow.strokeColor = .clear
        glow.zPosition = -2
        ship.addChild(glow)
        
        // Middle glow
        let middleGlow = createInvertedTrianglePath(size: size, scale: 1.1)
        let glow2 = SKShapeNode(path: middleGlow)
        glow2.fillColor = primaryColor.withAlphaComponent(0.4)
        glow2.strokeColor = .clear
        glow2.zPosition = -1
        ship.addChild(glow2)
        
        // Main triangle body (downward pointing)
        let trianglePath = createInvertedTrianglePath(size: size, scale: 1.0)
        let body = SKShapeNode(path: trianglePath)
        body.fillColor = primaryColor
        body.strokeColor = accentColor
        body.lineWidth = 2.5
        body.zPosition = 0
        ship.addChild(body)
        
        // Core glow (health indicator) - at top of triangle
        let coreSize: CGFloat = 4
        let core = SKShapeNode(circleOfRadius: coreSize)
        core.fillColor = accentColor
        core.strokeColor = .clear
        core.position = CGPoint(x: 0, y: size.height * 0.33)
        core.zPosition = 1
        
        // Core glow effect
        let coreGlow = SKShapeNode(circleOfRadius: coreSize + 2)
        coreGlow.fillColor = accentColor.withAlphaComponent(0.6)
        coreGlow.strokeColor = .clear
        coreGlow.position = CGPoint(x: 0, y: size.height * 0.33)
        coreGlow.zPosition = 0
        ship.addChild(coreGlow)
        ship.addChild(core)
        
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
    
    // Create upward-pointing triangle path (for player)
    private static func createTrianglePath(size: CGSize, scale: CGFloat) -> CGPath {
        let path = CGMutablePath()
        let w = size.width * scale
        let h = size.height * scale
        
        // Upward-pointing triangle
        path.move(to: CGPoint(x: 0, y: h / 2)) // Top point
        path.addLine(to: CGPoint(x: -w / 2, y: -h / 2 + 10)) // Bottom left
        path.addLine(to: CGPoint(x: w * 0.2, y: -h / 2)) // Bottom left inner
        path.addLine(to: CGPoint(x: w * 0.8, y: -h / 2)) // Bottom right inner
        path.addLine(to: CGPoint(x: w / 2, y: -h / 2 + 10)) // Bottom right
        path.closeSubpath()
        
        return path
    }
    
    // Create downward-pointing triangle path (for enemies)
    private static func createInvertedTrianglePath(size: CGSize, scale: CGFloat) -> CGPath {
        let path = CGMutablePath()
        let w = size.width * scale
        let h = size.height * scale
        
        // Downward-pointing triangle
        path.move(to: CGPoint(x: w / 2, y: h / 2)) // Top right
        path.addLine(to: CGPoint(x: w / 2 - 5, y: h / 2 - 5)) // Top right inner
        path.addLine(to: CGPoint(x: 5, y: h / 2 - 5)) // Top left inner
        path.addLine(to: CGPoint(x: 0, y: h / 2)) // Top left
        path.addLine(to: CGPoint(x: w / 2, y: -h / 2)) // Bottom point
        path.closeSubpath()
        
        return path
    }
}
