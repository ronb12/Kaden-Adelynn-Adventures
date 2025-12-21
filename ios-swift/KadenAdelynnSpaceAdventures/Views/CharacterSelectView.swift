//
//  CharacterSelectView.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced character selection view with all recommendations
//

import SwiftUI

struct CharacterSelectView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var ownedCharacters: Set<String> = []
    @State private var showToast = false
    @State private var toastMessage = ""
    @State private var selectedCategory: CharacterCategory = .all
    @State private var searchText = ""
    @State private var favorites: Set<String> = []
    @State private var recentlyUsed: [String] = []
    @State private var comparingCharacters: [String] = []
    @State private var previewCharacter: Character? = nil
    @State private var showComparison = false
    
    enum CharacterCategory: String, CaseIterable {
        case all = "All"
        case starter = "Starter"
        case speed = "Speed"
        case tank = "Tank"
        case dps = "DPS"
        case balanced = "Balanced"
    }
    
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
        let category: CharacterCategory
        let description: String
        let playstyle: String
        let speedValue: Double
        let healthValue: Int
        let damageValue: Double
        let unlockRequirement: String?
        let unlockProgress: Double?
    }
    
    let characters: [Character] = [
        Character(id: "kaden", icon: "🧑🏿‍🚀", name: "Kaden", weapon: "Laser", speed: "Medium", strength: "Medium", color1: .cyan, color2: .blue, cost: 0, isDefault: true, category: .starter, description: "A balanced space explorer. Reliable and versatile for all situations.", playstyle: "Best for: Beginners", speedValue: 7.0, healthValue: 100, damageValue: 1.0, unlockRequirement: nil, unlockProgress: nil),
        Character(id: "adelynn", icon: "👩‍🚀", name: "Adelynn", weapon: "Spread", speed: "High", strength: "Low", color1: .pink, color2: .purple, cost: 0, isDefault: true, category: .speed, description: "Lightning-fast pilot with spread shot capability. High mobility, lower durability.", playstyle: "Best for: Advanced players", speedValue: 9.0, healthValue: 80, damageValue: 0.9, unlockRequirement: nil, unlockProgress: nil),
        Character(id: "hero3", icon: "🧑🏽‍🚀", name: "Orion", weapon: "Plasma", speed: "Medium", strength: "High", color1: .yellow, color2: .orange, cost: 150, isDefault: false, category: .dps, description: "Powerful warrior with plasma weapons. High damage output and durability.", playstyle: "Best for: Damage dealers", speedValue: 7.0, healthValue: 110, damageValue: 1.1, unlockRequirement: "Reach Wave 3", unlockProgress: nil),
        Character(id: "hero4", icon: "👩🏻‍🚀", name: "Lyra", weapon: "Lightning", speed: "High", strength: "Medium", color1: .green, color2: .blue, cost: 150, isDefault: false, category: .speed, description: "Swift electric warrior. Fast movement with chain lightning attacks.", playstyle: "Best for: Speed and control", speedValue: 8.0, healthValue: 90, damageValue: 1.0, unlockRequirement: "Kill 30 enemies", unlockProgress: nil),
        Character(id: "hero5", icon: "🧔‍🚀", name: "Jax", weapon: "Shotgun", speed: "Low", strength: "High", color1: .gray, color2: .black, cost: 150, isDefault: false, category: .tank, description: "Heavy armored fighter. Slow but devastating close-range power.", playstyle: "Best for: Tank players", speedValue: 5.0, healthValue: 130, damageValue: 1.2, unlockRequirement: "Survive 3 minutes", unlockProgress: nil),
        Character(id: "hero6", icon: "👩🏾‍🚀", name: "Vega", weapon: "Homing", speed: "Medium", strength: "Medium", color1: .blue, color2: .cyan, cost: 150, isDefault: false, category: .balanced, description: "Well-rounded pilot with homing missiles. Balanced stats for versatility.", playstyle: "Best for: Versatile gameplay", speedValue: 7.0, healthValue: 100, damageValue: 1.0, unlockRequirement: "Score 5,000 points", unlockProgress: nil),
        Character(id: "hero7", icon: "🧑🏼‍🚀", name: "Kael", weapon: "Railgun", speed: "Low", strength: "High", color1: .orange, color2: .yellow, cost: 150, isDefault: false, category: .tank, description: "Heavy weapons specialist. Maximum firepower with railgun technology.", playstyle: "Best for: Maximum damage", speedValue: 5.5, healthValue: 120, damageValue: 1.3, unlockRequirement: "Destroy 2 boss ships", unlockProgress: nil),
        Character(id: "hero8", icon: "👩🏼‍🚀", name: "Nova", weapon: "Beam", speed: "High", strength: "Low", color1: .purple, color2: .pink, cost: 150, isDefault: false, category: .speed, description: "Fast interceptor with continuous beam weapons. High speed, lower health.", playstyle: "Best for: Fast-paced action", speedValue: 8.5, healthValue: 75, damageValue: 0.9, unlockRequirement: "Complete 15 waves", unlockProgress: nil),
        Character(id: "hero9", icon: "🧑🏻‍🚀", name: "Rio", weapon: "Missile", speed: "Medium", strength: "High", color1: .blue, color2: .indigo, cost: 150, isDefault: false, category: .dps, description: "Explosive expert with missile launchers. High damage, balanced mobility.", playstyle: "Best for: Explosive combat", speedValue: 7.0, healthValue: 110, damageValue: 1.1, unlockRequirement: "Get 5 combo kills", unlockProgress: nil),
        Character(id: "hero10", icon: "👩🏽‍🚀", name: "Mira", weapon: "Ice", speed: "Medium", strength: "Medium", color1: .orange, color2: .red, cost: 150, isDefault: false, category: .balanced, description: "Cryo-warrior with freeze weapons. Balanced stats with crowd control.", playstyle: "Best for: Balanced gameplay", speedValue: 7.0, healthValue: 100, damageValue: 1.0, unlockRequirement: "Reach Wave 7", unlockProgress: nil)
    ]
    
    var filteredCharacters: [Character] {
        var filtered = characters
        
        // Filter by category
        if selectedCategory != .all {
            filtered = filtered.filter { $0.category == selectedCategory }
        }
        
        // Filter by search
        if !searchText.isEmpty {
            filtered = filtered.filter { character in
                character.name.localizedCaseInsensitiveContains(searchText) ||
                character.weapon.localizedCaseInsensitiveContains(searchText) ||
                character.description.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // Sort: favorites first, then recently used, then owned, then by cost
        return filtered.sorted { char1, char2 in
            let fav1 = favorites.contains(char1.id)
            let fav2 = favorites.contains(char2.id)
            if fav1 != fav2 { return fav1 }
            
            let recent1 = recentlyUsed.firstIndex(of: char1.id) ?? Int.max
            let recent2 = recentlyUsed.firstIndex(of: char2.id) ?? Int.max
            if recent1 != recent2 { return recent1 < recent2 }
            
            let owned1 = ownedCharacters.contains(char1.id) || char1.isDefault
            let owned2 = ownedCharacters.contains(char2.id) || char2.isDefault
            if owned1 != owned2 { return owned1 }
            
            return char1.cost < char2.cost
        }
    }
    
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
                            
                            Text("🧑‍🚀")
                                .font(.system(size: 50))
                            Text("Choose Your Character")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.black)
                                .shadow(color: .black.opacity(0.8), radius: 4, x: 0, y: 2)
                            
                            Spacer()
                            
                            // Comparison button
                            Button(action: {
                                showComparison.toggle()
                            }) {
                                Image(systemName: comparingCharacters.isEmpty ? "square.on.square" : "square.on.square.fill")
                                    .font(.title2)
                                    .foregroundColor(.black)
                                    .shadow(color: .white.opacity(0.5), radius: 2)
                            }
                            .overlay(
                                Group {
                                    if !comparingCharacters.isEmpty {
                                        Text("\(comparingCharacters.count)")
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
                        
                        Text("Select your space adventurer")
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
                        TextField("Search characters...", text: $searchText)
                            .foregroundColor(.black)
                    }
                    .padding()
                    .background(Color.white.opacity(0.3))
                    .cornerRadius(12)
                    .padding(.horizontal, 20)
                    
                    // Category Tabs
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(CharacterCategory.allCases, id: \.self) { category in
                                Button(action: {
                                    withAnimation {
                                        selectedCategory = category
                                    }
                                }) {
                                    Text(category.rawValue)
                                        .font(.subheadline)
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
                    if showComparison && !comparingCharacters.isEmpty {
                        CharacterComparisonView(
                            characters: characters.filter { comparingCharacters.contains($0.id) },
                            onClose: { showComparison = false },
                            onClear: { comparingCharacters.removeAll() }
                        )
                        .padding(.horizontal, 20)
                    }
                    
                    // Characters Grid
                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 15),
                        GridItem(.flexible(), spacing: 15)
                    ], spacing: 15) {
                        ForEach(filteredCharacters, id: \.id) { character in
                            EnhancedCharacterCard(
                                character: character,
                                isSelected: gameState.selectedCharacter == character.id,
                                isOwned: ownedCharacters.contains(character.id) || character.isDefault,
                                isFavorite: favorites.contains(character.id),
                                isComparing: comparingCharacters.contains(character.id),
                                onSelect: {
                                    if ownedCharacters.contains(character.id) || character.isDefault {
                                        gameState.selectedCharacter = character.id
                                        addToRecentlyUsed(character.id)
                                        gameState.currentScreen = .shipSelect
                                    } else {
                                        purchaseCharacter(character)
                                    }
                                },
                                onFavorite: {
                                    toggleFavorite(character.id)
                                },
                                onCompare: {
                                    toggleCompare(character.id)
                                },
                                onPreview: {
                                    previewCharacter = character
                                }
                            )
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
            }
            
            // Preview Modal
            if let preview = previewCharacter {
                CharacterPreviewModal(
                    character: preview,
                    isOwned: ownedCharacters.contains(preview.id) || preview.isDefault,
                    onClose: { previewCharacter = nil },
                    onSelect: {
                        if ownedCharacters.contains(preview.id) || preview.isDefault {
                            gameState.selectedCharacter = preview.id
                            addToRecentlyUsed(preview.id)
                            previewCharacter = nil
                            gameState.currentScreen = .shipSelect
                        } else {
                            purchaseCharacter(preview)
                            previewCharacter = nil
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
            loadOwnedCharacters()
            loadFavorites()
            loadRecentlyUsed()
        }
    }
    
    private func loadOwnedCharacters() {
        if let data = UserDefaults.standard.data(forKey: "ownedChars"),
           let owned = try? JSONDecoder().decode([String].self, from: data) {
            ownedCharacters = Set(owned)
        }
        ownedCharacters.insert("kaden")
        ownedCharacters.insert("adelynn")
    }
    
    private func loadFavorites() {
        if let data = UserDefaults.standard.data(forKey: "favoriteCharacters"),
           let favs = try? JSONDecoder().decode([String].self, from: data) {
            favorites = Set(favs)
        }
    }
    
    private func loadRecentlyUsed() {
        if let data = UserDefaults.standard.data(forKey: "recentlyUsedCharacters"),
           let recent = try? JSONDecoder().decode([String].self, from: data) {
            recentlyUsed = recent
        }
    }
    
    private func toggleFavorite(_ characterId: String) {
        if favorites.contains(characterId) {
            favorites.remove(characterId)
        } else {
            favorites.insert(characterId)
        }
        if let data = try? JSONEncoder().encode(Array(favorites)) {
            UserDefaults.standard.set(data, forKey: "favoriteCharacters")
        }
    }
    
    private func addToRecentlyUsed(_ characterId: String) {
        recentlyUsed.removeAll { $0 == characterId }
        recentlyUsed.insert(characterId, at: 0)
        if recentlyUsed.count > 5 {
            recentlyUsed = Array(recentlyUsed.prefix(5))
        }
        if let data = try? JSONEncoder().encode(recentlyUsed) {
            UserDefaults.standard.set(data, forKey: "recentlyUsedCharacters")
        }
    }
    
    private func toggleCompare(_ characterId: String) {
        if comparingCharacters.contains(characterId) {
            comparingCharacters.removeAll { $0 == characterId }
        } else {
            if comparingCharacters.count < 3 {
                comparingCharacters.append(characterId)
            }
        }
    }
    
    private func purchaseCharacter(_ character: Character) {
        if gameState.coins >= character.cost {
            gameState.coins -= character.cost
            UserDefaults.standard.set(gameState.coins, forKey: "walletStars")
            
            var owned = Array(ownedCharacters)
            owned.append(character.id)
            if let data = try? JSONEncoder().encode(owned) {
                UserDefaults.standard.set(data, forKey: "ownedChars")
            }
            ownedCharacters.insert(character.id)
            
            // Celebration effect
            showToast(message: "🎉 Character unlocked! \(character.name) is now yours!")
            
            // Haptic feedback
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.success)
        } else {
            showToast(message: "Not enough stars! Need \(character.cost - gameState.coins) more.")
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

// MARK: - Enhanced Character Card
private struct EnhancedCharacterCard: View {
    let character: CharacterSelectView.Character
    let isSelected: Bool
    let isOwned: Bool
    let isFavorite: Bool
    let isComparing: Bool
    let onSelect: () -> Void
    let onFavorite: () -> Void
    let onCompare: () -> Void
    let onPreview: () -> Void
    
    var overallRating: Double {
        let speedScore = (character.speedValue / 10.0) * 0.3
        let healthScore = (Double(character.healthValue) / 150.0) * 0.3
        let damageScore = (character.damageValue / 1.4) * 0.4
        return (speedScore + healthScore + damageScore) * 5.0
    }
    
    var bestStat: String {
        let stats = [
            ("Speed", character.speedValue),
            ("Health", Double(character.healthValue)),
            ("Damage", character.damageValue * 10)
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
                    .buttonStyle(.plain)
                    
                    Spacer()
                    
                    // Selected badge
                    if isSelected {
                        Text("✓ Selected")
                            .font(.caption2)
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
                    .buttonStyle(.plain)
                }
                
                // Character Portrait from Assets
                Image("\(character.id)_character")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 120, height: 120)
                    .clipShape(Circle())
                    .overlay(
                        Circle()
                            .stroke(character.color1.opacity(0.6), lineWidth: isSelected ? 4 : 2)
                    )
                    .scaleEffect(isSelected ? 1.1 : 1.0)
                
                // Name and Rating
                VStack(spacing: 3) {
                    Text(character.name)
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
                Text(character.description)
                    .font(.caption2)
                    .foregroundColor(.black.opacity(0.7))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .padding(.horizontal, 4)
                
                // Playstyle
                Text(character.playstyle)
                    .font(.caption2)
                    .foregroundColor(.purple)
                    .italic()
                
                // Visual Stat Bars
                VStack(spacing: 4) {
                    StatBar(label: "Speed", value: character.speedValue, max: 10.0, color: .blue)
                    StatBar(label: "Health", value: Double(character.healthValue), max: 150.0, color: .green)
                    StatBar(label: "Damage", value: character.damageValue, max: 1.4, color: .red)
                }
                .padding(.horizontal, 4)
                
                // Actual Values
                VStack(spacing: 2) {
                    HStack {
                        Text("Speed:")
                            .font(.caption2)
                            .foregroundColor(.black.opacity(0.6))
                        Text("\(String(format: "%.1f", character.speedValue))")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                        Text("HP:")
                            .font(.caption2)
                            .foregroundColor(.black.opacity(0.6))
                        Text("\(character.healthValue)")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                    }
                    HStack {
                        Text("Dmg:")
                            .font(.caption2)
                            .foregroundColor(.black.opacity(0.6))
                        Text("\(String(format: "%.2f", character.damageValue))x")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        Spacer()
                        Text("Weapon:")
                            .font(.caption2)
                            .foregroundColor(.black.opacity(0.6))
                        Text(character.weapon)
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                    }
                }
                .padding(.horizontal, 4)
                
                // Unlock requirement
                if !isOwned, let requirement = character.unlockRequirement {
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
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.8), radius: 2, x: 1, y: 1)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.blue.opacity(0.7))
                            .cornerRadius(6)
                    }
                    .buttonStyle(.plain)
                    
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
                            Text("\(character.cost)")
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
                                    [character.color1.opacity(0.4), character.color2.opacity(0.3)] :
                                    isComparing ?
                                    [.blue.opacity(0.2), .purple.opacity(0.15)] :
                                    [.white.opacity(0.15), .white.opacity(0.1)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                    
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(
                            isSelected ? character.color1.opacity(0.9) :
                            isComparing ? Color.blue.opacity(0.7) :
                            isOwned ? Color.white.opacity(0.4) :
                            Color.red.opacity(0.5),
                            lineWidth: isSelected ? 3 : isComparing ? 2.5 : 2
                        )
                }
            )
            .shadow(color: isSelected ? character.color1.opacity(0.6) : .black.opacity(0.3), radius: isSelected ? 20 : 10)
            .scaleEffect(isSelected ? 1.02 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Stat Bar (reused from ShipSelectView)
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

// MARK: - Character Comparison View
private struct CharacterComparisonView: View {
    let characters: [CharacterSelectView.Character]
    let onClose: () -> Void
    let onClear: () -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Character Comparison")
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
                    ForEach(characters, id: \.id) { character in
                        VStack(alignment: .leading, spacing: 8) {
                            Text(character.name)
                                .font(.subheadline)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.8), radius: 2, x: 1, y: 1)
                            
                            Text("Speed: \(String(format: "%.1f", character.speedValue))")
                                .font(.caption2)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.8), radius: 1, x: 0.5, y: 0.5)
                            Text("Health: \(character.healthValue)")
                                .font(.caption2)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.8), radius: 1, x: 0.5, y: 0.5)
                            Text("Damage: \(String(format: "%.2f", character.damageValue))x")
                                .font(.caption2)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.8), radius: 1, x: 0.5, y: 0.5)
                            Text("Weapon: \(character.weapon)")
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
                                        colors: [character.color1.opacity(0.3), character.color2.opacity(0.2)],
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

// MARK: - Character Preview Modal
private struct CharacterPreviewModal: View {
    let character: CharacterSelectView.Character
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
                
                // Character preview
                VStack(spacing: 15) {
                    // Actual character graphics
                    CharacterPreviewView(
                        characterId: character.id,
                        size: CGSize(width: 120, height: 120),
                        isAnimating: true,
                        isSelected: true
                    )
                    .frame(width: 120, height: 120)
                    .shadow(color: character.color1.opacity(0.6), radius: 20)
                    
                    Text(character.name)
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text(character.description)
                        .font(.body)
                        .foregroundColor(.white.opacity(0.9))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    Text(character.playstyle)
                        .font(.subheadline)
                        .foregroundColor(.yellow)
                        .italic()
                    
                    // Stats
                    VStack(spacing: 10) {
                        StatBar(label: "Speed", value: character.speedValue, max: 10.0, color: .blue)
                        StatBar(label: "Health", value: Double(character.healthValue), max: 150.0, color: .green)
                        StatBar(label: "Damage", value: character.damageValue, max: 1.4, color: .red)
                    }
                    .padding(.horizontal, 40)
                    
                    // Action button
                    Button(action: onSelect) {
                        Text(isOwned ? "Select Character" : "Unlock for \(character.cost) ⭐")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(
                                LinearGradient(
                                    colors: [character.color1, character.color2],
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
