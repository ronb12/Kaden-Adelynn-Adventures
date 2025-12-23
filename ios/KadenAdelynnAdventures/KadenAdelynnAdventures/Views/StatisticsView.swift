import SwiftUI

struct StatisticsView: View {
    let stats: Statistics
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Statistics").font(.largeTitle).bold()
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text("High Score: \(stats.highScore)")
                    Text("Total Games: \(stats.totalGames)")
                    Text("Total Kills: \(stats.totalKills)")
                    Text("Total Coins: \(stats.totalCoins)")
                    Text("Max Combo: \(stats.maxCombo)")
                    Text("Achievements: \(stats.achievementsUnlocked)")
                    Text("Power-ups: \(stats.powerUpsCollected)")
                    Text("Bosses Defeated: \(stats.bossesDefeated)")
                    Text("Play Time: \(Int(stats.playTime))s")
                }
                Spacer()
            }
            Spacer()
        }
        .padding()
    }
}
