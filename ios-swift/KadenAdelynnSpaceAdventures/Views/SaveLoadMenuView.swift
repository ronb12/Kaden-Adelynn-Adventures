//
//  SaveLoadMenuView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct SaveLoadMenuView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var saveSlots: [SaveSlot] = []
    
    struct SaveSlot: Identifiable {
        let id: Int
        var score: Int
        var wave: Int
        var level: Int
        var timestamp: Date?
        var isEmpty: Bool
    }
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack {
                // Header
                HStack {
                    Text("💾 Save/Load")
                        .font(.largeTitle)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button("✕") {
                        gameState.currentScreen = .mainMenu
                    }
                    .font(.title)
                    .foregroundColor(.white)
                }
                .padding()
                
                // Save slots
                ScrollView {
                    VStack(spacing: 15) {
                        ForEach(saveSlots) { slot in
                            SaveSlotCard(slot: slot) {
                                loadSlot(slot.id)
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
        if let data = UserDefaults.standard.data(forKey: "saveSlot_\(slotId)"),
           let saveData = try? JSONDecoder().decode(SaveData.self, from: data) {
            gameState.score = saveData.score
            gameState.wave = saveData.wave
            gameState.level = saveData.level
            gameState.lives = saveData.lives
            gameState.currentScreen = .playing
        }
    }
    
    private func deleteSlot(_ slotId: Int) {
        UserDefaults.standard.removeObject(forKey: "saveSlot_\(slotId)")
        loadSaveSlots()
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
    let onDelete: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Slot \(slot.id)")
                    .font(.headline)
                    .foregroundColor(.white)
                
                Spacer()
                
                if !slot.isEmpty {
                    Button("Load", action: onLoad)
                        .buttonStyle(.bordered)
                    
                    Button("Delete", action: onDelete)
                        .buttonStyle(.bordered)
                        .tint(.red)
                }
            }
            
            if slot.isEmpty {
                Text("Empty")
                    .foregroundColor(.gray)
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
                .foregroundColor(.white.opacity(0.8))
            }
        }
        .padding()
        .background(Color.white.opacity(0.1))
        .cornerRadius(12)
    }
}

