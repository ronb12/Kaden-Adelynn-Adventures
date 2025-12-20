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
    
    // Spawning
    var lastEnemySpawn: TimeInterval = 0
    var lastPowerUpSpawn: TimeInterval = 0
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
    
    func startGame() {
        player.position = CGPoint(x: 200, y: 100)
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
        boss = nil
        isBossFight = false
        enemiesSpawnedThisWave = 0
        enemiesToSpawnThisWave = 5
        waveStartTime = Date().timeIntervalSince1970
    }
    
    func update(bounds: CGRect, currentTime: TimeInterval) {
        // Update player
        player.position = CGPoint(
            x: max(player.size.width/2, min(bounds.width - player.size.width/2, player.position.x)),
            y: max(player.size.height/2, min(bounds.height - player.size.height/2, player.position.y))
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
            enemies[i].update(bounds: bounds)
            
            // Remove if off screen
            if enemies[i].position.y > bounds.height + 50 {
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
        
        // Update power-ups
        for i in (0..<powerUps.count).reversed() {
            powerUps[i].update()
            
            // Remove if off screen
            if powerUps[i].isOffScreen(bounds: bounds) {
                powerUps.remove(at: i)
            }
        }
        
        // Update boss
        if var currentBoss = boss {
            currentBoss.update(bounds: bounds)
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
        
        // Check wave completion
        if !isBossFight && enemies.isEmpty && enemiesSpawnedThisWave >= enemiesToSpawnThisWave {
            nextWave()
        }
    }
    
    func spawnEnemy(bounds: CGRect) {
        let x = CGFloat.random(in: 50...(bounds.width - 50))
        let y = bounds.height + 50
        
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
        let center = CGPoint(x: bounds.width / 2, y: bounds.height + 100)
        
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
        boss = Boss(position: CGPoint(x: bounds.width / 2, y: bounds.height - 100))
    }
    
    func spawnPowerUp(bounds: CGRect) {
        let x = CGFloat.random(in: 50...(bounds.width - 50))
        let y = bounds.height + 50
        
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
                        
                        // Spawn coin power-up occasionally
                        if Int.random(in: 0...100) < 20 {
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
