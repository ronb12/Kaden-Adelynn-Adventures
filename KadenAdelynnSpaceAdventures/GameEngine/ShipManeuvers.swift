//
//  ShipManeuvers.swift
//  KadenAdelynnSpaceAdventures
//
//  Ship maneuver system - All recommended maneuvers implemented
//

import Foundation
import CoreGraphics
import SpriteKit

class ShipManeuvers {
    // MARK: - Constants
    static let dashDuration: TimeInterval = 0.2  // 200ms dash
    static let dashCooldown: TimeInterval = 2.5   // 2.5 second cooldown
    static let dashSpeed: CGFloat = 25.0          // Fast dash speed
    static let dashInvincibilityDuration: TimeInterval = 0.15  // Invincible during dash
    
    static let barrelRollDuration: TimeInterval = 0.4  // 400ms roll
    static let barrelRollCooldown: TimeInterval = 3.0   // 3 second cooldown
    static let barrelRollInvincibilityDuration: TimeInterval = 0.35  // Invincible during roll
    
    static let quickStrafeDuration: TimeInterval = 0.15  // 150ms strafe
    static let quickStrafeCooldown: TimeInterval = 1.0    // 1 second cooldown
    static let quickStrafeSpeed: CGFloat = 20.0           // Fast lateral movement
    
    static let backwardThrustDuration: TimeInterval = 0.2  // 200ms thrust
    static let backwardThrustCooldown: TimeInterval = 1.5   // 1.5 second cooldown
    static let backwardThrustSpeed: CGFloat = 18.0          // Reverse speed
    
    static let boostChargeMaxDuration: TimeInterval = 1.5  // Max charge time
    static let boostChargeCooldown: TimeInterval = 4.0      // 4 second cooldown
    static let boostChargeSpeedMultiplier: CGFloat = 3.0     // 3x speed when fully charged
    
    static let zigzagDuration: TimeInterval = 0.3  // 300ms zigzag
    static let zigzagCooldown: TimeInterval = 2.0   // 2 second cooldown
    static let zigzagDistance: CGFloat = 40.0       // Distance per zigzag
    
    static let momentumDecay: CGFloat = 0.92  // Momentum decay per frame (8% loss)
    static let momentumMax: CGFloat = 1.0     // Maximum momentum
    
    static let autoEvasiveThreshold: CGFloat = 30.0  // Distance to trigger auto evasive
    static let autoEvasiveCooldown: TimeInterval = 5.0  // 5 second cooldown
    static let autoEvasiveSpeed: CGFloat = 22.0  // Evasive movement speed
    static let autoEvasiveDuration: TimeInterval = 0.25  // 250ms evasive move
    
    // MARK: - Dash/Boost
    static func startDash(player: inout Player, direction: CGPoint, currentTime: TimeInterval) -> Bool {
        guard player.dashCooldown <= 0 else { return false }
        
        player.isDashing = true
        player.dashTimer = currentTime
        player.dashCooldown = dashCooldown
        player.dashDirection = direction.normalized()
        player.invulnerable = true
        player.invulnerableTimer = currentTime + dashInvincibilityDuration
        
        return true
    }
    
    static func updateDash(player: inout Player, currentTime: TimeInterval, bounds: CGRect) {
        guard player.isDashing else { return }
        
        let elapsed = currentTime - player.dashTimer
        if elapsed >= dashDuration {
            // Dash complete
            player.isDashing = false
            player.dashDirection = CGPoint.zero
        } else {
            // Apply dash movement
            let halfWidth = bounds.width / 2
            let halfHeight = bounds.height / 2
            let newX = player.position.x + (player.dashDirection.x * dashSpeed)
            let newY = player.position.y + (player.dashDirection.y * dashSpeed)
            
            player.position.x = max(-halfWidth + 50, min(halfWidth - 50, newX))
            player.position.y = max(-halfHeight + 50, min(halfHeight - 50, newY))
        }
        
        // Update invincibility
        if player.invulnerable && currentTime >= player.invulnerableTimer {
            player.invulnerable = false
        }
    }
    
    // MARK: - Momentum Drift
    static func updateMomentum(player: inout Player, movementDirection: CGPoint, deltaTime: TimeInterval) {
        // Calculate velocity based on movement
        if movementDirection.length() > 0.1 {
            // Add to momentum when moving
            player.velocity = CGPoint(
                x: movementDirection.x * player.speed,
                y: movementDirection.y * player.speed
            )
            player.momentum = min(momentumMax, player.momentum + 0.1)
        } else {
            // Decay momentum when not moving
            player.momentum *= momentumDecay
            player.velocity.x *= momentumDecay
            player.velocity.y *= momentumDecay
            
            if player.momentum < 0.05 {
                player.momentum = 0
                player.velocity = CGPoint.zero
            }
        }
    }
    
