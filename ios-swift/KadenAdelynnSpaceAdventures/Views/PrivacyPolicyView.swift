//
//  PrivacyPolicyView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct PrivacyPolicyView: View {
    @ObservedObject var gameState: GameStateManager
    
    var body: some View {
        ZStack {
            Color.blue.opacity(0.8).ignoresSafeArea()
            
            VStack {
                Text("Privacy Policy")
                    .font(.title)
                    .foregroundColor(.black)
                    .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
                    .padding(.top, 60) // Safe area padding
                    .padding(.horizontal)
                    .padding(.bottom, 10)
                
                ScrollView {
                    Text("This game respects your privacy. We collect minimal data necessary for game functionality and cloud sync.")
                        .foregroundColor(.black)
                        .shadow(color: .white.opacity(0.5), radius: 2)
                        .padding()
                }
                
                Button("Back") {
                    gameState.currentScreen = .settings
                }
                .buttonStyle(.bordered)
                .padding()
            }
        }
    }
}
