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
    @StateObject private var adMobManager = AdMobManager.shared
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

        var classLabel: String {
            switch key {
            case "armor_core", "pilot_armor_core", "shield_matrix":
                return "Defense"
            case "cryo_crystal", "freeze_pulse":
                return "Control"
            case "energy_core", "overcharge_core":
                return "Energy"
            case "extra_life", "repair_drone_x2", "supply_crate":
                return "Survival"
            case "homing_chip", "rapid_fire_module", "plasma_missile":
                return "Weapon"
            case "multiplier_orb", "star_magnet", "star_magnet_1x", "diamond_core":
                return "Rewards"
            case "overdrive_thruster", "speed_thruster", "speed_thruster_1x":
                return "Speed"
            default:
                return "Upgrade"
            }
        }

        var tierLabel: String {
            if featured { return "Featured" }
            if cost >= 450 { return "Elite" }
            if cost >= 300 { return "Advanced" }
            return "Core"
        }

        var accentColor: Color {
            switch classLabel {
            case "Defense": return .cyan
            case "Control": return .mint
            case "Energy": return .yellow
            case "Survival": return .green
            case "Weapon": return .pink
            case "Rewards": return .orange
            case "Speed": return .blue
            default: return .purple
            }
        }

        var iconName: String {
            switch key {
            case "armor_core", "pilot_armor_core", "shield_matrix":
                return "shield.lefthalf.filled"
            case "cryo_crystal", "diamond_core":
                return "diamond.fill"
            case "energy_core", "overcharge_core":
                return "bolt.circle.fill"
            case "extra_life", "repair_drone_x2":
                return "cross.case.fill"
            case "freeze_pulse":
                return "snowflake"
            case "homing_chip", "rapid_fire_module":
                return "scope"
            case "multiplier_orb", "star_magnet", "star_magnet_1x":
                return "sparkles"
            case "overdrive_thruster", "speed_thruster", "speed_thruster_1x":
                return "flame.fill"
            case "plasma_missile":
                return "paperplane.circle.fill"
            case "supply_crate":
                return "shippingbox.fill"
            default:
                return "star.circle.fill"
            }
        }

        var iconPrimaryColor: Color {
            switch key {
            case "cryo_crystal", "diamond_core", "freeze_pulse":
                return .cyan
            case "extra_life", "repair_drone_x2":
                return .green
            case "homing_chip", "rapid_fire_module", "plasma_missile":
                return .pink
            case "overdrive_thruster", "speed_thruster", "speed_thruster_1x":
                return .orange
            case "star_magnet", "star_magnet_1x", "multiplier_orb":
                return .yellow
            default:
                return .blue
            }
        }

        var iconSecondaryColor: Color {
            featured ? .yellow : .white
        }
    }
    
    // Collectibles array - Updated to match desktop folder mapping
    let collectibles: [Collectible] = [
        Collectible(key: "armor_core", imageName: "collectible_1", title: "ARMOR CORE", description: "Boosts shield duration by 50%", cost: 250, featured: false),
        Collectible(key: "cryo_crystal", imageName: "collectible_2", title: "CRYO CRYSTAL", description: "Slows enemy waves on pickup", cost: 150, featured: false),
        Collectible(key: "diamond_core", imageName: "collectible_3", title: "DIAMOND CORE", description: "Adds a premium star bonus", cost: 400, featured: false),
        Collectible(key: "energy_core", imageName: "collectible_4", title: "ENERGY CORE", description: "Restores ship energy faster", cost: 100, featured: false),
        Collectible(key: "extra_life", imageName: "collectible_5", title: "EXTRA LIFE", description: "Gain an additional life", cost: 150, featured: false),
        Collectible(key: "freeze_pulse", imageName: "collectible_6", title: "FREEZE PULSE", description: "Freeze enemies in their tracks", cost: 300, featured: false),
        Collectible(key: "homing_chip", imageName: "collectible_7", title: "HOMING CHIP", description: "Bullets automatically track enemies", cost: 350, featured: true),
        Collectible(key: "multiplier_orb", imageName: "collectible_8", title: "MULTIPLIER ORB", description: "Double all stars earned", cost: 400, featured: true),
        Collectible(key: "overcharge_core", imageName: "collectible_9", title: "OVERCHARGE CORE", description: "Massive energy boost for maximum power", cost: 250, featured: true),
        Collectible(key: "overdrive_thruster", imageName: "collectible_10", title: "OVERDRIVE THRUSTER", description: "Ultra-fast speed boost", cost: 250, featured: false),
        Collectible(key: "pilot_armor_core", imageName: "collectible_11", title: "PILOT ARMOR CORE", description: "Protects pilots from one hit", cost: 250, featured: false),
        Collectible(key: "plasma_missile", imageName: "collectible_12", title: "PLASMA MISSILE", description: "Massive explosion clears the screen", cost: 500, featured: true),
        Collectible(key: "rapid_fire_module", imageName: "collectible_13", title: "RAPID FIRE MODULE", description: "Double your firing rate", cost: 300, featured: false),
        Collectible(key: "repair_drone_x2", imageName: "collectible_14", title: "REPAIR DRONE X2", description: "Repairs hull twice per run", cost: 600, featured: true),
        Collectible(key: "shield_matrix", imageName: "collectible_15", title: "SHIELD MATRIX", description: "Adds a stronger shield layer", cost: 250, featured: false),
        Collectible(key: "speed_thruster", imageName: "collectible_16", title: "SPEED THRUSTER", description: "Increase movement speed by 30%", cost: 200, featured: false),
        Collectible(key: "speed_thruster_1x", imageName: "collectible_17", title: "SPEED THRUSTER 1X", description: "Enhanced speed boost", cost: 300, featured: false),
        Collectible(key: "star_magnet", imageName: "collectible_18", title: "STAR MAGNET", description: "Automatically collects all stars", cost: 300, featured: false),
        Collectible(key: "star_magnet_1x", imageName: "collectible_19", title: "STAR MAGNET 1X", description: "Enhanced star collection", cost: 350, featured: false),
        Collectible(key: "supply_crate", imageName: "collectible_20", title: "SUPPLY CRATE", description: "Drops a random battle boost", cost: 300, featured: false)
    ]
    
    var body: some View {
        ZStack {
            // Animated background - adapts to dark mode
            Group {
                if colorScheme == .dark {
                    LinearGradient(
                        colors: [Color.black, Color(red: 0.05, green: 0.09, blue: 0.22), Color(red: 0.06, green: 0.18, blue: 0.42)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                } else {
                    LinearGradient(
                        colors: [Color(red: 0.06, green: 0.18, blue: 0.48), Color(red: 0.05, green: 0.36, blue: 0.68), Color(red: 0.10, green: 0.10, blue: 0.38)],
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
                                .foregroundColor(.white)
                                    .shadow(color: (colorScheme == .dark ? Color.black : Color.white).opacity(0.5), radius: 2)
                            }
                            
                            Spacer()
                            
                            Image(systemName: "cart.fill")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.yellow)
                            Text("Upgrade Store")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.8), radius: 4, x: 0, y: 2)
                                .lineLimit(1)
                                .minimumScaleFactor(0.75)
                            
                            Spacer()
                            
                            // Spacer for balance
                            Image(systemName: "chevron.left.circle.fill")
                                .font(.title)
                                .foregroundColor(.clear)
                        }
                        
                        Text("Enhance your ship with powerful upgrades")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.82))
                    }
                    .padding(.top, 60) // Safe area padding
                    .padding(.horizontal, 20)
                    
                    // Stars Balance Card
                    HStack {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("Your Balance")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.75))
                            HStack(spacing: 6) {
                                Image(systemName: "star.fill")
                                Text("K&A \(gameState.stars)")
                            }
                            .font(.system(size: 30, weight: .bold))
                            .foregroundColor(.yellow)
                        }
                        Spacer()
                        // Custom star with K&A
                        ZStack {
                            Image(systemName: "star.fill")
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
                            colors: [.yellow.opacity(0.24), .orange.opacity(0.16), .white.opacity(0.08)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.yellow.opacity(0.35), lineWidth: 1)
                    )
                    .padding(.horizontal, 20)

                    rewardedAdCard
                    
                    // Upgrades Grid
                    VStack(alignment: .leading, spacing: 15) {
                        HStack {
                            Text("Upgrade Bay")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            Spacer()
                            Text("\(collectibles.count) modules")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.yellow)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.black.opacity(0.25))
                                .cornerRadius(8)
                        }
                        .shadow(color: .black.opacity(0.7), radius: 3, x: 0, y: 1)
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
            loadPurchasedUpgrades()
            AdMobManager.shared.configureAndStart()
            if !adMobManager.isRewardedAdReady {
                adMobManager.loadRewardedAd()
            }
        }
    }

    private var rewardedAdCard: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(LinearGradient(colors: [.cyan, .blue], startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 48, height: 48)
                Image(systemName: "play.rectangle.fill")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Earn Free Stars")
                    .font(.headline)
                    .foregroundColor(.white)
                Text(adMobManager.isRewardedAdReady ? "Watch a short ad to earn 150 K&A stars." : "Reward ad is loading.")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.76))
                    .lineLimit(2)
            }

            Spacer()

            Button {
                adMobManager.showRewardedAd {
                    awardAdStars(150)
                }
            } label: {
                Text(adMobManager.isRewardedAdReady ? "Watch" : "Loading")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.black)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(adMobManager.isRewardedAdReady ? Color.yellow : Color.white.opacity(0.55))
                    .cornerRadius(10)
            }
            .disabled(!adMobManager.isRewardedAdReady)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(
            LinearGradient(
                colors: [.cyan.opacity(0.24), .blue.opacity(0.18), .purple.opacity(0.16)],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.cyan.opacity(0.32), lineWidth: 1)
        )
        .padding(.horizontal, 20)
        .onChange(of: adMobManager.lastMessage) { message in
            guard let message else { return }
            showToast(message: message)
        }
    }

    private func awardAdStars(_ amount: Int) {
        gameState.stars += amount
        gameState.coins = gameState.stars
        UserDefaults.standard.set(gameState.stars, forKey: "walletStars")
        UserDefaults.standard.set(gameState.coins, forKey: "walletCoins")
        showToast(message: "+\(amount) K&A stars earned!")
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
            HStack(spacing: 6) {
                Text(collectible.classLabel)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(1)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 4)
                    .background(collectible.accentColor.opacity(0.72))
                    .cornerRadius(8)

                if collectible.featured {
                    HStack(spacing: 3) {
                        Image(systemName: "sparkles")
                        Text("Featured")
                    }
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.black)
                    .lineLimit(1)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 4)
                    .background(Color.yellow)
                    .cornerRadius(8)
                    .scaleEffect(pulseScale)
                }

                Spacer(minLength: 0)

                if isPurchased {
                    Text("Owned")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 4)
                        .background(Color.green.opacity(0.75))
                        .cornerRadius(8)
                }
            }
            .frame(height: 24)
            
            // Custom upgrade art - Animated floating effect
            ZStack {
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [collectible.accentColor.opacity(0.45), Color.black.opacity(0.14), Color.clear],
                            center: .center,
                            startRadius: 8,
                            endRadius: 54
                        )
                    )
                    .frame(width: 104, height: 104)

                Image(collectible.imageName)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 82, height: 82)
                    .shadow(color: collectible.accentColor.opacity(0.75), radius: isHovered ? 14 : 9)
            }
            .padding(.top, 6)
            .offset(y: floatOffset)
            .scaleEffect(isHovered ? 1.08 : 1.0)
            .rotationEffect(.degrees(isHovered ? 3 : 0))
            
            // Content
            VStack(spacing: 7) {
                Text(collectible.title)
                    .font(.system(size: 15, weight: .heavy))
                    .foregroundColor(.white)
                    .shadow(color: .black.opacity(0.75), radius: 2, x: 0, y: 1)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.72)
                
                Text(collectible.description)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.78))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
                
                // Price
                if !isPurchased {
                    HStack {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                        Text("\(collectible.cost)")
                            .font(.headline)
                            .foregroundColor(.yellow)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.black.opacity(0.25))
                    .cornerRadius(8)
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
                    
                    Text(isPurchased ? "Owned" : canAfford ? "Purchase" : "More Stars")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.5), radius: 2, x: 0, y: 1)
                        .lineLimit(1)
                        .minimumScaleFactor(0.72)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(
                    Group {
                        if isPurchased {
                            Color.gray.opacity(0.55)
                        } else if canAfford {
                            LinearGradient(colors: [.green, collectible.accentColor], startPoint: .leading, endPoint: .trailing)
                        } else {
                            LinearGradient(colors: [.red.opacity(0.68), .pink.opacity(0.56)], startPoint: .leading, endPoint: .trailing)
                        }
                    }
                )
                .cornerRadius(10)
                .scaleEffect(isHovered && canAfford && !isPurchased ? 1.05 : 1.0)
            }
            .disabled(isPurchased || !canAfford)
            .padding(.top, 5)
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(
                        LinearGradient(
                            colors: collectible.featured ? 
                                [collectible.accentColor.opacity(0.34), .purple.opacity(0.22), .black.opacity(0.20)] :
                                [.white.opacity(0.14), collectible.accentColor.opacity(0.16), .black.opacity(0.16)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                
                RoundedRectangle(cornerRadius: 16)
                    .stroke(
                        isPurchased ? Color.green.opacity(0.5) :
                        collectible.featured ? Color.yellow.opacity(0.7) :
                        collectible.accentColor.opacity(0.45),
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
