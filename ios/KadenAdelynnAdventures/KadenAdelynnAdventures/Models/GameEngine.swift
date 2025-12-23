import Foundation
import simd

class GameEngine {
		private(set) var isPaused: Bool = false
		func pause() {
			isPaused = true
		}
		func resume() {
			isPaused = false
			lastUpdateTime = Date().timeIntervalSince1970
		}
		func togglePause() {
			isPaused ? resume() : pause()
		}
	private var player: Player
	private var enemies: [Enemy]
	private var bullets: [Bullet]
	private var asteroids: [Asteroid]
	private var collectibles: [Collectible]
	private var boss: Boss?
	private var gameState: GameState
	private var lastUpdateTime: TimeInterval
	private var screenWidth: Float = 800
	private var screenHeight: Float = 1000

		init(screenWidth: Float = 800, screenHeight: Float = 1000, character: String = "Kaden", ship: String = "Falcon") {
			self.screenWidth = screenWidth
			self.screenHeight = screenHeight
			// Center player horizontally, near bottom vertically
			let centerX = screenWidth / 2
			let bottomY = screenHeight - 100
			// Use character/ship selection to customize player (expand as needed)
			let color: SIMD4<Float> = (character == "Adelynn") ? SIMD4<Float>(1, 0.5, 0.8, 1) : SIMD4<Float>(0, 1, 0, 1)
			let size: Float = (ship == "Comet") ? 32 : (ship == "Nova" ? 48 : 40)
			self.player = Player(x: centerX, y: bottomY, color: color, size: size)
			self.enemies = []
			self.bullets = []
			self.asteroids = []
			self.collectibles = []
			self.boss = nil
			self.gameState = GameState(player: GameState.Player(position: SIMD2<Float>(centerX, bottomY), color: color, size: size))
			self.lastUpdateTime = Date().timeIntervalSince1970
		}
	
	// MARK: - Save/Load (UserDefaults fallback - CloudKit requires Xcode project setup)
	
	func saveGame(completion: @escaping (Bool) -> Void) {
		let saveData: [String: Any] = [
			"score": gameState.score,
			"wave": gameState.wave,
			"level": gameState.level,
			"lives": gameState.lives,
			"playerX": player.position.x,
			"playerY": player.position.y,
			"timestamp": Date().timeIntervalSince1970
		]
		
		UserDefaults.standard.set(saveData, forKey: "gameSave")
		print("💾 Game saved locally!")
		completion(true)
	}
	
	func loadGame(completion: @escaping (Bool) -> Void) {
		guard let saveData = UserDefaults.standard.dictionary(forKey: "gameSave") else {
			print("❌ No saved game found")
			completion(false)
			return
		}
		
		if let score = saveData["score"] as? Int,
		   let wave = saveData["wave"] as? Int,
		   let level = saveData["level"] as? Int,
		   let lives = saveData["lives"] as? Int,
		   let playerX = saveData["playerX"] as? Float,
		   let playerY = saveData["playerY"] as? Float {
			
			gameState.score = score
			gameState.wave = wave
			gameState.level = level
			gameState.lives = lives
			player.position.x = playerX
			player.position.y = playerY
			print("📁 Game loaded successfully!")
			completion(true)
		} else {
			print("❌ Failed to load game data")
			completion(false)
		}
	}

	func update() {
		if isPaused { return }
		let currentTime = Date().timeIntervalSince1970
		let deltaTime = currentTime - lastUpdateTime
		lastUpdateTime = currentTime

		updatePlayer(deltaTime: deltaTime)
		updateEnemies(deltaTime: deltaTime)
		updateBoss(deltaTime: deltaTime)
		updateBullets(deltaTime: deltaTime)
		updateAsteroids(deltaTime: deltaTime)
		handleCollisions()
		spawnEnemies()
		spawnAsteroids()
		spawnCollectibles()

		gameState.update()
	}

	// MARK: - Updates
	private func updatePlayer(deltaTime: Double) {
		player.update(deltaTime: deltaTime)
	}

	private func updateEnemies(deltaTime: Double) {
		for enemy in enemies {
			enemy.update(deltaTime: deltaTime, playerPosition: player.position)
		}

		enemies.removeAll { $0.isDead || $0.position.y > 1000 }

		if gameState.enemiesKilled >= max(1, gameState.wave) * 20 {
			gameState.wave += 1
		}
	}

	private func updateBoss(deltaTime: Double) {
		boss?.update(deltaTime: deltaTime, playerPosition: player.position)

		if let b = boss, b.isDead {
			boss = nil
			gameState.score += 250
		} else if boss == nil, gameState.wave > 0, gameState.wave % 5 == 0, enemies.isEmpty {
			boss = Boss(x: 400, y: -100)
		}
	}

	private func updateBullets(deltaTime: Double) {
		for index in bullets.indices {
			bullets[index].update(deltaTime: deltaTime)
		}

		bullets.removeAll { $0.position.y < -50 }
	}

