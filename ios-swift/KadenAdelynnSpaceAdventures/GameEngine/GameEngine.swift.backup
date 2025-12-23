//
//  GameEngine.swift
//  KadenAdelynnSpaceAdventures
//
//  SpriteKit game scene
//

import SpriteKit
import SwiftUI

class GameScene: SKScene {
    var gameState: GameStateManager
    var gameLogic: GameLogic
    
    // Game entities
    var playerNode: SKSpriteNode?
    var playerTrail: SKEmitterNode?
    var enemyNodes: [SKNode] = []
    var bulletNodes: [SKSpriteNode] = []
    var powerUpNodes: [SKSpriteNode] = []
    var powerUpGlows: [SKEmitterNode] = []
    var bossNode: SKSpriteNode?
    var asteroidNodes: [SKNode] = []
    var collectibleNodes: [SKNode] = []
    
    // Visual effects
    var floatingTexts: [SKLabelNode] = []
    var particles: [SKEmitterNode] = []
    var lastComboDisplay: TimeInterval = 0
    
    // FPS tracking
    private var frameCount: Int = 0
    private var lastFPSTime: TimeInterval = 0
    private var fpsUpdateInterval: TimeInterval = 0.5 // Update FPS every 0.5 seconds
    
    // Input
    var touchLocation: CGPoint?
    var isTouching = false
    var lastShotTime: TimeInterval = 0
    var touchShootTimer: TimeInterval = 0  // For auto-fire every 50ms
    var lastFrameTime: TimeInterval = 0
    var deltaTime: TimeInterval = 0
    
    // Audio
    let audioManager = AudioManager.shared
    
