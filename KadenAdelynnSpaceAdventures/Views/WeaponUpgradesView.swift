//
//  WeaponUpgradesView.swift
//  KadenAdelynnSpaceAdventures
//

import SwiftUI

struct WeaponUpgradesView: View {
    @EnvironmentObject var gameState: GameStateManager
    @Environment(\.colorScheme) var colorScheme
    @State private var selectedWeapon = "laser"
    @State private var coins: Int = 0
    
    struct Upgrade {
        let name: String
        let level: Int
        let cost: Int
        let maxLevel: Int
        let imageName: String // New: for upgrade module image
    }
    
    @State private var upgrades: [String: [Upgrade]] = [:]
    @State private var showToast: Bool = false
    @State private var toastMessage: String = ""
    
    var body: some View {
        ZStack {
            Group {
                if colorScheme == .dark {
                    LinearGradient(
                        colors: [.black.opacity(0.95), .gray.opacity(0.8), .blue.opacity(0.6)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                } else {
                    Color.blue.opacity(0.8)
                }
            }
            .ignoresSafeArea()
            
            VStack {
                // Header
                HStack {
                    Text("⚔️ Weapon Upgrades")
                        .font(.largeTitle)
                        .foregroundColor(colorScheme == .dark ? Color.white : Color.white)
                        .shadow(color: (colorScheme == .dark ? Color.black : Color.black).opacity(0.5), radius: 2, x: 0, y: 1)
                    
                    Spacer()
                    
                    Text("⭐ \(coins)")
                        .font(.headline)
                        .foregroundColor(.yellow)
                    
                    Button("✕") {
                        gameState.currentScreen = .mainMenu
                    }
                    .font(.title)
                    .foregroundColor(colorScheme == .dark ? Color.white : Color.white)
                    .shadow(color: (colorScheme == .dark ? Color.black : Color.black).opacity(0.8), radius: 3, x: 0, y: 2)
                }
                .padding(.top, 60) // Safe area padding
                .padding(.horizontal)
                .padding(.bottom, 10)
                
                // Weapon selector
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(["laser", "pulse", "plasma", "rocket"], id: \.self) { weapon in
                            Button(action: {
                                selectedWeapon = weapon
                            }) {
                                Text(weapon == "pulse" ? "Pulse" : weapon == "rocket" ? "Rocket" : weapon.capitalized)
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 10)
                                    .background(selectedWeapon == weapon ? Color.blue : Color.white.opacity(0.2))
                                    .cornerRadius(10)
                                    .shadow(color: .black.opacity(0.8), radius: 3, x: 0, y: 2)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                
                // Upgrades list - Grid layout
                ScrollView {
                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 15),
                        GridItem(.flexible(), spacing: 15)
                    ], spacing: 15) {
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
    
    // Get upgrade cost based on weapon type and upgrade name
    private func getUpgradeCost(weapon: String, upgradeName: String) -> Int {
        let weaponLower = weapon.lowercased()
        let upgradeLower = upgradeName.lowercased()
        
        // Base costs vary by upgrade type
        let baseCost: Int
        switch upgradeLower {
        case "damage": baseCost = 150      // Most valuable upgrade
        case "fire rate": baseCost = 120  // High value
        case "range": baseCost = 100      // Medium value
        case "accuracy": baseCost = 90    // Lower value
        case "special": baseCost = 250    // Premium upgrade
        default: baseCost = 100
        }
        
        // Weapon type multipliers (some weapons cost more to upgrade)
        let weaponMultiplier: Double
        switch weaponLower {
        case "laser": weaponMultiplier = 1.0    // Standard
        case "pulse": weaponMultiplier = 1.1   // 10% more expensive
        case "plasma": weaponMultiplier = 1.2   // 20% more expensive
        case "rocket": weaponMultiplier = 1.15  // 15% more expensive
        default: weaponMultiplier = 1.0
        }
        
        return Int(Double(baseCost) * weaponMultiplier)
    }
    
    // Map weapon type and upgrade names to unique image names
    private func getUpgradeImageName(weapon: String, upgradeName: String) -> String {
        // Create unique image names based on weapon + upgrade combination
        // This ensures each weapon type shows different images
        let weaponPrefix = weapon.lowercased()
        let upgradeKey = upgradeName.lowercased().replacingOccurrences(of: " ", with: "_")
        
        // Map to available upgrade images with weapon-specific variations
        switch (weaponPrefix, upgradeKey) {
        // Laser weapon upgrades
        case ("laser", "damage"): return "upgrade_power_crystal"
        case ("laser", "fire_rate"): return "upgrade_rapid_coil"
        case ("laser", "range"): return "upgrade_extended_barrel"
        case ("laser", "accuracy"): return "upgrade_targeting_lens"
        case ("laser", "special"): return "upgrade_nova_charge"
        
        // Pulse weapon upgrades (use different images - cycle through available)
        case ("pulse", "damage"): return "upgrade_plasma_core"
        case ("pulse", "fire_rate"): return "upgrade_overcharge_chip"
        case ("pulse", "range"): return "upgrade_pulse_capacitor"
        case ("pulse", "accuracy"): return "upgrade_ion_focus_ring"
        case ("pulse", "special"): return "upgrade_heat_sink"
        
        // Plasma weapon upgrades (use different images - cycle through available)
        case ("plasma", "damage"): return "upgrade_auto_aim_module"
        case ("plasma", "fire_rate"): return "upgrade_stability_gyro"
        case ("plasma", "range"): return "upgrade_emp_cell"
        case ("plasma", "accuracy"): return "upgrade_chain_module"
        case ("plasma", "special"): return "upgrade_freeze_core"
        
        // Rocket weapon upgrades (use remaining images or cycle)
        case ("rocket", "damage"): return "upgrade_plasma_core"  // Different from laser
        case ("rocket", "fire_rate"): return "upgrade_overcharge_chip"  // Different from laser
        case ("rocket", "range"): return "upgrade_pulse_capacitor"  // Different from laser
        case ("rocket", "accuracy"): return "upgrade_ion_focus_ring"  // Different from laser
        case ("rocket", "special"): return "upgrade_heat_sink"  // Different from laser
        
        default:
            // Fallback to upgrade name only
            switch upgradeKey {
            case "damage": return "upgrade_power_crystal"
            case "fire_rate": return "upgrade_rapid_coil"
            case "range": return "upgrade_extended_barrel"
            case "accuracy": return "upgrade_targeting_lens"
            case "special": return "upgrade_nova_charge"
            default: return "upgrade_power_crystal"
            }
        }
    }
    
    // Calculate cost for a specific level
    private func getCostForLevel(weapon: String, upgradeName: String, level: Int) -> Int {
        let baseCost = getUpgradeCost(weapon: weapon, upgradeName: upgradeName)
        // Level 1 uses base cost, each subsequent level costs 1.5x more
        if level <= 1 {
            return baseCost
        }
        return Int(Double(baseCost) * pow(1.5, Double(level - 1)))
    }
    
    private func loadUpgrades() {
        // Initialize default upgrades if not loaded
        if upgrades.isEmpty {
            upgrades = [
                "laser": [
                    Upgrade(name: "Damage", level: getUpgradeLevel(weapon: "laser", upgrade: "Damage"), cost: getCostForLevel(weapon: "laser", upgradeName: "Damage", level: getUpgradeLevel(weapon: "laser", upgrade: "Damage")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "laser", upgradeName: "Damage")),
                    Upgrade(name: "Fire Rate", level: getUpgradeLevel(weapon: "laser", upgrade: "Fire Rate"), cost: getCostForLevel(weapon: "laser", upgradeName: "Fire Rate", level: getUpgradeLevel(weapon: "laser", upgrade: "Fire Rate")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "laser", upgradeName: "Fire Rate")),
                    Upgrade(name: "Range", level: getUpgradeLevel(weapon: "laser", upgrade: "Range"), cost: getCostForLevel(weapon: "laser", upgradeName: "Range", level: getUpgradeLevel(weapon: "laser", upgrade: "Range")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "laser", upgradeName: "Range")),
                    Upgrade(name: "Accuracy", level: getUpgradeLevel(weapon: "laser", upgrade: "Accuracy"), cost: getCostForLevel(weapon: "laser", upgradeName: "Accuracy", level: getUpgradeLevel(weapon: "laser", upgrade: "Accuracy")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "laser", upgradeName: "Accuracy")),
                    Upgrade(name: "Special", level: getUpgradeLevel(weapon: "laser", upgrade: "Special"), cost: getCostForLevel(weapon: "laser", upgradeName: "Special", level: getUpgradeLevel(weapon: "laser", upgrade: "Special")), maxLevel: 5, imageName: getUpgradeImageName(weapon: "laser", upgradeName: "Special"))
                ],
                "pulse": [
                    Upgrade(name: "Damage", level: getUpgradeLevel(weapon: "pulse", upgrade: "Damage"), cost: getCostForLevel(weapon: "pulse", upgradeName: "Damage", level: getUpgradeLevel(weapon: "pulse", upgrade: "Damage")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "pulse", upgradeName: "Damage")),
                    Upgrade(name: "Fire Rate", level: getUpgradeLevel(weapon: "pulse", upgrade: "Fire Rate"), cost: getCostForLevel(weapon: "pulse", upgradeName: "Fire Rate", level: getUpgradeLevel(weapon: "pulse", upgrade: "Fire Rate")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "pulse", upgradeName: "Fire Rate")),
                    Upgrade(name: "Range", level: getUpgradeLevel(weapon: "pulse", upgrade: "Range"), cost: getCostForLevel(weapon: "pulse", upgradeName: "Range", level: getUpgradeLevel(weapon: "pulse", upgrade: "Range")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "pulse", upgradeName: "Range")),
                    Upgrade(name: "Accuracy", level: getUpgradeLevel(weapon: "pulse", upgrade: "Accuracy"), cost: getCostForLevel(weapon: "pulse", upgradeName: "Accuracy", level: getUpgradeLevel(weapon: "pulse", upgrade: "Accuracy")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "pulse", upgradeName: "Accuracy")),
                    Upgrade(name: "Special", level: getUpgradeLevel(weapon: "pulse", upgrade: "Special"), cost: getCostForLevel(weapon: "pulse", upgradeName: "Special", level: getUpgradeLevel(weapon: "pulse", upgrade: "Special")), maxLevel: 5, imageName: getUpgradeImageName(weapon: "pulse", upgradeName: "Special"))
                ],
                "plasma": [
                    Upgrade(name: "Damage", level: getUpgradeLevel(weapon: "plasma", upgrade: "Damage"), cost: getCostForLevel(weapon: "plasma", upgradeName: "Damage", level: getUpgradeLevel(weapon: "plasma", upgrade: "Damage")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "plasma", upgradeName: "Damage")),
                    Upgrade(name: "Fire Rate", level: getUpgradeLevel(weapon: "plasma", upgrade: "Fire Rate"), cost: getCostForLevel(weapon: "plasma", upgradeName: "Fire Rate", level: getUpgradeLevel(weapon: "plasma", upgrade: "Fire Rate")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "plasma", upgradeName: "Fire Rate")),
                    Upgrade(name: "Range", level: getUpgradeLevel(weapon: "plasma", upgrade: "Range"), cost: getCostForLevel(weapon: "plasma", upgradeName: "Range", level: getUpgradeLevel(weapon: "plasma", upgrade: "Range")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "plasma", upgradeName: "Range")),
                    Upgrade(name: "Accuracy", level: getUpgradeLevel(weapon: "plasma", upgrade: "Accuracy"), cost: getCostForLevel(weapon: "plasma", upgradeName: "Accuracy", level: getUpgradeLevel(weapon: "plasma", upgrade: "Accuracy")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "plasma", upgradeName: "Accuracy")),
                    Upgrade(name: "Special", level: getUpgradeLevel(weapon: "plasma", upgrade: "Special"), cost: getCostForLevel(weapon: "plasma", upgradeName: "Special", level: getUpgradeLevel(weapon: "plasma", upgrade: "Special")), maxLevel: 5, imageName: getUpgradeImageName(weapon: "plasma", upgradeName: "Special"))
                ],
                "rocket": [
                    Upgrade(name: "Damage", level: getUpgradeLevel(weapon: "rocket", upgrade: "Damage"), cost: getCostForLevel(weapon: "rocket", upgradeName: "Damage", level: getUpgradeLevel(weapon: "rocket", upgrade: "Damage")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "rocket", upgradeName: "Damage")),
                    Upgrade(name: "Fire Rate", level: getUpgradeLevel(weapon: "rocket", upgrade: "Fire Rate"), cost: getCostForLevel(weapon: "rocket", upgradeName: "Fire Rate", level: getUpgradeLevel(weapon: "rocket", upgrade: "Fire Rate")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "rocket", upgradeName: "Fire Rate")),
                    Upgrade(name: "Range", level: getUpgradeLevel(weapon: "rocket", upgrade: "Range"), cost: getCostForLevel(weapon: "rocket", upgradeName: "Range", level: getUpgradeLevel(weapon: "rocket", upgrade: "Range")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "rocket", upgradeName: "Range")),
                    Upgrade(name: "Accuracy", level: getUpgradeLevel(weapon: "rocket", upgrade: "Accuracy"), cost: getCostForLevel(weapon: "rocket", upgradeName: "Accuracy", level: getUpgradeLevel(weapon: "rocket", upgrade: "Accuracy")), maxLevel: 10, imageName: getUpgradeImageName(weapon: "rocket", upgradeName: "Accuracy")),
                    Upgrade(name: "Special", level: getUpgradeLevel(weapon: "rocket", upgrade: "Special"), cost: getCostForLevel(weapon: "rocket", upgradeName: "Special", level: getUpgradeLevel(weapon: "rocket", upgrade: "Special")), maxLevel: 5, imageName: getUpgradeImageName(weapon: "rocket", upgradeName: "Special"))
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
                    // Progressive cost: each level costs 1.5x more than base cost
                    let newCost = getCostForLevel(weapon: selectedWeapon, upgradeName: upgrade.name, level: newLevel)
                    weaponUpgrades[index] = Upgrade(name: upgrade.name, level: newLevel, cost: newCost, maxLevel: upgrade.maxLevel, imageName: upgrade.imageName)
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
        VStack(spacing: 12) {
            // Upgrade Module Image
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(
                        LinearGradient(
                            colors: [Color.white.opacity(0.15), Color.white.opacity(0.05)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(height: 120)
                
                // Try to load image from collectibles or upgrade images
                let collectibleImageName = UpgradeCard.getCollectibleImageName(upgrade.name)
                if let image = UIImage(named: upgrade.imageName) ?? UIImage(named: collectibleImageName) {
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(height: 100)
                        .padding(10)
                } else {
                    // Placeholder icon based on upgrade type
                    Image(systemName: UpgradeCard.getUpgradeIcon(upgrade.name))
                        .font(.system(size: 40))
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            
            // Upgrade Name
            Text(upgrade.name)
                .font(.headline)
                .foregroundColor(.black)
                .multilineTextAlignment(.center)
                .lineLimit(2)
            
            // Level Indicator
            HStack(spacing: 4) {
                ForEach(0..<upgrade.maxLevel, id: \.self) { index in
                    Circle()
                        .fill(index < upgrade.level ? Color.green : Color.gray.opacity(0.3))
                        .frame(width: 6, height: 6)
                }
            }
            .padding(.vertical, 4)
            
            // Cost and Upgrade Button
            VStack(spacing: 8) {
                HStack {
                    Text("\(upgrade.cost)")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                    
                    Text("⭐")
                        .font(.caption)
                        .foregroundColor(.yellow)
                }
                
                Button(action: onPurchase) {
                    Text(upgrade.level >= upgrade.maxLevel ? "MAX" : "Upgrade")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(
                            canAfford && upgrade.level < upgrade.maxLevel ?
                                LinearGradient(colors: [.green, .mint], startPoint: .leading, endPoint: .trailing) :
                                LinearGradient(colors: [.gray.opacity(0.3), .gray.opacity(0.2)], startPoint: .leading, endPoint: .trailing)
                        )
                        .cornerRadius(8)
                }
                .disabled(!canAfford || upgrade.level >= upgrade.maxLevel)
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: [Color.white.opacity(0.2), Color.white.opacity(0.1)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.white.opacity(0.3), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.2), radius: 5, x: 0, y: 2)
    }
    
    static func getCollectibleImageName(_ upgradeName: String) -> String {
        // Map upgrade names to collectible images that exist
        switch upgradeName.lowercased() {
        case "damage": return "collectible_2" // Overcharge Core / Cryo Crystal
        case "fire rate": return "collectible_7" // Rapid Fire Module / Homing Chip
        case "range": return "collectible_4" // Energy Core / Speed Thruster
        case "accuracy": return "collectible_6" // Homing Chip / Freeze Pulse
        case "special": return "collectible_8" // Mega Bomb / Multiplier Orb
        default: return "collectible_1" // Energy Core / Armor Core
        }
    }
    
    static func getUpgradeIcon(_ name: String) -> String {
        switch name.lowercased() {
        case "damage": return "bolt.fill"
        case "fire rate": return "speedometer"
        case "range": return "arrow.up.right.circle.fill"
        case "accuracy": return "scope"
        case "special": return "sparkles"
        default: return "star.fill"
        }
    }
}

