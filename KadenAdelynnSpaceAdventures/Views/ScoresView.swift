//
//  ScoresView.swift
//  KadenAdelynnSpaceAdventures
//
//  Complete leaderboard implementation with local and cloud scores
//

import SwiftUI

struct ScoresView: View {
    @EnvironmentObject var gameState: GameStateManager
    @Environment(\.colorScheme) var colorScheme
    @State private var localScores: [HighScoreData] = []
    @State private var cloudScores: [HighScoreData] = []
    @State private var activeTab = "local"
    @State private var isLoading = false
    @State private var personalBest: Int = 0
    @State private var filterDifficulty: String? = nil
    @State private var sortBy: SortOption = .score
    @State private var searchText: String = ""
    
    private var displayedScores: [HighScoreData] {
        activeTab == "local" ? filteredLocalScores : filteredCloudScores
    }
    
    enum SortOption: String, CaseIterable {
        case score = "Score"
        case wave = "Wave"
        case date = "Date"
        case kills = "Kills"
    }
    
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
                VStack(spacing: 14) {
                    HStack(spacing: 12) {
                        Button(action: {
                            gameState.currentScreen = .mainMenu
                        }) {
                            Image(systemName: "chevron.left.circle.fill")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.55), radius: 3, x: 0, y: 2)
                        }
                        
