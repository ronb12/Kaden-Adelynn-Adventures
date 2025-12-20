import Foundation
import simd

class Enemy {
    var position: SIMD2<Float>
    var velocity: SIMD2<Float> = .zero
    var width: Float = 20
    var height: Float = 20
    var health: Int = 10
    var isDead: Bool = false
    var type: String = "basic"
    
    private let speed: Float = 100.0
    
    init(x: Float, y: Float, type: String = "basic") {
        self.position = SIMD2<Float>(x, y)
        self.type = type
    }
    
    func update(deltaTime: Double, playerPosition: SIMD2<Float>) {
        let dt = Float(deltaTime)
        
        // Move down the screen
        position.y += speed * dt
        
        // Simple AI: move towards player
        let dx = playerPosition.x - position.x
        if abs(dx) > 10 {
            velocity.x = dx > 0 ? 50 : -50
            position.x += velocity.x * dt
        }
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
