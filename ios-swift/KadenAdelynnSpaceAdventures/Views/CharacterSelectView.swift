//
//  CharacterSelectView.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced character selection view
//

import SwiftUI

struct CharacterSelectView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var ownedCharacters: Set<String> = []
    @State private var showToast = false
    @State private var toastMessage = ""
    
    struct Character {
        let id: String
        let icon: String
        let name: String
        let weapon: String
        let speed: String
        let strength: String
        let color1: Color
        let color2: Color
        let cost: Int
        let isDefault: Bool
    }
    
    let characters: [Character] = [
        Character(id: "kaden", icon: "🧑🏿‍🚀", name: "Kaden", weapon: "Laser", speed: "Medium", strength: "Medium", color1: .cyan, color2: .blue, cost: 0, isDefault: true),
        Character(id: "adelynn", icon: "👩‍🚀", name: "Adelynn", weapon: "Spread", speed: "High", strength: "Low", color1: .pink, color2: .purple, cost: 0, isDefault: true),
        Character(id: "hero3", icon: "🧑🏽‍🚀", name: "Orion", weapon: "Plasma", speed: "Medium", strength: "High", color1: .yellow, color2: .orange, cost: 150, isDefault: false),
        Character(id: "hero4", icon: "👩🏻‍🚀", name: "Lyra", weapon: "Lightning", speed: "High", strength: "Medium", color1: .green, color2: .blue, cost: 150, isDefault: false),
        Character(id: "hero5", icon: "🧔‍🚀", name: "Jax", weapon: "Shotgun", speed: "Low", strength: "High", color1: .gray, color2: .black, cost: 150, isDefault: false),
        Character(id: "hero6", icon: "👩🏾‍🚀", name: "Vega", weapon: "Homing", speed: "Medium", strength: "Medium", color1: .blue, color2: .cyan, cost: 150, isDefault: false),
        Character(id: "hero7", icon: "🧑🏼‍🚀", name: "Kael", weapon: "Railgun", speed: "Low", strength: "High", color1: .orange, color2: .yellow, cost: 150, isDefault: false),
        Character(id: "hero8", icon: "👩🏼‍🚀", name: "Nova", weapon: "Beam", speed: "High", strength: "Low", color1: .purple, color2: .pink, cost: 150, isDefault: false),
        Character(id: "hero9", icon: "🧑🏻‍🚀", name: "Rio", weapon: "Missile", speed: "Medium", strength: "High", color1: .blue, color2: .indigo, cost: 150, isDefault: false),
        Character(id: "hero10", icon: "👩🏽‍🚀", name: "Mira", weapon: "Ice", speed: "Medium", strength: "Medium", color1: .orange, color2: .red, cost: 150, isDefault: false)
    ]
    
    var body: some View {
        ZStack {
            // Animated background
            LinearGradient(
                colors: [.black, .indigo.opacity(0.3), .purple.opacity(0.2)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 25) {
                    // Header
                    VStack(spacing: 10) {
                        HStack {
                            Text("🧑‍🚀")
                                .font(.system(size: 50))
                            Text("Choose Your Character")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.white)
                        }
                        
                        Text("Select your space adventurer")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.7))
                    }
                    .padding(.top, 40)
                    
                    // Coin Balance
                    HStack {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("Your Balance")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            Text("💰 \(gameState.coins)")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.yellow)
                        }
                        Spacer()
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(
                        LinearGradient(
                            colors: [.yellow.opacity(0.3), .orange.opacity(0.2)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(16)
                    .padding(.horizontal, 20)
                    
                    // Characters Grid
                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 15),
                        GridItem(.flexible(), spacing: 15)
                    ], spacing: 15) {
                        ForEach(characters, id: \.id) { character in
                            CharacterCard(
                                character: character,
                                isSelected: gameState.selectedCharacter == character.id,
                                isOwned: ownedCharacters.contains(character.id) || character.isDefault,
                                onSelect: {
                                    if ownedCharacters.contains(character.id) || character.isDefault {
                                        gameState.selectedCharacter = character.id
                                        gameState.currentScreen = .shipSelect
                                    } else {
                                        purchaseCharacter(character)
                                    }
                                }
                            )
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
            }
            
            // Toast notification
            if showToast {
                VStack {
                    Spacer()
                    HStack {
                        Text(toastMessage)
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .background(Color.black.opacity(0.8))
                            .cornerRadius(12)
                    }
                    .padding(.bottom, 100)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
        }
        .onAppear {
            loadOwnedCharacters()
        }
    }
    
    private func loadOwnedCharacters() {
        if let data = UserDefaults.standard.data(forKey: "ownedChars"),
           let owned = try? JSONDecoder().decode([String].self, from: data) {
            ownedCharacters = Set(owned)
        }
        // Default characters are always owned
        ownedCharacters.insert("kaden")
        ownedCharacters.insert("adelynn")
    }
    
    private func purchaseCharacter(_ character: Character) {
        if gameState.coins >= character.cost {
            gameState.coins -= character.cost
            UserDefaults.standard.set(gameState.coins, forKey: "walletCoins")
            
            var owned = Array(ownedCharacters)
            owned.append(character.id)
            if let data = try? JSONEncoder().encode(owned) {
                UserDefaults.standard.set(data, forKey: "ownedChars")
            }
            ownedCharacters.insert(character.id)
            
            showToast(message: "🧑‍🚀 Character unlocked!")
        } else {
            showToast(message: "Not enough coins!")
        }
    }
    
    private func showToast(message: String) {
        toastMessage = message
        withAnimation {
            showToast = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation {
                showToast = false
            }
        }
    }
}

