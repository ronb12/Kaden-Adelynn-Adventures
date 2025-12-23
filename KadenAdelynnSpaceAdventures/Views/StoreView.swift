//
//  StoreView.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced store view with beautiful UI
//

import SwiftUI

struct StoreView: View {
    @EnvironmentObject var gameState: GameStateManager
    @Environment(\.colorScheme) var colorScheme
    @State private var purchasedCollectibles: Set<String> = []
    @State private var showToast = false
    @State private var toastMessage = ""
    
    struct Collectible {
        let key: String
        let imageName: String
        let title: String
        let description: String
        let cost: Int
        let featured: Bool
    }
    
    // Collectibles array - Updated to match desktop folder mapping
    let collectibles: [Collectible] = [
        Collectible(key: "armor_core", imageName: "collectible_1", title: "ARMOR CORE", description: "Increases shield duration by 50%", cost: 250, featured: false),
        Collectible(key: "cryo_crystal", imageName: "collectible_2", title: "CRYO CRYSTAL", description: "Rare currency for special upgrades", cost: 150, featured: false),
        Collectible(key: "diamond_core", imageName: "collectible_3", title: "DIAMOND CORE", description: "Ten freeze pulses ready to use", cost: 400, featured: false),
        Collectible(key: "energy_core", imageName: "collectible_4", title: "ENERGY CORE", description: "Restore energy and boost performance", cost: 100, featured: false),
        Collectible(key: "extra_life", imageName: "collectible_5", title: "EXTRA LIFE", description: "Gain an additional life", cost: 150, featured: false),
        Collectible(key: "freeze_pulse", imageName: "collectible_6", title: "FREEZE PULSE", description: "Freeze enemies in their tracks", cost: 300, featured: false),
        Collectible(key: "homing_chip", imageName: "collectible_7", title: "HOMING CHIP", description: "Bullets automatically track enemies", cost: 350, featured: true),
        Collectible(key: "multiplier_orb", imageName: "collectible_8", title: "MULTIPLIER ORB", description: "Double all stars earned", cost: 400, featured: true),
        Collectible(key: "overcharge_core", imageName: "collectible_9", title: "OVERCHARGE CORE", description: "Massive energy boost for maximum power", cost: 250, featured: true),
        Collectible(key: "overdrive_thruster", imageName: "collectible_10", title: "OVERDRIVE THRUSTER", description: "Ultra-fast speed boost", cost: 250, featured: false),
        Collectible(key: "pilot_armor_core", imageName: "collectible_11", title: "PILOT ARMOR CORE", description: "Bonus stars and multipliers", cost: 250, featured: false),
        Collectible(key: "plasma_missile", imageName: "collectible_12", title: "PLASMA MISSILE", description: "Massive explosion clears the screen", cost: 500, featured: true),
        Collectible(key: "rapid_fire_module", imageName: "collectible_13", title: "RAPID FIRE MODULE", description: "Double your firing rate", cost: 300, featured: false),
        Collectible(key: "repair_drone_x2", imageName: "collectible_14", title: "REPAIR DRONE X2", description: "Dark power for ultimate destruction", cost: 600, featured: true),
        Collectible(key: "shield_matrix", imageName: "collectible_15", title: "SHIELD MATRIX", description: "Extended star collection range", cost: 250, featured: false),
        Collectible(key: "speed_thruster", imageName: "collectible_16", title: "SPEED THRUSTER", description: "Increase movement speed by 30%", cost: 200, featured: false),
        Collectible(key: "speed_thruster_1x", imageName: "collectible_17", title: "SPEED THRUSTER 1X", description: "Enhanced speed boost", cost: 300, featured: false),
        Collectible(key: "star_magnet", imageName: "collectible_18", title: "STAR MAGNET", description: "Automatically collects all stars", cost: 300, featured: false),
        Collectible(key: "star_magnet_1x", imageName: "collectible_19", title: "STAR MAGNET 1X", description: "Enhanced star collection", cost: 350, featured: false),
        Collectible(key: "supply_crate", imageName: "collectible_20", title: "SUPPLY CRATE", description: "Maximum speed enhancement", cost: 300, featured: false)
    ]
    
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
                VStack(spacing: 25) {
                    // Header
                    VStack(spacing: 10) {
                        HStack {
                            Button(action: {
                                gameState.currentScreen = .mainMenu
                            }) {
                                Image(systemName: "chevron.left.circle.fill")
                                    .font(.title)
                                    .foregroundColor(colorScheme == .dark ? Color.white : Color.black)
                                    .shadow(color: (colorScheme == .dark ? Color.black : Color.white).opacity(0.5), radius: 2)
                            }
                            
                            Spacer()
                            
                            Text("🛒")
                                .font(.system(size: 50))
                            Text("Upgrade Store")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(.black)
                                .shadow(color: .black.opacity(0.8), radius: 4, x: 0, y: 2)
                            
                            Spacer()
                            
                            // Spacer for balance
                            Image(systemName: "chevron.left.circle.fill")
                                .font(.title)
                                .foregroundColor(.clear)
                        }
                        
                        Text("Enhance your ship with powerful upgrades")
                            .font(.subheadline)
                            .foregroundColor(.black.opacity(0.8))
                    }
                    .padding(.top, 60) // Safe area padding
                    .padding(.horizontal, 20)
                    
                    // Stars Balance Card
                    HStack {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("Your Balance")
                                .font(.caption)
                                .foregroundColor(.black.opacity(0.8))
                            Text("⭐ K&A \(gameState.stars)")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.yellow)
                        }
                        Spacer()
                        // Custom star with K&A
                        ZStack {
                            Text("⭐")
                                .font(.system(size: 40))
                                .foregroundColor(.yellow)
                            Text("K&A")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.black)
                                .offset(y: -2)
                        }
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
                    
                    // Upgrades Grid
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Available Collectibles")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .shadow(color: .black.opacity(0.8), radius: 3, x: 0, y: 1)
                            .padding(.horizontal, 20)
                        
                        LazyVGrid(columns: [
                            GridItem(.flexible(), spacing: 15),
                            GridItem(.flexible(), spacing: 15)
                        ], spacing: 15) {
                            ForEach(Array(collectibles.enumerated()), id: \.element.key) { index, collectible in
                                AnimatedStoreCard(
                                    collectible: collectible,
                                    isPurchased: purchasedCollectibles.contains(collectible.key),
                                    canAfford: gameState.stars >= collectible.cost,
                                    index: index,
                                    onPurchase: {
                                        purchaseCollectible(collectible)
                                    }
                                )
                            }
                        }
                        .padding(.horizontal, 20)
                    }
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
                            .foregroundColor(.black)
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
            loadPurchasedUpgrades()
        }
    }
    
    private func loadPurchasedUpgrades() {
        var purchased: Set<String> = []
        for collectible in collectibles {
            if UserDefaults.standard.bool(forKey: "collectible_\(collectible.key)") {
                purchased.insert(collectible.key)
            }
        }
        purchasedCollectibles = purchased
    }
    
    private func purchaseCollectible(_ collectible: Collectible) {
        if purchasedCollectibles.contains(collectible.key) {
            showToast(message: "\(collectible.title) is already purchased!")
            return
        }
        
        if gameState.stars >= collectible.cost {
            gameState.stars -= collectible.cost
            gameState.coins = gameState.stars  // Keep in sync
            UserDefaults.standard.set(gameState.stars, forKey: "walletStars")
            UserDefaults.standard.set(gameState.coins, forKey: "walletCoins")
            UserDefaults.standard.set(true, forKey: "collectible_\(collectible.key)")
            purchasedCollectibles.insert(collectible.key)
            showToast(message: "\(collectible.title) Purchased!")
        } else {
            showToast(message: "Not enough stars!")
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

// Wrapper for entrance animation
private struct AnimatedStoreCard: View {
    let collectible: StoreView.Collectible
    let isPurchased: Bool
    let canAfford: Bool
    let index: Int
    let onPurchase: () -> Void
    @State private var isVisible = false
    
    var body: some View {
        StoreCollectibleCard(
            collectible: collectible,
            isPurchased: isPurchased,
            canAfford: canAfford,
            onPurchase: onPurchase
        )
        .opacity(isVisible ? 1 : 0)
        .scaleEffect(isVisible ? 1 : 0.8)
        .onAppear {
            withAnimation(
                .spring(response: 0.6, dampingFraction: 0.8)
                .delay(Double(index) * 0.05)
            ) {
                isVisible = true
            }
        }
    }
}

private struct StoreCollectibleCard: View {
    let collectible: StoreView.Collectible
    let isPurchased: Bool
    let canAfford: Bool
    let onPurchase: () -> Void
    @State private var isHovered = false
    @State private var floatOffset: CGFloat = 0
    @State private var pulseScale: CGFloat = 1.0
    @State private var shimmerOffset: CGFloat = -200
    
    // Calculate animation delay based on collectible index
    var animationDelay: Double {
        // Simple hash-based delay for staggered animations
        let index = collectible.key.hashValue
        return Double(abs(index) % 10) * 0.1
    }
    
    var body: some View {
        VStack(spacing: 12) {
            // Badges
            ZStack {
                if collectible.featured {
                    HStack {
                        Spacer()
                        Text("⭐ Popular")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.yellow)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.yellow.opacity(0.3))
                            .cornerRadius(8)
                            .scaleEffect(pulseScale)
                    }
                }
                
                if isPurchased {
                    HStack {
                        Text("✓ Owned")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.green.opacity(0.3))
                            .cornerRadius(8)
                        Spacer()
                    }
                }
            }
            .frame(height: 20)
            
            // Collectible Image - Animated floating effect
            Image(collectible.imageName)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 80, height: 80)
                .padding(.top, 10)
                .offset(y: floatOffset)
                .scaleEffect(isHovered ? 1.1 : 1.0)
                .rotationEffect(.degrees(isHovered ? 5 : 0))
                .shadow(color: collectible.featured ? .yellow.opacity(0.6) : .black.opacity(0.3), 
                       radius: isHovered ? 15 : 8)
            
            // Content
            VStack(spacing: 8) {
                Text(collectible.title)
                    .font(.headline)
                    .foregroundColor(.black)
                    .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                
                Text(collectible.description)
                    .font(.caption)
                    .foregroundColor(.black.opacity(0.8))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                
                // Price
                if !isPurchased {
                    HStack {
                        Text("⭐")
                        Text("\(collectible.cost)")
                            .font(.headline)
                            .foregroundColor(.yellow)
                    }
                    .padding(.vertical, 8)
                }
            }
            
            // Purchase Button with shimmer effect for affordable items
            Button(action: {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    onPurchase()
                }
            }) {
                ZStack {
                    // Shimmer effect for affordable items
                    if canAfford && !isPurchased {
                        LinearGradient(
                            colors: [.clear, .white.opacity(0.3), .clear],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                        .offset(x: shimmerOffset)
                        .frame(width: 200)
                    }
                    
                    Text(isPurchased ? "Owned" : canAfford ? "Purchase" : "Need More Stars")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                        .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(
                    Group {
                        if isPurchased {
                            Color.gray.opacity(0.5)
                        } else if canAfford {
                            LinearGradient(colors: [.green, .blue], startPoint: .leading, endPoint: .trailing)
                        } else {
                            Color.red.opacity(0.5)
                        }
                    }
                )
                .cornerRadius(10)
                .scaleEffect(isHovered && canAfford && !isPurchased ? 1.05 : 1.0)
            }
            .disabled(isPurchased || !canAfford)
            .padding(.top, 5)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(
                        LinearGradient(
                            colors: collectible.featured ? 
                                [.purple.opacity(0.3), .blue.opacity(0.2)] :
                                [.white.opacity(0.1), .white.opacity(0.05)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                
                RoundedRectangle(cornerRadius: 16)
                    .stroke(
                        isPurchased ? Color.green.opacity(0.5) :
                        collectible.featured ? Color.yellow.opacity(0.5) :
                        Color.white.opacity(0.2),
                        lineWidth: isHovered ? 3 : 2
                    )
            }
        )
        .shadow(color: collectible.featured ? .yellow.opacity(isHovered ? 0.5 : 0.3) : .black.opacity(0.3), 
               radius: isHovered ? 15 : 10)
        .scaleEffect(isHovered ? 1.02 : 1.0)
        .offset(y: isHovered ? -5 : 0)
        .opacity(isPurchased ? 0.8 : 1.0)
        .onAppear {
            // Staggered entrance animation
            withAnimation(
                .easeInOut(duration: 0.6)
                .delay(animationDelay)
            ) {
                // Entrance animation handled by opacity/scale
            }
            
            // Floating animation for image
            withAnimation(
                .easeInOut(duration: 2.0)
                .repeatForever(autoreverses: true)
                .delay(animationDelay)
            ) {
                floatOffset = -8
            }
            
            // Pulse animation for featured items
            if collectible.featured {
                withAnimation(
                    .easeInOut(duration: 1.5)
                    .repeatForever(autoreverses: true)
                    .delay(animationDelay)
                ) {
                    pulseScale = 1.1
                }
            }
            
            // Shimmer animation for affordable items
            if canAfford && !isPurchased {
                withAnimation(
                    .linear(duration: 2.0)
                    .repeatForever(autoreverses: false)
                    .delay(animationDelay)
                ) {
                    shimmerOffset = 200
                }
            }
        }
        .onTapGesture {
            if canAfford && !isPurchased {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    isHovered = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                        isHovered = false
                    }
                }
            }
        }
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    if canAfford && !isPurchased {
                        withAnimation(.spring(response: 0.2, dampingFraction: 0.7)) {
                            isHovered = true
                        }
                    }
                }
                .onEnded { _ in
                    withAnimation(.spring(response: 0.2, dampingFraction: 0.7)) {
                        isHovered = false
                    }
                }
        )
    }
}
