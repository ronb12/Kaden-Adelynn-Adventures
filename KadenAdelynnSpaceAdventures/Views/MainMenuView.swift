//
//  MainMenuView.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced main menu with beautiful animations and styling
//

import SwiftUI

struct MainMenuView: View {
    @EnvironmentObject var gameState: GameStateManager
    @StateObject private var audioManager = AudioManager.shared
    @State private var showSettings = false
    @State private var coins: Int = 0
    @State private var animateStars = false
    @State private var titleScale: CGFloat = 1.0
    @State private var personalBest: Int = 0
    @State private var recentAchievements: [String] = []
    @State private var dailyChallengeProgress: Double = 0.0
    @State private var sharedEventProgress: SharedEventProgressData?

    var body: some View {
        ZStack {
            // Animated cosmic background
            AnimatedCosmicBackground()

            ScrollView {
                VStack(spacing: 16) {
                    // Enhanced Title Section
                    VStack(spacing: 12) {
                        // Main Title with character portraits and gradient
                        HStack(spacing: 12) {
                            Image("kaden_character")
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 54, height: 54)
                                .clipShape(Circle())
                                .scaleEffect(animateStars ? 1.1 : 1.0)
                                .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: animateStars)

                            Text("Kaden & Adelynn")
                                .font(AccessibilityHelper.scaledFont(size: 34, weight: .black, design: .rounded))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [.cyan, .blue, .purple, .pink],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .shadow(color: .cyan.opacity(0.5), radius: 10)
                                .lineLimit(2)
                                .minimumScaleFactor(0.72)
                                .multilineTextAlignment(.center)
                                .accessibilityLabel("Kaden and Adelynn Space Adventures")
                                .accessibilityAddTraits(.isHeader)

                            Image("adelynn_character")
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 54, height: 54)
                                .clipShape(Circle())
                                .scaleEffect(animateStars ? 1.1 : 1.0)
                                .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true).delay(0.5), value: animateStars)
                        }
                        .scaleEffect(titleScale)
                        .onAppear {
                            if !AccessibilityHelper.isReduceMotionEnabled {
                                withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                                    titleScale = 1.05
                                }
                            }
                            animateStars = true
                        }

                        // Subtitle with animated border
                        HStack(spacing: 10) {
                            Image(systemName: "sparkles")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(.cyan)
                                .scaleEffect(animateStars ? 1.2 : 1.0)
                                .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: animateStars)

                            Text("SPACE ADVENTURES")
                                .font(AccessibilityHelper.scaledFont(size: 18, weight: .bold, design: .rounded))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [.yellow, .orange, .yellow],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .accessibilityLabel("Space Adventures")

                            Image(systemName: "sparkles")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(.purple)
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

                        HStack(spacing: 8) {
                            Image(systemName: "bolt.fill")
                            Text("Epic Space Shooter")
                            Image(systemName: "bolt.fill")
                        }
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.8))
                        .padding(.top, 5)
                    }
                    .padding(.top, 82)

                    // Stats Cards Row
                    HStack(spacing: 12) {
                        // Stars Balance Card
                        VStack(alignment: .leading, spacing: 5) {
                            Text("STARS")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.7))
                            HStack(spacing: 4) {
                                Image(systemName: "star.fill")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.yellow)
                                Text("\(coins)")
                                    .font(.system(size: 24, weight: .bold))
                                    .foregroundColor(.yellow)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(LinearGradient(colors: [.yellow.opacity(0.3), .orange.opacity(0.2)], startPoint: .leading, endPoint: .trailing))
                        )

                        // Personal Best Card
                        VStack(alignment: .leading, spacing: 5) {
                            Text("BEST SCORE")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.7))
                            HStack(spacing: 4) {
                                Image(systemName: "star.fill")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.cyan)
                                Text("\(personalBest)")
                                    .font(.system(size: 24, weight: .bold))
                                    .foregroundColor(.cyan)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(LinearGradient(colors: [.cyan.opacity(0.3), .blue.opacity(0.2)], startPoint: .leading, endPoint: .trailing))
                        )
                    }
                    .padding(.horizontal, 20)

                    // Main Action Buttons
                    VStack(spacing: 10) {
                        // Quick Play Button
                        EnhancedMenuButton(
                            title: "Quick Play",
                            icon: "bolt.fill",
                            gradient: [.yellow, .orange],
                            size: .large
                        ) {
                            // Arcade is the fast global-score quick play mode.
                            gameState.selectedCharacter = "kaden"
                            gameState.selectedShip = "kaden"
                            gameState.configureMode(.arcade)
                            gameState.currentScreen = .playing
                        }

                        EnhancedMenuButton(
                            title: "Start Game",
                            icon: "play.fill",
                            gradient: [.green, .blue],
                            size: .large,
                            accessibilityHint: "Opens character selection to start a new game",
                            action: {
                                gameState.currentScreen = .characterSelect
                            }
                        )

                        EnhancedMenuButton(
                            title: "Open Store",
                            icon: "cart.fill",
                            gradient: [.purple, .pink],
                            accessibilityHint: "Opens the store to purchase upgrades and items",
                            action: {
                                gameState.currentScreen = .store
                            }
                        )

                        EnhancedMenuButton(
                            title: "Choose Ship",
                            icon: "airplane",
                            gradient: [.cyan, .blue],
                            accessibilityHint: "Opens ship selection to choose your spacecraft",
                            action: {
                                gameState.currentScreen = .shipSelect
                            }
                        )

                        EnhancedMenuButton(
                            title: "Choose Character",
                            icon: "person.fill",
                            gradient: [.orange, .red],
                            accessibilityHint: "Opens character selection to choose Kaden or Adelynn",
                            action: {
                                gameState.currentScreen = .characterSelect
                            }
                        )
                    }
                    .padding(.horizontal, 18)

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

                        EnhancedMenuButton(
                            title: "Save/Load",
                            icon: "square.and.arrow.down.on.square.fill",
                            gradient: [.indigo, .purple],
                            size: .small
                        ) {
                            gameState.currentScreen = .saveLoad
                        }

                        EnhancedMenuButton(
                            title: "Game Modes",
                            icon: "square.grid.2x2.fill",
                            gradient: [.teal, .blue],
                            size: .small
                        ) {
                            gameState.currentScreen = .modeSelect
                        }
                    }
                    .padding(.horizontal, 18)

                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Image(systemName: gameState.selectedGameMode.icon)
                                .foregroundColor(.cyan)
                            Text("Mode: \(gameState.selectedGameMode.title)")
                                .font(.headline)
                                .foregroundColor(.white)
                            Spacer()
                            Button("Change") {
                                gameState.currentScreen = .modeSelect
                            }
                            .font(.caption.weight(.bold))
                            .foregroundColor(.cyan)
                        }

                        Text(gameState.selectedGameMode.subtitle)
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.72))
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(.ultraThinMaterial)
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(Color.cyan.opacity(0.28), lineWidth: 1)
                            )
                    )
                    .padding(.horizontal, 18)

                    // Recent Achievements
                    if !recentAchievements.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Label("Recent Achievements", systemImage: "trophy.fill")
                                .font(.headline)
                                .foregroundColor(.white)

                            ForEach(recentAchievements.prefix(3), id: \.self) { achievement in
                                HStack {
                                    Image(systemName: "star.fill")
                                        .foregroundColor(.yellow)
                                    Text(achievement)
                                        .font(.subheadline)
                                        .foregroundColor(.white.opacity(0.9))
                                    Spacer()
                                }
                                .padding(.vertical, 4)
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(.ultraThinMaterial)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .stroke(Color.yellow.opacity(0.3), lineWidth: 1)
                                )
                        )
                        .padding(.horizontal, 20)
                    }

                    // Daily Challenge Card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Image(systemName: "calendar")
                                .font(.system(size: 22, weight: .semibold))
                                .foregroundColor(.cyan)
                            Text("Daily Challenge")
                                .font(.headline)
                                .foregroundColor(.white)
                            Spacer()
                            Text("\(Int(dailyChallengeProgress * 100))%")
                                .font(.caption)
                                .foregroundColor(.cyan)
                        }

                        // Progress Bar
                        GeometryReader { geometry in
                            ZStack(alignment: .leading) {
                                Rectangle()
                                    .fill(Color.white.opacity(0.2))
                                    .frame(height: 6)
                                    .cornerRadius(3)

                                Rectangle()
                                    .fill(LinearGradient(colors: [.cyan, .blue], startPoint: .leading, endPoint: .trailing))
                                    .frame(width: geometry.size.width * dailyChallengeProgress, height: 6)
                                    .cornerRadius(3)
                            }
                        }
                        .frame(height: 6)

                        Text(gameState.selectedGameMode == .dailyChallenge ? "Active: Fast Enemies" : "Select Daily Challenge to activate")
                            .font(.subheadline)
                            .foregroundColor(.cyan)
                            .fontWeight(.semibold)

                        Text("Daily and weekly challenge progress is saved for global competition.")
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
                    .padding(.horizontal, 18)

                    if let sharedEventProgress {
                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Label(sharedEventProgress.eventName, systemImage: "globe.americas.fill")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                Spacer()
                                Text("\(sharedEventProgress.playerContribution)/\(sharedEventProgress.communityGoal)")
                                    .font(.caption.weight(.bold))
                                    .foregroundColor(.yellow)
                            }

                            ProgressView(value: min(Double(sharedEventProgress.playerContribution) / Double(sharedEventProgress.communityGoal), 1.0))
                                .tint(.yellow)

                            Text("Shared event progress syncs globally when Firebase is available.")
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
                                        .stroke(Color.yellow.opacity(0.28), lineWidth: 1)
                                )
                        )
                        .padding(.horizontal, 18)
                    }

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
                    .padding(.horizontal, 18)

                    // Player Name Input
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Image(systemName: "gamecontroller.fill")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(.cyan)
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

                        Label("For Your Safety: Use a gamer tag only. Do not use your real name.", systemImage: "shield.fill")
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
                    .padding(.horizontal, 18)

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
                    .padding(.horizontal, 18)

                    // Footer
                    VStack(spacing: 10) {
                        HStack(spacing: 20) {
                            Button {
                                gameState.currentScreen = .termsOfService
                            } label: {
                                Label("Terms", systemImage: "doc.text")
                            }
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))

                            Button {
                                gameState.currentScreen = .privacyPolicy
                            } label: {
                                Label("Privacy", systemImage: "lock.fill")
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
            loadPersonalBest()
            loadRecentAchievements()
            loadDailyChallengeProgress()
            loadSharedEventProgress()
            // Start menu music
            audioManager.startMenuMusic()
        }
        .onDisappear {
            // Stop menu music when leaving main menu
            audioManager.stopBackgroundMusic()
        }
    }

    private func loadCoins() {
        coins = UserDefaults.standard.integer(forKey: "walletCoins")
        gameState.coins = coins
    }

    private func loadPersonalBest() {
        Task {
            let scores = (try? await gameState.cloudKitService.fetchHighScores(limit: 100)) ?? []
            let best = scores.map { $0.score }.max() ?? 0

            await MainActor.run {
                personalBest = best
            }
        }
    }

    private func loadRecentAchievements() {
        // Load recent achievements from UserDefaults
        if let data = UserDefaults.standard.data(forKey: "recentAchievements"),
           let achievements = try? JSONDecoder().decode([String].self, from: data) {
            recentAchievements = Array(achievements.prefix(5))
        }
    }

    private func loadDailyChallengeProgress() {
        // Calculate daily challenge progress (based on games played today)
        let today = Calendar.current.startOfDay(for: Date())
        let lastPlayDate = UserDefaults.standard.object(forKey: "lastPlayDate") as? Date ?? today
        let gamesToday = UserDefaults.standard.integer(forKey: "gamesToday")

        // Reset if new day
        if !Calendar.current.isDate(lastPlayDate, inSameDayAs: today) {
            UserDefaults.standard.set(0, forKey: "gamesToday")
            UserDefaults.standard.set(today, forKey: "lastPlayDate")
            dailyChallengeProgress = 0.0
        } else {
            // 5 games = 100% progress
            dailyChallengeProgress = min(Double(gamesToday) / 5.0, 1.0)
        }
    }

    private func loadSharedEventProgress() {
        if let data = UserDefaults.standard.data(forKey: "sharedEvent_bossRushWeekend"),
           let decoded = try? JSONDecoder().decode(SharedEventProgressData.self, from: data) {
            sharedEventProgress = decoded
        } else {
            sharedEventProgress = SharedEventProgressData(
                eventId: "bossRushWeekend",
                eventName: "Defeat 1,000 Boss Ships",
                playerContribution: 0,
                communityGoal: 1000,
                lastUpdated: Date()
            )
        }

        Task {
            guard let remoteProgress = try? await FirebaseService.shared.fetchSharedEventProgress(eventId: "bossRushWeekend") else { return }
            await MainActor.run {
                sharedEventProgress = remoteProgress
                if let encoded = try? JSONEncoder().encode(remoteProgress) {
                    UserDefaults.standard.set(encoded, forKey: "sharedEvent_bossRushWeekend")
                }
            }
        }
    }
}

