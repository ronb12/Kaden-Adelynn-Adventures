import SwiftUI

struct LeaderboardView: View {
    @ObservedObject var leaderboard: Leaderboard
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Leaderboard").font(.largeTitle).bold()
            List(leaderboard.entries) { entry in
                HStack {
                    Text(entry.playerName).bold()
                    Spacer()
                    Text("\(entry.score)")
                    Text(entry.date, style: .date)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            .listStyle(PlainListStyle())
            Spacer()
        }
        .padding()
    }
}
