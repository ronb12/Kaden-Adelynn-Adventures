//
//  CustomizationManager.swift
//  KadenAdelynnSpaceAdventures
//
//  Manages all customization options (trails, bullets, themes)
//

import UIKit
import SpriteKit

class CustomizationManager {
    // MARK: - Trail Customization
    
    static func getSelectedTrail() -> String {
        let key = "customization_trails_selected"
        return UserDefaults.standard.string(forKey: key) ?? "default"
    }
    
    static func getTrailColors(trailName: String) -> (UIColor, CGFloat) {
        // Returns: (trailColor, intensity)
        switch trailName.lowercased() {
        case "sparkle", "sparkle trail":
            return (UIColor(red: 1.0, green: 1.0, blue: 0.8, alpha: 1.0), 1.2) // Yellow-white sparkle
        case "flame", "flame trail":
            return (UIColor(red: 1.0, green: 0.4, blue: 0.0, alpha: 1.0), 1.5) // Orange-red flame
        case "electric", "electric trail":
            return (UIColor(red: 1.0, green: 1.0, blue: 0.0, alpha: 1.0), 1.3) // Yellow electric
        case "smoke", "smoke trail":
            return (UIColor(red: 0.5, green: 0.5, blue: 0.5, alpha: 0.8), 0.8) // Gray smoke
        case "nebula", "nebula trail":
            return (UIColor(red: 0.8, green: 0.2, blue: 1.0, alpha: 1.0), 1.4) // Purple nebula
        case "cosmic", "cosmic trail":
            return (UIColor(red: 0.0, green: 0.6, blue: 1.0, alpha: 1.0), 1.3) // Blue cosmic
        default: // "default"
            return (UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0), 1.0) // Cyan default
        }
    }
    
    // MARK: - Bullet Customization
    
    static func getSelectedBullet() -> String {
        let key = "customization_bullets_selected"
        return UserDefaults.standard.string(forKey: key) ?? "default"
    }
    
    static func getBulletColors(bulletName: String) -> (UIColor, UIColor) {
        // Returns: (bulletColor, glowColor)
        switch bulletName.lowercased() {
        case "laser", "laser beam":
            return (UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0), UIColor(red: 0.5, green: 1.0, blue: 1.0, alpha: 1.0)) // Cyan
        case "plasma", "plasma bolt":
            return (UIColor(red: 0.8, green: 0.2, blue: 1.0, alpha: 1.0), UIColor(red: 1.0, green: 0.4, blue: 1.0, alpha: 1.0)) // Purple-pink
        case "electric", "electric bolt":
            return (UIColor(red: 1.0, green: 1.0, blue: 0.0, alpha: 1.0), UIColor(red: 1.0, green: 0.8, blue: 0.0, alpha: 1.0)) // Yellow
        case "ice", "ice shard":
            return (UIColor(red: 0.5, green: 0.9, blue: 1.0, alpha: 1.0), UIColor(red: 0.7, green: 1.0, blue: 1.0, alpha: 1.0)) // Light blue
        case "fire", "fireball":
            return (UIColor(red: 1.0, green: 0.3, blue: 0.0, alpha: 1.0), UIColor(red: 1.0, green: 0.6, blue: 0.0, alpha: 1.0)) // Red-orange
        case "energy", "energy orb":
            return (UIColor(red: 0.0, green: 1.0, blue: 0.5, alpha: 1.0), UIColor(red: 0.5, green: 1.0, blue: 0.8, alpha: 1.0)) // Green-cyan
        case "photon", "photon beam":
            return (UIColor(red: 0.2, green: 0.4, blue: 0.9, alpha: 1.0), UIColor(red: 0.5, green: 0.7, blue: 1.0, alpha: 1.0)) // Blue-purple
        default: // "default"
            return (UIColor(red: 1.0, green: 1.0, blue: 0.3, alpha: 1.0), UIColor(red: 1.0, green: 1.0, blue: 0.0, alpha: 1.0)) // Yellow default
        }
    }
    
    // MARK: - Theme Customization
    
    static func getSelectedTheme() -> String {
        let key = "customization_themes_selected"
        return UserDefaults.standard.string(forKey: key) ?? "default"
    }
    
    static func getThemeColors(themeName: String) -> (backgroundColor: UIColor, starColor: UIColor, starBrightness: CGFloat) {
        // Returns: (backgroundColor, starColor, starBrightness)
        switch themeName.lowercased() {
        case "dark", "dark space":
            return (
                backgroundColor: UIColor(red: 0.0, green: 0.0, blue: 0.1, alpha: 1.0), // Very dark blue
                starColor: UIColor(red: 0.3, green: 0.3, blue: 0.5, alpha: 1.0), // Dim blue stars
                starBrightness: 0.4
            )
        case "neon", "neon city":
            return (
                backgroundColor: UIColor(red: 0.1, green: 0.0, blue: 0.3, alpha: 1.0), // Dark purple
                starColor: UIColor(red: 0.0, green: 1.0, blue: 1.0, alpha: 1.0), // Cyan stars
                starBrightness: 0.9
            )
        case "sunset":
            return (
                backgroundColor: UIColor(red: 0.3, green: 0.1, blue: 0.2, alpha: 1.0), // Dark orange-red
                starColor: UIColor(red: 1.0, green: 0.6, blue: 0.3, alpha: 1.0), // Orange stars
                starBrightness: 0.7
            )
        case "ocean", "ocean deep":
            return (
                backgroundColor: UIColor(red: 0.0, green: 0.1, blue: 0.3, alpha: 1.0), // Dark blue
                starColor: UIColor(red: 0.3, green: 0.7, blue: 1.0, alpha: 1.0), // Light blue stars
                starBrightness: 0.6
            )
        case "cosmic":
            return (
                backgroundColor: UIColor(red: 0.1, green: 0.0, blue: 0.2, alpha: 1.0), // Dark purple
                starColor: UIColor(red: 0.8, green: 0.2, blue: 1.0, alpha: 1.0), // Purple stars
                starBrightness: 0.8
            )
        case "matrix":
            return (
                backgroundColor: UIColor(red: 0.0, green: 0.1, blue: 0.0, alpha: 1.0), // Dark green
                starColor: UIColor(red: 0.0, green: 1.0, blue: 0.3, alpha: 1.0), // Green stars
                starBrightness: 0.7
            )
        default: // "default"
            return (
                backgroundColor: UIColor(red: 0.1, green: 0.2, blue: 0.4, alpha: 1.0), // Dark blue
                starColor: UIColor.white, // White stars
                starBrightness: 0.8
            )
        }
    }
}

