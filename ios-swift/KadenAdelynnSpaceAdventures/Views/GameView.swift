//
//  GameView.swift
//  KadenAdelynnSpaceAdventures
//
//  Game view with SpriteKit
//

import SwiftUI
import SpriteKit

struct GameView: View {
    @EnvironmentObject var gameState: GameStateManager
    @StateObject private var achievementManager = AchievementManager.shared
    @State private var scene: GameScene?
    @State private var viewSize: CGSize = .zero
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Game scene
                if let scene = scene {
                    SpriteView(scene: scene)
                        .ignoresSafeArea()
                        .onAppear {
                            scene.gameState = gameState
                        }
                } else {
                    Color.black
                        .ignoresSafeArea()
                }
            
                // UI Overlay
                VStack {
                    // Top HUD with safe area padding
                    HStack {
                    VStack(alignment: .leading, spacing: 5) {
                        HStack {
                            Text("Score:")
                                .foregroundColor(.white.opacity(0.8))
                                .font(.subheadline)
                            Text("\(gameState.score)")
                                .foregroundColor(.yellow)
                                .font(.headline)
                                .fontWeight(.bold)
                        }
                        
                        HStack {
                            Text("Wave:")
                                .foregroundColor(.white.opacity(0.8))
                                .font(.caption)
                            Text("\(gameState.wave)")
                                .foregroundColor(.cyan)
                                .font(.subheadline)
                                .fontWeight(.semibold)
                        }
                        
                        HStack {
                            Text("Lives:")
                                .foregroundColor(.white.opacity(0.8))
                                .font(.caption)
                            HStack(spacing: 2) {
                                ForEach(0..<min(gameState.lives, 10), id: \.self) { _ in
                                    Image(systemName: "heart.fill")
                                        .foregroundColor(.red)
                                        .font(.caption2)
                                }
                                if gameState.lives > 10 {
                                    Text("+\(gameState.lives - 10)")
                                        .foregroundColor(.red)
                                        .font(.caption2)
                                }
                            }
                        }
                    }
                    .padding()
                    .background(Color.black.opacity(0.6))
                    .cornerRadius(12)
                    
                    Spacer()
                    
                    Button(action: {
                        gameState.isPaused.toggle()
                    }) {
                        Image(systemName: gameState.isPaused ? "play.fill" : "pause.fill")
                            .foregroundColor(.white)
                            .font(.title2)
                            .padding()
                            .background(Color.black.opacity(0.6))
                            .cornerRadius(8)
                    }
                    }
                    .padding()
                    .padding(.top, geometry.safeAreaInsets.top > 0 ? 0 : 10)
                    
                    Spacer()
                    
                    // Bottom HUD
                    VStack(spacing: 10) {
                    // Health Bar
                    VStack(alignment: .leading, spacing: 5) {
                        HStack {
                            Text("Health")
                                .foregroundColor(.white.opacity(0.8))
                                .font(.caption)
                            Spacer()
                            Text("\(gameState.health)/100")
                                .foregroundColor(.white)
                                .font(.caption)
                        }
                        
                        GeometryReader { geometry in
                            ZStack(alignment: .leading) {
                                // Background
                                Rectangle()
                                    .fill(Color.red.opacity(0.3))
                                    .frame(height: 8)
                                    .cornerRadius(4)
                                
                                // Health fill
                                Rectangle()
                                    .fill(
                                        LinearGradient(
                                            colors: gameState.health > 50 ? [.green, .green.opacity(0.8)] :
                                                    gameState.health > 25 ? [.yellow, .orange] :
                                                    [.red, .red.opacity(0.8)],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                                    .frame(width: geometry.size.width * CGFloat(gameState.health) / 100, height: 8)
                                    .cornerRadius(4)
                            }
                        }
                        .frame(height: 8)
                    }
                    .padding(.horizontal)
                    
                    HStack {
                        // Combo Display
                        if gameState.combo > 0 {
                            HStack {
                                Image(systemName: "bolt.fill")
                                    .foregroundColor(.yellow)
                                Text("\(gameState.combo)x")
                                    .foregroundColor(.yellow)
                                    .font(.headline)
                                    .fontWeight(.bold)
                                Text("COMBO")
                                    .foregroundColor(.yellow.opacity(0.8))
                                    .font(.caption)
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(
                                LinearGradient(
                                    colors: [.yellow.opacity(0.3), .orange.opacity(0.3)],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(8)
                        }
                        
                        Spacer()
                        
                        // Accuracy
                        if gameState.shotsFired > 0 {
                            HStack {
                                Text("Accuracy:")
                                    .foregroundColor(.white.opacity(0.8))
                                    .font(.caption)
                                Text(String(format: "%.1f%%", gameState.accuracy))
                                    .foregroundColor(.white)
                                    .font(.caption)
                                    .fontWeight(.semibold)
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.black.opacity(0.5))
                            .cornerRadius(8)
                        }
                    }
                    .padding(.horizontal)
                    }
                    .padding(.bottom)
                    .padding(.bottom, geometry.safeAreaInsets.bottom > 0 ? 0 : 10)
                }
                
                // Achievement notification
                AchievementNotificationView(achievementManager: achievementManager)
                
                // Pause overlay
                if gameState.isPaused {
                    Color.black.opacity(0.7)
                        .ignoresSafeArea()
                    
                    VStack(spacing: 20) {
                        Text("PAUSED")
                            .font(.largeTitle)
                            .foregroundColor(.white)
                        
                        Button("Resume") {
                            gameState.isPaused = false
                        }
                        .buttonStyle(.borderedProminent)
                        
                        Button("Main Menu") {
                            gameState.currentScreen = .mainMenu
                        }
                        .buttonStyle(.bordered)
                    }
                }
            }
            .onAppear {
                viewSize = geometry.size
                setupGame(size: geometry.size)
            }
            .onChange(of: geometry.size) { newSize in
                viewSize = newSize
                updateGameSize(newSize)
            }
            .onDisappear {
                scene = nil
            }
        }
        .ignoresSafeArea()
    }
    
    private func setupGame(size: CGSize) {
        // Use the actual view size, accounting for safe areas
        let gameSize = CGSize(
            width: size.width,
            height: size.height
        )
        let newScene = GameScene(size: gameSize, gameState: gameState)
        newScene.scaleMode = .aspectFill
        scene = newScene
        
        // Reset game state
        gameState.resetGame()
    }
    
    private func updateGameSize(_ size: CGSize) {
        guard let scene = scene else { return }
        // Update scene size if needed (for orientation changes)
        scene.size = CGSize(width: size.width, height: size.height)
        scene.scaleMode = .aspectFill
    }
}

