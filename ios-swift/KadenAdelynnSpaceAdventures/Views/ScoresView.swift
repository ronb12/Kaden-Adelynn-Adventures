//
//  ScoresView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct ScoresView: View {
    @EnvironmentObject var gameState: GameStateManager
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack {
                Text("High Scores")
                    .font(.largeTitle)
                    .foregroundColor(.white)
                    .padding()
                
                Text("No scores yet")
                    .foregroundColor(.gray)
                
                Spacer()
                
                Button("Back") {
                    gameState.currentScreen = .mainMenu
                }
                .padding()
            }
        }
    }
}
