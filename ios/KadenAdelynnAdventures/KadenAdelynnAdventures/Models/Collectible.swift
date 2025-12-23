import Foundation
import simd

struct Collectible {
    var position: SIMD2<Float>
    var type: String // "coin", "powerup", etc
    var value: Int = 1
    
    func collidesWith(playerPos: SIMD2<Float>) -> Bool {
        let dx = position.x - playerPos.x
        let dy = position.y - playerPos.y
        let distance = sqrt(dx * dx + dy * dy)
        return distance < 20
    }
}
