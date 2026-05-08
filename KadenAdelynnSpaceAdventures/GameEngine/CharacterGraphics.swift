//
//  CharacterGraphics.swift
//  KadenAdelynnSpaceAdventures
//
//  Stylized minimalist character graphics matching the design
//

import SpriteKit

class CharacterGraphics {
    static func createCharacter(size: CGSize, characterId: String = "kaden") -> SKNode {
        let character = SKNode()
        
        // Determine colors based on character
        let suitColor: UIColor
        let accentColor: UIColor
        let glowColor: UIColor
        let skinColor: UIColor
        
        switch characterId.lowercased() {
        case "kaden":
            suitColor = UIColor(red: 0.0, green: 0.6, blue: 1.0, alpha: 1.0) // Blue
            accentColor = UIColor(red: 0.3, green: 0.8, blue: 1.0, alpha: 1.0) // Light blue
            glowColor = UIColor(red: 0.0, green: 0.7, blue: 1.0, alpha: 0.5) // Cyan-blue glow
            skinColor = UIColor(red: 0.85, green: 0.7, blue: 0.55, alpha: 1.0) // Light brown
        case "adelynn":
            suitColor = UIColor(red: 1.0, green: 0.4, blue: 0.8, alpha: 1.0) // Pink
            accentColor = UIColor(red: 1.0, green: 0.7, blue: 0.9, alpha: 1.0) // Light pink
            glowColor = UIColor(red: 1.0, green: 0.5, blue: 0.9, alpha: 0.5) // Pink-purple glow
            skinColor = UIColor(red: 0.85, green: 0.7, blue: 0.55, alpha: 1.0) // Light brown
        case "hero3": // Orion
            suitColor = UIColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0) // Gold/Yellow
            accentColor = UIColor(red: 1.0, green: 0.9, blue: 0.3, alpha: 1.0) // Light yellow
            glowColor = UIColor(red: 1.0, green: 0.8, blue: 0.3, alpha: 0.5) // Yellow-orange glow
            skinColor = UIColor(red: 0.85, green: 0.7, blue: 0.55, alpha: 1.0) // Light brown
        case "hero4": // Lyra
            suitColor = UIColor(red: 0.2, green: 0.9, blue: 0.3, alpha: 1.0) // Green
            accentColor = UIColor(red: 0.5, green: 1.0, blue: 0.6, alpha: 1.0) // Light green
            glowColor = UIColor(red: 0.35, green: 0.95, blue: 0.45, alpha: 0.5) // Green-cyan glow
            skinColor = UIColor(red: 0.85, green: 0.7, blue: 0.55, alpha: 1.0) // Light brown
        case "hero5": // Jax
            suitColor = UIColor(red: 0.4, green: 0.4, blue: 0.4, alpha: 1.0) // Gray
            accentColor = UIColor(red: 0.6, green: 0.6, blue: 0.6, alpha: 1.0) // Light gray
            glowColor = UIColor(red: 0.5, green: 0.5, blue: 0.5, alpha: 0.5) // Gray glow
            skinColor = UIColor(red: 0.85, green: 0.7, blue: 0.55, alpha: 1.0) // Light brown
        case "hero6": // Vega
            suitColor = UIColor(red: 0.2, green: 0.6, blue: 1.0, alpha: 1.0) // Blue
            accentColor = UIColor(red: 0.4, green: 0.8, blue: 1.0, alpha: 1.0) // Light blue
            glowColor = UIColor(red: 0.1, green: 0.7, blue: 1.0, alpha: 0.5) // Blue-cyan glow
            skinColor = UIColor(red: 0.85, green: 0.7, blue: 0.55, alpha: 1.0) // Light brown
        case "hero7": // Kael
            suitColor = UIColor(red: 1.0, green: 0.65, blue: 0.0, alpha: 1.0) // Orange
            accentColor = UIColor(red: 1.0, green: 0.85, blue: 0.5, alpha: 1.0) // Light orange
            glowColor = UIColor(red: 1.0, green: 0.75, blue: 0.3, alpha: 0.5) // Orange-yellow glow
            skinColor = UIColor(red: 0.85, green: 0.7, blue: 0.55, alpha: 1.0) // Light brown
        case "hero8": // Nova
            suitColor = UIColor(red: 0.5, green: 0.0, blue: 1.0, alpha: 1.0) // Purple
            accentColor = UIColor(red: 0.7, green: 0.3, blue: 1.0, alpha: 1.0) // Light purple
            glowColor = UIColor(red: 0.7, green: 0.3, blue: 1.0, alpha: 0.5) // Purple-pink glow
            skinColor = UIColor(red: 0.85, green: 0.7, blue: 0.55, alpha: 1.0) // Light brown
        case "hero9": // Rio
            suitColor = UIColor(red: 0.2, green: 0.4, blue: 1.0, alpha: 1.0) // Blue
            accentColor = UIColor(red: 0.4, green: 0.6, blue: 1.0, alpha: 1.0) // Light blue
            glowColor = UIColor(red: 0.3, green: 0.5, blue: 1.0, alpha: 0.5) // Blue-indigo glow
            skinColor = UIColor(red: 0.85, green: 0.7, blue: 0.55, alpha: 1.0) // Light brown
        case "hero10": // Mira
            suitColor = UIColor(red: 1.0, green: 0.5, blue: 0.2, alpha: 1.0) // Orange-red
            accentColor = UIColor(red: 1.0, green: 0.7, blue: 0.5, alpha: 1.0) // Light orange
            glowColor = UIColor(red: 1.0, green: 0.6, blue: 0.3, alpha: 0.5) // Orange-red glow
            skinColor = UIColor(red: 0.85, green: 0.7, blue: 0.55, alpha: 1.0) // Light brown
        default:
            suitColor = UIColor(red: 0.0, green: 0.6, blue: 1.0, alpha: 1.0)
            accentColor = UIColor(red: 0.3, green: 0.8, blue: 1.0, alpha: 1.0)
            glowColor = UIColor(red: 0.0, green: 0.7, blue: 1.0, alpha: 0.5)
            skinColor = UIColor(red: 0.85, green: 0.7, blue: 0.55, alpha: 1.0)
        }
        