    static func applyMomentum(player: inout Player, bounds: CGRect, deltaTime: TimeInterval) {
        guard player.momentum > 0 && !player.isDashing else { return }
        
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        let newX = player.position.x + (player.velocity.x * CGFloat(deltaTime) * player.momentum)
        let newY = player.position.y + (player.velocity.y * CGFloat(deltaTime) * player.momentum)
        
        player.position.x = max(-halfWidth + 50, min(halfWidth - 50, newX))
        player.position.y = max(-halfHeight + 50, min(halfHeight - 50, newY))
    }
    
    // MARK: - Barrel Roll
    static func startBarrelRoll(player: inout Player, currentTime: TimeInterval) -> Bool {
        guard player.barrelRollCooldown <= 0 else { return false }
        
        player.isBarrelRolling = true
        player.barrelRollTimer = currentTime
        player.barrelRollCooldown = barrelRollCooldown
        player.barrelRollRotation = 0.0
        player.invulnerable = true
        player.invulnerableTimer = currentTime + barrelRollInvincibilityDuration
        
        return true
    }
    
    static func updateBarrelRoll(player: inout Player, currentTime: TimeInterval) {
        guard player.isBarrelRolling else { return }
        
        let elapsed = currentTime - player.barrelRollTimer
        if elapsed >= barrelRollDuration {
            // Roll complete
            player.isBarrelRolling = false
            player.barrelRollRotation = 0.0
            player.invulnerable = false
        } else {
            // Update rotation (full 360° rotation)
            let progress = CGFloat(elapsed / barrelRollDuration)
            player.barrelRollRotation = progress * .pi * 2
        }
        
        // Update invincibility
        if player.invulnerable && currentTime >= player.invulnerableTimer {
            player.invulnerable = false
        }
    }
    
    // MARK: - Quick Strafe
    static func startQuickStrafe(player: inout Player, direction: CGFloat, currentTime: TimeInterval) -> Bool {
        guard player.strafeCooldown <= 0 else { return false }
        
        player.isQuickStrafing = true
        player.strafeDirection = direction > 0 ? 1.0 : -1.0
        player.strafeTimer = currentTime
        player.strafeCooldown = quickStrafeCooldown
        
        return true
    }
    
    static func updateQuickStrafe(player: inout Player, currentTime: TimeInterval, bounds: CGRect) {
        guard player.isQuickStrafing else { return }
        
        let elapsed = currentTime - player.strafeTimer
        if elapsed >= quickStrafeDuration {
            // Strafe complete
            player.isQuickStrafing = false
            player.strafeDirection = 0.0
        } else {
            // Apply strafe movement
            let halfWidth = bounds.width / 2
            let newX = player.position.x + (player.strafeDirection * quickStrafeSpeed)
            
            player.position.x = max(-halfWidth + 50, min(halfWidth - 50, newX))
        }
    }
    
    // MARK: - Backward Thrust
    static func startBackwardThrust(player: inout Player, currentTime: TimeInterval) -> Bool {
        guard player.backwardThrustCooldown <= 0 else { return false }
        
        player.isBackwardThrusting = true
        player.backwardThrustTimer = currentTime
        player.backwardThrustCooldown = backwardThrustCooldown
        
        return true
    }
    
    static func updateBackwardThrust(player: inout Player, currentTime: TimeInterval, bounds: CGRect) {
        guard player.isBackwardThrusting else { return }
        
        let elapsed = currentTime - player.backwardThrustTimer
        if elapsed >= backwardThrustDuration {
            // Thrust complete
            player.isBackwardThrusting = false
        } else {
            // Apply backward movement (move up in center-origin coordinates)
            let halfHeight = bounds.height / 2
            let newY = player.position.y + backwardThrustSpeed
            
            player.position.y = max(-halfHeight + 50, min(halfHeight - 50, newY))
        }
    }
    
    // MARK: - Boost Charge
    static func startBoostCharge(player: inout Player, currentTime: TimeInterval) {
        guard player.boostChargeCooldown <= 0 else { return }
        player.isChargingBoost = true
    }
    
    static func updateBoostCharge(player: inout Player, currentTime: TimeInterval) {
        guard player.isChargingBoost else { return }
        
        // Charge increases over time
        let chargeRate: CGFloat = 0.02  // 2% per frame
        player.boostChargeLevel = min(1.0, player.boostChargeLevel + chargeRate)
    }
    
    static func releaseBoostCharge(player: inout Player, direction: CGPoint, currentTime: TimeInterval, bounds: CGRect) -> Bool {
        guard player.isChargingBoost && player.boostChargeLevel > 0.1 else {
            player.isChargingBoost = false
            player.boostChargeLevel = 0.0
            return false
        }
        
        // Calculate boost distance based on charge level
        let boostDistance = boostChargeSpeedMultiplier * player.speed * CGFloat(player.boostChargeLevel)
        let normalizedDirection = direction.normalized()
        
        let halfWidth = bounds.width / 2
        let halfHeight = bounds.height / 2
        let newX = player.position.x + (normalizedDirection.x * boostDistance)
        let newY = player.position.y + (normalizedDirection.y * boostDistance)
        
        player.position.x = max(-halfWidth + 50, min(halfWidth - 50, newX))
        player.position.y = max(-halfHeight + 50, min(halfHeight - 50, newY))
        
        // Reset charge
        player.isChargingBoost = false
        player.boostChargeLevel = 0.0
        player.boostChargeCooldown = boostChargeCooldown
        
        return true
    }
    
