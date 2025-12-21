//
//  CharacterPreviewView.swift
//  KadenAdelynnSpaceAdventures
//
//  SwiftUI wrapper for rendering SpriteKit character graphics
//

import SwiftUI
import SpriteKit

struct CharacterPreviewView: UIViewRepresentable {
    let characterId: String
    let size: CGSize
    let isAnimating: Bool
    let isSelected: Bool
    
    func makeUIView(context: Context) -> SKView {
        let view = SKView()
        view.backgroundColor = .clear
        view.allowsTransparency = true
        
        let scene = SKScene(size: size)
        scene.backgroundColor = .clear
        scene.scaleMode = .aspectFit
        
        // Create character node
        let characterNode = CharacterGraphics.createCharacter(
            size: CGSize(width: size.width * 0.9, height: size.height * 0.9),
            characterId: characterId
        )
        characterNode.position = CGPoint(x: size.width / 2, y: size.height / 2)
        
        // Add animations
        if isAnimating {
            CharacterGraphics.addIdleAnimation(to: characterNode)
        }
        if isSelected {
            CharacterGraphics.addSelectionAnimation(to: characterNode)
        }
        
        scene.addChild(characterNode)
        view.presentScene(scene)
        
        return view
    }
    
    func updateUIView(_ uiView: SKView, context: Context) {
        guard let scene = uiView.scene else { return }
        
        // Update character if ID changed
        scene.removeAllChildren()
        
        let characterNode = CharacterGraphics.createCharacter(
            size: CGSize(width: size.width * 0.9, height: size.height * 0.9),
            characterId: characterId
        )
        characterNode.position = CGPoint(x: size.width / 2, y: size.height / 2)
        
        if isAnimating {
            CharacterGraphics.addIdleAnimation(to: characterNode)
        }
        if isSelected {
            CharacterGraphics.addSelectionAnimation(to: characterNode)
        }
        
        scene.addChild(characterNode)
    }
}

