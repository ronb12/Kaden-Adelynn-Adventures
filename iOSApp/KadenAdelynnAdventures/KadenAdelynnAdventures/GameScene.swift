import SpriteKit
import GameplayKit
import GameKit

class GameScene: SKScene {
    
    // MARK: - Game State
    private var gameState: GameState = .menu
    private var player: SKSpriteNode!
    private var scoreLabel: SKLabelNode!
    private var livesLabel: SKLabelNode!
    private var menuNode: SKNode!
    
    // MARK: - Game Variables
    private var score: Int = 0
    private var lives: Int = 25
    
    // MARK: - Scene Setup
    override func didMove(to view: SKView) {
        setupGame()
        setupUI()
        startMenu()
    }
    
    private func setupGame() {
        backgroundColor = SKColor.black
        
        // Setup physics world
        physicsWorld.gravity = CGVector(dx: 0, dy: 0)
        physicsWorld.contactDelegate = self
        
        // Create player
        player = SKSpriteNode(color: .blue, size: CGSize(width: 40, height: 40))
        player.position = CGPoint(x: size.width / 2, y: 100)
        player.physicsBody = SKPhysicsBody(rectangleOf: player.size)
        player.physicsBody?.categoryBitMask = PhysicsCategory.player
        player.physicsBody?.contactTestBitMask = PhysicsCategory.enemy
        player.physicsBody?.collisionBitMask = 0
        player.physicsBody?.isDynamic = true
        addChild(player)
    }
    
    private func setupUI() {
        // Score label
        scoreLabel = SKLabelNode(fontNamed: "Arial-Bold")
        scoreLabel.text = "Score: 0"
        scoreLabel.fontSize = 24
        scoreLabel.fontColor = .white
        scoreLabel.position = CGPoint(x: 100, y: size.height - 50)
        addChild(scoreLabel)
        
        // Lives label
        livesLabel = SKLabelNode(fontNamed: "Arial-Bold")
        livesLabel.text = "Lives: 25"
        livesLabel.fontSize = 24
        livesLabel.fontColor = .white
        livesLabel.position = CGPoint(x: 100, y: size.height - 80)
        addChild(livesLabel)
        
        setupMenuUI()
    }
    
    private func setupMenuUI() {
        menuNode = SKNode()
        
        let titleLabel = SKLabelNode(fontNamed: "Arial-Bold")
        titleLabel.text = "Kaden & Adelynn Adventures"
        titleLabel.fontSize = 32
        titleLabel.fontColor = .white
        titleLabel.position = CGPoint(x: size.width / 2, y: size.height - 150)
        menuNode.addChild(titleLabel)
        
        let startButton = createButton(text: "Start Game", position: CGPoint(x: size.width / 2, y: size.height / 2 + 50))
        startButton.name = "start_button"
        menuNode.addChild(startButton)
        
        addChild(menuNode)
    }
    
    private func createButton(text: String, position: CGPoint) -> SKNode {
        let button = SKNode()
        
        let background = SKShapeNode(rectOf: CGSize(width: 200, height: 50), cornerRadius: 10)
        background.fillColor = .blue
        background.strokeColor = .white
        background.lineWidth = 2
        button.addChild(background)
        
        let label = SKLabelNode(fontNamed: "Arial-Bold")
        label.text = text
        label.fontSize = 18
        label.fontColor = .white
        label.verticalAlignmentMode = .center
        button.addChild(label)
        
        button.position = position
        return button
    }
    
    // MARK: - Game Flow
    private func startMenu() {
        gameState = .menu
        menuNode.isHidden = false
        player.isHidden = true
    }
    
    private func startGame() {
        gameState = .playing
        menuNode.isHidden = true
        player.isHidden = false
        
        // Reset game state
        score = 0
        lives = 25
        updateUI()
    }
    
    private func gameOver() {
        gameState = .gameOver
        // Submit score to Game Center
        submitScoreToGameCenter()
    }
    
    // MARK: - Update
    override func update(_ currentTime: TimeInterval) {
        guard gameState == .playing else { return }
        
        // Game loop logic here
        updatePlayer(currentTime)
        spawnEnemies(currentTime)
        checkCollisions()
    }
    
    private func updatePlayer(_ currentTime: TimeInterval) {
        // Player movement and shooting logic
    }
    
    private func spawnEnemies(_ currentTime: TimeInterval) {
        // Enemy spawning logic
    }
    
    private func checkCollisions() {
        // Collision detection logic
    }
    
    // MARK: - Touch Handling
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let location = touch.location(in: self)
        
        if gameState == .menu {
            let touchedNode = atPoint(location)
            if touchedNode.name == "start_button" {
                startGame()
            }
        } else if gameState == .playing {
            // Handle game touch input
            player.position.x = location.x
        }
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard gameState == .playing else { return }
        guard let touch = touches.first else { return }
        
        let location = touch.location(in: self)
        player.position.x = location.x
        
        // Keep player within screen bounds
        let minX = player.size.width / 2
        let maxX = size.width - player.size.width / 2
        player.position.x = max(minX, min(maxX, player.position.x))
    }
    
    // MARK: - UI Updates
    private func updateUI() {
        scoreLabel.text = "Score: \(score)"
        livesLabel.text = "Lives: \(lives)"
    }
    
    // MARK: - Game Center Integration
    private func submitScoreToGameCenter() {
        if GKLocalPlayer.local.isAuthenticated {
            GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: ["kaden_adelynn_high_scores"]) { error in
                if let error = error {
                    print("Failed to submit score: \(error.localizedDescription)")
                } else {
                    print("Score submitted successfully")
                }
            }
        }
    }
}

// MARK: - Physics Categories
struct PhysicsCategory {
    static let none: UInt32 = 0
    static let player: UInt32 = 0b1
    static let enemy: UInt32 = 0b10
    static let playerBullet: UInt32 = 0b100
    static let enemyBullet: UInt32 = 0b1000
    static let powerUp: UInt32 = 0b10000
    static let collectible: UInt32 = 0b100000
}

// MARK: - Game State
enum GameState {
    case menu
    case playing
    case paused
    case gameOver
}

// MARK: - Physics Contact Delegate
extension GameScene: SKPhysicsContactDelegate {
    func didBegin(_ contact: SKPhysicsContact) {
        // Handle collisions here
    }
} 