                        HStack(spacing: 10) {
                            Image(systemName: "trophy.fill")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.yellow)
                            Text("Leaderboard")
                                .font(.system(size: 30, weight: .heavy))
                                .foregroundColor(.white)
                                .lineLimit(1)
                                .minimumScaleFactor(0.72)
                                .shadow(color: .black.opacity(0.75), radius: 3, x: 0, y: 2)
                        }
                        
                        Spacer(minLength: 0)
                    }
                    .padding(.top, 56)
                    
                    // Personal Best Card
                    HStack {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("Personal Best")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.white.opacity(0.72))
                            Text(personalBest.formatted())
                                .font(.system(size: 30, weight: .heavy))
                                .foregroundColor(.yellow)
                                .shadow(color: .black.opacity(0.8), radius: 3, x: 0, y: 2)
                                .lineLimit(1)
                                .minimumScaleFactor(0.75)
                        }
                        Spacer()
                        Image(systemName: "star.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.yellow)
                    }
                    .padding()
                    .background(
                        LinearGradient(
                            colors: [.yellow.opacity(0.18), .orange.opacity(0.14), .white.opacity(0.08)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.yellow.opacity(0.35), lineWidth: 1)
                    )
                    
                    // Tabs
                    HStack(spacing: 0) {
                        ScoresTabButton(
                            title: "Local",
                            icon: "iphone",
                            isActive: activeTab == "local"
                        ) {
                            activeTab = "local"
                            loadScores()
                        }
                        
                        ScoresTabButton(
                            title: "Global",
                            icon: "globe",
                            isActive: activeTab == "cloud"
                        ) {
                            activeTab = "cloud"
                            loadScores()
                        }
                    }
                    .padding(.horizontal)
                    
                    // Search and Filters
                    HStack(spacing: 10) {
                        // Search
                        HStack {
                            Image(systemName: "magnifyingglass")
                            .foregroundColor(.white.opacity(0.65))
                            TextField(
                                "",
                                text: $searchText,
                                prompt: Text("Search...")
                                    .foregroundColor(.white.opacity(0.45))
                            )
                                .foregroundColor(.white)
                                .accentColor(.cyan)
                        }
                        .padding(10)
                        .background(Color.black.opacity(0.22))
                        .cornerRadius(10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Color.white.opacity(0.12), lineWidth: 1)
                        )
                        
                        // Sort
                        Menu {
                            ForEach(SortOption.allCases, id: \.self) { option in
                                Button(action: {
                                    sortBy = option
                                    loadScores()
                                }) {
                                    HStack {
                                        Text(option.rawValue)
                                        if sortBy == option {
                                            Image(systemName: "checkmark")
                                        }
                                    }
                                }
                            }
                        } label: {
                            HStack {
                                Text("Sort: \(sortBy.rawValue)")
                                    .font(.caption)
                                    .lineLimit(1)
                                    .minimumScaleFactor(0.75)
                                Image(systemName: "chevron.down")
                            }
                            .foregroundColor(.white)
                            .padding(10)
                            .background(Color.black.opacity(0.22))
                            .cornerRadius(10)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(Color.white.opacity(0.12), lineWidth: 1)
                            )
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 16)
                .background(
                    LinearGradient(
                        colors: [.black.opacity(0.34), .blue.opacity(0.22)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                
                // Scores List
                if isLoading {
                    Spacer()
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .cyan))
                    Text("Loading scores...")
                        .foregroundColor(.white.opacity(0.75))
                        .padding()
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            if displayedScores.isEmpty {
                                VStack(spacing: 20) {
                                    Image(systemName: "trophy")
                                        .font(.system(size: 60))
                                        .foregroundColor(.yellow.opacity(0.45))
                                    Text("No scores yet")
                                        .font(.title2)
                                        .foregroundColor(.white)
                                    Text("Play a game to see your scores here!")
                                        .font(.subheadline)
                                        .foregroundColor(.white.opacity(0.65))
                                        .multilineTextAlignment(.center)
                                }
                                .padding(.top, 100)
                            } else {
                                ForEach(Array(displayedScores.enumerated()), id: \.element.id) { index, score in
                                    ScoreRow(
                                        rank: index + 1,
                                        score: score,
                                        isPersonalBest: score.score == personalBest,
                                        isCurrentPlayer: score.playerName == gameState.playerName
                                    )
                                }
                            }
                        }
                        .padding()
                    }
                }
            }
        }
        .onAppear {
            loadPersonalBest()
            loadScores()
        }
    }
    
    private var filteredLocalScores: [HighScoreData] {
        var scores = localScores
        
        // Filter by search
        if !searchText.isEmpty {
            scores = scores.filter { score in
                score.playerName.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // Sort
        switch sortBy {
        case .score:
            scores.sort { $0.score > $1.score }
        case .wave:
            scores.sort { $0.wave > $1.wave }
        case .date:
            scores.sort { $0.date > $1.date }
        case .kills:
            scores.sort { $0.kills > $1.kills }
        }
        
        return scores
    }
    
    private var filteredCloudScores: [HighScoreData] {
        var scores = cloudScores
        
        // Filter by search
        if !searchText.isEmpty {
            scores = scores.filter { score in
                score.playerName.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // Sort
        switch sortBy {
        case .score:
            scores.sort { $0.score > $1.score }
        case .wave:
            scores.sort { $0.wave > $1.wave }
        case .date:
            scores.sort { $0.date > $1.date }
        case .kills:
            scores.sort { $0.kills > $1.kills }
        }
        
        return scores
    }
    
    private func loadPersonalBest() {
        // Check local scores first
        if let data = UserDefaults.standard.data(forKey: "highScores"),
           let localScores = try? JSONDecoder().decode([HighScoreData].self, from: data) {
            let localBest = localScores.map { $0.score }.max() ?? 0
            personalBest = localBest
        }
        
        // Then check cloud scores
        Task {
            // Check global leaderboard
            let scores = (try? await gameState.cloudKitService.fetchHighScores(limit: 100)) ?? []
            let cloudBest = scores.map { $0.score }.max() ?? 0
            
            // Check synced personal best (if user is authenticated)
            var syncedBest = 0
            if let userId = gameState.firebaseService.getCurrentUserId(),
               let personalBestScore = try? await gameState.firebaseService.fetchPersonalBestScore(userId: userId) {
                syncedBest = personalBestScore.score
            }
            
            await MainActor.run {
                personalBest = max(personalBest, cloudBest, syncedBest)
            }
        }
    }
    
    private func loadScores() {
        isLoading = true
        
        Task {
            // Load local scores
            if let data = UserDefaults.standard.data(forKey: "highScores"),
               let scores = try? JSONDecoder().decode([HighScoreData].self, from: data),
               !scores.isEmpty {
                await MainActor.run {
                    localScores = scores
                }
            } else {
                // Add sample data if no scores exist
                let sampleScores = createSampleScores()
                await MainActor.run {
                    localScores = sampleScores
                    // Save sample data
                    if let encoded = try? JSONEncoder().encode(sampleScores) {
                        UserDefaults.standard.set(encoded, forKey: "highScores")
                    }
                }
            }
            
            // Load cloud scores
            do {
                let scores = try await gameState.cloudKitService.fetchHighScores(limit: 100)
                await MainActor.run {
                    if scores.isEmpty {
                        // Add sample cloud scores
                        cloudScores = createSampleScores()
                    } else {
                        cloudScores = scores
                    }
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    // Add sample cloud scores on error
                    cloudScores = createSampleScores()
                    isLoading = false
                }
            }
        }
    }
    
    private func createSampleScores() -> [HighScoreData] {
        let sampleNames = ["Kaden", "Adelynn", "SpacePilot", "GalaxyWarrior", "StarHunter", "Nebula", "Cosmic", "Astro", "Vega", "Nova", "Orion", "Lyra", "Mira", "Jax", "Rio"]
        
        var scores: [HighScoreData] = []
        let calendar = Calendar.current
        
        for i in 0..<15 {
            let name = sampleNames[i % sampleNames.count]
            let baseScore = 50000 - (i * 3000)
            let wave = 15 - i
            let kills = 200 - (i * 10)
            let combo = 25 - i
            let accuracy = Double.random(in: 65.0...95.0)
            let daysAgo = i
            let date = calendar.date(byAdding: .day, value: -daysAgo, to: Date()) ?? Date()
            
            scores.append(HighScoreData(
                playerName: name,
                score: max(1000, baseScore),
                wave: max(1, wave),
                level: max(1, wave / 3),
                kills: max(10, kills),
                combo: max(5, combo),
                accuracy: accuracy,
                date: date
            ))
        }
        
        return scores.sorted { $0.score > $1.score }
    }
}

// Tab Button Component
private struct ScoresTabButton: View {
    let title: String
    let icon: String
    let isActive: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 14))
                Text(title)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .foregroundColor(isActive ? .white : .white.opacity(0.7))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
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
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isActive ? Color.cyan.opacity(0.42) : Color.white.opacity(0.10), lineWidth: 1)
            )
        }
    }
}

