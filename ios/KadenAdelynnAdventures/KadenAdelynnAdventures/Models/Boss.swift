import Foundation
import simd

class Boss {
    var position: SIMD2<Float>
    var health: Int = 100
    var maxHealth: Int = 100
    var isDead: Bool = false
    var width: Float = 60
    var height: Float = 60
    var shootTimer: Float = 0
    
    init(x: Float, y: Float) {
        self.position = SIMD2<Float>(x, y)
    }
    
    func update(deltaTime: Double, playerPosition: SIMD2<Float>) {
        let dt = Float(deltaTime)
        
        // Boss AI: move towards player
        let dx = playerPosition.x - position.x
        if abs(dx) > 5 {
            position.x += (dx > 0 ? 100 : -100) * dt
        }
        
        // Shooting logic
        shootTimer -= dt
    }
    
    func takeDamage(_ amount: Int) {
        health -= amount
        if health <= 0 {
            isDead = true
        }
    }
    
    func collidesWith(_ bullet: Bullet) -> Bool {
        let dx = position.x - bullet.position.x
        let dy = position.y - bullet.position.y
        let distance = sqrt(dx * dx + dy * dy)
        return distance < (width + bullet.width) / 2
    }
}
