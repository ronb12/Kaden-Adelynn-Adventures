import Foundation
import simd

class Asteroid {
    var position: SIMD2<Float>
    var velocity: SIMD2<Float>
    var size: Float
    var rotation: Float = 0
    var isDead: Bool = false
    
    init(x: Float, y: Float, size: Float = 20) {
        self.position = SIMD2<Float>(x, y)
        self.velocity = SIMD2<Float>(Float.random(in: -50...50), Float.random(in: 30...100))
        self.size = size
    }
    
    func update(deltaTime: Double) {
        let dt = Float(deltaTime)
        position += velocity * dt
        rotation += Float.random(in: -5...5) * dt
    }
}
