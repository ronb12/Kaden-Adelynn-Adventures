//
//  ShipSelectView.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced ship selection view with all recommendations
//

import SwiftUI

struct ShipSelectView: View {
    @EnvironmentObject var gameState: GameStateManager
    @Environment(\.colorScheme) var colorScheme
    @State private var ownedShips: Set<String> = []
    @State private var showToast = false
    @State private var toastMessage = ""
    @State private var selectedCategory: ShipCategory = .all
    @State private var searchText = ""
    @State private var favorites: Set<String> = []
    @State private var recentlyUsed: [String] = []
    @State private var comparingShips: [String] = []
    @State private var previewShip: Ship? = nil
    @State private var showComparison = false
    
    enum ShipCategory: String, CaseIterable {
        case all = "All"
        case starter = "Starter"
        case speed = "Speed"
        case tank = "Tank"
        case dps = "DPS"
        case balanced = "Balanced"
    }
    
    struct Ship {
        let id: String
        let icon: String
        let name: String
        let weapon: String
        let speed: String
        let durability: String
        let firepower: String
        let maneuverability: String
        let color1: Color
        let color2: Color
        let cost: Int
        let isDefault: Bool
        let category: ShipCategory
        let description: String
        let playstyle: String
        let speedValue: Double
        let healthValue: Int
        let damageValue: Double
        let unlockRequirement: String?
        let unlockProgress: Double?
    }
    
