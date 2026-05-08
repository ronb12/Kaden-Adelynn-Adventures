//
//  TermsOfServiceView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct TermsOfServiceView: View {
    @EnvironmentObject var gameState: GameStateManager
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        GeometryReader { geometry in
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
                    // Header - Blue extends all the way to top with no padding
                    ZStack(alignment: .top) {
                        LinearGradient(
                            colors: [.blue.opacity(0.9), .blue.opacity(0.7)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                        .frame(height: 100)
                        .frame(maxWidth: .infinity)
                        .ignoresSafeArea(.all, edges: .top)
                        
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
                            
                            Text("Terms of Service")
                                .font(.title)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.5), radius: 2, x: 0, y: 1)
                            
                            Spacer()
                            
                            // Spacer for balance
                            Color.clear
                                .frame(width: 60)
                        }
                        .padding(.top, 50) // Safe area padding for status bar
                        .padding(.horizontal)
                        .padding(.bottom, 10)
                        .frame(maxWidth: .infinity, maxHeight: 100, alignment: .top)
                    }
                    .frame(maxWidth: .infinity)
                    .offset(y: 0)
                
                // Content - Full page scrollable
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        Text("Last Updated: December 21, 2024")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                            .padding(.bottom, 10)
                        
                        Text("Terms of Service")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("By downloading, installing, or using Kaden & Adelynn Space Adventures (\"the Game\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, do not use the Game.")
                            .foregroundColor(.white)
                        
                        Text("1. Acceptance of Terms")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("By accessing or using the Game, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.")
                            .foregroundColor(.white)
                        
                        Text("2. License to Use")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("We grant you a limited, non-exclusive, non-transferable, revocable license to use the Game for personal, non-commercial purposes on your iOS device.")
                            .foregroundColor(.white)
                        
                        Text("3. User Conduct")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("You agree not to:\n• Use the Game for any illegal purpose\n• Attempt to hack, modify, or reverse engineer the Game\n• Use automated systems or bots to play the Game\n• Share or distribute your account with others\n• Use offensive or inappropriate gamer tags\n• Interfere with other players' enjoyment of the Game")
                            .foregroundColor(.white)
                        
                        Text("4. In-App Purchases")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("The Game may offer in-app purchases. All purchases are final and non-refundable unless required by law. Prices may vary by region.")
                            .foregroundColor(.white)
                        
                        Text("5. Intellectual Property")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("All content, graphics, code, and features of the Game are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws.")
                            .foregroundColor(.white)
                        
                        Text("6. Account and Data")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("You are responsible for maintaining the confidentiality of your account. We are not liable for any loss or damage resulting from unauthorized access to your account. Game progress may be lost if you delete the app or reset your device.")
                            .foregroundColor(.white)
                        
                        Text("7. Disclaimer of Warranties")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("The Game is provided \"as is\" without warranties of any kind. We do not guarantee that the Game will be uninterrupted, error-free, or free from viruses or other harmful components.")
                            .foregroundColor(.white)
                        
                        Text("8. Limitation of Liability")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Game.")
                            .foregroundColor(.white)
                        
                        Text("9. Changes to Terms")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("We reserve the right to modify these Terms at any time. Continued use of the Game after changes constitutes acceptance of the new Terms.")
                            .foregroundColor(.white)
                        
                        Text("10. Termination")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("We may terminate or suspend your access to the Game at any time, with or without cause, with or without notice, for any reason including violation of these Terms.")
                            .foregroundColor(.white)
                        
                        Text("11. Governing Law")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the Game is operated, without regard to conflict of law provisions.")
                            .foregroundColor(.white)
                        
                        Text("12. Contact Information")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.top, 10)
                        
                        Text("For questions about these Terms, please contact us through the app settings or support channels.")
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 30) // Extra padding at bottom
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .ignoresSafeArea(.all)
        .edgesIgnoringSafeArea(.all)
        }
    }
}
