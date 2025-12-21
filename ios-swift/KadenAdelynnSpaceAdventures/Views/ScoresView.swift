//
//  ScoresView.swift
//  KadenAdelynnSpaceAdventures
//
//  Complete leaderboard implementation with local and cloud scores
//

import SwiftUI

struct ScoresView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var localScores: [HighScoreData] = []
    @State private var cloudScores: [HighScoreData] = []
    @State private var activeTab = "local"
    @State private var isLoading = false
    @State private var personalBest: Int = 0
    @State private var filterDifficulty: String? = nil
    @State private var sortBy: SortOption = .score
    @State private var searchText: String = ""
    
    enum SortOption: String, CaseIterable {
        case score = "Score"
        case wave = "Wave"
        case date = "Date"
        case kills = "Kills"
    }
    
    var body: some View {
        ZStack {
            // Cosmic gradient background
            LinearGradient(
                colors: [.blue.opacity(0.9), .blue.opacity(0.7), .blue.opacity(0.6)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 15) {
                    HStack {
                        Text("🏆")
                            .font(.system(size: 50))
                        Text("Leaderboard")
                            .font(.system(size: 36, weight: .bold))
                            .foregroundColor(.black)
                            .shadow(color: .black.opacity(0.8), radius: 4, x: 0, y: 2)
                        
                        Spacer()
                        
                        Button(action: {
                            gameState.currentScreen = .mainMenu
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.title)
                                .foregroundColor(.black)
                                .shadow(color: .white.opacity(0.5), radius: 2)
                        }
                    }
                    .padding(.top, 60) // Safe area padding
                    
                    // Personal Best Card
                    HStack {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("Personal Best")
                                .font(.caption)
                                .foregroundColor(.black.opacity(0.8))
                            Text("\(personalBest)")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.yellow)
                        }
                        Spacer()
                        Image(systemName: "star.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.yellow)
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
                            title: "Cloud",
                            icon: "cloud.fill",
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
                                .foregroundColor(.white.opacity(0.6))
                            TextField("Search...", text: $searchText)
                                .foregroundColor(.black)
                        }
                        .padding(10)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(10)
                        
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
                                Image(systemName: "chevron.down")
                            }
                            .foregroundColor(.black)
                            .padding(10)
                            .background(Color.white.opacity(0.1))
                            .cornerRadius(10)
                        }
                    }
                    .padding(.horizontal)
                }
                .padding()
                .background(
                    LinearGradient(
                        colors: [.black.opacity(0.6), .purple.opacity(0.3)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                
                // Scores List
                if isLoading {
                    Spacer()
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    Text("Loading scores...")
                        .foregroundColor(.white.opacity(0.7))
                        .padding()
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            let scores = activeTab == "local" ? filteredLocalScores : filteredCloudScores
                            
                            if scores.isEmpty {
                                VStack(spacing: 20) {
                                    Image(systemName: "trophy")
                                        .font(.system(size: 60))
                                        .foregroundColor(.white.opacity(0.3))
                                    Text("No scores yet")
                                        .font(.title2)
                                        .foregroundColor(.black.opacity(0.8))
                                    Text("Play a game to see your scores here!")
                                        .font(.subheadline)
                                        .foregroundColor(.white.opacity(0.5))
                                        .multilineTextAlignment(.center)
                                }
                                .padding(.top, 100)
                            } else {
                                ForEach(Array(scores.enumerated()), id: \.element.id) { index, score in
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
            let scores = (try? await gameState.cloudKitService.fetchHighScores(limit: 100)) ?? []
            let cloudBest = scores.map { $0.score }.max() ?? 0
            
            await MainActor.run {
                personalBest = max(personalBest, cloudBest)
            }
        }
    }
    
    private func loadScores() {
        isLoading = true
        
        Task {
            // Load local scores
            if let data = UserDefaults.standard.data(forKey: "highScores"),
               let scores = try? JSONDecoder().decode([HighScoreData].self, from: data) {
                await MainActor.run {
                    localScores = scores
                }
            }
            
            // Load cloud scores
            do {
                let scores = try await gameState.cloudKitService.fetchHighScores(limit: 100)
                await MainActor.run {
                    cloudScores = scores
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                }
            }
        }
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
                    .font(.subheadline)
                    .fontWeight(.semibold)
            }
                    .foregroundColor(isActive ? .black : .black.opacity(0.7))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                Group {
                    if isActive {
                        LinearGradient(
                            colors: [.cyan.opacity(0.6), .blue.opacity(0.6)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    } else {
                        Color.clear
                    }
                }
            )
            .cornerRadius(12)
        }
    }
}

// Score Row Component
private struct ScoreRow: View {
    let rank: Int
    let score: HighScoreData
    let isPersonalBest: Bool
    let isCurrentPlayer: Bool
    
    var body: some View {
        HStack(spacing: 15) {
            // Rank
            ZStack {
                Circle()
                    .fill(
                        rank <= 3 ?
                        LinearGradient(
                            colors: rank == 1 ? [.yellow, .orange] :
                                    rank == 2 ? [.gray, .gray.opacity(0.8)] :
                                    [.orange, .brown],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ) :
                        LinearGradient(
                            colors: [.white.opacity(0.2), .white.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 50, height: 50)
                
                Text("\(rank)")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(rank <= 3 ? .black : .black.opacity(0.9))
            }
            
            // Score Details
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(score.playerName)
                        .font(.headline)
                                .foregroundColor(.black)
                    
                    if isCurrentPlayer {
                        Text("(You)")
                            .font(.caption)
                            .foregroundColor(.cyan)
                    }
                    
                    if isPersonalBest {
                        Text("⭐")
                            .font(.caption)
                    }
                    
                    Spacer()
                    
                    Text("\(score.score)")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.yellow)
                }
                
                HStack(spacing: 15) {
                    Label("\(score.wave)", systemImage: "waveform")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                    
                    Label("\(score.kills)", systemImage: "target")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                    
                    if score.combo > 0 {
                        Label("\(score.combo)x", systemImage: "bolt.fill")
                            .font(.caption)
                            .foregroundColor(.yellow.opacity(0.8))
                    }
                    
                    Spacer()
                    
                    Text(score.date, style: .relative)
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.5))
                }
            }
        }
        .padding()
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(
                        isCurrentPlayer ?
                        LinearGradient(
                            colors: [.cyan.opacity(0.3), .blue.opacity(0.2)],
                            startPoint: .leading,
                            endPoint: .trailing
                        ) :
                        LinearGradient(
                            colors: [.white.opacity(0.1), .white.opacity(0.05)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        isCurrentPlayer ? Color.cyan.opacity(0.5) :
                        rank <= 3 ? Color.yellow.opacity(0.3) :
                        Color.white.opacity(0.1),
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
