//
//  GameLogic.swift
//  KadenAdelynnSpaceAdventures
//
//  FRESH GAMEPLAY LOGIC - Built from scratch
//

import Foundation
import CoreGraphics

class GameLogic {
    var gameState: GameStateManager
    
    // Game entities
    var player: Player
    var enemies: [Enemy] = []
    var bullets: [Bullet] = []
    var collectibles: [Coin] = []
    var powerUps: [PowerUp] = []  // Weapon/power-up collectibles
    var asteroids: [Asteroid] = []  // Asteroids (spawn from wave 3)
    var boss: Boss? = nil  // For GameView compatibility
    
    // Spawning timers
    var lastEnemySpawn: TimeInterval = 0
    var lastCollectibleSpawn: TimeInterval = 0
    var lastPowerUpSpawn: TimeInterval = 0
    var lastAsteroidSpawn: TimeInterval = 0
    var lastComboDecay: TimeInterval = 0
    var gameStartTime: TimeInterval = 0
    var lastKillTime: TimeInterval = 0
    var hasStarted: Bool = false
    
    weak var gameScene: GameScene?
    
    init(gameState: GameStateManager) {
        self.gameState = gameState
        // Initialize player with selected character and ship
        self.player = Player(
            position: CGPoint(x: 0, y: 0),
            characterId: gameState.selectedCharacter,
            shipId: gameState.selectedShip
        )
    }
    
    func startGame(currentTime: TimeInterval = 0) {
        // Reset game state - adjust starting conditions based on difficulty
        player.position = CGPoint(x: 0, y: -300)
        
        // Starting health based on difficulty
        let healthMultiplier: Int = {
            switch gameState.difficulty.lowercased() {
            case "easy": return 120  // More health on easy
            case "hard": return 80   // Less health on hard
            default: return 100      // Normal on medium
            }
        }()
        player.health = healthMultiplier
        player.maxHealth = healthMultiplier
        
        // Starting lives based on difficulty
        let livesMultiplier: Int = {
            switch gameState.difficulty.lowercased() {
            case "easy": return 35   // More lives on easy
            case "hard": return 15   // Less lives on hard
            default: return 25       // Normal on medium
            }
        }()
        
        gameState.score = 0
        gameState.wave = 1
        gameState.lives = livesMultiplier
        gameState.combo = 0
        gameState.killStreak = 0
        gameState.scoreMultiplier = 1.0
        gameState.timeSurvived = 0
        
        // Apply purchased collectible effects
        applyPurchasedCollectibles()
        
        // Apply weapon upgrades
        applyWeaponUpgrades()
        
        // Clear all entities
        enemies.removeAll()
        bullets.removeAll()
        collectibles.removeAll()
        powerUps.removeAll()
        asteroids.removeAll()
        
        // Mark as not started yet - will be initialized on first update with actual scene time
        hasStarted = false
        // Initialize spawn timers to 0 - will be set properly on first update
        gameStartTime = 0
        lastEnemySpawn = 0
        lastCollectibleSpawn = 0
        lastPowerUpSpawn = 0
        lastAsteroidSpawn = 0
        lastComboDecay = 0
        lastKillTime = 0
    }
    
    // Apply weapon upgrades to player stats
    func applyWeaponUpgrades() {
        // Get current weapon type
        let weaponType = player.weaponType
        let weaponName: String
        switch weaponType {
        case .laser: weaponName = "laser"
        case .spread: weaponName = "pulse"  // Changed from "spread" to "pulse"
        case .plasma: weaponName = "plasma"
        case .missile: weaponName = "rocket"  // Changed from "missile" to "rocket"
        default: weaponName = "laser" // Default to laser for other weapon types
        }
        
        // Load upgrade levels from UserDefaults
        func getUpgradeLevel(upgrade: String) -> Int {
            let key = "upgrade_\(weaponName)_\(upgrade.replacingOccurrences(of: " ", with: "_"))"
            let level = UserDefaults.standard.integer(forKey: key)
            return level > 0 ? level : 1 // Default to level 1 if not set
        }
        
        let damageLevel = getUpgradeLevel(upgrade: "Damage")
        let fireRateLevel = getUpgradeLevel(upgrade: "Fire Rate")
        let rangeLevel = getUpgradeLevel(upgrade: "Range")
        let accuracyLevel = getUpgradeLevel(upgrade: "Accuracy")
        let specialLevel = getUpgradeLevel(upgrade: "Special")
        
        // Store upgrade levels in player (we'll use these when shooting)
        // Note: We'll apply these in shootBullet function
        player.damageMultiplier = 1.0 + Float(damageLevel - 1) * 0.15  // 15% per level
        player.fireRateMultiplier = 1.0 - Float(fireRateLevel - 1) * 0.08  // 8% faster per level (lower = faster)
        player.rangeMultiplier = 1.0 + Float(rangeLevel - 1) * 0.1   // 10% per level
        player.accuracyMultiplier = 1.0 - Float(accuracyLevel - 1) * 0.05  // 5% tighter spread per level
        player.specialMultiplier = 1.0 + Float(specialLevel - 1) * 0.2  // 20% per level for special
        
        #if DEBUG
        print("🔧 Applied weapon upgrades for \(weaponName):")
        print("   Damage: Level \(damageLevel) (\(player.damageMultiplier)x)")
        print("   Fire Rate: Level \(fireRateLevel) (\(player.fireRateMultiplier)x)")
        print("   Range: Level \(rangeLevel) (\(player.rangeMultiplier)x)")
        print("   Accuracy: Level \(accuracyLevel) (\(player.accuracyMultiplier)x)")
        print("   Special: Level \(specialLevel) (\(player.specialMultiplier)x)")
        #endif
    }
    