struct GameModeSelectView: View {
    @EnvironmentObject var gameState: GameStateManager

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    private func modeColors(for mode: GameMode) -> [Color] {
        switch mode {
        case .story:
            return [.cyan, .blue]
        case .arcade:
            return [.yellow, .orange]
        case .bossRush:
            return [.red, .purple]
        case .dailyChallenge:
            return [.green, .mint]
        case .survival:
            return [.pink, .red]
        case .timeAttack:
            return [.indigo, .cyan]
        case .coOp:
            return [.teal, .green]
        case .training:
            return [.orange, .yellow]
        }
    }

    var body: some View {
        ZStack {
            AnimatedCosmicBackground()

            ScrollView {
                VStack(spacing: 18) {
                    HStack {
                        Button {
                            gameState.currentScreen = .mainMenu
                        } label: {
                            Image(systemName: "chevron.left.circle.fill")
                                .font(.system(size: 30, weight: .bold))
                                .foregroundColor(.white)
                        }

                        Spacer()

                        Text("Game Modes")
                            .font(.system(size: 32, weight: .black, design: .rounded))
                            .foregroundStyle(LinearGradient(colors: [.cyan, .blue, .pink], startPoint: .leading, endPoint: .trailing))
                            .lineLimit(1)
                            .minimumScaleFactor(0.75)

                        Spacer()

                        Image(systemName: "chevron.left.circle.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.clear)
                    }
                    .padding(.top, 78)
                    .padding(.horizontal, 20)

                    VStack(alignment: .leading, spacing: 8) {
                        Label("Global-ready modes", systemImage: "network")
                            .font(.headline)
                            .foregroundColor(.white)
                        Text("Leaderboards, cloud progress, daily challenges, shared events, and ghost runs now track by mode.")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.72))
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(.ultraThinMaterial)
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(Color.cyan.opacity(0.25), lineWidth: 1)
                            )
                    )
                    .padding(.horizontal, 18)

                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(GameMode.allCases) { mode in
                            let colors = modeColors(for: mode)
                            let isSelected = mode == gameState.selectedGameMode

                            Button {
                                gameState.configureMode(mode)
                                if mode == .story {
                                    gameState.currentScreen = .story
                                } else {
                                    gameState.currentScreen = .playing
                                }
                            } label: {
                                VStack(alignment: .leading, spacing: 12) {
                                    HStack {
                                        ZStack {
                                            Circle()
                                                .fill(
                                                    LinearGradient(
                                                        colors: colors,
                                                        startPoint: .topLeading,
                                                        endPoint: .bottomTrailing
                                                    )
                                                )
                                                .shadow(color: colors.first?.opacity(isSelected ? 0.55 : 0.25) ?? .clear, radius: isSelected ? 8 : 4)

                                            Circle()
                                                .stroke(Color.white.opacity(0.38), lineWidth: 1)

                                            Image(systemName: mode.icon)
                                                .font(.system(size: 21, weight: .black))
                                                .foregroundColor(.white)
                                        }
                                        .frame(width: 42, height: 42)

                                        Spacer()

                                        HStack(spacing: 4) {
                                            Circle()
                                                .fill(colors.first ?? .cyan)
                                                .frame(width: 7, height: 7)
                                            Circle()
                                                .fill(colors.last ?? .blue)
                                                .frame(width: 7, height: 7)
                                        }

                                        if isSelected {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundColor(.green)
                                        }
                                    }

                                    Text(mode.title)
                                        .font(.headline)
                                        .foregroundColor(.white)
                                        .lineLimit(1)
                                        .minimumScaleFactor(0.78)

                                    Text(mode.subtitle)
                                        .font(.caption)
                                        .foregroundColor(.white.opacity(0.7))
                                        .lineLimit(3)
                                        .multilineTextAlignment(.leading)
                                        .frame(minHeight: 48, alignment: .topLeading)
                                }
                                .padding(14)
                                .frame(maxWidth: .infinity, minHeight: 150, alignment: .topLeading)
                                .background(
                                    RoundedRectangle(cornerRadius: 14)
                                        .fill(
                                            LinearGradient(
                                                colors: isSelected
                                                    ? [colors.first?.opacity(0.44) ?? Color.cyan.opacity(0.44), colors.last?.opacity(0.30) ?? Color.blue.opacity(0.30)]
                                                    : [colors.first?.opacity(0.18) ?? Color.white.opacity(0.12), Color.white.opacity(0.06)],
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            )
                                        )
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 14)
                                                .stroke(isSelected ? (colors.first ?? .cyan) : Color.white.opacity(0.18), lineWidth: 1.5)
                                        )
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 18)
                    .padding(.bottom, 30)
                }
            }
        }
    }
}

