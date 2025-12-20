//
//  StoryView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct StoryView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var showContinue = false
    
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [.black, .blue.opacity(0.3), .purple.opacity(0.2)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 30) {
                    Text("🌌 Space Adventures")
                        .font(.system(size: 42, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.top, 60)
                    
                    VStack(alignment: .leading, spacing: 20) {
                        Text("Welcome, \(gameState.playerName)!")
                            .font(.title)
                            .foregroundColor(.cyan)
                        
                        Text("You are a brave space pilot defending the galaxy from an alien invasion. Navigate through waves of enemies, collect power-ups, and defeat powerful bosses!")
                            .foregroundColor(.white)
                            .font(.body)
                        
                        Text("Controls:")
                            .font(.headline)
                            .foregroundColor(.yellow)
                            .padding(.top)
                        
                        Text("• Touch and drag to move your ship")
                        Text("• Your ship automatically shoots while touching")
                        Text("• Collect power-ups to enhance your abilities")
                        Text("• Defeat enemies to earn points and coins")
                        Text("• Survive as long as you can!")
                    }
                    .foregroundColor(.white.opacity(0.9))
                    .padding()
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(12)
                    .padding(.horizontal, 40)
                    
                    Button(action: {
                        gameState.currentScreen = .playing
                    }) {
                        Text("🚀 Start Adventure")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(
                                LinearGradient(
                                    colors: [.green, .blue],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 40)
                    .padding(.top, 20)
                }
            }
        }
    }
}