    let ships: [Ship] = [
        Ship(id: "kaden", icon: "🚀", name: "Kaden's Ship", weapon: "Laser", speed: "High", durability: "Medium", firepower: "Medium", maneuverability: "High", color1: .blue, color2: Color(red: 0.2, green: 0.4, blue: 0.9), cost: 0, isDefault: true, category: .starter, description: "A balanced starter ship perfect for beginners. Reliable and versatile.", playstyle: "Best for: Beginners", speedValue: 7.0, healthValue: 100, damageValue: 1.0, unlockRequirement: nil, unlockProgress: nil),
        Ship(id: "adelynn", icon: "✨", name: "Adelynn's Ship", weapon: "Spread Shot", speed: "Very High", durability: "Low", firepower: "High", maneuverability: "Very High", color1: .pink, color2: .purple, cost: 0, isDefault: true, category: .speed, description: "Lightning-fast ship with spread shot capability. High risk, high reward.", playstyle: "Best for: Advanced players", speedValue: 9.0, healthValue: 80, damageValue: 1.1, unlockRequirement: nil, unlockProgress: nil),
        Ship(id: "falcon", icon: "🦅", name: "Falcon", weapon: "Homing", speed: "Very High", durability: "Low", firepower: "Medium", maneuverability: "Very High", color1: .yellow, color2: .orange, cost: 200, isDefault: false, category: .speed, description: "Swift interceptor with homing missiles. Perfect for hit-and-run tactics.", playstyle: "Best for: Speed enthusiasts", speedValue: 8.5, healthValue: 75, damageValue: 1.0, unlockRequirement: "Reach Wave 5", unlockProgress: nil),
        Ship(id: "phantom", icon: "👻", name: "Phantom", weapon: "Electric", speed: "High", durability: "Medium", firepower: "Medium", maneuverability: "High", color1: .gray, color2: .white, cost: 250, isDefault: false, category: .balanced, description: "Stealthy ship with electric weapons. Balanced stats for all situations.", playstyle: "Best for: Versatile gameplay", speedValue: 7.5, healthValue: 90, damageValue: 1.0, unlockRequirement: "Kill 50 enemies", unlockProgress: nil),
        Ship(id: "nova", icon: "🌟", name: "Nova", weapon: "Plasma", speed: "High", durability: "Medium", firepower: "High", maneuverability: "Medium", color1: .purple, color2: .pink, cost: 300, isDefault: false, category: .dps, description: "Plasma-powered destroyer. Devastating firepower at medium range.", playstyle: "Best for: Damage dealers", speedValue: 7.0, healthValue: 85, damageValue: 1.2, unlockRequirement: "Reach Wave 10", unlockProgress: nil),
        Ship(id: "titan", icon: "🛡️", name: "Titan", weapon: "Railgun", speed: "Low", durability: "Very High", firepower: "Very High", maneuverability: "Low", color1: .orange, color2: .red, cost: 350, isDefault: false, category: .tank, description: "Heavy armored battleship. Slow but nearly indestructible.", playstyle: "Best for: Tank players", speedValue: 5.0, healthValue: 150, damageValue: 1.3, unlockRequirement: "Survive 5 minutes", unlockProgress: nil),
        Ship(id: "viper", icon: "🐍", name: "Viper", weapon: "Shotgun", speed: "High", durability: "Medium", firepower: "High", maneuverability: "High", color1: .green, color2: .mint, cost: 300, isDefault: false, category: .dps, description: "Close-range specialist with devastating shotgun blasts.", playstyle: "Best for: Aggressive players", speedValue: 7.5, healthValue: 90, damageValue: 1.25, unlockRequirement: "Get 10 combo kills", unlockProgress: nil),
        Ship(id: "shadow", icon: "🌑", name: "Shadow", weapon: "Beam", speed: "Medium", durability: "High", firepower: "Medium", maneuverability: "Medium", color1: .black, color2: .gray, cost: 320, isDefault: false, category: .balanced, description: "Stealth fighter with continuous beam weapons. Well-rounded performance.", playstyle: "Best for: Balanced gameplay", speedValue: 6.5, healthValue: 110, damageValue: 1.0, unlockRequirement: "Score 10,000 points", unlockProgress: nil),
        Ship(id: "meteor", icon: "☄️", name: "Meteor", weapon: "Missile", speed: "Very High", durability: "Low", firepower: "High", maneuverability: "High", color1: .orange, color2: .yellow, cost: 280, isDefault: false, category: .speed, description: "Fast-attack craft with explosive missiles. Speed and power combined.", playstyle: "Best for: Fast-paced action", speedValue: 8.0, healthValue: 80, damageValue: 1.15, unlockRequirement: "Destroy 3 boss ships", unlockProgress: nil),
        Ship(id: "comet", icon: "🌠", name: "Comet", weapon: "Freeze", speed: "Very High", durability: "Low", firepower: "Medium", maneuverability: "Very High", color1: .blue, color2: .cyan, cost: 260, isDefault: false, category: .speed, description: "Ultra-fast interceptor with freeze weapons. Control the battlefield.", playstyle: "Best for: Speed and control", speedValue: 9.5, healthValue: 70, damageValue: 0.95, unlockRequirement: "Complete 20 waves", unlockProgress: nil),
        Ship(id: "raptor", icon: "🦖", name: "Raptor", weapon: "Laser Rifle", speed: "High", durability: "High", firepower: "High", maneuverability: "Medium", color1: .red, color2: .orange, cost: 330, isDefault: false, category: .balanced, description: "Heavy fighter with rapid-fire laser rifles. Power and durability.", playstyle: "Best for: Sustained combat", speedValue: 7.0, healthValue: 120, damageValue: 1.1, unlockRequirement: "Achieve 50% accuracy", unlockProgress: nil),
        Ship(id: "aurora", icon: "🌈", name: "Aurora", weapon: "Plasma Rifle", speed: "Medium", durability: "Medium", firepower: "Very High", maneuverability: "Medium", color1: .purple, color2: .blue, cost: 340, isDefault: false, category: .dps, description: "Ultimate damage dealer with plasma rifles. Maximum firepower.", playstyle: "Best for: Maximum damage", speedValue: 6.0, healthValue: 95, damageValue: 1.4, unlockRequirement: "Reach Wave 20", unlockProgress: nil)
    ]
    
