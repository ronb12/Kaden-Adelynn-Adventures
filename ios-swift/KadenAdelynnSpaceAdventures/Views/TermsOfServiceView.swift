//
//  TermsOfServiceView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct TermsOfServiceView: View {
    @EnvironmentObject var gameState: GameStateManager
    
    var body: some View {
        ZStack {
            Color.blue.opacity(0.8).ignoresSafeArea()
            
            VStack {
                Text("Terms of Service")
                    .font(.largeTitle)
                    .foregroundColor(.black)
                    .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
                    .padding(.top, 60) // Safe area padding
                    .padding(.horizontal)
                    .padding(.bottom, 10)
                
                ScrollView {
                    Text("Terms of Service content goes here...")
                        .foregroundColor(.black.opacity(0.8))
                        .shadow(color: .white.opacity(0.5), radius: 2)
                        .padding()
                }
                
                Button("Back") {
                    gameState.currentScreen = .settings
                }
                .padding()
            }
        }
    }
}
