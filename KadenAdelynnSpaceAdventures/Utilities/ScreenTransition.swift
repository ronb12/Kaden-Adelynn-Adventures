//
//  ScreenTransition.swift
//  KadenAdelynnSpaceAdventures
//
//  Screen transition animations
//

import SwiftUI

extension AnyTransition {
    static var slideInOut: AnyTransition {
        .asymmetric(
            insertion: .move(edge: .trailing).combined(with: .opacity),
            removal: .move(edge: .leading).combined(with: .opacity)
        )
    }
    
    static var fadeInOut: AnyTransition {
        .asymmetric(
            insertion: .opacity,
            removal: .opacity
        )
    }
    
    static var scaleInOut: AnyTransition {
        .asymmetric(
            insertion: .scale.combined(with: .opacity),
            removal: .scale.combined(with: .opacity)
        )
    }
}

struct TransitionModifier: ViewModifier {
    let transition: AnyTransition
    
    func body(content: Content) -> some View {
        content
            .transition(transition)
            .animation(.easeInOut(duration: 0.3), value: UUID())
    }
}

extension View {
    func withTransition(_ transition: AnyTransition) -> some View {
        modifier(TransitionModifier(transition: transition))
    }
}

