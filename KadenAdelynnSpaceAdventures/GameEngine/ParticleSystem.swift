//
//  ParticleSystem.swift
//  KadenAdelynnSpaceAdventures
//
//  Particle effects system
//

import SpriteKit

class ParticleSystem {
    static func createExplosion(at position: CGPoint, color: UIColor = .red, size: CGFloat = 1.0) -> SKEmitterNode {
        let emitter = SKEmitterNode()
        emitter.particleTexture = nil // Use default particle
        emitter.particleColor = color
        emitter.numParticlesToEmit = 30
        emitter.particleBirthRate = 1000
        emitter.particleLifetime = 0.5
        emitter.particleLifetimeRange = 0.2
        emitter.particlePosition = position
        emitter.particlePositionRange = CGVector(dx: 0, dy: 0)
        emitter.particleSpeed = 200 * size
        emitter.particleSpeedRange = 100 * size
        emitter.particleAlpha = 1.0
        emitter.particleAlphaRange = 0.3
        emitter.particleAlphaSpeed = -2.0
        emitter.particleScale = 0.5 * size
        emitter.particleScaleRange = 0.3 * size
        emitter.particleScaleSpeed = -1.0
        emitter.particleRotation = 0
        emitter.particleRotationRange = .pi * 2
        emitter.particleRotationSpeed = 5
        emitter.particleColorBlendFactor = 1.0
        emitter.particleColorBlendFactorRange = 0.2
        emitter.particleBlendMode = .add
        return emitter
    }
    
    static func createTrail(at position: CGPoint, color: UIColor = .cyan) -> SKEmitterNode {
        let emitter = SKEmitterNode()
        emitter.particleTexture = nil
        emitter.particleColor = color
        emitter.numParticlesToEmit = 0 // Continuous
        emitter.particleBirthRate = 50
        emitter.particleLifetime = 0.3
        emitter.particleLifetimeRange = 0.1
        emitter.particlePosition = position
        emitter.particlePositionRange = CGVector(dx: 5, dy: 5)
        emitter.particleSpeed = 50
        emitter.particleSpeedRange = 20
        emitter.particleAlpha = 0.8
        emitter.particleAlphaRange = 0.2
        emitter.particleAlphaSpeed = -3.0
        emitter.particleScale = 0.3
        emitter.particleScaleRange = 0.2
        emitter.particleScaleSpeed = -2.0
        emitter.particleBlendMode = .add
        return emitter
    }
    
    static func createPowerUpGlow(at position: CGPoint, color: UIColor = .yellow) -> SKEmitterNode {
        let emitter = SKEmitterNode()
        emitter.particleTexture = nil
        emitter.particleColor = color
        emitter.numParticlesToEmit = 0
        emitter.particleBirthRate = 20
        emitter.particleLifetime = 1.0
        emitter.particleLifetimeRange = 0.3
        emitter.particlePosition = position
        emitter.particlePositionRange = CGVector(dx: 15, dy: 15)
        emitter.particleSpeed = 30
        emitter.particleSpeedRange = 10
        emitter.particleAlpha = 0.6
        emitter.particleAlphaRange = 0.2
        emitter.particleAlphaSpeed = -1.0
        emitter.particleScale = 0.4
        emitter.particleScaleRange = 0.2
        emitter.particleBlendMode = .add
        return emitter
    }
    
    static func createSparkle(at position: CGPoint, color: UIColor = .white) -> SKEmitterNode {
        let emitter = SKEmitterNode()
        emitter.particleTexture = nil
        emitter.particleColor = color
        emitter.numParticlesToEmit = 10
        emitter.particleBirthRate = 1000
        emitter.particleLifetime = 0.5
        emitter.particleLifetimeRange = 0.2
        emitter.particlePosition = position
        emitter.particlePositionRange = CGVector(dx: 0, dy: 0)
        emitter.particleSpeed = 100
        emitter.particleSpeedRange = 50
        emitter.particleAlpha = 1.0
        emitter.particleAlphaSpeed = -2.0
        emitter.particleScale = 0.2
        emitter.particleBlendMode = .add
        return emitter
    }
    
    static func createComboEffect(at position: CGPoint, multiplier: Int) -> SKEmitterNode {
        let emitter = SKEmitterNode()
        emitter.particleTexture = nil
        emitter.particleColor = .yellow
        emitter.numParticlesToEmit = multiplier * 5
        emitter.particleBirthRate = 1000
        emitter.particleLifetime = 1.0
        emitter.particlePosition = position
        emitter.particleSpeed = 150
        emitter.particleSpeedRange = 50
        emitter.particleAlpha = 1.0
        emitter.particleAlphaSpeed = -1.0
        emitter.particleScale = 0.5
        emitter.particleBlendMode = .add
        return emitter
    }
}

