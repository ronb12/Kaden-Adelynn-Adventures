//
//  SignInView.swift
//  KadenAdelynnSpaceAdventures
//
//  Sign in with Apple view
//

import SwiftUI
import AuthenticationServices

struct SignInView: View {
    @ObservedObject var signInService: AppleSignInService
    @ObservedObject var gameState: GameStateManager
    
    var body: some View {
        VStack(spacing: 30) {
            if signInService.isSignedIn {
                VStack(spacing: 15) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.green)
                    
                    Text("Signed In")
                        .font(.title)
                        .foregroundColor(.white)
                    
                    if let userName = signInService.userName {
                        Text("Welcome, \(userName)!")
                            .font(.headline)
                            .foregroundColor(.white.opacity(0.8))
                    }
                    
                    Button("Sign Out") {
                        signInService.signOut()
                    }
                    .buttonStyle(.bordered)
                    .padding(.top, 20)
                }
            } else {
                VStack(spacing: 20) {
                    Text("Sign in with Apple")
                        .font(.title)
                        .foregroundColor(.white)
                    
                    Text("Sign in to sync your game progress across all your devices")
                        .font(.body)
                        .foregroundColor(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    SignInWithAppleButton(
                        onRequest: { request in
                            request.requestedScopes = [.fullName, .email]
                        },
                        onCompletion: { result in
                            switch result {
                            case .success(_):
                                signInService.checkAuthorizationStatus()
                            case .failure(let error):
                                print("Sign in error: \(error.localizedDescription)")
                            }
                        }
                    )
                    .signInWithAppleButtonStyle(.white)
                    .frame(height: 50)
                    .cornerRadius(8)
                    .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("AppleSignInCompleted"))) { _ in
                        // Sign in completed, update UI
                    }
                    .signInWithAppleButtonStyle(.white)
                    .frame(height: 50)
                    .cornerRadius(8)
                    .padding(.horizontal, 40)
                    
                    Button("Continue Without Signing In") {
                        gameState.currentScreen = .mainMenu
                    }
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.top, 10)
                }
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [.black, .blue.opacity(0.3)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
    }
}
