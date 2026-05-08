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
            LinearGradient(
                colors: [
                    Color(red: 0.03, green: 0.06, blue: 0.18),
                    Color(red: 0.05, green: 0.17, blue: 0.43),
                    Color(red: 0.12, green: 0.10, blue: 0.42)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack(spacing: 10) {
                    Button(action: {
                        gameState.currentScreen = .mainMenu
                    }) {
                        Image(systemName: "chevron.left.circle.fill")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.55), radius: 3, x: 0, y: 2)
                    }

                    Image(systemName: "chart.bar.fill")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.cyan)
                    Text("Statistics")
                        .font(.system(size: 30, weight: .heavy))
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.75), radius: 3, x: 0, y: 2)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                    
                    Spacer(minLength: 0)
                }
                .padding(.top, 60) // Safe area padding
                .padding(.horizontal)
                .padding(.bottom, 14)
                
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
                .padding(.bottom, 14)
                
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
                                .foregroundColor(.cyan.opacity(0.45))
                            Text("No Statistics Yet")
                                .font(.title2)
                                .foregroundColor(.white)
                            Text("Play the game to start tracking your performance!")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.68))
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
                .foregroundColor(isActive ? .white : .white.opacity(0.68))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
                .padding(.horizontal, 8)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity)
                .background(
                    Group {
                        if isActive {
                            LinearGradient(
                                colors: [.cyan.opacity(0.78), .blue.opacity(0.78)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        } else {
                            Color.black.opacity(0.18)
                        }
                    }
                )
                .overlay(
                    Rectangle()
                        .stroke(isActive ? Color.cyan.opacity(0.35) : Color.white.opacity(0.10), lineWidth: 1)
                )
        }
    }
}

struct OverviewTab: View {
    let stats: GameStatsData
    
    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 12),
            GridItem(.flexible(), spacing: 12)
        ], spacing: 12) {
            StatisticsStatCard(label: "Total Games", value: stats.totalGamesPlayed.formatted(), icon: "gamecontroller.fill", color: .cyan)
            StatisticsStatCard(label: "Play Time", value: formatTime(stats.totalPlayTime), icon: "clock.fill", color: .yellow)
            StatisticsStatCard(label: "Total Score", value: formatNumber(stats.totalScore), icon: "star.fill", color: .orange)
            StatisticsStatCard(label: "Total Kills", value: stats.totalKills.formatted(), icon: "target", color: .pink)
            StatisticsStatCard(label: "Waves", value: stats.totalWavesCompleted.formatted(), icon: "waveform", color: .mint)
            StatisticsStatCard(label: "Bosses", value: stats.totalBossesDefeated.formatted(), icon: "crown.fill", color: .purple)
        }
        .padding()
    }
    
    private func formatTime(_ seconds: Int) -> String {
        if seconds <= 0 { return "0m" }
        let hours = seconds / 3600
        let minutes = (seconds % 3600) / 60
        if hours >= 24 {
            let days = hours / 24
            let remainingHours = hours % 24
            return remainingHours > 0 ? "\(days)d \(remainingHours)h" : "\(days)d"
        }
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        }
        return "\(minutes)m"
    }

    private func formatNumber(_ number: Int) -> String {
        if number >= 1_000_000 {
            return String(format: "%.1fM", Double(number) / 1_000_000.0)
        } else if number >= 10_000 {
            return String(format: "%.1fK", Double(number) / 1_000.0)
        }
        return number.formatted()
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
                    .foregroundColor(.cyan)
                Text(stat.weaponName)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                Spacer()
            }
            
            Divider()
                .background(Color.white.opacity(0.18))
            
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
        .background(
            LinearGradient(
                colors: [.white.opacity(0.13), .blue.opacity(0.13), .black.opacity(0.10)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.cyan.opacity(0.22), lineWidth: 1)
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
                .foregroundColor(.white.opacity(0.62))
                .lineLimit(1)
                .minimumScaleFactor(0.72)
            Text(value)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.white)
                .lineLimit(1)
                .minimumScaleFactor(0.72)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct PerformanceTab: View {
    let stats: GameStatsData
    
    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 12),
            GridItem(.flexible(), spacing: 12)
        ], spacing: 12) {
            StatisticsStatCard(label: "High Score", value: formatNumber(stats.highestScore), icon: "trophy.fill", color: .yellow)
            StatisticsStatCard(label: "Best Wave", value: stats.highestWave.formatted(), icon: "waveform", color: .cyan)
            StatisticsStatCard(label: "Best Combo", value: "\(stats.highestCombo)x", icon: "bolt.fill", color: .orange)
            StatisticsStatCard(label: "Accuracy", value: String(format: "%.1f%%", stats.bestAccuracy), icon: "scope", color: .green)
        }
        .padding()
    }

    private func formatNumber(_ number: Int) -> String {
        if number >= 1_000_000 {
            return String(format: "%.1fM", Double(number) / 1_000_000.0)
        } else if number >= 10_000 {
            return String(format: "%.1fK", Double(number) / 1_000.0)
        }
        return number.formatted()
    }
}

struct ProgressTab: View {
    let stats: GameStatsData
    
    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 12),
            GridItem(.flexible(), spacing: 12)
        ], spacing: 12) {
            StatisticsStatCard(label: "Achievements", value: stats.achievementsUnlocked.formatted(), icon: "medal.fill", color: .yellow)
            StatisticsStatCard(label: "Power-Ups", value: stats.totalPowerUpsCollected.formatted(), icon: "sparkles", color: .mint)
        }
        .padding()
    }
}

struct StatisticsStatCard: View {
    let label: String
    let value: String
    var icon: String = "chart.bar.fill"
    var color: Color = .cyan
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(color)
                Spacer()
            }

            Text(value)
                .font(.title2)
                .fontWeight(.heavy)
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.55), radius: 2, x: 0, y: 1)
                .lineLimit(1)
                .minimumScaleFactor(0.64)

            Text(label)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.white.opacity(0.68))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, minHeight: 116, alignment: .leading)
        .padding()
        .background(
            LinearGradient(
                colors: [color.opacity(0.20), .white.opacity(0.10), .black.opacity(0.10)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(color.opacity(0.36), lineWidth: 1)
        )
    }
}
