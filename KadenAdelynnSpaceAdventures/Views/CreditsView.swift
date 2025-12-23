//
//  CreditsView.swift
//  KadenAdelynnSpaceAdventures
//
//  Credits and Attribution screen
//

import SwiftUI

struct CreditsView: View {
    @EnvironmentObject var gameState: GameStateManager
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: colorScheme == .dark ? 
                    [.black.opacity(0.95), .gray.opacity(0.8), .purple.opacity(0.6)] :
                    [.blue.opacity(0.9), .purple.opacity(0.7), .blue.opacity(0.8)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Button(action: {
                        gameState.currentScreen = .settings
                    }) {
                        Image(systemName: "chevron.left.circle.fill")
                            .font(.title)
                            .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                            .shadow(color: (colorScheme == .dark ? Color.black : Color.white).opacity(0.5), radius: 2)
                    }
                    .accessibilityLabel("Back to Settings")
                    .accessibilityHint("Double tap to return to settings")
                    
                    Spacer()
                    
                    Text("Credits & Attribution")
                        .font(AccessibilityHelper.scaledFont(size: 28, weight: .bold))
                        .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                        .shadow(color: (colorScheme == .dark ? Color.black : Color.white).opacity(0.5), radius: 2)
                        .accessibilityAddTraits(.isHeader)
                    
                    Spacer()
                    
                    // Spacer for symmetry
                    Image(systemName: "chevron.left.circle.fill")
                        .font(.title)
                        .foregroundColor(.clear)
                }
                .padding(.top, 60)
                .padding(.horizontal)
                .padding(.bottom, 20)
                
                // Content
                ScrollView {
                    VStack(spacing: 25) {
                        // Game Info
                        CreditsSection(title: "Game Information", icon: "gamecontroller.fill") {
                            VStack(alignment: .leading, spacing: 12) {
                                CreditsRow(label: "Game", value: "Kaden & Adelynn Space Adventures")
                                CreditsRow(label: "Version", value: "1.0")
                                CreditsRow(label: "Developer", value: "Bradley Virtual Solutions, LLC")
                                CreditsRow(label: "Copyright", value: "© \(Calendar.current.component(.year, from: Date()))")
                            }
                        }
                        
                        // Third-Party Assets
                        CreditsSection(title: "Third-Party Assets", icon: "photo.fill") {
                            VStack(alignment: .leading, spacing: 20) {
                                // Boss Ships
                                AttributionCard(
                                    title: "Boss Ship Sprites",
                                    creator: "Serpentarius game",
                                    license: "CC-BY-SA 3.0",
                                    source: "OpenGameArt.org",
                                    url: "https://opengameart.org/content/boss-ships",
                                    description: "Boss ship sprites used in boss battles"
                                )
                                
                                // Music
                                AttributionCard(
                                    title: "Background Music",
                                    creator: "Various Artists",
                                    license: "CC0 (Public Domain)",
                                    source: "OpenGameArt.org",
                                    url: "https://opengameart.org",
                                    description: "Menu, gameplay, and boss battle music tracks"
                                )
                                
                            }
                        }
                        
                        // Original Assets
                        CreditsSection(title: "Original Assets", icon: "paintbrush.fill") {
                            VStack(alignment: .leading, spacing: 12) {
                                CreditsRow(label: "Character Images", value: "Generated using ChatGPT/DALL-E")
                                CreditsRow(label: "Player Spaceship Graphics", value: "Generated using ChatGPT/DALL-E")
                                CreditsRow(label: "Enemy Ship Graphics", value: "Generated using ChatGPT/DALL-E")
                                CreditsRow(label: "Game Code", value: "Original work")
                                CreditsRow(label: "UI Design", value: "Original work")
                                CreditsRow(label: "Game Mechanics", value: "Original work")
                            }
                        }
                        
                        // Technologies
                        CreditsSection(title: "Technologies", icon: "gearshape.fill") {
                            VStack(alignment: .leading, spacing: 12) {
                                CreditsRow(label: "Framework", value: "SwiftUI")
                                CreditsRow(label: "Game Engine", value: "SpriteKit")
                                CreditsRow(label: "Platform", value: "iOS")
                                CreditsRow(label: "Icons", value: "SF Symbols (Apple)")
                            }
                        }
                        
                        // License Information
                        CreditsSection(title: "License Information", icon: "doc.text.fill") {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("This game uses assets licensed under Creative Commons and public domain licenses. All third-party assets are properly attributed above.")
                                    .font(AccessibilityHelper.scaledFont(size: 14, weight: .regular))
                                    .foregroundColor(colorScheme == .dark ? Color.white.opacity(0.8) : Color.black.opacity(0.8))
                                    .padding(.vertical, 8)
                                
                                Text("For questions about asset licensing or to report missing attributions, please contact us through the app settings.")
                                    .font(AccessibilityHelper.scaledFont(size: 14, weight: .regular))
                                    .foregroundColor(colorScheme == .dark ? Color.white.opacity(0.7) : Color.black.opacity(0.7))
                                    .padding(.vertical, 8)
                            }
                        }
                    }
                    .padding()
                }
            }
        }
    }
}

