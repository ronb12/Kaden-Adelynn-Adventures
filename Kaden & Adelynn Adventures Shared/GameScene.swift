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
    private var lives: Int = 25
    private var highScore: Int = 0
    private var level: Int = 1
    private var survivalTime: TimeInterval = 0
    private var startTime: TimeInterval = 0
    
    // MARK: - Player & Weapons
    private var player: SKSpriteNode!
    private var currentWeapon: WeaponType = .laser
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
    
    // MARK: - Weapon Types
    enum WeaponType: CaseIterable {
        case laser, missile, plasma, sonic, fire, ice, lightning, poison, void, cosmic
        
        var damage: Int {
            switch self {
            case .laser: return 1
            case .missile: return 2
            case .plasma: return 3
            case .sonic: return 2
            case .fire: return 4
            case .ice: return 3
            case .lightning: return 5
            case .poison: return 2
            case .void: return 6
            case .cosmic: return 8
            }
        }
        
        var color: SKColor {
            switch self {
            case .laser: return .red
            case .missile: return .orange
            case .plasma: return .purple
            case .sonic: return .blue
            case .fire: return .red
            case .ice: return .cyan
            case .lightning: return .yellow
            case .poison: return .green
            case .void: return .black
            case .cosmic: return .white
            }
        }
        
        var name: String {
            switch self {
            case .laser: return "Laser"
            case .missile: return "Missile"
            case .plasma: return "Plasma"
            case .sonic: return "Sonic"
            case .fire: return "Fire"
            case .ice: return "Ice"
            case .lightning: return "Lightning"
            case .poison: return "Poison"
            case .void: return "Void"
            case .cosmic: return "Cosmic"
            }
        }
        
        var fireRate: TimeInterval {
            switch self {
            case .laser: return 0.2
            case .missile: return 0.4
            case .plasma: return 0.3
            case .sonic: return 0.15
            case .fire: return 0.25
            case .ice: return 0.3
            case .lightning: return 0.1
            case .poison: return 0.35
            case .void: return 0.5
            case .cosmic: return 0.2
            }
        }
    }
    
    enum GameState {
        case menu, playing, paused, gameOver
    }
    
    struct Challenge {
        let name: String
        let description: String
        let target: Int
        let reward: Int
        let type: ChallengeType
    }
    
    enum ChallengeType {
        case destroyEnemies, collectPowerups, surviveTime, scorePoints
    }
    
    // MARK: - Scene Setup
    override func didMove(to view: SKView) {
        setupPhysics()
        setupUI()
        setupStars()
        loadHighScores()
        showMainMenu()
    }
    
    private func setupPhysics() {
        physicsWorld.gravity = CGVector(dx: 0, dy: 0)
        physicsWorld.contactDelegate = self
    }
    
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
        livesLabel.text = "Lives: 25"
        livesLabel.fontSize = 24
        livesLabel.fontColor = .white
        livesLabel.position = CGPoint(x: 100, y: size.height - 80)
        livesLabel.zPosition = 100
        addChild(livesLabel)
        
        // Weapon Label
        weaponLabel = SKLabelNode(fontNamed: "Arial-Bold")
        weaponLabel.text = "Weapon: Laser"
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
        lives = 25
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
        currentWeapon = .laser
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
        
        updateStars()
        updatePlayer()
        updateBullets()
        updateEnemyBullets()
        updateEnemies()
        updatePowerups()
        updateParticles()
        updateTimers()
        
        spawnEnemies()
        spawnPowerups()
        spawnCollectibles()
        
        updateDifficulty()
        updateUI()
    }
    
    private func updateStars() {
        for star in stars {
            star.position.y -= 0.5
            if star.position.y < -10 {
                star.position.y = size.height + 10
                star.position.x = CGFloat.random(in: 0...size.width)
            }
        }
    }
    
    private func updatePlayer() {
        // Auto-shooting
        let currentTime = Date().timeIntervalSince1970
        if currentTime - lastShotTime >= shotCooldown {
            shootBullet()
            lastShotTime = currentTime
        }
        
        // Shield effect
        if shieldActive {
            if shieldTimer <= 0 {
                shieldActive = false
                player.removeAction(forKey: "shield")
            } else {
                shieldTimer -= 1/60.0 // Assuming 60 FPS
            }
        }
        
        // Rapid fire effect
        if rapidFireActive {
            if rapidFireTimer <= 0 {
                rapidFireActive = false
                shotCooldown = WeaponType.laser.fireRate
            } else {
                rapidFireTimer -= 1/60.0
                shotCooldown = 0.1
            }
        }
    }
    
    private func shootBullet() {
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
        
        // Double shot
        if doubleShot {
            let bullet2 = bullet.copy() as! SKSpriteNode
            bullet2.position.x += 10
            bullets.append(bullet2)
            addChild(bullet2)
            bullet2.run(SKAction.sequence([moveAction, removeAction]))
        }
    }
    
    private func updateBullets() {
        bullets = bullets.filter { bullet in
            if bullet.position.y > size.height + 10 {
                bullet.removeFromParent()
                return false
            }
            return true
        }
    }
    
    private func updateEnemyBullets() {
        enemyBullets = enemyBullets.filter { bullet in
            if bullet.position.y < -10 {
                bullet.removeFromParent()
                return false
            }
            return true
        }
    }
    
    private func updateEnemies() {
        enemies = enemies.filter { enemy in
            if enemy.position.y < -enemy.size.height {
                enemy.removeFromParent()
                return false
            }
            return true
        }
        
        // Enemy shooting
        for enemy in enemies {
            if Int.random(in: 0...1000) < 2 { // 0.2% chance per frame
                shootEnemyBullet(from: enemy)
            }
        }
    }
    
    private func shootEnemyBullet(from enemy: SKSpriteNode) {
        let bullet = SKSpriteNode(color: .red, size: CGSize(width: 3, height: 6))
        bullet.position = CGPoint(x: enemy.position.x, y: enemy.position.y - enemy.size.height/2)
        bullet.zPosition = 5
        
        bullet.physicsBody = SKPhysicsBody(rectangleOf: bullet.size)
        bullet.physicsBody?.isDynamic = true
        bullet.physicsBody?.categoryBitMask = PhysicsCategory.enemyBullet
        bullet.physicsBody?.contactTestBitMask = PhysicsCategory.player
        bullet.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        enemyBullets.append(bullet)
        addChild(bullet)
        
        let moveAction = SKAction.moveBy(x: 0, y: -bulletSpeed, duration: 1.0)
        let removeAction = SKAction.removeFromParent()
        bullet.run(SKAction.sequence([moveAction, removeAction]))
    }
    
    private func updatePowerups() {
        powerUps = powerUps.filter { powerUp in
            if powerUp.position.y < -powerUp.size.height {
                powerUp.removeFromParent()
                return false
            }
            return true
        }
    }
    
    private func updateParticles() {
        particles = particles.filter { particle in
            if particle.alpha <= 0 {
                particle.removeFromParent()
                return false
            }
            particle.alpha -= 0.02
            return true
        }
    }
    
    private func updateTimers() {
        if scoreMultiplierTimer > 0 {
            scoreMultiplierTimer -= 1/60.0
            if scoreMultiplierTimer <= 0 {
                scoreMultiplier = 1
            }
        }
    }
    
    // MARK: - Spawning
    private func spawnEnemies() {
        let currentTime = Date().timeIntervalSince1970
        if currentTime - lastEnemySpawn >= enemySpawnRate {
            spawnEnemy()
            lastEnemySpawn = currentTime
        }
    }
    
    private func spawnEnemy() {
        let enemy = SKSpriteNode(color: .red, size: CGSize(width: 40, height: 30))
        enemy.position = CGPoint(x: CGFloat.random(in: enemy.size.width/2...size.width - enemy.size.width/2),
                               y: size.height + enemy.size.height/2)
        enemy.zPosition = 5
        
        enemy.physicsBody = SKPhysicsBody(rectangleOf: enemy.size)
        enemy.physicsBody?.isDynamic = true
        enemy.physicsBody?.categoryBitMask = PhysicsCategory.enemy
        enemy.physicsBody?.contactTestBitMask = PhysicsCategory.bullet | PhysicsCategory.player
        enemy.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        enemies.append(enemy)
        addChild(enemy)
        
        let moveAction = SKAction.moveBy(x: 0, y: -enemySpeed, duration: 3.0)
        let removeAction = SKAction.removeFromParent()
        enemy.run(SKAction.sequence([moveAction, removeAction]))
    }
    
    private func spawnPowerups() {
        let currentTime = Date().timeIntervalSince1970
        if currentTime - lastPowerUpSpawn >= powerUpSpawnRate {
            spawnPowerUp()
            lastPowerUpSpawn = currentTime
        }
    }
    
    private func spawnPowerUp() {
        let powerUpTypes = ["🚀", "❤️", "⚡", "🛡️", "💎"]
        let randomType = powerUpTypes.randomElement() ?? "🚀"
        
        let powerUp = SKSpriteNode(color: .clear, size: CGSize(width: 30, height: 30))
        powerUp.position = CGPoint(x: CGFloat.random(in: powerUp.size.width/2...size.width - powerUp.size.width/2),
                                 y: size.height + powerUp.size.height/2)
        powerUp.zPosition = 5
        
        // Add emoji label
        let emojiLabel = SKLabelNode(text: randomType)
        emojiLabel.fontSize = 20
        emojiLabel.verticalAlignmentMode = .center
        powerUp.addChild(emojiLabel)
        
        powerUp.physicsBody = SKPhysicsBody(rectangleOf: powerUp.size)
        powerUp.physicsBody?.isDynamic = true
        powerUp.physicsBody?.categoryBitMask = PhysicsCategory.powerUp
        powerUp.physicsBody?.contactTestBitMask = PhysicsCategory.player
        powerUp.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        powerUps.append(powerUp)
        addChild(powerUp)
        
        let moveAction = SKAction.moveBy(x: 0, y: -powerUpSpeed, duration: 4.0)
        let removeAction = SKAction.removeFromParent()
        powerUp.run(SKAction.sequence([moveAction, removeAction]))
    }
    
    private func spawnCollectibles() {
        let currentTime = Date().timeIntervalSince1970
        
        // Spawn money
        if currentTime - lastMoneySpawn >= moneySpawnRate {
            spawnMoney()
            lastMoneySpawn = currentTime
        }
        
        // Spawn diamonds
        if currentTime - lastDiamondSpawn >= diamondSpawnRate {
            spawnDiamond()
            lastDiamondSpawn = currentTime
        }
    }
    
    private func spawnMoney() {
        let money = SKSpriteNode(color: .yellow, size: CGSize(width: 15, height: 15))
        money.position = CGPoint(x: CGFloat.random(in: money.size.width/2...size.width - money.size.width/2),
                               y: size.height + money.size.height/2)
        money.zPosition = 5
        
        money.physicsBody = SKPhysicsBody(rectangleOf: money.size)
        money.physicsBody?.isDynamic = true
        money.physicsBody?.categoryBitMask = PhysicsCategory.money
        money.physicsBody?.contactTestBitMask = PhysicsCategory.player
        money.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        self.money.append(money)
        addChild(money)
        
        let moveAction = SKAction.moveBy(x: 0, y: -powerUpSpeed, duration: 4.0)
        let removeAction = SKAction.removeFromParent()
        money.run(SKAction.sequence([moveAction, removeAction]))
    }
    
    private func spawnDiamond() {
        let diamond = SKSpriteNode(color: .cyan, size: CGSize(width: 20, height: 20))
        diamond.position = CGPoint(x: CGFloat.random(in: diamond.size.width/2...size.width - diamond.size.width/2),
                                 y: size.height + diamond.size.height/2)
        diamond.zPosition = 5
        
        diamond.physicsBody = SKPhysicsBody(rectangleOf: diamond.size)
        diamond.physicsBody?.isDynamic = true
        diamond.physicsBody?.categoryBitMask = PhysicsCategory.diamond
        diamond.physicsBody?.contactTestBitMask = PhysicsCategory.player
        diamond.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        diamonds.append(diamond)
        addChild(diamond)
        
        let moveAction = SKAction.moveBy(x: 0, y: -powerUpSpeed, duration: 4.0)
        let removeAction = SKAction.removeFromParent()
        diamond.run(SKAction.sequence([moveAction, removeAction]))
    }
    
    // MARK: - Collision Detection
    func didBegin(_ contact: SKPhysicsContact) {
        let collision = contact.bodyA.categoryBitMask | contact.bodyB.categoryBitMask
        
        if collision == PhysicsCategory.bullet | PhysicsCategory.enemy {
            handleBulletEnemyCollision(contact)
        } else if collision == PhysicsCategory.player | PhysicsCategory.enemy {
            handlePlayerEnemyCollision(contact)
        } else if collision == PhysicsCategory.player | PhysicsCategory.enemyBullet {
            handlePlayerEnemyBulletCollision(contact)
        } else if collision == PhysicsCategory.player | PhysicsCategory.powerUp {
            handlePlayerPowerUpCollision(contact)
        } else if collision == PhysicsCategory.player | PhysicsCategory.money {
            handlePlayerMoneyCollision(contact)
        } else if collision == PhysicsCategory.player | PhysicsCategory.diamond {
            handlePlayerDiamondCollision(contact)
        }
    }
    
    private func handleBulletEnemyCollision(_ contact: SKPhysicsContact) {
        let bullet = contact.bodyA.categoryBitMask == PhysicsCategory.bullet ? contact.bodyA.node : contact.bodyB.node
        let enemy = contact.bodyA.categoryBitMask == PhysicsCategory.enemy ? contact.bodyA.node : contact.bodyB.node
        
        bullet?.removeFromParent()
        enemy?.removeFromParent()
        
        // Remove from arrays
        if let bullet = bullet as? SKSpriteNode {
            bullets.removeAll { $0 == bullet }
        }
        if let enemy = enemy as? SKSpriteNode {
            enemies.removeAll { $0 == enemy }
        }
        
        // Create explosion
        createExplosion(at: enemy?.position ?? CGPoint.zero)
        
        // Update score
        score += 10 * scoreMultiplier
        totalEnemiesDestroyed += 1
        consecutiveHits += 1
        maxConsecutiveHits = max(maxConsecutiveHits, consecutiveHits)
        
        // Check for weapon upgrade
        if totalEnemiesDestroyed % 10 == 0 {
            upgradeWeapon()
        }
    }
    
    private func handlePlayerEnemyCollision(_ contact: SKPhysicsContact) {
        if !shieldActive {
            lives -= 1
            consecutiveHits = 0
            
            if lives <= 0 {
                gameOver()
            } else {
                createExplosion(at: player.position)
            }
        }
    }
    
    private func handlePlayerEnemyBulletCollision(_ contact: SKPhysicsContact) {
        let bullet = contact.bodyA.categoryBitMask == PhysicsCategory.enemyBullet ? contact.bodyA.node : contact.bodyB.node
        
        bullet?.removeFromParent()
        
        if let bullet = bullet as? SKSpriteNode {
            enemyBullets.removeAll { $0 == bullet }
        }
        
        if !shieldActive {
            lives -= 1
            consecutiveHits = 0
            
            if lives <= 0 {
                gameOver()
            }
        }
    }
    
    private func handlePlayerPowerUpCollision(_ contact: SKPhysicsContact) {
        let powerUp = contact.bodyA.categoryBitMask == PhysicsCategory.powerUp ? contact.bodyA.node : contact.bodyB.node
        
        powerUp?.removeFromParent()
        
        if let powerUp = powerUp as? SKSpriteNode {
            powerUps.removeAll { $0 == powerUp }
            
            // Check power-up type based on emoji
            if let emojiLabel = powerUp.children.first as? SKLabelNode {
                switch emojiLabel.text {
                case "🚀":
                    upgradeWeapon()
                case "❤️":
                    lives = min(lives + 1, 25)
                case "⚡":
                    activateRapidFire()
                case "🛡️":
                    activateShield()
                case "💎":
                    activateDiamondPower()
                default:
                    break
                }
            }
        }
        
        totalPowerupsCollected += 1
    }
    
    private func handlePlayerMoneyCollision(_ contact: SKPhysicsContact) {
        let money = contact.bodyA.categoryBitMask == PhysicsCategory.money ? contact.bodyA.node : contact.bodyB.node
        
        money?.removeFromParent()
        
        if let money = money as? SKSpriteNode {
            self.money.removeAll { $0 == money }
        }
        
        moneyCount += 1
        score += 5
    }
    
    private func handlePlayerDiamondCollision(_ contact: SKPhysicsContact) {
        let diamond = contact.bodyA.categoryBitMask == PhysicsCategory.diamond ? contact.bodyA.node : contact.bodyB.node
        
        diamond?.removeFromParent()
        
        if let diamond = diamond as? SKSpriteNode {
            diamonds.removeAll { $0 == diamond }
        }
        
        diamondCount += 1
        score += 20
        bulletDamage += 1
    }
    
    private func createExplosion(at position: CGPoint) {
        for _ in 0..<10 {
            let particle = SKSpriteNode(color: .red, size: CGSize(width: 2, height: 2))
            particle.position = position
            particle.zPosition = 15
            
            let randomX = CGFloat.random(in: -50...50)
            let randomY = CGFloat.random(in: -50...50)
            let moveAction = SKAction.moveBy(x: randomX, y: randomY, duration: 0.5)
            let fadeAction = SKAction.fadeOut(withDuration: 0.5)
            let groupAction = SKAction.group([moveAction, fadeAction])
            let removeAction = SKAction.removeFromParent()
            
            particle.run(SKAction.sequence([groupAction, removeAction]))
            particles.append(particle)
            addChild(particle)
        }
    }
    
    // MARK: - Power-ups
    private func upgradeWeapon() {
        let weapons = WeaponType.allCases
        if let currentIndex = weapons.firstIndex(of: currentWeapon) {
            let nextIndex = (currentIndex + 1) % weapons.count
            currentWeapon = weapons[nextIndex]
            shotCooldown = currentWeapon.fireRate
        }
    }
    
    private func activateRapidFire() {
        rapidFireActive = true
        rapidFireTimer = 5.0 // 5 seconds
        shotCooldown = 0.1
    }
    
    private func activateShield() {
        shieldActive = true
        shieldTimer = 3.0 // 3 seconds
        
        // Visual shield effect
        let shieldAction = SKAction.sequence([
            SKAction.scale(to: 1.2, duration: 0.1),
            SKAction.scale(to: 1.0, duration: 0.1)
        ])
        player.run(SKAction.repeatForever(shieldAction), withKey: "shield")
    }
    
    private func activateDiamondPower() {
        scoreMultiplier = 2
        scoreMultiplierTimer = 10.0 // 10 seconds
    }
    
    // MARK: - Challenge System
    private func initializeChallenges() {
        challenges = [
            Challenge(name: "Enemy Hunter", description: "Destroy 20 enemies", target: 20, reward: 100, type: .destroyEnemies),
            Challenge(name: "Power Collector", description: "Collect 5 power-ups", target: 5, reward: 150, type: .collectPowerups),
            Challenge(name: "Survivor", description: "Survive for 2 minutes", target: 120, reward: 200, type: .surviveTime),
            Challenge(name: "High Scorer", description: "Score 1000 points", target: 1000, reward: 300, type: .scorePoints)
        ]
    }
    
    private func startRandomChallenge() {
        guard let challenge = challenges.randomElement() else { return }
        currentChallenge = challenge
        challengeProgress = 0
        challengeTimer = 30.0 // 30 seconds to complete
        
        // Show challenge notification
        showChallengeNotification(challenge)
    }
    
    private func showChallengeNotification(_ challenge: Challenge) {
        let notification = SKLabelNode(fontNamed: "Arial-Bold")
        notification.text = "🎯 \(challenge.name): \(challenge.description)"
        notification.fontSize = 18
        notification.fontColor = .yellow
        notification.position = CGPoint(x: size.width/2, y: size.height/2 + 50)
        notification.zPosition = 200
        addChild(notification)
        
        let fadeOut = SKAction.fadeOut(withDuration: 3.0)
        let remove = SKAction.removeFromParent()
        notification.run(SKAction.sequence([fadeOut, remove]))
    }
    
    private func updateChallengeProgress(_ type: ChallengeType, _ value: Int) {
        guard let challenge = currentChallenge else { return }
        
        switch type {
        case .destroyEnemies:
            if challenge.type == .destroyEnemies {
                challengeProgress += 1
            }
        case .collectPowerups:
            if challenge.type == .collectPowerups {
                challengeProgress += 1
            }
        case .surviveTime:
            if challenge.type == .surviveTime {
                challengeProgress = Int(survivalTime)
            }
        case .scorePoints:
            if challenge.type == .scorePoints {
                challengeProgress = score
            }
        }
        
        if challengeProgress >= challenge.target {
            completeChallenge()
        }
    }
    
    private func completeChallenge() {
        guard let challenge = currentChallenge else { return }
        
        score += challenge.reward
        
        let completionLabel = SKLabelNode(fontNamed: "Arial-Bold")
        completionLabel.text = "🎉 Challenge Complete! +\(challenge.reward) points"
        completionLabel.fontSize = 20
        completionLabel.fontColor = .green
        completionLabel.position = CGPoint(x: size.width/2, y: size.height/2)
        completionLabel.zPosition = 200
        addChild(completionLabel)
        
        let fadeOut = SKAction.fadeOut(withDuration: 2.0)
        let remove = SKAction.removeFromParent()
        completionLabel.run(SKAction.sequence([fadeOut, remove]))
        
        currentChallenge = nil
    }
    
    // MARK: - Difficulty Scaling
    private func updateDifficulty() {
        let timeElapsed = survivalTime
        
        // Increase enemy spawn rate
        if timeElapsed > 30 && enemySpawnRate > 0.5 {
            enemySpawnRate -= 0.1
        }
        
        // Increase level
        let newLevel = Int(timeElapsed / 60) + 1
        if newLevel != level {
            level = newLevel
            showLevelUpNotification()
        }
    }
    
    private func showLevelUpNotification() {
        let levelLabel = SKLabelNode(fontNamed: "Arial-Bold")
        levelLabel.text = "🚀 Level \(level)!"
        levelLabel.fontSize = 24
        levelLabel.fontColor = .cyan
        levelLabel.position = CGPoint(x: size.width/2, y: size.height/2)
        levelLabel.zPosition = 200
        addChild(levelLabel)
        
        let scaleUp = SKAction.scale(to: 1.5, duration: 0.3)
        let scaleDown = SKAction.scale(to: 1.0, duration: 0.3)
        let fadeOut = SKAction.fadeOut(withDuration: 1.0)
        let remove = SKAction.removeFromParent()
        levelLabel.run(SKAction.sequence([scaleUp, scaleDown, fadeOut, remove]))
    }
    
    // MARK: - UI Updates
    private func updateUI() {
        scoreLabel.text = "Score: \(score)"
        livesLabel.text = "Lives: \(lives)"
        weaponLabel.text = "Weapon: \(currentWeapon.name)"
        levelLabel.text = "Level: \(level)"
    }
    
    // MARK: - Game Over
    private func gameOver() {
        gameState = .gameOver
        
        // Save high score
        if score > highScore {
            highScore = score
            saveHighScores()
        }
        
        // Show game over screen
        showGameOverScreen()
    }
    
    private func showGameOverScreen() {
        // Background overlay
        let overlay = SKSpriteNode(color: UIColor.black.withAlphaComponent(0.8), size: size)
        overlay.position = CGPoint(x: size.width/2, y: size.height/2)
        overlay.zPosition = 150
        addChild(overlay)
        
        // Game Over text
        let gameOverLabel = SKLabelNode(fontNamed: "Arial-Bold")
        gameOverLabel.text = "GAME OVER"
        gameOverLabel.fontSize = 36
        gameOverLabel.fontColor = .red
        gameOverLabel.position = CGPoint(x: size.width/2, y: size.height/2 + 100)
        gameOverLabel.zPosition = 151
        addChild(gameOverLabel)
        
        // Final score
        let finalScoreLabel = SKLabelNode(fontNamed: "Arial")
        finalScoreLabel.text = "Final Score: \(score)"
        finalScoreLabel.fontSize = 24
        finalScoreLabel.fontColor = .white
        finalScoreLabel.position = CGPoint(x: size.width/2, y: size.height/2 + 50)
        finalScoreLabel.zPosition = 151
        addChild(finalScoreLabel)
        
        // High score
        if score == highScore {
            let highScoreLabel = SKLabelNode(fontNamed: "Arial")
            highScoreLabel.text = "🏆 NEW HIGH SCORE! 🏆"
            highScoreLabel.fontSize = 20
            highScoreLabel.fontColor = .yellow
            highScoreLabel.position = CGPoint(x: size.width/2, y: size.height/2 + 20)
            highScoreLabel.zPosition = 151
            addChild(highScoreLabel)
        }
        
        // Stats
        let statsLabel = SKLabelNode(fontNamed: "Arial")
        statsLabel.text = "Enemies Destroyed: \(totalEnemiesDestroyed) • Power-ups: \(totalPowerupsCollected)"
        statsLabel.fontSize = 16
        statsLabel.fontColor = .gray
        statsLabel.position = CGPoint(x: size.width/2, y: size.height/2 - 20)
        statsLabel.zPosition = 151
        addChild(statsLabel)
        
        // Restart button
        let restartButton = SKLabelNode(fontNamed: "Arial-Bold")
        restartButton.text = "PLAY AGAIN"
        restartButton.fontSize = 24
        restartButton.fontColor = .green
        restartButton.position = CGPoint(x: size.width/2, y: size.height/2 - 80)
        restartButton.name = "restartButton"
        restartButton.zPosition = 151
        addChild(restartButton)
        
        // Menu button
        let menuButton = SKLabelNode(fontNamed: "Arial-Bold")
        menuButton.text = "MAIN MENU"
        menuButton.fontSize = 20
        menuButton.fontColor = .blue
        menuButton.position = CGPoint(x: size.width/2, y: size.height/2 - 120)
        menuButton.name = "menuButton"
        menuButton.zPosition = 151
        addChild(menuButton)
    }
    
    // MARK: - Data Persistence
    private func loadHighScores() {
        if let savedScore = UserDefaults.standard.object(forKey: "highScore") as? Int {
            highScore = savedScore
        }
    }
    
    private func saveHighScores() {
        UserDefaults.standard.set(highScore, forKey: "highScore")
    }
}

// MARK: - Class Method for Scene Creation
extension GameScene {
    class func newGameScene() -> GameScene {
        guard let scene = SKScene(fileNamed: "GameScene") as? GameScene else {
            return GameScene(size: CGSize(width: 1000, height: 700))
        }
        return scene
    }
}
