//
//  GameView.swift
//  KadenAdelynnSpaceAdventures
//
//  Redesigned game view with modern UI and enhanced gameplay screen
//

import SwiftUI
import SpriteKit

struct GameView: View {
    @EnvironmentObject var gameState: GameStateManager
    @StateObject private var achievementManager = AchievementManager.shared
    @State private var scene: GameScene?
    @State private var viewSize: CGSize = .zero
    @State private var previousScore: Int = 0
    @State private var showScoreAnimation: Bool = false
    @State private var currentFPS: Int = 60
    @State private var bossHealth: Int = 0
    @State private var bossMaxHealth: Int = 100
    
    // Get current weapon from game logic
    private func getCurrentWeapon() -> WeaponType {
        if let scene = scene {
            return scene.gameLogic.player.weaponType
        }
        return .laser
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                // Game scene - fills entire screen
                if let scene = scene {
                    SpriteView(scene: scene, options: [.allowsTransparency])
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .position(x: geometry.size.width / 2, y: geometry.size.height / 2)
                        .ignoresSafeArea(.all)
                        .onAppear {
                            scene.gameState = gameState
                        }
                } else {
                    Color.black
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .ignoresSafeArea(.all)
                }
            
                // Redesigned HUD Overlay - NEW VERSION v2.0
                VStack(spacing: 0) {
                    // Top Scoreboard - REDESIGNED
                    redesignedScoreboard(geometry: geometry)
                        .id("redesigned-scoreboard-v2")  // Force SwiftUI to recognize this as new
                    
                    Spacer()
                    
                    // Boss Health Bar (when boss is active)
                    bossHealthBar(geometry: geometry)
                    
                    // Bottom Controls
                    bottomControls(geometry: geometry)
                }
                
                // Achievement notification
                AchievementNotificationView(achievementManager: achievementManager)
                
                // Pause overlay
                if gameState.isPaused {
                    redesignedPauseOverlay
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.height, alignment: .topLeading)
            .onAppear {
                viewSize = geometry.size
                setupGame(size: geometry.size)
                previousScore = gameState.score
            }
            .onChange(of: geometry.size) { newSize in
                viewSize = newSize
                updateGameSize(newSize)
            }
            .onChange(of: gameState.score) { newScore in
                if newScore != previousScore {
                    showScoreAnimation = true
                    previousScore = newScore
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        showScoreAnimation = false
                    }
                }
            }
            .onChange(of: gameState.currentFPS) { newFPS in
                currentFPS = newFPS
            }
            .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("BossHealthUpdated"))) { notification in
                if let userInfo = notification.userInfo,
                   let health = userInfo["health"] as? Int,
                   let maxHealth = userInfo["maxHealth"] as? Int {
                    bossHealth = health
                    bossMaxHealth = maxHealth
                }
            }
            .onAppear {
                // Start timer to check boss health
                Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
                    if let boss = scene?.gameLogic.boss {
                        bossHealth = boss.health
                        bossMaxHealth = boss.maxHealth
                    } else {
                        bossHealth = 0
                        bossMaxHealth = 100
                    }
                }
            }
            .onDisappear {
                scene = nil
            }
        }
        .ignoresSafeArea()
    }
    
    // MARK: - Redesigned Scoreboard
    @ViewBuilder
    private func redesignedScoreboard(geometry: GeometryProxy) -> some View {
        let screenWidth = geometry.size.width
        let healthPercent = CGFloat(gameState.health) / 100.0
        let healthColor = gameState.health <= 25 ? Color.red : gameState.health <= 50 ? Color.orange : Color.green
        let comboColor = gameState.combo > 0 ? Color.yellow : Color.gray.opacity(0.5)
        let accuracy = gameState.shotsFired > 0 ? Int((Double(gameState.shotsHit) / Double(gameState.shotsFired)) * 100) : 0
        let accColor = accuracy >= 75 ? Color.green : accuracy >= 50 ? Color.yellow : Color.red
        let fpsColor = currentFPS >= 55 ? Color.green : currentFPS >= 30 ? Color.yellow : Color.red
        
        VStack(spacing: 0) {
            // Gradient background with blur effect - NEW REDESIGNED VERSION
            ZStack {
                // Base gradient background
                LinearGradient(
                    colors: [
                        Color(red: 0.05, green: 0.05, blue: 0.15).opacity(0.98),  // Darker blue tint
                        Color(red: 0.1, green: 0.1, blue: 0.25).opacity(0.98)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                
                // Animated glow effect - REDESIGNED
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.cyan.opacity(0.4),
                                Color.purple.opacity(0.2),
                                Color.blue.opacity(0.1),
                                Color.clear
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .blur(radius: 25)
                    .opacity(0.8 + 0.2 * sin(Date().timeIntervalSince1970))
            }
            .overlay(
                VStack(spacing: 6) {
                    // Row 1: Primary Stats (Score, Lives, Health, Coins)
                    HStack(spacing: 8) {
                        // Score - Large and prominent
                        StatCard(
                            icon: "⭐",
                            label: "SCORE",
                            value: String(format: "%06d", gameState.score),
                            color: .yellow,
                            size: .large,
                            animate: showScoreAnimation
                        )
                        
                        // Lives
                        StatCard(
                            icon: "❤️",
                            label: "LIVES",
                            value: "\(gameState.lives)",
                            color: Color(red: 1.0, green: 0.4, blue: 0.4),
                            size: .medium
                        )
                        
                        // Health with visual bar
                        VStack(spacing: 3) {
                            StatCard(
                                icon: "♥",
                                label: "HP",
                                value: "\(gameState.health)%",
                                color: healthColor,
                                size: .small
                            )
                            
                            // Enhanced health bar
                            GeometryReader { barGeo in
                                ZStack(alignment: .leading) {
                                    // Background
                                    RoundedRectangle(cornerRadius: 3)
                                        .fill(Color.red.opacity(0.2))
                                        .frame(height: 4)
                                    
                                    // Health fill with gradient
                                    RoundedRectangle(cornerRadius: 3)
                                        .fill(
                                            LinearGradient(
                                                colors: healthPercent > 0.5 ?
                                                    [.green, .green.opacity(0.8)] :
                                                    healthPercent > 0.25 ?
                                                    [.yellow, .orange] :
                                                    [.red, .red.opacity(0.8)],
                                                startPoint: .leading,
                                                endPoint: .trailing
                                            )
                                        )
                                        .frame(width: barGeo.size.width * healthPercent, height: 4)
                                        .animation(.spring(response: 0.3), value: healthPercent)
                                    
                                    // Glow effect on low health
                                    if gameState.health <= 25 {
                                        RoundedRectangle(cornerRadius: 3)
                                            .fill(Color.red.opacity(0.5))
                                            .frame(width: barGeo.size.width * healthPercent, height: 4)
                                            .blur(radius: 3)
                                            .opacity(0.5 + 0.5 * sin(Date().timeIntervalSince1970 * 4))
                                    }
                                }
                            }
                            .frame(height: 4)
                        }
                        .frame(width: screenWidth * 0.22)
                        
                        // Coins
                        StatCard(
                            icon: "💰",
                            label: "COINS",
                            value: "\(gameState.coins)",
                            color: .yellow,
                            size: .medium
                        )
                    }
                    .padding(.horizontal, 8)
                    .padding(.top, 4)
                    
                    // Row 2: Secondary Stats (Kills, Wave, Combo, Accuracy)
                    HStack(spacing: 8) {
                        StatCard(
                            icon: "🎯",
                            label: "KILLS",
                            value: "\(gameState.enemiesKilled)",
                            color: .cyan,
                            size: .small
                        )
                        
                        StatCard(
                            icon: "W",
                            label: "WAVE",
                            value: "\(gameState.wave)",
                            color: .purple,
                            size: .small
                        )
                        
                        // Combo with special effects
                        VStack(spacing: 2) {
                            StatCard(
                                icon: "⚡",
                                label: "COMBO",
                                value: "\(gameState.combo)",
                                color: comboColor,
                                size: .small,
                                pulse: gameState.combo > 0
                            )
                            
                            // Combo meter visualization
                            if gameState.combo > 0 {
                                ComboMeter(combo: gameState.combo)
                            }
                        }
                        .frame(width: screenWidth * 0.22)
                        
                        StatCard(
                            icon: "🎯",
                            label: "ACC",
                            value: "\(accuracy)%",
                            color: accColor,
                            size: .small
                        )
                    }
                    .padding(.horizontal, 8)
                    
                    // Row 3: Weapon, FPS, Power-ups
                    HStack(spacing: 8) {
                        StatCard(
                            icon: "⚔️",
                            label: "WPN",
                            value: weaponName(for: getCurrentWeapon()),
                            color: Color(red: 0, green: 1.0, blue: 0.6),
                            size: .small
                        )
                        
                        StatCard(
                            icon: "⚙️",
                            label: "FPS",
                            value: "\(currentFPS)",
                            color: fpsColor,
                            size: .small
                        )
                        
                        // Enhanced power-up display
                        enhancedPowerUpDisplay(width: screenWidth * 0.35)
                    }
                    .padding(.horizontal, 8)
                    .padding(.bottom, 4)
                }
            )
            .frame(height: 110)  // Slightly taller for better visibility
            
            // Bottom border with glow - REDESIGNED VERSION v2.0
            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [Color.cyan, Color.purple, Color.pink, Color.cyan],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 4)  // Thicker border
                .shadow(color: Color.cyan, radius: 8)
                .overlay(
                    Rectangle()
                        .fill(Color.white.opacity(0.5))
                        .frame(height: 2)
                        .blur(radius: 2)
                )
        }
        .frame(width: screenWidth)
        .padding(.top, geometry.safeAreaInsets.top)
    }
    
    // MARK: - Boss Health Bar
    @ViewBuilder
    private func bossHealthBar(geometry: GeometryProxy) -> some View {
        let healthPercent = CGFloat(bossHealth) / CGFloat(max(bossMaxHealth, 1))
        let healthColor = healthPercent > 0.5 ? Color.red : healthPercent > 0.25 ? Color.orange : Color.yellow
        
        VStack(spacing: 4) {
            Text("BOSS")
                .font(.system(size: 14, weight: .bold, design: .monospaced))
                .foregroundColor(.red)
                .shadow(color: .red, radius: 5)
            
            ZStack(alignment: .leading) {
                // Background
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color.black.opacity(0.8))
                    .frame(height: 20)
                    .overlay(
                        RoundedRectangle(cornerRadius: 6)
                            .stroke(Color.red, lineWidth: 2)
                    )
                
                // Health fill
                RoundedRectangle(cornerRadius: 4)
                    .fill(
                        LinearGradient(
                            colors: [healthColor, healthColor.opacity(0.7)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: geometry.size.width * 0.7 * healthPercent, height: 16)
                    .padding(2)
                    .animation(.spring(response: 0.3), value: healthPercent)
                
                // Health text
                Text("\(bossHealth)/\(bossMaxHealth)")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)
                    .shadow(color: .black, radius: 2)
            }
            .frame(width: geometry.size.width * 0.7, height: 20)
        }
        .padding(.bottom, 10)
    }
    
    // MARK: - Bottom Controls
    @ViewBuilder
    private func bottomControls(geometry: GeometryProxy) -> some View {
        HStack {
            Spacer()
            
            // Pause Button with modern design
            Button(action: {
                gameState.isPaused.toggle()
            }) {
                Image(systemName: gameState.isPaused ? "play.fill" : "pause.fill")
                    .foregroundColor(.white)
                    .font(.title2)
                    .frame(width: 50, height: 50)
                    .background(
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color.blue.opacity(0.8),
                                        Color.cyan.opacity(0.8)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .shadow(color: Color.cyan, radius: 5)
                    )
            }
            .padding(.trailing, 20)
            .padding(.bottom, geometry.safeAreaInsets.bottom > 0 ? 10 : 20)
        }
    }
    
    // MARK: - Redesigned Pause Overlay
    private var redesignedPauseOverlay: some View {
        ZStack {
            // Blurred background
            Color.black.opacity(0.85)
                .ignoresSafeArea()
                .blur(radius: 10)
            
            VStack(spacing: 30) {
                // Title with glow
                Text("PAUSED")
                    .font(.system(size: 48, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)
                    .shadow(color: Color.cyan, radius: 10)
                    .overlay(
                        Text("PAUSED")
                            .font(.system(size: 48, weight: .bold, design: .monospaced))
                            .foregroundColor(.cyan.opacity(0.5))
                            .blur(radius: 5)
                            .offset(x: 2, y: 2)
                    )
                
                VStack(spacing: 15) {
                    // Resume Button
                    Button(action: {
                        gameState.isPaused = false
                    }) {
                        HStack {
                            Image(systemName: "play.fill")
                            Text("Resume")
                        }
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 200, height: 50)
                        .background(
                            LinearGradient(
                                colors: [Color.green, Color.green.opacity(0.8)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                        .shadow(color: Color.green, radius: 10)
                    }
                    
                    // Main Menu Button
                    Button(action: {
                        gameState.currentScreen = .mainMenu
                    }) {
                        HStack {
                            Image(systemName: "house.fill")
                            Text("Main Menu")
                        }
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 200, height: 50)
                        .background(
                            LinearGradient(
                                colors: [Color.blue, Color.blue.opacity(0.8)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                        .shadow(color: Color.blue, radius: 10)
                    }
                }
            }
        }
    }
    
    // MARK: - Enhanced Power-up Display
    @ViewBuilder
    private func enhancedPowerUpDisplay(width: CGFloat) -> some View {
        VStack(spacing: 3) {
            HStack(spacing: 4) {
                Text("POWER-UPS")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.8))
                Spacer()
            }
            
            if gameState.activePowerUps.isEmpty {
                Text("None")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.white.opacity(0.4))
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(Array(gameState.activePowerUps.keys.prefix(6)), id: \.self) { key in
                            EnhancedPowerUpBadge(powerUpKey: key)
                        }
                    }
                }
            }
        }
        .frame(width: width)
        .padding(.horizontal, 4)
    }
    
    // MARK: - Setup Functions
    private func setupGame(size: CGSize) {
        let gameSize = CGSize(width: size.width, height: size.height)
        let newScene = GameScene(size: gameSize, gameState: gameState)
        newScene.scaleMode = .resizeFill
        newScene.anchorPoint = CGPoint(x: 0.5, y: 0.5)
        newScene.view?.isMultipleTouchEnabled = true
        newScene.view?.isUserInteractionEnabled = true
        scene = newScene
        
        gameState.resetGame()
    }
    
    private func updateGameSize(_ size: CGSize) {
        guard let scene = scene else { return }
        scene.size = CGSize(width: size.width, height: size.height)
        scene.scaleMode = .resizeFill
        scene.anchorPoint = CGPoint(x: 0.5, y: 0.5)
        scene.view?.isMultipleTouchEnabled = true
        scene.view?.isUserInteractionEnabled = true
    }
    
    private func weaponName(for type: WeaponType) -> String {
        switch type {
        case .laser: return "LASER"
        case .spread: return "SPREAD"
        case .plasma: return "PLASMA"
        case .missile: return "MISSILE"
        }
    }
}

