import Foundation
import simd

struct Bullet {
    var position: SIMD2<Float>
    var velocity: SIMD2<Float>
    var width: Float = 5
    var height: Float = 10
    
    mutating func update(deltaTime: Double) {
        let dt = Float(deltaTime)
        position += velocity * dt
    }
    
    func collidesWith(_ enemy: Enemy) -> Bool {
        let dx = position.x - enemy.position.x
        let dy = position.y - enemy.position.y
        let distance = sqrt(dx * dx + dy * dy)
        return distance < (width + enemy.width) / 2
    }
}
