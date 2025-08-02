//
//  GameScene.swift
//  Kaden & Adelynn Adventures Shared
//
//  Created by Ronell Bradley on 8/2/25.
//

import SpriteKit
import GameKit

class GameScene: SKScene, SKPhysicsContactDelegate {
    
    // MARK: - Game State
    private var gameState: GameState = .menu
    private var score: Int = 0
    private var lives: Int = 3  // Changed to match original game
    private var highScore: Int = 0
    private var level: Int = 1
    private var survivalTime: TimeInterval = 0
    private var startTime: TimeInterval = 0
    
    // MARK: - Player & Weapons
    private var player: SKSpriteNode!
    private var currentWeapon: WeaponType = .basic  // Changed to match original
    private var weaponLevel: Int = 1
    private var doubleShot: Bool = false
    private var shieldActive: Bool = false
    private var shieldTimer: TimeInterval = 0
    private var rapidFireActive: Bool = false
    private var rapidFireTimer: TimeInterval = 0
    private var lastShotTime: TimeInterval = 0
    private var shotCooldown: TimeInterval = 0.2
    
    // MARK: - Game Objects
    private var enemies: [SKSpriteNode] = []
    private var bullets: [SKSpriteNode] = []
    private var enemyBullets: [SKSpriteNode] = []
    private var powerUps: [SKSpriteNode] = []
    private var money: [SKSpriteNode] = []
    private var diamonds: [SKSpriteNode] = []
    private var stars: [SKSpriteNode] = []
    private var particles: [SKSpriteNode] = []
    
    // MARK: - UI Elements
    private var scoreLabel: SKLabelNode!
    private var livesLabel: SKLabelNode!
    private var weaponLabel: SKLabelNode!
    private var levelLabel: SKLabelNode!
    private var menuNode: SKNode!
    private var gameOverNode: SKNode!
    private var pauseNode: SKNode!
    
    // MARK: - Game Settings
    private let playerSpeed: CGFloat = 300
    private let bulletSpeed: CGFloat = 800
    private let enemySpeed: CGFloat = 150
    private let powerUpSpeed: CGFloat = 100
    
    // MARK: - Spawning
    private var lastEnemySpawn: TimeInterval = 0
    private var lastPowerUpSpawn: TimeInterval = 0
    private var lastMoneySpawn: TimeInterval = 0
    private var lastDiamondSpawn: TimeInterval = 0
    private var enemySpawnRate: TimeInterval = 1.0
    private var powerUpSpawnRate: TimeInterval = 3.0
    private var moneySpawnRate: TimeInterval = 2.0
    private var diamondSpawnRate: TimeInterval = 4.0
    
    // MARK: - Collectibles
    private var moneyCount: Int = 0
    private var diamondCount: Int = 0
    private var bulletDamage: Int = 1
    private var scoreMultiplier: Int = 1
    private var scoreMultiplierTimer: TimeInterval = 0
    
    // MARK: - Challenge System
    private var challenges: [Challenge] = []
    private var currentChallenge: Challenge?
    private var challengeProgress: Int = 0
    private var challengeTimer: TimeInterval = 0
    private var totalEnemiesDestroyed: Int = 0
    private var totalPowerupsCollected: Int = 0
    private var consecutiveHits: Int = 0
    private var maxConsecutiveHits: Int = 0
    
    // MARK: - Physics Categories
    struct PhysicsCategory {
        static let none: UInt32 = 0
        static let player: UInt32 = 0b1
        static let enemy: UInt32 = 0b10
        static let bullet: UInt32 = 0b100
        static let enemyBullet: UInt32 = 0b1000
        static let powerUp: UInt32 = 0b10000
        static let money: UInt32 = 0b100000
        static let diamond: UInt32 = 0b1000000
    }
    
    // MARK: - Weapon Types (Updated to match original)
    enum WeaponType: CaseIterable {
        case basic, plasma, spread, laser, missile, lightning, ice, fire, energy, quantum, sonic
        
