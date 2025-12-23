//
//  GameLogic.swift
//  KadenAdelynnSpaceAdventures
//
//  Core game logic and mechanics
//

import Foundation
import CoreGraphics

class GameLogic {
    var gameState: GameStateManager
    
    // Game entities
    var player: Player
    var enemies: [Enemy] = []
    var bullets: [Bullet] = []
    var powerUps: [PowerUp] = []
    var boss: Boss?
    var asteroids: [Asteroid] = []
    var collectibles: [Coin] = []
    
    // Spawning
    var lastEnemySpawn: TimeInterval = 0
    var lastPowerUpSpawn: TimeInterval = 0
    var lastAsteroidSpawn: TimeInterval = 0  // For asteroid spawning (matching PWA)
    var lastCollectibleSpawn: TimeInterval = 0  // For collectible spawning
    var enemiesSpawnedThisWave: Int = 0
    var enemiesToSpawnThisWave: Int = 5
    var useFormations = false
    var formationSpawned = false
    
    // Game state
    var isBossFight: Bool = false
    var waveStartTime: TimeInterval = 0
    var gameMode: GameMode = .classic
    
    enum GameMode {
        case classic
        case survival
        case bossRush
    }
    
    init(gameState: GameStateManager) {
        self.gameState = gameState
        self.player = Player(position: CGPoint(x: 0, y: 0))
    }
    
    func startGame(currentTime: TimeInterval = 0) {
        // Player starts at center x, near bottom (center-origin coordinates)
        player.position = CGPoint(x: 0, y: -300)
        player.health = 100
        gameState.score = 0
        gameState.wave = 1
        gameState.level = 1
        gameState.lives = 25
        gameState.enemiesKilled = 0
        gameState.combo = 0
        enemies.removeAll()
        bullets.removeAll()
        powerUps.removeAll()
        collectibles.removeAll()
        asteroids.removeAll()
        boss = nil
        isBossFight = false
        enemiesSpawnedThisWave = 0
        enemiesToSpawnThisWave = 5
        formationSpawned = false
        // Initialize spawn timers with currentTime
        let initTime = currentTime > 0 ? currentTime : 0
        lastEnemySpawn = initTime
        lastPowerUpSpawn = initTime
        lastAsteroidSpawn = initTime
        lastCollectibleSpawn = initTime
        waveStartTime = initTime
    }
    
    func update(bounds: CGRect, currentTime: TimeInterval, timeScale: CGFloat = 1.0) {
        // Player position is now controlled directly by touch (matching PWA)
        // Center-origin bounds: clamp to screen edges
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        let margin: CGFloat = 20
        player.position = CGPoint(
            x: max(-halfWidth + margin, min(halfWidth - margin, player.position.x)),
            y: max(-halfHeight + margin, min(halfHeight - margin, player.position.y))
        )
        
        // Update invulnerability
        if player.invulnerable {
            player.invulnerableTimer -= 0.016
            if player.invulnerableTimer <= 0 {
                player.invulnerable = false
            }
        }
        
        // Spawn enemies
        if !isBossFight && enemiesSpawnedThisWave < enemiesToSpawnThisWave {
            let spawnInterval: TimeInterval = {
                switch gameState.difficulty {
                case "easy": return 2.0
                case "medium": return 1.5
                case "hard": return 1.0
                default: return 1.5
                }
            }()
            
            // Use formations every 3 waves
            useFormations = gameState.wave % 3 == 0 && !formationSpawned
            
            if currentTime - lastEnemySpawn > spawnInterval {
                if useFormations && enemiesSpawnedThisWave == 0 {
                    spawnFormation(bounds: bounds)
                    formationSpawned = true
                } else {
                    spawnEnemy(bounds: bounds)
                }
                lastEnemySpawn = currentTime
                enemiesSpawnedThisWave += 1
            }
        }
        
        // Spawn boss every 5 waves
        if !isBossFight && gameState.wave % 5 == 0 && enemies.isEmpty && enemiesSpawnedThisWave >= enemiesToSpawnThisWave {
            spawnBoss(bounds: bounds)
            isBossFight = true
        }
        
        // Update enemies
        for i in (0..<enemies.count).reversed() {
            enemies[i].update(bounds: bounds, timeScale: timeScale)
            
            // Remove if off screen (center-origin: bottom is -halfHeight)
            if enemies[i].position.y < CGFloat(-halfHeight) - 50 {
                enemies.remove(at: i)
            }
        }
        
        // Update bullets
        for i in (0..<bullets.count).reversed() {
            bullets[i].update()
            
            // Remove if off screen
            if bullets[i].isOffScreen(bounds: bounds) {
                bullets.remove(at: i)
            }
        }
        
        // Update power-ups with timeScale
        for i in (0..<powerUps.count).reversed() {
            powerUps[i].update(timeScale: timeScale)
            
            // Remove if off screen
            if powerUps[i].isOffScreen(bounds: bounds) {
                powerUps.remove(at: i)
            }
        }
        
        // Update asteroids with timeScale (matching PWA)
        for i in (0..<asteroids.count).reversed() {
            asteroids[i].update(bounds: bounds, timeScale: timeScale)
            
            // Remove if off screen (center-origin: bottom is -halfHeight)
            if asteroids[i].position.y < -halfHeight - 50 {
                asteroids.remove(at: i)
            }
        }
        
        // Update collectibles (coins) with timeScale (matching PWA)
        for i in (0..<collectibles.count).reversed() {
            collectibles[i].update(timeScale: timeScale)
            
            // Remove if off screen
            if collectibles[i].isOffScreen(bounds: bounds) {
                collectibles.remove(at: i)
            }
        }
        
        // Update boss with timeScale
        if var currentBoss = boss {
            currentBoss.update(bounds: bounds, timeScale: timeScale)
            boss = currentBoss
            
            // Boss shoots
            if currentBoss.shouldShoot() {
                shootBossBullet(from: currentBoss.position)
                currentBoss.resetShootTimer()
                boss = currentBoss
            }
        }
        
        // Check collisions
        checkCollisions(bounds: bounds)
        
        // Spawn power-ups occasionally
        if currentTime - lastPowerUpSpawn > 5.0 && powerUps.count < 3 {
            spawnPowerUp(bounds: bounds)
            lastPowerUpSpawn = currentTime
        }
        
        // Spawn asteroids (matching PWA - starting from wave 3)
        if gameState.wave >= 3 {
            let asteroidRate: TimeInterval = 3.0 - (Double(gameState.wave) * 0.2)  // 3000ms - (wave * 200ms)
            if currentTime - lastAsteroidSpawn > asteroidRate && asteroids.count < 15 {
                spawnAsteroid(bounds: bounds)
                lastAsteroidSpawn = currentTime
            }
        }
        
        // Spawn collectibles periodically
        if currentTime - lastCollectibleSpawn > 3.0 && collectibles.count < 5 {
            spawnCollectible(bounds: bounds)
            lastCollectibleSpawn = currentTime
        }
        
        // Check wave completion
        if !isBossFight && enemies.isEmpty && enemiesSpawnedThisWave >= enemiesToSpawnThisWave {
            nextWave()
        }
    }
    