    // Apply effects from purchased store collectibles
    func applyPurchasedCollectibles() {
        let purchased = gameState.getPurchasedCollectibles()
        
        for key in purchased {
            switch key {
            case "energy_core":
                // Restore energy - boost health
                player.health = min(player.maxHealth, player.health + 20)
                player.maxHealth += 10
                player.health = min(player.maxHealth, player.health)
                
            case "overcharge_core":
                // Massive energy boost
                player.health = min(player.maxHealth, player.health + 50)
                player.maxHealth += 25
                player.health = min(player.maxHealth, player.health)
                
            case "speed_thruster_shield", "speed_thruster_rocket", "speed_thruster_boost":
                // Increase movement speed by 30%
                player.speed *= 1.3
                
            case "rapid_fire_module", "rapid_fire_module_2":
                // Double firing rate - handled in GameEngine fire rate
                gameState.activePowerUps["rapid_fire"] = Double.infinity // Permanent
                
            case "armor_core":
                // Increase shield duration by 50% - handled when shield is activated
                gameState.activePowerUps["armor_boost"] = Double.infinity
                
            case "extra_life":
                // Gain an additional life
                gameState.lives += 1
                
            case "multiplier_orb":
                // Double all stars earned - handled in star collection
                gameState.activePowerUps["star_multiplier"] = Double.infinity
                
            case "star_magnet", "star_magnet_power":
                // Automatically collects all stars - handled in collectible collection
                gameState.activePowerUps["star_magnet"] = Double.infinity
                
            case "homing_chip":
                // Bullets automatically track enemies - handled in bullet logic
                gameState.activePowerUps["homing"] = Double.infinity
                
            case "freeze_pulse", "freeze_pulse_10":
                // Freeze enemies - handled in enemy update
                gameState.activePowerUps["freeze"] = Double.infinity
                
            case "mega_bomb":
                // Massive explosion - can be activated manually or on death
                gameState.activePowerUps["mega_bomb"] = 1.0 // One-time use, stored as count
                
            case "xp_core":
                // Gain bonus experience points - handled in score calculation
                gameState.activePowerUps["xp_boost"] = Double.infinity
                
            case "star_crystal":
                // Bonus stars and multipliers
                gameState.activePowerUps["star_crystal"] = Double.infinity
                
            case "alloy_coin":
                // Rare currency - gives bonus stars - prevent overflow
                let maxSafeCoins = Int.max / 2
                if gameState.coins < maxSafeCoins {
                    gameState.coins = min(gameState.coins + 50, maxSafeCoins)
                }
                
            case "skull_token":
                // Dark power - increases damage
                gameState.activePowerUps["damage_boost"] = Double.infinity
                
            default:
                break
            }
        }
    }
    
