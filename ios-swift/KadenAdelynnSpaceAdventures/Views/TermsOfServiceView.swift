//
//  TermsOfServiceView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct TermsOfServiceView: View {
    @EnvironmentObject var gameState: GameStateManager
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack {
                Text("Terms of Service")
                    .font(.largeTitle)
                    .foregroundColor(.white)
                    .padding()
                
                ScrollView {
                    Text("Terms of Service content goes here...")
                        .foregroundColor(.gray)
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