        var name: String {
            switch self {
            case .basic: return "Basic Laser"
            case .plasma: return "Plasma Cannon"
            case .spread: return "Spread Shot"
            case .laser: return "Laser Beam"
            case .missile: return "Homing Missile"
            case .lightning: return "Lightning Bolt"
            case .ice: return "Ice Shard"
            case .fire: return "Fireball"
            case .energy: return "Energy Pulse"
            case .quantum: return "Quantum Blaster"
            case .sonic: return "Sonic Wave"
            }
        }
        
        var damage: Int {
            switch self {
            case .basic: return 1
            case .plasma: return 2
            case .spread: return 1
            case .laser: return 2
            case .missile: return 3
            case .lightning: return 3
            case .ice: return 2
            case .fire: return 2
            case .energy: return 2
            case .quantum: return 4
            case .sonic: return 1
            }
        }
        
        var color: UIColor {
            switch self {
            case .basic: return .yellow
            case .plasma: return .cyan
            case .spread: return .red
            case .laser: return .magenta
            case .missile: return .orange
            case .lightning: return .yellow
            case .ice: return .cyan
            case .fire: return .red
            case .energy: return .green
            case .quantum: return .purple
            case .sonic: return .systemPink
            }
        }
    }
    
    // MARK: - Game State Enum
    enum GameState {
        case menu, playing, paused, gameOver
    }
    
    // MARK: - Challenge System
    struct Challenge {
        let name: String
        let description: String
        let target: Int
        let reward: Int
        let type: ChallengeType
    }
    
    enum ChallengeType {
        case destroyEnemies, collectPowerups, surviveTime, consecutiveHits
    }
    
    // MARK: - Scene Setup
    class func newGameScene() -> GameScene {
        guard let scene = SKScene(fileNamed: "GameScene") as? GameScene else {
            print("Failed to load GameScene.sks")
            abort()
        }
        scene.scaleMode = .aspectFill
        return scene
    }
    
    override func didMove(to view: SKView) {
        physicsWorld.contactDelegate = self
        physicsWorld.gravity = CGVector(dx: 0, dy: 0)
        
        setupUI()
        setupStars()
        showMainMenu()
    }
    
    // MARK: - UI Setup
    private func setupUI() {
        // Score Label
        scoreLabel = SKLabelNode(fontNamed: "Arial-Bold")
        scoreLabel.text = "Score: 0"
        scoreLabel.fontSize = 24
        scoreLabel.fontColor = .white
        scoreLabel.position = CGPoint(x: 100, y: size.height - 50)
        scoreLabel.zPosition = 100
        addChild(scoreLabel)
        
        // Lives Label
        livesLabel = SKLabelNode(fontNamed: "Arial-Bold")
        livesLabel.text = "Lives: 3"
        livesLabel.fontSize = 24
        livesLabel.fontColor = .white
        livesLabel.position = CGPoint(x: 100, y: size.height - 80)
        livesLabel.zPosition = 100
        addChild(livesLabel)
        
        // Weapon Label
        weaponLabel = SKLabelNode(fontNamed: "Arial-Bold")
        weaponLabel.text = "Weapon: Basic Laser"
        weaponLabel.fontSize = 20
        weaponLabel.fontColor = .yellow
        weaponLabel.position = CGPoint(x: 100, y: size.height - 110)
        weaponLabel.zPosition = 100
        addChild(weaponLabel)
        
        // Level Label
        levelLabel = SKLabelNode(fontNamed: "Arial-Bold")
        levelLabel.text = "Level: 1"
        levelLabel.fontSize = 20
        levelLabel.fontColor = .cyan
        levelLabel.position = CGPoint(x: 100, y: size.height - 140)
        levelLabel.zPosition = 100
        addChild(levelLabel)
    }
    
    private func setupStars() {
        for _ in 0..<100 {
            let star = SKSpriteNode(color: .white, size: CGSize(width: 1, height: 1))
            star.position = CGPoint(x: CGFloat.random(in: 0...size.width),
                                  y: CGFloat.random(in: 0...size.height))
            star.zPosition = -1
            star.alpha = CGFloat.random(in: 0.3...1.0)
            stars.append(star)
            addChild(star)
        }
    }
    
