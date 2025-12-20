//
//  MainMenuView.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced main menu with beautiful animations and styling
//

import SwiftUI

struct MainMenuView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var showSettings = false
    @State private var coins: Int = 0
    @State private var animateStars = false
    @State private var titleScale: CGFloat = 1.0
    
    var body: some View {
        ZStack {
            // Animated cosmic background
            AnimatedCosmicBackground()
            
            ScrollView {
                VStack(spacing: 25) {
                    // Enhanced Title Section
                    VStack(spacing: 15) {
                        // Main Title with gradient
                        HStack(spacing: 12) {
                            Text("🌟")
                                .font(.system(size: 50))
                                .rotationEffect(.degrees(animateStars ? 360 : 0))
                                .animation(.linear(duration: 20).repeatForever(autoreverses: false), value: animateStars)
                            
                            Text("Kaden & Adelynn")
                                .font(.system(size: 44, weight: .black, design: .rounded))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [.cyan, .blue, .purple, .pink],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .shadow(color: .cyan.opacity(0.5), radius: 10)
                            
                            Text("🌟")
                                .font(.system(size: 50))
                                .rotationEffect(.degrees(animateStars ? -360 : 0))
                                .animation(.linear(duration: 20).repeatForever(autoreverses: false), value: animateStars)
                        }
                        .scaleEffect(titleScale)
                        .onAppear {
                            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                                titleScale = 1.05
                            }
                            animateStars = true
                        }
                        
                        // Subtitle with animated border
                        HStack(spacing: 10) {
                            Text("🌌")
                                .font(.system(size: 24))
                                .scaleEffect(animateStars ? 1.2 : 1.0)
                                .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: animateStars)
                            
                            Text("SPACE ADVENTURES")
                                .font(.system(size: 20, weight: .bold, design: .rounded))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [.yellow, .orange, .yellow],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                            
                            Text("🌌")
                                .font(.system(size: 24))
                                .scaleEffect(animateStars ? 1.2 : 1.0)
                                .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true).delay(0.5), value: animateStars)
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(
                            ZStack {
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(
                                        LinearGradient(
                                            colors: [.blue.opacity(0.2), .purple.opacity(0.2)],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                                
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(
                                        LinearGradient(
                                            colors: [.cyan.opacity(0.6), .purple.opacity(0.6)],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        ),
                                        lineWidth: 2
                                    )
                            }
                        )
                        .shadow(color: .cyan.opacity(0.3), radius: 15)
                        
                        Text("⚡ Epic Space Shooter ⚡")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.8))
                            .padding(.top, 5)
                    }
                    .padding(.top, 50)
                    
                    // Enhanced Coin Display
                    HStack {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("YOUR BALANCE")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.7))
                            
                            HStack(spacing: 8) {
                                Text("💰")
                                    .font(.system(size: 32))
                                Text("\(coins)")
                                    .font(.system(size: 36, weight: .bold, design: .rounded))
                                    .foregroundColor(.yellow)
                            }
                        }
                        
                        Spacer()
                        
                        Image(systemName: "bitcoinsign.circle.fill")
                            .font(.system(size: 40))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [.yellow, .orange],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(
                        ZStack {
                            RoundedRectangle(cornerRadius: 16)
                                .fill(
                                    LinearGradient(
                                        colors: [.yellow.opacity(0.3), .orange.opacity(0.2)],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                            
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(
                                    LinearGradient(
                                        colors: [.yellow.opacity(0.6), .orange.opacity(0.6)],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    ),
                                    lineWidth: 2
                                )
                        }
                    )
                    .shadow(color: .yellow.opacity(0.3), radius: 10)
                    .padding(.horizontal, 20)
                    
                    // Main Action Buttons
                    VStack(spacing: 12) {
                        EnhancedMenuButton(
                            title: "Start Game",
                            icon: "play.fill",
                            gradient: [.green, .blue],
                            size: .large
                        ) {
                            gameState.currentScreen = .characterSelect
                        }
                        
                        EnhancedMenuButton(
                            title: "Open Store",
                            icon: "cart.fill",
                            gradient: [.purple, .pink]
                        ) {
                            gameState.currentScreen = .store
                        }
                        
                        EnhancedMenuButton(
                            title: "Choose Ship",
                            icon: "airplane",
                            gradient: [.cyan, .blue]
                        ) {
                            gameState.currentScreen = .shipSelect
                        }
                        
                        EnhancedMenuButton(
                            title: "Choose Character",
                            icon: "person.fill",
                            gradient: [.orange, .red]
                        ) {
                            gameState.currentScreen = .characterSelect
                        }
                    }
                    .padding(.horizontal, 20)
                    
                    // Secondary Features Grid
                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 10),
                        GridItem(.flexible(), spacing: 10)
                    ], spacing: 10) {
                        EnhancedMenuButton(
                            title: "Top Scores",
                            icon: "star.fill",
                            gradient: [.yellow, .orange],
                            size: .small
                        ) {
                            gameState.currentScreen = .scores
                        }
                        
                        EnhancedMenuButton(
                            title: "Statistics",
                            icon: "chart.bar.fill",
                            gradient: [.blue, .cyan],
                            size: .small
                        ) {
                            gameState.currentScreen = .statistics
                        }
                        
                        EnhancedMenuButton(
                            title: "Upgrades",
                            icon: "arrow.up.circle.fill",
                            gradient: [.green, .mint],
                            size: .small
                        ) {
                            gameState.currentScreen = .weaponUpgrades
                        }
                        
                        EnhancedMenuButton(
                            title: "Customize",
                            icon: "paintbrush.fill",
                            gradient: [.pink, .purple],
                            size: .small
                        ) {
                            gameState.currentScreen = .customization
                        }
                    }
                    .padding(.horizontal, 20)
                    
                    // Daily Challenge Card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("🗓️")
                                .font(.system(size: 24))
                            Text("Daily Challenge")
                                .font(.headline)
                                .foregroundColor(.white)
                        }
                        
                        Text("Active: Fast Enemies")
                            .font(.subheadline)
                            .foregroundColor(.cyan)
                            .fontWeight(.semibold)
                        
                        Text("⚡ Enemies spawn 20% faster and move 20% faster")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(.ultraThinMaterial)
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(
                                        LinearGradient(
                                            colors: [.cyan.opacity(0.5), .blue.opacity(0.5)],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        ),
                                        lineWidth: 1
                                    )
                            )
                    )
                    .padding(.horizontal, 20)
                    
                    // Difficulty Selector
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Difficulty Level")
                            .font(.headline)
                            .foregroundColor(.white)
                        
                        HStack(spacing: 12) {
                            EnhancedDifficultyButton(
                                title: "Easy",
                                emoji: "🟢",
                                isSelected: gameState.difficulty == "easy",
                                color: .green
                            ) {
                                gameState.difficulty = "easy"
                            }
                            
                            EnhancedDifficultyButton(
                                title: "Medium",
                                emoji: "🟡",
                                isSelected: gameState.difficulty == "medium",
                                color: .yellow
                            ) {
                                gameState.difficulty = "medium"
                            }
                            
                            EnhancedDifficultyButton(
                                title: "Hard",
                                emoji: "🔴",
                                isSelected: gameState.difficulty == "hard",
                                color: .red
                            ) {
                                gameState.difficulty = "hard"
                            }
                        }
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(.ultraThinMaterial)
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
                            )
                    )
                    .padding(.horizontal, 20)
                    
                    // Player Name Input
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("🎮")
                                .font(.system(size: 20))
                            Text("Create Your Gamer Tag")
                                .font(.headline)
                                .foregroundColor(.white)
                        }
                        
                        HStack {
                            TextField("Enter gamer tag...", text: $gameState.playerName)
                                .textFieldStyle(.plain)
                                .padding()
                                .background(Color.white.opacity(0.1))
                                .cornerRadius(10)
                                .foregroundColor(.white)
                                .onChange(of: gameState.playerName) { _ in
                                    gameState.savePlayerName()
                                }
                            
                            Button(action: {
                                gameState.savePlayerName()
                            }) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(.green)
                            }
                        }
                        
                        Text("🛡️ For Your Safety: Use a gamer tag only. Do not use your real name.")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.6))
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(.ultraThinMaterial)
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
                            )
                    )
                    .padding(.horizontal, 20)
                    
                    // Settings Button
                    Button(action: {
                        gameState.currentScreen = .settings
                    }) {
                        HStack {
                            Image(systemName: "gearshape.fill")
                            Text("Settings")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(.ultraThinMaterial)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.white.opacity(0.3), lineWidth: 1)
                                )
                        )
                    }
                    .padding(.horizontal, 20)
                    
                    // Footer
                    VStack(spacing: 10) {
                        HStack(spacing: 20) {
                            Button("📜 Terms") {
                                gameState.currentScreen = .termsOfService
                            }
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                            
                            Button("🔒 Privacy") {
                                gameState.currentScreen = .privacyPolicy
                            }
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                        }
                        
                        Text("Version 1.0")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.5))
                    }
                    .padding(.bottom, 30)
                }
            }
        }
        .onAppear {
            loadCoins()
        }
    }
    
    private func loadCoins() {
        coins = UserDefaults.standard.integer(forKey: "walletCoins")
        gameState.coins = coins
    }
}

