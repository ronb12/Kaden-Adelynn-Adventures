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
                colors: [.blue.opacity(0.9), .blue.opacity(0.7), .blue.opacity(0.6)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 30) {
                    // Header with back button
                    HStack {
                        Button(action: {
                            gameState.currentScreen = .mainMenu
                        }) {
                            Image(systemName: "chevron.left.circle.fill")
                                .font(.title)
                                .foregroundColor(.black)
                                .shadow(color: .white.opacity(0.5), radius: 2)
                        }
                        
                        Spacer()
                        
                        Text("🌌 Space Adventures")
                            .font(.system(size: 42, weight: .bold))
                            .foregroundColor(.black)
                            .shadow(color: .black.opacity(0.8), radius: 4, x: 0, y: 2)
                        
                        Spacer()
                        
                        // Spacer for balance
                        Image(systemName: "chevron.left.circle.fill")
                            .font(.title)
                            .foregroundColor(.clear)
                    }
                    .padding(.top, 70) // Safe area padding
                    .padding(.horizontal, 20)
                    
                    VStack(alignment: .leading, spacing: 20) {
                        Text("The Adventure Begins")
                            .font(.title)
                            .foregroundColor(.cyan)
                            .shadow(color: .black.opacity(0.8), radius: 3, x: 0, y: 2)
                        
                        Text("Kaden and Adelynn, two brave space explorers, embark on an epic journey through the galaxy to save their home planet from an alien invasion.")
                            .foregroundColor(.black)
                            .font(.body)
                            .shadow(color: .white.opacity(0.5), radius: 2)
                            .padding(.top, 5)
                        
                        Text("The Mission")
                            .font(.title2)
                            .foregroundColor(.yellow)
                            .shadow(color: .black.opacity(0.8), radius: 3, x: 0, y: 2)
                            .padding(.top)
                        
                        Text("Armed with advanced spacecraft and powerful weapons, Kaden and Adelynn must battle through waves of enemies, defeat powerful bosses, and collect resources to upgrade their ships.")
                            .foregroundColor(.black)
                            .font(.body)
                            .shadow(color: .white.opacity(0.5), radius: 2)
                        
                        Text("The Challenge")
                            .font(.title2)
                            .foregroundColor(.orange)
                            .shadow(color: .black.opacity(0.8), radius: 3, x: 0, y: 2)
                            .padding(.top)
                        
                        Text("With 25 lives and countless enemies ahead, can you help Kaden and Adelynn complete their mission and become legendary space heroes?")
                            .foregroundColor(.black)
                            .font(.body)
                            .shadow(color: .white.opacity(0.5), radius: 2)
                        
                        Text("Controls:")
                            .font(.headline)
                            .foregroundColor(.green)
                            .shadow(color: .black.opacity(0.8), radius: 3, x: 0, y: 2)
                            .padding(.top)
                        
                        Text("• Touch and drag to move your ship")
                            .foregroundColor(.white)
                        Text("• Your ship automatically shoots while touching")
                            .foregroundColor(.white)
                        Text("• Collect power-ups to enhance your abilities")
                            .foregroundColor(.white)
                        Text("• Defeat enemies to earn points and stars")
                            .foregroundColor(.white)
                        Text("• Survive as long as you can!")
                            .foregroundColor(.white)
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
