//
//  LandingView.swift
//  KadenAdelynnSpaceAdventures
//
//  Landing/login page with Game Center and Sign in with Apple
//

import SwiftUI
import UIKit
import AuthenticationServices
import GameKit

struct LandingView: View {
    @ObservedObject var gameState: GameStateManager
    @StateObject private var gameCenterService = GameCenterService.shared
    @StateObject private var appleSignInService = AppleSignInService()
    @StateObject private var firebaseAuth = FirebaseAuthService.shared
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showError = false
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color(red: 0.05, green: 0.05, blue: 0.15),
                    Color(red: 0.1, green: 0.1, blue: 0.3),
                    Color(red: 0.05, green: 0.05, blue: 0.15)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Stars background effect
            StarsBackgroundView()
            
            VStack(spacing: 0) {
                Spacer()
                
                // App Logo/Title
                VStack(spacing: 20) {
                    // App Icon
                    Image("AppIconImage")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 120, height: 120)
                        .clipShape(RoundedRectangle(cornerRadius: 26))
                        .shadow(color: .black.opacity(0.5), radius: 20, x: 0, y: 10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 26)
                                .stroke(Color.white.opacity(0.3), lineWidth: 2)
                        )
                    
                    Text("Kaden & Adelynn")
                        .font(.system(size: 42, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    
                    Text("Space Adventures")
                        .font(.system(size: 24, weight: .medium, design: .rounded))
                        .foregroundColor(.white.opacity(0.9))
                }
                .padding(.bottom, 60)
                
                // Sign In Options
                VStack(spacing: 20) {
                    Text("Sign in to sync your progress")
                        .font(.headline)
                        .foregroundColor(.white.opacity(0.8))
                        .padding(.bottom, 10)
                    
                    // Game Center Button
                    Button(action: {
                        handleGameCenterSignIn()
                    }) {
                        HStack {
                            Image(systemName: "gamecontroller.fill")
                                .font(.title3)
                            Text("Continue with Game Center")
                                .font(.headline)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(
                            LinearGradient(
                                colors: [Color(red: 0.2, green: 0.4, blue: 0.8), Color(red: 0.1, green: 0.2, blue: 0.6)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                        .shadow(color: .black.opacity(0.3), radius: 8, x: 0, y: 4)
                    }
                    .disabled(isLoading)
                    
                    // Sign in with Apple Button
                    SignInWithAppleButton(
                        onRequest: { request in
                            request.requestedScopes = [.fullName, .email]
                        },
                        onCompletion: { result in
                            DispatchQueue.main.async {
                                handleAppleSignIn(result: result)
                            }
                        }
                    )
                    .signInWithAppleButtonStyle(.white)
                    .frame(height: 56)
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.3), radius: 8, x: 0, y: 4)
                    .disabled(isLoading)
                    .onTapGesture {
                        // Ensure button is tappable
                        if !isLoading {
                            // The SignInWithAppleButton handles its own tap, but we ensure it's enabled
                        }
                    }
                    
                    // Continue as Guest Button
                    Button(action: {
                        continueAsGuest()
                    }) {
                        Text("Continue as Guest")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.7))
                    }
                    .padding(.top, 10)
                    .disabled(isLoading)
                    .buttonStyle(PlainButtonStyle())
                }
                .padding(.horizontal, 40)
                
                Spacer()
                
                // Loading indicator
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(1.5)
                        .padding(.bottom, 40)
                }
            }
        }
        .alert("Sign In Error", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage ?? "An unknown error occurred")
        }
        .onAppear {
            // Check if already authenticated
            if firebaseAuth.isAuthenticated || gameCenterService.isAuthenticated || appleSignInService.isSignedIn {
                navigateToMainMenu()
            }
        }
    }
    
    // MARK: - Sign In Handlers
    
    private func handleGameCenterSignIn() {
        isLoading = true
        errorMessage = nil
        
        gameCenterService.signIn { success, error in
            DispatchQueue.main.async {
                self.isLoading = false
                
                if success {
                    // Sign in to Firebase with Game Center
                    self.firebaseAuth.signInWithGameCenter { success, error in
                        DispatchQueue.main.async {
                            if success {
                                self.navigateToMainMenu()
                            } else {
                                // Even if Firebase fails, allow Game Center sign in
                                // Firebase will work once SDK is configured
                                self.navigateToMainMenu()
                            }
                        }
                    }
                } else {
                    self.errorMessage = error?.localizedDescription ?? "Failed to sign in with Game Center"
                    self.showError = true
                }
            }
        }
    }
    
    private func handleAppleSignIn(result: Result<ASAuthorization, Error>) {
        isLoading = true
        errorMessage = nil
        
        switch result {
        case .success(let authorization):
            if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
                // Update Apple Sign In Service state
                appleSignInService.loadSavedUser()
                
                // Sign in to Firebase with Apple
                firebaseAuth.signInWithApple(credential: appleIDCredential) { success, error in
                    DispatchQueue.main.async {
                        self.isLoading = false
                        
                        if success {
                            self.navigateToMainMenu()
                        } else {
                            // Even if Firebase fails, allow Apple sign in
                            // Firebase will work once SDK is configured
                            // The AppleSignInService already handles the credential
                            self.navigateToMainMenu()
                        }
                    }
                }
            } else {
                isLoading = false
                errorMessage = "Failed to get Apple ID credential"
                showError = true
            }
        case .failure(let error):
            isLoading = false
            errorMessage = error.localizedDescription
            showError = true
        }
    }
    
    private func continueAsGuest() {
        // Mark that user chose to continue as guest
        UserDefaults.standard.set(true, forKey: "hasSignedInBefore")
        
        // Update screen state on main thread
        DispatchQueue.main.async {
            self.gameState.currentScreen = .mainMenu
        }
    }
    
    private func navigateToMainMenu() {
        // Mark that user has signed in
        UserDefaults.standard.set(true, forKey: "hasSignedInBefore")
        
        // Update screen state on main thread
        DispatchQueue.main.async {
            self.gameState.currentScreen = .mainMenu
        }
    }
}

// MARK: - Stars Background View

struct StarsBackgroundView: View {
    @State private var stars: [Star] = []
    
    struct Star {
        var x: CGFloat
        var y: CGFloat
        var size: CGFloat
        var opacity: Double
    }
    
    init() {
        // Generate random stars
        _stars = State(initialValue: (0..<50).map { _ in
            Star(
                x: CGFloat.random(in: 0...1),
                y: CGFloat.random(in: 0...1),
                size: CGFloat.random(in: 1...3),
                opacity: Double.random(in: 0.3...1.0)
            )
        })
    }
    
    var body: some View {
        GeometryReader { geometry in
            ForEach(0..<stars.count, id: \.self) { index in
                Circle()
                    .fill(Color.white)
                    .frame(width: stars[index].size, height: stars[index].size)
                    .opacity(stars[index].opacity)
                    .position(
                        x: stars[index].x * geometry.size.width,
                        y: stars[index].y * geometry.size.height
                    )
            }
        }
    }
}

// MARK: - Preview

#Preview {
    LandingView(gameState: GameStateManager())
}