    func spawnAsteroid(bounds: CGRect) {
        // Center-origin coordinates: x from -halfWidth to +halfWidth, y from top (+halfHeight)
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        let x = CGFloat.random(in: -halfWidth + 50...(halfWidth - 50))
        let y = halfHeight + 50  // Spawn from top
        
        let roll = Double.random(in: 0...1)
        let asteroidSize: Asteroid.AsteroidSize = {
            if roll < 0.5 { return .small }
            else if roll < 0.85 { return .medium }
            else { return .large }
        }()
        
        let asteroid = Asteroid(position: CGPoint(x: x, y: y), size: asteroidSize)
        asteroids.append(asteroid)
    }
    
    func spawnCoin(at position: CGPoint) {
        let coin = Coin(position: position)
        collectibles.append(coin)
    }
    
    func spawnCollectible(bounds: CGRect) {
        // Center-origin coordinates: spawn from top
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        let x = CGFloat.random(in: -halfWidth + 50...(halfWidth - 50))
        let y = halfHeight + 50  // Spawn from top
        let coin = Coin(position: CGPoint(x: x, y: y))
        collectibles.append(coin)
    }
    
    func spawnEnemy(bounds: CGRect) {
        // Center-origin coordinates: spawn from top
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        let x = CGFloat.random(in: -halfWidth + 50...(halfWidth - 50))
        let y = halfHeight + 50  // Spawn from top (center-origin)
        
        let enemyType: Enemy.EnemyType = {
            let rand = Int.random(in: 0...100)
            // Scale enemy types with wave
            let waveModifier = min(gameState.wave / 10, 3)
            if rand < 40 - waveModifier * 5 { return .basic }
            else if rand < 70 - waveModifier * 5 { return .fast }
            else if rand < 90 { return .shooter }
            else { return .tank }
        }()
        
        let enemy = Enemy(position: CGPoint(x: x, y: y), type: enemyType)
        enemies.append(enemy)
    }
    
    func spawnFormation(bounds: CGRect) {
        let patterns: [EnemyFormation.FormationPattern] = [.line, .vShape, .diamond, .circle, .swarm]
        let pattern = patterns.randomElement() ?? .line
        // Center-origin coordinates: spawn from top
        let halfHeight = bounds.height / 2
        let center = CGPoint(x: 0, y: halfHeight + 100)
        
        let formationEnemies = EnemyFormation.createFormation(
            pattern: pattern,
            center: center,
            bounds: bounds,
            wave: gameState.wave
        )
        
        enemies.append(contentsOf: formationEnemies)
        enemiesSpawnedThisWave += formationEnemies.count
    }
    
