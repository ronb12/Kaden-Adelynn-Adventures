//
//  GameModels.swift
//  KadenAdelynnSpaceAdventures
//
//  Game entity models
//

import Foundation
import CoreGraphics
import UIKit

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
    var characterId: String  // Track which character is selected
    var shipId: String  // Track which ship is selected
    
    // Weapon upgrade multipliers
    var damageMultiplier: Float = 1.0
    var fireRateMultiplier: Float = 1.0
    var rangeMultiplier: Float = 1.0
    var accuracyMultiplier: Float = 1.0
    var specialMultiplier: Float = 1.0
    
    init(position: CGPoint, size: CGSize = CGSize(width: 40, height: 40), characterId: String = "kaden", shipId: String = "kaden") {
        self.position = position
        self.size = size
        self.characterId = characterId
        self.shipId = shipId
        
        // Set speed, health, and weapon based on character
        switch characterId.lowercased() {
        case "kaden":
            self.speed = 7.0  // Medium speed
            self.health = 100
            self.maxHealth = 100
            self.weaponType = .laser  // Default laser weapon
        case "adelynn":
            self.speed = 9.0  // High speed
            self.health = 80  // Lower health, higher speed
            self.maxHealth = 80
            self.weaponType = .spread  // Pulse weapon (spread shot pattern)
        default:
            self.speed = 7.0
            self.health = 100
            self.maxHealth = 100
            self.weaponType = .laser
        }
        
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
    var shootTimer: TimeInterval = 0  // For shooter enemies
    var zigzagOffset: CGFloat = 0  // Track zigzag position
    var usesZigzag: Bool = false    // Whether this enemy uses zigzag movement
    
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
            self.size = CGSize(width: 38, height: 38)  // Increased from 30x30
            self.health = 1
            self.maxHealth = 1
            self.velocity = CGPoint(x: 0, y: -2)  // Negative Y = move down (center-origin)
            self.points = 10
        case .fast:
            self.size = CGSize(width: 32, height: 32)  // Increased from 25x25
            self.health = 1
            self.maxHealth = 1
            self.velocity = CGPoint(x: 0, y: -4)  // Negative Y = move down
            self.points = 20
        case .tank:
            self.size = CGSize(width: 50, height: 50)  // Increased from 40x40
            self.health = 3
            self.maxHealth = 3
            self.velocity = CGPoint(x: 0, y: -1)  // Negative Y = move down
            self.points = 50
        case .shooter:
            self.size = CGSize(width: 38, height: 38)  // Increased from 30x30
            self.health = 2
            self.maxHealth = 2
            self.velocity = CGPoint(x: 0, y: -2)  // Negative Y = move down
            self.points = 30
        }
    }
    
    var wave: Int = 1  // Track which wave this enemy is from for aggression scaling
    
    mutating func update(bounds: CGRect, timeScale: CGFloat = 1.0, wave: Int = 1) {
        // Make enemies more aggressive as waves increase (faster movement)
        let waveSpeedMultiplier = 1.0 + CGFloat(wave - 1) * 0.1  // 10% faster per wave
        
        // Zigzag movement for some enemies
        if usesZigzag {
            zigzagOffset += 0.15 * timeScale * waveSpeedMultiplier
            let zigzagAmplitude: CGFloat = 2.5 + CGFloat(wave - 1) * 0.2  // Wider zigzag in later waves
            let zigzagSpeed: CGFloat = 0.1 + CGFloat(wave - 1) * 0.02  // Faster zigzag in later waves
            velocity.x = sin(zigzagOffset * zigzagSpeed) * zigzagAmplitude
        }
        
        // Increase downward speed with waves (more aggressive)
        let adjustedVelocityY = velocity.y * waveSpeedMultiplier
        
        position.x += velocity.x * timeScale
        position.y += adjustedVelocityY * timeScale
        
        // Clamp position to screen bounds (center-origin coordinates)
        let halfWidth = bounds.width / 2
        let margin: CGFloat = size.width / 2 + 10  // Margin from edges
        
        // Clamp X position to prevent going off left/right sides
        position.x = max(-halfWidth + margin, min(halfWidth - margin, position.x))
        
        // If zigzagging and hit boundary, reverse velocity to bounce back
        if usesZigzag {
            if position.x <= -halfWidth + margin || position.x >= halfWidth - margin {
                velocity.x *= -1
            }
        } else {
            // Bounce off walls for non-zigzag enemies
            if position.x <= -halfWidth + margin || position.x >= halfWidth - margin {
                velocity.x *= -1
            }
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
    
    enum PowerUpType: String {
        case health
        case rapidFire
        case shield
        case coin
        // 25 Weapon Collectibles
        case weaponLaser
        case weaponSpread
        case weaponPlasma
        case weaponMissile
        case weaponFireball
        case weaponLightning
        case weaponIce
        case weaponPoison
        case weaponShockwave
        case weaponBeam
        case weaponRocket
        case weaponGrenade
        case weaponFlamethrower
        case weaponElectric
        case weaponFreeze
        case weaponAcid
        case weaponVortex
        case weaponPulse
        case weaponScatter
        case weaponHoming
        case weaponExplosive
        case weaponPiercing
        case weaponChain
        case weaponMeteor
        case weaponLaserBeam
        case weaponMultiShot2      // 2 bullets side by side
        case weaponMultiShot3      // 3 bullets side by side
        case weaponMultiShot4      // 4 bullets side by side
        case weaponMultiShot5      // 5 bullets side by side
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
        self.size = CGSize(width: 100, height: 100)  // Increased from 80x80
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

// MARK: - Star Type
enum StarType {
    case bronze    // 1 star - common
    case silver    // 2 stars - uncommon
    case gold      // 5 stars - rare
    case platinum  // 10 stars - very rare
    case diamond   // 25 stars - ultra rare
    
    var value: Int {
        switch self {
        case .bronze: return 1
        case .silver: return 2
        case .gold: return 5
        case .platinum: return 10
        case .diamond: return 25
        }
    }
    
    var color: UIColor {
        switch self {
        case .bronze: return UIColor(red: 0.8, green: 0.5, blue: 0.2, alpha: 1.0) // Brown/copper
        case .silver: return UIColor(red: 0.75, green: 0.75, blue: 0.8, alpha: 1.0) // Silver/gray
        case .gold: return UIColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0) // Gold/yellow
        case .platinum: return UIColor(red: 0.9, green: 0.9, blue: 0.95, alpha: 1.0) // Platinum/white
        case .diamond: return UIColor(red: 0.5, green: 0.8, blue: 1.0, alpha: 1.0) // Diamond/cyan
        }
    }
    
    var glowColor: UIColor {
        switch self {
        case .bronze: return UIColor(red: 1.0, green: 0.6, blue: 0.2, alpha: 0.8)
        case .silver: return UIColor(red: 0.9, green: 0.9, blue: 1.0, alpha: 0.8)
        case .gold: return UIColor(red: 1.0, green: 0.9, blue: 0.3, alpha: 0.9)
        case .platinum: return UIColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 0.9)
        case .diamond: return UIColor(red: 0.3, green: 0.8, blue: 1.0, alpha: 1.0)
        }
    }
    
    var size: CGFloat {
        switch self {
        case .bronze: return 25
        case .silver: return 28
        case .gold: return 32
        case .platinum: return 36
        case .diamond: return 42
        }
    }
    
    var emoji: String {
        switch self {
        case .bronze: return "⭐"
        case .silver: return "✨"
        case .gold: return "🌟"
        case .platinum: return "💫"
        case .diamond: return "⭐️"
        }
    }
}

// MARK: - Coin (Collectible) - Now represents Stars
struct Coin {
    var position: CGPoint
    var size: CGSize
    var velocity: CGPoint
    var value: Int
    var starType: StarType
    
    init(position: CGPoint, value: Int = 1, starType: StarType? = nil) {
        self.position = position
        self.value = value
        
        // Determine star type from value if not provided
        if let type = starType {
            self.starType = type
            self.value = type.value
        } else {
            // Auto-determine star type from value
            switch value {
            case 1: self.starType = .bronze
            case 2: self.starType = .silver
            case 5: self.starType = .gold
            case 10: self.starType = .platinum
            case 25: self.starType = .diamond
            default:
                if value >= 25 {
                    self.starType = .diamond
                } else if value >= 10 {
                    self.starType = .platinum
                } else if value >= 5 {
                    self.starType = .gold
                } else if value >= 2 {
                    self.starType = .silver
                } else {
                    self.starType = .bronze
                }
            }
            self.value = self.starType.value
        }
        
        let starSize = self.starType.size
        self.size = CGSize(width: starSize, height: starSize)
        self.velocity = CGPoint(x: 0, y: -3)  // Slightly faster movement
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

// MARK: - WeaponType (25 Different Weapons)
enum WeaponType {
    case laser           // 1. Default yellow laser
    case spread          // 2. Blue spread shot
    case plasma          // 3. Purple plasma
    case missile         // 4. Orange missiles
    case fireball        // 5. Red fireballs
    case lightning       // 6. Cyan lightning bolts
    case ice             // 7. Light blue ice shards
    case poison          // 8. Green poison darts
    case shockwave       // 9. White shockwaves
    case beam            // 10. Pink energy beam
    case rocket          // 11. Dark red rockets
    case grenade         // 12. Dark orange grenades
    case flamethrower    // 13. Bright orange flames
    case electric        // 14. Yellow electric bolts
    case freeze          // 15. Cyan freeze rays
    case acid            // 16. Dark green acid
    case vortex          // 17. Purple vortex
    case pulse           // 18. Magenta pulse
    case scatter         // 19. Multi-color scatter
    case homing          // 20. Blue homing missiles
    case explosive       // 21. Red explosive rounds
    case piercing        // 22. White piercing shots
    case chain           // 23. Yellow chain lightning
    case meteor          // 24. Orange meteors
    case laserBeam       // 25. Bright cyan laser beam
    case multiShot2      // 26. 2 bullets side by side
    case multiShot3      // 27. 3 bullets side by side
    case multiShot4      // 28. 4 bullets side by side
    case multiShot5      // 29. 5 bullets side by side
}