// MARK: - Stat Card Component
struct StatCard: View {
    let icon: String
    let label: String
    let value: String
    let color: Color
    let size: StatSize
    var pulse: Bool = false
    var animate: Bool = false
    
    enum StatSize {
        case large, medium, small
        
        var iconSize: CGFloat {
            switch self {
            case .large: return 16
            case .medium: return 14
            case .small: return 12
            }
        }
        
        var labelSize: CGFloat {
            switch self {
            case .large: return 10
            case .medium: return 9
            case .small: return 8
            }
        }
        
        var valueSize: CGFloat {
            switch self {
            case .large: return 14
            case .medium: return 12
            case .small: return 11
            }
        }
    }
    
    @State private var pulseOpacity: Double = 1.0
    @State private var scale: CGFloat = 1.0
    
    var body: some View {
        VStack(spacing: 2) {
            HStack(spacing: 3) {
                Text(icon)
                    .font(.system(size: size.iconSize))
                Text(label)
                    .font(.system(size: size.labelSize, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.9))
                    .lineLimit(1)
            }
            
            Text(value)
                .font(.system(size: size.valueSize, weight: .bold, design: .monospaced))
                .foregroundColor(color)
                .opacity(pulse ? pulseOpacity : 1.0)
                .scaleEffect(scale)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity)
        .onAppear {
            if pulse {
                withAnimation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true)) {
                    pulseOpacity = 0.5
                }
            }
        }
        .onChange(of: animate) { newValue in
            if newValue {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    scale = 1.2
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                        scale = 1.0
                    }
                }
            }
        }
    }
}