        let charWidth = size.width
        let charHeight = size.height
        
        // OUTER GLOW (circular, soft)
        let outerGlow = SKShapeNode(circleOfRadius: charWidth * 0.55)
        outerGlow.fillColor = glowColor
        outerGlow.strokeColor = .clear
        outerGlow.zPosition = -1
        character.addChild(outerGlow)
        
        // HEAD (simple circle, light brown)
        let headSize = charWidth * 0.35
        let head = SKShapeNode(circleOfRadius: headSize / 2)
        head.fillColor = skinColor
        head.strokeColor = UIColor(red: 0.7, green: 0.6, blue: 0.5, alpha: 1.0)
        head.lineWidth = 2
        head.position = CGPoint(x: 0, y: charHeight * 0.2)
        head.zPosition = 4
        character.addChild(head)
        
        // EYES (simple white circles)
        let eyeSize = headSize * 0.15
        // Left eye
        let leftEye = SKShapeNode(circleOfRadius: eyeSize / 2)
        leftEye.fillColor = .white
        leftEye.strokeColor = .clear
        leftEye.position = CGPoint(x: -headSize * 0.25, y: charHeight * 0.2 + headSize * 0.15)
        leftEye.zPosition = 5
        character.addChild(leftEye)
        
        // Right eye
        let rightEye = SKShapeNode(circleOfRadius: eyeSize / 2)
        rightEye.fillColor = .white
        rightEye.strokeColor = .clear
        rightEye.position = CGPoint(x: headSize * 0.25, y: charHeight * 0.2 + headSize * 0.15)
        rightEye.zPosition = 5
        character.addChild(rightEye)
        
        // MOUTH (inverted crescent - sad expression)
        let mouthPath = CGMutablePath()
        let mouthRadius = headSize * 0.2
        mouthPath.addArc(center: CGPoint(x: 0, y: charHeight * 0.2 - headSize * 0.1), radius: mouthRadius, startAngle: 0, endAngle: .pi, clockwise: true)
        let mouth = SKShapeNode(path: mouthPath)
        mouth.fillColor = .clear
        mouth.strokeColor = UIColor(red: 0.4, green: 0.3, blue: 0.2, alpha: 1.0)
        mouth.lineWidth = 2.5
        mouth.zPosition = 5
        character.addChild(mouth)
        
        // HELMET/HOOD (rounded rectangle covering head)
        let helmet = SKShapeNode(rect: CGRect(
            x: -charWidth * 0.4,
            y: charHeight * 0.05,
            width: charWidth * 0.8,
            height: charHeight * 0.4
        ), cornerRadius: charWidth * 0.2)
        helmet.fillColor = suitColor
        helmet.strokeColor = accentColor
        helmet.lineWidth = 2
        helmet.zPosition = 3
        character.addChild(helmet)
        