    func update(bounds: CGRect, currentTime: TimeInterval, timeScale: CGFloat = 1.0) {
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        
        // Initialize game start time on first update to ensure proper timing
        if !hasStarted {
            gameStartTime = currentTime
            lastEnemySpawn = currentTime
            lastCollectibleSpawn = currentTime
            lastPowerUpSpawn = currentTime
            lastAsteroidSpawn = currentTime
            lastComboDecay = currentTime
            lastKillTime = currentTime
            hasStarted = true
        }
        
        // Update time survived (time since game actually started)
        gameState.timeSurvived = currentTime - gameStartTime
        
        // Progressive wave system - speed depends on difficulty
        let waveInterval = gameState.waveProgressionSpeed
        let newWave = Int(gameState.timeSurvived / waveInterval) + 1
        // Cap wave at 999 to prevent integer overflow issues
        let cappedWave = min(newWave, 999)
        if cappedWave > gameState.wave {
            gameState.wave = cappedWave
            // Bonus score for reaching new wave (more on harder difficulties)
            let bonusMultiplier = gameState.difficultyMultiplier
            let waveBonus = Int(Float(cappedWave * 100) * bonusMultiplier)
            // Prevent score overflow - cap at Int.max / 2 for safety
            let maxSafeScore = Int.max / 2
            if gameState.score < maxSafeScore {
                gameState.score = min(gameState.score + waveBonus, maxSafeScore)
            }
        }
        
        // Clamp player position to screen
        player.position.x = max(-halfWidth + 50, min(halfWidth - 50, player.position.x))
        player.position.y = max(-halfHeight + 50, min(halfHeight - 50, player.position.y))
        
        // PROGRESSIVE ENEMY SPAWNING - Gets harder with waves and difficulty
        // Daily challenge makes enemies spawn 20% faster
        let dailyChallengeMultiplier = Double(gameState.dailyChallengeMultiplier)
        let diffMultiplier = Double(gameState.difficultyMultiplier)
        // Prevent division by zero - ensure multipliers are never zero
        let safeDailyMultiplier = max(0.1, dailyChallengeMultiplier)
        let safeDiffMultiplier = max(0.1, diffMultiplier)
        let baseSpawnRate = 1.5 / (safeDiffMultiplier * safeDailyMultiplier)  // Harder = faster spawning, daily challenge = faster
        let waveDifficulty = Double(gameState.wave) * 0.04 * safeDiffMultiplier
        let enemySpawnRate = max(0.3, baseSpawnRate - waveDifficulty) // Faster spawning with waves
        let diffLower = gameState.difficulty.lowercased()
        let waveThreshold = diffLower == "easy" ? 7 : (diffLower == "hard" ? 3 : 5)
        // Prevent division by zero - ensure waveThreshold is never zero
        let safeWaveThreshold = max(1, waveThreshold)
        let enemiesPerSpawn = gameState.wave > safeWaveThreshold ? min(4, gameState.wave / safeWaveThreshold) : 1
        
        // Prevent too many enemies from spawning (memory protection)
        let maxEnemies = 50  // Limit total enemies to prevent memory issues
        if currentTime - lastEnemySpawn > enemySpawnRate && enemies.count < maxEnemies {
            let spawnCount = min(enemiesPerSpawn, maxEnemies - enemies.count)  // Don't exceed max
            for _ in 0..<spawnCount {
                spawnEnemy(bounds: bounds, wave: gameState.wave)
            }
            lastEnemySpawn = currentTime
        }
        
        // Combo decay system - lose combo if no kills for 3 seconds
        let currentTimeSeconds = Date().timeIntervalSince1970
        if currentTimeSeconds - lastKillTime > 3.0 && gameState.combo > 0 {
            gameState.combo = max(0, gameState.combo - 1)
            updateScoreMultiplier()
        }
        
        // SPAWN COLLECTIBLES from top every 2.5 seconds (more frequent)
        if currentTime - lastCollectibleSpawn > 2.5 && collectibles.count < 6 {
            spawnCollectible(bounds: bounds)
            lastCollectibleSpawn = currentTime
        }
        
        // SPAWN ASTEROIDS from wave 3 onwards (matching PWA)
        if gameState.wave >= 3 {
            let asteroidRate: TimeInterval = 3.0 - (Double(gameState.wave) * 0.2)  // 3000ms - (wave * 200ms)
            let minRate: TimeInterval = 1.0  // Minimum 1 second between asteroids
            let actualRate = max(minRate, asteroidRate)
            if currentTime - lastAsteroidSpawn > actualRate && asteroids.count < 15 {
                spawnAsteroid(bounds: bounds)
                lastAsteroidSpawn = currentTime
            }
        }
        
        // Update enemies (move down and shoot)
        // Apply freeze effect if active
        let freezeActive = gameState.activePowerUps["freeze"] != nil
        let effectiveTimeScale = freezeActive ? timeScale * 0.3 : timeScale // Slow enemies to 30% speed when frozen
        
        // Safety check: ensure we don't iterate over invalid indices
        guard enemies.count > 0 else { return }
        
        for i in (0..<enemies.count).reversed() {
            // Safety check: ensure index is valid
            guard i < enemies.count else { continue }
            var enemy = enemies[i]  // Create mutable copy
            enemy.wave = gameState.wave  // Track wave for aggression scaling
            enemy.update(bounds: bounds, timeScale: effectiveTimeScale, wave: gameState.wave)
            
            // Enemy shooting (ALL enemies shoot) - affected by difficulty and wave
            let diffMultiplier = Double(gameState.difficultyMultiplier)
            let waveShootBonus = Double(gameState.wave) * 0.05  // Faster shooting with waves
            enemy.shootTimer += 0.016 * Double(timeScale)
            
            // Different shoot rates based on enemy type, difficulty, and wave
            // Grey (shooter) and yellow/orange (tank) enemies shoot rapid fire
            let baseShootInterval: TimeInterval = {
                switch enemy.enemyType {
                case .basic: return 2.5
                case .fast: return 2.0
                case .tank: return 0.4  // Rapid fire for tank (yellow/orange)
                case .shooter: return 0.3  // Rapid fire for shooter (grey)
                }
            }()
            
            // Harder difficulty = faster shooting, also scales with waves
            // Make enemies more aggressive as waves increase (shoot faster, move faster)
            let waveAggressionMultiplier = 1.0 + Double(gameState.wave - 1) * 0.15  // 15% faster per wave
            // Prevent division by zero and ensure shootInterval is always positive
            let safeDiffMultiplier = max(0.1, diffMultiplier)  // Prevent division by zero
            let safeWaveAggression = max(0.1, waveAggressionMultiplier)  // Prevent division by zero
            let calculatedInterval = (baseShootInterval / safeDiffMultiplier - waveShootBonus) / safeWaveAggression
            let shootInterval = max(0.1, calculatedInterval)  // Ensure minimum interval
            
            if enemy.shootTimer >= shootInterval {
                // Prevent too many bullets from spawning (memory protection)
                let maxBullets = 200  // Limit total bullets to prevent memory issues
                if bullets.count < maxBullets {
                    // Bullet speed increases with difficulty and wave (more aggressive)
                    let bulletSpeed = 5.0 * diffMultiplier + Double(gameState.wave) * 0.5  // Increased from 0.3 to 0.5
                    let baseDamage = Float(enemy.enemyType == .tank ? 15 : 10)
                    let bulletDamage = Int(baseDamage * gameState.difficultyMultiplier * Float(1.0 + Double(gameState.wave - 1) * 0.1))  // Damage increases with waves
                    
                    let bullet = Bullet(
                        position: enemy.position,
                        velocity: CGPoint(x: 0, y: -CGFloat(bulletSpeed)),
                        size: CGSize(width: 4, height: 8),
                        owner: .enemy,
                        damage: bulletDamage
                    )
                    bullets.append(bullet)
                }
                enemy.shootTimer = 0
            }
            
            // Put updated enemy back in array
            enemies[i] = enemy
            
            // Remove if off bottom of screen
            if enemies[i].position.y < -halfHeight - 50 {
                enemies.remove(at: i)
            }
        }
        
        // Update bullets - safety check
        guard bullets.count > 0 else { return }
        for i in (0..<bullets.count).reversed() {
            guard i < bullets.count else { continue }
            bullets[i].update(timeScale: timeScale)
            
            if bullets[i].isOffScreen(bounds: bounds) {
                bullets.remove(at: i)
            }
        }
        
        // Update asteroids (move down)
        for i in (0..<asteroids.count).reversed() {
            asteroids[i].update(bounds: bounds, timeScale: timeScale)
            
            // Remove if off bottom of screen (center-origin: bottom is -halfHeight)
            if asteroids[i].position.y < -halfHeight - 50 {
                asteroids.remove(at: i)
            }
        }
        
        // Update collectibles (move down)
        for i in (0..<collectibles.count).reversed() {
            collectibles[i].update(timeScale: timeScale)
            
            if collectibles[i].isOffScreen(bounds: bounds) {
                collectibles.remove(at: i)
            }
        }
        
        // Update power-ups (move down)
        for i in (0..<powerUps.count).reversed() {
            powerUps[i].update(timeScale: timeScale)
            
            if powerUps[i].isOffScreen(bounds: bounds) {
                powerUps.remove(at: i)
            }
        }
        
        // Spawn power-ups periodically
        if currentTime - lastPowerUpSpawn > 8.0 && powerUps.count < 3 { // Every 8 seconds, max 3 on screen
            spawnPowerUp(bounds: bounds)
            lastPowerUpSpawn = currentTime
        }
        
        // Check collisions
        checkCollisions(bounds: bounds)
    }
    