    var filteredShips: [Ship] {
        var filtered = ships
        
        // Filter by category
        if selectedCategory != .all {
            filtered = filtered.filter { $0.category == selectedCategory }
        }
        
        // Filter by search
        if !searchText.isEmpty {
            filtered = filtered.filter { ship in
                ship.name.localizedCaseInsensitiveContains(searchText) ||
                ship.weapon.localizedCaseInsensitiveContains(searchText) ||
                ship.description.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // Sort: favorites first, then recently used, then owned, then by cost
        return filtered.sorted { ship1, ship2 in
            let fav1 = favorites.contains(ship1.id)
            let fav2 = favorites.contains(ship2.id)
            if fav1 != fav2 { return fav1 }
            
            let recent1 = recentlyUsed.firstIndex(of: ship1.id) ?? Int.max
            let recent2 = recentlyUsed.firstIndex(of: ship2.id) ?? Int.max
            if recent1 != recent2 { return recent1 < recent2 }
            
            let owned1 = ownedShips.contains(ship1.id) || ship1.isDefault
            let owned2 = ownedShips.contains(ship2.id) || ship2.isDefault
            if owned1 != owned2 { return owned1 }
            
            return ship1.cost < ship2.cost
        }
    }
    
    var body: some View {
        ZStack {
            // Animated background - adapts to dark mode
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
            
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    VStack(spacing: 10) {
                        HStack {
                            Button(action: {
                                gameState.currentScreen = .mainMenu
                            }) {
                                Image(systemName: "chevron.left.circle.fill")
                                    .font(.title)
                                    .foregroundColor(.black)
                                    .shadow(color: .white.opacity(0.5), radius: 2)
                            }
                            
                            Spacer()
                            
                            Text("🚀")
                                .font(.system(size: 50))
                            Text("Choose Your Ship")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.black)
                                .shadow(color: .black.opacity(0.8), radius: 4, x: 0, y: 2)
                            
                            Spacer()
                            
                            // Comparison button
                            Button(action: {
                                showComparison.toggle()
                            }) {
                                Image(systemName: comparingShips.isEmpty ? "square.on.square" : "square.on.square.fill")
                                    .font(.title2)
                                    .foregroundColor(.black)
                                    .shadow(color: .white.opacity(0.5), radius: 2)
                            }
                            .overlay(
                                Group {
                                    if !comparingShips.isEmpty {
                                        Text("\(comparingShips.count)")
                                            .font(.caption2)
                                            .foregroundColor(.white)
                                            .padding(4)
                                            .background(Color.red)
                                            .clipShape(Circle())
                                            .offset(x: 12, y: -12)
                                    }
                                }
                            )
                        }
                        .padding(.top, 60)
                        
                        Text("Select the perfect vessel for your space adventure")
                            .font(.subheadline)
                            .foregroundColor(.black.opacity(0.8))
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 40)
                    .padding(.horizontal, 20)
                    
                    // Stars Balance
                    HStack {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("Your Balance")
                                .font(.caption)
                                .foregroundColor(.black.opacity(0.8))
                            HStack(spacing: 4) {
                                ZStack {
                                    Text("⭐")
                                        .font(.system(size: 28))
                                        .foregroundColor(.yellow)
                                    Text("K&A")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(.black)
                                        .offset(y: -1)
                                }
                                Text("\(gameState.coins)")
                                    .font(.system(size: 28, weight: .bold))
                                    .foregroundColor(.yellow)
                            }
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
                    
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.black.opacity(0.6))
                        TextField("Search ships...", text: $searchText)
                            .foregroundColor(.black)
                    }
                    .padding()
                    .background(Color.white.opacity(0.3))
                    .cornerRadius(12)
                    .padding(.horizontal, 20)
                    
                    // Category Tabs
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(ShipCategory.allCases, id: \.self) { category in
                                Button(action: {
                                    withAnimation {
                                        selectedCategory = category
                                    }
                                }) {
                                    Text(category.rawValue)
                                        .font(.subheadline)
                                        .fontWeight(.semibold)
                                        .foregroundColor(selectedCategory == category ? .white : .black)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(
                                            selectedCategory == category ?
                                                LinearGradient(colors: [.blue, .purple], startPoint: .leading, endPoint: .trailing) :
                                                LinearGradient(colors: [.white.opacity(0.3), .white.opacity(0.2)], startPoint: .leading, endPoint: .trailing)
                                        )
                                        .cornerRadius(20)
                                        .shadow(color: selectedCategory == category ? .blue.opacity(0.5) : .clear, radius: 5)
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                    
                    // Comparison View
                    if showComparison && !comparingShips.isEmpty {
                        ComparisonView(
                            ships: ships.filter { comparingShips.contains($0.id) },
                            onClose: { showComparison = false },
                            onClear: { comparingShips.removeAll() }
                        )
                        .padding(.horizontal, 20)
                    }
                    
                    // Ships Grid
                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 15),
                        GridItem(.flexible(), spacing: 15)
                    ], spacing: 15) {
                        ForEach(filteredShips, id: \.id) { ship in
                            EnhancedShipCard(
                                ship: ship,
                                isSelected: gameState.selectedShip == ship.id,
                                isOwned: ownedShips.contains(ship.id) || ship.isDefault,
                                isFavorite: favorites.contains(ship.id),
                                isComparing: comparingShips.contains(ship.id),
                                onSelect: {
                                    if ownedShips.contains(ship.id) || ship.isDefault {
                                        gameState.selectedShip = ship.id
                                        addToRecentlyUsed(ship.id)
                                        gameState.currentScreen = .story
                                    } else {
                                        purchaseShip(ship)
                                    }
                                },
                                onFavorite: {
                                    toggleFavorite(ship.id)
                                },
                                onCompare: {
                                    toggleCompare(ship.id)
                                },
                                onPreview: {
                                    previewShip = ship
                                }
                            )
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
            }
            
            // Preview Modal
            if let preview = previewShip {
                ShipPreviewModal(
                    ship: preview,
                    isOwned: ownedShips.contains(preview.id) || preview.isDefault,
                    onClose: { previewShip = nil },
                    onSelect: {
                        if ownedShips.contains(preview.id) || preview.isDefault {
                            gameState.selectedShip = preview.id
                            addToRecentlyUsed(preview.id)
                            previewShip = nil
                            gameState.currentScreen = .story
                        } else {
                            purchaseShip(preview)
                            previewShip = nil
                        }
                    }
                )
            }
            
            // Toast notification
            if showToast {
                VStack {
                    Spacer()
                    HStack {
                        Text(toastMessage)
                            .font(.headline)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.5), radius: 2)
                            .padding()
                            .background(
                                LinearGradient(
                                    colors: [.green.opacity(0.9), .blue.opacity(0.9)],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                            .shadow(radius: 10)
                    }
                    .padding(.bottom, 100)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
        }
        .onAppear {
            loadOwnedShips()
            loadFavorites()
            loadRecentlyUsed()
        }
    }
    
    private func loadOwnedShips() {
        if let data = UserDefaults.standard.data(forKey: "ownedShips"),
           let owned = try? JSONDecoder().decode([String].self, from: data) {
            ownedShips = Set(owned)
        }
        ownedShips.insert("kaden")
        ownedShips.insert("adelynn")
    }
    
    private func loadFavorites() {
        if let data = UserDefaults.standard.data(forKey: "favoriteShips"),
           let favs = try? JSONDecoder().decode([String].self, from: data) {
            favorites = Set(favs)
        }
    }
    
    private func loadRecentlyUsed() {
        if let data = UserDefaults.standard.data(forKey: "recentlyUsedShips"),
           let recent = try? JSONDecoder().decode([String].self, from: data) {
            recentlyUsed = recent
        }
    }
    
    private func toggleFavorite(_ shipId: String) {
        if favorites.contains(shipId) {
            favorites.remove(shipId)
        } else {
            favorites.insert(shipId)
        }
        if let data = try? JSONEncoder().encode(Array(favorites)) {
            UserDefaults.standard.set(data, forKey: "favoriteShips")
        }
    }
    
    private func addToRecentlyUsed(_ shipId: String) {
        recentlyUsed.removeAll { $0 == shipId }
        recentlyUsed.insert(shipId, at: 0)
        if recentlyUsed.count > 5 {
            recentlyUsed = Array(recentlyUsed.prefix(5))
        }
        if let data = try? JSONEncoder().encode(recentlyUsed) {
            UserDefaults.standard.set(data, forKey: "recentlyUsedShips")
        }
    }
    
    private func toggleCompare(_ shipId: String) {
        if comparingShips.contains(shipId) {
            comparingShips.removeAll { $0 == shipId }
        } else {
            if comparingShips.count < 3 {
                comparingShips.append(shipId)
            }
        }
    }
    
    private func purchaseShip(_ ship: Ship) {
        if gameState.coins >= ship.cost {
            gameState.coins -= ship.cost
            UserDefaults.standard.set(gameState.coins, forKey: "walletStars")
            
            var owned = Array(ownedShips)
            owned.append(ship.id)
            if let data = try? JSONEncoder().encode(owned) {
                UserDefaults.standard.set(data, forKey: "ownedShips")
            }
            ownedShips.insert(ship.id)
            
            // Celebration effect
            showToast(message: "🎉 Ship unlocked! \(ship.name) is now yours!")
            
            // Haptic feedback
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.success)
        } else {
            showToast(message: "Not enough stars! Need \(ship.cost - gameState.coins) more.")
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.error)
        }
    }
    