        // BODY (simple rounded rectangle)
        let body = SKShapeNode(rect: CGRect(
            x: -charWidth * 0.3,
            y: -charHeight * 0.15,
            width: charWidth * 0.6,
            height: charHeight * 0.4
        ), cornerRadius: 8)
        body.fillColor = suitColor
        body.strokeColor = accentColor
        body.lineWidth = 2
        body.zPosition = 1
        character.addChild(body)
        
        // ARMS (rectangular arms that can be animated)
        // Left arm - create as a container node for animation
        let leftArmContainer = SKNode()
        leftArmContainer.position = CGPoint(x: -charWidth * 0.3, y: -charHeight * 0.05)
        leftArmContainer.zPosition = 2
        leftArmContainer.name = "leftArm"
        
        let leftArmShape = SKShapeNode(rect: CGRect(
            x: -charWidth * 0.1,
            y: 0,
            width: charWidth * 0.2,
            height: charHeight * 0.15
        ), cornerRadius: 4)
        leftArmShape.fillColor = suitColor
        leftArmShape.strokeColor = accentColor
        leftArmShape.lineWidth = 1.5
        leftArmContainer.addChild(leftArmShape)
        character.addChild(leftArmContainer)
        
        // Right arm - create as a container node for animation
        let rightArmContainer = SKNode()
        rightArmContainer.position = CGPoint(x: charWidth * 0.3, y: -charHeight * 0.05)
        rightArmContainer.zPosition = 2
        rightArmContainer.name = "rightArm"
        
        let rightArmShape = SKShapeNode(rect: CGRect(
            x: -charWidth * 0.1,
            y: 0,
            width: charWidth * 0.2,
            height: charHeight * 0.15
        ), cornerRadius: 4)
        rightArmShape.fillColor = suitColor
        rightArmShape.strokeColor = accentColor
        rightArmShape.lineWidth = 1.5
        rightArmContainer.addChild(rightArmShape)
        character.addChild(rightArmContainer)
        
        // LEGS (two rectangular legs)
        // Left leg
        let leftLeg = SKShapeNode(rect: CGRect(
            x: -charWidth * 0.2,
            y: -charHeight * 0.45,
            width: charWidth * 0.15,
            height: charHeight * 0.25
        ), cornerRadius: 3)
        leftLeg.fillColor = suitColor
        leftLeg.strokeColor = accentColor
        leftLeg.lineWidth = 1.5
        leftLeg.zPosition = 0
        character.addChild(leftLeg)
        
        // Right leg
        let rightLeg = SKShapeNode(rect: CGRect(
            x: charWidth * 0.05,
            y: -charHeight * 0.45,
            width: charWidth * 0.15,
            height: charHeight * 0.25
        ), cornerRadius: 3)
        rightLeg.fillColor = suitColor
        rightLeg.strokeColor = accentColor
        rightLeg.lineWidth = 1.5
        rightLeg.zPosition = 0
        character.addChild(rightLeg)
        