    func spawnEnemy(bounds: CGRect, wave: Int) {
        // Center-origin: spawn from top
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        let x = CGFloat.random(in: -halfWidth + 50...(halfWidth - 50))
        let y = halfHeight + 50  // Spawn from top
        
        // Progressive enemy difficulty - harder enemies appear more often in later waves
        // Difficulty affects enemy type distribution
        let diffMultiplier = CGFloat(gameState.difficultyMultiplier)
        let diffLower = gameState.difficulty.lowercased()
        let baseWaveAdjustment = diffLower == "easy" ? -1 : (diffLower == "hard" ? 2 : 0)
        let adjustedWave = max(1, wave + baseWaveAdjustment)
        
        let enemyType: Enemy.EnemyType = {
            let rand = Int.random(in: 0...100)
            var basicChance = max(30, 70 - adjustedWave * 2)  // Less basic enemies as waves increase
            var fastChance = 20 + adjustedWave
            var tankChance = min(30, 5 + adjustedWave)
            var shooterChance = min(40, 10 + adjustedWave * 2)
            
            // Hard difficulty: more dangerous enemies
            if diffLower == "hard" {
                basicChance = max(20, 60 - adjustedWave * 2)
                fastChance += 5
                tankChance += 5
                shooterChance += 10
            } else if diffLower == "easy" {
                // Easy: more basic enemies
                basicChance += 10
            }
            
            if rand < basicChance { return .basic }
            else if rand < basicChance + fastChance { return .fast }
            else if rand < basicChance + fastChance + tankChance { return .tank }
            else { return .shooter }
        }()
        
        var enemy = Enemy(position: CGPoint(x: x, y: y), type: enemyType)
        
        // Some enemies use zigzag movement (30% chance, more common for fast and shooter types)
        let zigzagChance: CGFloat = {
            switch enemyType {
            case .fast: return 0.5  // 50% of fast enemies zigzag
            case .shooter: return 0.4  // 40% of shooter enemies zigzag
            case .basic: return 0.3  // 30% of basic enemies zigzag
            case .tank: return 0.2  // 20% of tank enemies zigzag (they're slower)
            }
        }()
        
        if CGFloat.random(in: 0...1) < zigzagChance {
            enemy.usesZigzag = true
            enemy.zigzagOffset = CGFloat.random(in: 0...(2 * .pi))  // Random starting phase
        }
        enemy.shootTimer = 0
        
        // Increase enemy speed and health with waves AND difficulty
        // Daily challenge makes enemies move 20% faster
        // Cap speed multiplier to prevent enemies from moving too fast (max 5x)
        let dailyChallengeSpeedMultiplier = CGFloat(gameState.dailyChallengeMultiplier)
        let baseSpeedMultiplier = 1.0 + CGFloat(adjustedWave - 1) * 0.08 * diffMultiplier
        let speedMultiplier: CGFloat = min(baseSpeedMultiplier * dailyChallengeSpeedMultiplier, 5.0)  // Cap at 5x
        enemy.velocity.y *= speedMultiplier
        
        // Increase health based on wave and difficulty
        // Cap health increases to prevent excessive values
        if adjustedWave > 2 {
            let healthBonus = max(0, min((adjustedWave - 2) / 3, 50))  // Cap at 50 to prevent overflow
            if enemy.enemyType == .tank {
                let healthIncrease = min(Int(CGFloat(healthBonus) * diffMultiplier), 200)  // Cap at 200
                enemy.health = max(1, min(enemy.health + healthIncrease, 1000))  // Cap total health at 1000
                enemy.maxHealth = max(enemy.health, min(enemy.maxHealth, 1000))
            } else if diffLower == "hard" && adjustedWave > 5 {
                // Hard enemies get health bonus at high waves
                let bonus = max(0, min(healthBonus / 2, 100))  // Cap at 100
                enemy.health = max(1, min(enemy.health + bonus, 500))  // Cap total health at 500
                enemy.maxHealth = max(enemy.health, min(enemy.maxHealth, 500))
            }
        }
        
        enemies.append(enemy)
    }
    