    private func showToast(message: String) {
        toastMessage = message
        withAnimation(.spring()) {
            showToast = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            withAnimation {
                showToast = false
            }
        }
    }
}

// MARK: - Enhanced Ship Card
private struct EnhancedShipCard: View {
    let ship: ShipSelectView.Ship
    let isSelected: Bool
    let isOwned: Bool
    let isFavorite: Bool
    let isComparing: Bool
    let onSelect: () -> Void
    let onFavorite: () -> Void
    let onCompare: () -> Void
    let onPreview: () -> Void
    
    @State private var isAnimating = false
    
    var overallRating: Double {
        let speedScore = (ship.speedValue / 10.0) * 0.2
        let healthScore = (Double(ship.healthValue) / 150.0) * 0.2
        let damageScore = (ship.damageValue / 1.4) * 0.3
        let maneuverScore = parseManeuverability(ship.maneuverability) * 0.3
        return (speedScore + healthScore + damageScore + maneuverScore) * 5.0
    }
    
    var bestStat: String {
        let stats = [
            ("Speed", ship.speedValue),
            ("Health", Double(ship.healthValue)),
            ("Damage", ship.damageValue * 10)
        ]
        return stats.max(by: { $0.1 < $1.1 })?.0 ?? "Balanced"
    }
    
