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
    
    @State private var upgrades: [String: [Upgrade]] = [:]
    @State private var showToast: Bool = false
    @State private var toastMessage: String = ""
    
    var body: some View {
        ZStack {
            Color.blue.opacity(0.8).ignoresSafeArea()
            
            VStack {
                // Header
                HStack {
                    Text("⚔️ Weapon Upgrades")
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
                
                // Weapon selector
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(["laser", "spread", "plasma", "missile"], id: \.self) { weapon in
                            Button(weapon.capitalized) {
                                selectedWeapon = weapon
                            }
                            .padding()
                            .background(selectedWeapon == weapon ? Color.blue : Color.white.opacity(0.2))
                            .foregroundColor(.black)
                            .shadow(color: .black.opacity(0.6), radius: 2, x: 0, y: 1)
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
            loadUpgrades()
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
    
    private func loadUpgrades() {
        // Initialize default upgrades if not loaded
        if upgrades.isEmpty {
            upgrades = [
                "laser": [
                    Upgrade(name: "Damage", level: getUpgradeLevel(weapon: "laser", upgrade: "Damage"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Fire Rate", level: getUpgradeLevel(weapon: "laser", upgrade: "Fire Rate"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Range", level: getUpgradeLevel(weapon: "laser", upgrade: "Range"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Accuracy", level: getUpgradeLevel(weapon: "laser", upgrade: "Accuracy"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Special", level: getUpgradeLevel(weapon: "laser", upgrade: "Special"), cost: 200, maxLevel: 5)
                ],
                "spread": [
                    Upgrade(name: "Damage", level: getUpgradeLevel(weapon: "spread", upgrade: "Damage"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Fire Rate", level: getUpgradeLevel(weapon: "spread", upgrade: "Fire Rate"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Range", level: getUpgradeLevel(weapon: "spread", upgrade: "Range"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Accuracy", level: getUpgradeLevel(weapon: "spread", upgrade: "Accuracy"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Special", level: getUpgradeLevel(weapon: "spread", upgrade: "Special"), cost: 200, maxLevel: 5)
                ],
                "plasma": [
                    Upgrade(name: "Damage", level: getUpgradeLevel(weapon: "plasma", upgrade: "Damage"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Fire Rate", level: getUpgradeLevel(weapon: "plasma", upgrade: "Fire Rate"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Range", level: getUpgradeLevel(weapon: "plasma", upgrade: "Range"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Accuracy", level: getUpgradeLevel(weapon: "plasma", upgrade: "Accuracy"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Special", level: getUpgradeLevel(weapon: "plasma", upgrade: "Special"), cost: 200, maxLevel: 5)
                ],
                "missile": [
                    Upgrade(name: "Damage", level: getUpgradeLevel(weapon: "missile", upgrade: "Damage"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Fire Rate", level: getUpgradeLevel(weapon: "missile", upgrade: "Fire Rate"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Range", level: getUpgradeLevel(weapon: "missile", upgrade: "Range"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Accuracy", level: getUpgradeLevel(weapon: "missile", upgrade: "Accuracy"), cost: 100, maxLevel: 10),
                    Upgrade(name: "Special", level: getUpgradeLevel(weapon: "missile", upgrade: "Special"), cost: 200, maxLevel: 5)
                ]
            ]
        }
    }
    
    private func getUpgradeLevel(weapon: String, upgrade: String) -> Int {
        let key = "upgrade_\(weapon)_\(upgrade.replacingOccurrences(of: " ", with: "_"))"
        let level = UserDefaults.standard.integer(forKey: key)
        return level > 0 ? level : 1
    }
    
    private func saveUpgradeLevel(weapon: String, upgrade: String, level: Int) {
        let key = "upgrade_\(weapon)_\(upgrade.replacingOccurrences(of: " ", with: "_"))"
        UserDefaults.standard.set(level, forKey: key)
    }
    
    private func purchaseUpgrade(_ upgrade: Upgrade) {
        if coins >= upgrade.cost && upgrade.level < upgrade.maxLevel {
            coins -= upgrade.cost
            UserDefaults.standard.set(coins, forKey: "walletCoins")
            
            // Save upgrade level
            let newLevel = upgrade.level + 1
            saveUpgradeLevel(weapon: selectedWeapon, upgrade: upgrade.name, level: newLevel)
            
            // Update local state
            if var weaponUpgrades = upgrades[selectedWeapon] {
                if let index = weaponUpgrades.firstIndex(where: { $0.name == upgrade.name }) {
                    weaponUpgrades[index] = Upgrade(name: upgrade.name, level: newLevel, cost: upgrade.cost * 2, maxLevel: upgrade.maxLevel)
                    upgrades[selectedWeapon] = weaponUpgrades
                }
            }
            
            // Show success toast
            toastMessage = "✅ \(upgrade.name) upgraded to Level \(newLevel)!"
            showToast = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                showToast = false
            }
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
                    .foregroundColor(.black)
                
                Spacer()
                
                Text("Level \(upgrade.level)/\(upgrade.maxLevel)")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            
            HStack {
                Text("Cost: \(upgrade.cost) ⭐")
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

