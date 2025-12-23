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
    
    @State private var items: [String: [CustomizationItem]] = [:]
    @State private var showToast: Bool = false
    @State private var toastMessage: String = ""
    
    var body: some View {
        ZStack {
            Color.blue.opacity(0.8).ignoresSafeArea()
            
            VStack {
                // Header
                HStack {
                    Text("🎨 Customization")
                        .font(.largeTitle)
                        .foregroundColor(.black)
                        .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
                    
                    Spacer()
                    
                    Text("⭐ \(coins)")
                        .font(.headline)
                        .foregroundColor(.yellow)
                    
                    Button("✕") {
                        gameState.currentScreen = .mainMenu
                    }
                    .font(.title)
                    .foregroundColor(.black)
                    .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
                }
                .padding(.top, 60) // Safe area padding
                .padding(.horizontal)
                .padding(.bottom, 10)
                
                // Category selector
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(["skins", "trails", "bullets", "themes"], id: \.self) { category in
                            Button(category.capitalized) {
                                activeCategory = category
                            }
                            .padding()
                            .background(activeCategory == category ? Color.blue : Color.white.opacity(0.2))
                            .foregroundColor(.black)
                            .shadow(color: .white.opacity(0.3), radius: 1, x: 0, y: 1)
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
            loadItems()
        }
        .overlay(
            Group {
                if showToast {
                    VStack {
                        Spacer()
                        Text(toastMessage)
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .background(Color.green.opacity(0.9))
                            .cornerRadius(12)
                            .shadow(radius: 10)
                            .padding(.bottom, 100)
                            .transition(.move(edge: .bottom).combined(with: .opacity))
                    }
                }
            }
            .animation(.spring(), value: showToast)
        )
    }
    
    private func loadCoins() {
        coins = UserDefaults.standard.integer(forKey: "walletCoins")
    }
    
    private func loadItems() {
        // Initialize default items if not loaded
        if items.isEmpty {
            items = [
                "skins": [
                    CustomizationItem(id: "default", name: "Default", cost: 0, isOwned: true, isSelected: isItemSelected(category: "skins", itemId: "default")),
                    CustomizationItem(id: "neon", name: "Neon", cost: 500, isOwned: isItemOwned(category: "skins", itemId: "neon"), isSelected: isItemSelected(category: "skins", itemId: "neon")),
                    CustomizationItem(id: "fire", name: "Fire", cost: 500, isOwned: isItemOwned(category: "skins", itemId: "fire"), isSelected: isItemSelected(category: "skins", itemId: "fire"))
                ],
                "trails": [
                    CustomizationItem(id: "default", name: "Default", cost: 0, isOwned: true, isSelected: isItemSelected(category: "trails", itemId: "default")),
                    CustomizationItem(id: "sparkle", name: "Sparkle", cost: 300, isOwned: isItemOwned(category: "trails", itemId: "sparkle"), isSelected: isItemSelected(category: "trails", itemId: "sparkle"))
                ],
                "bullets": [
                    CustomizationItem(id: "default", name: "Default", cost: 0, isOwned: true, isSelected: isItemSelected(category: "bullets", itemId: "default")),
                    CustomizationItem(id: "laser", name: "Laser", cost: 400, isOwned: isItemOwned(category: "bullets", itemId: "laser"), isSelected: isItemSelected(category: "bullets", itemId: "laser"))
                ],
                "themes": [
                    CustomizationItem(id: "default", name: "Default", cost: 0, isOwned: true, isSelected: isItemSelected(category: "themes", itemId: "default")),
                    CustomizationItem(id: "dark", name: "Dark", cost: 600, isOwned: isItemOwned(category: "themes", itemId: "dark"), isSelected: isItemSelected(category: "themes", itemId: "dark"))
                ]
            ]
        }
    }
    
    private func isItemOwned(category: String, itemId: String) -> Bool {
        if itemId == "default" { return true }
        let key = "customization_\(category)_\(itemId)_owned"
        return UserDefaults.standard.bool(forKey: key)
    }
    
    private func isItemSelected(category: String, itemId: String) -> Bool {
        let key = "customization_\(category)_selected"
        let selectedId = UserDefaults.standard.string(forKey: key) ?? "default"
        return selectedId == itemId
    }
    
    private func markItemAsOwned(category: String, itemId: String) {
        let key = "customization_\(category)_\(itemId)_owned"
        UserDefaults.standard.set(true, forKey: key)
    }
    
    private func selectItemInCategory(category: String, itemId: String) {
        let key = "customization_\(category)_selected"
        UserDefaults.standard.set(itemId, forKey: key)
        
        // Update local state
        if var categoryItems = items[category] {
            for i in 0..<categoryItems.count {
                categoryItems[i].isSelected = (categoryItems[i].id == itemId)
            }
            items[category] = categoryItems
        }
    }
    
    private func purchaseItem(_ item: CustomizationItem) {
        if coins >= item.cost && !item.isOwned {
            coins -= item.cost
            UserDefaults.standard.set(coins, forKey: "walletCoins")
            
            // Mark item as owned
            markItemAsOwned(category: activeCategory, itemId: item.id)
            
            // Update local state
            if var categoryItems = items[activeCategory] {
                if let index = categoryItems.firstIndex(where: { $0.id == item.id }) {
                    categoryItems[index].isOwned = true
                    items[activeCategory] = categoryItems
                }
            }
            
            // Show success toast
            toastMessage = "✅ \(item.name) purchased!"
            showToast = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                showToast = false
            }
        }
    }
    
    private func selectItem(_ item: CustomizationItem) {
        if item.isOwned {
            // Select item
            selectItemInCategory(category: activeCategory, itemId: item.id)
            
            // Show selection toast
            toastMessage = "✅ \(item.name) selected!"
            showToast = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                showToast = false
            }
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
                    .foregroundColor(.black)
                    .shadow(color: .black.opacity(0.8), radius: 3, x: 0, y: 1)
                
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

