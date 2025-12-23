//
//  AdaptiveColors.swift
//  KadenAdelynnSpaceAdventures
//
//  Adaptive colors for light and dark mode support
//

import SwiftUI

extension Color {
    // Text colors
    static var adaptiveText: Color {
        Color.primary
    }
    
    static var adaptiveSecondaryText: Color {
        Color.secondary
    }
    
    // Background colors
    static var adaptiveBackground: Color {
        Color(UIColor.systemBackground)
    }
    
    static var adaptiveSecondaryBackground: Color {
        Color(UIColor.secondarySystemBackground)
    }
    
    static var adaptiveTertiaryBackground: Color {
        Color(UIColor.tertiarySystemBackground)
    }
    
    // Card/Group background
    static var adaptiveGroupBackground: Color {
        Color(UIColor.systemGroupedBackground)
    }
    
    // Blue gradient for backgrounds (adapts to dark mode)
    static var adaptiveBlueGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color.blue.opacity(0.9),
                Color.blue.opacity(0.7),
                Color.blue.opacity(0.6)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    // Dark mode aware blue
    static var adaptiveBlue: Color {
        Color.blue
    }
    
    // Dark mode aware white/black
    static func adaptiveWhite(opacity: Double = 1.0) -> Color {
        Color.primary.opacity(opacity)
    }
    
    static func adaptiveBlack(opacity: Double = 1.0) -> Color {
        Color.primary.opacity(opacity)
    }
}

// Helper for text that needs to be visible on colored backgrounds
struct AdaptiveTextColor: ViewModifier {
    @Environment(\.colorScheme) var colorScheme
    
    func body(content: Content) -> some View {
        content
            .foregroundColor(colorScheme == .dark ? .white : .black)
    }
}

extension View {
    func adaptiveTextColor() -> some View {
        modifier(AdaptiveTextColor())
    }
}