private struct CharacterCard: View {
    let character: CharacterSelectView.Character
    let isSelected: Bool
    let isOwned: Bool
    let onSelect: () -> Void
    
    var body: some View {
        Button(action: onSelect) {
            VStack(spacing: 12) {
                // Selected badge
                if isSelected {
                    HStack {
                        Spacer()
                        Text("✓ Selected")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.green.opacity(0.3))
                            .cornerRadius(8)
                    }
                }
                
                // Locked badge
                if !isOwned {
                    HStack {
                        Text("🔒 Locked")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.red)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.red.opacity(0.3))
                            .cornerRadius(8)
                        Spacer()
                    }
                }
                
                // Avatar
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [character.color1, character.color2],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 80, height: 80)
                        .shadow(color: character.color1.opacity(0.5), radius: 10)
                    
                    Text(character.icon)
                        .font(.system(size: 50))
                }
                .padding(.top, 5)
                
                // Name
                Text(character.name)
                    .font(.headline)
                    .foregroundColor(.white)
                
                // Stats
                VStack(spacing: 6) {
                    CharacterStatRow(icon: "⚔️", label: "Weapon", value: character.weapon)
                    CharacterStatRow(icon: "🏃", label: "Speed", value: character.speed)
                    CharacterStatRow(icon: "💪", label: "Strength", value: character.strength)
                }
                .font(.caption)
                
                // Price or Owned
                if !isOwned {
                    HStack {
                        Text("💰")
                        Text("\(character.cost)")
                            .font(.headline)
                            .foregroundColor(.yellow)
                    }
                    .padding(.vertical, 8)
                } else if !character.isDefault {
                    Text("Owned")
                        .font(.caption)
                        .foregroundColor(.green)
                        .padding(.vertical, 4)
                }
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: isSelected ? 
                                    [character.color1.opacity(0.3), character.color2.opacity(0.2)] :
                                    [.white.opacity(0.1), .white.opacity(0.05)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                    
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(
                            isSelected ? character.color1.opacity(0.8) :
                            isOwned ? Color.white.opacity(0.3) :
                            Color.red.opacity(0.5),
                            lineWidth: isSelected ? 3 : 2
                        )
                }
            )
            .shadow(color: isSelected ? character.color1.opacity(0.5) : .black.opacity(0.3), radius: isSelected ? 15 : 10)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

private struct CharacterStatRow: View {
    let icon: String
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(icon)
            Text(label + ":")
                .foregroundColor(.white.opacity(0.7))
            Spacer()
            Text(value)
                .foregroundColor(.white)
                .fontWeight(.semibold)
        }
    }
}
