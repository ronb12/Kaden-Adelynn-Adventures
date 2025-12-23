//
//  StatisticsDashboardView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct StatisticsDashboardView: View {
    @EnvironmentObject var gameState: GameStateManager
    @Environment(\.colorScheme) var colorScheme
    @State private var activeTab = "overview"
    @State private var stats: GameStatsData?
    
    var body: some View {
        ZStack {
            Group {
                if colorScheme == .dark {
                    LinearGradient(
                        colors: [.black.opacity(0.95), .gray.opacity(0.8), .blue.opacity(0.6)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                } else {
                    Color.blue.opacity(0.8)
                }
            }
            .ignoresSafeArea()
            
            VStack {
                // Header
                HStack {
                    Text("📊 Statistics Dashboard")
                        .font(.largeTitle)
                        .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                        .shadow(color: (colorScheme == .dark ? Color.black : Color.white).opacity(0.5), radius: 2, x: 0, y: 1)
                    
                    Spacer()
                    
                    Button("✕") {
                        gameState.currentScreen = .mainMenu
                    }
                    .font(.title)
                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                    .shadow(color: (colorScheme == .dark ? Color.white : Color.black).opacity(0.8), radius: 3, x: 0, y: 2)
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
                                .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                .shadow(color: (colorScheme == .dark ? Color.white : Color.black).opacity(0.8), radius: 3, x: 0, y: 2)
                            Text("Play the game to start tracking your performance!")
                                .font(.subheadline)
                                .foregroundColor((colorScheme == .dark ? Color.white : Color.black).opacity(0.8))
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
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(isActive ? .black : .black.opacity(0.7))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
                .padding(.horizontal, 8)
                .padding(.vertical, 10)
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
    @State private var weaponStats = createSampleWeaponStats()
    
    var body: some View {
        VStack(spacing: 15) {
            // Weapon Statistics Cards
            ForEach(weaponStats) { stat in
                WeaponStatCard(stat: stat)
            }
        }
        .padding()
    }
    
    static func createSampleWeaponStats() -> [WeaponStat] {
        return [
            WeaponStat(
                weaponName: "Laser",
                icon: "bolt.fill",
                shotsFired: 15240,
                shotsHit: 12850,
                accuracy: 84.3,
                damageDealt: 385000,
                kills: 1250,
                usageTime: 1240,
                bestCombo: 45
            ),
            WeaponStat(
                weaponName: "Pulse",
                icon: "sparkles",
                shotsFired: 9800,
                shotsHit: 7840,
                accuracy: 80.0,
                damageDealt: 235200,
                kills: 980,
                usageTime: 890,
                bestCombo: 38
            ),
            WeaponStat(
                weaponName: "Plasma",
                icon: "flame.fill",
                shotsFired: 11200,
                shotsHit: 9520,
                accuracy: 85.0,
                damageDealt: 285600,
                kills: 1120,
                usageTime: 1050,
                bestCombo: 42
            ),
            WeaponStat(
                weaponName: "Rocket",
                icon: "arrow.up.circle.fill",
                shotsFired: 6800,
                shotsHit: 6120,
                accuracy: 90.0,
                damageDealt: 244800,
                kills: 680,
                usageTime: 720,
                bestCombo: 35
            )
        ]
    }
}

struct WeaponStat: Identifiable {
    let id = UUID()
    let weaponName: String
    let icon: String
    let shotsFired: Int
    let shotsHit: Int
    let accuracy: Double
    let damageDealt: Int
    let kills: Int
    let usageTime: Int // in seconds
    let bestCombo: Int
}

struct WeaponStatCard: View {
    let stat: WeaponStat
    
    var body: some View {
        VStack(spacing: 12) {
            // Header with icon and name
            HStack {
                Image(systemName: stat.icon)
                    .font(.title2)
                    .foregroundColor(.black)
                Text(stat.weaponName)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.black)
                    .shadow(color: .white.opacity(0.5), radius: 2)
                Spacer()
            }
            
            Divider()
                .background(Color.black.opacity(0.3))
            
            // Stats Grid
            VStack(spacing: 8) {
                HStack(spacing: 15) {
                    StatItem(label: "Shots Fired", value: "\(stat.shotsFired)")
                    StatItem(label: "Shots Hit", value: "\(stat.shotsHit)")
                }
                
                HStack(spacing: 15) {
                    StatItem(label: "Accuracy", value: String(format: "%.1f%%", stat.accuracy))
                    StatItem(label: "Damage Dealt", value: formatNumber(stat.damageDealt))
                }
                
                HStack(spacing: 15) {
                    StatItem(label: "Kills", value: "\(stat.kills)")
                    StatItem(label: "Usage Time", value: formatTime(stat.usageTime))
                }
                
                HStack(spacing: 15) {
                    StatItem(label: "Best Combo", value: "\(stat.bestCombo)")
                    Spacer()
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white.opacity(0.15))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.black.opacity(0.2), lineWidth: 1)
        )
    }
    
    private func formatNumber(_ number: Int) -> String {
        if number >= 1000000 {
            return String(format: "%.1fM", Double(number) / 1000000.0)
        } else if number >= 1000 {
            return String(format: "%.1fK", Double(number) / 1000.0)
        }
        return "\(number)"
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

struct StatItem: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundColor(.black.opacity(0.7))
            Text(value)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.black)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
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
                .foregroundColor(.black.opacity(0.8))
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

