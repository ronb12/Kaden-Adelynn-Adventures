import Foundation

struct LeaderboardEntry: Codable, Identifiable {
    let id: UUID
    let playerName: String
    let score: Int
    let date: Date
}

class Leaderboard: ObservableObject {
    @Published var entries: [LeaderboardEntry] = []
    
    func addEntry(playerName: String, score: Int) {
        let entry = LeaderboardEntry(id: UUID(), playerName: playerName, score: score, date: Date())
        entries.append(entry)
        entries.sort { $0.score > $1.score }
        if entries.count > 20 { entries = Array(entries.prefix(20)) }
    }
    
    // Persistence (UserDefaults for demo)
    func save() {
        if let data = try? JSONEncoder().encode(entries) {
            UserDefaults.standard.set(data, forKey: "leaderboard")
        }
    }
    
    func load() {
        if let data = UserDefaults.standard.data(forKey: "leaderboard"),
           let loaded = try? JSONDecoder().decode([LeaderboardEntry].self, from: data) {
            entries = loaded
        }
    }
}
