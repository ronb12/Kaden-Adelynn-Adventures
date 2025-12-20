//
//  AchievementNotificationView.swift
//  KadenAdelynnSpaceAdventures
//
//  Achievement unlock notification
//

import SwiftUI

struct AchievementNotificationView: View {
    @ObservedObject var achievementManager: AchievementManager
    @State private var showNotification = false
    
    var body: some View {
        if showNotification, let achievement = achievementManager.recentUnlock {
            VStack {
                HStack(spacing: 15) {
                    Text(achievement.icon)
                        .font(.system(size: 40))
                    
                    VStack(alignment: .leading, spacing: 5) {
                        Text("Achievement Unlocked!")
                            .font(.caption)
                            .foregroundColor(.yellow.opacity(0.8))
                        
                        Text(achievement.name)
                            .font(.headline)
                            .foregroundColor(.white)
                        
                        Text(achievement.description)
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                    }
                    
                    Spacer()
                }
                .padding()
                .background(
                    LinearGradient(
                        colors: [.blue.opacity(0.8), .purple.opacity(0.8)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(12)
                .shadow(color: .yellow.opacity(0.5), radius: 10)
                .padding(.horizontal)
                .padding(.top, 50)
                
                Spacer()
            }
            .transition(.move(edge: .top).combined(with: .opacity))
            .onAppear {
                showNotification = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    withAnimation {
                        showNotification = false
                    }
                    achievementManager.recentUnlock = nil
                }
            }
        }
    }
}