    func spawnBoss(bounds: CGRect) {
        // Center-origin coordinates: boss spawns near top center
        let halfHeight = bounds.height / 2
        boss = Boss(position: CGPoint(x: 0, y: halfHeight - 100))
    }
    
    func spawnPowerUp(bounds: CGRect) {
        // Center-origin coordinates: spawn from top
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        let x = CGFloat.random(in: -halfWidth + 50...(halfWidth - 50))
        let y = halfHeight + 50
        
        let types: [PowerUp.PowerUpType] = [.health, .rapidFire, .spread, .shield, .coin]
        let type = types.randomElement() ?? .coin
        
        let powerUp = PowerUp(position: CGPoint(x: x, y: y), type: type)
        powerUps.append(powerUp)
    }
    
    func shootBullet(from position: CGPoint) -> [Bullet] {
        var newBullets: [Bullet] = []
        
        switch player.weaponType {
        case .laser:
            let bullet = Bullet(
                position: position,
                velocity: CGPoint(x: 0, y: 10),
                size: CGSize(width: 5, height: 10),
                owner: .player,
                damage: 1
            )
            newBullets.append(bullet)
            
        case .spread:
            for angle in [-0.3, -0.15, 0, 0.15, 0.3] {
                let vx = sin(angle) * 10
                let vy = cos(angle) * 10
                let bullet = Bullet(
                    position: position,
                    velocity: CGPoint(x: vx, y: vy),
                    size: CGSize(width: 5, height: 10),
                    owner: .player,
                    damage: 1
                )
                newBullets.append(bullet)
            }
            
        case .plasma:
            let bullet = Bullet(
                position: position,
                velocity: CGPoint(x: 0, y: 12),
                size: CGSize(width: 8, height: 15),
                owner: .player,
                damage: 2
            )
            newBullets.append(bullet)
            
        case .missile:
            let bullet = Bullet(
                position: position,
                velocity: CGPoint(x: 0, y: 8),
                size: CGSize(width: 10, height: 20),
                owner: .player,
                damage: 3
            )
            newBullets.append(bullet)
        }
        
        bullets.append(contentsOf: newBullets)
        return newBullets
    }
    
    func shootBossBullet(from position: CGPoint) {
        let bullet = Bullet(
            position: position,
            velocity: CGPoint(x: 0, y: -5),
            size: CGSize(width: 8, height: 15),
            owner: .enemy,
            damage: 10
        )
        bullets.append(bullet)
    }
    
    weak var gameScene: GameScene?
    