    var body: some View {
        Button(action: onSelect) {
            VStack(spacing: 10) {
                // Top badges row
                HStack {
                    // Favorite button
                    Button(action: onFavorite) {
                        Image(systemName: isFavorite ? "heart.fill" : "heart")
                            .foregroundColor(isFavorite ? .red : .black.opacity(0.6))
                            .font(.caption)
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    Spacer()
                    
                    // Selected badge
                    if isSelected {
                        Text("✓ Selected")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.8), radius: 2, x: 1, y: 1)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 3)
                            .background(Color.green.opacity(0.8))
                            .cornerRadius(6)
                    }
                    
                    // Locked badge
                    if !isOwned {
                        Text("🔒")
                            .font(.caption2)
                    }
                    
                    // Compare button
                    Button(action: onCompare) {
                        Image(systemName: isComparing ? "square.on.square.fill" : "square.on.square")
                            .foregroundColor(isComparing ? .blue : .black.opacity(0.6))
                            .font(.caption)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
                
                // Ship Preview with actual graphics
                ShipPreviewView(
                    shipId: ship.id,
                    characterId: ship.id == "kaden" ? "kaden" : ship.id == "adelynn" ? "adelynn" : "kaden",
                    size: CGSize(width: 80, height: 80),
                    isAnimating: isSelected
                )
                .frame(width: 80, height: 80)
                .shadow(color: ship.color1.opacity(0.5), radius: isSelected ? 15 : 10)
                .scaleEffect(isSelected ? 1.1 : 1.0)
                .onAppear {
                    if isSelected {
                        isAnimating = true
                    }
                }
                
                // Name and Rating
                VStack(spacing: 3) {
                    Text(ship.name)
                        .font(.headline)
                        .foregroundColor(.black)
                        .shadow(color: .white.opacity(0.5), radius: 2)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                    
                    // Overall rating
                    HStack(spacing: 2) {
                        ForEach(0..<5) { index in
                            Image(systemName: index < Int(overallRating) ? "star.fill" : "star")
                                .font(.caption2)
                                .foregroundColor(.yellow)
                        }
                        Text(String(format: "%.1f", overallRating))
                            .font(.caption2)
                            .foregroundColor(.black.opacity(0.7))
                    }
                    
                    // Best stat badge
                    Text("Best: \(bestStat)")
                        .font(.caption2)
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.8), radius: 2, x: 1, y: 1)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.7))
                        .cornerRadius(4)
                }
                
                // Description
                Text(ship.description)
                    .font(.caption2)
                    .foregroundColor(.black.opacity(0.7))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .padding(.horizontal, 4)
                
                // Playstyle
                Text(ship.playstyle)
                    .font(.caption2)
                    .foregroundColor(.purple)
                    .italic()
                
                // Visual Stat Bars
                VStack(spacing: 4) {
                    StatBar(label: "Speed", value: ship.speedValue, max: 10.0, color: .blue)
                    StatBar(label: "Health", value: Double(ship.healthValue), max: 150.0, color: .green)
                    StatBar(label: "Damage", value: ship.damageValue, max: 1.4, color: .red)
                }
                .padding(.horizontal, 4)
                
                // Actual Values
                VStack(spacing: 2) {
                    HStack {
                        Text("Speed:")
                            .font(.caption2)
                            .foregroundColor(.black.opacity(0.6))
                        Text("\(String(format: "%.1f", ship.speedValue))")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                        Text("HP:")
                            .font(.caption2)
                            .foregroundColor(.black.opacity(0.6))
                        Text("\(ship.healthValue)")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                    }
                    HStack {
                        Text("Dmg:")
                            .font(.caption2)
                            .foregroundColor(.black.opacity(0.6))
                        Text("\(String(format: "%.2f", ship.damageValue))x")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                        Text("Weapon:")
                            .font(.caption2)
                            .foregroundColor(.black.opacity(0.6))
                        Text(ship.weapon)
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                    }
                }
                .padding(.horizontal, 4)
                
                // Unlock requirement
                if !isOwned, let requirement = ship.unlockRequirement {
                    Text("Unlock: \(requirement)")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.8), radius: 2, x: 1, y: 1)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 3)
                        .background(Color.orange.opacity(0.8))
                        .cornerRadius(6)
                }
                
                // Action buttons
                HStack(spacing: 8) {
                    // Preview button
                    Button(action: onPreview) {
                        Text("Preview")
                            .font(.caption2)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.8), radius: 2, x: 1, y: 1)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.blue.opacity(0.7))
                            .cornerRadius(6)
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    // Price or Owned
                    if !isOwned {
                        HStack(spacing: 4) {
                            ZStack {
                                Text("⭐")
                                    .font(.system(size: 16))
                                    .foregroundColor(.yellow)
                                Text("K&A")
                                    .font(.system(size: 5, weight: .bold))
                                    .foregroundColor(.black)
                                    .offset(y: -1)
                            }
                            Text("\(ship.cost)")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(.yellow)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.yellow.opacity(0.2))
                        .cornerRadius(6)
                    } else {
                        Text("✓ Owned")
                            .font(.caption2)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.8), radius: 2, x: 1, y: 1)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.green.opacity(0.7))
                            .cornerRadius(6)
                    }
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity)
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: isSelected ?
                                    [ship.color1.opacity(0.4), ship.color2.opacity(0.3)] :
                                    isComparing ?
                                    [.blue.opacity(0.2), .purple.opacity(0.15)] :
                                    [.white.opacity(0.15), .white.opacity(0.1)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                    
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(
                            isSelected ? ship.color1.opacity(0.9) :
                            isComparing ? Color.blue.opacity(0.7) :
                            isOwned ? Color.white.opacity(0.4) :
                            Color.red.opacity(0.5),
                            lineWidth: isSelected ? 3 : isComparing ? 2.5 : 2
                        )
                }
            )
            .shadow(color: isSelected ? ship.color1.opacity(0.6) : .black.opacity(0.3), radius: isSelected ? 20 : 10)
            .scaleEffect(isSelected ? 1.02 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private func parseManeuverability(_ value: String) -> Double {
        switch value.lowercased() {
        case "very high": return 0.9
        case "high": return 0.7
        case "medium": return 0.5
        case "low": return 0.3
        default: return 0.5
        }
    }
}