    // MARK: - Zigzag Pattern
    static func startZigzag(player: inout Player, currentTime: TimeInterval) -> Bool {
        guard player.zigzagCooldown <= 0 else { return false }
        
        player.isZigzagging = true
        player.zigzagTimer = currentTime
        player.zigzagCooldown = zigzagCooldown
        player.zigzagDirection *= -1  // Alternate direction
        
        return true
    }
    
    static func updateZigzag(player: inout Player, currentTime: TimeInterval, bounds: CGRect) {
        guard player.isZigzagging else { return }
        
        let elapsed = currentTime - player.zigzagTimer
        if elapsed >= zigzagDuration {
            // Zigzag complete
            player.isZigzagging = false
        } else {
            // Apply zigzag movement (side to side)
            let halfWidth = bounds.width / 2
            let progress = CGFloat(elapsed / zigzagDuration)
            let distance = zigzagDistance * (1.0 - abs(progress - 0.5) * 2.0)  // Peak in middle
            let newX = player.position.x + (player.zigzagDirection * distance)
            
            player.position.x = max(-halfWidth + 50, min(halfWidth - 50, newX))
        }
    }
    
    // MARK: - Auto Evasive Maneuver
    static func checkAutoEvasive(player: inout Player, enemyBullets: [Bullet], currentTime: TimeInterval, bounds: CGRect) -> Bool {
        guard player.dashCooldown <= 0.5 else { return false }  // Only if dash is almost ready
        
        // Find nearest enemy bullet
        var nearestBullet: Bullet?
        var nearestDistance: CGFloat = CGFloat.greatestFiniteMagnitude
        
        for bullet in enemyBullets {
            guard bullet.owner == .enemy else { continue }
            
            let dx = bullet.position.x - player.position.x
            let dy = bullet.position.y - player.position.y
            let distance = sqrt(dx * dx + dy * dy)
            
            if distance < nearestDistance && distance < autoEvasiveThreshold {
                nearestDistance = distance
                nearestBullet = bullet
            }
        }
        
        guard let bullet = nearestBullet else { return false }
        
        // Calculate evasive direction (perpendicular to bullet path)
        let bulletDirection = bullet.velocity.normalized()
        let evasiveDirection = CGPoint(x: -bulletDirection.y, y: bulletDirection.x)
        
        // Choose direction away from bullet
        let toPlayer = CGPoint(
            x: player.position.x - bullet.position.x,
            y: player.position.y - bullet.position.y
        )
        let dotProduct = evasiveDirection.x * toPlayer.x + evasiveDirection.y * toPlayer.y
        let finalDirection = dotProduct > 0 ? evasiveDirection : CGPoint(x: -evasiveDirection.x, y: -evasiveDirection.y)
        
        // Trigger dash in evasive direction
        return startDash(player: &player, direction: finalDirection, currentTime: currentTime)
    }
    
    // MARK: - Cooldown Updates
    static func updateCooldowns(player: inout Player, deltaTime: TimeInterval) {
        if player.dashCooldown > 0 {
            player.dashCooldown -= deltaTime
            if player.dashCooldown < 0 { player.dashCooldown = 0 }
        }
        
        if player.barrelRollCooldown > 0 {
            player.barrelRollCooldown -= deltaTime
            if player.barrelRollCooldown < 0 { player.barrelRollCooldown = 0 }
        }
        
        if player.strafeCooldown > 0 {
            player.strafeCooldown -= deltaTime
            if player.strafeCooldown < 0 { player.strafeCooldown = 0 }
        }
        
        if player.backwardThrustCooldown > 0 {
            player.backwardThrustCooldown -= deltaTime
            if player.backwardThrustCooldown < 0 { player.backwardThrustCooldown = 0 }
        }
        
        if player.boostChargeCooldown > 0 {
            player.boostChargeCooldown -= deltaTime
            if player.boostChargeCooldown < 0 { player.boostChargeCooldown = 0 }
        }
        
        if player.zigzagCooldown > 0 {
            player.zigzagCooldown -= deltaTime
            if player.zigzagCooldown < 0 { player.zigzagCooldown = 0 }
        }
    }
}

// MARK: - CGPoint Extensions
extension CGPoint {
    func normalized() -> CGPoint {
        let length = self.length()
        guard length > 0 else { return CGPoint.zero }
        return CGPoint(x: self.x / length, y: self.y / length)
    }
    
    func length() -> CGFloat {
        return sqrt(x * x + y * y)
    }
}

