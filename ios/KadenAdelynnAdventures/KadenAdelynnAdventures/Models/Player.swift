import Foundation
import simd

struct Player {
    var position: SIMD2<Float>
    var velocity: SIMD2<Float> = .zero
    var width: Float = 30
    var height: Float = 30
    var health: Int = 100
    var lives: Int = 3
    var isFiring: Bool = false
    var moveLeft: Bool = false
    var moveRight: Bool = false
    // Weapon and upgrades
    var weaponType: WeaponType = .laser
    var weaponLevel: Int = 1
    var powerUps: [PowerUp] = []

    private let speed: Float = 200.0

    init(x: Float, y: Float, color: SIMD4<Float> = SIMD4<Float>(0,1,0,1), size: Float = 40) {
        self.position = SIMD2<Float>(x, y)
        self.width = size
        self.height = size
    }
    
    mutating func update(deltaTime: Double) {
        let dt = Float(deltaTime)
        
        // Handle movement
        if moveLeft {
            velocity.x = -speed
        } else if moveRight {
            velocity.x = speed
        } else {
            velocity.x = 0
        }
        
        position += velocity * dt
    }
    
    func collidesWith(_ enemy: Enemy) -> Bool {
        let dx = position.x - enemy.position.x
        let dy = position.y - enemy.position.y
        let distance = sqrt(dx * dx + dy * dy)
        return distance < (width + enemy.width) / 2
    }

    mutating func applyPowerUp(_ powerUp: PowerUp) {
        powerUps.append(powerUp)
        switch powerUp.type {
        case .rapidFire:
            weaponLevel = min(weaponLevel + 1, 5)
        case .spread:
            weaponType = .spread
        case .laser:
            weaponType = .laser
        case .missile:
            weaponType = .missile
        case .shield:
            health = min(health + 50, 100)
        }
    }
}

enum WeaponType: String, Codable {
    case laser, spread, missile
}

struct PowerUp: Codable {
    enum PowerUpType: String, Codable {
        case rapidFire, spread, laser, missile, shield
    }
    let type: PowerUpType
    let duration: Double
}
