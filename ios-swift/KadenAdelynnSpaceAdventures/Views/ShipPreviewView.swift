//
//  ShipPreviewView.swift
//  KadenAdelynnSpaceAdventures
//
//  SwiftUI wrapper for rendering SpriteKit ship graphics
//

import SwiftUI
import SpriteKit

struct ShipPreviewView: UIViewRepresentable {
    let shipId: String
    let characterId: String
    let size: CGSize
    let isAnimating: Bool
    
    func makeUIView(context: Context) -> SKView {
        let view = SKView()
        view.backgroundColor = .clear
        view.allowsTransparency = true
        
        let scene = SKScene(size: size)
        scene.backgroundColor = .clear
        scene.scaleMode = .aspectFit
        
        // Create ship node
        let shipNode = ShipGraphics.createPlayerShip(
            size: CGSize(width: size.width * 0.8, height: size.height * 0.8),
            characterId: characterId,
            shipId: shipId
        )
        shipNode.position = CGPoint(x: size.width / 2, y: size.height / 2)
        
        // Add rotation animation if needed
        if isAnimating {
            let rotate = SKAction.rotate(byAngle: .pi * 2, duration: 3.0)
            shipNode.run(SKAction.repeatForever(rotate))
        }
        
        scene.addChild(shipNode)
        view.presentScene(scene)
        
        return view
    }
    
    func updateUIView(_ uiView: SKView, context: Context) {
        guard let scene = uiView.scene else { return }
        
        // Update ship if ID changed
        scene.removeAllChildren()
        
        let shipNode = ShipGraphics.createPlayerShip(
            size: CGSize(width: size.width * 0.8, height: size.height * 0.8),
            characterId: characterId,
            shipId: shipId
        )
        shipNode.position = CGPoint(x: size.width / 2, y: size.height / 2)
        
        if isAnimating {
            let rotate = SKAction.rotate(byAngle: .pi * 2, duration: 3.0)
            shipNode.run(SKAction.repeatForever(rotate))
        }
        
        scene.addChild(shipNode)
    }
}