    init(size: CGSize, gameState: GameStateManager) {
        self.gameState = gameState
        self.gameLogic = GameLogic(gameState: gameState)
        super.init(size: size)
        gameLogic.gameScene = self
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func didMove(to view: SKView) {
        setupScene()
        setupPlayer()
        setupCamera()
        // Pass initial time to startGame
        gameLogic.startGame(currentTime: 0)
        
        audioManager.startBackgroundMusic(in: self)
        
        // Initialize FPS tracking
        lastFPSTime = Date().timeIntervalSince1970
    }
    
    func setupCamera() {
        let camera = SKCameraNode()
        addChild(camera)
        self.camera = camera
    }
    
    func setupScene() {
        backgroundColor = .black
        // Ensure scene fills entire available space
        scaleMode = .resizeFill
        anchorPoint = CGPoint(x: 0.5, y: 0.5)
        
        // Add stars background
        let stars = SKNode()
        for _ in 0..<100 {
            let star = SKShapeNode(circleOfRadius: 1)
            star.fillColor = .white
            star.position = CGPoint(
                x: CGFloat.random(in: 0...size.width),
                y: CGFloat.random(in: 0...size.height)
            )
            star.alpha = CGFloat.random(in: 0.3...1.0)
            stars.addChild(star)
        }
        addChild(stars)
        
        // Animate stars
        let moveStars = SKAction.moveBy(x: 0, y: -size.height, duration: 5)
        let resetStars = SKAction.moveBy(x: 0, y: size.height, duration: 0)
        let starSequence = SKAction.sequence([moveStars, resetStars])
        let starLoop = SKAction.repeatForever(starSequence)
        stars.run(starLoop)
    }
    
    func setupPlayer() {
        // Remove existing player if it exists
        if let existingPlayer = childNode(withName: "player") {
            existingPlayer.removeFromParent()
        }
        playerNode?.removeFromParent()
        playerNode = nil
        
        // Create player ship with enhanced graphics
        let shipNode = ShipGraphics.createPlayerShip(size: CGSize(width: 40, height: 40))
        shipNode.position = CGPoint(x: 0, y: 0) // Relative to parent
        shipNode.name = "ship"
        shipNode.zPosition = 10
        
        // Wrap in container for easier manipulation
        let player = SKNode()
        player.addChild(shipNode)
        player.position = CGPoint(x: 0, y: 0) // Relative to playerNode
        player.name = "playerContainer"
        player.zPosition = 10
        
        // Add glow effect
        let glow = SKShapeNode(rect: CGRect(x: -25, y: -25, width: 50, height: 50), cornerRadius: 10)
        glow.fillColor = .cyan
        glow.strokeColor = .clear
        glow.alpha = 0.3
        glow.zPosition = -1
        player.addChild(glow)
        
        // Add engine trail
        let trail = ParticleSystem.createTrail(at: CGPoint(x: 0, y: -20), color: .cyan)
        trail.targetNode = self
        player.addChild(trail)
        playerTrail = trail
        
        // Create playerNode container and add player to it FIRST
        // Match PWA initial position: center X, near bottom (canvas.height - 100)
        let initialPosition = CGPoint(x: size.width / 2 - gameLogic.player.size.width / 2, y: size.height - 100)
        playerNode = SKSpriteNode(color: .clear, size: CGSize(width: 40, height: 40))
        playerNode?.position = initialPosition
        playerNode?.name = "player"
        playerNode?.zPosition = 10
        playerNode?.addChild(player) // Add player to playerNode BEFORE adding to scene
        
        // Now add playerNode to scene
        if let playerNode = playerNode {
            addChild(playerNode)
        }
        
        gameLogic.player.position = initialPosition
        lastFrameTime = Date().timeIntervalSince1970
    }
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let touchPos = touch.location(in: self)
        touchLocation = touchPos
        isTouching = true
        // Use lastFrameTime (from update loop) as the timer base, or 0 if first touch
        touchShootTimer = lastFrameTime > 0 ? lastFrameTime : 0
        
        // Direct position mapping (matching PWA) - player follows touch exactly
        let bounds = CGRect(origin: .zero, size: size)
        gameLogic.player.setPosition(touchPos, bounds: bounds)
        if let playerNode = playerNode {
            playerNode.position = gameLogic.player.position
        }
        
        // Shoot immediately on touch (matching PWA)
        shootBullet()
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let touchPos = touch.location(in: self)
        touchLocation = touchPos
        
        // Direct position mapping (matching PWA) - player follows touch exactly
        let bounds = CGRect(origin: .zero, size: size)
        gameLogic.player.setPosition(touchPos, bounds: bounds)
        if let playerNode = playerNode {
            playerNode.position = gameLogic.player.position
        }
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        isTouching = false
        touchLocation = nil
    }
    
    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        isTouching = false
        touchLocation = nil
    }
    
    override func update(_ currentTime: TimeInterval) {
        guard !gameState.isPaused else { return }
        
        // Calculate delta time for frame-rate independence (matching PWA)
        let wasFirstFrame = lastFrameTime == 0
        if lastFrameTime == 0 {
            lastFrameTime = currentTime
        }
        deltaTime = currentTime - lastFrameTime
        lastFrameTime = currentTime
        
        // Throttle to 60fps max (16.67ms per frame) - matching PWA
        if deltaTime < 0.01667 {
            return
        }
        
        // Normalize delta time to 60fps (multiplier) - matching PWA
        let timeScale = min(deltaTime / 0.01667, 2.0)
        
        // Ensure we're using the current frame bounds
        let gameBounds = CGRect(origin: .zero, size: size)
        
        // Handle auto-firing when touching (matching PWA - every 50ms)
        if isTouching {
            // Initialize touchShootTimer if needed (first touch before first update)
            if touchShootTimer == 0 {
                touchShootTimer = wasFirstFrame ? currentTime - 0.05 : currentTime - 0.05  // Allow immediate shooting
            }
            
            // Every 50ms shoot a bullet (matching PWA)
            if currentTime - touchShootTimer >= 0.05 {
                shootBullet()
                touchShootTimer = currentTime
            }
        }
        
        // Update FPS tracking
        frameCount += 1
        if currentTime - lastFPSTime >= fpsUpdateInterval {
            let fps = Int(Double(frameCount) / (currentTime - lastFPSTime))
            gameState.currentFPS = fps
            frameCount = 0
            lastFPSTime = currentTime
        }
        
        // Update game logic with timeScale for frame-rate independence
        let previousWave = gameState.wave
        gameLogic.update(bounds: gameBounds, currentTime: currentTime, timeScale: CGFloat(timeScale))
        
        // Check for wave transition
        if gameState.wave > previousWave {
            showWaveTransition()
        }
        
        // Sync health from game logic
        gameState.health = gameLogic.player.health
        
        // Update visuals
        updateEnemies()
        updateBullets()
        updatePowerUps()
        updateBoss()
        updateAsteroids()
        updateCollectibles()
        updateFloatingTexts()
        updateParticles()
        
        // Update player visual if invulnerable
        if let player = playerNode {
            let shouldBlink = gameLogic.player.invulnerable
            if shouldBlink {
                let blink = SKAction.sequence([
                    SKAction.fadeAlpha(to: 0.3, duration: 0.1),
                    SKAction.fadeAlpha(to: 1.0, duration: 0.1)
                ])
                if player.action(forKey: "blink") == nil {
                    player.run(SKAction.repeatForever(blink), withKey: "blink")
                }
            } else {
                player.removeAction(forKey: "blink")
                player.alpha = 1.0
            }
        }
        
        // Update combo display
        if gameState.combo > 0 && gameState.combo % 5 == 0 && currentTime - lastComboDisplay > 2.0 {
            showComboEffect()
            lastComboDisplay = currentTime
        }
        
        // Check game over
        if gameState.lives <= 0 {
            audioManager.playGameOverSound(in: self)
            audioManager.stopBackgroundMusic()
            gameState.currentScreen = .gameOver
        }
    }
    
    func shootBullet() {
        guard let player = playerNode else { return }
        
        audioManager.playLaserSound(in: self)
        
        let bullets = gameLogic.shootBullet(from: player.position)
        for bullet in bullets {
            let bulletNode: SKSpriteNode
            
            // Different visuals for different weapons
            switch gameLogic.player.weaponType {
            case .laser:
                bulletNode = SKSpriteNode(color: .yellow, size: bullet.size)
                // Add glow
                let glow = SKShapeNode(rect: CGRect(origin: CGPoint(x: -bullet.size.width/2, y: -bullet.size.height/2), size: bullet.size))
                glow.fillColor = .yellow
                glow.alpha = 0.5
                bulletNode.addChild(glow)
                
            case .spread:
                bulletNode = SKSpriteNode(color: .orange, size: bullet.size)
                
            case .plasma:
                bulletNode = SKSpriteNode(color: .purple, size: bullet.size)
                // Add plasma trail
                let trail = ParticleSystem.createTrail(at: CGPoint.zero, color: .purple)
                trail.targetNode = self
                bulletNode.addChild(trail)
                
            case .missile:
                bulletNode = SKSpriteNode(color: .red, size: bullet.size)
                // Add missile trail
                let trail = ParticleSystem.createTrail(at: CGPoint.zero, color: .red)
                trail.targetNode = self
                bulletNode.addChild(trail)
            }
            
            bulletNode.position = bullet.position
            bulletNode.name = "bullet"
            bulletNode.zPosition = 5
            addChild(bulletNode)
            bulletNodes.append(bulletNode)
        }
        
        gameState.shotsFired += bullets.count
    }
    
    func updateEnemies() {
        // Remove old enemy nodes
        for node in enemyNodes {
            node.removeFromParent()
        }
        enemyNodes.removeAll()
        
        // Add current enemies with enhanced visuals
        for enemy in gameLogic.enemies {
            let enemyShip = ShipGraphics.createEnemyShip(size: enemy.size, type: enemy.enemyType)
            enemyShip.position = CGPoint.zero // Relative to container
            enemyShip.name = "enemy"
            enemyShip.zPosition = 5
            
            // Create container node
            let container = SKNode()
            container.position = enemy.position
            container.addChild(enemyShip)
            container.name = "enemy"
            container.zPosition = 5
            
            addChild(container)
            enemyNodes.append(container)
        }
    }
    
    func updateBullets() {
        // Remove old bullet nodes
        for node in bulletNodes {
            node.removeFromParent()
        }
        bulletNodes.removeAll()
        
        // Add current bullets
        for bullet in gameLogic.bullets {
            let bulletNode = SKSpriteNode(color: bullet.owner == .player ? .yellow : .orange, size: bullet.size)
            bulletNode.position = bullet.position
            bulletNode.name = "bullet"
            bulletNode.zPosition = 5
            addChild(bulletNode)
            bulletNodes.append(bulletNode)
        }
    }
    
    func updatePowerUps() {
        // Remove old power-up nodes and glows
        for node in powerUpNodes {
            node.removeFromParent()
        }
        powerUpNodes.removeAll()
        
        for glow in powerUpGlows {
            glow.removeFromParent()
        }
        powerUpGlows.removeAll()
        
        // Add current power-ups with glow effects
        for powerUp in gameLogic.powerUps {
            let color: UIColor = {
                switch powerUp.type {
                case .health: return .green
                case .rapidFire: return .blue
                case .spread: return .purple
                case .shield: return .cyan
                case .missile: return .orange
                case .coin: return .yellow
                }
            }()
            
            let powerUpNode = SKSpriteNode(color: color, size: powerUp.size)
            powerUpNode.position = powerUp.position
            powerUpNode.name = "powerup"
            powerUpNode.zPosition = 5
            
            // Add pulsing animation
            let pulse = SKAction.sequence([
                SKAction.scale(to: 1.2, duration: 0.5),
                SKAction.scale(to: 1.0, duration: 0.5)
            ])
            powerUpNode.run(SKAction.repeatForever(pulse))
            
            // Add glow effect
            let glow = ParticleSystem.createPowerUpGlow(at: CGPoint.zero, color: color)
            glow.targetNode = self
            powerUpNode.addChild(glow)
            powerUpGlows.append(glow)
            
            addChild(powerUpNode)
            powerUpNodes.append(powerUpNode)
        }
    }
    
    func updateAsteroids() {
        // Remove old asteroid nodes
        for node in asteroidNodes {
            node.removeFromParent()
        }
        asteroidNodes.removeAll()
        
        // Add current asteroids
        for asteroid in gameLogic.asteroids {
            let asteroidNode = SKShapeNode(circleOfRadius: asteroid.size.width / 2)
            asteroidNode.fillColor = .gray
            asteroidNode.strokeColor = .white
            asteroidNode.lineWidth = 2
            asteroidNode.position = asteroid.position
            asteroidNode.name = "asteroid"
            asteroidNode.zPosition = 4
            
            // Add rotation animation
            let rotate = SKAction.rotate(byAngle: .pi * 2, duration: 2.0)
            asteroidNode.run(SKAction.repeatForever(rotate))
            
            addChild(asteroidNode)
            asteroidNodes.append(asteroidNode)
        }
    }
    
    func updateCollectibles() {
        // Remove old collectible nodes
        for node in collectibleNodes {
            node.removeFromParent()
        }
        collectibleNodes.removeAll()
        
        // Add current collectibles (coins)
        for collectible in gameLogic.collectibles {
            let coinNode = SKShapeNode(circleOfRadius: collectible.size.width / 2)
            coinNode.fillColor = .yellow
            coinNode.strokeColor = .orange
            coinNode.lineWidth = 2
            coinNode.position = collectible.position
            coinNode.name = "collectible"
            coinNode.zPosition = 5
            
            // Add pulsing animation
            let pulse = SKAction.sequence([
                SKAction.scale(to: 1.2, duration: 0.5),
                SKAction.scale(to: 1.0, duration: 0.5)
            ])
            coinNode.run(SKAction.repeatForever(pulse))
            
            // Add glow
            let glow = SKShapeNode(circleOfRadius: collectible.size.width / 2 + 2)
            glow.fillColor = .yellow.withAlphaComponent(0.3)
            glow.strokeColor = .clear
            glow.zPosition = -1
            coinNode.addChild(glow)
            
            addChild(coinNode)
            collectibleNodes.append(coinNode)
        }
    }
    
    func updateBoss() {
        if let boss = gameLogic.boss {
            if bossNode == nil {
                // Create boss with enhanced graphics
                let bossShip = ShipGraphics.createBossShip(size: boss.size)
                bossShip.position = boss.position
                bossShip.name = "boss"
                bossShip.zPosition = 8
                
                // Wrap in container
                let container = SKNode()
                container.addChild(bossShip)
                
                // Add boss glow
                let glow = SKShapeNode(rect: CGRect(x: -boss.size.width/2 - 5, y: -boss.size.height/2 - 5, width: boss.size.width + 10, height: boss.size.height + 10), cornerRadius: 10)
                glow.fillColor = .magenta
                glow.strokeColor = .red
                glow.lineWidth = 2
                glow.alpha = 0.5
                glow.zPosition = -1
                container.addChild(glow)
                
                // Pulsing animation
                let pulse = SKAction.sequence([
                    SKAction.scale(to: 1.1, duration: 0.5),
                    SKAction.scale(to: 1.0, duration: 0.5)
                ])
                container.run(SKAction.repeatForever(pulse))
                
                bossNode = SKSpriteNode(color: .clear, size: boss.size)
                bossNode?.addChild(container)
                bossNode?.position = boss.position
                addChild(bossNode!)
                
                // Boss intro effect
                showBossIntro()
                audioManager.playBossSound(in: self)
                audioManager.startBossMusic(in: self)
            }
            bossNode?.position = boss.position
        } else {
            if bossNode != nil {
                // Boss defeated effect
                createExplosion(at: bossNode!.position, size: 2.0)
                audioManager.stopBackgroundMusic()
                audioManager.startBackgroundMusic(in: self)
            }
            bossNode?.removeFromParent()
            bossNode = nil
        }
    }
    
    // MARK: - Visual Effects
    
    func createExplosion(at position: CGPoint, size: CGFloat = 1.0) {
        let explosion = ParticleSystem.createExplosion(at: position, color: .orange, size: size)
        explosion.targetNode = self
        addChild(explosion)
        particles.append(explosion)
        
        // Remove after animation
        explosion.run(SKAction.sequence([
            SKAction.wait(forDuration: 1.0),
            SKAction.removeFromParent()
        ]))
        
        audioManager.playExplosionSound(in: self)
        
        // Screen shake on large explosions
        if size > 1.5 {
            VisualEffects.screenShake(intensity: 10, duration: 0.3, in: self)
        }
    }
    
    func showComboEffect() {
        guard let player = playerNode else { return }
        let comboText = VisualEffects.createComboText(gameState.combo, at: player.position)
        addChild(comboText)
        floatingTexts.append(comboText)
        
        // Flash effect
        VisualEffects.flashScreen(color: .yellow, duration: 0.2, in: self)
        
        // Particle burst
        let burst = ParticleSystem.createComboEffect(at: player.position, multiplier: gameState.combo)
        burst.targetNode = self
        addChild(burst)
        particles.append(burst)
        burst.run(SKAction.sequence([
            SKAction.wait(forDuration: 1.0),
            SKAction.removeFromParent()
        ]))
    }
    
    func showWaveTransition() {
        let waveLabel = SKLabelNode(text: "WAVE \(gameState.wave)")
        waveLabel.fontName = "Arial-BoldMT"
        waveLabel.fontSize = 48
        waveLabel.fontColor = .yellow
        waveLabel.position = CGPoint(x: size.width / 2, y: size.height / 2)
        waveLabel.zPosition = 1000
        addChild(waveLabel)
        
        waveLabel.run(SKAction.sequence([
            SKAction.scale(to: 2.0, duration: 0.5),
            SKAction.wait(forDuration: 1.0),
            SKAction.fadeOut(withDuration: 0.5),
            SKAction.removeFromParent()
        ]))
        
        VisualEffects.flashScreen(color: .white, duration: 0.3, in: self)
    }
    
    func showBossIntro() {
        let bossLabel = SKLabelNode(text: "BOSS INCOMING!")
        bossLabel.fontName = "Arial-BoldMT"
        bossLabel.fontSize = 56
        bossLabel.fontColor = .red
        bossLabel.position = CGPoint(x: size.width / 2, y: size.height / 2)
        bossLabel.zPosition = 1000
        addChild(bossLabel)
        
        bossLabel.run(SKAction.sequence([
            SKAction.scale(to: 1.5, duration: 0.5),
            SKAction.wait(forDuration: 1.5),
            SKAction.fadeOut(withDuration: 0.5),
            SKAction.removeFromParent()
        ]))
        
        VisualEffects.flashScreen(color: .red, duration: 0.5, in: self)
        VisualEffects.screenShake(intensity: 20, duration: 0.5, in: self)
    }
    
    func updateFloatingTexts() {
        for i in (0..<floatingTexts.count).reversed() {
            if floatingTexts[i].parent == nil {
                floatingTexts.remove(at: i)
            }
        }
    }
    
    func updateParticles() {
        for i in (0..<particles.count).reversed() {
            if particles[i].parent == nil {
                particles.remove(at: i)
            }
        }
    }
    
    func onEnemyKilled(_ enemy: Enemy, at position: CGPoint) {
        createExplosion(at: position)
        let scoreText = VisualEffects.createScorePopup(enemy.points, at: position)
        addChild(scoreText)
        floatingTexts.append(scoreText)
    }
    
    func onPlayerHit() {
        VisualEffects.screenShake(intensity: 15, duration: 0.2, in: self)
        VisualEffects.flashScreen(color: .red, duration: 0.1, in: self)
    }
    
    func onPowerUpCollected(_ powerUp: PowerUp, at position: CGPoint) {
        audioManager.playPowerUpSound(in: self)
        let sparkle = ParticleSystem.createSparkle(at: position, color: .yellow)
        sparkle.targetNode = self
        addChild(sparkle)
        particles.append(sparkle)
        sparkle.run(SKAction.sequence([
            SKAction.wait(forDuration: 0.5),
            SKAction.removeFromParent()
        ]))
    }
}