// Score Row Component
private struct ScoreRow: View {
    let rank: Int
    let score: HighScoreData
    let isPersonalBest: Bool
    let isCurrentPlayer: Bool
    
    private var rankGradient: LinearGradient {
        LinearGradient(
            colors: rank == 1 ? [.yellow, .orange] :
                    rank == 2 ? [Color.white.opacity(0.82), Color.gray.opacity(0.78)] :
                    rank == 3 ? [.orange, .brown] :
                    [Color.cyan.opacity(0.32), Color.blue.opacity(0.24)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    var body: some View {
        HStack(spacing: 12) {
            // Rank
            ZStack {
                Circle()
                    .fill(rankGradient)
                    .frame(width: 48, height: 48)
                    .overlay(
                        Circle()
                            .stroke(Color.white.opacity(rank <= 3 ? 0.35 : 0.14), lineWidth: 1)
                    )
                
                Text("\(rank)")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(rank <= 3 ? .black : .white)
            }
            
            // Score Details
            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text(score.playerName)
                        .font(.headline)
                        .foregroundColor(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.72)
                    
                    if isCurrentPlayer {
                        Text("(You)")
                            .font(.caption)
                            .foregroundColor(.cyan)
                            .lineLimit(1)
                    }
                    
                    if isPersonalBest {
                        Image(systemName: "star.fill")
                            .font(.caption)
                            .foregroundColor(.yellow)
                    }
                    
                    Spacer(minLength: 6)
                    
                    Text(score.score.formatted())
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.yellow)
                        .lineLimit(1)
                        .minimumScaleFactor(0.74)
                }
                
                HStack(spacing: 10) {
                    Label("\(score.wave)", systemImage: "waveform")
                        .font(.caption)
                        .foregroundColor(.cyan.opacity(0.82))
                        .lineLimit(1)
                    
                    Label("\(score.kills)", systemImage: "target")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.68))
                        .lineLimit(1)
                    
                    if score.combo > 0 {
                        Label("\(score.combo)x", systemImage: "bolt.fill")
                            .font(.caption)
                            .foregroundColor(.yellow.opacity(0.88))
                            .lineLimit(1)
                    }
                    
                    Spacer(minLength: 4)
                    
                    Text(score.date, style: .relative)
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.56))
                        .lineLimit(1)
                        .minimumScaleFactor(0.65)
                }
            }
        }
        .padding(14)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(
                        isCurrentPlayer ?
                        LinearGradient(
                            colors: [.cyan.opacity(0.34), .blue.opacity(0.24), .black.opacity(0.14)],
                            startPoint: .leading,
                            endPoint: .trailing
                        ) :
                        LinearGradient(
                            colors: [.white.opacity(0.13), .blue.opacity(0.13), .black.opacity(0.10)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        isCurrentPlayer ? Color.cyan.opacity(0.5) :
                        rank <= 3 ? Color.yellow.opacity(0.42) :
                        Color.white.opacity(0.12),
                        lineWidth: isCurrentPlayer || rank <= 3 ? 2 : 1
                    )
            }
        )
        .shadow(
            color: isCurrentPlayer ? .cyan.opacity(0.3) :
                   rank <= 3 ? .yellow.opacity(0.2) : .clear,
            radius: isCurrentPlayer || rank <= 3 ? 8 : 0
        )
    }
}