    func spawnPowerUp(bounds: CGRect) {
        // Center-origin: spawn from top
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        let x = CGFloat.random(in: -halfWidth + 50...(halfWidth - 50))
        let y = halfHeight + 50  // Spawn from top
        
        // All 25 weapon collectibles + health/shield/rapidFire
        let weaponCollectibles: [PowerUp.PowerUpType] = [
            .weaponLaser, .weaponSpread, .weaponPlasma, .weaponMissile, .weaponFireball,
            .weaponLightning, .weaponIce, .weaponPoison, .weaponShockwave, .weaponBeam,
            .weaponRocket, .weaponGrenade, .weaponFlamethrower, .weaponElectric, .weaponFreeze,
            .weaponAcid, .weaponVortex, .weaponPulse, .weaponScatter, .weaponHoming,
            .weaponExplosive, .weaponPiercing, .weaponChain, .weaponMeteor, .weaponLaserBeam,
            .weaponMultiShot2, .weaponMultiShot3, .weaponMultiShot4, .weaponMultiShot5
        ]
        
        // Random selection: 70% chance for weapon, 10% health, 10% shield, 10% rapidFire
        let random = Int.random(in: 0..<100)
        let randomType: PowerUp.PowerUpType
        if random < 70 {
            // Weapon collectible (25 types)
            randomType = weaponCollectibles.randomElement() ?? .weaponLaser
        } else if random < 80 {
            randomType = .health
        } else if random < 90 {
            randomType = .shield
        } else {
            randomType = .rapidFire
        }
        
        let powerUp = PowerUp(position: CGPoint(x: x, y: y), type: randomType)
        powerUps.append(powerUp)
    }
    
    func spawnCollectible(bounds: CGRect) {
        // Center-origin: spawn from top
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        let x = CGFloat.random(in: -halfWidth + 50...(halfWidth - 50))
        let y = halfHeight + 50  // Spawn from top
        
        // Spawn random star type (rarity increases with wave)
        let coin = Coin(position: CGPoint(x: x, y: y))
        collectibles.append(coin)
    }
    
    func spawnCoin(at position: CGPoint, fromEnemy enemyType: Enemy.EnemyType? = nil) {
        // Determine star type based on context
        let starType: StarType
        
        if let enemy = enemyType {
            // Different star types from different enemies
            switch enemy {
            case .basic:
                starType = .bronze  // 1 star - common
            case .fast:
                starType = Int.random(in: 0...100) < 30 ? .silver : .bronze  // 30% silver, 70% bronze
            case .shooter:
                starType = Int.random(in: 0...100) < 40 ? .silver : .bronze  // 40% silver, 60% bronze
            case .tank:
                starType = Int.random(in: 0...100) < 50 ? .gold : Int.random(in: 0...100) < 30 ? .silver : .bronze  // 50% gold, 30% silver, 20% bronze
            }
        } else {
            // Random spawn - rarity based on wave
            let _ = min(gameState.wave / 5, 3)  // Bonus every 5 waves, max 3 (for future use)
            let roll = Int.random(in: 0...100)
            
            if roll < 50 {
                starType = .bronze  // 50% bronze
            } else if roll < 75 {
                starType = .silver  // 25% silver
            } else if roll < 90 {
                starType = .gold  // 15% gold
            } else if roll < 97 {
                starType = .platinum  // 7% platinum
            } else {
                starType = .diamond  // 3% diamond (ultra rare!)
            }
        }
        
        let coin = Coin(position: position, starType: starType)
        collectibles.append(coin)
    }
    
    func spawnAsteroid(bounds: CGRect) {
        // Center-origin coordinates: spawn from top
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        let x = CGFloat.random(in: -halfWidth + 50...(halfWidth - 50))
        let y = halfHeight + 50  // Spawn from top
        
        // Random size: 50% small, 35% medium, 15% large
        let roll = Double.random(in: 0...1)
        let asteroidSize: Asteroid.AsteroidSize = {
            if roll < 0.5 { return .small }
            else if roll < 0.85 { return .medium }
            else { return .large }
        }()
        
        let asteroid = Asteroid(position: CGPoint(x: x, y: y), size: asteroidSize)
        asteroids.append(asteroid)
    }
    