// Animated Cosmic Background
struct AnimatedCosmicBackground: View {
    @State private var animate = false
    
    var body: some View {
        ZStack {
            // Base gradient
            LinearGradient(
                colors: [
                    Color(red: 0.04, green: 0.06, blue: 0.15),
                    Color(red: 0.10, green: 0.10, blue: 0.24),
                    Color(red: 0.18, green: 0.11, blue: 0.31)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Animated radial gradients
            RadialGradient(
                colors: [Color(red: 0.47, green: 0.47, blue: 0.78).opacity(0.3), .clear],
                center: UnitPoint(x: 0.2, y: 0.5),
                startRadius: 0,
                endRadius: 400
            )
            .ignoresSafeArea()
            .opacity(animate ? 1.0 : 0.5)
            .animation(.easeInOut(duration: 20).repeatForever(autoreverses: true), value: animate)
            
            RadialGradient(
                colors: [Color(red: 1.0, green: 0.42, blue: 0.42).opacity(0.2), .clear],
                center: UnitPoint(x: 0.8, y: 0.8),
                startRadius: 0,
                endRadius: 400
            )
            .ignoresSafeArea()
            .opacity(animate ? 0.5 : 1.0)
            .animation(.easeInOut(duration: 15).repeatForever(autoreverses: true), value: animate)
            
            RadialGradient(
                colors: [Color(red: 0.31, green: 0.80, blue: 0.77).opacity(0.2), .clear],
                center: UnitPoint(x: 0.4, y: 0.2),
                startRadius: 0,
                endRadius: 300
            )
            .ignoresSafeArea()
            .opacity(animate ? 0.8 : 0.4)
            .animation(.easeInOut(duration: 18).repeatForever(autoreverses: true), value: animate)
        }
        .onAppear {
            animate = true
        }
    }
}

// Enhanced Menu Button
struct EnhancedMenuButton: View {
    let title: String
    let icon: String
    let gradient: [Color]
    var size: ButtonSize = .normal
    let action: () -> Void
    
    enum ButtonSize {
        case small, normal, large
        
        var fontSize: CGFloat {
            switch self {
            case .small: return 14
            case .normal: return 18
            case .large: return 22
            }
        }
        
        var iconSize: CGFloat {
            switch self {
            case .small: return 16
            case .normal: return 20
            case .large: return 24
            }
        }
        
        var padding: CGFloat {
            switch self {
            case .small: return 12
            case .normal: return 16
            case .large: return 20
            }
        }
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: size.iconSize, weight: .semibold))
                    .foregroundColor(.white)
                
                Text(title)
                    .font(.system(size: size.fontSize, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: size.iconSize * 0.7, weight: .bold))
                    .foregroundColor(.white.opacity(0.6))
            }
            .padding(size.padding)
            .frame(maxWidth: .infinity)
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: gradient,
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                    
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.white.opacity(0.3), lineWidth: 1)
                }
            )
            .shadow(color: gradient.first?.opacity(0.5) ?? .black.opacity(0.3), radius: 10, x: 0, y: 5)
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

// Scale button style
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// Enhanced Difficulty Button
struct EnhancedDifficultyButton: View {
    let title: String
    let emoji: String
    let isSelected: Bool
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Text(emoji)
                    .font(.system(size: 24))
                
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(
                            isSelected ?
                            LinearGradient(
                                colors: [color.opacity(0.6), color.opacity(0.4)],
                                startPoint: .top,
                                endPoint: .bottom
                            ) :
                            LinearGradient(
                                colors: [Color.white.opacity(0.1), Color.white.opacity(0.05)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                    
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(
                            isSelected ? color.opacity(0.8) : Color.white.opacity(0.2),
                            lineWidth: isSelected ? 2 : 1
                        )
                }
            )
            .shadow(color: isSelected ? color.opacity(0.4) : .clear, radius: 8)
        }
        .buttonStyle(ScaleButtonStyle())
    }
}
