//
//  AccessibilityHelper.swift
//  KadenAdelynnSpaceAdventures
//
//  Accessibility utilities for VoiceOver, Dynamic Type, and Reduced Motion
//

import SwiftUI
import UIKit

struct AccessibilityHelper {
    // Check if reduced motion is enabled
    static var isReduceMotionEnabled: Bool {
        UIAccessibility.isReduceMotionEnabled
    }
    
    // Check if VoiceOver is running
    static var isVoiceOverRunning: Bool {
        UIAccessibility.isVoiceOverRunning
    }
    
    // Get scaled font for Dynamic Type
    static func scaledFont(size: CGFloat, weight: Font.Weight = .regular, design: Font.Design = .default) -> Font {
        let font = UIFont.systemFont(ofSize: size, weight: weight.uiFontWeight)
        let metrics = UIFontMetrics.default
        let scaledFont = metrics.scaledFont(for: font)
        return Font(scaledFont)
    }
    
    // Animation that respects reduced motion
    static func animation(_ baseAnimation: Animation = .default, value: some Equatable) -> Animation {
        if isReduceMotionEnabled {
            return .linear(duration: 0)
        }
        return baseAnimation
    }
    
    // Animation modifier that respects reduced motion
    static func withAnimation<T>(_ animation: Animation = .default, _ body: () throws -> T) rethrows -> T {
        if isReduceMotionEnabled {
            return try body()
        }
        return try SwiftUI.withAnimation(animation, body)
    }
}

extension Font.Weight {
    var uiFontWeight: UIFont.Weight {
        switch self {
        case .ultraLight: return .ultraLight
        case .thin: return .thin
        case .light: return .light
        case .regular: return .regular
        case .medium: return .medium
        case .semibold: return .semibold
        case .bold: return .bold
        case .heavy: return .heavy
        case .black: return .black
        default: return .regular
        }
    }
}

// View modifier for accessibility labels with hint and traits
struct AccessibilityLabelModifier: ViewModifier {
    let label: String
    let hint: String?
    let traits: AccessibilityTraits?
    
    init(_ label: String, hint: String? = nil, traits: AccessibilityTraits? = nil) {
        self.label = label
        self.hint = hint
        self.traits = traits
    }
    
    func body(content: Content) -> some View {
        var view = content.accessibilityLabel(label)
        if let hint = hint, !hint.isEmpty {
            view = view.accessibilityHint(hint)
        }
        if let traits = traits {
            view = view.accessibilityAddTraits(traits)
        }
        return view
    }
}

extension View {
    func accessibilityLabelModifier(_ label: String, hint: String? = nil, traits: AccessibilityTraits? = nil) -> some View {
        modifier(AccessibilityLabelModifier(label, hint: hint, traits: traits))
    }
}