    func shootBullet(from position: CGPoint) -> [Bullet] {
        // Apply weapon upgrades if not already applied
        if player.damageMultiplier == 1.0 && player.fireRateMultiplier == 1.0 {
            applyWeaponUpgrades()
        }
        
        var newBullets: [Bullet] = []
        
        switch player.weaponType {
        case .multiShot2:
            // 2 bullets side by side - apply upgrades
            let baseDamage = Int(Float(1) * player.damageMultiplier)
            let bulletSpeed = 10.0 * Double(player.rangeMultiplier)
            let spacing: CGFloat = 15 * CGFloat(player.accuracyMultiplier)  // Accuracy affects spacing
            for i in 0..<2 {
                let offsetX = CGFloat(i) * spacing - spacing / 2
                let bullet = Bullet(
                    position: CGPoint(x: position.x + offsetX, y: position.y),
                    velocity: CGPoint(x: 0, y: CGFloat(bulletSpeed)),
                    size: CGSize(width: 5, height: 10),
                    owner: .player,
                    damage: baseDamage
                )
                bullets.append(bullet)
                newBullets.append(bullet)
            }
            
        case .multiShot3:
            // 3 bullets side by side - apply upgrades
            let baseDamage = Int(Float(1) * player.damageMultiplier)
            let bulletSpeed = 10.0 * Double(player.rangeMultiplier)
            let spacing: CGFloat = 12 * CGFloat(player.accuracyMultiplier)
            for i in 0..<3 {
                let offsetX = CGFloat(i - 1) * spacing
                let bullet = Bullet(
                    position: CGPoint(x: position.x + offsetX, y: position.y),
                    velocity: CGPoint(x: 0, y: CGFloat(bulletSpeed)),
                    size: CGSize(width: 5, height: 10),
                    owner: .player,
                    damage: baseDamage
                )
                bullets.append(bullet)
                newBullets.append(bullet)
            }
            
        case .multiShot4:
            // 4 bullets side by side - apply upgrades
            let baseDamage = Int(Float(1) * player.damageMultiplier)
            let bulletSpeed = 10.0 * Double(player.rangeMultiplier)
            let spacing: CGFloat = 10 * CGFloat(player.accuracyMultiplier)
            for i in 0..<4 {
                let offsetX = (CGFloat(i) - 1.5) * spacing
                let bullet = Bullet(
                    position: CGPoint(x: position.x + offsetX, y: position.y),
                    velocity: CGPoint(x: 0, y: CGFloat(bulletSpeed)),
                    size: CGSize(width: 5, height: 10),
                    owner: .player,
                    damage: baseDamage
                )
                bullets.append(bullet)
                newBullets.append(bullet)
            }
            
        case .multiShot5:
            // 5 bullets side by side - apply upgrades
            let baseDamage = Int(Float(1) * player.damageMultiplier)
            let bulletSpeed = 10.0 * Double(player.rangeMultiplier)
            let spacing: CGFloat = 9 * CGFloat(player.accuracyMultiplier)
            for i in 0..<5 {
                let offsetX = CGFloat(i - 2) * spacing
                let bullet = Bullet(
                    position: CGPoint(x: position.x + offsetX, y: position.y),
                    velocity: CGPoint(x: 0, y: CGFloat(bulletSpeed)),
                    size: CGSize(width: 5, height: 10),
                    owner: .player,
                    damage: baseDamage
                )
                bullets.append(bullet)
                newBullets.append(bullet)
            }
            
        default:
            // Single bullet for all other weapons - apply upgrades
            let baseDamage = Int(Float(1) * player.damageMultiplier)
            let bulletSpeed = 10.0 * Double(player.rangeMultiplier)
            let bullet = Bullet(
                position: position,
                velocity: CGPoint(x: 0, y: CGFloat(bulletSpeed)), // Move up (center-origin)
                size: CGSize(width: 5, height: 10),
                owner: .player,
                damage: baseDamage
            )
            bullets.append(bullet)
            newBullets.append(bullet)
        }
        
        return newBullets
    }
    
