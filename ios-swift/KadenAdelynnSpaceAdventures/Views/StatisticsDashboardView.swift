//
//  StatisticsDashboardView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct StatisticsDashboardView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var activeTab = "overview"
    @State private var stats: GameStatsData?
    
    var body: some View {
        ZStack {
            Color.blue.opacity(0.8).ignoresSafeArea()
            
            VStack {
                // Header
                HStack {
                    Text("📊 Statistics Dashboard")
                        .font(.largeTitle)
                        .foregroundColor(.black)
                        .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
                    
                    Spacer()
                    
                    Button("✕") {
                        gameState.currentScreen = .mainMenu
                    }
                    .font(.title)
                    .foregroundColor(.black)
                    .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
                }
                .padding(.top, 60) // Safe area padding
                .padding(.horizontal)
                .padding(.bottom, 10)
                
                // Tabs
                HStack(spacing: 0) {
                    TabButton(title: "Overview", isActive: activeTab == "overview") {
                        activeTab = "overview"
                    }
                    TabButton(title: "Weapons", isActive: activeTab == "weapons") {
                        activeTab = "weapons"
                    }
                    TabButton(title: "Performance", isActive: activeTab == "performance") {
                        activeTab = "performance"
                    }
                    TabButton(title: "Progress", isActive: activeTab == "progress") {
                        activeTab = "progress"
                    }
                }
                .padding(.horizontal)
                
                // Content
                ScrollView {
                    if let stats = stats {
                        switch activeTab {
                        case "overview":
                            OverviewTab(stats: stats)
                        case "weapons":
                            WeaponsTab()
                        case "performance":
                            PerformanceTab(stats: stats)
                        case "progress":
                            ProgressTab(stats: stats)
                        default:
                            OverviewTab(stats: stats)
                        }
                    } else {
                        VStack(spacing: 20) {
                            Image(systemName: "chart.bar.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.gray.opacity(0.5))
                            Text("No Statistics Yet")
                                .font(.title2)
                                .foregroundColor(.black.opacity(0.8))
                            Text("Play the game to start tracking your performance!")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 60)
                    }
                }
            }
        }
        .onAppear {
            loadStats()
        }
    }
    
    private func loadStats() {
        stats = gameState.statsManager.getStats()
    }
}

struct TabButton: View {
    let title: String
    let isActive: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .foregroundColor(isActive ? .black : .gray)
                .padding()
                .frame(maxWidth: .infinity)
                .background(isActive ? Color.blue.opacity(0.6) : Color.clear)
        }
    }
}

struct OverviewTab: View {
    let stats: GameStatsData
    
    var body: some View {
        VStack(spacing: 15) {
            StatisticsStatCard(label: "Total Games", value: "\(stats.totalGamesPlayed)")
            StatisticsStatCard(label: "Total Play Time", value: formatTime(stats.totalPlayTime))
            StatisticsStatCard(label: "Total Score", value: "\(stats.totalScore)")
            StatisticsStatCard(label: "Total Kills", value: "\(stats.totalKills)")
            StatisticsStatCard(label: "Waves Completed", value: "\(stats.totalWavesCompleted)")
            StatisticsStatCard(label: "Bosses Defeated", value: "\(stats.totalBossesDefeated)")
        }
        .padding()
    }
    
    private func formatTime(_ seconds: Int) -> String {
        let hours = seconds / 3600
        let minutes = (seconds % 3600) / 60
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        }
        return "\(minutes)m"
    }
}

struct WeaponsTab: View {
    var body: some View {
        VStack {
            Text("Weapon Statistics")
                .font(.title2)
                .foregroundColor(.black)
                .shadow(color: .white.opacity(0.5), radius: 2)
                .padding()
            
            Text("Coming soon...")
                .foregroundColor(.gray)
        }
    }
}

struct PerformanceTab: View {
    let stats: GameStatsData
    
    var body: some View {
        VStack(spacing: 15) {
            StatisticsStatCard(label: "Highest Score", value: "\(stats.highestScore)")
            StatisticsStatCard(label: "Highest Wave", value: "\(stats.highestWave)")
            StatisticsStatCard(label: "Highest Combo", value: "\(stats.highestCombo)")
            StatisticsStatCard(label: "Best Accuracy", value: String(format: "%.1f%%", stats.bestAccuracy))
        }
        .padding()
    }
}

struct ProgressTab: View {
    let stats: GameStatsData
    
    var body: some View {
        VStack(spacing: 15) {
            StatisticsStatCard(label: "Achievements Unlocked", value: "\(stats.achievementsUnlocked)")
            StatisticsStatCard(label: "Power-ups Collected", value: "\(stats.totalPowerUpsCollected)")
        }
        .padding()
    }
}

struct StatisticsStatCard: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(spacing: 5) {
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.black)
                .shadow(color: .white.opacity(0.5), radius: 2)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white.opacity(0.1))
        .cornerRadius(12)
    }
}