    func checkCollisions(bounds: CGRect) {
        // Bullets vs enemies
        for i in (0..<bullets.count).reversed() {
            guard bullets[i].owner == .player else { continue }
            
            for j in (0..<enemies.count).reversed() {
                if enemies[j].collidesWith(bullets[i]) {
                    enemies[j].takeDamage(bullets[i].damage)
                    bullets.remove(at: i)
                    gameState.shotsHit += 1
                    
                    // Show damage number
                    if let scene = gameScene {
                        let damageText = VisualEffects.createDamageNumber(bullets[i].damage, at: enemies[j].position)
                        scene.addChild(damageText)
                        scene.floatingTexts.append(damageText)
                    }
                    
                    if enemies[j].isDead {
                        // Calculate score with combo multiplier
                        let comboMultiplier = 1.0 + (Double(gameState.combo) * 0.1)
                        let points = Int(Double(enemies[j].points) * comboMultiplier)
                        gameState.score += points
                        gameState.enemiesKilled += 1
                        gameState.combo += 1
                        
                        // Notify scene for explosion effect
                        gameScene?.onEnemyKilled(enemies[j], at: enemies[j].position)
                        
                        // Check achievements
                        AchievementManager.shared.checkAchievements(gameState: gameState)
                        
                        // Spawn coin from dead enemy (matching PWA)
                        if Int.random(in: 0...100) < 35 {  // 35% chance for coin
                            spawnCoin(at: enemies[j].position)
                        } else if Int.random(in: 0...100) < 8 {  // 8% chance for health power-up
                            spawnPowerUp(bounds: bounds)
                        }
                        
                        enemies.remove(at: j)
                    }
                    break
                }
            }
        }
        
        // Bullets vs boss
        if var currentBoss = boss {
            for i in (0..<bullets.count).reversed() {
                if bullets[i].owner == .player && currentBoss.collidesWith(bullets[i]) {
                    currentBoss.takeDamage(bullets[i].damage)
                    bullets.remove(at: i)
                    gameState.shotsHit += 1
                    gameState.score += 25
                    
                    if currentBoss.isDead {
                        gameState.score += 1000
                        AchievementManager.shared.checkBossKill()
                        boss = nil
                        isBossFight = false
                    } else {
                        boss = currentBoss
                    }
                    break
                }
            }
        }
        
        // Enemy bullets vs player
        if !player.invulnerable {
            for i in (0..<bullets.count).reversed() {
                if bullets[i].owner == .enemy {
                    let bulletRect = CGRect(
                        x: bullets[i].position.x - bullets[i].size.width/2,
                        y: bullets[i].position.y - bullets[i].size.height/2,
                        width: bullets[i].size.width,
                        height: bullets[i].size.height
                    )
                    
                    if player.collidesWith(bulletRect) {
                        player.health -= bullets[i].damage
                        bullets.remove(at: i)
                        
                        if player.health <= 0 {
                            player.health = player.maxHealth
                            gameState.lives -= 1
                            player.invulnerable = true
                            player.invulnerableTimer = 2.0
                        }
                    }
                }
            }
        }
        
        // Enemies vs player
        if !player.invulnerable {
            for i in (0..<enemies.count).reversed() {
                if enemies[i].collidesWith(player) {
                    player.health -= 10
                    gameScene?.onPlayerHit()
                    enemies.remove(at: i)
                    
                    if player.health <= 0 {
                        player.health = player.maxHealth
                        gameState.lives -= 1
                        player.invulnerable = true
                        player.invulnerableTimer = 2.0
                    }
                    gameState.combo = 0
                    break
                }
            }
        }
        
        // Power-ups vs player
        for i in (0..<powerUps.count).reversed() {
            if powerUps[i].collidesWith(player) {
                gameScene?.onPowerUpCollected(powerUps[i], at: powerUps[i].position)
                applyPowerUp(powerUps[i])
                powerUps.remove(at: i)
                gameState.coins += powerUps[i].type == .coin ? 10 : 0
            }
        }
        
        // Collectibles (coins) vs player (matching PWA)
        for i in (0..<collectibles.count).reversed() {
            if collectibles[i].collidesWith(player) {
                gameState.coins += collectibles[i].value
                UserDefaults.standard.set(gameState.coins, forKey: "walletCoins")
                collectibles.remove(at: i)
            }
        }
        
        // Asteroids vs player (matching PWA)
        if !player.invulnerable {
            for i in (0..<asteroids.count).reversed() {
                if asteroids[i].collidesWith(player) {
                    player.health -= 20
                    gameScene?.onPlayerHit()
                    
                    if player.health <= 0 {
                        player.health = player.maxHealth
                        gameState.lives -= 1
                        player.invulnerable = true
                        player.invulnerableTimer = 2.0
                    }
                    gameState.combo = 0
                    break
                }
            }
        }
        
        // Bullets vs asteroids (matching PWA)
        for i in (0..<bullets.count).reversed() {
            guard bullets[i].owner == .player else { continue }
            
            for j in (0..<asteroids.count).reversed() {
                if asteroids[j].collidesWith(bullets[i]) {
                    asteroids[j].takeDamage(bullets[i].damage)
                    bullets.remove(at: i)
                    gameState.shotsHit += 1
                    
                    if asteroids[j].isDead {
                        // Spawn coin from destroyed asteroid
                        spawnCoin(at: asteroids[j].position)
                        gameState.score += 10
                        asteroids.remove(at: j)
                    }
                    break
                }
            }
        }
    }
    
    func applyPowerUp(_ powerUp: PowerUp) {
        switch powerUp.type {
        case .health:
            player.health = min(player.maxHealth, player.health + 25)
            gameState.health = player.health
            
        case .rapidFire:
            // Increase fire rate - handled in GameEngine
            // Could add a timer here for temporary effect
            break
            
        case .spread:
            player.weaponType = .spread
            
        case .shield:
            player.invulnerable = true
            player.invulnerableTimer = 5.0
            
        case .missile:
            player.weaponType = .missile
            
        case .coin:
            gameState.coins += 10
            UserDefaults.standard.set(gameState.coins, forKey: "walletCoins")
        }
    }
    
    func nextWave() {
        gameState.wave += 1
        enemiesSpawnedThisWave = 0
        enemiesToSpawnThisWave = 5 + gameState.wave * 2
        formationSpawned = false
        
        // Scale difficulty
        let difficultyMultiplier: CGFloat = {
            switch gameState.difficulty {
            case "easy": return 1.0
            case "medium": return 1.2
            case "hard": return 1.5
            default: return 1.0
            }
        }()
        
        // Increase enemy health with waves
        for i in 0..<enemies.count {
            if enemies[i].health < enemies[i].maxHealth {
                enemies[i].health = min(enemies[i].maxHealth, Int(CGFloat(enemies[i].health) * difficultyMultiplier))
            }
        }
        
        if gameState.wave % 10 == 0 {
            gameState.level += 1
        }
    }
}