// Credits Section Component
struct CreditsSection<Content: View>: View {
    let title: String
    let icon: String
    let content: Content
    @Environment(\.colorScheme) var colorScheme
    
    init(title: String, icon: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.icon = icon
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack(spacing: 10) {
                Image(systemName: icon)
                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                    .accessibilityHidden(true)
                Text(title)
                    .font(AccessibilityHelper.scaledFont(size: 20, weight: .bold))
                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                    .accessibilityAddTraits(.isHeader)
            }
            
            content
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(
                            LinearGradient(
                                colors: [.cyan.opacity(0.3), .blue.opacity(0.3)],
                                startPoint: .leading,
                                endPoint: .trailing
                            ),
                            lineWidth: 1
                        )
                )
        )
    }
}

// Credits Row Component
struct CreditsRow: View {
    let label: String
    let value: String
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        HStack {
            Text(label + ":")
                .font(AccessibilityHelper.scaledFont(size: 14, weight: .semibold))
                .foregroundColor(colorScheme == .dark ? Color.white.opacity(0.9) : Color.black.opacity(0.9))
            Spacer()
            Text(value)
                .font(AccessibilityHelper.scaledFont(size: 14, weight: .regular))
                .foregroundColor(colorScheme == .dark ? Color.white.opacity(0.7) : Color.black.opacity(0.7))
                .multilineTextAlignment(.trailing)
        }
    }
}

// Attribution Card Component
struct AttributionCard: View {
    let title: String
    let creator: String
    let license: String
    let source: String
    let url: String?
    let description: String
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(AccessibilityHelper.scaledFont(size: 16, weight: .bold))
                .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
            
            if !description.isEmpty {
                Text(description)
                    .font(AccessibilityHelper.scaledFont(size: 13, weight: .regular))
                    .foregroundColor(colorScheme == .dark ? Color.white.opacity(0.8) : Color.black.opacity(0.8))
            }
            
            Divider()
                .background(Color.white.opacity(0.2))
            
            VStack(alignment: .leading, spacing: 6) {
                CreditsRow(label: "Creator", value: creator)
                CreditsRow(label: "License", value: license)
                CreditsRow(label: "Source", value: source)
                
                if let url = url {
                    Link(destination: URL(string: url)!) {
                        HStack {
                            Text("View Source")
                                .font(AccessibilityHelper.scaledFont(size: 14, weight: .medium))
                            Image(systemName: "arrow.up.right.square")
                                .font(.system(size: 12))
                        }
                        .foregroundColor(.blue)
                    }
                    .padding(.top, 4)
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(colorScheme == .dark ? Color.white.opacity(0.1) : Color.black.opacity(0.05))
        )
    }
}

