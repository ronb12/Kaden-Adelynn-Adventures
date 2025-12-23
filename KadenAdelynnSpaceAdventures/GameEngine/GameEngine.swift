//
//  GameEngine.swift
//  KadenAdelynnSpaceAdventures
//
//  FRESH GAMEPLAY - Built from scratch
//

import SpriteKit
import SwiftUI

class GameScene: SKScene {
    var gameState: GameStateManager
    var gameLogic: GameLogic
    
    // Visual nodes
    var playerNode: SKNode?
    var enemyNodes: [SKNode] = []
    var bulletNodes: [SKNode] = []
    var collectibleNodes: [SKNode] = []
    var powerUpNodes: [SKNode] = []
    
    // Input
    var isTouching = false
    var touchShootTimer: TimeInterval = 0
    var lastFrameTime: TimeInterval = 0
    var currentTime: TimeInterval = 0
    var lastAutoSave: TimeInterval = 0  // Track last auto-save time
    
    // Maneuver input tracking
    var lastTouchPosition: CGPoint = CGPoint.zero
    var lastTouchTime: TimeInterval = 0
    var touchStartPosition: CGPoint = CGPoint.zero
    var touchStartTime: TimeInterval = 0
    var isLongPressing: Bool = false
    var longPressStartTime: TimeInterval = 0
    var doubleTapThreshold: TimeInterval = 0.3  // 300ms for double-tap
    var swipeThreshold: CGFloat = 30.0  // Minimum distance for swipe
    
    // Controller support
    let controllerManager = ControllerManager.shared
    var lastControllerShootTime: TimeInterval = 0
    
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
        backgroundColor = UIColor(red: 0.1, green: 0.2, blue: 0.4, alpha: 1.0) // Dark blue
        scaleMode = .resizeFill
        anchorPoint = CGPoint(x: 0.5, y: 0.5)
        
        // Add stars background
        addStarsBackground()
        
        setupPlayer()
        gameLogic.startGame(currentTime: 0)
        
