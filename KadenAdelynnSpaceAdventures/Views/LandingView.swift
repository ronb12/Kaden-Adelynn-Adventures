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
    @State private var pulse = false
    @State private var drift = false
    
    var body: some View {
        GeometryReader { geometry in
            let isCompact = geometry.size.height < 720
            let iconSize: CGFloat = isCompact ? 92 : 116
            
            ZStack {
                RadialGradient(
                    colors: [
                        Color(red: 0.12, green: 0.30, blue: 0.72).opacity(0.72),
                        Color(red: 0.07, green: 0.09, blue: 0.32).opacity(0.92),
                        Color(red: 0.02, green: 0.02, blue: 0.12)
                    ],
                    center: .topLeading,
                    startRadius: 30,
                    endRadius: max(geometry.size.width, geometry.size.height)
                )
                .ignoresSafeArea()
                
                StarsBackgroundView()
                    .ignoresSafeArea()
                
                Circle()
                    .fill(Color.cyan.opacity(0.18))
                    .frame(width: geometry.size.width * 0.95)
                    .blur(radius: 64)
                    .offset(x: -geometry.size.width * 0.34, y: -geometry.size.height * 0.36)
                
                Circle()
                    .fill(Color.pink.opacity(0.16))
                    .frame(width: geometry.size.width * 0.82)
                    .blur(radius: 58)
                    .offset(x: geometry.size.width * 0.38, y: geometry.size.height * 0.22)
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: isCompact ? 22 : 30) {
                        Spacer(minLength: isCompact ? 28 : 56)
                        
                        splashHero(iconSize: iconSize, isCompact: isCompact)
                        
                        signInPanel(isCompact: isCompact)
                            .padding(.horizontal, 24)
                        
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(1.35)
                                .padding(.top, 4)
                        }
                        
                        Spacer(minLength: 30)
                    }
                    .frame(minHeight: geometry.size.height)
                }
            }
            .onAppear {
                pulse = true
                drift = true
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
    
    @ViewBuilder
    private func splashHero(iconSize: CGFloat, isCompact: Bool) -> some View {
        VStack(spacing: isCompact ? 14 : 18) {
            ZStack {
                OrbitRing()
                    .frame(width: iconSize + 82, height: iconSize + 82)
                    .rotationEffect(.degrees(drift ? 360 : 0))
                    .animation(.linear(duration: 18).repeatForever(autoreverses: false), value: drift)
                
                HStack(spacing: iconSize * 0.64) {
                    CharacterBadge(imageName: "kaden_character", color: .cyan, isCompact: isCompact)
                        .offset(y: drift ? -5 : 5)
                    CharacterBadge(imageName: "adelynn_character", color: .pink, isCompact: isCompact)
                        .offset(y: drift ? 5 : -5)
                }
                .animation(.easeInOut(duration: 2.2).repeatForever(autoreverses: true), value: drift)
                
                Image("AppIconImage")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: iconSize, height: iconSize)
                    .clipShape(RoundedRectangle(cornerRadius: iconSize * 0.22, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: iconSize * 0.22, style: .continuous)
                            .stroke(
                                LinearGradient(
                                    colors: [.white.opacity(0.8), .cyan.opacity(0.45), .pink.opacity(0.45)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 2
                            )
                    )
                    .shadow(color: .cyan.opacity(pulse ? 0.55 : 0.28), radius: pulse ? 28 : 16, x: 0, y: 0)
                    .shadow(color: .black.opacity(0.58), radius: 20, x: 0, y: 12)
                    .scaleEffect(pulse ? 1.035 : 0.995)
                    .animation(.easeInOut(duration: 1.7).repeatForever(autoreverses: true), value: pulse)
            }
            .frame(height: iconSize + 92)
            
            VStack(spacing: 6) {
                Text("Kaden & Adelynn")
                    .font(.system(size: isCompact ? 36 : 44, weight: .heavy, design: .rounded))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.cyan, .white, .pink],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                    .shadow(color: .cyan.opacity(0.45), radius: 10, x: 0, y: 0)
                
                HStack(spacing: 8) {
                    Image(systemName: "sparkles")
                    Text("Space Adventures")
                    Image(systemName: "sparkles")
                }
                .font(.system(size: isCompact ? 18 : 22, weight: .bold, design: .rounded))
                .foregroundColor(.white.opacity(0.92))
                .lineLimit(1)
                .minimumScaleFactor(0.78)
            }
            .padding(.horizontal, 22)
        }
    }
    
    @ViewBuilder
    private func signInPanel(isCompact: Bool) -> some View {
        VStack(spacing: 14) {
            HStack(spacing: 10) {
                Label("Stars", systemImage: "star.fill")
                Divider()
                    .frame(height: 18)
                    .overlay(Color.white.opacity(0.28))
                Label("Ships", systemImage: "paperplane.fill")
                Divider()
                    .frame(height: 18)
                    .overlay(Color.white.opacity(0.28))
                Label("Power", systemImage: "bolt.fill")
            }
            .font(.system(size: 13, weight: .bold, design: .rounded))
            .foregroundColor(.white.opacity(0.82))
            .lineLimit(1)
            .minimumScaleFactor(0.72)
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(Color.white.opacity(0.11), in: Capsule())
            .overlay(
                Capsule()
                    .stroke(Color.white.opacity(0.18), lineWidth: 1)
            )
            
            VStack(spacing: isCompact ? 13 : 16) {
                Text("Save the galaxy together")
                    .font(.system(size: 20, weight: .heavy, design: .rounded))
                    .foregroundColor(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.78)
                
                Text("Sign in to sync scores, stars, ships, and upgrades.")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .multilineTextAlignment(.center)
                    .foregroundColor(.white.opacity(0.72))
                    .lineLimit(2)
                    .minimumScaleFactor(0.82)
                
                Button(action: {
                    handleGameCenterSignIn()
                }) {
                    HStack(spacing: 10) {
                        Image(systemName: "gamecontroller.fill")
                            .font(.title3)
                        Text("Continue with Game Center")
                            .font(.headline)
                            .lineLimit(1)
                            .minimumScaleFactor(0.76)
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(
                        LinearGradient(
                            colors: [
                                Color(red: 0.07, green: 0.82, blue: 0.66),
                                Color(red: 0.04, green: 0.56, blue: 0.95)
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(Color.white.opacity(0.26), lineWidth: 1)
                    )
                    .shadow(color: .cyan.opacity(0.32), radius: 16, x: 0, y: 8)
                }
                .disabled(isLoading)
                
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
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .shadow(color: .black.opacity(0.26), radius: 12, x: 0, y: 6)
                .disabled(isLoading)
                
                Button(action: {
                    continueAsGuest()
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.right.circle.fill")
                        Text("Continue as Guest")
                            .font(.system(size: 15, weight: .bold, design: .rounded))
                    }
                    .foregroundColor(.white.opacity(0.82))
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                }
                .disabled(isLoading)
                .buttonStyle(PlainButtonStyle())
            }
            .padding(.horizontal, 22)
            .padding(.vertical, 22)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .stroke(Color.white.opacity(0.18), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.32), radius: 24, x: 0, y: 18)
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
        var speed: Double
    }
    
    init() {
        // Generate random stars
        _stars = State(initialValue: (0..<50).map { _ in
            Star(
                x: CGFloat.random(in: 0...1),
                y: CGFloat.random(in: 0...1),
                size: CGFloat.random(in: 1...3),
                opacity: Double.random(in: 0.3...1.0),
                speed: Double.random(in: 0.7...1.7)
            )
        })
    }
    
    var body: some View {
        TimelineView(.animation) { timeline in
            GeometryReader { geometry in
                let time = timeline.date.timeIntervalSinceReferenceDate
                
                ForEach(0..<stars.count, id: \.self) { index in
                    let twinkle = 0.62 + 0.38 * sin(time * stars[index].speed + Double(index))
                    
                    Circle()
                        .fill(Color.white)
                        .frame(width: stars[index].size, height: stars[index].size)
                        .opacity(stars[index].opacity * twinkle)
                        .position(
                            x: stars[index].x * geometry.size.width,
                            y: stars[index].y * geometry.size.height
                        )
                }
                
                ForEach(0..<8, id: \.self) { index in
                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [.white.opacity(0.0), .white.opacity(0.46), .cyan.opacity(0.0)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: 54, height: 1.6)
                        .rotationEffect(.degrees(-18))
                        .offset(
                            x: ((time * 22) + Double(index * 83)).truncatingRemainder(dividingBy: geometry.size.width + 130) - 80,
                            y: CGFloat(index) * geometry.size.height / 7.0
                        )
                        .opacity(0.32)
                }
            }
        }
    }
}

private struct OrbitRing: View {
    var body: some View {
        ZStack {
            Circle()
                .strokeBorder(
                    AngularGradient(
                        colors: [.cyan.opacity(0.0), .cyan.opacity(0.75), .pink.opacity(0.55), .cyan.opacity(0.0)],
                        center: .center
                    ),
                    lineWidth: 2
                )
                .opacity(0.78)
            
            Circle()
                .trim(from: 0.06, to: 0.17)
                .stroke(Color.white.opacity(0.86), style: StrokeStyle(lineWidth: 3, lineCap: .round))
                .rotationEffect(.degrees(28))
            
            Circle()
                .trim(from: 0.58, to: 0.68)
                .stroke(Color.pink.opacity(0.72), style: StrokeStyle(lineWidth: 3, lineCap: .round))
                .rotationEffect(.degrees(16))
        }
    }
}

private struct CharacterBadge: View {
    let imageName: String
    let color: Color
    let isCompact: Bool
    
    var body: some View {
        Image(imageName)
            .resizable()
            .scaledToFit()
            .frame(width: isCompact ? 58 : 70, height: isCompact ? 58 : 70)
            .clipShape(Circle())
            .padding(5)
            .background(
                Circle()
                    .fill(Color.black.opacity(0.22))
                    .overlay(
                        Circle()
                            .stroke(color.opacity(0.72), lineWidth: 2)
                    )
            )
            .shadow(color: color.opacity(0.42), radius: 12, x: 0, y: 0)
            .shadow(color: .black.opacity(0.34), radius: 8, x: 0, y: 6)
    }
}

// MARK: - Preview

#Preview {
    LandingView(gameState: GameStateManager())
}
