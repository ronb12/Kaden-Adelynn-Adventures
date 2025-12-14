import Foundation
import simd

class GameEngine {
	private var player: Player
	private var enemies: [Enemy]
	private var bullets: [Bullet]
	private var asteroids: [Asteroid]
	private var collectibles: [Collectible]
	private var boss: Boss?
	private var gameState: GameState
	private var lastUpdateTime: TimeInterval

	init() {
		self.player = Player(x: 400, y: 700)
		self.enemies = []
		self.bullets = []
		self.asteroids = []
		self.collectibles = []
		self.boss = nil
		self.gameState = GameState()
		self.lastUpdateTime = Date().timeIntervalSince1970
	}

	func update() {
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
			collectibles.append(Collectible(position: SIMD2<Float>(x, 0), type: "coin", value: gameState.score))
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
				if enemy.isDead { gameState.enemiesKilled += 1 }
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
		}

		// Player vs boss
		if let b = boss, distance(player.position, b.position) < (player.width + b.width) / 2 {
			gameState.lives -= 1
		}

		// Player vs collectibles
		for (index, collectible) in collectibles.enumerated().reversed() {
			if collectible.collidesWith(playerPos: player.position) {
				collectibles.remove(at: index)
				gameState.coins += collectible.value
				gameState.score += collectible.value
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
			let bullet = Bullet(position: player.position, velocity: SIMD2<Float>(0, -400))
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
