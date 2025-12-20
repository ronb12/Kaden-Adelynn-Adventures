//
// TutorialOverlayView.swift
// KadenAdelynnAdventures
//
// SwiftUI overlay for in-game tutorial/onboarding
//

import SwiftUI

struct TutorialStep: Identifiable {
    let id = UUID()
    let title: String
    let message: String
}

struct TutorialOverlayView: View {
    @Binding var isPresented: Bool
    @State private var stepIndex: Int = 0
    let steps: [TutorialStep] = [
        TutorialStep(title: "Welcome!", message: "Kaden & Adelynn Space Adventures: Blast asteroids, dodge enemies, and collect power-ups!"),
        TutorialStep(title: "Move", message: "Use ←/→ or touch left/right to move your ship."),
        TutorialStep(title: "Fire", message: "Tap anywhere to fire your weapon."),
        TutorialStep(title: "Menu", message: "Tap ☰ for pause, save, load, and more."),
        TutorialStep(title: "Power-ups", message: "Collect power-ups for special abilities!"),
        TutorialStep(title: "Good luck!", message: "Survive as long as you can and climb the leaderboard!")
    ]
    var body: some View {
        if isPresented {
            ZStack {
                Color.black.opacity(0.7).edgesIgnoringSafeArea(.all)
                VStack(spacing: 24) {
                    Text(steps[stepIndex].title)
                        .font(.largeTitle).bold().foregroundColor(.yellow)
                    Text(steps[stepIndex].message)
                        .font(.title2).foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .padding()
                    HStack {
                        if stepIndex > 0 {
                            Button("Back") { stepIndex -= 1 }
                                .padding().background(Color.gray.opacity(0.3)).cornerRadius(8)
                        }
                        Spacer()
                        if stepIndex < steps.count - 1 {
                            Button("Next") { stepIndex += 1 }
                                .padding().background(Color.blue).foregroundColor(.white).cornerRadius(8)
                        } else {
                            Button("Start Game") { isPresented = false }
                                .padding().background(Color.green).foregroundColor(.white).cornerRadius(8)
                        }
                    }.padding(.horizontal)
                }
                .padding()
                .background(Color.black.opacity(0.85))
                .cornerRadius(20)
                .shadow(radius: 10)
                .padding(32)
            }
            .transition(.opacity)
            .animation(.easeInOut, value: isPresented)
        }
    }
}

#Preview {
    TutorialOverlayView(isPresented: .constant(true))
}
