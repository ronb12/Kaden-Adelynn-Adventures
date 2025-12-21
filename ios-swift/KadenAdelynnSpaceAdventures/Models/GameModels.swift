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
        self.speed = 7.0  // Match PWA speed
        self.health = 100
        self.maxHealth = 100
        self.weaponType = .laser
        self.invulnerable = false
        self.invulnerableTimer = 0
    }
    
    // Direct position setting (matching PWA touch controls)
    mutating func setPosition(_ newPosition: CGPoint, bounds: CGRect) {
        // Match PWA bounds: 20px margin from edges, 50px from top
        position.x = max(20, min(bounds.width - size.width - 20, newPosition.x))
        position.y = max(50, min(bounds.height - size.height - 20, newPosition.y))
    }
    
    mutating func move(direction: CGPoint, bounds: CGRect, timeScale: CGFloat = 1.0) {
        let newX = position.x + direction.x * speed * timeScale
        let newY = position.y + direction.y * speed * timeScale
        
        // Match PWA bounds: 20px margin from edges, 50px from top
        position.x = max(20, min(bounds.width - size.width - 20, newX))
        position.y = max(50, min(bounds.height - size.height - 20, newY))
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
            self.velocity = CGPoint(x: 0, y: -2)  // Negative Y = move down (center-origin)
            self.points = 10
        case .fast:
            self.size = CGSize(width: 25, height: 25)
            self.health = 1
            self.maxHealth = 1
            self.velocity = CGPoint(x: 0, y: -4)  // Negative Y = move down
            self.points = 20
        case .tank:
            self.size = CGSize(width: 40, height: 40)
            self.health = 3
            self.maxHealth = 3
            self.velocity = CGPoint(x: 0, y: -1)  // Negative Y = move down
            self.points = 50
        case .shooter:
            self.size = CGSize(width: 30, height: 30)
            self.health = 2
            self.maxHealth = 2
            self.velocity = CGPoint(x: 0, y: -2)  // Negative Y = move down
            self.points = 30
        }
    }
    
    mutating func update(bounds: CGRect, timeScale: CGFloat = 1.0) {
        position.x += velocity.x * timeScale
        position.y += velocity.y * timeScale
        
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
    
    mutating func update(timeScale: CGFloat = 1.0) {
        position.x += velocity.x * timeScale
        position.y += velocity.y * timeScale
    }
    
    func isOffScreen(bounds: CGRect) -> Bool {
        // Center-origin coordinates
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        return position.y < -halfHeight - size.height || position.y > halfHeight + size.height ||
               position.x < -halfWidth - size.width || position.x > halfWidth + size.width
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
        self.velocity = CGPoint(x: 0, y: -2)  // Negative Y = move down (center-origin)
    }
    
    mutating func update(timeScale: CGFloat = 1.0) {
        position.y += velocity.y * timeScale
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
        // Center-origin: bottom is -halfHeight
        let halfHeight = bounds.height / 2
        return position.y < -halfHeight - size.height
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
    
    mutating func update(bounds: CGRect, timeScale: CGFloat = 1.0) {
        position.x += velocity.x * timeScale
        
        // Bounce off walls (center-origin: bounds are -halfWidth to +halfWidth)
        let halfWidth = bounds.width / 2
        if position.x <= -halfWidth + size.width/2 || position.x >= halfWidth - size.width/2 {
            velocity.x *= -1
        }
        
        shootTimer += 0.016 * Double(timeScale) // Frame-rate independent
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

// MARK: - Asteroid
struct Asteroid {
    var position: CGPoint
    var size: CGSize
    var velocity: CGPoint
    var health: Int
    var maxHealth: Int
    var asteroidSize: AsteroidSize
    
    enum AsteroidSize {
        case small
        case medium
        case large
    }
    
    init(position: CGPoint, size: AsteroidSize = .medium) {
        self.position = position
        self.asteroidSize = size
        
        switch size {
        case .small:
            self.size = CGSize(width: 20, height: 20)
            self.health = 1
            self.maxHealth = 1
            self.velocity = CGPoint(x: CGFloat.random(in: -2...2), y: 3)
        case .medium:
            self.size = CGSize(width: 40, height: 40)
            self.health = 2
            self.maxHealth = 2
            self.velocity = CGPoint(x: CGFloat.random(in: -1.5...1.5), y: 2)
        case .large:
            self.size = CGSize(width: 60, height: 60)
            self.health = 3
            self.maxHealth = 3
            self.velocity = CGPoint(x: CGFloat.random(in: -1...1), y: 1.5)
        }
    }
    
    mutating func update(bounds: CGRect, timeScale: CGFloat = 1.0) {
        position.x += velocity.x * timeScale
        position.y += velocity.y * timeScale
        
        // Bounce off walls
        if position.x <= size.width/2 || position.x >= bounds.width - size.width/2 {
            velocity.x *= -1
        }
    }
    
    func collidesWith(_ bullet: Bullet) -> Bool {
        let asteroidRect = CGRect(
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
        return asteroidRect.intersects(bulletRect)
    }
    
    func collidesWith(_ player: Player) -> Bool {
        let asteroidRect = CGRect(
            x: position.x - size.width/2,
            y: position.y - size.height/2,
            width: size.width,
            height: size.height
        )
        return player.collidesWith(asteroidRect)
    }
    
    var isDead: Bool {
        health <= 0
    }
    
    mutating func takeDamage(_ damage: Int) {
        health = max(0, health - damage)
    }
}

// MARK: - Coin (Collectible)
struct Coin {
    var position: CGPoint
    var size: CGSize
    var velocity: CGPoint
    var value: Int
    
    init(position: CGPoint, value: Int = 10) {
        self.position = position
        self.size = CGSize(width: 20, height: 20)
        self.velocity = CGPoint(x: 0, y: -2)  // Negative Y = move down (center-origin)
        self.value = value
    }
    
    mutating func update(timeScale: CGFloat = 1.0) {
        position.y += velocity.y * timeScale
    }
    
    func collidesWith(_ player: Player) -> Bool {
        let coinRect = CGRect(
            x: position.x - size.width/2,
            y: position.y - size.height/2,
            width: size.width,
            height: size.height
        )
        return player.collidesWith(coinRect)
    }
    
    func isOffScreen(bounds: CGRect) -> Bool {
        // Center-origin: bottom is -halfHeight
        let halfHeight = bounds.height / 2
        return position.y < -halfHeight - size.height
    }
}

// MARK: - WeaponType
enum WeaponType {
    case laser
    case spread
    case plasma
    case missile
}
