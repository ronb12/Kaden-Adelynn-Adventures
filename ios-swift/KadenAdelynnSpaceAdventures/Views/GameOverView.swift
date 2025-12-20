//
//  GameOverView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct GameOverView: View {
    @EnvironmentObject var gameState: GameStateManager
    
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [.black, .red.opacity(0.3)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            VStack(spacing: 30) {
                Text("Game Over")
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(.white)
                    .padding()
                
                VStack(spacing: 15) {
                    StatRow(label: "Final Score", value: "\(gameState.score)")
                    StatRow(label: "Wave Reached", value: "\(gameState.wave)")
                    StatRow(label: "Enemies Killed", value: "\(gameState.enemiesKilled)")
                    StatRow(label: "Combo", value: "\(gameState.combo)")
                    StatRow(label: "Accuracy", value: String(format: "%.1f%%", gameState.accuracy))
                }
                .padding()
                .background(Color.white.opacity(0.1))
                .cornerRadius(12)
                .padding(.horizontal, 40)
                
                VStack(spacing: 15) {
                    Button(action: {
                        gameState.resetGame()
                        gameState.currentScreen = .mainMenu
                    }) {
                        Text("Main Menu")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 40)
                    
                    Button(action: {
                        gameState.resetGame()
                        gameState.currentScreen = .playing
                    }) {
                        Text("Play Again")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 40)
                }
            }
        }
        .onAppear {
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
                playTime: Int(Date().timeIntervalSince1970), // Simplified
                powerUpsCollected: 0,
                bossesDefeated: 0
            )
            gameState.statsManager.updateStats(gameData: sessionData)
        }
    }
}

struct StatRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.white.opacity(0.8))
            Spacer()
            Text(value)
                .foregroundColor(.white)
                .fontWeight(.bold)
        }
    }
}