// Animated Cosmic Background
struct AnimatedCosmicBackground: View {
    @State private var animate = false

    var body: some View {
        ZStack {
            // Base gradient - Blue theme
            LinearGradient(
                colors: [
                    Color(red: 0.1, green: 0.2, blue: 0.5),
                    Color(red: 0.15, green: 0.25, blue: 0.6),
                    Color(red: 0.2, green: 0.3, blue: 0.7)
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
    var accessibilityHint: String? = nil
    let action: () -> Void

    enum ButtonSize {
        case small, normal, large

        var fontSize: CGFloat {
            switch self {
            case .small: return 14
            case .normal: return 18
            case .large: return 20
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
            case .small: return 10
            case .normal: return 14
            case .large: return 16
            }
        }
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: size.iconSize, weight: .semibold))
                    .foregroundColor(.white)
                    .accessibilityHidden(true) // Icon is decorative, text provides meaning

                Text(title)
                    .font(AccessibilityHelper.scaledFont(size: size.fontSize, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.78)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: size.iconSize * 0.7, weight: .bold))
                    .foregroundColor(.white.opacity(0.6))
                    .accessibilityHidden(true) // Decorative chevron
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
        .accessibilityLabel(title)
        .accessibilityHint(accessibilityHint ?? "Double tap to activate")
        .accessibilityAddTraits(.isButton)
    }
}

// Scale button style with reduced motion support
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed && !AccessibilityHelper.isReduceMotionEnabled ? 0.95 : 1.0)
            .animation(AccessibilityHelper.animation(.easeInOut(duration: 0.1), value: configuration.isPressed), value: configuration.isPressed)
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
