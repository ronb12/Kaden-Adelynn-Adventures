//
//  PrivacyPolicyView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct PrivacyPolicyView: View {
    @ObservedObject var gameState: GameStateManager
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack {
                Text("Privacy Policy")
                    .font(.title)
                    .foregroundColor(.white)
                    .padding()
                
                ScrollView {
                    Text("This game respects your privacy. We collect minimal data necessary for game functionality and cloud sync.")
                        .foregroundColor(.white)
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
