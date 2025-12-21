//
//  GameOverView.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced game over screen with performance breakdown
//

import SwiftUI

struct GameOverView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var personalBest: Int = 0
    @State private var isNewRecord = false
    @State private var coinsEarned: Int = 0
    @State private var achievementsUnlocked: [String] = []
    @State private var ranking: String = ""
    
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [.black, .red.opacity(0.3), .purple.opacity(0.2)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 25) {
                    // Header with animation
                    VStack(spacing: 10) {
                        Text("💀")
                            .font(.system(size: 60))
                            .scaleEffect(isNewRecord ? 1.2 : 1.0)
                            .animation(.spring(response: 0.5, dampingFraction: 0.6).repeatForever(autoreverses: true), value: isNewRecord)
                        
                        Text("Game Over")
                            .font(.system(size: 48, weight: .bold))
                            .foregroundColor(.white)
                        
                        if isNewRecord {
                            HStack {
                                Text("⭐")
                                Text("NEW RECORD!")
                                Text("⭐")
                            }
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.yellow)
                            .padding()
                            .background(
                                LinearGradient(
                                    colors: [.yellow.opacity(0.3), .orange.opacity(0.3)],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                        }
                        
                        if !ranking.isEmpty {
                            Text(ranking)
                                .font(.headline)
                                .foregroundColor(.cyan)
                        }
                    }
                    .padding(.top, 20)
                    
                    // Coins Earned Card
                    if coinsEarned > 0 {
                        HStack {
                            VStack(alignment: .leading, spacing: 5) {
                                Text("Coins Earned")
                                    .font(.caption)
                                    .foregroundColor(.white.opacity(0.7))
                                Text("+\(coinsEarned)")
                                    .font(.system(size: 32, weight: .bold))
                                    .foregroundColor(.yellow)
                            }
                            Spacer()
                            Text("💰")
                                .font(.system(size: 40))
                        }
                        .padding()
                        .background(
                            LinearGradient(
                                colors: [.yellow.opacity(0.3), .orange.opacity(0.2)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(16)
                        .padding(.horizontal, 20)
                    }
                    
                    // Performance Breakdown
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Performance Breakdown")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal)
                        
                        VStack(spacing: 12) {
                            GameOverStatRow(label: "Final Score", value: "\(gameState.score)", icon: "star.fill", color: .yellow)
                            GameOverStatRow(label: "Personal Best", value: "\(personalBest)", icon: "trophy.fill", color: .orange)
                            GameOverStatRow(label: "Wave Reached", value: "\(gameState.wave)", icon: "waveform", color: .cyan)
                            GameOverStatRow(label: "Enemies Killed", value: "\(gameState.enemiesKilled)", icon: "target", color: .red)
                            GameOverStatRow(label: "Best Combo", value: "\(gameState.combo)x", icon: "bolt.fill", color: .yellow)
                            GameOverStatRow(label: "Kill Streak", value: "\(gameState.killStreak)", icon: "flame.fill", color: .orange)
                            GameOverStatRow(label: "Accuracy", value: String(format: "%.1f%%", gameState.accuracy), icon: "scope", color: gameState.accuracy >= 75 ? .green : gameState.accuracy >= 50 ? .yellow : .red)
                            GameOverStatRow(label: "Shots Fired", value: "\(gameState.shotsFired)", icon: "arrow.up.circle.fill", color: .blue)
                            GameOverStatRow(label: "Shots Hit", value: "\(gameState.shotsHit)", icon: "checkmark.circle.fill", color: .green)
                        }
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(.ultraThinMaterial)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                )
                        )
                        .padding(.horizontal, 20)
                    }
                    
                    // Achievements Unlocked
                    if !achievementsUnlocked.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("🏆 Achievements Unlocked")
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding(.horizontal)
                            
                            ForEach(achievementsUnlocked, id: \.self) { achievement in
                                HStack {
                                    Text("⭐")
                                    Text(achievement)
                                        .foregroundColor(.white)
                                    Spacer()
                                }
                                .padding()
                                .background(Color.yellow.opacity(0.2))
                                .cornerRadius(10)
                            }
                            .padding(.horizontal, 20)
                        }
                    }
                    
                    // Action Buttons
                    VStack(spacing: 15) {
                        Button(action: {
                            gameState.resetGame()
                            gameState.currentScreen = .playing
                        }) {
                            HStack {
                                Image(systemName: "play.fill")
                                Text("Play Again")
                            }
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(
                                LinearGradient(
                                    colors: [.green, .blue],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                        }
                        .padding(.horizontal, 20)
                        
                        HStack(spacing: 15) {
                            Button(action: {
                                gameState.currentScreen = .scores
                            }) {
                                HStack {
                                    Image(systemName: "trophy.fill")
                                    Text("Leaderboard")
                                }
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue.opacity(0.6))
                                .cornerRadius(12)
                            }
                            
                            Button(action: {
                                shareScore()
                            }) {
                                HStack {
                                    Image(systemName: "square.and.arrow.up")
                                    Text("Share")
                                }
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.purple.opacity(0.6))
                                .cornerRadius(12)
                            }
                        }
                        .padding(.horizontal, 20)
                        
                        Button(action: {
                            gameState.resetGame()
                            gameState.currentScreen = .mainMenu
                        }) {
                            HStack {
                                Image(systemName: "house.fill")
                                Text("Main Menu")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.gray.opacity(0.6))
                            .cornerRadius(12)
                        }
                        .padding(.horizontal, 20)
                    }
                    .padding(.bottom, 30)
                }
            }
        }
        .onAppear {
            loadPersonalBest()
            calculateCoinsEarned()
            checkAchievements()
            calculateRanking()
            
            // Save high score
            gameState.saveHighScoreToCloud()
            
            // Update stats
            let sessionData = GameSessionData(
                score: gameState.score,
                wave: gameState.wave,
                level: gameState.level,
                kills: gameState.enemiesKilled,
                combo: gameState.combo,
                shotsFired: gameState.shotsFired,
                shotsHit: gameState.shotsHit,
                playTime: Int(Date().timeIntervalSince1970),
                powerUpsCollected: 0,
                bossesDefeated: 0
            )
            gameState.statsManager.updateStats(gameData: sessionData)
        }
    }
    
    private func loadPersonalBest() {
        Task {
            let scores = (try? await gameState.cloudKitService.fetchHighScores(limit: 100)) ?? []
            let best = scores.map { $0.score }.max() ?? 0
            
            await MainActor.run {
                personalBest = best
                isNewRecord = gameState.score > best
            }
        }
    }
    
    private func calculateCoinsEarned() {
        // Calculate coins based on score, wave, kills
        let baseCoins = gameState.score / 100
        let waveBonus = gameState.wave * 10
        let killBonus = gameState.enemiesKilled * 2
        let comboBonus = gameState.combo * 5
        
        coinsEarned = baseCoins + waveBonus + killBonus + comboBonus
        
        // Update game state
        gameState.coins += coinsEarned
        UserDefaults.standard.set(gameState.coins, forKey: "walletCoins")
    }
    
    private func checkAchievements() {
        var unlocked: [String] = []
        
        if gameState.score >= 10000 {
            unlocked.append("Score Master (10,000 points)")
        }
        if gameState.wave >= 10 {
            unlocked.append("Wave Warrior (Wave 10)")
        }
        if gameState.combo >= 50 {
            unlocked.append("Combo King (50x combo)")
        }
        if gameState.accuracy >= 90 {
            unlocked.append("Sharpshooter (90% accuracy)")
        }
        if gameState.enemiesKilled >= 100 {
            unlocked.append("Enemy Destroyer (100 kills)")
        }
        
        achievementsUnlocked = unlocked
    }
    
    private func calculateRanking() {
        Task {
            let scores = (try? await gameState.cloudKitService.fetchHighScores(limit: 100)) ?? []
            let sortedScores = scores.sorted { $0.score > $1.score }
            
            if let index = sortedScores.firstIndex(where: { $0.score == gameState.score }) {
                let rank = index + 1
                let total = sortedScores.count
                let percentile = Int((Double(total - rank) / Double(total)) * 100)
                
                await MainActor.run {
                    ranking = "Rank #\(rank) of \(total) • Top \(percentile)%"
                }
            }
        }
    }
    
    private func shareScore() {
        let text = "I scored \(gameState.score) points in Kaden & Adelynn Space Adventures! 🚀\nWave: \(gameState.wave) • Kills: \(gameState.enemiesKilled) • Combo: \(gameState.combo)x"
        
        let activityVC = UIActivityViewController(
            activityItems: [text],
            applicationActivities: nil
        )
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootViewController = windowScene.windows.first?.rootViewController {
            rootViewController.present(activityVC, animated: true)
        }
    }
}

struct GameOverStatRow: View {
    let label: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 24)
            
            Text(label)
                .foregroundColor(.white.opacity(0.8))
            
            Spacer()
            
            Text(value)
                .foregroundColor(.white)
                .fontWeight(.bold)
        }
    }
}