	private func updateAsteroids(deltaTime: Double) {
		for asteroid in asteroids {
			asteroid.update(deltaTime: deltaTime)
		}

		asteroids.removeAll { $0.position.y > 1200 || $0.isDead }
	}

	// MARK: - Spawning
	private func spawnEnemies() {
		if Int.random(in: 0..<100) < 5 {
			let x = Float.random(in: 50...750)
			enemies.append(Enemy(x: x, y: -50))
		}
	}

	private func spawnAsteroids() {
		if Int.random(in: 0..<100) < 3 {
			let x = Float.random(in: 50...750)
			asteroids.append(Asteroid(x: x, y: -80))
		}
	}

	private func spawnCollectibles() {
		guard gameState.score > 0 else { return }

		if gameState.score % 100 == 0 && !collectibles.contains(where: { $0.value == gameState.score }) {
			let x = Float.random(in: 50...750)
			// 20% chance for powerup, else coin
			if Int.random(in: 0..<5) == 0 {
				collectibles.append(Collectible(position: SIMD2<Float>(x, 0), type: "powerup", value: 1))
			} else {
				collectibles.append(Collectible(position: SIMD2<Float>(x, 0), type: "coin", value: gameState.score))
			}
		}
	}

	// MARK: - Collisions
	private func handleCollisions() {
		// Bullets vs enemies
		for (bulletIndex, bullet) in bullets.enumerated().reversed() {
			var bulletRemoved = false

			for enemy in enemies where enemy.collidesWith(bullet) {
				bulletRemoved = true
				enemy.takeDamage(5)
				gameState.score += 10
				gameState.comboCount += 1
				if gameState.comboCount > gameState.maxCombo { gameState.maxCombo = gameState.comboCount }
				if gameState.comboCount == 10 { gameState.unlockAchievement("combo-10") }
				if enemy.isDead {
					gameState.enemiesKilled += 1
					if gameState.enemiesKilled == 1 { gameState.unlockAchievement("first-kill") }
				}
				break
			}

			if bulletRemoved {
				bullets.remove(at: bulletIndex)
				continue
			}

			// Bullet vs boss
			if let b = boss, b.collidesWith(bullet) {
				bullets.remove(at: bulletIndex)
				b.takeDamage(5)
				gameState.score += 25
			}
		}

		// Player vs enemies
		for enemy in enemies where player.collidesWith(enemy) {
			gameState.lives -= 1
			enemy.isDead = true
			gameState.comboCount = 0 // reset combo on hit
		}

		// Player vs boss
		if let b = boss, distance(player.position, b.position) < (player.width + b.width) / 2 {
			gameState.lives -= 1
		}

		// Player vs collectibles
		for (index, collectible) in collectibles.enumerated().reversed() {
			if collectible.collidesWith(playerPos: player.position) {
				if collectible.type == "powerup" {
					// Random powerup for demo
					let types: [PowerUp.PowerUpType] = [.rapidFire, .spread, .laser, .missile, .shield]
					let randomType = types.randomElement() ?? .rapidFire
					let powerUp = PowerUp(type: randomType, duration: 10)
					player.applyPowerUp(powerUp)
					gameState.powerUpsCollected += 1
					if gameState.powerUpsCollected == 50 { gameState.unlockAchievement("collector") }
				} else {
					gameState.coins += collectible.value
					gameState.score += collectible.value
				}
				collectibles.remove(at: index)
			}
		}

		// Player vs asteroids
		for asteroid in asteroids {
			let dx = player.position.x - asteroid.position.x
			let dy = player.position.y - asteroid.position.y
			let distanceToAsteroid = sqrt(dx * dx + dy * dy)
			if distanceToAsteroid < (player.width + asteroid.size) / 2 {
				gameState.lives -= 1
			}
		}

		if gameState.lives <= 0 {
			gameState.gameOver = true
		}
	}

	// MARK: - Input
	func setPlayerInput(moveLeft: Bool, moveRight: Bool, fire: Bool) {
		player.moveLeft = moveLeft
		player.moveRight = moveRight

		if fire {
			fireWeapon()
		}
	}

	private func fireWeapon() {
		switch player.weaponType {
		case .laser:
			let bullet = Bullet(position: player.position, velocity: SIMD2<Float>(0, -400))
			bullets.append(bullet)
		case .spread:
			let angles: [Float] = [-0.2, 0, 0.2]
			for angle in angles {
				let vx = sin(angle) * 400
				let vy = -cos(angle) * 400
				let bullet = Bullet(position: player.position, velocity: SIMD2<Float>(vx, vy))
				bullets.append(bullet)
			}
		case .missile:
			let bullet = Bullet(position: player.position, velocity: SIMD2<Float>(0, -300), width: 10, height: 20)
			bullets.append(bullet)
		}
	}

	// MARK: - Accessors
	func getGameState() -> GameState { gameState }
	func getPlayer() -> Player { player }
	func getEnemies() -> [Enemy] { enemies }
	func getBullets() -> [Bullet] { bullets }
	func getAsteroids() -> [Asteroid] { asteroids }
	func getCollectibles() -> [Collectible] { collectibles }
	func getBoss() -> Boss? { boss }
}