// MARK: - Combo Meter
struct ComboMeter: View {
    let combo: Int
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color.gray.opacity(0.2))
                    .frame(height: 3)
                
                // Combo fill (visualizes combo intensity)
                let comboPercent = min(CGFloat(combo) / 50.0, 1.0)
                RoundedRectangle(cornerRadius: 2)
                    .fill(
                        LinearGradient(
                            colors: [.yellow, .orange, .red],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: geometry.size.width * comboPercent, height: 3)
                    .animation(.spring(response: 0.3), value: comboPercent)
            }
        }
        .frame(height: 3)
    }
}

// MARK: - Enhanced Power-up Badge
struct EnhancedPowerUpBadge: View {
    let powerUpKey: String
    
    var body: some View {
        let (icon, color) = getPowerUpIcon(key: powerUpKey)
        
        VStack(spacing: 2) {
            Text(icon)
                .font(.system(size: 14))
            
            Text(powerUpKey.prefix(4).uppercased())
                .font(.system(size: 7, weight: .bold, design: .monospaced))
                .foregroundColor(.white.opacity(0.8))
                .lineLimit(1)
        }
        .frame(width: 40, height: 35)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(color.opacity(0.25))
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(color, lineWidth: 1.5)
                )
        )
    }
    
    private func getPowerUpIcon(key: String) -> (String, Color) {
        switch key {
        case "rapidFire": return ("⚡", .yellow)
        case "spread", "multiShot": return ("🎯", .orange)
        case "shield": return ("🛡️", .cyan)
        case "missile": return ("🚀", .red)
        case "magnet": return ("🧲", .pink)
        case "freeze": return ("🧊", .blue)
        case "damageBoost": return ("💥", .red)
        case "slowMotion": return ("⏰", .purple)
        case "speedBoost": return ("💨", .cyan)
        default: return ("✨", .white)
        }
    }
}
