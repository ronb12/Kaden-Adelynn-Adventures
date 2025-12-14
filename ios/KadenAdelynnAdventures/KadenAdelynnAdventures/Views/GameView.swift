import SwiftUI
import Metal
import MetalKit

struct GameView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> GameViewController {
        return GameViewController()
    }
    
    func updateUIViewController(_ uiViewController: GameViewController, context: Context) {
        // Update logic here if needed
    }
}

class GameViewController: UIViewController {
    private var metalView: MTKView?
    private var renderer: GameRenderer?
    private var gameEngine: GameEngine?
    private var displayLink: CADisplayLink?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupMetalView()
        setupGameEngine()
        startGameLoop()
    }
    
    private func setupMetalView() {
        guard let device = MTLCreateSystemDefaultDevice() else {
            print("Metal is not supported on this device")
            return
        }
        
        let metalView = MTKView(frame: view.bounds, device: device)
        metalView.delegate = self
        metalView.preferredFramesPerSecond = 60
        metalView.framebufferOnly = false
        
        view.addSubview(metalView)
        metalView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            metalView.topAnchor.constraint(equalTo: view.topAnchor),
            metalView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            metalView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            metalView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
        
        self.metalView = metalView
        self.renderer = GameRenderer(metalView: metalView)
    }
    
    private func setupGameEngine() {
        gameEngine = GameEngine()
        setupTouchHandling()
    }
    
    private func startGameLoop() {
        displayLink = CADisplayLink(
            target: self,
            selector: #selector(updateGame)
        )
        displayLink?.add(to: .main, forMode: .common)
    }
    
    @objc private func updateGame() {
        guard let gameEngine = gameEngine, let renderer = renderer else { return }
        
        gameEngine.update()
        renderer.render(gameState: gameEngine.getGameState())
    }
    
    private func setupTouchHandling() {
        let touchRecognizer = UITouchesEvent(target: self, action: #selector(handleTouches(_:)))
        view.addGestureRecognizer(touchRecognizer)
    }
    
    @objc private func handleTouches(_ gesture: UIGestureRecognizer) {
        guard let touches = gesture.view?.window?.allTouches else { return }
        
        for touch in touches {
            let location = touch.location(in: view)
            let midpoint = view.bounds.width / 2
            
            if location.x < midpoint {
                gameEngine?.setPlayerInput(moveLeft: true, moveRight: false, fire: true)
            } else {
                gameEngine?.setPlayerInput(moveLeft: false, moveRight: true, fire: true)
            }
        }
    }
    
    deinit {
        displayLink?.invalidate()
    }
}

extension GameViewController: MTKViewDelegate {
    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {
        renderer?.resize(size: size)
    }
    
    func draw(in view: MTKView) {
        // Rendering is handled by CADisplayLink
    }
}

// MARK: - UITouchesEvent (Custom Gesture Recognizer)
class UITouchesEvent: UIGestureRecognizer {
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        state = .began
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        state = .changed
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        state = .ended
    }
}
