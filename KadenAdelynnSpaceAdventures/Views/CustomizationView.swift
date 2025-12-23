//
//  CustomizationView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct CustomizationView: View {
    @EnvironmentObject var gameState: GameStateManager
    @Environment(\.colorScheme) var colorScheme
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
            // Enhanced gradient background - adapts to dark mode
            Group {
                if colorScheme == .dark {
                    LinearGradient(
                        colors: [.black.opacity(0.95), .gray.opacity(0.8), .purple.opacity(0.6)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                } else {
                    LinearGradient(
                        colors: [.blue.opacity(0.9), .purple.opacity(0.7), .blue.opacity(0.8)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                }
            }
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    HStack(spacing: 8) {
                        Image(systemName: "paintbrush.fill")
                            .font(.title2)
                            .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                        Text("Customization")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                            .lineLimit(1)
                            .minimumScaleFactor(0.8)
                            .shadow(color: (colorScheme == .dark ? Color.black : Color.white).opacity(0.5), radius: 2, x: 0, y: 1)
                    }
                    
                    Spacer()
                    
                    // Star balance with better styling
                    HStack(spacing: 5) {
                        Image(systemName: "star.fill")
                            .font(.headline)
                            .foregroundColor(.yellow)
                        Text("\(coins)")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        LinearGradient(
                            colors: [.yellow.opacity(0.3), .orange.opacity(0.2)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
                    
                    Button(action: {
                        gameState.currentScreen = .mainMenu
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title)
                            .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                            .shadow(color: (colorScheme == .dark ? Color.black : Color.white).opacity(0.5), radius: 2)
                    }
                }
                .padding(.top, 60)
                .padding(.horizontal)
                .padding(.bottom, 15)
                
                // Category selector with improved design
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(["skins", "trails", "bullets", "themes"], id: \.self) { category in
                            Button(action: {
                                activeCategory = category
                            }) {
                                HStack(spacing: 6) {
                                    Image(systemName: categoryIcon(category))
                                        .font(.system(size: 14))
                                    Text(category.capitalized)
                                        .font(.subheadline)
                                        .fontWeight(.semibold)
                                }
                                .foregroundColor(activeCategory == category ? .white : (colorScheme == .dark ? Color.white : Color.black))
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                                .background(
                                    Group {
                                        if activeCategory == category {
                                            LinearGradient(
                                                colors: [.blue, .purple],
                                                startPoint: .leading,
                                                endPoint: .trailing
                                            )
                                        } else {
                                            Color.white.opacity(0.2)
                                        }
                                    }
                                )
                                .cornerRadius(12)
                                .shadow(color: .black.opacity(0.3), radius: 5, x: 0, y: 2)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 15)
                
                // Items list with grid layout
                ScrollView {
                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 15),
                        GridItem(.flexible(), spacing: 15)
                    ], spacing: 15) {
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
                    CustomizationItem(id: "neon", name: "Neon Blue", cost: 250, isOwned: isItemOwned(category: "skins", itemId: "neon"), isSelected: isItemSelected(category: "skins", itemId: "neon")),
                    CustomizationItem(id: "fire", name: "Fire Red", cost: 300, isOwned: isItemOwned(category: "skins", itemId: "fire"), isSelected: isItemSelected(category: "skins", itemId: "fire")),
                    CustomizationItem(id: "electric", name: "Electric Yellow", cost: 350, isOwned: isItemOwned(category: "skins", itemId: "electric"), isSelected: isItemSelected(category: "skins", itemId: "electric")),
                    CustomizationItem(id: "ice", name: "Ice Blue", cost: 400, isOwned: isItemOwned(category: "skins", itemId: "ice"), isSelected: isItemSelected(category: "skins", itemId: "ice")),
                    CustomizationItem(id: "plasma", name: "Plasma Purple", cost: 450, isOwned: isItemOwned(category: "skins", itemId: "plasma"), isSelected: isItemSelected(category: "skins", itemId: "plasma")),
                    CustomizationItem(id: "gold", name: "Gold Elite", cost: 600, isOwned: isItemOwned(category: "skins", itemId: "gold"), isSelected: isItemSelected(category: "skins", itemId: "gold")),
                    CustomizationItem(id: "rainbow", name: "Rainbow", cost: 750, isOwned: isItemOwned(category: "skins", itemId: "rainbow"), isSelected: isItemSelected(category: "skins", itemId: "rainbow"))
                ],
                "trails": [
                    CustomizationItem(id: "default", name: "Default", cost: 0, isOwned: true, isSelected: isItemSelected(category: "trails", itemId: "default")),
                    CustomizationItem(id: "sparkle", name: "Sparkle Trail", cost: 200, isOwned: isItemOwned(category: "trails", itemId: "sparkle"), isSelected: isItemSelected(category: "trails", itemId: "sparkle")),
                    CustomizationItem(id: "flame", name: "Flame Trail", cost: 250, isOwned: isItemOwned(category: "trails", itemId: "flame"), isSelected: isItemSelected(category: "trails", itemId: "flame")),
                    CustomizationItem(id: "electric", name: "Electric Trail", cost: 300, isOwned: isItemOwned(category: "trails", itemId: "electric"), isSelected: isItemSelected(category: "trails", itemId: "electric")),
                    CustomizationItem(id: "smoke", name: "Smoke Trail", cost: 350, isOwned: isItemOwned(category: "trails", itemId: "smoke"), isSelected: isItemSelected(category: "trails", itemId: "smoke")),
                    CustomizationItem(id: "nebula", name: "Nebula Trail", cost: 400, isOwned: isItemOwned(category: "trails", itemId: "nebula"), isSelected: isItemSelected(category: "trails", itemId: "nebula")),
                    CustomizationItem(id: "cosmic", name: "Cosmic Trail", cost: 500, isOwned: isItemOwned(category: "trails", itemId: "cosmic"), isSelected: isItemSelected(category: "trails", itemId: "cosmic"))
                ],
                "bullets": [
                    CustomizationItem(id: "default", name: "Default", cost: 0, isOwned: true, isSelected: isItemSelected(category: "bullets", itemId: "default")),
                    CustomizationItem(id: "laser", name: "Laser Beam", cost: 300, isOwned: isItemOwned(category: "bullets", itemId: "laser"), isSelected: isItemSelected(category: "bullets", itemId: "laser")),
                    CustomizationItem(id: "plasma", name: "Plasma Bolt", cost: 350, isOwned: isItemOwned(category: "bullets", itemId: "plasma"), isSelected: isItemSelected(category: "bullets", itemId: "plasma")),
                    CustomizationItem(id: "electric", name: "Electric Bolt", cost: 400, isOwned: isItemOwned(category: "bullets", itemId: "electric"), isSelected: isItemSelected(category: "bullets", itemId: "electric")),
                    CustomizationItem(id: "ice", name: "Ice Shard", cost: 450, isOwned: isItemOwned(category: "bullets", itemId: "ice"), isSelected: isItemSelected(category: "bullets", itemId: "ice")),
                    CustomizationItem(id: "fire", name: "Fireball", cost: 500, isOwned: isItemOwned(category: "bullets", itemId: "fire"), isSelected: isItemSelected(category: "bullets", itemId: "fire")),
                    CustomizationItem(id: "energy", name: "Energy Orb", cost: 600, isOwned: isItemOwned(category: "bullets", itemId: "energy"), isSelected: isItemSelected(category: "bullets", itemId: "energy")),
                    CustomizationItem(id: "photon", name: "Photon Beam", cost: 750, isOwned: isItemOwned(category: "bullets", itemId: "photon"), isSelected: isItemSelected(category: "bullets", itemId: "photon"))
                ],
                "themes": [
                    CustomizationItem(id: "default", name: "Default", cost: 0, isOwned: true, isSelected: isItemSelected(category: "themes", itemId: "default")),
                    CustomizationItem(id: "dark", name: "Dark Space", cost: 400, isOwned: isItemOwned(category: "themes", itemId: "dark"), isSelected: isItemSelected(category: "themes", itemId: "dark")),
                    CustomizationItem(id: "neon", name: "Neon City", cost: 500, isOwned: isItemOwned(category: "themes", itemId: "neon"), isSelected: isItemSelected(category: "themes", itemId: "neon")),
                    CustomizationItem(id: "sunset", name: "Sunset", cost: 600, isOwned: isItemOwned(category: "themes", itemId: "sunset"), isSelected: isItemSelected(category: "themes", itemId: "sunset")),
                    CustomizationItem(id: "ocean", name: "Ocean Deep", cost: 600, isOwned: isItemOwned(category: "themes", itemId: "ocean"), isSelected: isItemSelected(category: "themes", itemId: "ocean")),
                    CustomizationItem(id: "cosmic", name: "Cosmic", cost: 750, isOwned: isItemOwned(category: "themes", itemId: "cosmic"), isSelected: isItemSelected(category: "themes", itemId: "cosmic")),
                    CustomizationItem(id: "matrix", name: "Matrix", cost: 800, isOwned: isItemOwned(category: "themes", itemId: "matrix"), isSelected: isItemSelected(category: "themes", itemId: "matrix"))
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
    
    private func categoryIcon(_ category: String) -> String {
        switch category {
        case "skins": return "paintpalette.fill"
        case "trails": return "sparkles"
        case "bullets": return "bolt.fill"
        case "themes": return "moon.stars.fill"
        default: return "circle.fill"
        }
    }
}

struct CustomizationItemCard: View {
    let item: CustomizationView.CustomizationItem
    let coins: Int
    let onPurchase: () -> Void
    let onSelect: () -> Void
    @Environment(\.colorScheme) var colorScheme
    
    var canAfford: Bool {
        coins >= item.cost
    }
    
    var body: some View {
        VStack(spacing: 12) {
            // Item icon/visual
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: item.isSelected ? [.blue, .purple] : [.white.opacity(0.2), .white.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 60, height: 60)
                
                Image(systemName: itemIcon(item.name))
                    .font(.system(size: 28))
                    .foregroundStyle(itemIconColor(item.name))
                    .shadow(color: itemIconShadowColor(item.name), radius: 3)
            }
            
            // Item name
            Text(item.name)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                .multilineTextAlignment(.center)
            
            // Cost or status
            if item.cost > 0 {
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .font(.caption)
                        .foregroundColor(canAfford ? .yellow : .gray)
                    Text("\(item.cost)")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(canAfford ? (colorScheme == .dark ? Color.white : Color.black) : .gray)
                }
            } else {
                Text("Free")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.green)
            }
            
            // Action button
            if item.isOwned {
                Button(action: onSelect) {
                    Text(item.isSelected ? "Selected" : "Select")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(item.isSelected ? Color.white : (colorScheme == .dark ? Color.white : Color.black))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(
                            item.isSelected ?
                            LinearGradient(colors: [.green, .green.opacity(0.8)], startPoint: .leading, endPoint: .trailing) :
                            LinearGradient(colors: [.white.opacity(0.3), .white.opacity(0.2)], startPoint: .leading, endPoint: .trailing)
                        )
                        .cornerRadius(8)
                }
                .disabled(item.isSelected)
            } else {
                Button(action: onPurchase) {
                    Text("Purchase")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(canAfford ? (colorScheme == .dark ? Color.white : Color.black) : .gray)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(
                            canAfford ?
                            LinearGradient(colors: [.yellow.opacity(0.4), .orange.opacity(0.3)], startPoint: .leading, endPoint: .trailing) :
                            LinearGradient(colors: [.gray.opacity(0.3), .gray.opacity(0.2)], startPoint: .leading, endPoint: .trailing)
                        )
                        .cornerRadius(8)
                }
                .disabled(!canAfford)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.ultraThinMaterial)
                .overlay(
                    Group {
                        if item.isSelected {
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(
                                    LinearGradient(colors: [.blue, .purple], startPoint: .topLeading, endPoint: .bottomTrailing),
                                    lineWidth: 2
                                )
                        } else {
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(
                                    LinearGradient(colors: [.white.opacity(0.3), .white.opacity(0.1)], startPoint: .topLeading, endPoint: .bottomTrailing),
                                    lineWidth: 1
                                )
                        }
                    }
                )
        )
        .shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
    }
    
    private func itemIcon(_ name: String) -> String {
        switch name.lowercased() {
        case "default": return "circle.fill"
        case "neon", "neon blue": return "bolt.fill"
        case "fire", "fire red", "fireball": return "flame.fill"
        case "sparkle", "sparkle trail": return "sparkles"
        case "laser", "laser beam": return "laser.burst"
        case "dark", "dark space": return "moon.fill"
        case "electric", "electric yellow", "electric trail", "electric bolt": return "bolt.circle.fill"
        case "ice", "ice blue", "ice shard": return "snowflake"
        case "plasma", "plasma purple", "plasma bolt": return "atom"
        case "gold", "gold elite": return "crown.fill"
        case "rainbow": return "paintpalette.fill"
        case "flame trail": return "flame.fill"
        case "smoke trail": return "cloud.fill"
        case "nebula trail": return "sparkles.rectangle.stack.fill"
        case "cosmic trail", "cosmic": return "star.circle.fill"
        case "energy orb": return "circle.hexagongrid.fill"
        case "photon beam": return "lightbeam"
        case "neon city": return "building.2.fill"
        case "sunset": return "sun.horizon.fill"
        case "ocean", "ocean deep": return "water.waves"
        case "matrix": return "grid.circle.fill"
        default: return "star.fill"
        }
    }
    
    private func itemIconColor(_ name: String) -> LinearGradient {
        switch name.lowercased() {
        case "default": 
            return LinearGradient(colors: [.gray, .gray.opacity(0.7)], startPoint: .top, endPoint: .bottom)
        case "neon", "neon blue": 
            return LinearGradient(colors: [.cyan, .blue], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "fire", "fire red", "fireball", "flame trail": 
            return LinearGradient(colors: [.red, .orange], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "sparkle", "sparkle trail": 
            return LinearGradient(colors: [.yellow, .white], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "laser", "laser beam": 
            return LinearGradient(colors: [.yellow, .green], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "dark", "dark space": 
            return LinearGradient(colors: [.purple, .indigo], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "electric", "electric yellow", "electric trail", "electric bolt": 
            return LinearGradient(colors: [.yellow, .orange], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "ice", "ice blue", "ice shard": 
            return LinearGradient(colors: [.cyan, .blue], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "plasma", "plasma purple", "plasma bolt": 
            return LinearGradient(colors: [.purple, .pink], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "gold", "gold elite": 
            return LinearGradient(colors: [.yellow, .orange], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "rainbow": 
            return LinearGradient(colors: [.red, .orange, .yellow, .green, .blue, .purple, .pink], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "smoke trail": 
            return LinearGradient(colors: [.gray, .gray.opacity(0.5)], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "nebula trail": 
            return LinearGradient(colors: [.purple, .blue, .pink], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "cosmic trail", "cosmic": 
            return LinearGradient(colors: [.blue, .purple, .indigo], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "energy orb": 
            return LinearGradient(colors: [.green, .cyan], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "photon beam": 
            return LinearGradient(colors: [.white, .cyan], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "neon city": 
            return LinearGradient(colors: [.cyan, .blue, .purple], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "sunset": 
            return LinearGradient(colors: [.orange, .red, .pink], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "ocean", "ocean deep": 
            return LinearGradient(colors: [.blue, .cyan], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "matrix": 
            return LinearGradient(colors: [.green, .mint], startPoint: .topLeading, endPoint: .bottomTrailing)
        default: 
            return LinearGradient(colors: [.blue, .purple], startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }
    
    private func itemIconShadowColor(_ name: String) -> Color {
        switch name.lowercased() {
        case "default": return .gray.opacity(0.5)
        case "neon", "neon blue": return .cyan.opacity(0.5)
        case "fire", "fire red", "fireball", "flame trail": return .red.opacity(0.5)
        case "sparkle", "sparkle trail": return .yellow.opacity(0.5)
        case "laser", "laser beam": return .yellow.opacity(0.5)
        case "dark", "dark space": return .purple.opacity(0.5)
        case "electric", "electric yellow", "electric trail", "electric bolt": return .yellow.opacity(0.5)
        case "ice", "ice blue", "ice shard": return .cyan.opacity(0.5)
        case "plasma", "plasma purple", "plasma bolt": return .purple.opacity(0.5)
        case "gold", "gold elite": return .yellow.opacity(0.5)
        case "rainbow": return .purple.opacity(0.5)
        case "smoke trail": return .gray.opacity(0.5)
        case "nebula trail": return .purple.opacity(0.5)
        case "cosmic trail", "cosmic": return .blue.opacity(0.5)
        case "energy orb": return .green.opacity(0.5)
        case "photon beam": return .cyan.opacity(0.5)
        case "neon city": return .cyan.opacity(0.5)
        case "sunset": return .orange.opacity(0.5)
        case "ocean", "ocean deep": return .blue.opacity(0.5)
        case "matrix": return .green.opacity(0.5)
        default: return .blue.opacity(0.5)
        }
    }
}

