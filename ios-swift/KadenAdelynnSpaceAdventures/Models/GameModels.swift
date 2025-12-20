//
//  GameModels.swift
//  KadenAdelynnSpaceAdventures
//
//  Game entity models
//

import Foundation
import CoreGraphics

// MARK: - Player
struct Player {
    var position: CGPoint
    var size: CGSize
    var speed: CGFloat
    var health: Int
    var maxHealth: Int
    var weaponType: WeaponType
    var invulnerable: Bool
    var invulnerableTimer: TimeInterval
    
    init(position: CGPoint, size: CGSize = CGSize(width: 40, height: 40)) {
        self.position = position
        self.size = size
        self.speed = 5.0
        self.health = 100
        self.maxHealth = 100
        self.weaponType = .laser
        self.invulnerable = false
        self.invulnerableTimer = 0
    }
    
    mutating func move(direction: CGPoint, bounds: CGRect) {
        let newX = position.x + direction.x * speed
        let newY = position.y + direction.y * speed
        
        position.x = max(size.width/2, min(bounds.width - size.width/2, newX))
        position.y = max(size.height/2, min(bounds.height - size.height/2, newY))
    }
    
    func collidesWith(_ other: CGRect) -> Bool {
        let playerRect = CGRect(
            x: position.x - size.width/2,
            y: position.y - size.height/2,
            width: size.width,
            height: size.height
        )
        return playerRect.intersects(other)
    }
}

// MARK: - Enemy
struct Enemy {
    var position: CGPoint
    var size: CGSize
    var velocity: CGPoint
    var health: Int
    var maxHealth: Int
    var enemyType: EnemyType
    var points: Int
    
    enum EnemyType {
        case basic
        case fast
        case tank
        case shooter
    }
    
    init(position: CGPoint, type: EnemyType = .basic) {
        self.position = position
        self.enemyType = type
        
        switch type {
        case .basic:
            self.size = CGSize(width: 30, height: 30)
            self.health = 1
            self.maxHealth = 1
            self.velocity = CGPoint(x: 0, y: 2)
            self.points = 10
        case .fast:
            self.size = CGSize(width: 25, height: 25)
            self.health = 1
            self.maxHealth = 1
            self.velocity = CGPoint(x: 0, y: 4)
            self.points = 20
        case .tank:
            self.size = CGSize(width: 40, height: 40)
            self.health = 3
            self.maxHealth = 3
            self.velocity = CGPoint(x: 0, y: 1)
            self.points = 50
        case .shooter:
            self.size = CGSize(width: 30, height: 30)
            self.health = 2
            self.maxHealth = 2
            self.velocity = CGPoint(x: 0, y: 2)
            self.points = 30
        }
    }
    
    mutating func update(bounds: CGRect) {
        position.x += velocity.x
        position.y += velocity.y
        
        // Bounce off walls
        if position.x <= size.width/2 || position.x >= bounds.width - size.width/2 {
            velocity.x *= -1
        }
    }
    
    func collidesWith(_ bullet: Bullet) -> Bool {
        let enemyRect = CGRect(
            x: position.x - size.width/2,
            y: position.y - size.height/2,
            width: size.width,
            height: size.height
        )
        let bulletRect = CGRect(
            x: bullet.position.x - bullet.size.width/2,
            y: bullet.position.y - bullet.size.height/2,
            width: bullet.size.width,
            height: bullet.size.height
        )
        return enemyRect.intersects(bulletRect)
    }
    
    func collidesWith(_ player: Player) -> Bool {
        let enemyRect = CGRect(
            x: position.x - size.width/2,
            y: position.y - size.height/2,
            width: size.width,
            height: size.height
        )
        return player.collidesWith(enemyRect)
    }
    
    var isDead: Bool {
        health <= 0
    }
    
    mutating func takeDamage(_ damage: Int) {
        health = max(0, health - damage)
    }
}

// MARK: - Bullet
struct Bullet {
    var position: CGPoint
    var velocity: CGPoint
    var size: CGSize
    var owner: BulletOwner
    var damage: Int
    
    enum BulletOwner {
        case player
        case enemy
    }
    
    init(position: CGPoint, velocity: CGPoint, size: CGSize = CGSize(width: 5, height: 10), owner: BulletOwner = .player, damage: Int = 1) {
        self.position = position
        self.velocity = velocity
        self.size = size
        self.owner = owner
        self.damage = damage
    }
    
    mutating func update() {
        position.x += velocity.x
        position.y += velocity.y
    }
    
    func isOffScreen(bounds: CGRect) -> Bool {
        return position.y < -size.height || position.y > bounds.height + size.height ||
               position.x < -size.width || position.x > bounds.width + size.width
    }
}

// MARK: - PowerUp
struct PowerUp {
    var position: CGPoint
    var size: CGSize
    var velocity: CGPoint
    var type: PowerUpType
    
    enum PowerUpType {
        case health
        case rapidFire
        case spread
        case shield
        case missile
        case coin
    }
    
    init(position: CGPoint, type: PowerUpType) {
        self.position = position
        self.type = type
        self.size = CGSize(width: 25, height: 25)
        self.velocity = CGPoint(x: 0, y: 2)
    }
    
    mutating func update() {
        position.y += velocity.y
    }
    
    func collidesWith(_ player: Player) -> Bool {
        let powerUpRect = CGRect(
            x: position.x - size.width/2,
            y: position.y - size.height/2,
            width: size.width,
            height: size.height
        )
        return player.collidesWith(powerUpRect)
    }
    
    func isOffScreen(bounds: CGRect) -> Bool {
        return position.y > bounds.height + size.height
    }
}

// MARK: - Boss
struct Boss {
    var position: CGPoint
    var size: CGSize
    var health: Int
    var maxHealth: Int
    var velocity: CGPoint
    var shootTimer: TimeInterval
    
    init(position: CGPoint) {
        self.position = position
        self.size = CGSize(width: 80, height: 80)
        self.health = 100
        self.maxHealth = 100
        self.velocity = CGPoint(x: 2, y: 0)
        self.shootTimer = 0
    }
    
    mutating func update(bounds: CGRect) {
        position.x += velocity.x
        
        if position.x <= size.width/2 || position.x >= bounds.width - size.width/2 {
            velocity.x *= -1
        }
        
        shootTimer += 0.016 // ~60fps
    }
    
    func collidesWith(_ bullet: Bullet) -> Bool {
        let bossRect = CGRect(
            x: position.x - size.width/2,
            y: position.y - size.height/2,
            width: size.width,
            height: size.height
        )
        let bulletRect = CGRect(
            x: bullet.position.x - bullet.size.width/2,
            y: bullet.position.y - bullet.size.height/2,
            width: bullet.size.width,
            height: bullet.size.height
        )
        return bossRect.intersects(bulletRect)
    }
    
    var isDead: Bool {
        health <= 0
    }
    
    mutating func takeDamage(_ damage: Int) {
        health = max(0, health - damage)
    }
    
    func shouldShoot() -> Bool {
        return shootTimer >= 1.0 // Shoot every second
    }
    
    mutating func resetShootTimer() {
        shootTimer = 0
    }
}

// MARK: - WeaponType
enum WeaponType {
    case laser
    case spread
    case plasma
    case missile
}