    // MARK: - Main Menu
    private func showMainMenu() {
        gameState = .menu
        
        // Clear existing nodes
        removeAllChildren()
        setupUI()
        setupStars()
        
        // Background
        let background = SKSpriteNode(color: .black, size: size)
        background.position = CGPoint(x: size.width/2, y: size.height/2)
        background.zPosition = -2
        addChild(background)
        
        // Title
        let titleLabel = SKLabelNode(fontNamed: "Arial-Bold")
        titleLabel.text = "🚀 Kaden & Adelynn Adventures 🚀"
        titleLabel.fontSize = 32
        titleLabel.fontColor = .white
        titleLabel.position = CGPoint(x: size.width/2, y: size.height/2 + 100)
        addChild(titleLabel)
        
        // Subtitle
        let subtitleLabel = SKLabelNode(fontNamed: "Arial")
        subtitleLabel.text = "Space Shooter Adventure"
        subtitleLabel.fontSize = 20
        subtitleLabel.fontColor = .cyan
        subtitleLabel.position = CGPoint(x: size.width/2, y: size.height/2 + 60)
        addChild(subtitleLabel)
        
        // Start Button
        let startButton = SKLabelNode(fontNamed: "Arial-Bold")
        startButton.text = "START GAME"
        startButton.fontSize = 28
        startButton.fontColor = .green
        startButton.position = CGPoint(x: size.width/2, y: size.height/2)
        startButton.name = "startButton"
        addChild(startButton)
        
        // Instructions
        let instructionsLabel = SKLabelNode(fontNamed: "Arial")
        instructionsLabel.text = "Tap to move • Auto-shoot • Collect power-ups!"
        instructionsLabel.fontSize = 16
        instructionsLabel.fontColor = .gray
        instructionsLabel.position = CGPoint(x: size.width/2, y: size.height/2 - 60)
        addChild(instructionsLabel)
        
        // High Score
        if highScore > 0 {
            let highScoreLabel = SKLabelNode(fontNamed: "Arial")
            highScoreLabel.text = "High Score: \(highScore)"
            highScoreLabel.fontSize = 18
            highScoreLabel.fontColor = .yellow
            highScoreLabel.position = CGPoint(x: size.width/2, y: size.height/2 - 100)
            addChild(highScoreLabel)
        }
    }
    
    // MARK: - Game Start
    private func startGame() {
        gameState = .playing
        score = 0
        lives = 3  // Match original game
        level = 1
        survivalTime = 0
        startTime = Date().timeIntervalSince1970
        
        // Reset game objects
        enemies.removeAll()
        bullets.removeAll()
        enemyBullets.removeAll()
        powerUps.removeAll()
        money.removeAll()
        diamonds.removeAll()
        particles.removeAll()
        
        // Reset player
        currentWeapon = .basic  // Start with basic weapon
        weaponLevel = 1
        doubleShot = false
        shieldActive = false
        shieldTimer = 0
        rapidFireActive = false
        rapidFireTimer = 0
        lastShotTime = 0
        
        // Reset collectibles
        moneyCount = 0
        diamondCount = 0
        bulletDamage = 1
        scoreMultiplier = 1
        scoreMultiplierTimer = 0
        
        // Reset challenges
        totalEnemiesDestroyed = 0
        totalPowerupsCollected = 0
        consecutiveHits = 0
        maxConsecutiveHits = 0
        
        // Create player
        createPlayer()
        
        // Initialize challenges
        initializeChallenges()
        
        // Start challenge after 10 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 10) {
            if self.gameState == .playing {
                self.startRandomChallenge()
            }
        }
        