    func checkCollisions(bounds: CGRect) {
        // Player bullets vs enemies - safety checks
        guard bullets.count > 0 && enemies.count > 0 else { return }
        for i in (0..<bullets.count).reversed() {
            guard i < bullets.count else { continue }
            guard bullets[i].owner == .player else { continue }
            
            for j in (0..<enemies.count).reversed() {
                guard j < enemies.count else { continue }
                if enemies[j].collidesWith(bullets[i]) {
                    enemies[j].takeDamage(bullets[i].damage)
                    bullets.remove(at: i)
                    
                    if enemies[j].isDead {
                        // Apply damage boost from skull token
                        var finalDamage = bullets[i].damage
                        if gameState.activePowerUps["damage_boost"] != nil {
                            finalDamage = Int(Float(finalDamage) * 1.5) // 50% damage boost
                        }
                        
                        // Enemy killed - COMBO SYSTEM
                        let currentTimeSeconds = Date().timeIntervalSince1970
                        lastKillTime = currentTimeSeconds
                        gameState.combo += 1
                        gameState.killStreak += 1
                        
                        // Update score multiplier based on combo
                        updateScoreMultiplier()
                        
                        // Calculate score with multiplier, streak bonus, and difficulty bonus
                        var baseScore = enemies[j].points
                        
                        // Apply XP core boost
                        if gameState.activePowerUps["xp_boost"] != nil {
                            baseScore = Int(Float(baseScore) * 1.25) // 25% XP boost
                        }
                        
                        let multiplierScore = Float(baseScore) * gameState.scoreMultiplier
                        let streakBonus = gameState.killStreak > 5 ? Float(baseScore) * 0.5 : 0  // 50% bonus for 5+ streak
                        let waveBonus = Float(baseScore) * Float(gameState.wave) * 0.1  // 10% per wave
                        let difficultyBonus = Float(baseScore) * (gameState.difficultyMultiplier - 1.0) * 0.5  // Bonus for harder difficulties
                        
                        let totalScore = Int(multiplierScore + streakBonus + waveBonus + difficultyBonus)
                        // Prevent score overflow - cap at Int.max / 2 for safety
                        let maxSafeScore = Int.max / 2
                        if gameState.score < maxSafeScore {
                            gameState.score = min(gameState.score + totalScore, maxSafeScore)
                        }
                        gameState.enemiesKilled += 1
                        
                        gameScene?.onEnemyKilled(enemies[j], at: enemies[j].position, score: totalScore)
                        
                        // Spawn coin - higher chance with combo
                        let coinChance = min(80, 50 + gameState.combo * 2)  // Up to 80% chance
                        if Int.random(in: 0...100) < coinChance {
                            spawnCoin(at: enemies[j].position)
                        }
                        
                        enemies.remove(at: j)
                    }
                    break
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
                    
                    // Reset combo and streak on hit
                    gameState.combo = 0
                    gameState.killStreak = 0
                    updateScoreMultiplier()
                    
                    if player.health <= 0 {
                        player.health = player.maxHealth
                        gameState.lives -= 1
                        player.invulnerable = true
                        player.invulnerableTimer = 2.0
                    }
                    break
                }
            }
        }
        
        // Collectibles vs player
        for i in (0..<collectibles.count).reversed() {
            // Star magnet: automatically collect stars within range
            let shouldCollect: Bool
            if gameState.activePowerUps["star_magnet"] != nil {
                // Auto-collect if within 100 pixels
                let distance = sqrt(pow(collectibles[i].position.x - player.position.x, 2) + 
                                   pow(collectibles[i].position.y - player.position.y, 2))
                shouldCollect = distance < 100 || collectibles[i].collidesWith(player)
            } else {
                shouldCollect = collectibles[i].collidesWith(player)
            }
            
            if shouldCollect {
                // Calculate star value with multiplier
                var starValue = collectibles[i].value
                
                // Apply multiplier orb effect
                if gameState.activePowerUps["star_multiplier"] != nil {
                    starValue *= 2
                }
                
                // Apply star crystal effect
                if gameState.activePowerUps["star_crystal"] != nil {
                    starValue = Int(Float(starValue) * 1.5) // 50% bonus
                }
                
                // Add star value to coins
                gameState.coins += starValue
                
                // Enhanced collection effect based on star type
                gameScene?.onStarCollected(collectibles[i], at: collectibles[i].position)
                collectibles.remove(at: i)
            }
        }
        
        // Bullets vs boss
        if var currentBoss = boss {
            for i in (0..<bullets.count).reversed() {
                    if bullets[i].owner == .player && currentBoss.collidesWith(bullets[i]) {
                    currentBoss.takeDamage(bullets[i].damage)
                    bullets.remove(at: i)
                    gameState.shotsHit += 1
                    // Prevent score overflow
                    let maxSafeScore = Int.max / 2
                    if gameState.score < maxSafeScore {
                        gameState.score = min(gameState.score + 25, maxSafeScore)
                    }
                    
                    if currentBoss.isDead {
                        // Boss destroyed - spawn platinum star (10 stars) at boss position
                        let platinumStar = Coin(position: currentBoss.position, starType: .platinum)
                        collectibles.append(platinumStar)
                        // Also add 10 stars directly - prevent overflow
                        let maxSafeCoins = Int.max / 2
                        if gameState.coins < maxSafeCoins {
                            gameState.coins = min(gameState.coins + 10, maxSafeCoins)
                        }
                        // Prevent score overflow
                        let maxSafeScore = Int.max / 2
                        if gameState.score < maxSafeScore {
                            gameState.score = min(gameState.score + 1000, maxSafeScore)
                        }
                        AchievementManager.shared.checkBossKill()
                        boss = nil
                        gameScene?.onEnemyKilled(Enemy(position: currentBoss.position, type: .tank), at: currentBoss.position)
                    } else {
                        boss = currentBoss
                    }
                    break
                }
            }
        }
        
        // Power-ups vs player
        for i in (0..<powerUps.count).reversed() {
            if powerUps[i].collidesWith(player) {
                applyPowerUp(powerUps[i])
                gameScene?.onPowerUpCollected(powerUps[i], at: powerUps[i].position)
                powerUps.remove(at: i)
            }
        }
        
        // Asteroids vs player (damage on collision)
        if !player.invulnerable {
            for i in (0..<asteroids.count).reversed() {
                if asteroids[i].collidesWith(player) {
                    player.health -= 20
                    gameScene?.onPlayerHit()
                    
                    if player.health <= 0 {
                        player.health = player.maxHealth
                        gameState.lives -= 1
                        if gameState.lives > 0 {
                            player.invulnerable = true
                            player.invulnerableTimer = 3.0
                        }
                    } else {
                        player.invulnerable = true
                        player.invulnerableTimer = 2.0
                    }
                    
                    // Reset combo on hit
                    gameState.combo = 0
                    gameState.killStreak = 0
                    updateScoreMultiplier()
                    
                    break  // Only take damage from one asteroid per frame
                }
            }
        }
        
        // Bullets vs asteroids (player bullets can destroy asteroids)
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
                        // Prevent score overflow
                        let maxSafeScore = Int.max / 2
                        if gameState.score < maxSafeScore {
                            gameState.score = min(gameState.score + 10, maxSafeScore)
                        }
                        gameScene?.onEnemyKilled(Enemy(position: asteroids[j].position, type: .basic), at: asteroids[j].position)
                        asteroids.remove(at: j)
                    }
                    break
                }
            }
        }
        
        // Enemy bullets vs player
        for i in (0..<bullets.count).reversed() {
            guard bullets[i].owner == .enemy else { continue }
            let bulletRect = CGRect(
                x: bullets[i].position.x - bullets[i].size.width/2,
                y: bullets[i].position.y - bullets[i].size.height/2,
                width: bullets[i].size.width,
                height: bullets[i].size.height
            )
            if player.collidesWith(bulletRect) {
        if !player.invulnerable {
                    player.health -= bullets[i].damage
                    gameScene?.onPlayerHit()
                    bullets.remove(at: i)
                    
                    // Reset combo and streak on hit
                    gameState.combo = 0
                    gameState.killStreak = 0
                    updateScoreMultiplier()
                    
                    if player.health <= 0 {
                        player.health = player.maxHealth
                        gameState.lives -= 1
                        player.invulnerable = true
                        player.invulnerableTimer = 2.0
                    }
                } else {
                    bullets.remove(at: i)
                }
            }
        }
        
        // Update invulnerability timer
        if player.invulnerable {
            player.invulnerableTimer -= 0.016
            if player.invulnerableTimer <= 0 {
                player.invulnerable = false
            }
        }
    }
    
    func applyPowerUp(_ powerUp: PowerUp) {
        switch powerUp.type {
        case .health:
            player.health = min(player.maxHealth, player.health + 25)
        case .rapidFire:
            // Increase fire rate - handled in GameEngine
            gameState.activePowerUps["rapid_fire"] = 10.0 // 10 seconds
        case .shield:
            // Apply armor core boost if purchased
            let shieldDuration = gameState.activePowerUps["armor_boost"] != nil ? 7.5 : 5.0
            player.invulnerable = true
            player.invulnerableTimer = shieldDuration
        case .coin:
            // Each star is worth 1 - prevent overflow
            let maxSafeCoins = Int.max / 2
            if gameState.coins < maxSafeCoins {
                gameState.coins = min(gameState.coins + 1, maxSafeCoins)
            }
            
        // 25 Weapon Collectibles - each changes the weapon type
        case .weaponLaser:
            player.weaponType = .laser
        case .weaponSpread:
            player.weaponType = .spread
        case .weaponPlasma:
            player.weaponType = .plasma
        case .weaponMissile:
            player.weaponType = .missile
        case .weaponFireball:
            player.weaponType = .fireball
        case .weaponLightning:
            player.weaponType = .lightning
        case .weaponIce:
            player.weaponType = .ice
        case .weaponPoison:
            player.weaponType = .poison
        case .weaponShockwave:
            player.weaponType = .shockwave
        case .weaponBeam:
            player.weaponType = .beam
        case .weaponRocket:
            player.weaponType = .rocket
        case .weaponGrenade:
            player.weaponType = .grenade
        case .weaponFlamethrower:
            player.weaponType = .flamethrower
        case .weaponElectric:
            player.weaponType = .electric
        case .weaponFreeze:
            player.weaponType = .freeze
        case .weaponAcid:
            player.weaponType = .acid
        case .weaponVortex:
            player.weaponType = .vortex
        case .weaponPulse:
            player.weaponType = .pulse
        case .weaponScatter:
            player.weaponType = .scatter
        case .weaponHoming:
            player.weaponType = .homing
        case .weaponExplosive:
            player.weaponType = .explosive
        case .weaponPiercing:
            player.weaponType = .piercing
        case .weaponChain:
            player.weaponType = .chain
        case .weaponMeteor:
            player.weaponType = .meteor
        case .weaponLaserBeam:
            player.weaponType = .laserBeam
        case .weaponMultiShot2:
            player.weaponType = .multiShot2
        case .weaponMultiShot3:
            player.weaponType = .multiShot3
        case .weaponMultiShot4:
            player.weaponType = .multiShot4
        case .weaponMultiShot5:
            player.weaponType = .multiShot5
        }
    }
    
    func updateScoreMultiplier() {
        // Combo-based score multiplier
        // 1x base, up to 5x at 30+ combo
        if gameState.combo == 0 {
            gameState.scoreMultiplier = 1.0
        } else if gameState.combo < 5 {
            gameState.scoreMultiplier = 1.0 + Float(gameState.combo) * 0.2  // 1.2x to 1.8x
        } else if gameState.combo < 15 {
            gameState.scoreMultiplier = 2.0 + Float(gameState.combo - 5) * 0.15  // 2.0x to 3.5x
        } else if gameState.combo < 30 {
            gameState.scoreMultiplier = 3.5 + Float(gameState.combo - 15) * 0.1  // 3.5x to 5.0x
        } else {
            gameState.scoreMultiplier = 5.0  // Cap at 5x
        }
    }
}

