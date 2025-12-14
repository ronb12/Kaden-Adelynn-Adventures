import Foundation
import Metal

class GameEngine {
    private var player: Player
    private var enemies: [Enemy]
    private var bullets: [Bullet]
    private var asteroids: [Asteroid]
    private var collectibles: [Collectible]
    private var gameState: GameState
    private var lastUpdateTime: Double
    
    init() {
        self.player = Player(x: 400, y: 700)
        self.enemies = []
        self.bullets = []
        self.asteroids = []
        self.collectibles = []
        self.gameState = GameState()
        self.lastUpdateTime = Date().timeIntervalSince1970
    }
    
    func update() {
        let currentTime = Date().timeIntervalSince1970
        let deltaTime = currentTime - lastUpdateTime
        lastUpdateTime = currentTime
        
        updatePlayer(deltaTime: deltaTime)
        updateEnemies(deltaTime: deltaTime)
        updateBullets(deltaTime: deltaTime)
        updateAsteroids(deltaTime: deltaTime)
        updateCollectibles(deltaTime: deltaTime)
        checkCollisions()
        spawnEnemies()
        spawnAsteroids()
        spawnCollectibles()
        
        gameState.update()
    }
    
    private func updatePlayer(deltaTime: Double) {
        player.update(deltaTime: deltaTime)
    }
    
    private func updateEnemies(deltaTime: Double) {
        for enemy in enemies {
            enemy.update(deltaTime: deltaTime, playerPosition: player.position)
        }
        
        enemies.removeAll { $0.isDead || $0.position.y > 1000 }
    }
    
    private func updateBullets(deltaTime: Double) {
        for bullet in bullets {
            bullet.update(deltaTime: deltaTime)
        }
        
        bullets.removeAll { $0.position.y < -10 }
    }
    
    private func updateAsteroids(deltaTime: Double) {
        for asteroid in asteroids {
            asteroid.update(deltaTime: deltaTime)
        }
        
        asteroids.removeAll { $0.position.y > 1000 }
    }
    
    private func updateCollectibles(deltaTime: Double) {
        for collectible in collectibles {
            collectible.update(deltaTime: deltaTime)
        }
        
        collectibles.removeAll { $0.position.y > 1000 }
    }
    
    private func checkCollisions() {
        // Player-bullet collisions
        for (bulletIndex, bullet) in bullets.enumerated() {
            for (enemyIndex, enemy) in enemies.enumerated() {
                if bullet.collidesWith(enemy) {
                    bullets.remove(at: bulletIndex)
                    enemy.takeDamage(1)
                    gameState.score += 10
                    break
                }
            }
        }
        
        // Player-enemy collisions
        for enemy in enemies {
            if player.collidesWith(enemy) {
                gameState.lives -= 1
                enemy.isDead = true
            }
        }
        
        // Player-collectible collisions
        for (collectibleIndex, collectible) in collectibles.enumerated() {
            if player.collidesWith(collectible) {
                collectibles.remove(at: collectibleIndex)
                gameState.coins += 1
                break
            }
        }
    }
    
    private func spawnEnemies() {
        if Int.random(in: 0..<100) < 5 {
            let x = CGFloat.random(in: 50..<750)
            enemies.append(Enemy(x: x, y: -50))
        }
    }
    
    private func spawnAsteroids() {
        if Int.random(in: 0..<100) < 3 {
            let x = CGFloat.random(in: 50..<750)
            asteroids.append(Asteroid(x: x, y: -50))
        }
    }
    
    private func spawnCollectibles() {
        if gameState.score % 100 == 0 && gameState.lastCoinSpawnScore != gameState.score {
            gameState.lastCoinSpawnScore = gameState.score
            let x = CGFloat.random(in: 50..<750)
            collectibles.append(Collectible(x: x, y: 0))
        }
    }
    
    func setPlayerInput(moveLeft: Bool, moveRight: Bool, fire: Bool) {
        player.moveLeft = moveLeft
        player.moveRight = moveRight
        
        if fire {
            let bullet = Bullet(x: player.position.x, y: player.position.y - 20)
            bullets.append(bullet)
        }
    }
    
    func getGameState() -> GameState {
        return gameState
    }
    
    func getPlayer() -> Player {
        return player
    }
    
