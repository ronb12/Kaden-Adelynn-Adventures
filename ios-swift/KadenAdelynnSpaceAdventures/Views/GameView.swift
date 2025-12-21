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
    @State private var toast: ToastMessage? = nil
    
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
                    
                    // Boss Health Bar (only show when boss exists)
                    if bossHealth > 0 {
                        bossHealthBar(geometry: geometry)
                    }
                    
                    Spacer()
                    
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
        .toast($toast)
    }
    
    // MARK: - ENHANCED Scoreboard with Modern Design
    @ViewBuilder
    private func redesignedScoreboard(geometry: GeometryProxy) -> some View {
        let screenWidth = geometry.size.width
        let isLandscape = geometry.size.width > geometry.size.height
        let healthPercent = CGFloat(gameState.health) / 100.0
        let healthColor = gameState.health <= 25 ? Color.red : gameState.health <= 50 ? Color.orange : Color.green
        // Adjust padding for landscape vs portrait
        let topPadding = isLandscape ? geometry.safeAreaInsets.top + 10 : geometry.safeAreaInsets.top + 50
        
        VStack(spacing: 0) {
            // Enhanced gradient background with animated glow
            ZStack {
                // Base gradient background
                LinearGradient(
                    colors: [
                        Color(red: 0.05, green: 0.05, blue: 0.2).opacity(0.95),
                        Color(red: 0.1, green: 0.1, blue: 0.3).opacity(0.95)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                
                // Animated glow effect
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.cyan.opacity(0.3),
                                Color.blue.opacity(0.2),
                                Color.purple.opacity(0.15),
                                Color.clear
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .blur(radius: 20)
                    .opacity(0.7 + 0.3 * sin(Date().timeIntervalSince1970))
            }
            .overlay(
                VStack(spacing: 8) {
                    // Top row: Score, Wave, Stars
                    HStack(spacing: 12) {
                        // Score - Enhanced with glow
                        VStack(alignment: .leading, spacing: 4) {
                            Text("SCORE")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.yellow.opacity(0.8))
                            Text(String(format: "%06d", gameState.score))
                                .font(.system(size: 26, weight: .bold, design: .monospaced))
                                .foregroundColor(.white)
                                .shadow(color: .yellow, radius: 6, x: 0, y: 2)
                                .overlay(
                                    Text(String(format: "%06d", gameState.score))
                                        .font(.system(size: 26, weight: .bold, design: .monospaced))
                                        .foregroundColor(.yellow.opacity(0.3))
                                        .blur(radius: 3)
                                        .offset(x: 2, y: 2)
                                )
                        }
                        .padding(.leading, 16)
                        
                        Spacer()
                        
                        // Wave indicator
                        HStack(spacing: 4) {
                            Text("🌊")
                                .font(.system(size: 16))
                            Text("WAVE \(gameState.wave)")
                                .font(.system(size: 14, weight: .bold, design: .monospaced))
                                .foregroundColor(.cyan)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.cyan.opacity(0.2))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color.cyan.opacity(0.5), lineWidth: 1.5)
                                )
                        )
                        
                        // Stars
                        HStack(spacing: 4) {
                            Text("⭐")
                                .font(.system(size: 16))
                            Text("\(gameState.coins)")
                                .font(.system(size: 16, weight: .bold, design: .monospaced))
                                .foregroundColor(.yellow)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.yellow.opacity(0.2))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color.yellow.opacity(0.5), lineWidth: 1.5)
                                )
                        )
                        .padding(.trailing, 16)
                    }
                    .padding(.top, 8)
                    
                    // Bottom row: Lives, Health Bar, Kills
                    HStack(spacing: 12) {
                        // Lives - Enhanced
                        HStack(spacing: 6) {
                            Text("❤️")
                                .font(.system(size: 20))
                            Text("\(gameState.lives)")
                                .font(.system(size: 22, weight: .bold, design: .monospaced))
                                .foregroundColor(.white)
                                .shadow(color: .red, radius: 4)
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(
                                    LinearGradient(
                                        colors: [
                                            Color.red.opacity(0.5),
                                            Color.red.opacity(0.3)
                                        ],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(
                                            LinearGradient(
                                                colors: [Color.red.opacity(0.8), Color.pink.opacity(0.6)],
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            ),
                                            lineWidth: 2
                                        )
                                )
                                .shadow(color: .red.opacity(0.6), radius: 5, x: 0, y: 2)
                        )
                        .padding(.leading, 16)
                        
                        Spacer()
                        
                        // Health - Enhanced with better bar
                        VStack(spacing: 4) {
                            HStack(spacing: 4) {
                                Text("💚")
                                    .font(.system(size: 16))
                                Text("\(gameState.health)")
                                    .font(.system(size: 18, weight: .bold, design: .monospaced))
                                    .foregroundColor(healthColor)
                                    .shadow(color: healthColor.opacity(0.5), radius: 2)
                            }
                            
                            // Enhanced health bar
                            GeometryReader { barGeo in
                                ZStack(alignment: .leading) {
                                    // Background with subtle pattern
                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(Color.black.opacity(0.7))
                                        .frame(height: 10)
                                    
                                    // Health fill with gradient and animation
                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(
                                            LinearGradient(
                                                colors: healthPercent > 0.5 ?
                                                    [healthColor, healthColor.opacity(0.7)] :
                                                    healthPercent > 0.25 ?
                                                    [Color.orange, Color.yellow] :
                                                    [Color.red, Color.red.opacity(0.7)],
                                                startPoint: .leading,
                                                endPoint: .trailing
                                            )
                                        )
                                        .frame(width: barGeo.size.width * healthPercent, height: 10)
                                        .animation(.spring(response: 0.3, dampingFraction: 0.8), value: healthPercent)
                                    
                                    // Pulsing glow on low health
                                    if gameState.health <= 25 {
                                        RoundedRectangle(cornerRadius: 6)
                                            .fill(Color.red.opacity(0.8))
                                            .frame(width: barGeo.size.width * healthPercent, height: 10)
                                            .blur(radius: 4)
                                            .opacity(0.7 + 0.3 * sin(Date().timeIntervalSince1970 * 5))
                                    }
                                    
                                    // Border
                                    RoundedRectangle(cornerRadius: 6)
                                        .stroke(Color.white.opacity(0.3), lineWidth: 1)
                                        .frame(height: 10)
                                }
                            }
                            .frame(height: 10)
                            .frame(width: 100)
                        }
                        
                        Spacer()
                        
                        // Combo Multiplier - Show when active
                        Group {
                            if gameState.combo > 0 {
                                VStack(spacing: 2) {
                                    Text("COMBO")
                                        .font(.system(size: 9, weight: .bold))
                                        .foregroundColor(.yellow.opacity(0.8))
                                    Text("x\(String(format: "%.1f", gameState.scoreMultiplier))")
                                        .font(.system(size: 18, weight: .bold, design: .monospaced))
                                        .foregroundColor(.yellow)
                                        .shadow(color: .yellow.opacity(0.8), radius: 3)
                                }
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(
                                    RoundedRectangle(cornerRadius: 8)
                                        .fill(
                                            LinearGradient(
                                                colors: [
                                                    Color.yellow.opacity(0.3),
                                                    Color.orange.opacity(0.2)
                                                ],
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            )
                                        )
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 8)
                                                .stroke(
                                                    LinearGradient(
                                                        colors: [Color.yellow.opacity(0.8), Color.orange.opacity(0.6)],
                                                        startPoint: .topLeading,
                                                        endPoint: .bottomTrailing
                                                    ),
                                                    lineWidth: 2
                                                )
                                        )
                                        .shadow(color: .yellow.opacity(0.6), radius: 5)
                                )
                            } else {
                                // Kills count (when no combo)
                                HStack(spacing: 4) {
                                    Text("🎯")
                                        .font(.system(size: 16))
                                    Text("\(gameState.enemiesKilled)")
                                        .font(.system(size: 16, weight: .bold, design: .monospaced))
                                        .foregroundColor(.cyan)
                                }
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(
                                    RoundedRectangle(cornerRadius: 8)
                                        .fill(Color.cyan.opacity(0.2))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 8)
                                                .stroke(Color.cyan.opacity(0.5), lineWidth: 1.5)
                                        )
                                )
                            }
                        }
                        .padding(.trailing, 16)
                    }
                    .padding(.bottom, 8)
                }
            )
            .frame(height: 95)  // Taller for better visibility
            
            // Enhanced animated bottom border
            ZStack {
                // Base gradient border
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [Color.cyan, Color.blue, Color.purple, Color.pink, Color.cyan],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(height: 3)
                
                // Animated shimmer effect
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [Color.clear, Color.white.opacity(0.6), Color.clear],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(height: 3)
                    .offset(x: sin(Date().timeIntervalSince1970 * 2) * 200)
                    .blur(radius: 1)
            }
            .shadow(color: Color.cyan.opacity(0.8), radius: 10, x: 0, y: 0)
            .shadow(color: Color.blue.opacity(0.6), radius: 5, x: 0, y: 0)
        }
        .frame(width: screenWidth)
        .padding(.top, topPadding) // Dynamic padding based on orientation
    }
    
    // MARK: - Boss Health Bar
    @ViewBuilder
    private func bossHealthBar(geometry: GeometryProxy) -> some View {
        if bossHealth > 0 {
            let healthPercent = CGFloat(bossHealth) / CGFloat(max(bossMaxHealth, 1))
            let healthColor = healthPercent > 0.5 ? Color.red : healthPercent > 0.25 ? Color.orange : Color.yellow
            let isLandscape = geometry.size.width > geometry.size.height
            let barWidth = isLandscape ? geometry.size.width * 0.5 : geometry.size.width * 0.7
            
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
                        .frame(width: barWidth * healthPercent, height: 16)
                        .padding(2)
                        .animation(.spring(response: 0.3), value: healthPercent)
                    
                    // Health text
                    Text("\(bossHealth)/\(bossMaxHealth)")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundColor(.white)
                        .shadow(color: .black, radius: 2)
                }
                .frame(width: barWidth, height: 20)
            }
            .frame(maxWidth: .infinity)
            .padding(.top, 8)
            .padding(.bottom, 8)
            .background(
                Color.black.opacity(0.3)
                    .blur(radius: 5)
            )
        }
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
                    
                    // Save Game Button
                    Button(action: {
                        HapticManager.shared.buttonPress()
                        if gameState.saveGame(toSlot: 1) {
                            toast = ToastMessage("✅ Game saved!", type: .success)
                            HapticManager.shared.saveSuccess()
                            #if DEBUG
                            print("💾 Game saved successfully to slot 1")
                            #endif
                        } else {
                            toast = ToastMessage("❌ Save failed!", type: .error)
                            HapticManager.shared.saveError()
                            #if DEBUG
                            print("❌ Failed to save game")
                            #endif
                        }
                    }) {
                        HStack {
                            Image(systemName: "square.and.arrow.down.fill")
                            Text("Save Game")
                        }
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 200, height: 50)
                        .background(
                            LinearGradient(
                                colors: [Color.purple, Color.purple.opacity(0.8)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                        .shadow(color: Color.purple, radius: 10)
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
        case .fireball: return "FIREBALL"
        case .lightning: return "LIGHTNING"
        case .ice: return "ICE"
        case .poison: return "POISON"
        case .shockwave: return "SHOCKWAVE"
        case .beam: return "BEAM"
        case .rocket: return "ROCKET"
        case .grenade: return "GRENADE"
        case .flamethrower: return "FLAMETHROWER"
        case .electric: return "ELECTRIC"
        case .freeze: return "FREEZE"
        case .acid: return "ACID"
        case .vortex: return "VORTEX"
        case .pulse: return "PULSE"
        case .scatter: return "SCATTER"
        case .homing: return "HOMING"
        case .explosive: return "EXPLOSIVE"
        case .piercing: return "PIERCING"
        case .chain: return "CHAIN"
        case .meteor: return "METEOR"
        case .laserBeam: return "LASER BEAM"
        case .multiShot2: return "DUAL SHOT"
        case .multiShot3: return "TRIPLE SHOT"
        case .multiShot4: return "QUAD SHOT"
        case .multiShot5: return "PENTA SHOT"
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
