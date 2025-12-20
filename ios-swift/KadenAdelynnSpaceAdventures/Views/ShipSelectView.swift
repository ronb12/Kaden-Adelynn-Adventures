//
//  ShipSelectView.swift
//  KadenAdelynnSpaceAdventures
//
//  Enhanced ship selection view
//

import SwiftUI

struct ShipSelectView: View {
    @EnvironmentObject var gameState: GameStateManager
    @State private var ownedShips: Set<String> = []
    @State private var showToast = false
    @State private var toastMessage = ""
    
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
    }
    
    let ships: [Ship] = [
        Ship(id: "kaden", icon: "🚀", name: "Kaden's Ship", weapon: "Laser", speed: "High", durability: "Medium", firepower: "Medium", maneuverability: "High", color1: .cyan, color2: .blue, cost: 0, isDefault: true),
        Ship(id: "adelynn", icon: "✨", name: "Adelynn's Ship", weapon: "Spread Shot", speed: "Very High", durability: "Low", firepower: "High", maneuverability: "Very High", color1: .pink, color2: .purple, cost: 0, isDefault: true),
        Ship(id: "falcon", icon: "🦅", name: "Falcon", weapon: "Homing", speed: "Very High", durability: "Low", firepower: "Medium", maneuverability: "Very High", color1: .yellow, color2: .orange, cost: 200, isDefault: false),
        Ship(id: "phantom", icon: "👻", name: "Phantom", weapon: "Electric", speed: "High", durability: "Medium", firepower: "Medium", maneuverability: "High", color1: .gray, color2: .white, cost: 250, isDefault: false),
        Ship(id: "nova", icon: "🌟", name: "Nova", weapon: "Plasma", speed: "High", durability: "Medium", firepower: "High", maneuverability: "Medium", color1: .purple, color2: .pink, cost: 300, isDefault: false),
        Ship(id: "titan", icon: "🛡️", name: "Titan", weapon: "Railgun", speed: "Low", durability: "Very High", firepower: "Very High", maneuverability: "Low", color1: .orange, color2: .red, cost: 350, isDefault: false),
        Ship(id: "viper", icon: "🐍", name: "Viper", weapon: "Shotgun", speed: "High", durability: "Medium", firepower: "High", maneuverability: "High", color1: .green, color2: .mint, cost: 300, isDefault: false),
        Ship(id: "shadow", icon: "🌑", name: "Shadow", weapon: "Beam", speed: "Medium", durability: "High", firepower: "Medium", maneuverability: "Medium", color1: .black, color2: .gray, cost: 320, isDefault: false),
        Ship(id: "meteor", icon: "☄️", name: "Meteor", weapon: "Missile", speed: "Very High", durability: "Low", firepower: "High", maneuverability: "High", color1: .orange, color2: .yellow, cost: 280, isDefault: false),
        Ship(id: "comet", icon: "🌠", name: "Comet", weapon: "Freeze", speed: "Very High", durability: "Low", firepower: "Medium", maneuverability: "Very High", color1: .blue, color2: .cyan, cost: 260, isDefault: false),
        Ship(id: "raptor", icon: "🦖", name: "Raptor", weapon: "Laser Rifle", speed: "High", durability: "High", firepower: "High", maneuverability: "Medium", color1: .red, color2: .orange, cost: 330, isDefault: false),
        Ship(id: "aurora", icon: "🌈", name: "Aurora", weapon: "Plasma Rifle", speed: "Medium", durability: "Medium", firepower: "Very High", maneuverability: "Medium", color1: .purple, color2: .blue, cost: 340, isDefault: false)
    ]
    
    var body: some View {
        ZStack {
            // Animated background
            LinearGradient(
                colors: [.black, .blue.opacity(0.3), .cyan.opacity(0.2)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 25) {
                    // Header
                    VStack(spacing: 10) {
                        HStack {
                            Text("🚀")
                                .font(.system(size: 50))
                            Text("Choose Your Ship")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.white)
                        }
                        
                        Text("Select the perfect vessel for your space adventure")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.7))
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 40)
                    
                    // Coin Balance
                    HStack {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("Your Balance")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            Text("💰 \(gameState.coins)")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.yellow)
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
                    
                    // Ships Grid
                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 15),
                        GridItem(.flexible(), spacing: 15)
                    ], spacing: 15) {
                        ForEach(ships, id: \.id) { ship in
                            ShipCard(
                                ship: ship,
                                isSelected: gameState.selectedShip == ship.id,
                                isOwned: ownedShips.contains(ship.id) || ship.isDefault,
                                onSelect: {
                                    if ownedShips.contains(ship.id) || ship.isDefault {
                                        gameState.selectedShip = ship.id
                                        gameState.currentScreen = .story
                                    } else {
                                        purchaseShip(ship)
                                    }
                                }
                            )
                        }
                    }
                    .padding(.horizontal, 20)
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
            loadOwnedShips()
        }
    }
    
    private func loadOwnedShips() {
        if let data = UserDefaults.standard.data(forKey: "ownedShips"),
           let owned = try? JSONDecoder().decode([String].self, from: data) {
            ownedShips = Set(owned)
        }
        // Default ships are always owned
        ownedShips.insert("kaden")
        ownedShips.insert("adelynn")
    }
    
    private func purchaseShip(_ ship: Ship) {
        if gameState.coins >= ship.cost {
            gameState.coins -= ship.cost
            UserDefaults.standard.set(gameState.coins, forKey: "walletCoins")
            
            var owned = Array(ownedShips)
            owned.append(ship.id)
            if let data = try? JSONEncoder().encode(owned) {
                UserDefaults.standard.set(data, forKey: "ownedShips")
            }
            ownedShips.insert(ship.id)
            
            showToast(message: "🚀 Ship unlocked!")
        } else {
            showToast(message: "Not enough coins!")
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

private struct ShipCard: View {
    let ship: ShipSelectView.Ship
    let isSelected: Bool
    let isOwned: Bool
    let onSelect: () -> Void
    
    var body: some View {
        Button(action: onSelect) {
            VStack(spacing: 12) {
                // Selected badge
                if isSelected {
                    HStack {
                        Spacer()
                        Text("✓ Selected")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.green.opacity(0.3))
                            .cornerRadius(8)
                    }
                }
                
                // Locked badge
                if !isOwned {
                    HStack {
                        Text("🔒 Locked")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.red)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.red.opacity(0.3))
                            .cornerRadius(8)
                        Spacer()
                    }
                }
                
                // Ship Icon
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [ship.color1, ship.color2],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 80, height: 80)
                        .shadow(color: ship.color1.opacity(0.5), radius: 10)
                    
                    Text(ship.icon)
                        .font(.system(size: 50))
                }
                .padding(.top, 5)
                
                // Name
                Text(ship.name)
                    .font(.headline)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                
                // Stats
                VStack(spacing: 5) {
                    ShipStatRow(icon: "⚔️", label: "Weapon", value: ship.weapon)
                    ShipStatRow(icon: "💨", label: "Speed", value: ship.speed)
                    ShipStatRow(icon: "🛡️", label: "Durability", value: ship.durability)
                    ShipStatRow(icon: "💥", label: "Firepower", value: ship.firepower)
                    ShipStatRow(icon: "🎯", label: "Maneuver", value: ship.maneuverability)
                }
                .font(.caption2)
                
                // Price or Owned
                if !isOwned {
                    HStack {
                        Text("💰")
                        Text("\(ship.cost)")
                            .font(.headline)
                            .foregroundColor(.yellow)
                    }
                    .padding(.vertical, 8)
                } else if !ship.isDefault {
                    Text("Owned")
                        .font(.caption)
                        .foregroundColor(.green)
                        .padding(.vertical, 4)
                }
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: isSelected ? 
                                    [ship.color1.opacity(0.3), ship.color2.opacity(0.2)] :
                                    [.white.opacity(0.1), .white.opacity(0.05)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                    
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(
                            isSelected ? ship.color1.opacity(0.8) :
                            isOwned ? Color.white.opacity(0.3) :
                            Color.red.opacity(0.5),
                            lineWidth: isSelected ? 3 : 2
                        )
                }
            )
            .shadow(color: isSelected ? ship.color1.opacity(0.5) : .black.opacity(0.3), radius: isSelected ? 15 : 10)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

private struct ShipStatRow: View {
    let icon: String
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(icon)
                .font(.caption2)
            Text(label + ":")
                .foregroundColor(.white.opacity(0.7))
                .font(.caption2)
            Spacer()
            Text(value)
                .foregroundColor(.white)
                .fontWeight(.semibold)
                .font(.caption2)
        }
    }
}
