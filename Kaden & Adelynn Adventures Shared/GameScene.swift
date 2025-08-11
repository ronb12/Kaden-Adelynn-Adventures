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
    private var currentWeapon: WeaponType = .laser
    private var rapidFireActive: Bool = false
    private var rapidFireTimer: TimeInterval = 0
    
    // MARK: - Game Objects
    private var player: SKSpriteNode!
    private var enemies: [SKSpriteNode] = []
    private var bullets: [SKSpriteNode] = []
    private var enemyBullets: [SKSpriteNode] = []
    private var powerUps: [SKSpriteNode] = []
    private var money: [SKSpriteNode] = []
    private var diamonds: [SKSpriteNode] = []
    
    // MARK: - UI Elements
    private var scoreLabel: SKLabelNode!
    private var livesLabel: SKLabelNode!
    private var weaponLabel: SKLabelNode!
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
    }
    
    enum GameState {
        case menu, playing, paused, gameOver
    }
    
    // MARK: - Scene Setup
    override func didMove(to view: SKView) {
        setupPhysics()
        setupUI()
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
    }
    
    // MARK: - Main Menu
    private func showMainMenu() {
        gameState = .menu
        
        // Clear existing nodes
        removeAllChildren()
        setupUI()
        
        // Background
        let background = SKSpriteNode(color: .black, size: size)
        background.position = CGPoint(x: size.width/2, y: size.height/2)
        background.zPosition = -1
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
        instructionsLabel.text = "Tap to move • Collect power-ups • Survive!"
        instructionsLabel.fontSize = 16
        instructionsLabel.fontColor = .gray
        instructionsLabel.position = CGPoint(x: size.width/2, y: size.height/2 - 100)
        addChild(instructionsLabel)
    }
    
    // MARK: - Game Start
    private func startGame() {
        gameState = .playing
        score = 0
        lives = 25
        currentWeapon = .laser
        rapidFireActive = false
        
        // Clear existing nodes
        removeAllChildren()
        setupUI()
        
        // Background
        let background = SKSpriteNode(color: .black, size: size)
        background.position = CGPoint(x: size.width/2, y: size.height/2)
        background.zPosition = -1
        addChild(background)
        
        // Create player
        createPlayer()
        
        // Start spawning
        startSpawning()
    }
    
    private func createPlayer() {
        player = SKSpriteNode(color: .blue, size: CGSize(width: 40, height: 40))
        player.position = CGPoint(x: size.width/2, y: 100)
        player.zPosition = 10
        
        // Physics
        player.physicsBody = SKPhysicsBody(rectangleOf: player.size)
        player.physicsBody?.isDynamic = true
        player.physicsBody?.categoryBitMask = PhysicsCategory.player
        player.physicsBody?.contactTestBitMask = PhysicsCategory.enemy | PhysicsCategory.enemyBullet | PhysicsCategory.powerUp | PhysicsCategory.money | PhysicsCategory.diamond
        player.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        addChild(player)
    }
    
    // MARK: - Spawning
    private func startSpawning() {
        // Start spawning enemies and items
        let spawnAction = SKAction.run { [weak self] in
            self?.spawnEnemy()
        }
        let waitAction = SKAction.wait(forDuration: enemySpawnRate)
        let spawnSequence = SKAction.sequence([spawnAction, waitAction])
        run(SKAction.repeatForever(spawnSequence), withKey: "enemySpawning")
        
        // Spawn power-ups
        let powerUpSpawnAction = SKAction.run { [weak self] in
            self?.spawnPowerUp()
        }
        let powerUpWaitAction = SKAction.wait(forDuration: powerUpSpawnRate)
        let powerUpSequence = SKAction.sequence([powerUpSpawnAction, powerUpWaitAction])
        run(SKAction.repeatForever(powerUpSequence), withKey: "powerUpSpawning")
        
        // Spawn money
        let moneySpawnAction = SKAction.run { [weak self] in
            self?.spawnMoney()
        }
        let moneyWaitAction = SKAction.wait(forDuration: moneySpawnRate)
        let moneySequence = SKAction.sequence([moneySpawnAction, moneyWaitAction])
        run(SKAction.repeatForever(moneySequence), withKey: "moneySpawning")
        
        // Spawn diamonds
        let diamondSpawnAction = SKAction.run { [weak self] in
            self?.spawnDiamond()
        }
        let diamondWaitAction = SKAction.wait(forDuration: diamondSpawnRate)
        let diamondSequence = SKAction.sequence([diamondSpawnAction, diamondWaitAction])
        run(SKAction.repeatForever(diamondSequence), withKey: "diamondSpawning")
    }
    
    private func spawnEnemy() {
        let enemy = SKSpriteNode(color: .red, size: CGSize(width: 30, height: 30))
        let randomX = CGFloat.random(in: 30...size.width-30)
        enemy.position = CGPoint(x: randomX, y: size.height + 30)
        enemy.zPosition = 5
        
        // Physics
        enemy.physicsBody = SKPhysicsBody(rectangleOf: enemy.size)
        enemy.physicsBody?.isDynamic = true
        enemy.physicsBody?.categoryBitMask = PhysicsCategory.enemy
        enemy.physicsBody?.contactTestBitMask = PhysicsCategory.bullet | PhysicsCategory.player
        enemy.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        addChild(enemy)
        enemies.append(enemy)
        
        // Move down
        let moveAction = SKAction.moveBy(x: 0, y: -(size.height + 60), duration: 4.0)
        let removeAction = SKAction.removeFromParent()
        enemy.run(SKAction.sequence([moveAction, removeAction]))
        
        // Enemy shooting
        let shootAction = SKAction.run { [weak self] in
            self?.enemyShoot(enemy: enemy)
        }
        let shootWait = SKAction.wait(forDuration: 2.0)
        let shootSequence = SKAction.sequence([shootWait, shootAction])
        enemy.run(SKAction.repeatForever(shootSequence))
    }
    
    private func spawnPowerUp() {
        let powerUpTypes: [WeaponType] = [.missile, .plasma, .sonic, .fire, .ice, .lightning, .poison, .void, .cosmic]
        let randomType = powerUpTypes.randomElement() ?? .missile
        
        let powerUp = SKSpriteNode(color: randomType.color, size: CGSize(width: 25, height: 25))
        let randomX = CGFloat.random(in: 30...size.width-30)
        powerUp.position = CGPoint(x: randomX, y: size.height + 30)
        powerUp.zPosition = 5
        powerUp.name = "powerUp_\(randomType.name)"
        
        // Physics
        powerUp.physicsBody = SKPhysicsBody(rectangleOf: powerUp.size)
        powerUp.physicsBody?.isDynamic = true
        powerUp.physicsBody?.categoryBitMask = PhysicsCategory.powerUp
        powerUp.physicsBody?.contactTestBitMask = PhysicsCategory.player
        powerUp.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        addChild(powerUp)
        powerUps.append(powerUp)
        
        // Move down
        let moveAction = SKAction.moveBy(x: 0, y: -(size.height + 60), duration: 6.0)
        let removeAction = SKAction.removeFromParent()
        powerUp.run(SKAction.sequence([moveAction, removeAction]))
    }
    
    private func spawnMoney() {
        let money = SKSpriteNode(color: .yellow, size: CGSize(width: 20, height: 20))
        let randomX = CGFloat.random(in: 30...size.width-30)
        money.position = CGPoint(x: randomX, y: size.height + 30)
        money.zPosition = 5
        money.name = "money"
        
        // Physics
        money.physicsBody = SKPhysicsBody(rectangleOf: money.size)
        money.physicsBody?.isDynamic = true
        money.physicsBody?.categoryBitMask = PhysicsCategory.money
        money.physicsBody?.contactTestBitMask = PhysicsCategory.player
        money.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        addChild(money)
        self.money.append(money)
        
        // Move down
        let moveAction = SKAction.moveBy(x: 0, y: -(size.height + 60), duration: 5.0)
        let removeAction = SKAction.removeFromParent()
        money.run(SKAction.sequence([moveAction, removeAction]))
    }
    
    private func spawnDiamond() {
        let diamond = SKSpriteNode(color: .cyan, size: CGSize(width: 25, height: 25))
        let randomX = CGFloat.random(in: 30...size.width-30)
        diamond.position = CGPoint(x: randomX, y: size.height + 30)
        diamond.zPosition = 5
        diamond.name = "diamond"
        
        // Physics
        diamond.physicsBody = SKPhysicsBody(rectangleOf: diamond.size)
        diamond.physicsBody?.isDynamic = true
        diamond.physicsBody?.categoryBitMask = PhysicsCategory.diamond
        diamond.physicsBody?.contactTestBitMask = PhysicsCategory.player
        diamond.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        addChild(diamond)
        diamonds.append(diamond)
        
        // Move down
        let moveAction = SKAction.moveBy(x: 0, y: -(size.height + 60), duration: 5.0)
        let removeAction = SKAction.removeFromParent()
        diamond.run(SKAction.sequence([moveAction, removeAction]))
    }
    
    // MARK: - Shooting
    private func playerShoot() {
        let bullet = SKSpriteNode(color: currentWeapon.color, size: CGSize(width: 4, height: 12))
        bullet.position = CGPoint(x: player.position.x, y: player.position.y + 30)
        bullet.zPosition = 8
        
        // Physics
        bullet.physicsBody = SKPhysicsBody(rectangleOf: bullet.size)
        bullet.physicsBody?.isDynamic = true
        bullet.physicsBody?.categoryBitMask = PhysicsCategory.bullet
        bullet.physicsBody?.contactTestBitMask = PhysicsCategory.enemy
        bullet.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        addChild(bullet)
        bullets.append(bullet)
        
        // Move up
        let moveAction = SKAction.moveBy(x: 0, y: size.height + 50, duration: 1.0)
        let removeAction = SKAction.removeFromParent()
        bullet.run(SKAction.sequence([moveAction, removeAction]))
        
        // Rapid fire
        if rapidFireActive {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
                self?.playerShoot()
            }
        }
    }
    
    private func enemyShoot(enemy: SKSpriteNode) {
        let bullet = SKSpriteNode(color: .red, size: CGSize(width: 3, height: 8))
        bullet.position = CGPoint(x: enemy.position.x, y: enemy.position.y - 20)
        bullet.zPosition = 8
        
        // Physics
        bullet.physicsBody = SKPhysicsBody(rectangleOf: bullet.size)
        bullet.physicsBody?.isDynamic = true
        bullet.physicsBody?.categoryBitMask = PhysicsCategory.enemyBullet
        bullet.physicsBody?.contactTestBitMask = PhysicsCategory.player
        bullet.physicsBody?.collisionBitMask = PhysicsCategory.none
        
        addChild(bullet)
        enemyBullets.append(bullet)
        
        // Move down
        let moveAction = SKAction.moveBy(x: 0, y: -(size.height + 50), duration: 2.0)
        let removeAction = SKAction.removeFromParent()
        bullet.run(SKAction.sequence([moveAction, removeAction]))
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
            playerShoot()
        case .paused:
            if let node = atPoint(location) as? SKLabelNode, node.name == "resumeButton" {
                resumeGame()
            } else if let node = atPoint(location) as? SKLabelNode, node.name == "menuButton" {
                showMainMenu()
            }
        case .gameOver:
            if let node = atPoint(location) as? SKLabelNode, node.name == "restartButton" {
                startGame()
            } else if let node = atPoint(location) as? SKLabelNode, node.name == "menuButton" {
                showMainMenu()
            }
        }
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard gameState == .playing, let touch = touches.first else { return }
        let location = touch.location(in: self)
        movePlayer(to: location)
    }
    
    private func movePlayer(to location: CGPoint) {
        guard gameState == .playing else { return }
        
        let newX = max(20, min(size.width - 20, location.x))
        let newY = max(50, min(size.height - 100, location.y))
        
        let moveAction = SKAction.move(to: CGPoint(x: newX, y: newY), duration: 0.1)
        player.run(moveAction)
    }
    
    // MARK: - Collision Detection
    func didBegin(_ contact: SKPhysicsContact) {
        let collision = contact.bodyA.categoryBitMask | contact.bodyB.categoryBitMask
        
        if collision == PhysicsCategory.player | PhysicsCategory.enemy {
            handlePlayerEnemyCollision(contact)
        } else if collision == PhysicsCategory.player | PhysicsCategory.enemyBullet {
            handlePlayerEnemyBulletCollision(contact)
        } else if collision == PhysicsCategory.bullet | PhysicsCategory.enemy {
            handleBulletEnemyCollision(contact)
        } else if collision == PhysicsCategory.player | PhysicsCategory.powerUp {
            handlePlayerPowerUpCollision(contact)
        } else if collision == PhysicsCategory.player | PhysicsCategory.money {
            handlePlayerMoneyCollision(contact)
        } else if collision == PhysicsCategory.player | PhysicsCategory.diamond {
            handlePlayerDiamondCollision(contact)
        }
    }
    
    private func handlePlayerEnemyCollision(_ contact: SKPhysicsContact) {
        lives -= 1
        updateUI()
        
        if lives <= 0 {
            gameOver()
        } else {
            // Flash player
            let flashAction = SKAction.sequence([
                SKAction.fadeAlpha(to: 0.5, duration: 0.1),
                SKAction.fadeAlpha(to: 1.0, duration: 0.1)
            ])
            player.run(SKAction.repeat(flashAction, count: 3))
        }
    }
    
    private func handlePlayerEnemyBulletCollision(_ contact: SKPhysicsContact) {
        lives -= 1
        updateUI()
        
        if lives <= 0 {
            gameOver()
        } else {
            // Flash player
            let flashAction = SKAction.sequence([
                SKAction.fadeAlpha(to: 0.5, duration: 0.1),
                SKAction.fadeAlpha(to: 1.0, duration: 0.1)
            ])
            player.run(SKAction.repeat(flashAction, count: 3))
        }
    }
    
    private func handleBulletEnemyCollision(_ contact: SKPhysicsContact) {
        let bullet = contact.bodyA.categoryBitMask == PhysicsCategory.bullet ? contact.bodyA.node : contact.bodyB.node
        let enemy = contact.bodyA.categoryBitMask == PhysicsCategory.enemy ? contact.bodyA.node : contact.bodyB.node
        
        bullet?.removeFromParent()
        enemy?.removeFromParent()
        
        score += 10
        updateUI()
    }
    
    private func handlePlayerPowerUpCollision(_ contact: SKPhysicsContact) {
        let powerUp = contact.bodyA.categoryBitMask == PhysicsCategory.powerUp ? contact.bodyA.node : contact.bodyB.node
        
        if let powerUpName = powerUp?.name, powerUpName.hasPrefix("powerUp_") {
            let weaponName = String(powerUpName.dropFirst(8)) // Remove "powerUp_" prefix
            if let newWeapon = WeaponType.allCases.first(where: { $0.name == weaponName }) {
                currentWeapon = newWeapon
                updateUI()
                
                // Show weapon change effect
                let weaponChangeLabel = SKLabelNode(fontNamed: "Arial-Bold")
                weaponChangeLabel.text = "Weapon: \(newWeapon.name)"
                weaponChangeLabel.fontSize = 24
                weaponChangeLabel.fontColor = newWeapon.color
                weaponChangeLabel.position = CGPoint(x: size.width/2, y: size.height/2)
                weaponChangeLabel.zPosition = 100
                addChild(weaponChangeLabel)
                
                let fadeAction = SKAction.sequence([
                    SKAction.fadeIn(withDuration: 0.5),
                    SKAction.wait(forDuration: 1.0),
                    SKAction.fadeOut(withDuration: 0.5),
                    SKAction.removeFromParent()
                ])
                weaponChangeLabel.run(fadeAction)
            }
        }
        
        powerUp?.removeFromParent()
    }
    
    private func handlePlayerMoneyCollision(_ contact: SKPhysicsContact) {
        let money = contact.bodyA.categoryBitMask == PhysicsCategory.money ? contact.bodyA.node : contact.bodyB.node
        
        score += 5
        updateUI()
        money?.removeFromParent()
    }
    
    private func handlePlayerDiamondCollision(_ contact: SKPhysicsContact) {
        let diamond = contact.bodyA.categoryBitMask == PhysicsCategory.diamond ? contact.bodyA.node : contact.bodyB.node
        
        score += 20
        updateUI()
        diamond?.removeFromParent()
    }
    
    // MARK: - Game Over
    private func gameOver() {
        gameState = .gameOver
        
        // Stop spawning
        removeAction(forKey: "enemySpawning")
        removeAction(forKey: "powerUpSpawning")
        removeAction(forKey: "moneySpawning")
        removeAction(forKey: "diamondSpawning")
        
        // Clear all game objects
        enemies.forEach { $0.removeFromParent() }
        bullets.forEach { $0.removeFromParent() }
        enemyBullets.forEach { $0.removeFromParent() }
        powerUps.forEach { $0.removeFromParent() }
        money.forEach { $0.removeFromParent() }
        diamonds.forEach { $0.removeFromParent() }
        
        enemies.removeAll()
        bullets.removeAll()
        enemyBullets.removeAll()
        powerUps.removeAll()
        money.removeAll()
        diamonds.removeAll()
        
        // Show game over screen
        showGameOver()
    }
    
    private func showGameOver() {
        // Game Over Label
        let gameOverLabel = SKLabelNode(fontNamed: "Arial-Bold")
        gameOverLabel.text = "GAME OVER"
        gameOverLabel.fontSize = 48
        gameOverLabel.fontColor = .red
        gameOverLabel.position = CGPoint(x: size.width/2, y: size.height/2 + 100)
        gameOverLabel.zPosition = 100
        addChild(gameOverLabel)
        
        // Final Score
        let finalScoreLabel = SKLabelNode(fontNamed: "Arial-Bold")
        finalScoreLabel.text = "Final Score: \(score)"
        finalScoreLabel.fontSize = 32
        finalScoreLabel.fontColor = .white
        finalScoreLabel.position = CGPoint(x: size.width/2, y: size.height/2 + 50)
        finalScoreLabel.zPosition = 100
        addChild(finalScoreLabel)
        
        // Restart Button
        let restartButton = SKLabelNode(fontNamed: "Arial-Bold")
        restartButton.text = "RESTART"
        restartButton.fontSize = 28
        restartButton.fontColor = .green
        restartButton.position = CGPoint(x: size.width/2, y: size.height/2)
        restartButton.name = "restartButton"
        restartButton.zPosition = 100
        addChild(restartButton)
        
        // Menu Button
        let menuButton = SKLabelNode(fontNamed: "Arial-Bold")
        menuButton.text = "MAIN MENU"
        menuButton.fontSize = 28
        menuButton.fontColor = .blue
        menuButton.position = CGPoint(x: size.width/2, y: size.height/2 - 50)
        menuButton.name = "menuButton"
        menuButton.zPosition = 100
        addChild(menuButton)
    }
    
    // MARK: - Pause/Resume
    private func pauseGame() {
        gameState = .paused
        isPaused = true
        
        // Show pause menu
        showPauseMenu()
    }
    
    private func resumeGame() {
        gameState = .playing
        isPaused = false
        
        // Hide pause menu
        pauseNode?.removeFromParent()
        pauseNode = nil
    }
    
    private func showPauseMenu() {
        pauseNode = SKNode()
        
        let pauseLabel = SKLabelNode(fontNamed: "Arial-Bold")
        pauseLabel.text = "PAUSED"
        pauseLabel.fontSize = 48
        pauseLabel.fontColor = .yellow
        pauseLabel.position = CGPoint(x: size.width/2, y: size.height/2 + 50)
        pauseNode.addChild(pauseLabel)
        
        let resumeButton = SKLabelNode(fontNamed: "Arial-Bold")
        resumeButton.text = "RESUME"
        resumeButton.fontSize = 28
        resumeButton.fontColor = .green
        resumeButton.position = CGPoint(x: size.width/2, y: size.height/2)
        resumeButton.name = "resumeButton"
        pauseNode.addChild(resumeButton)
        
        let menuButton = SKLabelNode(fontNamed: "Arial-Bold")
        menuButton.text = "MAIN MENU"
        menuButton.fontSize = 28
        menuButton.fontColor = .blue
        menuButton.position = CGPoint(x: size.width/2, y: size.height/2 - 50)
        menuButton.name = "menuButton"
        pauseNode.addChild(menuButton)
        
        pauseNode.zPosition = 100
        addChild(pauseNode)
    }
    
    // MARK: - UI Updates
    private func updateUI() {
        scoreLabel.text = "Score: \(score)"
        livesLabel.text = "Lives: \(lives)"
        weaponLabel.text = "Weapon: \(currentWeapon.name)"
    }
    
    // MARK: - Game Loop
    override func update(_ currentTime: TimeInterval) {
        guard gameState == .playing else { return }
        
        // Update rapid fire timer
        if rapidFireActive {
            rapidFireTimer += 1.0/60.0 // Assuming 60 FPS
            if rapidFireTimer >= 15.0 { // 15 seconds duration
                rapidFireActive = false
                rapidFireTimer = 0
            }
        }
        
        // Clean up off-screen objects
        cleanupOffScreenObjects()
    }
    
    private func cleanupOffScreenObjects() {
        bullets = bullets.filter { bullet in
            if bullet.position.y > size.height + 50 {
                bullet.removeFromParent()
                return false
            }
            return true
        }
        
        enemies = enemies.filter { enemy in
            if enemy.position.y < -50 {
                enemy.removeFromParent()
                return false
            }
            return true
        }
        
        enemyBullets = enemyBullets.filter { bullet in
            if bullet.position.y < -50 {
                bullet.removeFromParent()
                return false
            }
            return true
        }
        
        powerUps = powerUps.filter { powerUp in
            if powerUp.position.y < -50 {
                powerUp.removeFromParent()
                return false
            }
            return true
        }
        
        money = money.filter { money in
            if money.position.y < -50 {
                money.removeFromParent()
                return false
            }
            return true
        }
        
        diamonds = diamonds.filter { diamond in
            if diamond.position.y < -50 {
                diamond.removeFromParent()
                return false
            }
            return true
        }
    }
} 