        updateUI()
    }
    
    private func createPlayer() {
        // Create a more detailed ship design
        player = SKSpriteNode(color: .blue, size: CGSize(width: 50, height: 40))
        player.position = CGPoint(x: size.width/2, y: size.height - 100)
        player.zPosition = 10
        
        // Physics body
        player.physicsBody = SKPhysicsBody(rectangleOf: player.size)
        player.physicsBody?.isDynamic = true
        player.physicsBody?.categoryBitMask = PhysicsCategory.player
        player.physicsBody?.contactTestBitMask = PhysicsCategory.enemy | PhysicsCategory.enemyBullet | PhysicsCategory.powerUp | PhysicsCategory.money | PhysicsCategory.diamond
        player.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        addChild(player)
    }
    
    // MARK: - Touch Handling
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let location = touch.location(in: self)
        
        switch gameState {
        case .menu:
            if let node = atPoint(location) as? SKLabelNode, node.name == "startButton" {
                startGame()
            }
        case .playing:
            movePlayer(to: location)
        case .gameOver:
            if let node = atPoint(location) as? SKLabelNode, node.name == "restartButton" {
                startGame()
            } else if let node = atPoint(location) as? SKLabelNode, node.name == "menuButton" {
                showMainMenu()
            }
        case .paused:
            break
        }
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard gameState == .playing, let touch = touches.first else { return }
        let location = touch.location(in: self)
        movePlayer(to: location)
    }
    
    private func movePlayer(to location: CGPoint) {
        guard gameState == .playing else { return }
        
        let newX = max(player.size.width/2, min(size.width - player.size.width/2, location.x))
        let newY = max(player.size.height/2, min(size.height - player.size.height/2, location.y))
        
        let moveAction = SKAction.move(to: CGPoint(x: newX, y: newY), duration: 0.1)
        player.run(moveAction)
    }
    
    // MARK: - Game Loop
    override func update(_ currentTime: TimeInterval) {
        guard gameState == .playing else { return }
        
        survivalTime = currentTime - startTime
        
        // Auto-shoot
        if currentTime - lastShotTime >= shotCooldown {
            shoot()
            lastShotTime = currentTime
        }
        
        // Update power-ups
        updatePowerUps(currentTime)
        
        // Spawn enemies and items
        spawnEnemies()
        spawnPowerups()
        spawnCollectibles()
        
        updateDifficulty()
        updateUI()
    }
    
    // MARK: - Shooting
    private func shoot() {
        let bullet = SKSpriteNode(color: currentWeapon.color, size: CGSize(width: 4, height: 8))
        bullet.position = CGPoint(x: player.position.x, y: player.position.y + player.size.height/2)
        bullet.zPosition = 5
        
        // Physics body
        bullet.physicsBody = SKPhysicsBody(rectangleOf: bullet.size)
        bullet.physicsBody?.isDynamic = true
        bullet.physicsBody?.categoryBitMask = PhysicsCategory.bullet
        bullet.physicsBody?.contactTestBitMask = PhysicsCategory.enemy
        bullet.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        bullets.append(bullet)
        addChild(bullet)
        
        // Move bullet
        let moveAction = SKAction.moveBy(x: 0, y: bulletSpeed, duration: 1.0)
        let removeAction = SKAction.removeFromParent()
        bullet.run(SKAction.sequence([moveAction, removeAction]))
    }
    
    // MARK: - Enemy Spawning
    private func spawnEnemies() {
        let currentTime = Date().timeIntervalSince1970
        if currentTime - lastEnemySpawn >= enemySpawnRate {
            let enemy = SKSpriteNode(color: .red, size: CGSize(width: 30, height: 30))
            enemy.position = CGPoint(x: CGFloat.random(in: 0...size.width), y: size.height + 30)
            enemy.zPosition = 5
            
            // Physics body
            enemy.physicsBody = SKPhysicsBody(rectangleOf: enemy.size)
            enemy.physicsBody?.isDynamic = true
            enemy.physicsBody?.categoryBitMask = PhysicsCategory.enemy
            enemy.physicsBody?.contactTestBitMask = PhysicsCategory.bullet | PhysicsCategory.player
            enemy.physicsBody?.collisionBitMask = PhysicsCategory.none
            
            enemies.append(enemy)
            addChild(enemy)
            
            // Move enemy
            let moveAction = SKAction.moveBy(x: 0, y: -enemySpeed, duration: 2.0)
            let removeAction = SKAction.removeFromParent()
            enemy.run(SKAction.sequence([moveAction, removeAction]))
            
            lastEnemySpawn = currentTime
        }
    }
    
    // MARK: - Power-up Spawning
    private func spawnPowerups() {
        let currentTime = Date().timeIntervalSince1970
        if currentTime - lastPowerUpSpawn >= powerUpSpawnRate {
            let powerUp = SKSpriteNode(color: .green, size: CGSize(width: 20, height: 20))
            powerUp.position = CGPoint(x: CGFloat.random(in: 0...size.width), y: size.height + 20)
            powerUp.zPosition = 5
            
            // Physics body
            powerUp.physicsBody = SKPhysicsBody(rectangleOf: powerUp.size)
            powerUp.physicsBody?.isDynamic = true
            powerUp.physicsBody?.categoryBitMask = PhysicsCategory.powerUp
            powerUp.physicsBody?.contactTestBitMask = PhysicsCategory.player
            powerUp.physicsBody?.collisionBitMask = PhysicsCategory.none
            
            powerUps.append(powerUp)
            addChild(powerUp)
            
            // Move power-up
            let moveAction = SKAction.moveBy(x: 0, y: -powerUpSpeed, duration: 3.0)
            let removeAction = SKAction.removeFromParent()
            powerUp.run(SKAction.sequence([moveAction, removeAction]))
            
            lastPowerUpSpawn = currentTime
        }
    }
    
    // MARK: - Collectible Spawning
    private func spawnCollectibles() {
        let currentTime = Date().timeIntervalSince1970
        
        // Spawn money
        if currentTime - lastMoneySpawn >= moneySpawnRate {
            let money = SKSpriteNode(color: .yellow, size: CGSize(width: 15, height: 15))
            money.position = CGPoint(x: CGFloat.random(in: 0...size.width), y: size.height + 15)
            money.zPosition = 5
            
            // Physics body
            money.physicsBody = SKPhysicsBody(rectangleOf: money.size)
            money.physicsBody?.isDynamic = true
            money.physicsBody?.categoryBitMask = PhysicsCategory.money
            money.physicsBody?.contactTestBitMask = PhysicsCategory.player
            money.physicsBody?.collisionBitMask = PhysicsCategory.none
            
            self.money.append(money)
            addChild(money)
            
            // Move money
            let moveAction = SKAction.moveBy(x: 0, y: -powerUpSpeed, duration: 3.0)
            let removeAction = SKAction.removeFromParent()
            money.run(SKAction.sequence([moveAction, removeAction]))
            
            lastMoneySpawn = currentTime
        }
        
        // Spawn diamonds
        if currentTime - lastDiamondSpawn >= diamondSpawnRate {
            let diamond = SKSpriteNode(color: .cyan, size: CGSize(width: 12, height: 12))
            diamond.position = CGPoint(x: CGFloat.random(in: 0...size.width), y: size.height + 12)
            diamond.zPosition = 5
            
            // Physics body
            diamond.physicsBody = SKPhysicsBody(rectangleOf: diamond.size)
            diamond.physicsBody?.isDynamic = true
            diamond.physicsBody?.categoryBitMask = PhysicsCategory.diamond
            diamond.physicsBody?.contactTestBitMask = PhysicsCategory.player
            diamond.physicsBody?.collisionBitMask = PhysicsCategory.none
            
            diamonds.append(diamond)
            addChild(diamond)
            
            // Move diamond
            let moveAction = SKAction.moveBy(x: 0, y: -powerUpSpeed, duration: 3.0)
            let removeAction = SKAction.removeFromParent()
            diamond.run(SKAction.sequence([moveAction, removeAction]))
            
            lastDiamondSpawn = currentTime
        }
    }
    
    // MARK: - Power-up Updates
    private func updatePowerUps(_ currentTime: TimeInterval) {
        // Update shield
        if shieldActive {
            shieldTimer -= 1/60.0
            if shieldTimer <= 0 {
                shieldActive = false
            }
        }
        
        // Update rapid fire
        if rapidFireActive {
            rapidFireTimer -= 1/60.0
            if rapidFireTimer <= 0 {
                rapidFireActive = false
                shotCooldown = 0.2
            }
        }
        
        // Update score multiplier
        if scoreMultiplier > 1 {
            scoreMultiplierTimer -= 1/60.0
            if scoreMultiplierTimer <= 0 {
                scoreMultiplier = 1
            }
        }
    }
    
    // MARK: - Difficulty Updates
    private func updateDifficulty() {
        // Increase difficulty based on score
        let newLevel = (score / 1000) + 1
        if newLevel != level {
            level = newLevel
            enemySpawnRate = max(0.3, 1.0 - (Double(level) * 0.1))
        }
    }
    
    // MARK: - UI Updates
    private func updateUI() {
        scoreLabel.text = "Score: \(score)"
        livesLabel.text = "Lives: \(lives)"
        weaponLabel.text = "Weapon: \(currentWeapon.name)"
        levelLabel.text = "Level: \(level)"
    }
    
    // MARK: - Challenge System
    private func initializeChallenges() {
        challenges = [
            Challenge(name: "Destroy 10 Enemies", description: "Destroy 10 enemies in 30 seconds", target: 10, reward: 500, type: .destroyEnemies),
            Challenge(name: "Collect 5 Power-ups", description: "Collect 5 power-ups in 45 seconds", target: 5, reward: 300, type: .collectPowerups),
            Challenge(name: "Survive 60 Seconds", description: "Survive for 60 seconds", target: 60, reward: 400, type: .surviveTime),
            Challenge(name: "5 Consecutive Hits", description: "Hit 5 enemies in a row", target: 5, reward: 200, type: .consecutiveHits)
        ]
    }
    
    private func startRandomChallenge() {
        guard let challenge = challenges.randomElement() else { return }
        currentChallenge = challenge
        challengeProgress = 0
        challengeTimer = 0
        
        // Show challenge notification
        let challengeLabel = SKLabelNode(fontNamed: "Arial-Bold")
        challengeLabel.text = "Challenge: \(challenge.name)"
        challengeLabel.fontSize = 24
        challengeLabel.fontColor = .yellow
        challengeLabel.position = CGPoint(x: size.width/2, y: size.height/2)
        challengeLabel.zPosition = 200
        addChild(challengeLabel)
        
        // Remove after 3 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            challengeLabel.removeFromParent()
        }
    }
    
    // MARK: - Collision Detection
    func didBegin(_ contact: SKPhysicsContact) {
        let collision = contact.bodyA.categoryBitMask | contact.bodyB.categoryBitMask
        
        if collision == PhysicsCategory.bullet | PhysicsCategory.enemy {
            // Bullet hit enemy
            let bullet = contact.bodyA.categoryBitMask == PhysicsCategory.bullet ? contact.bodyA.node : contact.bodyB.node
            let enemy = contact.bodyA.categoryBitMask == PhysicsCategory.enemy ? contact.bodyA.node : contact.bodyB.node
            
            bullet?.removeFromParent()
            enemy?.removeFromParent()
            
            if let bulletNode = bullet as? SKSpriteNode {
                bullets.removeAll { $0 == bulletNode }
            }
            if let enemyNode = enemy as? SKSpriteNode {
                enemies.removeAll { $0 == enemyNode }
            }
            
            score += 10 * scoreMultiplier
            totalEnemiesDestroyed += 1
            consecutiveHits += 1
            maxConsecutiveHits = max(maxConsecutiveHits, consecutiveHits)
            
            // Check challenge progress
            if let challenge = currentChallenge, challenge.type == .destroyEnemies {
                challengeProgress += 1
                if challengeProgress >= challenge.target {
                    completeChallenge(challenge)
                }
            }
        }
        
        if collision == PhysicsCategory.player | PhysicsCategory.enemy {
            // Player hit enemy
            let enemy = contact.bodyA.categoryBitMask == PhysicsCategory.enemy ? contact.bodyA.node : contact.bodyB.node
            enemy?.removeFromParent()
            
            if let enemyNode = enemy as? SKSpriteNode {
                enemies.removeAll { $0 == enemyNode }
            }
            
            if !shieldActive {
                lives -= 1
                consecutiveHits = 0
                
                if lives <= 0 {
                    gameOver()
                }
            }
        }
        
        if collision == PhysicsCategory.player | PhysicsCategory.powerUp {
            // Player collected power-up
            let powerUp = contact.bodyA.categoryBitMask == PhysicsCategory.powerUp ? contact.bodyA.node : contact.bodyB.node
            powerUp?.removeFromParent()
            
            if let powerUpNode = powerUp as? SKSpriteNode {
                powerUps.removeAll { $0 == powerUpNode }
            }
            
            activateRandomPowerUp()
            totalPowerupsCollected += 1
            
            // Check challenge progress
            if let challenge = currentChallenge, challenge.type == .collectPowerups {
                challengeProgress += 1
                if challengeProgress >= challenge.target {
                    completeChallenge(challenge)
                }
            }
        }
        
        if collision == PhysicsCategory.player | PhysicsCategory.money {
            // Player collected money
            let money = contact.bodyA.categoryBitMask == PhysicsCategory.money ? contact.bodyA.node : contact.bodyB.node
            money?.removeFromParent()
            
            if let moneyNode = money as? SKSpriteNode {
                self.money.removeAll { $0 == moneyNode }
            }
            
            moneyCount += 1
            score += 5
        }
        
        if collision == PhysicsCategory.player | PhysicsCategory.diamond {
            // Player collected diamond
            let diamond = contact.bodyA.categoryBitMask == PhysicsCategory.diamond ? contact.bodyA.node : contact.bodyB.node
            diamond?.removeFromParent()
            
            if let diamondNode = diamond as? SKSpriteNode {
                diamonds.removeAll { $0 == diamondNode }
            }
            
            diamondCount += 1
            score += 20
        }
    }
    
    // MARK: - Power-up Activation
    private func activateRandomPowerUp() {
        let powerUpTypes = ["shield", "rapidFire", "weaponUpgrade", "scoreMultiplier"]
        let randomType = powerUpTypes.randomElement() ?? "shield"
        
        switch randomType {
        case "shield":
            shieldActive = true
            shieldTimer = 5.0
        case "rapidFire":
            rapidFireActive = true
            rapidFireTimer = 3.0
            shotCooldown = 0.05
        case "weaponUpgrade":
            if let currentIndex = WeaponType.allCases.firstIndex(of: currentWeapon) {
                let nextIndex = min(currentIndex + 1, WeaponType.allCases.count - 1)
                currentWeapon = WeaponType.allCases[nextIndex]
            }
        case "scoreMultiplier":
            scoreMultiplier = 2
            scoreMultiplierTimer = 10.0
        default:
            break
        }
    }
    
    // MARK: - Challenge Completion
    private func completeChallenge(_ challenge: Challenge) {
        score += challenge.reward
        
        let rewardLabel = SKLabelNode(fontNamed: "Arial-Bold")
        rewardLabel.text = "Challenge Complete! +\(challenge.reward) points"
        rewardLabel.fontSize = 20
        rewardLabel.fontColor = .green
        rewardLabel.position = CGPoint(x: size.width/2, y: size.height/2)
        rewardLabel.zPosition = 200
        addChild(rewardLabel)
        
        // Remove after 2 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            rewardLabel.removeFromParent()
        }
        
        currentChallenge = nil
    }
    
    // MARK: - Game Over
    private func gameOver() {
        gameState = .gameOver
        
        if score > highScore {
            highScore = score
        }
        
        // Show game over screen
        let gameOverLabel = SKLabelNode(fontNamed: "Arial-Bold")
        gameOverLabel.text = "GAME OVER"
        gameOverLabel.fontSize = 48
        gameOverLabel.fontColor = .red
        gameOverLabel.position = CGPoint(x: size.width/2, y: size.height/2 + 50)
        gameOverLabel.zPosition = 200
        addChild(gameOverLabel)
        
        let finalScoreLabel = SKLabelNode(fontNamed: "Arial")
        finalScoreLabel.text = "Final Score: \(score)"
        finalScoreLabel.fontSize = 24
        finalScoreLabel.fontColor = .white
        finalScoreLabel.position = CGPoint(x: size.width/2, y: size.height/2)
        finalScoreLabel.zPosition = 200
        addChild(finalScoreLabel)
        
        let restartButton = SKLabelNode(fontNamed: "Arial-Bold")
        restartButton.text = "Play Again"
        restartButton.fontSize = 28
        restartButton.fontColor = .green
        restartButton.position = CGPoint(x: size.width/2, y: size.height/2 - 50)
        restartButton.name = "restartButton"
        restartButton.zPosition = 200
        addChild(restartButton)
        
        let menuButton = SKLabelNode(fontNamed: "Arial-Bold")
        menuButton.text = "Main Menu"
        menuButton.fontSize = 24
        menuButton.fontColor = .blue
        menuButton.position = CGPoint(x: size.width/2, y: size.height/2 - 90)
        menuButton.name = "menuButton"
        menuButton.zPosition = 200
        addChild(menuButton)
    }
}