// MARK: - Stat Bar
private struct StatBar: View {
    let label: String
    let value: Double
    let max: Double
    let color: Color
    
    var percentage: Double {
        min(value / max, 1.0)
    }
    
    var barColor: Color {
        if percentage >= 0.7 { return .green }
        else if percentage >= 0.4 { return .yellow }
        else { return .red }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(label)
                    .font(.caption2)
                    .foregroundColor(.black.opacity(0.8))
                Spacer()
                Text(String(format: "%.1f", value))
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .foregroundColor(.black)
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.black.opacity(0.2))
                        .frame(height: 6)
                    
                    RoundedRectangle(cornerRadius: 3)
                        .fill(
                            LinearGradient(
                                colors: [barColor, barColor.opacity(0.7)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geometry.size.width * CGFloat(percentage), height: 6)
                        .animation(.spring(response: 0.3), value: percentage)
                }
            }
            .frame(height: 6)
        }
    }
}

// MARK: - Comparison View
private struct ComparisonView: View {
    let ships: [ShipSelectView.Ship]
    let onClose: () -> Void
    let onClear: () -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Ship Comparison")
                    .font(.headline)
                    .foregroundColor(.white)
                    .shadow(color: .black.opacity(0.8), radius: 2, x: 1, y: 1)
                Spacer()
                Button("Clear") {
                    onClear()
                }
                .font(.caption)
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.8), radius: 2, x: 1, y: 1)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.blue.opacity(0.7))
                .cornerRadius(6)
                Button("Close") {
                    onClose()
                }
                .font(.caption)
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.8), radius: 2, x: 1, y: 1)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.red.opacity(0.7))
                .cornerRadius(6)
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 15) {
                    ForEach(ships, id: \.id) { ship in
                        VStack(alignment: .leading, spacing: 8) {
                            Text(ship.name)
                                .font(.subheadline)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.8), radius: 2, x: 1, y: 1)
                            
                            Text("Speed: \(String(format: "%.1f", ship.speedValue))")
                                .font(.caption2)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.8), radius: 1, x: 0.5, y: 0.5)
                            Text("Health: \(ship.healthValue)")
                                .font(.caption2)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.8), radius: 1, x: 0.5, y: 0.5)
                            Text("Damage: \(String(format: "%.2f", ship.damageValue))x")
                                .font(.caption2)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.8), radius: 1, x: 0.5, y: 0.5)
                            Text("Weapon: \(ship.weapon)")
                                .font(.caption2)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.8), radius: 1, x: 0.5, y: 0.5)
                        }
                        .padding(10)
                        .frame(width: 150)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(
                                    LinearGradient(
                                        colors: [ship.color1.opacity(0.3), ship.color2.opacity(0.2)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                        )
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white.opacity(0.3))
        )
    }
}

