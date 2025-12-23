//
//  ToastView.swift
//  KadenAdelynnSpaceAdventures
//
//  Reusable toast notification component
//

import SwiftUI

struct ToastView: View {
    let message: String
    let type: ToastType
    @Binding var isShowing: Bool
    
    enum ToastType {
        case success
        case error
        case info
        
        var color: Color {
            switch self {
            case .success: return .green
            case .error: return .red
            case .info: return .blue
            }
        }
        
        var icon: String {
            switch self {
            case .success: return "checkmark.circle.fill"
            case .error: return "xmark.circle.fill"
            case .info: return "info.circle.fill"
            }
        }
    }
    
    var body: some View {
        if isShowing {
            HStack(spacing: 12) {
                Image(systemName: type.icon)
                    .font(.title2)
                Text(message)
                    .font(.headline)
                    .foregroundColor(.white)
            }
            .padding()
            .background(type.color.opacity(0.9))
            .cornerRadius(12)
            .shadow(radius: 10)
            .padding(.horizontal, 20)
            .transition(.move(edge: .top).combined(with: .opacity))
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isShowing)
        }
    }
}

struct ToastModifier: ViewModifier {
    @Binding var toast: ToastMessage?
    
    func body(content: Content) -> some View {
        ZStack {
            content
            
            if let toast = toast {
                VStack {
                    ToastView(message: toast.message, type: toast.type, isShowing: Binding(
                        get: { self.toast != nil },
                        set: { if !$0 { self.toast = nil } }
                    ))
                    Spacer()
                }
                .padding(.top, 60)
            }
        }
    }
}

struct ToastMessage {
    let message: String
    let type: ToastView.ToastType
    let duration: TimeInterval
    
    init(_ message: String, type: ToastView.ToastType = .success, duration: TimeInterval = 2.0) {
        self.message = message
        self.type = type
        self.duration = duration
    }
}

extension View {
    func toast(_ toast: Binding<ToastMessage?>) -> some View {
        modifier(ToastModifier(toast: toast))
    }
}

