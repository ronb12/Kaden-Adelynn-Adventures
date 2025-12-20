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
            Color.black.ignoresSafeArea()
            
            VStack {
                // Header
                HStack {
                    Text("📊 Statistics Dashboard")
                        .font(.largeTitle)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button("✕") {
                        gameState.currentScreen = .mainMenu
                    }
                    .font(.title)
                    .foregroundColor(.white)
                }
                .padding()
                
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
                        Text("Loading statistics...")
                            .foregroundColor(.gray)
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
                .foregroundColor(isActive ? .white : .gray)
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
            StatCard(label: "Total Games", value: "\(stats.totalGamesPlayed)")
            StatCard(label: "Total Play Time", value: formatTime(stats.totalPlayTime))
            StatCard(label: "Total Score", value: "\(stats.totalScore)")
            StatCard(label: "Total Kills", value: "\(stats.totalKills)")
            StatCard(label: "Waves Completed", value: "\(stats.totalWavesCompleted)")
            StatCard(label: "Bosses Defeated", value: "\(stats.totalBossesDefeated)")
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
                .foregroundColor(.white)
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
            StatCard(label: "Highest Score", value: "\(stats.highestScore)")
            StatCard(label: "Highest Wave", value: "\(stats.highestWave)")
            StatCard(label: "Highest Combo", value: "\(stats.highestCombo)")
            StatCard(label: "Best Accuracy", value: String(format: "%.1f%%", stats.bestAccuracy))
        }
        .padding()
    }
}

struct ProgressTab: View {
    let stats: GameStatsData
    
    var body: some View {
        VStack(spacing: 15) {
            StatCard(label: "Achievements Unlocked", value: "\(stats.achievementsUnlocked)")
            StatCard(label: "Power-ups Collected", value: "\(stats.totalPowerUpsCollected)")
        }
        .padding()
    }
}

struct StatCard: View {
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
                .foregroundColor(.white)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white.opacity(0.1))
        .cornerRadius(12)
    }
}