// MARK: - Ship Preview Modal
private struct ShipPreviewModal: View {
    let ship: ShipSelectView.Ship
    let isOwned: Bool
    let onClose: () -> Void
    let onSelect: () -> Void
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.7)
                .ignoresSafeArea()
                .onTapGesture {
                    onClose()
                }
            
            VStack(spacing: 20) {
                // Close button
                HStack {
                    Spacer()
                    Button(action: onClose) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title)
                            .foregroundColor(.white)
                    }
                }
                
                // Ship preview
                VStack(spacing: 15) {
                    // Actual ship graphics
                    ShipPreviewView(
                        shipId: ship.id,
                        characterId: ship.id == "kaden" ? "kaden" : ship.id == "adelynn" ? "adelynn" : "kaden",
                        size: CGSize(width: 120, height: 120),
                        isAnimating: true
                    )
                    .frame(width: 120, height: 120)
                    .shadow(color: ship.color1.opacity(0.6), radius: 20)
                    
                    Text(ship.name)
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text(ship.description)
                        .font(.body)
                        .foregroundColor(.white.opacity(0.9))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    Text(ship.playstyle)
                        .font(.subheadline)
                        .foregroundColor(.yellow)
                        .italic()
                    
                    // Stats
                    VStack(spacing: 10) {
                        StatBar(label: "Speed", value: ship.speedValue, max: 10.0, color: .blue)
                        StatBar(label: "Health", value: Double(ship.healthValue), max: 150.0, color: .green)
                        StatBar(label: "Damage", value: ship.damageValue, max: 1.4, color: .red)
                    }
                    .padding(.horizontal, 40)
                    
                    // Action button
                    Button(action: onSelect) {
                        Text(isOwned ? "Select Ship" : "Unlock for \(ship.cost) ⭐")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(
                                LinearGradient(
                                    colors: [ship.color1, ship.color2],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 40)
                }
                .padding(30)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.blue.opacity(0.9))
                )
                .padding(40)
            }
        }
    }
}
