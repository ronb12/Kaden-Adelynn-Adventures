//
//  SettingsView.swift
//  KadenAdelynnSpaceAdventures
//
//  Comprehensive settings view with all game features
//

import SwiftUI

struct SettingsView: View {
    @ObservedObject var gameState: GameStateManager
    @StateObject private var audioManager = AudioManager.shared
    @State private var musicEnabled = true
    @State private var soundEnabled = true
    @State private var musicVolume: Float = 0.5
    @State private var soundVolume: Float = 1.0
    @State private var hapticFeedback = true
    @State private var showFPS = false
    @State private var autoSave = true
    @State private var touchSensitivity: Float = 1.0
    @State private var showTutorial = false
    @State private var visualEffectsEnabled = true
    
    var body: some View {
        ZStack {
            // Animated background
            LinearGradient(
                colors: [.blue.opacity(0.9), .blue.opacity(0.7), .blue.opacity(0.6)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 25) {
                    // Header
                    VStack(spacing: 10) {
                        HStack {
                            Text("⚙️")
                                .font(.system(size: 50))
                            Text("Settings")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.black)
                                .shadow(color: .black.opacity(0.8), radius: 4, x: 0, y: 2)
                        }
                        
                        Text("Customize your gaming experience")
                            .font(.subheadline)
                            .foregroundColor(.black.opacity(0.8))
                    }
                    .padding(.top, 60) // Safe area padding
                    
                    // Game Settings Section
                    SettingsSection(title: "🎮 Game Settings", icon: "gamecontroller.fill") {
                        VStack(spacing: 15) {
                            // Difficulty
                            SettingRow(
                                title: "Difficulty",
                                icon: "chart.bar.fill"
                            ) {
                                Picker("", selection: $gameState.difficulty) {
                                    Text("🟢 Easy").tag("easy")
                                    Text("🟡 Medium").tag("medium")
                                    Text("🔴 Hard").tag("hard")
                                }
                                .pickerStyle(.segmented)
                                .onChange(of: gameState.difficulty) { _ in
                                    UserDefaults.standard.set(gameState.difficulty, forKey: "difficulty")
                                }
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            // Touch Sensitivity
                            SettingRow(
                                title: "Touch Sensitivity",
                                icon: "hand.draw.fill",
                                value: String(format: "%.1fx", touchSensitivity)
                            ) {
                                Slider(value: $touchSensitivity, in: 0.5...2.0, step: 0.1)
                                    .onChange(of: touchSensitivity) { newValue in
                                        UserDefaults.standard.set(newValue, forKey: "touchSensitivity")
                                    }
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            // Auto Save
                            SettingRow(
                                title: "Auto Save",
                                icon: "square.and.arrow.down.fill",
                                description: "Automatically save game progress"
                            ) {
                                Toggle("", isOn: $autoSave)
                                    .onChange(of: autoSave) { newValue in
                                        UserDefaults.standard.set(newValue, forKey: "autoSave")
                                    }
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            // Show FPS
                            SettingRow(
                                title: "Show FPS Counter",
                                icon: "speedometer",
                                description: "Display frames per second"
                            ) {
                                Toggle("", isOn: $showFPS)
                                    .onChange(of: showFPS) { newValue in
                                        UserDefaults.standard.set(newValue, forKey: "showFPS")
                                    }
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            // Reset Progress Button
                            Button(action: {
                                resetGameProgress()
                            }) {
                                HStack {
                                    Image(systemName: "arrow.counterclockwise")
                                    Text("Reset Game Progress")
                                        .fontWeight(.semibold)
                                }
                                .foregroundColor(.red)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red.opacity(0.2))
                                .cornerRadius(12)
                            }
                        }
                    }
                    
                    // Audio Settings Section
                    SettingsSection(title: "🔊 Audio Settings", icon: "speaker.wave.3.fill") {
                        VStack(spacing: 15) {
                            // Music Toggle
                            SettingRow(
                                title: "Background Music",
                                icon: "music.note"
                            ) {
                                Toggle("", isOn: $musicEnabled)
                                    .onChange(of: musicEnabled) { newValue in
                                        audioManager.setMusicEnabled(newValue)
                                    }
                            }
                            
                            if musicEnabled {
                                Divider()
                                    .background(Color.white.opacity(0.2))
                                
                                SettingRow(
                                    title: "Music Volume",
                                    icon: "speaker.wave.2.fill",
                                    value: "\(Int(musicVolume * 100))%"
                                ) {
                                    Slider(value: $musicVolume, in: 0...1)
                                        .onChange(of: musicVolume) { newValue in
                                            audioManager.setMusicVolume(newValue)
                                        }
                                }
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            // Sound Effects Toggle
                            SettingRow(
                                title: "Sound Effects",
                                icon: "speaker.2.fill"
                            ) {
                                Toggle("", isOn: $soundEnabled)
                                    .onChange(of: soundEnabled) { newValue in
                                        audioManager.setSoundEnabled(newValue)
                                    }
                            }
                            
                            if soundEnabled {
                                Divider()
                                    .background(Color.white.opacity(0.2))
                                
                                SettingRow(
                                    title: "Sound Volume",
                                    icon: "speaker.wave.1.fill",
                                    value: "\(Int(soundVolume * 100))%"
                                ) {
                                    Slider(value: $soundVolume, in: 0...1)
                                        .onChange(of: soundVolume) { newValue in
                                            audioManager.setSoundVolume(newValue)
                                        }
                                }
                            }
                        }
                    }
                    
                    // Controls Settings Section
                    SettingsSection(title: "🎯 Controls", icon: "hand.point.up.left.fill") {
                        VStack(spacing: 15) {
                            // Haptic Feedback
                            SettingRow(
                                title: "Haptic Feedback",
                                icon: "hand.tap.fill",
                                description: "Vibration on actions"
                            ) {
                                Toggle("", isOn: $hapticFeedback)
                                    .onChange(of: hapticFeedback) { newValue in
                                        UserDefaults.standard.set(newValue, forKey: "hapticFeedback")
                                    }
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            // Show Tutorial
                            SettingRow(
                                title: "Show Tutorial",
                                icon: "questionmark.circle.fill",
                                description: "Display tutorial on next game start"
                            ) {
                                Toggle("", isOn: $showTutorial)
                                    .onChange(of: showTutorial) { newValue in
                                        UserDefaults.standard.set(newValue, forKey: "showTutorial")
                                    }
                            }
                        }
                    }
                    
                    // Accessibility Settings Section
                    SettingsSection(title: "♿ Accessibility", icon: "accessibility.fill") {
                        VStack(spacing: 15) {
                            // Visual Effects Toggle
                            SettingRow(
                                title: "Visual Effects",
                                icon: "eye.fill",
                                description: "Disable screen flashes and shakes (recommended for photosensitive epilepsy)"
                            ) {
                                Toggle("", isOn: $visualEffectsEnabled)
                                    .onChange(of: visualEffectsEnabled) { newValue in
                                        UserDefaults.standard.set(newValue, forKey: "visualEffectsEnabled")
                                    }
                            }
                            
                            if !visualEffectsEnabled {
                                Text("⚠️ Screen flashes and shakes are disabled for your safety")
                                    .font(.caption)
                                    .foregroundColor(.orange)
                                    .padding(.horizontal)
                                    .padding(.top, 5)
                            }
                        }
                    }
                    
                    // Display Settings Section
                    SettingsSection(title: "📱 Display", icon: "display") {
                        VStack(spacing: 15) {
                            // Player Name
                            SettingRow(
                                title: "Player Name",
                                icon: "person.fill"
                            ) {
                                TextField("Enter name", text: $gameState.playerName)
                                    .textFieldStyle(.plain)
                                    .padding(8)
                                    .background(Color.white.opacity(0.1))
                                    .cornerRadius(8)
                                    .foregroundColor(.black)
                                    .onChange(of: gameState.playerName) { _ in
                                        gameState.savePlayerName()
                                    }
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            // Current Device Info
                            SettingRow(
                                title: "Device",
                                icon: "iphone",
                                value: UIDevice.current.model
                            ) {
                                EmptyView()
                            }
                        }
                    }
                    
                    // Data Management Section
                    SettingsSection(title: "💾 Data Management", icon: "externaldrive.fill") {
                        VStack(spacing: 15) {
                            // Export Data
                            Button(action: {
                                exportGameData()
                            }) {
                                HStack {
                                    Image(systemName: "square.and.arrow.up")
                                    Text("Export Game Data")
                                        .fontWeight(.semibold)
                                }
                                .foregroundColor(.blue)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue.opacity(0.2))
                                .cornerRadius(12)
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            // Clear Cache
                            Button(action: {
                                clearCache()
                            }) {
                                HStack {
                                    Image(systemName: "trash")
                                    Text("Clear Cache")
                                        .fontWeight(.semibold)
                                }
                                .foregroundColor(.orange)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.orange.opacity(0.2))
                                .cornerRadius(12)
                            }
                        }
                    }
                    
                    // Legal & Info Section
                    SettingsSection(title: "ℹ️ Information", icon: "info.circle.fill") {
                        VStack(spacing: 15) {
                            // Privacy Policy
                            Button(action: {
                                gameState.currentScreen = .privacyPolicy
                            }) {
                                HStack {
                                    Image(systemName: "lock.shield.fill")
                                    Text("Privacy Policy")
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                }
                                .foregroundColor(.black)
                                .padding()
                                .background(Color.white.opacity(0.1))
                                .cornerRadius(12)
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            // Terms of Service
                            Button(action: {
                                gameState.currentScreen = .termsOfService
                            }) {
                                HStack {
                                    Image(systemName: "doc.text.fill")
                                    Text("Terms of Service")
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                }
                                .foregroundColor(.black)
                                .padding()
                                .background(Color.white.opacity(0.1))
                                .cornerRadius(12)
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            // App Version
                            SettingRow(
                                title: "Version",
                                icon: "info.circle",
                                value: "1.0"
                            ) {
                                EmptyView()
                            }
                            
                            Divider()
                                .background(Color.white.opacity(0.2))
                            
                            // Created By
                            SettingRow(
                                title: "Created by",
                                icon: "person.circle.fill",
                                value: "Ronell Bradley"
                            ) {
                                EmptyView()
                            }
                        }
                    }
                    
                    // Back Button
                    Button("Back to Menu") {
                        gameState.currentScreen = .mainMenu
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        LinearGradient(
                            colors: [.blue, .purple],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
            }
        }
        .onAppear {
            loadSettings()
        }
    }
    
    private func loadSettings() {
        musicEnabled = UserDefaults.standard.bool(forKey: "musicEnabled")
        soundEnabled = UserDefaults.standard.bool(forKey: "soundEnabled")
        musicVolume = UserDefaults.standard.float(forKey: "musicVolume")
        soundVolume = UserDefaults.standard.float(forKey: "soundVolume")
        hapticFeedback = UserDefaults.standard.bool(forKey: "hapticFeedback")
        showFPS = UserDefaults.standard.bool(forKey: "showFPS")
        autoSave = UserDefaults.standard.bool(forKey: "autoSave")
        touchSensitivity = UserDefaults.standard.float(forKey: "touchSensitivity")
        showTutorial = UserDefaults.standard.bool(forKey: "showTutorial")
        
        // Load visual effects setting (default to true if not set)
        if UserDefaults.standard.object(forKey: "visualEffectsEnabled") == nil {
            visualEffectsEnabled = true
            UserDefaults.standard.set(true, forKey: "visualEffectsEnabled")
        } else {
            visualEffectsEnabled = UserDefaults.standard.bool(forKey: "visualEffectsEnabled")
        }
        
        // Set defaults if not set
        if musicVolume == 0 { musicVolume = 0.5 }
        if soundVolume == 0 { soundVolume = 1.0 }
        if touchSensitivity == 0 { touchSensitivity = 1.0 }
        if !UserDefaults.standard.bool(forKey: "hapticFeedbackSet") {
            hapticFeedback = true
            UserDefaults.standard.set(true, forKey: "hapticFeedback")
            UserDefaults.standard.set(true, forKey: "hapticFeedbackSet")
        }
        if !UserDefaults.standard.bool(forKey: "autoSaveSet") {
            autoSave = true
            UserDefaults.standard.set(true, forKey: "autoSave")
            UserDefaults.standard.set(true, forKey: "autoSaveSet")
        }
    }
    
    private func resetGameProgress() {
        // Show confirmation alert
        let alert = UIAlertController(
            title: "Reset Game Progress?",
            message: "This will delete all saved progress, scores, and achievements. This cannot be undone.",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Reset", style: .destructive) { _ in
            // Clear all game data
            UserDefaults.standard.removeObject(forKey: "walletCoins")
            UserDefaults.standard.removeObject(forKey: "highScores")
            UserDefaults.standard.removeObject(forKey: "achievements")
            UserDefaults.standard.removeObject(forKey: "gameStats")
            UserDefaults.standard.removeObject(forKey: "ownedChars")
            UserDefaults.standard.removeObject(forKey: "ownedShips")
            
            // Reset game state
            gameState.score = 0
            gameState.coins = 0
            gameState.wave = 1
            gameState.level = 1
        })
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootViewController = windowScene.windows.first?.rootViewController {
            rootViewController.present(alert, animated: true)
        }
    }
    
    private func exportGameData() {
        // Export game data as JSON
        let data: [String: Any] = [
            "coins": gameState.coins,
            "playerName": gameState.playerName,
            "difficulty": gameState.difficulty,
            "timestamp": Date().timeIntervalSince1970
        ]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: data, options: .prettyPrinted),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            let activityVC = UIActivityViewController(
                activityItems: [jsonString],
                applicationActivities: nil
            )
            
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let rootViewController = windowScene.windows.first?.rootViewController {
                rootViewController.present(activityVC, animated: true)
            }
        }
    }
    
    private func clearCache() {
        let alert = UIAlertController(
            title: "Clear Cache?",
            message: "This will clear temporary game data. Your progress will be saved.",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Clear", style: .destructive) { _ in
            // Clear cache (in a real app, this would clear image caches, etc.)
            URLCache.shared.removeAllCachedResponses()
        })
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootViewController = windowScene.windows.first?.rootViewController {
            rootViewController.present(alert, animated: true)
        }
    }
}

// Settings Section Container
struct SettingsSection<Content: View>: View {
    let title: String
    let icon: String
    let content: Content
    
    init(title: String, icon: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.icon = icon
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.cyan)
                Text(title)
                    .font(.headline)
                    .foregroundColor(.cyan)
            }
            .padding(.horizontal)
            
            VStack(spacing: 0) {
                content
            }
            .padding()
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
            .padding(.horizontal, 20)
        }
    }
}

// Setting Row Component
struct SettingRow<Content: View>: View {
    let title: String
    let icon: String
    var description: String?
    var value: String?
    let content: Content
    
    init(title: String, icon: String, description: String? = nil, value: String? = nil, @ViewBuilder content: () -> Content) {
        self.title = title
        self.icon = icon
        self.description = description
        self.value = value
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.cyan)
                    .frame(width: 24)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .foregroundColor(.white)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    if let description = description {
                        Text(description)
                            .foregroundColor(.white.opacity(0.6))
                            .font(.caption)
                    }
                }
                
                Spacer()
                
                if let value = value {
                    Text(value)
                        .foregroundColor(.white.opacity(0.8))
                        .font(.subheadline)
                }
                
                content
            }
        }
    }
}

import UIKit
