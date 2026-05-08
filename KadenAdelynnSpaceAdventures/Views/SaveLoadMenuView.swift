//
//  SaveLoadMenuView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct SaveLoadMenuView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var saveSlots: [SaveSlot] = []
    @State private var toast: ToastMessage? = nil
    @State private var isLoading: Bool = false
    
    struct SaveSlot: Identifiable {
        let id: Int
        var score: Int
        var wave: Int
        var level: Int
        var timestamp: Date?
        var isEmpty: Bool
    }
    
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        ZStack {
            // Blue background - adapts to dark mode
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
            .ignoresSafeArea()
            
            VStack {
                // Header
                HStack {
                    Button(action: {
                        gameState.currentScreen = .mainMenu
                    }) {
                        HStack(spacing: 5) {
                            Image(systemName: "chevron.left")
                            Text("Back")
                        }
                        .font(.headline)
                        .foregroundColor(.black)
                        .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.white.opacity(0.2))
                        .cornerRadius(8)
                    }
                    
                    Spacer()
                    
                    Text("💾 Save/Load")
                        .font(.largeTitle)
                        .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                        .shadow(color: (colorScheme == .dark ? Color.black : Color.white).opacity(0.5), radius: 2, x: 0, y: 1)
                    
                    Spacer()
                    
                    Button("✕") {
                        gameState.currentScreen = .mainMenu
                    }
                    .font(.title)
                    .foregroundColor(.black)
                    .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
                }
                .padding(.top, 60) // Safe area padding to avoid status bar
                .padding(.horizontal)
                .padding(.bottom, 10)
                
                // Save slots
                ScrollView {
                    VStack(spacing: 15) {
                        // Quick Save Button
                        Button(action: {
                            saveToSlot(1) // Quick save to slot 1
                        }) {
                            HStack {
                                Image(systemName: "square.and.arrow.down.fill")
                                Text("Quick Save (Slot 1)")
                            }
                            .font(.headline)
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(
                                LinearGradient(
                                    colors: [Color.blue, Color.cyan],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                        }
                        .padding(.horizontal)
                        
                        ForEach(saveSlots) { slot in
                            SaveSlotCard(slot: slot) {
                                loadSlot(slot.id)
                            } onSave: {
                                saveToSlot(slot.id)
                            } onDelete: {
                                deleteSlot(slot.id)
                            }
                        }
                    }
                    .padding()
                }
            }
        }
        .onAppear {
            loadSaveSlots()
        }
        .toast($toast)
        .overlay(
            Group {
                if isLoading {
                    ZStack {
                        Color.black.opacity(0.3)
                            .ignoresSafeArea()
                        ProgressView()
                            .scaleEffect(1.5)
                            .tint(.white)
                    }
                }
            }
        )
    }
    
    private func loadSaveSlots() {
        saveSlots = (1...5).map { index in
            if let data = UserDefaults.standard.data(forKey: "saveSlot_\(index)"),
               let saveData = try? JSONDecoder().decode(SaveData.self, from: data) {
                return SaveSlot(
                    id: index,
                    score: saveData.score,
                    wave: saveData.wave,
                    level: saveData.level,
                    timestamp: saveData.timestamp,
                    isEmpty: false
                )
            } else {
                return SaveSlot(id: index, score: 0, wave: 0, level: 0, timestamp: nil, isEmpty: true)
            }
        }
    }
    
    private func loadSlot(_ slotId: Int) {
        isLoading = true
        HapticManager.shared.buttonPress()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            if let data = UserDefaults.standard.data(forKey: "saveSlot_\(slotId)"),
               let saveData = try? JSONDecoder().decode(SaveData.self, from: data) {
                gameState.score = saveData.score
                gameState.wave = saveData.wave
                gameState.level = saveData.level
                gameState.lives = saveData.lives
                gameState.currentScreen = .playing
                HapticManager.shared.saveSuccess()
                toast = ToastMessage("✅ Game loaded from slot \(slotId)!", type: .success)
            } else {
                HapticManager.shared.saveError()
                toast = ToastMessage("❌ Failed to load game", type: .error)
            }
            isLoading = false
        }
    }
    
    private func saveToSlot(_ slotId: Int) {
        isLoading = true
        HapticManager.shared.buttonPress()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            let saveData = SaveData(
                score: gameState.score,
                wave: gameState.wave,
                level: gameState.level,
                lives: gameState.lives,
                timestamp: Date()
            )
            
            if let encoded = try? JSONEncoder().encode(saveData) {
                UserDefaults.standard.set(encoded, forKey: "saveSlot_\(slotId)")
                loadSaveSlots() // Refresh the list
                HapticManager.shared.saveSuccess()
                toast = ToastMessage("✅ Game saved to slot \(slotId)!", type: .success)
            } else {
                HapticManager.shared.saveError()
                toast = ToastMessage("❌ Failed to save game", type: .error)
            }
            isLoading = false
            
            // Auto-dismiss toast
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                toast = nil
            }
        }
    }
    
    private func deleteSlot(_ slotId: Int) {
        HapticManager.shared.buttonPress()
        UserDefaults.standard.removeObject(forKey: "saveSlot_\(slotId)")
        loadSaveSlots()
        toast = ToastMessage("🗑️ Save slot \(slotId) deleted", type: .info)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            toast = nil
        }
    }
    
    struct SaveData: Codable {
        let score: Int
        let wave: Int
        let level: Int
        let lives: Int
        let timestamp: Date?
    }
}

struct SaveSlotCard: View {
    let slot: SaveLoadMenuView.SaveSlot
    let onLoad: () -> Void
    let onSave: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Slot \(slot.id)")
                    .font(.headline)
                    .foregroundColor(.black)
                
                Spacer()
                
                if !slot.isEmpty {
                    Button("Load", action: onLoad)
                        .buttonStyle(.bordered)
                        .tint(.blue)
                        .foregroundColor(.black)
                    
                    Button("Save", action: onSave)
                        .buttonStyle(.bordered)
                        .tint(.green)
                        .foregroundColor(.black)
                    
                    Button("Delete", action: onDelete)
                        .buttonStyle(.bordered)
                        .tint(.red)
                        .foregroundColor(.black)
                } else {
                    Button("Save", action: onSave)
                        .buttonStyle(.bordered)
                        .tint(.green)
                        .foregroundColor(.black)
                }
            }
            
            if slot.isEmpty {
                Text("Empty")
                    .foregroundColor(.black)
            } else {
                VStack(alignment: .leading, spacing: 5) {
                    Text("Score: \(slot.score)")
                    Text("Wave: \(slot.wave)")
                    Text("Level: \(slot.level)")
                    if let timestamp = slot.timestamp {
                        Text("Saved: \(timestamp, style: .relative)")
                    }
                }
                .font(.caption)
                .foregroundColor(.black)
            }
        }
        .padding()
        .background(Color.white.opacity(0.1))
        .cornerRadius(12)
    }
}

