//
//  StoreView.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced store view with beautiful UI
//

import SwiftUI

struct StoreView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var purchasedUpgrades: Set<String> = []
    @State private var showToast = false
    @State private var toastMessage = ""
    
    struct Upgrade {
        let key: String
        let icon: String
        let title: String
        let description: String
        let cost: Int
        let emoji: String
        let featured: Bool
    }
    
    let upgrades: [Upgrade] = [
        Upgrade(key: "shield", icon: "🛡️", title: "Shield Boost", description: "Increases shield duration by 50%", cost: 200, emoji: "🛡️", featured: false),
        Upgrade(key: "speed", icon: "💨", title: "Speed Boost", description: "Increases ship movement speed by 30%", cost: 200, emoji: "💨", featured: false),
        Upgrade(key: "rapid", icon: "⚡", title: "Rapid Fire", description: "Doubles your firing rate", cost: 300, emoji: "⚡", featured: false),
        Upgrade(key: "doubler", icon: "⭐", title: "Star Doubler", description: "Double all stars earned in-game", cost: 400, emoji: "⭐", featured: true),
        Upgrade(key: "life", icon: "❤️", title: "Extra Life", description: "Gain an additional life", cost: 150, emoji: "❤️", featured: false)
    ]
    
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
                VStack(spacing: 25) {
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
                            Text("⭐ \(gameState.coins)")
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
                        Text("Available Upgrades")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                            .shadow(color: .black.opacity(0.8), radius: 3, x: 0, y: 1)
                            .padding(.horizontal, 20)
                        
                        LazyVGrid(columns: [
                            GridItem(.flexible(), spacing: 15),
                            GridItem(.flexible(), spacing: 15)
                        ], spacing: 15) {
                            ForEach(upgrades, id: \.key) { upgrade in
                                StoreUpgradeCard(
                                    upgrade: upgrade,
                                    isPurchased: purchasedUpgrades.contains(upgrade.key),
                                    canAfford: gameState.coins >= upgrade.cost,
                                    onPurchase: {
                                        purchaseUpgrade(upgrade)
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
        for upgrade in upgrades {
            if UserDefaults.standard.bool(forKey: "upgrade_\(upgrade.key)") {
                purchased.insert(upgrade.key)
            }
        }
        purchasedUpgrades = purchased
    }
    
    private func purchaseUpgrade(_ upgrade: Upgrade) {
        if purchasedUpgrades.contains(upgrade.key) {
            showToast(message: "\(upgrade.emoji) \(upgrade.title) is already purchased!")
            return
        }
        
        if gameState.coins >= upgrade.cost {
            gameState.coins -= upgrade.cost
            UserDefaults.standard.set(gameState.coins, forKey: "walletCoins")
            UserDefaults.standard.set(true, forKey: "upgrade_\(upgrade.key)")
            purchasedUpgrades.insert(upgrade.key)
            showToast(message: "\(upgrade.emoji) \(upgrade.title) Purchased!")
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

private struct StoreUpgradeCard: View {
    let upgrade: StoreView.Upgrade
    let isPurchased: Bool
    let canAfford: Bool
    let onPurchase: () -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            // Badges
            ZStack {
                if upgrade.featured {
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
            
            // Icon
            Text(upgrade.icon)
                .font(.system(size: 50))
                .padding(.top, 10)
            
            // Content
            VStack(spacing: 8) {
                Text(upgrade.title)
                    .font(.headline)
                    .foregroundColor(.black)
                    .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
                    .multilineTextAlignment(.center)
                
                Text(upgrade.description)
                    .font(.caption)
                    .foregroundColor(.black.opacity(0.8))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                
                // Price
                if !isPurchased {
                    HStack {
                        Text("⭐")
                        Text("\(upgrade.cost)")
                            .font(.headline)
                            .foregroundColor(.yellow)
                    }
                    .padding(.vertical, 8)
                }
            }
            
            // Purchase Button
            Button(action: onPurchase) {
                    Text(isPurchased ? "Owned" : canAfford ? "Purchase" : "Need More Stars")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                        .shadow(color: .white.opacity(0.5), radius: 2, x: 0, y: 1)
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
                            colors: upgrade.featured ? 
                                [.purple.opacity(0.3), .blue.opacity(0.2)] :
                                [.white.opacity(0.1), .white.opacity(0.05)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                
                RoundedRectangle(cornerRadius: 16)
                    .stroke(
                        isPurchased ? Color.green.opacity(0.5) :
                        upgrade.featured ? Color.yellow.opacity(0.5) :
                        Color.white.opacity(0.2),
                        lineWidth: 2
                    )
            }
        )
        .shadow(color: upgrade.featured ? .yellow.opacity(0.3) : .black.opacity(0.3), radius: 10)
    }
}
