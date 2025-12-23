//
//  PrivacyPolicyView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct PrivacyPolicyView: View {
    @EnvironmentObject var gameState: GameStateManager
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        ZStack {
            Group {
                if colorScheme == .dark {
                    LinearGradient(
                        colors: [.black.opacity(0.95), .gray.opacity(0.8), .blue.opacity(0.6)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                } else {
                    LinearGradient(
                        colors: [.blue.opacity(0.9), .blue.opacity(0.7), .blue.opacity(0.6)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                }
            }
            .ignoresSafeArea(.all)
            
            VStack(spacing: 0) {
                // Header - Fixed at top
                HStack {
                    Button(action: {
                        gameState.currentScreen = .settings
                    }) {
                        HStack {
                            Image(systemName: "chevron.left")
                            Text("Back")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.white.opacity(0.2))
                        .cornerRadius(8)
                    }
                    
                    Spacer()
                    
                    Text("Privacy Policy")
                        .font(.title)
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.5), radius: 2, x: 0, y: 1)
                    
                    Spacer()
                    
                    // Spacer for balance
                    Color.clear
                        .frame(width: 60)
                }
                .padding(.top, 50) // Safe area padding
                .padding(.horizontal)
                .padding(.bottom, 10)
                .background(
                    LinearGradient(
                        colors: [.blue.opacity(0.9), .blue.opacity(0.7)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                
                // Content - Full page scrollable
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        Text("Last Updated: December 21, 2024")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                            .padding(.top, 5)
                            .padding(.bottom, 10)
                        
                        Text("Privacy Policy")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("Kaden & Adelynn Space Adventures (\"we,\" \"our,\" or \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile game.")
                            .foregroundColor(.white)
                        
                        Text("Information We Collect")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("• Game Progress: We collect your game progress, scores, achievements, and statistics to provide game functionality and cloud sync across your devices.\n\n• Player Name: We collect the gamer tag you create to display on leaderboards and in-game features.\n\n• Device Information: We may collect device type, operating system version, and app version for technical support and improvements.\n\n• CloudKit Data: If you sign in with Apple, your game data is synced using Apple's CloudKit service, which is subject to Apple's privacy policies.")
                            .foregroundColor(.white)
                        
                        Text("How We Use Your Information")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("• To provide and improve game functionality\n• To sync your progress across devices using iCloud\n• To display leaderboards and achievements\n• To provide customer support\n• To analyze game performance and fix bugs")
                            .foregroundColor(.white)
                        
                        Text("Data Storage and Security")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("Your game data is stored locally on your device and optionally synced to iCloud using Apple's CloudKit. We do not have direct access to your iCloud data. All data transmission is encrypted using Apple's secure infrastructure.")
                            .foregroundColor(.white)
                        
                        Text("Children's Privacy")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.")
                            .foregroundColor(.white)
                        
                        Text("Your Rights")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("You can delete your game data at any time through the Settings menu. You can also disable iCloud sync in your device settings. We do not sell or share your data with third parties.")
                            .foregroundColor(.white)
                        
                        Text("Contact Us")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("If you have questions about this Privacy Policy, please contact us through the app settings or support channels.")
                            .foregroundColor(.white)
                    }
                    .padding()
                    .padding(.bottom, 30) // Extra padding at bottom
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .ignoresSafeArea(.all)
    }
}