    func getEnemies() -> [Enemy] {
        return enemies
    }
    
    func getBullets() -> [Bullet] {
        return bullets
    }
    
    func getAsteroids() -> [Asteroid] {
        return asteroids
    }
    
    func getCollectibles() -> [Collectible] {
        return collectibles
    }
}

// MARK: - Game State
class GameState {
    var score: Int = 0
    var lives: Int = 3
    var coins: Int = 0
    var wave: Int = 1
    var level: Int = 1
    var combo: Int = 0
    var lastCoinSpawnScore: Int = 0
    var isPaused: Bool = false
    var gameTime: Double = 0
    
    func update() {
        gameTime += 0.016 // Assuming 60 FPS
    }
}

// MARK: - Player Model
class Player {
    var position: CGPoint
    var velocity: CGPoint = .zero
    var moveLeft: Bool = false
    var moveRight: Bool = false
    var size: CGSize = CGSize(width: 30, height: 40)
    var speed: CGFloat = 300
    
    init(x: CGFloat, y: CGFloat) {
        self.position = CGPoint(x: x, y: y)
    }
    
    func update(deltaTime: Double) {
        if moveLeft {
            position.x -= speed * CGFloat(deltaTime)
        }
        if moveRight {
            position.x += speed * CGFloat(deltaTime)
        }
        
        // Clamp position
        position.x = max(0, min(800, position.x))
    }
    
    func collidesWith(_ other: Enemy) -> Bool {
        let playerRect = CGRect(
            x: position.x - size.width / 2,
            y: position.y - size.height / 2,
            width: size.width,
            height: size.height
        )
        
        let otherRect = CGRect(
            x: other.position.x - 15,
            y: other.position.y - 15,
            width: 30,
            height: 30
        )
        
        return playerRect.intersects(otherRect)
    }
    
    func collidesWith(_ other: Collectible) -> Bool {
        let distance = hypot(position.x - other.position.x, position.y - other.position.y)
        return distance < 20
    }
}

// MARK: - Enemy Model
class Enemy {
    var position: CGPoint
    var velocity: CGPoint = .zero
    var health: Int = 1
    var isDead: Bool = false
    var size: CGSize = CGSize(width: 30, height: 30)
    var speed: CGFloat = 150
    
    init(x: CGFloat, y: CGFloat) {
        self.position = CGPoint(x: x, y: y)
    }
    
    func update(deltaTime: Double, playerPosition: CGPoint) {
        position.y += speed * CGFloat(deltaTime)
    }
    
    func takeDamage(_ damage: Int) {
        health -= damage
        if health <= 0 {
            isDead = true
        }
    }
}

// MARK: - Bullet Model
class Bullet {
    var position: CGPoint
    var velocity: CGPoint
    var speed: CGFloat = 500
    
    init(x: CGFloat, y: CGFloat) {
        self.position = CGPoint(x: x, y: y)
        self.velocity = CGPoint(x: 0, y: -speed)
    }
    
    func update(deltaTime: Double) {
        position.y -= speed * CGFloat(deltaTime)
    }
    
    func collidesWith(_ enemy: Enemy) -> Bool {
        let distance = hypot(position.x - enemy.position.x, position.y - enemy.position.y)
        return distance < 15
    }
}

// MARK: - Asteroid Model
class Asteroid {
    var position: CGPoint
    var velocity: CGPoint = .zero
    var rotation: CGFloat = 0
    var rotationSpeed: CGFloat = CGFloat.random(in: -3...3)
    var size: CGSize = CGSize(width: 40, height: 40)
    var speed: CGFloat = 100
    
    init(x: CGFloat, y: CGFloat) {
        self.position = CGPoint(x: x, y: y)
    }
    
    func update(deltaTime: Double) {
        position.y += speed * CGFloat(deltaTime)
        rotation += rotationSpeed * CGFloat(deltaTime)
    }
}

// MARK: - Collectible Model
class Collectible {
    var position: CGPoint
    var velocity: CGPoint = .zero
    var size: CGSize = CGSize(width: 15, height: 15)
    var speed: CGFloat = 200
    
    init(x: CGFloat, y: CGFloat) {
        self.position = CGPoint(x: x, y: y)
    }
    
    func update(deltaTime: Double) {
        position.y += speed * CGFloat(deltaTime)
    }
}
