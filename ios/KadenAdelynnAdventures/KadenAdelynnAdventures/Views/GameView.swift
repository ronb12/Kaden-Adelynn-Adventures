import SwiftUI
// Import TutorialOverlayView so it's in scope
// (No explicit import needed if in same target, but ensure file is included in build)
import Metal
import MetalKit

struct GameView: UIViewControllerRepresentable {
    @State private var showTutorial = !UserDefaults.standard.bool(forKey: "tutorialCompleted")

    func makeUIViewController(context: Context) -> GameViewController {
        let vc = GameViewController()
        vc.onTutorialDismiss = {
            showTutorial = false
            UserDefaults.standard.set(true, forKey: "tutorialCompleted")
        }
        return vc
    }

    func updateUIViewController(_ uiViewController: GameViewController, context: Context) {
        // Update logic here if needed
    }

    func makeUIView(context: Context) -> some UIView {
        let controller = makeUIViewController(context: context)
        let hosting = UIHostingController(rootView:
            ZStack {
                controller.view!
                if showTutorial {
                    TutorialOverlayView(isPresented: $showTutorial)
                }
            }
        )
        return hosting.view
    }
}

class GameViewController: UIViewController {
                private var lastProfilerLog: TimeInterval = Date().timeIntervalSince1970
            var onTutorialDismiss: (() -> Void)?
        private var controlsHintLabel: UILabel?
    var selectedCharacter: String = "Kaden"
    var selectedShip: String = "Falcon"
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
            print("[DEBUG] viewDidLoad called")
            setupMetalView()
            setupGameEngine()
            setupControls()
            setupControlsHint()
            startGameLoop()
            GameCenterManager.shared.authenticateLocalPlayer()
        }
            @objc private func showLeaderboard() {
                GameCenterManager.shared.showLeaderboard(leaderboardID: "kaden_adelynn_highscores")
            }
        private func setupControlsHint() {
            let hint = UILabel()
            hint.text = "Controls:\n←/→ or Touch: Move\nTap: Fire\n☰: Menu / Pause / Save / Load / End"
            hint.font = .systemFont(ofSize: 13, weight: .medium)
            Haptics.impact(.light)
            hint.textColor = .white
            hint.backgroundColor = UIColor.black.withAlphaComponent(0.7)
            hint.layer.cornerRadius = 8
            hint.clipsToBounds = true
            Haptics.selection()
            hint.numberOfLines = 0
            hint.textAlignment = .left
            hint.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(hint)
            Haptics.notification(.success)
            self.controlsHintLabel = hint
            NSLayoutConstraint.activate([
                hint.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 12),
                hint.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -10),
                hint.widthAnchor.constraint(greaterThanOrEqualToConstant: 180),
                hint.heightAnchor.constraint(greaterThanOrEqualToConstant: 60)
            ])
        }
    private func setupMetalView() {
        guard let device = MTLCreateSystemDefaultDevice() else {
            print("[DEBUG] Metal is not supported on this device")
            return
                        Haptics.notification(.success)
        }
        print("[DEBUG] Metal device created: \(device)")
                        Haptics.notification(.error)
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
        Haptics.notification(.warning)
        self.metalView = metalView
        self.renderer = GameRenderer(metalView: metalView)
        print("[DEBUG] MetalView and GameRenderer initialized")
    }
    
    private func setupGameEngine() {
        let screenWidth = Float(view.bounds.width)
        let screenHeight = Float(view.bounds.height)
        gameEngine = GameEngine(screenWidth: screenWidth, screenHeight: screenHeight, character: selectedCharacter, ship: selectedShip)
        setupTouchHandling()
    }
    
    private func setupControls() {
        // FAB Button
        let fabButton = UIButton(type: .system)
            fabButton.setTitle("☰", for: .normal)
            fabButton.titleLabel?.font = UIFont.preferredFont(forTextStyle: .title2)
            fabButton.titleLabel?.adjustsFontForContentSizeCategory = true
        fabButton.backgroundColor = UIColor.black.withAlphaComponent(0.7)
        fabButton.tintColor = .white
        fabButton.layer.cornerRadius = 24
        fabButton.translatesAutoresizingMaskIntoConstraints = false
        fabButton.addTarget(self, action: #selector(toggleFABMenu), for: .touchUpInside)
            fabButton.accessibilityLabel = "Open menu"
            fabButton.accessibilityTraits = .button
        view.addSubview(fabButton)
        self.fabButton = fabButton
        
        NSLayoutConstraint.activate([
            fabButton.widthAnchor.constraint(equalToConstant: 48),
            fabButton.heightAnchor.constraint(equalToConstant: 48),
            fabButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 10),
            fabButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -80)
        ])

        // Add Game Center leaderboard and Controls buttons to FAB menu if present
        if let fabMenu = fabMenu {
            let leaderboardButton = UIButton(type: .system)
            leaderboardButton.setTitle("Leaderboard", for: .normal)
            leaderboardButton.titleLabel?.font = UIFont.preferredFont(forTextStyle: .body)
            leaderboardButton.titleLabel?.adjustsFontForContentSizeCategory = true
            leaderboardButton.accessibilityLabel = "Show leaderboard"
            leaderboardButton.accessibilityTraits = .button
            leaderboardButton.addTarget(self, action: #selector(showLeaderboard), for: .touchUpInside)
            leaderboardButton.frame = CGRect(x: 10, y: fabMenu.frame.height - 60, width: fabMenu.frame.width - 20, height: 44)
            fabMenu.addSubview(leaderboardButton)

            let controlsButton = UIButton(type: .system)
            controlsButton.setTitle("Controls", for: .normal)
            controlsButton.titleLabel?.font = UIFont.preferredFont(forTextStyle: .body)
            controlsButton.titleLabel?.adjustsFontForContentSizeCategory = true
            controlsButton.accessibilityLabel = "Customize controls"
            controlsButton.accessibilityTraits = .button
            controlsButton.addTarget(self, action: #selector(showControlsSettings), for: .touchUpInside)
            controlsButton.frame = CGRect(x: 10, y: fabMenu.frame.height - 110, width: fabMenu.frame.width - 20, height: 44)
            fabMenu.addSubview(controlsButton)
        }
            @objc func showControlsSettings() {
                let settingsVC = UIHostingController(rootView: ControlsSettingsView())
                settingsVC.modalPresentationStyle = .formSheet
                present(settingsVC, animated: true, completion: nil)
            }
        
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
            pauseBtn.titleLabel?.font = UIFont.preferredFont(forTextStyle: .body)
            pauseBtn.titleLabel?.adjustsFontForContentSizeCategory = true
            pauseBtn.accessibilityLabel = "Pause game"
            pauseBtn.accessibilityTraits = .button
        fabMenu.addSubview(pauseBtn)
        self.pauseButton = pauseBtn
        
        // Save Button
        let saveBtn = createMenuButton(title: "💾 Save", action: #selector(saveGame))
            saveBtn.titleLabel?.font = UIFont.preferredFont(forTextStyle: .body)
            saveBtn.titleLabel?.adjustsFontForContentSizeCategory = true
            saveBtn.accessibilityLabel = "Save game"
            saveBtn.accessibilityTraits = .button
        fabMenu.addSubview(saveBtn)
        self.saveButton = saveBtn
        
        // Load Button
        let loadBtn = createMenuButton(title: "📁 Load", action: #selector(loadGame))
            loadBtn.titleLabel?.font = UIFont.preferredFont(forTextStyle: .body)
            loadBtn.titleLabel?.adjustsFontForContentSizeCategory = true
            loadBtn.accessibilityLabel = "Load game"
            loadBtn.accessibilityTraits = .button
        fabMenu.addSubview(loadBtn)
        self.loadButton = loadBtn

        // End Game Button
        let endBtn = createMenuButton(title: "🛑 End Game", action: #selector(endGame))
            endBtn.titleLabel?.font = UIFont.preferredFont(forTextStyle: .body)
            endBtn.titleLabel?.adjustsFontForContentSizeCategory = true
            endBtn.accessibilityLabel = "End game"
            endBtn.accessibilityTraits = .button
        fabMenu.addSubview(endBtn)

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

            endBtn.topAnchor.constraint(equalTo: loadBtn.bottomAnchor, constant: 6),
            endBtn.leadingAnchor.constraint(equalTo: fabMenu.leadingAnchor, constant: 8),
            endBtn.trailingAnchor.constraint(equalTo: fabMenu.trailingAnchor, constant: -8),
            endBtn.bottomAnchor.constraint(equalTo: fabMenu.bottomAnchor, constant: -8)
        ])
            @objc func endGame() {
                // End the game immediately
                gameEngine?.gameState.lives = 0
                gameEngine?.gameState.gameOver = true
                fabMenu?.isHidden = true
                showToast("🛑 Game Ended")
            }
        
        // Toast Label
        let toast = UILabel()
        toast.textAlignment = .center
        toast.textColor = .white
        toast.font = .boldSystemFont(ofSize: 20)
            toast.font = UIFont.preferredFont(forTextStyle: .body)
            toast.adjustsFontForContentSizeCategory = true
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
            toast.isAccessibilityElement = true
            toast.accessibilityLabel = message
        
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
        Profiler.shared.startFrame()
        gameEngine.update()
        renderer.render(gameState: gameEngine.getGameState())
        Profiler.shared.endFrame()
        let now = Date().timeIntervalSince1970
        if now - lastProfilerLog > 5 {
            Profiler.shared.logPerformance()
            lastProfilerLog = now
        }
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
