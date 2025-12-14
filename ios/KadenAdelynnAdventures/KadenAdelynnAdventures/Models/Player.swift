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
    
    private let speed: Float = 200.0
    
    init(x: Float, y: Float) {
        self.position = SIMD2<Float>(x, y)
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
}
