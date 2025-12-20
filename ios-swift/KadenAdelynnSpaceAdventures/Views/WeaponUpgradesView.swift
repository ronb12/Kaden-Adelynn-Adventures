//
//  WeaponUpgradesView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct WeaponUpgradesView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var selectedWeapon = "laser"
    @State private var coins: Int = 0
    
    struct Upgrade {
        let name: String
        let level: Int
        let cost: Int
        let maxLevel: Int
    }
    
    @State private var upgrades: [String: [Upgrade]] = [
        "laser": [
            Upgrade(name: "Damage", level: 1, cost: 100, maxLevel: 10),
            Upgrade(name: "Fire Rate", level: 1, cost: 100, maxLevel: 10),
            Upgrade(name: "Range", level: 1, cost: 100, maxLevel: 10),
            Upgrade(name: "Accuracy", level: 1, cost: 100, maxLevel: 10),
            Upgrade(name: "Special", level: 1, cost: 200, maxLevel: 5)
        ]
    ]
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack {
                // Header
                HStack {
                    Text("⚔️ Weapon Upgrades")
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
                
                // Weapon selector
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(["laser", "spread", "plasma", "missile"], id: \.self) { weapon in
                            Button(weapon.capitalized) {
                                selectedWeapon = weapon
                            }
                            .padding()
                            .background(selectedWeapon == weapon ? Color.blue : Color.white.opacity(0.2))
                            .foregroundColor(.white)
                            .cornerRadius(8)
                        }
                    }
                    .padding(.horizontal)
                }
                
                // Upgrades list
                ScrollView {
                    VStack(spacing: 15) {
                        if let weaponUpgrades = upgrades[selectedWeapon] {
                            ForEach(weaponUpgrades, id: \.name) { upgrade in
                                UpgradeCard(upgrade: upgrade, coins: coins) {
                                    purchaseUpgrade(upgrade)
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
    
    private func purchaseUpgrade(_ upgrade: Upgrade) {
        if coins >= upgrade.cost {
            coins -= upgrade.cost
            UserDefaults.standard.set(coins, forKey: "walletCoins")
            // TODO: Save upgrade level
        }
    }
}

struct UpgradeCard: View {
    let upgrade: WeaponUpgradesView.Upgrade
    let coins: Int
    let onPurchase: () -> Void
    
    var canAfford: Bool {
        coins >= upgrade.cost
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(upgrade.name)
                    .font(.headline)
                    .foregroundColor(.white)
                
                Spacer()
                
                Text("Level \(upgrade.level)/\(upgrade.maxLevel)")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            
            HStack {
                Text("Cost: \(upgrade.cost) 💰")
                    .font(.subheadline)
                    .foregroundColor(canAfford ? .yellow : .red)
                
                Spacer()
                
                Button("Upgrade") {
                    onPurchase()
                }
                .buttonStyle(.bordered)
                .disabled(!canAfford || upgrade.level >= upgrade.maxLevel)
            }
        }
        .padding()
        .background(Color.white.opacity(0.1))
        .cornerRadius(12)
    }
}