        return character
    }
    
    // Add idle animation (gentle floating/bobbing)
    static func addIdleAnimation(to character: SKNode) {
        let floatUp = SKAction.moveBy(x: 0, y: 3, duration: 1.5)
        let floatDown = SKAction.moveBy(x: 0, y: -3, duration: 1.5)
        let floatSequence = SKAction.sequence([floatUp, floatDown])
        character.run(SKAction.repeatForever(floatSequence), withKey: "idleFloat")
    }
    
    // Add selection animation (pulse/glow)
    static func addSelectionAnimation(to character: SKNode) {
        let scaleUp = SKAction.scale(to: 1.1, duration: 0.5)
        let scaleDown = SKAction.scale(to: 1.0, duration: 0.5)
        let pulseSequence = SKAction.sequence([scaleUp, scaleDown])
        character.run(SKAction.repeatForever(pulseSequence), withKey: "selectionPulse")
    }
    
    // Add dynamic movement animations (flips, peace signs, etc.)
    static func addDynamicAnimations(to character: SKNode, characterId: String) {
        // Remove any existing dynamic animations
        character.removeAction(forKey: "dynamicFlip")
        character.removeAction(forKey: "dynamicPeace")
        character.removeAction(forKey: "dynamicWave")
        
        // Randomly choose animation type based on character ID hash
        let animationType = abs(characterId.hashValue) % 4
        
        switch animationType {
        case 0:
            // Flip animation
            addFlipAnimation(to: character)
        case 1:
            // Peace sign animation (arms up)
            addPeaceSignAnimation(to: character)
        case 2:
            // Wave animation
            addWaveAnimation(to: character)
        default:
            // Jump/spin combo
            addJumpSpinAnimation(to: character)
        }
    }
    
    // Flip animation - character does a backflip
    static func addFlipAnimation(to character: SKNode) {
        let flipUp = SKAction.sequence([
            SKAction.moveBy(x: 0, y: 20, duration: 0.3),
            SKAction.rotate(byAngle: .pi, duration: 0.4),
            SKAction.moveBy(x: 0, y: -20, duration: 0.3),
            SKAction.rotate(byAngle: .pi, duration: 0.4)
        ])
        let wait = SKAction.wait(forDuration: 2.0)
        let flipSequence = SKAction.sequence([flipUp, wait])
        character.run(SKAction.repeatForever(flipSequence), withKey: "dynamicFlip")
    }
    
    // Peace sign animation - character raises arms in peace sign
    static func addPeaceSignAnimation(to character: SKNode) {
        // Find arms and animate them
        let leftArm = character.childNode(withName: "leftArm")
        let rightArm = character.childNode(withName: "rightArm")
        
        // Animate arms up in V shape (peace sign)
        let leftArmUp = SKAction.rotate(toAngle: -CGFloat.pi / 2.5, duration: 0.6)
        let rightArmUp = SKAction.rotate(toAngle: CGFloat.pi / 2.5, duration: 0.6)
        let armsDown = SKAction.rotate(toAngle: 0, duration: 0.6)
        let wait = SKAction.wait(forDuration: 1.5)
        
        let leftSequence = SKAction.sequence([leftArmUp, wait, armsDown, wait])
        let rightSequence = SKAction.sequence([rightArmUp, wait, armsDown, wait])
        
        leftArm?.run(SKAction.repeatForever(leftSequence), withKey: "peaceLeft")
        rightArm?.run(SKAction.repeatForever(rightSequence), withKey: "peaceRight")
        
        // Also add a slight bounce
        let bounce = SKAction.sequence([
            SKAction.moveBy(x: 0, y: 8, duration: 0.4),
            SKAction.moveBy(x: 0, y: -8, duration: 0.4),
            SKAction.wait(forDuration: 1.2)
        ])
        character.run(SKAction.repeatForever(bounce), withKey: "dynamicPeace")
    }
    
    // Wave animation - character waves hand
    static func addWaveAnimation(to character: SKNode) {
        let rightArm = character.childNode(withName: "rightArm")
        
        // Wave motion - back and forth
        let wave1 = SKAction.rotate(toAngle: -CGFloat.pi / 3, duration: 0.25)
        let wave2 = SKAction.rotate(toAngle: CGFloat.pi / 3, duration: 0.25)
        let wave3 = SKAction.rotate(toAngle: 0, duration: 0.25)
        let waveSequence = SKAction.sequence([wave1, wave2, wave1, wave2, wave3, SKAction.wait(forDuration: 2.5)])
        
        rightArm?.run(SKAction.repeatForever(waveSequence), withKey: "wave")
        
        // Slight body movement (lean slightly when waving)
        let bodyMove = SKAction.sequence([
            SKAction.moveBy(x: 2, y: 0, duration: 0.3),
            SKAction.moveBy(x: -2, y: 0, duration: 0.3),
            SKAction.wait(forDuration: 1.8)
        ])
        character.run(SKAction.repeatForever(bodyMove), withKey: "dynamicWave")
    }
    
    // Jump and spin animation
    static func addJumpSpinAnimation(to character: SKNode) {
        let jumpSpin = SKAction.sequence([
            SKAction.group([
                SKAction.moveBy(x: 0, y: 25, duration: 0.4),
                SKAction.rotate(byAngle: .pi * 2, duration: 0.4)
            ]),
            SKAction.group([
                SKAction.moveBy(x: 0, y: -25, duration: 0.4),
                SKAction.rotate(byAngle: -.pi * 2, duration: 0.4)
            ]),
            SKAction.wait(forDuration: 2.0)
        ])
        character.run(SKAction.repeatForever(jumpSpin), withKey: "jumpSpin")
    }
}
