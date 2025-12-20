//
//  EnemyFormations.swift
//  KadenAdelynnSpaceAdventures
//
//  Enemy formation patterns
//

import Foundation
import CoreGraphics

struct EnemyFormation {
    let pattern: FormationPattern
    let enemies: [Enemy]
    let center: CGPoint
    let speed: CGFloat
    
    enum FormationPattern {
        case line
        case vShape
        case diamond
        case circle
        case swarm
    }
    
    static func createFormation(pattern: FormationPattern, center: CGPoint, bounds: CGRect, wave: Int) -> [Enemy] {
        var enemies: [Enemy] = []
        let count = 3 + (wave / 2)
        
        switch pattern {
        case .line:
            let spacing: CGFloat = 60
            let startX = center.x - CGFloat(count - 1) * spacing / 2
            for i in 0..<count {
                let x = startX + CGFloat(i) * spacing
                let enemy = Enemy(position: CGPoint(x: x, y: center.y), type: .basic)
                enemies.append(enemy)
            }
            
        case .vShape:
            for i in 0..<count {
                let offset = CGFloat(i - count / 2) * 40
                let y = center.y + abs(offset) * 0.5
                let enemy = Enemy(position: CGPoint(x: center.x + offset, y: y), type: i % 2 == 0 ? .basic : .fast)
                enemies.append(enemy)
            }
            
        case .diamond:
            let positions = [
                CGPoint(x: center.x, y: center.y - 40),
                CGPoint(x: center.x - 30, y: center.y),
                CGPoint(x: center.x + 30, y: center.y),
                CGPoint(x: center.x, y: center.y + 40)
            ]
            for (index, pos) in positions.enumerated() {
                if index < count {
                    let type: Enemy.EnemyType = index == 0 ? .tank : .basic
                    let enemy = Enemy(position: pos, type: type)
                    enemies.append(enemy)
                }
            }
            
        case .circle:
            let radius: CGFloat = 50
            for index in 0..<count {
                let angle = Double(index) * 2 * .pi / Double(count)
                let x = center.x + CGFloat(cos(angle)) * radius
                let y = center.y + CGFloat(sin(angle)) * radius
                let enemy = Enemy(position: CGPoint(x: x, y: y), type: .shooter)
                enemies.append(enemy)
            }
            
        case .swarm:
            for i in 0..<count {
                let angle = Double.random(in: 0...(2 * .pi))
                let distance = CGFloat.random(in: 30...80)
                let x = center.x + CGFloat(cos(angle)) * distance
                let y = center.y + CGFloat(sin(angle)) * distance
                let type: Enemy.EnemyType = [.basic, .fast, .shooter].randomElement() ?? .basic
                let enemy = Enemy(position: CGPoint(x: x, y: y), type: type)
                enemies.append(enemy)
            }
        }
        
        return enemies
    }
}

