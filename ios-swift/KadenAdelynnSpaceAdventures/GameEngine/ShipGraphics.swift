//
//  ShipGraphics.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced ship graphics and visuals
//

import SpriteKit

class ShipGraphics {
    static func createPlayerShip(size: CGSize) -> SKNode {
        let ship = SKNode()
        
        // Main body
        let body = SKShapeNode(rect: CGRect(x: -size.width/2, y: -size.height/2, width: size.width, height: size.height), cornerRadius: 5)
        body.fillColor = .cyan
        body.strokeColor = .white
        body.lineWidth = 2
        ship.addChild(body)
        
        // Wings
        let leftWing = SKShapeNode(path: createWingPath(size: size, side: .left))
        leftWing.fillColor = .cyan
        leftWing.strokeColor = .white
        ship.addChild(leftWing)
        
        let rightWing = SKShapeNode(path: createWingPath(size: size, side: .right))
        rightWing.fillColor = .cyan
        rightWing.strokeColor = .white
        ship.addChild(rightWing)
        
        // Cockpit
        let cockpit = SKShapeNode(circleOfRadius: size.width / 4)
        cockpit.fillColor = .blue
        cockpit.strokeColor = .white
        cockpit.position = CGPoint(x: 0, y: size.height / 4)
        ship.addChild(cockpit)
        
        return ship
    }
    
    static func createEnemyShip(size: CGSize, type: Enemy.EnemyType) -> SKNode {
        let ship = SKNode()
        let color: UIColor
        
        switch type {
        case .basic:
            color = .red
        case .fast:
            color = .orange
        case .tank:
            color = .systemPink
        case .shooter:
            color = .magenta
        }
        
        // Main body
        let body = SKShapeNode(rect: CGRect(x: -size.width/2, y: -size.height/2, width: size.width, height: size.height), cornerRadius: 3)
        body.fillColor = color
        body.strokeColor = .white
        body.lineWidth = 1
        ship.addChild(body)
        
        // Add spikes for different types
        if type == .tank {
            // Add armor plating
            let armor = SKShapeNode(rect: CGRect(x: -size.width/2 - 2, y: -size.height/2 - 2, width: size.width + 4, height: size.height + 4), cornerRadius: 5)
            armor.fillColor = color.withAlphaComponent(0.5)
            armor.strokeColor = .white
            armor.zPosition = -1
            ship.addChild(armor)
        }
        
        return ship
    }
    
    static func createBossShip(size: CGSize) -> SKNode {
        let ship = SKNode()
        
        // Large main body
        let body = SKShapeNode(rect: CGRect(x: -size.width/2, y: -size.height/2, width: size.width, height: size.height), cornerRadius: 10)
        body.fillColor = .magenta
        body.strokeColor = .red
        body.lineWidth = 3
        ship.addChild(body)
        
        // Add details
        for i in 0..<4 {
            let angle = Double(i) * 2 * .pi / 4
            let x = CGFloat(cos(angle)) * size.width / 3
            let y = CGFloat(sin(angle)) * size.height / 3
            let detail = SKShapeNode(circleOfRadius: 5)
            detail.fillColor = .red
            detail.position = CGPoint(x: x, y: y)
            ship.addChild(detail)
        }
        
        return ship
    }
    
    private enum WingSide {
        case left, right
    }
    
    private static func createWingPath(size: CGSize, side: WingSide) -> CGPath {
        let path = CGMutablePath()
        let offset: CGFloat = side == .left ? -1 : 1
        
        path.move(to: CGPoint(x: 0, y: -size.height/2))
        path.addLine(to: CGPoint(x: offset * size.width/2, y: -size.height/2 - 10))
        path.addLine(to: CGPoint(x: offset * size.width/2, y: size.height/2))
        path.addLine(to: CGPoint(x: 0, y: size.height/2))
        path.closeSubpath()
        
        return path
    }
}