        // Start music after a brief delay to ensure audio session is ready
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            guard let self = self else { return }
            self.audioManager.startBackgroundMusic(in: self)
        }
    }
    
    func addStarsBackground() {
        // Get theme customization
        let selectedTheme = CustomizationManager.getSelectedTheme()
        let (bgColor, starColor, starBrightness) = CustomizationManager.getThemeColors(themeName: selectedTheme)
        
        // Apply background color
        backgroundColor = bgColor
        
        // Create stars with theme colors
        let stars = SKNode()
        stars.name = "stars"
        for _ in 0..<100 {
            let star = SKShapeNode(circleOfRadius: 1)
            star.fillColor = starColor
            star.position = CGPoint(
                x: CGFloat.random(in: -size.width/2...size.width/2),
                y: CGFloat.random(in: -size.height/2...size.height/2)
            )
            star.alpha = CGFloat.random(in: 0.3...1.0) * starBrightness
            stars.addChild(star)
        }
        addChild(stars)
    }
    
    func setupPlayer() {
        // Get selected character and ship from gameState
        let characterId = gameState.selectedCharacter
        let shipId = gameState.selectedShip
        
        // Update player with character and ship info
        gameLogic.player.characterId = characterId
        gameLogic.player.shipId = shipId
        
        // Set player capabilities based on character
        switch characterId.lowercased() {
        case "kaden":
            gameLogic.player.speed = 7.0
            gameLogic.player.weaponType = .laser
        case "adelynn":
            gameLogic.player.speed = 9.0  // Faster
            gameLogic.player.weaponType = .spread  // Spread shot
        default:
            gameLogic.player.speed = 7.0
            gameLogic.player.weaponType = .laser
        }
        
        // Create player ship with character colors
        let ship = ShipGraphics.createPlayerShip(
            size: CGSize(width: 40, height: 40),
            characterId: characterId,
            shipId: shipId
        )
        ship.position = CGPoint(x: 0, y: -size.height/2 + 100) // Near bottom
        ship.name = "player"
        ship.zPosition = 10
        
        // Add trail effect based on customization
        let selectedTrail = CustomizationManager.getSelectedTrail()
        let (trailColor, trailIntensity) = CustomizationManager.getTrailColors(trailName: selectedTrail)
        let trail = ParticleSystem.createTrail(at: CGPoint(x: 0, y: -20), color: trailColor)
        trail.particleBirthRate = CGFloat(trail.particleBirthRate) * trailIntensity // Adjust intensity
        trail.targetNode = self
        trail.name = "playerTrail"
        ship.addChild(trail)
        
        playerNode = ship
        addChild(ship)
        
        gameLogic.player.position = ship.position
    }
    
    func handleControllerInput(currentTime: TimeInterval) {
        guard controllerManager.isControllerConnected && controllerManager.isEnabled else { return }
        
        // Handle pause button
        if controllerManager.pausePressed {
            gameState.isPaused.toggle()
            controllerManager.pausePressed = false
            return
        }
        
        // Handle maneuvers
        let movement = controllerManager.movementDirection
        
        // Dash (Right Shoulder/R1/RB)
        if controllerManager.dashPressed && movement.length() > 0.1 {
            if ShipManeuvers.startDash(player: &gameLogic.player, direction: movement, currentTime: currentTime) {
                createDashEffect(at: gameLogic.player.position, direction: movement)
                audioManager.playSound("missile", in: self)
            }
        }
        
        // Barrel Roll (Left Shoulder/L1/LB)
        if controllerManager.barrelRollPressed {
            if ShipManeuvers.startBarrelRoll(player: &gameLogic.player, currentTime: currentTime) {
                createBarrelRollEffect(at: gameLogic.player.position)
                audioManager.playSound("powerup", in: self)
            }
        }
        
        // Quick Strafe Left (Y button/Triangle)
        if controllerManager.quickStrafeLeftPressed {
            if ShipManeuvers.startQuickStrafe(player: &gameLogic.player, direction: -1.0, currentTime: currentTime) {
                createStrafeEffect(at: gameLogic.player.position, direction: -1.0)
                audioManager.playSound("laser", in: self)
            }
        }
        
        // Quick Strafe Right (Right Thumbstick Click)
        if controllerManager.quickStrafeRightPressed {
            if ShipManeuvers.startQuickStrafe(player: &gameLogic.player, direction: 1.0, currentTime: currentTime) {
                createStrafeEffect(at: gameLogic.player.position, direction: 1.0)
                audioManager.playSound("laser", in: self)
            }
        }
        
        // Backward Thrust (Left Trigger/L2/LT)
        if controllerManager.backwardThrustPressed {
            if ShipManeuvers.startBackwardThrust(player: &gameLogic.player, currentTime: currentTime) {
                createBackwardThrustEffect(at: gameLogic.player.position)
                audioManager.playSound("powerup", in: self)
            }
        }
        
        // Boost Charge (Right Trigger/R2/RT - hold)
        if controllerManager.boostChargePressed {
            if !gameLogic.player.isChargingBoost {
                ShipManeuvers.startBoostCharge(player: &gameLogic.player, currentTime: currentTime)
                createBoostChargeEffect(at: gameLogic.player.position)
            } else {
                ShipManeuvers.updateBoostCharge(player: &gameLogic.player, currentTime: currentTime)
                updateBoostChargeVisual(chargeLevel: gameLogic.player.boostChargeLevel)
            }
        } else if gameLogic.player.isChargingBoost {
            // Release boost charge
            if ShipManeuvers.releaseBoostCharge(player: &gameLogic.player, direction: movement.length() > 0.1 ? movement : CGPoint(x: 0, y: 1), currentTime: currentTime, bounds: CGRect(origin: .zero, size: size)) {
                createBoostReleaseEffect(at: gameLogic.player.position, direction: movement.length() > 0.1 ? movement : CGPoint(x: 0, y: 1))
                audioManager.playSound("missile", in: self)
            }
            removeBoostChargeVisual()
        }
        
        // Zigzag (B button/Circle)
        if controllerManager.zigzagPressed {
            if ShipManeuvers.startZigzag(player: &gameLogic.player, currentTime: currentTime) {
                createZigzagEffect(at: gameLogic.player.position)
                audioManager.playSound("powerup", in: self)
            }
        }
        
        // Handle movement - use center-origin coordinates
        // Update momentum for controller movement
        if abs(movement.x) > 0.1 || abs(movement.y) > 0.1 {
            ShipManeuvers.updateMomentum(player: &gameLogic.player, movementDirection: movement.normalized(), deltaTime: 0.016)
            
            // Apply movement with sensitivity (pixels per frame)
            let sensitivity: CGFloat = 10.0
            let halfWidth = size.width / 2
            let halfHeight = size.height / 2
            
            // Calculate new position in center-origin coordinates (unless dashing or other maneuver active)
            if !gameLogic.player.isDashing && !gameLogic.player.isQuickStrafing && !gameLogic.player.isBackwardThrusting {
                let newX = gameLogic.player.position.x + (movement.x * sensitivity)
                let newY = gameLogic.player.position.y + (movement.y * sensitivity)
                
                // Clamp to screen bounds (center-origin)
                gameLogic.player.position.x = max(-halfWidth + 50, min(halfWidth - 50, newX))
                gameLogic.player.position.y = max(-halfHeight + 50, min(halfHeight - 50, newY))
                
                // Update visual (SpriteKit uses center-origin by default)
                if let player = playerNode {
                    player.position = gameLogic.player.position
                }
            }
        } else {
            // No movement input - decay momentum
            ShipManeuvers.updateMomentum(player: &gameLogic.player, movementDirection: CGPoint.zero, deltaTime: 0.016)
        }
        
        // Handle shooting
        if controllerManager.isShooting {
            // Continuous shooting with fire rate limit
            let rapidFireActive = gameState.activePowerUps["rapid_fire"] != nil
            let baseFireRate = rapidFireActive ? 0.025 : 0.05
            let fireRate = baseFireRate * Double(gameLogic.player.fireRateMultiplier)
            
            if lastControllerShootTime == 0 {
                lastControllerShootTime = currentTime - fireRate
            }
            if currentTime - lastControllerShootTime >= fireRate {
                shootBullet()
                lastControllerShootTime = currentTime
            }
        } else {
            lastControllerShootTime = 0
        }
    }
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        // Ignore touch input if controller is connected and enabled
        guard !controllerManager.isControllerConnected || !controllerManager.isEnabled else { return }
        
        guard let touch = touches.first else { return }
        let touchPos = touch.location(in: self)
        isTouching = true
        touchShootTimer = currentTime
        
        // Check for double-tap gestures
        let timeSinceLastTouch = currentTime - gameLogic.player.lastTouchTime
        let distanceFromLastTouch = sqrt(
            pow(touchPos.x - gameLogic.player.lastTouchPosition.x, 2) +
            pow(touchPos.y - gameLogic.player.lastTouchPosition.y, 2)
        )
        
        // Double-tap in same area = zigzag
        if timeSinceLastTouch < gameLogic.player.doubleTapThreshold && distanceFromLastTouch < 50 {
            if ShipManeuvers.startZigzag(player: &gameLogic.player, currentTime: currentTime) {
                createZigzagEffect(at: gameLogic.player.position)
                audioManager.playSound("powerup", in: self)
            }
        }
        
        // Two-finger tap = barrel roll
        if touches.count == 2 {
            if ShipManeuvers.startBarrelRoll(player: &gameLogic.player, currentTime: currentTime) {
                createBarrelRollEffect(at: gameLogic.player.position)
                audioManager.playSound("powerup", in: self)
            }
        }
        
        // Fast swipe = dash in movement direction (if moving quickly)
        if touches.count == 1 {
            let movementSpeed = sqrt(
                pow(touchPos.x - gameLogic.player.position.x, 2) +
                pow(touchPos.y - gameLogic.player.position.y, 2)
            )
            // If moving fast (swipe), trigger dash
            if movementSpeed > 50 && timeSinceLastTouch < 0.15 {
                let dashDirection = CGPoint(
                    x: touchPos.x - gameLogic.player.position.x,
                    y: touchPos.y - gameLogic.player.position.y
                )
                if dashDirection.length() > 0 {
                    if ShipManeuvers.startDash(player: &gameLogic.player, direction: dashDirection, currentTime: currentTime) {
                        createDashEffect(at: gameLogic.player.position, direction: dashDirection)
                        audioManager.playSound("missile", in: self)
                    }
                }
            }
        }
        
        // Store touch info for double-tap detection
        gameLogic.player.lastTouchPosition = touchPos
        gameLogic.player.lastTouchTime = currentTime
        touchStartPosition = touchPos
        touchStartTime = currentTime
        isLongPressing = false
        longPressStartTime = currentTime
        
        // Move player to touch position
        let movementDirection = CGPoint(
            x: touchPos.x - gameLogic.player.position.x,
            y: touchPos.y - gameLogic.player.position.y
        )
        
        // Update momentum
        ShipManeuvers.updateMomentum(player: &gameLogic.player, movementDirection: movementDirection.normalized(), deltaTime: 0.016)
        
        gameLogic.player.position = touchPos
        if let player = playerNode {
            player.position = touchPos
        }
        
        // Shoot immediately
        shootBullet()
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        // Ignore touch input if controller is connected and enabled
        guard !controllerManager.isControllerConnected || !controllerManager.isEnabled else { return }
        
        guard let touch = touches.first else { return }
        let touchPos = touch.location(in: self)
        
        // Check for swipe gestures
        let swipeDistance = sqrt(
            pow(touchPos.x - touchStartPosition.x, 2) +
            pow(touchPos.y - touchStartPosition.y, 2)
        )
        
        if swipeDistance > swipeThreshold {
            let swipeDirection = CGPoint(
                x: touchPos.x - touchStartPosition.x,
                y: touchPos.y - touchStartPosition.y
            )
            let normalizedSwipe = swipeDirection.normalized()
            
            // Vertical swipe up = backward thrust
            if abs(normalizedSwipe.y) > abs(normalizedSwipe.x) && normalizedSwipe.y > 0.7 {
                if ShipManeuvers.startBackwardThrust(player: &gameLogic.player, currentTime: currentTime) {
                    createBackwardThrustEffect(at: gameLogic.player.position)
                    audioManager.playSound("powerup", in: self)
                }
                touchStartPosition = touchPos  // Reset to prevent multiple triggers
            }
            // Horizontal swipe = quick strafe
            else if abs(normalizedSwipe.x) > abs(normalizedSwipe.y) && abs(normalizedSwipe.x) > 0.7 {
                if ShipManeuvers.startQuickStrafe(player: &gameLogic.player, direction: normalizedSwipe.x, currentTime: currentTime) {
                    createStrafeEffect(at: gameLogic.player.position, direction: normalizedSwipe.x)
                    audioManager.playSound("laser", in: self)
                }
                touchStartPosition = touchPos  // Reset to prevent multiple triggers
            }
        }
        
        // Check for long press (boost charge)
        let pressDuration = currentTime - longPressStartTime
        if pressDuration > 0.2 && !isLongPressing {
            isLongPressing = true
            ShipManeuvers.startBoostCharge(player: &gameLogic.player, currentTime: currentTime)
            createBoostChargeEffect(at: gameLogic.player.position)
        }
        
        // Update boost charge if long pressing
        if isLongPressing {
            ShipManeuvers.updateBoostCharge(player: &gameLogic.player, currentTime: currentTime)
            updateBoostChargeVisual(chargeLevel: gameLogic.player.boostChargeLevel)
        }
        
        // Calculate movement direction for momentum
        let movementDirection = CGPoint(
            x: touchPos.x - gameLogic.player.position.x,
            y: touchPos.y - gameLogic.player.position.y
        )
        
        // Update momentum
        ShipManeuvers.updateMomentum(player: &gameLogic.player, movementDirection: movementDirection.normalized(), deltaTime: 0.016)
        
        // Move player to touch position (unless dashing or other maneuver active)
        if !gameLogic.player.isDashing && !gameLogic.player.isQuickStrafing && !gameLogic.player.isBackwardThrusting {
            gameLogic.player.position = touchPos
            if let player = playerNode {
                player.position = touchPos
            }
        }
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        // Ignore touch input if controller is connected and enabled
        guard !controllerManager.isControllerConnected || !controllerManager.isEnabled else { return }
        
        guard let touch = touches.first else {
            isTouching = false
            return
        }
        
        let touchPos = touch.location(in: self)
        
        // Release boost charge if charging
        if isLongPressing && gameLogic.player.isChargingBoost {
            let releaseDirection = CGPoint(
                x: touchPos.x - gameLogic.player.position.x,
                y: touchPos.y - gameLogic.player.position.y
            )
            
            if ShipManeuvers.releaseBoostCharge(player: &gameLogic.player, direction: releaseDirection, currentTime: currentTime, bounds: CGRect(origin: .zero, size: size)) {
                createBoostReleaseEffect(at: gameLogic.player.position, direction: releaseDirection)
                audioManager.playSound("missile", in: self)
            }
            
            removeBoostChargeVisual()
        }
        
        isTouching = false
        isLongPressing = false
        gameLogic.player.isChargingBoost = false
    }
    
    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        // Ignore touch input if controller is connected and enabled
        guard !controllerManager.isControllerConnected || !controllerManager.isEnabled else { return }
        isTouching = false
    }
    
    override func update(_ currentTime: TimeInterval) {
        guard !gameState.isPaused else { return }
        
        self.currentTime = currentTime
        
        if lastFrameTime == 0 {
            lastFrameTime = currentTime
        }
        
        let deltaTime = currentTime - lastFrameTime
        lastFrameTime = currentTime
        
        // Throttle to 60fps
        if deltaTime < 0.016 {
            return
        }
        
        let timeScale = min(deltaTime / 0.016, 2.0)
        let gameBounds = CGRect(origin: .zero, size: size)
        
        // Handle controller input
        handleControllerInput(currentTime: currentTime)
        
        // Auto-shoot while touching - fire rate affected by rapid fire collectible and weapon upgrades
        // Only if controller is not connected
        if !controllerManager.isControllerConnected || !controllerManager.isEnabled {
            let rapidFireActive = gameState.activePowerUps["rapid_fire"] != nil
            let baseFireRate = rapidFireActive ? 0.025 : 0.05 // Double fire rate with rapid fire (25ms vs 50ms)
            // Apply weapon upgrade fire rate multiplier (lower multiplier = faster shooting)
            let fireRate = baseFireRate * Double(gameLogic.player.fireRateMultiplier)
            
            if isTouching {
                if touchShootTimer == 0 {
                    touchShootTimer = currentTime - fireRate
                }
                if currentTime - touchShootTimer >= fireRate {
                    shootBullet()
                    touchShootTimer = currentTime
                }
            }
        }
        
        // Check for wave transition
        let previousWave = gameState.wave
        
        // Update maneuver cooldowns
        ShipManeuvers.updateCooldowns(player: &gameLogic.player, deltaTime: deltaTime)
        
        // Update active maneuvers
        ShipManeuvers.updateDash(player: &gameLogic.player, currentTime: currentTime, bounds: gameBounds)
        ShipManeuvers.updateBarrelRoll(player: &gameLogic.player, currentTime: currentTime)
        ShipManeuvers.updateQuickStrafe(player: &gameLogic.player, currentTime: currentTime, bounds: gameBounds)
        ShipManeuvers.updateBackwardThrust(player: &gameLogic.player, currentTime: currentTime, bounds: gameBounds)
        ShipManeuvers.updateZigzag(player: &gameLogic.player, currentTime: currentTime, bounds: gameBounds)
        
        // Apply momentum drift
        ShipManeuvers.applyMomentum(player: &gameLogic.player, bounds: gameBounds, deltaTime: deltaTime)
        
        // Auto evasive maneuver (check for nearby enemy bullets)
        if ShipManeuvers.checkAutoEvasive(player: &gameLogic.player, enemyBullets: gameLogic.bullets.filter { $0.owner == .enemy }, currentTime: currentTime, bounds: gameBounds) {
            createDashEffect(at: gameLogic.player.position, direction: gameLogic.player.dashDirection)
            audioManager.playSound("powerup", in: self)
        }
        
        // Update game logic
        gameLogic.update(bounds: gameBounds, currentTime: currentTime, timeScale: CGFloat(timeScale))
        
        // Show wave transition if wave changed
        if gameState.wave > previousWave {
            showWaveTransition()
        }
        
        // Sync health
        gameState.health = gameLogic.player.health
        
        // Update visuals
        updatePlayerVisual()
        updateEnemies()
        updateBullets()
        updateAsteroids()
        updateCollectibles()
        updatePowerUps()
        
        // Auto-save every 30 seconds (if enabled)
        if gameState.isAutoSaveEnabled {
            if lastAutoSave == 0 {
                lastAutoSave = currentTime
            }
                if currentTime - lastAutoSave >= 30.0 { // 30 seconds
                    let saved = gameState.saveGame(toSlot: 1) // Auto-save to slot 1
                    if saved {
                        lastAutoSave = currentTime
                        #if DEBUG
                        print("💾 Auto-save triggered")
                        #endif
                    }
                }
        }
        
        // Check game over
        if gameState.lives <= 0 {
            gameState.currentScreen = .gameOver
        }
    }
    
    func updatePlayerVisual() {
        // Check if character/ship changed and regenerate ship if needed
        let currentCharacterId = gameLogic.player.characterId
        let currentShipId = gameLogic.player.shipId
        let selectedCharacterId = gameState.selectedCharacter
        let selectedShipId = gameState.selectedShip
        
        if currentCharacterId != selectedCharacterId || currentShipId != selectedShipId {
            // Character or ship changed - regenerate ship visual
            if let oldPlayer = playerNode {
                oldPlayer.removeFromParent()
            }
            setupPlayer()
        } else if let player = playerNode {
            // Update position
            player.position = gameLogic.player.position
            
            // Apply barrel roll rotation
            if gameLogic.player.isBarrelRolling {
                player.zRotation = gameLogic.player.barrelRollRotation
            } else {
                player.zRotation = 0
            }
            
            // Apply dash visual (invincibility glow)
            if gameLogic.player.isDashing && gameLogic.player.invulnerable {
                player.alpha = 0.7
                // Add glow effect
                if player.childNode(withName: "dashGlow") == nil {
                    let glow = SKShapeNode(circleOfRadius: player.frame.width / 2 + 5)
                    glow.fillColor = .cyan
                    glow.strokeColor = .clear
                    glow.alpha = 0.5
                    glow.zPosition = -1
                    glow.name = "dashGlow"
                    player.addChild(glow)
                }
            } else {
                player.alpha = 1.0
                player.childNode(withName: "dashGlow")?.removeFromParent()
            }
            
            // Apply momentum trail (fade based on momentum)
            if gameLogic.player.momentum > 0.1 {
                let trailAlpha = CGFloat(gameLogic.player.momentum) * 0.3
                if let trail = player.childNode(withName: "momentumTrail") as? SKEmitterNode {
                    trail.particleAlpha = trailAlpha
                } else {
                    let selectedTrail = CustomizationManager.getSelectedTrail()
                    let (trailColor, _) = CustomizationManager.getTrailColors(trailName: selectedTrail)
                    let trail = ParticleSystem.createTrail(at: CGPoint(x: 0, y: -player.frame.height / 2), color: trailColor)
                    trail.particleAlpha = trailAlpha
                    trail.name = "momentumTrail"
                    player.addChild(trail)
                }
            } else {
                player.childNode(withName: "momentumTrail")?.removeFromParent()
            }
        }
    }
    
    func shootBullet() {
        guard let player = playerNode else { return }
        
        // Play different sounds based on weapon type
        let weaponType = gameLogic.player.weaponType
        #if DEBUG
        print("🔊 Shooting with weapon type: \(weaponType)")
        #endif
        switch weaponType {
        case .missile, .rocket, .grenade, .explosive:
            #if DEBUG
            print("🚀 Playing missile sound for \(weaponType)")
            #endif
            audioManager.playMissileSound(in: self)
        default:
            #if DEBUG
            print("⚡ Playing laser sound for \(weaponType)")
            #endif
            audioManager.playLaserSound(in: self)
        }
        
        let bullets = gameLogic.shootBullet(from: player.position)
        for bullet in bullets {
            let bulletNode = SKShapeNode(rectOf: bullet.size)
            bulletNode.fillColor = .yellow
            bulletNode.strokeColor = .orange
            bulletNode.position = bullet.position
            bulletNode.name = "bullet"
            bulletNode.zPosition = 5
            addChild(bulletNode)
            bulletNodes.append(bulletNode)
        }
    }
    
    func updateEnemies() {
        // Remove old nodes
        for node in enemyNodes {
            node.removeFromParent()
        }
        enemyNodes.removeAll()
        
        // Add current enemies
        for enemy in gameLogic.enemies {
            let enemyShip = ShipGraphics.createEnemyShip(size: enemy.size, type: enemy.enemyType)
            enemyShip.position = enemy.position
            enemyShip.name = "enemy"
            enemyShip.zPosition = 5
            addChild(enemyShip)
            enemyNodes.append(enemyShip)
        }
    }
    
    func getPlayerBulletVisuals(weaponType: WeaponType) -> (UIColor, UIColor, String) {
        // Returns: (bulletColor, glowColor, shape)
        switch weaponType {
        case .laser:
            return (UIColor(red: 1.0, green: 1.0, blue: 0.3, alpha: 1.0), UIColor(red: 1.0, green: 1.0, blue: 0.0, alpha: 1.0), "rectangle")
        case .spread:
            return (UIColor(red: 0.2, green: 0.8, blue: 1.0, alpha: 1.0), UIColor(red: 0.0, green: 0.6, blue: 1.0, alpha: 1.0), "circle")
        case .plasma:
            return (UIColor(red: 0.8, green: 0.2, blue: 1.0, alpha: 1.0), UIColor(red: 1.0, green: 0.4, blue: 1.0, alpha: 1.0), "circle")
        case .missile:
            return (UIColor(red: 1.0, green: 0.5, blue: 0.0, alpha: 1.0), UIColor(red: 1.0, green: 0.7, blue: 0.2, alpha: 1.0), "triangle")
        case .fireball:
            return (UIColor(red: 1.0, green: 0.3, blue: 0.0, alpha: 1.0), UIColor(red: 1.0, green: 0.6, blue: 0.0, alpha: 1.0), "circle")
        case .lightning:
            return (UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0), UIColor(red: 0.5, green: 1.0, blue: 1.0, alpha: 1.0), "rectangle")
        case .ice:
            return (UIColor(red: 0.5, green: 0.9, blue: 1.0, alpha: 1.0), UIColor(red: 0.7, green: 1.0, blue: 1.0, alpha: 1.0), "triangle")
        case .poison:
            return (UIColor(red: 0.2, green: 0.8, blue: 0.2, alpha: 1.0), UIColor(red: 0.0, green: 1.0, blue: 0.5, alpha: 1.0), "circle")
        case .shockwave:
            return (UIColor(red: 0.9, green: 0.9, blue: 0.9, alpha: 1.0), UIColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0), "circle")
        case .beam:
            return (UIColor(red: 1.0, green: 0.5, blue: 0.8, alpha: 1.0), UIColor(red: 1.0, green: 0.7, blue: 0.9, alpha: 1.0), "rectangle")
        case .rocket:
            return (UIColor(red: 0.7, green: 0.1, blue: 0.1, alpha: 1.0), UIColor(red: 1.0, green: 0.3, blue: 0.0, alpha: 1.0), "triangle")
        case .grenade:
            return (UIColor(red: 0.8, green: 0.4, blue: 0.0, alpha: 1.0), UIColor(red: 1.0, green: 0.6, blue: 0.2, alpha: 1.0), "circle")
        case .flamethrower:
            return (UIColor(red: 1.0, green: 0.6, blue: 0.0, alpha: 1.0), UIColor(red: 1.0, green: 0.8, blue: 0.3, alpha: 1.0), "rectangle")
        case .electric:
            return (UIColor(red: 1.0, green: 1.0, blue: 0.2, alpha: 1.0), UIColor(red: 1.0, green: 1.0, blue: 0.5, alpha: 1.0), "rectangle")
        case .freeze:
            return (UIColor(red: 0.3, green: 0.8, blue: 1.0, alpha: 1.0), UIColor(red: 0.6, green: 1.0, blue: 1.0, alpha: 1.0), "triangle")
        case .acid:
            return (UIColor(red: 0.1, green: 0.6, blue: 0.1, alpha: 1.0), UIColor(red: 0.3, green: 0.9, blue: 0.3, alpha: 1.0), "circle")
        case .vortex:
            return (UIColor(red: 0.6, green: 0.1, blue: 0.8, alpha: 1.0), UIColor(red: 0.8, green: 0.3, blue: 1.0, alpha: 1.0), "circle")
        case .pulse:
            return (UIColor(red: 1.0, green: 0.2, blue: 0.8, alpha: 1.0), UIColor(red: 1.0, green: 0.5, blue: 0.9, alpha: 1.0), "circle")
        case .scatter:
            return (UIColor(red: 1.0, green: 0.8, blue: 0.2, alpha: 1.0), UIColor(red: 1.0, green: 0.9, blue: 0.5, alpha: 1.0), "circle")
        case .homing:
            return (UIColor(red: 0.2, green: 0.6, blue: 1.0, alpha: 1.0), UIColor(red: 0.4, green: 0.8, blue: 1.0, alpha: 1.0), "triangle")
        case .explosive:
            return (UIColor(red: 1.0, green: 0.2, blue: 0.2, alpha: 1.0), UIColor(red: 1.0, green: 0.5, blue: 0.3, alpha: 1.0), "circle")
        case .piercing:
            return (UIColor(red: 0.95, green: 0.95, blue: 0.95, alpha: 1.0), UIColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0), "rectangle")
        case .chain:
            return (UIColor(red: 1.0, green: 0.9, blue: 0.0, alpha: 1.0), UIColor(red: 1.0, green: 1.0, blue: 0.4, alpha: 1.0), "rectangle")
        case .meteor:
            return (UIColor(red: 1.0, green: 0.4, blue: 0.1, alpha: 1.0), UIColor(red: 1.0, green: 0.7, blue: 0.3, alpha: 1.0), "circle")
        case .laserBeam:
            return (UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0), UIColor(red: 0.5, green: 1.0, blue: 1.0, alpha: 1.0), "rectangle")
        case .multiShot2, .multiShot3, .multiShot4, .multiShot5:
            // Multi-shot weapons use yellow/orange color
            return (UIColor(red: 1.0, green: 0.8, blue: 0.0, alpha: 1.0), UIColor(red: 1.0, green: 0.6, blue: 0.0, alpha: 1.0), "rectangle")
        }
    }
    
    func updateBullets() {
        // Remove old nodes
        for node in bulletNodes {
            node.removeFromParent()
        }
        bulletNodes.removeAll()
        
        // Add current bullets with enhanced visuals
        for bullet in gameLogic.bullets {
            let bulletContainer = SKNode()
            bulletContainer.position = bullet.position
            bulletContainer.name = "bullet"
            bulletContainer.zPosition = 5
            
            if bullet.owner == .player {
                // Check for bullet customization override
                let selectedBullet = CustomizationManager.getSelectedBullet()
                let (customColor, customGlowColor) = CustomizationManager.getBulletColors(bulletName: selectedBullet)
                
                // Use customization if not default, otherwise use weapon visuals
                let (color, glowColor, shape): (UIColor, UIColor, String)
                if selectedBullet.lowercased() != "default" {
                    color = customColor
                    glowColor = customGlowColor
                    shape = "rectangle" // Default shape for custom bullets
                } else {
                    (color, glowColor, shape) = getPlayerBulletVisuals(weaponType: gameLogic.player.weaponType)
                }
                
                // Glow effect
                let glowSize = CGSize(width: bullet.size.width + 6, height: bullet.size.height + 6)
                let glow: SKShapeNode
                if shape == "circle" {
                    glow = SKShapeNode(circleOfRadius: max(glowSize.width, glowSize.height) / 2)
                } else if shape == "triangle" {
                    let path = CGMutablePath()
                    path.move(to: CGPoint(x: 0, y: glowSize.height / 2))
                    path.addLine(to: CGPoint(x: -glowSize.width / 2, y: -glowSize.height / 2))
                    path.addLine(to: CGPoint(x: glowSize.width / 2, y: -glowSize.height / 2))
                    path.closeSubpath()
                    glow = SKShapeNode(path: path)
                } else {
                    glow = SKShapeNode(rectOf: glowSize)
                }
                glow.fillColor = glowColor.withAlphaComponent(0.5)
                glow.strokeColor = .clear
                glow.zPosition = -1
                bulletContainer.addChild(glow)
                
                // Main bullet shape
                let bulletNode: SKShapeNode
                if shape == "circle" {
                    bulletNode = SKShapeNode(circleOfRadius: max(bullet.size.width, bullet.size.height) / 2)
                } else if shape == "triangle" {
                    let path = CGMutablePath()
                    path.move(to: CGPoint(x: 0, y: bullet.size.height / 2))
                    path.addLine(to: CGPoint(x: -bullet.size.width / 2, y: -bullet.size.height / 2))
                    path.addLine(to: CGPoint(x: bullet.size.width / 2, y: -bullet.size.height / 2))
                    path.closeSubpath()
                    bulletNode = SKShapeNode(path: path)
                } else {
                    bulletNode = SKShapeNode(rectOf: bullet.size)
                }
                bulletNode.fillColor = color
                bulletNode.strokeColor = .white
                bulletNode.lineWidth = 2
                bulletNode.zPosition = 0
                bulletContainer.addChild(bulletNode)
            } else {
                // Enemy bullets - red/orange
                let glow = SKShapeNode(rectOf: CGSize(width: bullet.size.width + 3, height: bullet.size.height + 3))
                glow.fillColor = .orange.withAlphaComponent(0.3)
                glow.strokeColor = .clear
                glow.zPosition = -1
                bulletContainer.addChild(glow)
                
                let bulletNode = SKShapeNode(rectOf: bullet.size)
                bulletNode.fillColor = .red
                bulletNode.strokeColor = .orange
                bulletNode.lineWidth = 1.5
                bulletNode.zPosition = 0
                bulletContainer.addChild(bulletNode)
            }
            
            addChild(bulletContainer)
            bulletNodes.append(bulletContainer)
        }
    }
    
    func updateAsteroids() {
        // Remove all existing asteroid nodes
        enumerateChildNodes(withName: "asteroid") { node, _ in
            node.removeFromParent()
        }
        
        // Add current asteroids
        for asteroid in gameLogic.asteroids {
            let asteroidContainer = SKNode()
            asteroidContainer.position = asteroid.position
            asteroidContainer.name = "asteroid"
            asteroidContainer.zPosition = 4
            
            // Select random asteroid image (1-5)
            let asteroidImageIndex = Int.random(in: 1...5)
            let imageName = "Asteroid_\(asteroidImageIndex)"
            
            // Try to load the image from assets
            if let image = UIImage(named: imageName) {
                let texture = SKTexture(image: image)
                let sprite = SKSpriteNode(texture: texture)
                
                // Scale to fit asteroid size while maintaining aspect ratio
                let imageAspect = image.size.width / image.size.height
                let targetSize = asteroid.size
                let targetAspect = targetSize.width / targetSize.height
                
                var finalSize = targetSize
                if imageAspect > targetAspect {
                    // Image is wider - fit to height
                    finalSize = CGSize(width: targetSize.height * imageAspect, height: targetSize.height)
                } else {
                    // Image is taller - fit to width
                    finalSize = CGSize(width: targetSize.width, height: targetSize.width / imageAspect)
                }
                
                sprite.size = finalSize
                sprite.zPosition = 1
                
                // Add rotation animation (slower for larger asteroids)
                let rotationSpeed = 2.0 + Double.random(in: -0.5...0.5)
                let rotate = SKAction.rotate(byAngle: .pi * 2, duration: rotationSpeed)
                sprite.run(SKAction.repeatForever(rotate))
                
                asteroidContainer.addChild(sprite)
            } else {
                // Fallback: create a simple colored circle if image not found
                let fallback = SKShapeNode(circleOfRadius: asteroid.size.width / 2)
                fallback.fillColor = UIColor(red: 0.5, green: 0.5, blue: 0.5, alpha: 1.0)
                fallback.strokeColor = UIColor(red: 0.7, green: 0.7, blue: 0.7, alpha: 1.0)
                fallback.lineWidth = 2
                fallback.zPosition = 1
                
                let rotate = SKAction.rotate(byAngle: .pi * 2, duration: 2.0)
                fallback.run(SKAction.repeatForever(rotate))
                
                asteroidContainer.addChild(fallback)
            }
            
            addChild(asteroidContainer)
        }
    }
    
    func updateCollectibles() {
        // Track previous count to detect collection
        let previousCount = collectibleNodes.count
        
        // Remove old nodes
        for node in collectibleNodes {
            node.removeFromParent()
        }
        collectibleNodes.removeAll()
        
        // Add current collectibles with ENHANCED VISIBILITY - Different star types
        for collectible in gameLogic.collectibles {
            let starNode = SKNode()
            starNode.position = collectible.position
            starNode.name = "collectible"
            starNode.zPosition = 5
            
            let starType = collectible.starType
            let starColor = starType.color
            let glowColor = starType.glowColor
            let starSize = collectible.size.width / 2
            let sparkleCount = starType == .diamond ? 12 : starType == .platinum ? 10 : 8
            
            // OUTER GLOW - Size and intensity based on star type
            let outerGlowRadius = starSize * 1.2
            let outerGlow = SKShapeNode(circleOfRadius: outerGlowRadius)
            outerGlow.fillColor = glowColor.withAlphaComponent(0.6)
            outerGlow.strokeColor = .clear
            outerGlow.zPosition = -3
            starNode.addChild(outerGlow)
            
            // MIDDLE GLOW - Color based on star type
            let middleGlow = SKShapeNode(circleOfRadius: starSize * 0.9)
            middleGlow.fillColor = glowColor.withAlphaComponent(0.5)
            middleGlow.strokeColor = .clear
            middleGlow.zPosition = -2
            starNode.addChild(middleGlow)
            
            // INNER GLOW
            let innerGlow = SKShapeNode(circleOfRadius: starSize * 0.7)
            innerGlow.fillColor = starColor.withAlphaComponent(0.4)
            innerGlow.strokeColor = .clear
            innerGlow.zPosition = -1
            starNode.addChild(innerGlow)
            
            // MAIN STAR - Color and size based on type
            let starShape = SKShapeNode(circleOfRadius: starSize)
            starShape.fillColor = starColor
            starShape.strokeColor = glowColor
            starShape.lineWidth = starType == .diamond ? 5 : starType == .platinum ? 4 : 3
            starShape.zPosition = 0
            starNode.addChild(starShape)
            
            // INNER HIGHLIGHT for sparkle effect
            let highlightSize = starSize * 0.3
            let innerHighlight = SKShapeNode(circleOfRadius: highlightSize)
            innerHighlight.fillColor = .white.withAlphaComponent(0.9)
            innerHighlight.strokeColor = .clear
            innerHighlight.position = CGPoint(x: -starSize * 0.2, y: starSize * 0.2)
            innerHighlight.zPosition = 1
            starNode.addChild(innerHighlight)
            
            // SPARKLE PARTICLES - More particles for rarer stars
            let sparkleRadius = starSize * 0.7
            for i in 0..<sparkleCount {
                let sparkle = SKShapeNode(rectOf: CGSize(width: 3, height: 3))
                sparkle.fillColor = .white
                sparkle.strokeColor = starColor
                sparkle.lineWidth = 1
                let angle = CGFloat(i) * (.pi * 2 / CGFloat(sparkleCount))
                sparkle.position = CGPoint(x: cos(angle) * sparkleRadius, y: sin(angle) * sparkleRadius)
                sparkle.zPosition = 1
                starNode.addChild(sparkle)
            }
            
            // Star emoji with K&A text - Different emoji based on type
            let starSymbol = SKLabelNode(text: starType.emoji)
            starSymbol.fontSize = starType == .diamond ? 24 : starType == .platinum ? 22 : 20
            starSymbol.position = CGPoint(x: 0, y: 0)
            starSymbol.zPosition = 2
            starNode.addChild(starSymbol)
            
            // Add "K&A" text on top of star
            let kaLabel = SKLabelNode(text: "K&A")
            kaLabel.fontName = "Arial-BoldMT"
            kaLabel.fontSize = starType == .diamond ? 10 : starType == .platinum ? 9 : starType == .gold ? 8 : 7
            kaLabel.fontColor = .black
            kaLabel.position = CGPoint(x: 0, y: -2)  // Slightly below center for better visibility
            kaLabel.zPosition = 3
            starNode.addChild(kaLabel)
            
            // Value label for rare stars
            if starType == .platinum || starType == .diamond {
                let valueLabel = SKLabelNode(text: "\(starType.value)")
                valueLabel.fontSize = 10
                valueLabel.fontColor = .white
                valueLabel.position = CGPoint(x: 0, y: -starSize - 8)
                valueLabel.zPosition = 3
                starNode.addChild(valueLabel)
            }
            
            // PULSING ANIMATION - Faster pulse for rarer stars
            let pulseScale: CGFloat = starType == .diamond ? 1.5 : starType == .platinum ? 1.4 : 1.3
            let pulseDuration: TimeInterval = starType == .diamond ? 0.3 : starType == .platinum ? 0.32 : 0.35
            let pulse = SKAction.sequence([
                SKAction.scale(to: pulseScale, duration: pulseDuration),
                SKAction.scale(to: 1.0, duration: pulseDuration)
            ])
            starNode.run(SKAction.repeatForever(pulse))
            
            // ROTATION ANIMATION - Faster rotation for rarer stars
            let rotationDuration: TimeInterval = starType == .diamond ? 1.2 : starType == .platinum ? 1.4 : 1.6
            let rotate = SKAction.rotate(byAngle: .pi * 2, duration: rotationDuration)
            starNode.run(SKAction.repeatForever(rotate))
            
            // TWINKLE EFFECT - Additional animation for rare stars
            if starType == .diamond || starType == .platinum {
                let twinkle = SKAction.sequence([
                    SKAction.fadeAlpha(to: 0.7, duration: 0.4),
                    SKAction.fadeAlpha(to: 1.0, duration: 0.4)
                ])
                starSymbol.run(SKAction.repeatForever(twinkle))
            }
            
            addChild(starNode)
            collectibleNodes.append(starNode)
        }
        
        // If collectible count decreased, play sound
        if previousCount > collectibleNodes.count && collectibleNodes.count < gameLogic.collectibles.count {
            audioManager.playPowerUpSound(in: self)
        }
    }
    
    func onEnemyKilled(_ enemy: Enemy, at position: CGPoint, score: Int? = nil) {
        audioManager.playExplosionSound(in: self)
        HapticManager.shared.enemyKilled()
        
        // Show score popup
        if let score = score {
            let scorePopup = VisualEffects.createScorePopup(score, at: position)
            addChild(scorePopup)
        }
        
        // Show combo text if combo is high
        if gameState.combo >= 5 {
            let comboText = VisualEffects.createComboText(gameState.combo, at: CGPoint(x: position.x, y: position.y + 30))
            addChild(comboText)
        }
        
        // ENHANCED: Multi-layered explosion effect
        let explosion = SKNode()
        explosion.position = position
        
        // Outer explosion ring
        for i in 0..<8 {
            let ring = SKShapeNode(circleOfRadius: 15)
            ring.fillColor = i < 4 ? .orange : .red
            ring.strokeColor = .yellow
            ring.lineWidth = 2
            let angle = CGFloat(i) * (.pi * 2 / 8)
            let offset: CGFloat = 10
            ring.position = CGPoint(x: cos(angle) * offset, y: sin(angle) * offset)
            explosion.addChild(ring)
            
            ring.run(SKAction.sequence([
                SKAction.group([
                    SKAction.move(by: CGVector(dx: cos(angle) * 30, dy: sin(angle) * 30), duration: 0.4),
                    SKAction.scale(to: 0, duration: 0.4),
                    SKAction.fadeOut(withDuration: 0.4)
                ]),
                SKAction.removeFromParent()
            ]))
        }
        
        // Central explosion
        let center = SKShapeNode(circleOfRadius: 20)
        center.fillColor = .yellow
        center.strokeColor = .orange
        center.lineWidth = 3
        explosion.addChild(center)
        
        center.run(SKAction.sequence([
            SKAction.group([
                SKAction.scale(to: 2.5, duration: 0.3),
                SKAction.fadeOut(withDuration: 0.3)
            ]),
            SKAction.removeFromParent()
        ]))
        
        addChild(explosion)
        explosion.run(SKAction.sequence([
            SKAction.wait(forDuration: 0.5),
            SKAction.removeFromParent()
        ]))
        
        // Enhanced score popup with combo multiplier display
        let scoreText = gameState.combo > 5 ? "+\(enemy.points) x\(String(format: "%.1f", gameState.scoreMultiplier))" : "+\(enemy.points)"
        let scoreLabel = SKLabelNode(text: scoreText)
        scoreLabel.fontName = "Arial-BoldMT"
        scoreLabel.fontSize = gameState.combo > 10 ? 20 : 16
        scoreLabel.fontColor = gameState.combo > 10 ? .cyan : .yellow
        scoreLabel.position = CGPoint(x: position.x, y: position.y + 30)
        scoreLabel.zPosition = 100
        addChild(scoreLabel)
        
        // Combo indicator
        if gameState.combo >= 5 {
            let comboLabel = SKLabelNode(text: "COMBO x\(gameState.combo)!")
            comboLabel.fontName = "Arial-BoldMT"
            comboLabel.fontSize = 18
            comboLabel.fontColor = .cyan
            comboLabel.position = CGPoint(x: position.x, y: position.y + 55)
            comboLabel.zPosition = 100
            addChild(comboLabel)
            
            comboLabel.run(SKAction.sequence([
                SKAction.group([
                    SKAction.moveBy(x: 0, y: 50, duration: 1.2),
                    SKAction.fadeOut(withDuration: 1.2),
                    SKAction.scale(to: 1.3, duration: 0.3),
                    SKAction.scale(to: 1.0, duration: 0.3)
                ]),
                SKAction.removeFromParent()
            ]))
        }
        
        scoreLabel.run(SKAction.sequence([
            SKAction.group([
                SKAction.moveBy(x: 0, y: 40, duration: 1.0),
                SKAction.fadeOut(withDuration: 1.0),
                SKAction.scale(to: 1.2, duration: 0.2),
                SKAction.scale(to: 1.0, duration: 0.2)
            ]),
            SKAction.removeFromParent()
        ]))
    }
    
    func onPlayerHit() {
        // Safe visual feedback: Red border pulse instead of flash (photosensitive-friendly)
        if VisualEffects.areVisualEffectsEnabled {
            // Red border pulse effect (safe alternative to flash)
            let borderWidth: CGFloat = 12.0
            let border = SKShapeNode(rect: CGRect(
                origin: CGPoint(x: -size.width/2 - borderWidth/2, y: -size.height/2 - borderWidth/2),
                size: CGSize(width: size.width + borderWidth, height: size.height + borderWidth)
            ))
            border.fillColor = .clear
            border.strokeColor = .red
            border.lineWidth = borderWidth
            border.alpha = 0.8
            border.zPosition = 999
            addChild(border)
            
            // Gentle pulse animation (no rapid flashing)
            border.run(SKAction.sequence([
                SKAction.group([
                    SKAction.fadeAlpha(to: 1.0, duration: 0.15),
                    SKAction.scale(to: 1.01, duration: 0.15)
                ]),
                SKAction.group([
                    SKAction.fadeOut(withDuration: 0.25),
                    SKAction.scale(to: 1.0, duration: 0.25)
                ]),
                SKAction.removeFromParent()
            ]))
            
            // Screen shake effect (can be disabled separately if needed)
            VisualEffects.screenShake(intensity: 10, duration: 0.2, in: self)
        }
        HapticManager.shared.playerHit()
        
        // Show damage number
        let damageText = VisualEffects.createDamageNumber(10, at: playerNode?.position ?? CGPoint.zero)
        addChild(damageText)
    }
    
    func playCoinSound() {
        audioManager.playCoinSound(in: self)
    }
    
    func onPowerUpCollected(_ powerUp: PowerUp, at position: CGPoint) {
        audioManager.playPowerUpSound(in: self)
        HapticManager.shared.powerUpCollected()
        
        // Particle burst effect
        let particles = SKNode()
        particles.position = position
        
        for i in 0..<12 {
            let particle = SKShapeNode(circleOfRadius: 3)
            particle.fillColor = .cyan
            particle.strokeColor = .blue
            let angle = CGFloat(i) * (.pi * 2 / 12)
            particle.position = CGPoint(x: cos(angle) * 5, y: sin(angle) * 5)
            particles.addChild(particle)
            
            particle.run(SKAction.sequence([
                SKAction.group([
                    SKAction.move(by: CGVector(dx: cos(angle) * 40, dy: sin(angle) * 40), duration: 0.5),
                    SKAction.fadeOut(withDuration: 0.5),
                    SKAction.scale(to: 0, duration: 0.5)
                ]),
                SKAction.removeFromParent()
            ]))
        }
        
        addChild(particles)
        particles.run(SKAction.sequence([
            SKAction.wait(forDuration: 0.5),
            SKAction.removeFromParent()
        ]))
        
        // Flash screen with power-up color
        let powerUpColor: UIColor = {
            switch powerUp.type {
            case .health: return .green
            case .shield: return .blue
            case .rapidFire: return .yellow
            case .coin: return UIColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0) // Gold/yellow for stars
            default: return .cyan
            }
        }()
        VisualEffects.flashScreen(color: powerUpColor, duration: 0.15, in: self)
        
        // Show power-up name
        // Display "STAR" instead of "COIN" for collectibles
        let displayText: String
        if powerUp.type == .coin {
            displayText = "STAR"
        } else {
            displayText = powerUp.type.rawValue.uppercased()
        }
        let nameText = VisualEffects.createFloatingText(displayText, at: position, color: powerUpColor, size: 16)
        addChild(nameText)
    }
    
    func onStarCollected(_ star: Coin, at position: CGPoint) {
        // Enhanced collection effect based on star type
        let starType = star.starType
        let starColor = starType.color
        let glowColor = starType.glowColor
        
        // Play coin sound
        audioManager.playCoinSound(in: self)
        
        // Haptic feedback - stronger for rarer stars
        switch starType {
        case .diamond, .platinum:
            HapticManager.shared.powerUpCollected()  // Strong haptic
        case .gold:
            HapticManager.shared.powerUpCollected()  // Medium haptic
        default:
            HapticManager.shared.buttonPress()  // Light haptic
        }
        
        // Enhanced particle burst - more particles for rarer stars
        let particleCount = starType == .diamond ? 20 : starType == .platinum ? 16 : starType == .gold ? 14 : 12
        let particles = SKNode()
        particles.position = position
        
        for i in 0..<particleCount {
            let particle = SKShapeNode(circleOfRadius: starType == .diamond ? 4 : 3)
            particle.fillColor = starColor
            particle.strokeColor = glowColor
            let angle = CGFloat(i) * (.pi * 2 / CGFloat(particleCount))
            let radius: CGFloat = starType == .diamond ? 8 : 5
            particle.position = CGPoint(x: cos(angle) * radius, y: sin(angle) * radius)
            particles.addChild(particle)
            
            let distance: CGFloat = starType == .diamond ? 60 : starType == .platinum ? 50 : 40
            particle.run(SKAction.sequence([
                SKAction.group([
                    SKAction.move(by: CGVector(dx: cos(angle) * distance, dy: sin(angle) * distance), duration: 0.6),
                    SKAction.fadeOut(withDuration: 0.6),
                    SKAction.scale(to: 0, duration: 0.6)
                ]),
                SKAction.removeFromParent()
            ]))
        }
        
        addChild(particles)
        particles.run(SKAction.sequence([
            SKAction.wait(forDuration: 0.6),
            SKAction.removeFromParent()
        ]))
        
        // Border pulse with star color (accessibility-friendly)
        VisualEffects.borderPulse(color: starColor, duration: starType == .diamond ? 0.5 : 0.4, in: self)
        
        // Show star value with enhanced text
        let valueText = starType == .diamond ? "\(starType.value) STARS!" : "\(starType.value) STAR\(starType.value > 1 ? "S" : "")"
        let textSize: CGFloat = starType == .diamond ? 20 : starType == .platinum ? 18 : 16
        let nameText = VisualEffects.createFloatingText(valueText, at: position, color: glowColor, size: textSize)
        addChild(nameText)
        
        // Additional sparkle effect for rare stars
        if starType == .diamond || starType == .platinum {
            let sparkles = SKNode()
            sparkles.position = position
            
            for _ in 0..<8 {
                let sparkle = SKShapeNode(rectOf: CGSize(width: 2, height: 2))
                sparkle.fillColor = .white
                sparkle.strokeColor = glowColor
                let angle = CGFloat.random(in: 0...(2 * .pi))
                let distance: CGFloat = CGFloat.random(in: 20...40)
                sparkle.position = CGPoint(x: cos(angle) * distance, y: sin(angle) * distance)
                sparkles.addChild(sparkle)
                
                sparkle.run(SKAction.sequence([
                    SKAction.group([
                        SKAction.fadeOut(withDuration: 0.8),
                        SKAction.scale(to: 0, duration: 0.8)
                    ]),
                    SKAction.removeFromParent()
                ]))
            }
            
            addChild(sparkles)
            sparkles.run(SKAction.sequence([
                SKAction.wait(forDuration: 0.8),
                SKAction.removeFromParent()
            ]))
        }
    }
    
    func updatePowerUps() {
        // Remove old nodes
        for node in powerUpNodes {
            node.removeFromParent()
        }
        powerUpNodes.removeAll()
        
        // Add current power-ups with different visuals based on type
        for powerUp in gameLogic.powerUps {
            let powerUpNode = SKNode()
            powerUpNode.position = powerUp.position
            powerUpNode.name = "powerUp"
            powerUpNode.zPosition = 5
            
            // Different colors/shapes for different power-up types
            let (color, icon) = getPowerUpVisuals(type: powerUp.type)
            
            // Glow effect
            let glow = SKShapeNode(circleOfRadius: 15)
            glow.fillColor = color.withAlphaComponent(0.5)
            glow.strokeColor = .clear
            glow.zPosition = -1
            powerUpNode.addChild(glow)
            
            // Main shape
            let shape = SKShapeNode(rectOf: CGSize(width: 25, height: 25), cornerRadius: 5)
            shape.fillColor = color
            shape.strokeColor = .white
            shape.lineWidth = 2
            shape.zPosition = 0
            powerUpNode.addChild(shape)
            
            // Icon/letter
            let label = SKLabelNode(text: icon)
            label.fontName = "Arial-BoldMT"
            label.fontSize = 14
            label.fontColor = .white
            label.verticalAlignmentMode = .center
            label.zPosition = 1
            powerUpNode.addChild(label)
            
            // Pulsing animation
            let pulse = SKAction.sequence([
                SKAction.scale(to: 1.2, duration: 0.4),
                SKAction.scale(to: 1.0, duration: 0.4)
            ])
            powerUpNode.run(SKAction.repeatForever(pulse))
            
            addChild(powerUpNode)
            powerUpNodes.append(powerUpNode)
        }
    }
    
    func showWaveTransition() {
        HapticManager.shared.waveComplete()
        
        // Create wave transition overlay
        let overlay = SKNode()
        overlay.zPosition = 2000
        
        // Safe visual feedback: Cyan border glow instead of flash (photosensitive-friendly)
        if VisualEffects.areVisualEffectsEnabled {
            let borderWidth: CGFloat = 10.0
            let border = SKShapeNode(rect: CGRect(
                origin: CGPoint(x: -size.width/2 - borderWidth/2, y: -size.height/2 - borderWidth/2),
                size: CGSize(width: size.width + borderWidth, height: size.height + borderWidth)
            ))
            border.fillColor = .clear
            border.strokeColor = .cyan
            border.lineWidth = borderWidth
            border.alpha = 0.6
            border.zPosition = 1999
            overlay.addChild(border)
            
            // Gentle glow animation (no rapid flashing)
            border.run(SKAction.sequence([
                SKAction.group([
                    SKAction.fadeAlpha(to: 0.9, duration: 0.3),
                    SKAction.scale(to: 1.01, duration: 0.3)
                ]),
                SKAction.group([
                    SKAction.fadeOut(withDuration: 0.4),
                    SKAction.scale(to: 1.0, duration: 0.4)
                ]),
                SKAction.removeFromParent()
            ]))
        }
        
        // Wave text
        let waveLabel = SKLabelNode(text: "WAVE \(gameState.wave)")
        waveLabel.fontName = "Arial-BoldMT"
        waveLabel.fontSize = 48
        waveLabel.fontColor = .yellow
        waveLabel.position = CGPoint(x: 0, y: 0)
        waveLabel.zPosition = 2001
        overlay.addChild(waveLabel)
        
        waveLabel.run(SKAction.sequence([
            SKAction.group([
                SKAction.scale(to: 1.5, duration: 0.3),
                SKAction.fadeIn(withDuration: 0.1)
            ]),
            SKAction.wait(forDuration: 0.5),
            SKAction.group([
                SKAction.scale(to: 0.8, duration: 0.3),
                SKAction.fadeOut(withDuration: 0.3)
            ]),
            SKAction.removeFromParent()
        ]))
        
        addChild(overlay)
        overlay.run(SKAction.sequence([
            SKAction.wait(forDuration: 1.2),
            SKAction.removeFromParent()
        ]))
        
        // Screen shake (only if visual effects enabled - accessibility)
        if VisualEffects.areVisualEffectsEnabled {
            VisualEffects.screenShake(intensity: 15, duration: 0.3, in: self)
        }
    }
    
    func getPowerUpVisuals(type: PowerUp.PowerUpType) -> (UIColor, String) {
        switch type {
        case .health:
            return (UIColor(red: 1.0, green: 0.2, blue: 0.2, alpha: 1.0), "❤")
        case .rapidFire:
            return (UIColor(red: 0.2, green: 1.0, blue: 0.2, alpha: 1.0), "⚡")
        case .shield:
            return (UIColor(red: 0.5, green: 0.2, blue: 1.0, alpha: 1.0), "🛡")
        case .coin:
            return (UIColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0), "⭐")
        
        // Multi-shot weapon collectibles
        case .weaponMultiShot2:
            return (UIColor(red: 1.0, green: 0.8, blue: 0.0, alpha: 1.0), "⚡⚡")
        case .weaponMultiShot3:
            return (UIColor(red: 1.0, green: 0.7, blue: 0.0, alpha: 1.0), "⚡⚡⚡")
        case .weaponMultiShot4:
            return (UIColor(red: 1.0, green: 0.6, blue: 0.0, alpha: 1.0), "⚡⚡⚡⚡")
        case .weaponMultiShot5:
            return (UIColor(red: 1.0, green: 0.5, blue: 0.0, alpha: 1.0), "⚡⚡⚡⚡⚡")
        
        // 25 Weapon Collectibles
        case .weaponLaser:
            return (UIColor(red: 1.0, green: 1.0, blue: 0.3, alpha: 1.0), "L")
        case .weaponSpread:
            return (UIColor(red: 0.2, green: 0.8, blue: 1.0, alpha: 1.0), "S")
        case .weaponPlasma:
            return (UIColor(red: 0.8, green: 0.2, blue: 1.0, alpha: 1.0), "P")
        case .weaponMissile:
            return (UIColor(red: 1.0, green: 0.5, blue: 0.0, alpha: 1.0), "M")
        case .weaponFireball:
            return (UIColor(red: 1.0, green: 0.3, blue: 0.0, alpha: 1.0), "F")
        case .weaponLightning:
            return (UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0), "⚡")
        case .weaponIce:
            return (UIColor(red: 0.5, green: 0.9, blue: 1.0, alpha: 1.0), "I")
        case .weaponPoison:
            return (UIColor(red: 0.2, green: 0.8, blue: 0.2, alpha: 1.0), "☠")
        case .weaponShockwave:
            return (UIColor(red: 0.9, green: 0.9, blue: 0.9, alpha: 1.0), "W")
        case .weaponBeam:
            return (UIColor(red: 1.0, green: 0.5, blue: 0.8, alpha: 1.0), "B")
        case .weaponRocket:
            return (UIColor(red: 0.7, green: 0.1, blue: 0.1, alpha: 1.0), "R")
        case .weaponGrenade:
            return (UIColor(red: 0.8, green: 0.4, blue: 0.0, alpha: 1.0), "G")
        case .weaponFlamethrower:
            return (UIColor(red: 1.0, green: 0.6, blue: 0.0, alpha: 1.0), "🔥")
        case .weaponElectric:
            return (UIColor(red: 1.0, green: 1.0, blue: 0.2, alpha: 1.0), "E")
        case .weaponFreeze:
            return (UIColor(red: 0.3, green: 0.8, blue: 1.0, alpha: 1.0), "❄")
        case .weaponAcid:
            return (UIColor(red: 0.1, green: 0.6, blue: 0.1, alpha: 1.0), "A")
        case .weaponVortex:
            return (UIColor(red: 0.6, green: 0.1, blue: 0.8, alpha: 1.0), "V")
        case .weaponPulse:
            return (UIColor(red: 1.0, green: 0.2, blue: 0.8, alpha: 1.0), "P")
        case .weaponScatter:
            return (UIColor(red: 1.0, green: 0.8, blue: 0.2, alpha: 1.0), "X")
        case .weaponHoming:
            return (UIColor(red: 0.2, green: 0.6, blue: 1.0, alpha: 1.0), "H")
        case .weaponExplosive:
            return (UIColor(red: 1.0, green: 0.2, blue: 0.2, alpha: 1.0), "💥")
        case .weaponPiercing:
            return (UIColor(red: 0.95, green: 0.95, blue: 0.95, alpha: 1.0), "→")
        case .weaponChain:
            return (UIColor(red: 1.0, green: 0.9, blue: 0.0, alpha: 1.0), "C")
        case .weaponMeteor:
            return (UIColor(red: 1.0, green: 0.4, blue: 0.1, alpha: 1.0), "☄")
        case .weaponLaserBeam:
            return (UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0), "➤")
        }
    }
    
    // MARK: - Maneuver Visual Effects
    
    var boostChargeNode: SKNode?
    var dashTrailNode: SKNode?
    
    func createDashEffect(at position: CGPoint, direction: CGPoint) {
        // Create dash trail
        let trail = ParticleSystem.createTrail(at: position, color: .cyan)
        trail.particleBirthRate = 200
        trail.particleLifetime = 0.15
        trail.particleSpeed = 300
        trail.particleColor = .cyan
        trail.name = "dashTrail"
        addChild(trail)
        
        // Remove after dash duration
        run(SKAction.sequence([
            SKAction.wait(forDuration: ShipManeuvers.dashDuration),
            SKAction.run { trail.removeFromParent() }
        ]))
        
        // Create afterimage effect
        if let player = playerNode {
            let afterimage = player.copy() as! SKNode
            afterimage.alpha = 0.5
            afterimage.zPosition = player.zPosition - 1
            addChild(afterimage)
            
            afterimage.run(SKAction.sequence([
                SKAction.fadeOut(withDuration: ShipManeuvers.dashDuration),
                SKAction.removeFromParent()
            ]))
        }
    }
    
    func createZigzagEffect(at position: CGPoint) {
        // Create zigzag particles
        let sparkle = ParticleSystem.createSparkle(at: position, color: .yellow)
        sparkle.numParticlesToEmit = 20
        addChild(sparkle)
        
        sparkle.run(SKAction.sequence([
            SKAction.wait(forDuration: 0.5),
            SKAction.removeFromParent()
        ]))
    }
    
    func createStrafeEffect(at position: CGPoint, direction: CGFloat) {
        // Create side thrusters effect
        let emitter = SKEmitterNode()
        emitter.particleColor = .orange
        emitter.numParticlesToEmit = 15
        emitter.particleBirthRate = 1000
        emitter.particleLifetime = 0.2
        emitter.particlePosition = position
        emitter.particlePositionRange = CGVector(dx: 0, dy: 10)
        emitter.particleSpeed = 150
        emitter.particleSpeedRange = 50
        emitter.particleAlpha = 0.8
        emitter.particleScale = 0.3
        emitter.particleBlendMode = .add
        emitter.emissionAngle = direction > 0 ? 0 : .pi  // Left or right
        emitter.emissionAngleRange = 0.3
        emitter.name = "strafeEffect"
        addChild(emitter)
        
        emitter.run(SKAction.sequence([
            SKAction.wait(forDuration: ShipManeuvers.quickStrafeDuration),
            SKAction.removeFromParent()
        ]))
    }
    
    func createBackwardThrustEffect(at position: CGPoint) {
        // Create reverse engine glow
        let emitter = SKEmitterNode()
        emitter.particleColor = .red
        emitter.numParticlesToEmit = 20
        emitter.particleBirthRate = 1000
        emitter.particleLifetime = 0.25
        emitter.particlePosition = position
        emitter.particlePositionRange = CGVector(dx: 15, dy: 0)
        emitter.particleSpeed = 200
        emitter.particleSpeedRange = 80
        emitter.particleAlpha = 0.9
        emitter.particleScale = 0.4
        emitter.particleBlendMode = .add
        emitter.emissionAngle = .pi / 2  // Upward (backward in center-origin)
        emitter.emissionAngleRange = 0.4
        emitter.name = "backwardThrust"
        addChild(emitter)
        
        emitter.run(SKAction.sequence([
            SKAction.wait(forDuration: ShipManeuvers.backwardThrustDuration),
            SKAction.removeFromParent()
        ]))
    }
    
    func createBoostChargeEffect(at position: CGPoint) {
        // Create charging ring
        let ring = SKShapeNode(circleOfRadius: 30)
        ring.strokeColor = .yellow
        ring.fillColor = .clear
        ring.lineWidth = 3
        ring.alpha = 0.7
        ring.position = position
        ring.name = "boostChargeRing"
        addChild(ring)
        
        // Pulsing animation
        let pulse = SKAction.sequence([
            SKAction.scale(to: 1.5, duration: 0.3),
            SKAction.scale(to: 1.0, duration: 0.3)
        ])
        ring.run(SKAction.repeatForever(pulse))
        
        boostChargeNode = ring
    }
    
    func updateBoostChargeVisual(chargeLevel: CGFloat) {
        guard let ring = boostChargeNode as? SKShapeNode else { return }
        
        // Update ring size and color based on charge
        let baseRadius: CGFloat = 30
        ring.path = CGPath(ellipseIn: CGRect(x: -baseRadius, y: -baseRadius, width: baseRadius * 2, height: baseRadius * 2), transform: nil)
        
        // Color changes from yellow to orange to red as charge increases
        if chargeLevel < 0.5 {
            ring.strokeColor = .yellow
        } else if chargeLevel < 0.8 {
            ring.strokeColor = .orange
        } else {
            ring.strokeColor = .red
        }
        
        // Scale with charge
        ring.setScale(1.0 + chargeLevel * 0.5)
        ring.alpha = 0.5 + chargeLevel * 0.5
    }
    
    func removeBoostChargeVisual() {
        boostChargeNode?.removeFromParent()
        boostChargeNode = nil
    }
    
    func createBoostReleaseEffect(at position: CGPoint, direction: CGPoint) {
        // Create powerful boost trail
        let emitter = SKEmitterNode()
        emitter.particleColor = .red
        emitter.numParticlesToEmit = 50
        emitter.particleBirthRate = 2000
        emitter.particleLifetime = 0.3
        emitter.particlePosition = position
        emitter.particleSpeed = 400
        emitter.particleSpeedRange = 100
        emitter.particleAlpha = 1.0
        emitter.particleScale = 0.6
        emitter.particleBlendMode = .add
        
        // Emit in opposite direction of movement
        let angle = atan2(-direction.y, -direction.x)
        emitter.emissionAngle = angle
        emitter.emissionAngleRange = 0.5
        
        emitter.name = "boostRelease"
        addChild(emitter)
        
        emitter.run(SKAction.sequence([
            SKAction.wait(forDuration: 0.5),
            SKAction.removeFromParent()
        ]))
        
        // Screen shake
        camera?.run(SKAction.sequence([
            SKAction.moveBy(x: 5, y: 5, duration: 0.05),
            SKAction.moveBy(x: -5, y: -5, duration: 0.05),
            SKAction.moveBy(x: -5, y: 5, duration: 0.05),
            SKAction.moveBy(x: 5, y: -5, duration: 0.05)
        ]))
    }
    
    func createBarrelRollEffect(at position: CGPoint) {
        // Create spinning particle ring
        let ring = SKShapeNode(circleOfRadius: 40)
        ring.strokeColor = .cyan
        ring.fillColor = .clear
        ring.lineWidth = 4
        ring.alpha = 0.8
        ring.position = position
        ring.name = "barrelRollRing"
        addChild(ring)
        
        // Rotate and fade out
        ring.run(SKAction.sequence([
            SKAction.group([
                SKAction.rotate(byAngle: .pi * 2, duration: ShipManeuvers.barrelRollDuration),
                SKAction.fadeOut(withDuration: ShipManeuvers.barrelRollDuration)
            ]),
            SKAction.removeFromParent()
        ]))
        
        // Create sparkle particles
        let sparkle = ParticleSystem.createSparkle(at: position, color: .cyan)
        sparkle.numParticlesToEmit = 30
        sparkle.particleLifetime = ShipManeuvers.barrelRollDuration
        addChild(sparkle)
        
        sparkle.run(SKAction.sequence([
            SKAction.wait(forDuration: ShipManeuvers.barrelRollDuration),
            SKAction.removeFromParent()
        ]))
    }
}
