//
//  CustomizationView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct CustomizationView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var activeCategory = "skins"
    @State private var coins: Int = 0
    
    struct CustomizationItem: Identifiable {
        let id: String
        let name: String
        let cost: Int
        var isOwned: Bool
        var isSelected: Bool
    }
    
    @State private var items: [String: [CustomizationItem]] = [
        "skins": [
            CustomizationItem(id: "default", name: "Default", cost: 0, isOwned: true, isSelected: true),
            CustomizationItem(id: "neon", name: "Neon", cost: 500, isOwned: false, isSelected: false),
            CustomizationItem(id: "fire", name: "Fire", cost: 500, isOwned: false, isSelected: false)
        ],
        "trails": [
            CustomizationItem(id: "default", name: "Default", cost: 0, isOwned: true, isSelected: true),
            CustomizationItem(id: "sparkle", name: "Sparkle", cost: 300, isOwned: false, isSelected: false)
        ],
        "bullets": [
            CustomizationItem(id: "default", name: "Default", cost: 0, isOwned: true, isSelected: true),
            CustomizationItem(id: "laser", name: "Laser", cost: 400, isOwned: false, isSelected: false)
        ],
        "themes": [
            CustomizationItem(id: "default", name: "Default", cost: 0, isOwned: true, isSelected: true),
            CustomizationItem(id: "dark", name: "Dark", cost: 600, isOwned: false, isSelected: false)
        ]
    ]
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack {
                // Header
                HStack {
                    Text("🎨 Customization")
                        .font(.largeTitle)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Text("💰 \(coins)")
                        .font(.headline)
                        .foregroundColor(.yellow)
                    
                    Button("✕") {
                        gameState.currentScreen = .mainMenu
                    }
                    .font(.title)
                    .foregroundColor(.white)
                }
                .padding()
                
                // Category selector
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(["skins", "trails", "bullets", "themes"], id: \.self) { category in
                            Button(category.capitalized) {
                                activeCategory = category
                            }
                            .padding()
                            .background(activeCategory == category ? Color.blue : Color.white.opacity(0.2))
                            .foregroundColor(.white)
                            .cornerRadius(8)
                        }
                    }
                    .padding(.horizontal)
                }
                
                // Items list
                ScrollView {
                    VStack(spacing: 15) {
                        if let categoryItems = items[activeCategory] {
                            ForEach(categoryItems) { item in
                                CustomizationItemCard(item: item, coins: coins) {
                                    purchaseItem(item)
                                } onSelect: {
                                    selectItem(item)
                                }
                            }
                        }
                    }
                    .padding()
                }
            }
        }
        .onAppear {
            loadCoins()
        }
    }
    
    private func loadCoins() {
        coins = UserDefaults.standard.integer(forKey: "walletCoins")
    }
    
    private func purchaseItem(_ item: CustomizationItem) {
        if coins >= item.cost && !item.isOwned {
            coins -= item.cost
            UserDefaults.standard.set(coins, forKey: "walletCoins")
            // TODO: Mark item as owned
        }
    }
    
    private func selectItem(_ item: CustomizationItem) {
        if item.isOwned {
            // TODO: Select item
        }
    }
}

struct CustomizationItemCard: View {
    let item: CustomizationView.CustomizationItem
    let coins: Int
    let onPurchase: () -> Void
    let onSelect: () -> Void
    
    var canAfford: Bool {
        coins >= item.cost
    }
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(item.name)
                    .font(.headline)
                    .foregroundColor(.white)
                
                if item.cost > 0 {
                    Text("Cost: \(item.cost) 💰")
                        .font(.caption)
                        .foregroundColor(canAfford ? .yellow : .red)
                } else {
                    Text("Free")
                        .font(.caption)
                        .foregroundColor(.green)
                }
            }
            
            Spacer()
            
            if item.isOwned {
                Button("Select") {
                    onSelect()
                }
                .buttonStyle(.bordered)
                .disabled(item.isSelected)
            } else {
                Button("Purchase") {
                    onPurchase()
                }
                .buttonStyle(.bordered)
                .disabled(!canAfford)
            }
        }
        .padding()
        .background(item.isSelected ? Color.blue.opacity(0.3) : Color.white.opacity(0.1))
        .cornerRadius(12)
    }
}

