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
    
    // UI Elements
    private var pauseButton: UIButton?
    private var saveButton: UIButton?
    private var loadButton: UIButton?
    private var toastLabel: UILabel?
    private var fabMenu: UIView?
    private var fabButton: UIButton?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupMetalView()
        setupGameEngine()
        setupControls()
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
        let screenWidth = Float(view.bounds.width)
        let screenHeight = Float(view.bounds.height)
        gameEngine = GameEngine(screenWidth: screenWidth, screenHeight: screenHeight)
        setupTouchHandling()
    }
    
    private func setupControls() {
        // FAB Button
        let fabButton = UIButton(type: .system)
        fabButton.setTitle("☰", for: .normal)
        fabButton.titleLabel?.font = .systemFont(ofSize: 22)
        fabButton.backgroundColor = UIColor.black.withAlphaComponent(0.7)
        fabButton.tintColor = .white
        fabButton.layer.cornerRadius = 24
        fabButton.translatesAutoresizingMaskIntoConstraints = false
        fabButton.addTarget(self, action: #selector(toggleFABMenu), for: .touchUpInside)
        view.addSubview(fabButton)
        self.fabButton = fabButton
        
        NSLayoutConstraint.activate([
            fabButton.widthAnchor.constraint(equalToConstant: 48),
            fabButton.heightAnchor.constraint(equalToConstant: 48),
            fabButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 10),
            fabButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -80)
        ])
        
        // FAB Menu
        let fabMenu = UIView()
        fabMenu.backgroundColor = UIColor.black.withAlphaComponent(0.75)
        fabMenu.layer.cornerRadius = 8
        fabMenu.translatesAutoresizingMaskIntoConstraints = false
        fabMenu.isHidden = true
        view.addSubview(fabMenu)
        self.fabMenu = fabMenu
        
        // Pause Button
        let pauseBtn = createMenuButton(title: "⏸ Pause", action: #selector(togglePause))
        fabMenu.addSubview(pauseBtn)
        self.pauseButton = pauseBtn
        
        // Save Button
        let saveBtn = createMenuButton(title: "💾 Save", action: #selector(saveGame))
        fabMenu.addSubview(saveBtn)
        self.saveButton = saveBtn
        
        // Load Button
        let loadBtn = createMenuButton(title: "📁 Load", action: #selector(loadGame))
        fabMenu.addSubview(loadBtn)
        self.loadButton = loadBtn
        
        NSLayoutConstraint.activate([
            fabMenu.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 10),
            fabMenu.bottomAnchor.constraint(equalTo: fabButton.topAnchor, constant: -8),
            fabMenu.widthAnchor.constraint(equalToConstant: 140),
            
            pauseBtn.topAnchor.constraint(equalTo: fabMenu.topAnchor, constant: 8),
            pauseBtn.leadingAnchor.constraint(equalTo: fabMenu.leadingAnchor, constant: 8),
            pauseBtn.trailingAnchor.constraint(equalTo: fabMenu.trailingAnchor, constant: -8),
            
            saveBtn.topAnchor.constraint(equalTo: pauseBtn.bottomAnchor, constant: 6),
            saveBtn.leadingAnchor.constraint(equalTo: fabMenu.leadingAnchor, constant: 8),
            saveBtn.trailingAnchor.constraint(equalTo: fabMenu.trailingAnchor, constant: -8),
            
            loadBtn.topAnchor.constraint(equalTo: saveBtn.bottomAnchor, constant: 6),
            loadBtn.leadingAnchor.constraint(equalTo: fabMenu.leadingAnchor, constant: 8),
            loadBtn.trailingAnchor.constraint(equalTo: fabMenu.trailingAnchor, constant: -8),
            loadBtn.bottomAnchor.constraint(equalTo: fabMenu.bottomAnchor, constant: -8)
        ])
        
        // Toast Label
        let toast = UILabel()
        toast.textAlignment = .center
        toast.textColor = .white
        toast.font = .boldSystemFont(ofSize: 20)
        toast.backgroundColor = UIColor.systemPurple.withAlphaComponent(0.95)
        toast.layer.cornerRadius = 16
        toast.clipsToBounds = true
        toast.numberOfLines = 0
        toast.translatesAutoresizingMaskIntoConstraints = false
        toast.alpha = 0
        view.addSubview(toast)
        self.toastLabel = toast
        
        NSLayoutConstraint.activate([
            toast.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            toast.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            toast.widthAnchor.constraint(greaterThanOrEqualToConstant: 250),
            toast.heightAnchor.constraint(greaterThanOrEqualToConstant: 60)
        ])
    }
    
    private func createMenuButton(title: String, action: Selector) -> UIButton {
        let button = UIButton(type: .system)
        button.setTitle(title, for: .normal)
        button.titleLabel?.font = .boldSystemFont(ofSize: 14)
        button.backgroundColor = UIColor.systemGreen.withAlphaComponent(0.9)
        button.tintColor = .white
        button.layer.cornerRadius = 6
        button.translatesAutoresizingMaskIntoConstraints = false
        button.heightAnchor.constraint(equalToConstant: 40).isActive = true
        button.addTarget(self, action: action, for: .touchUpInside)
        return button
    }
    
    @objc private func toggleFABMenu() {
        fabMenu?.isHidden.toggle()
    }
    
    @objc private func togglePause() {
        // Toggle pause in game state
        // gameEngine?.togglePause()
        fabMenu?.isHidden = true
    }
    
    @objc private func saveGame() {
        fabMenu?.isHidden = true
        gameEngine?.saveGame { [weak self] success in
            DispatchQueue.main.async {
                if success {
                    self?.showToast("💾 Game Saved!")
                } else {
                    self?.showToast("❌ Save failed!")
                }
            }
        }
    }
    
    @objc private func loadGame() {
        fabMenu?.isHidden = true
        gameEngine?.loadGame { [weak self] success in
            DispatchQueue.main.async {
                if success {
                    self?.showToast("📁 Game Loaded!")
                } else {
                    self?.showToast("❌ No saved game found")
                }
            }
        }
    }
    
    private func showToast(_ message: String) {
        guard let toast = toastLabel else { return }
        
        toast.text = message
        
        UIView.animate(withDuration: 0.4, delay: 0, usingSpringWithDamping: 0.7, initialSpringVelocity: 0.5) {
            toast.alpha = 1
            toast.transform = CGAffineTransform(scaleX: 1.05, y: 1.05)
        } completion: { _ in
            UIView.animate(withDuration: 0.2) {
                toast.transform = .identity
            }
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            UIView.animate(withDuration: 0.3) {
                toast.alpha = 0
            }
        }
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
        let location = gesture.location(in: view)
        let midpoint = view.bounds.width / 2

        if location.x < midpoint {
            gameEngine?.setPlayerInput(moveLeft: true, moveRight: false, fire: true)
        } else {
            gameEngine?.setPlayerInput(moveLeft: false, moveRight: true, fire: true)
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
