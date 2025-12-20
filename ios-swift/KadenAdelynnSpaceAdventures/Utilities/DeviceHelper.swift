//
//  DeviceHelper.swift
//  KadenAdelynnSpaceAdventures
//
//  Helper utilities for device detection and screen sizing
//

import UIKit
import SwiftUI

struct DeviceHelper {
    /// Get the device type
    static var deviceType: DeviceType {
        let screenWidth = UIScreen.main.bounds.width
        let screenHeight = UIScreen.main.bounds.height
        
        // iPhone detection
        if UIDevice.current.userInterfaceIdiom == .phone {
            // iPhone SE (1st, 2nd gen) - 320x568, 375x667
            if screenWidth <= 375 && screenHeight <= 667 {
                return .iphoneSE
            }
            // iPhone 8, 7, 6s, 6 - 375x667
            else if screenWidth == 375 && screenHeight == 667 {
                return .iphoneStandard
            }
            // iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus - 414x736
            else if screenWidth == 414 && screenHeight == 736 {
                return .iphonePlus
            }
            // iPhone X, XS, 11 Pro - 375x812
            else if screenWidth == 375 && screenHeight == 812 {
                return .iphoneX
            }
            // iPhone XR, 11 - 414x896
            else if screenWidth == 414 && screenHeight == 896 {
                return .iphoneXR
            }
            // iPhone XS Max, 11 Pro Max - 414x896
            else if screenWidth == 414 && screenHeight == 896 {
                return .iphoneMax
            }
            // iPhone 12, 12 Pro, 13, 13 Pro, 14, 14 Pro - 390x844
            else if screenWidth == 390 && screenHeight == 844 {
                return .iphonePro
            }
            // iPhone 12 Pro Max, 13 Pro Max, 14 Pro Max - 428x926
            else if screenWidth == 428 && screenHeight == 926 {
                return .iphoneProMax
            }
            // iPhone 14 Plus, 15 Plus - 428x926
            else if screenWidth == 428 {
                return .iphoneProMax
            }
            // iPhone 15 Pro, 15 - 393x852
            else if screenWidth == 393 {
                return .iphonePro
            }
            // iPhone 15 Pro Max - 430x932
            else if screenWidth == 430 {
                return .iphoneProMax
            }
            // Default to standard iPhone
            else {
                return .iphoneStandard
            }
        }
        // iPad detection
        else if UIDevice.current.userInterfaceIdiom == .pad {
            // iPad Mini - 768x1024
            if screenWidth == 768 {
                return .ipadMini
            }
            // iPad Air, iPad Pro 10.5" - 834x1112
            else if screenWidth == 834 {
                return .ipadAir
            }
            // iPad Pro 11" - 834x1194
            else if screenWidth == 834 && screenHeight == 1194 {
                return .ipadPro11
            }
            // iPad Pro 12.9" - 1024x1366
            else if screenWidth == 1024 {
                return .ipadPro129
            }
            // Default to standard iPad
            else {
                return .ipadStandard
            }
        }
        
        return .unknown
    }
    
    /// Check if device has a notch (safe area at top)
    static var hasNotch: Bool {
        if #available(iOS 11.0, *) {
            return UIApplication.shared.windows.first?.safeAreaInsets.top ?? 0 > 20
        }
        return false
    }
    
    /// Get safe area insets
    static var safeAreaInsets: UIEdgeInsets {
        if #available(iOS 11.0, *) {
            return UIApplication.shared.windows.first?.safeAreaInsets ?? .zero
        }
        return .zero
    }
    
    /// Get screen bounds
    static var screenBounds: CGRect {
        return UIScreen.main.bounds
    }
    
    /// Get screen size
    static var screenSize: CGSize {
        return UIScreen.main.bounds.size
    }
    
    /// Check if device is iPad
    static var isIPad: Bool {
        return UIDevice.current.userInterfaceIdiom == .pad
    }
    
    /// Check if device is iPhone
    static var isIPhone: Bool {
        return UIDevice.current.userInterfaceIdiom == .phone
    }
}

enum DeviceType {
    case iphoneSE
    case iphoneStandard
    case iphonePlus
    case iphoneX
    case iphoneXR
    case iphoneMax
    case iphonePro
    case iphoneProMax
    case ipadMini
    case ipadStandard
    case ipadAir
    case ipadPro11
    case ipadPro129
    case unknown
    
    var displayName: String {
        switch self {
        case .iphoneSE: return "iPhone SE"
        case .iphoneStandard: return "iPhone Standard"
        case .iphonePlus: return "iPhone Plus"
        case .iphoneX: return "iPhone X"
        case .iphoneXR: return "iPhone XR"
        case .iphoneMax: return "iPhone Max"
        case .iphonePro: return "iPhone Pro"
        case .iphoneProMax: return "iPhone Pro Max"
        case .ipadMini: return "iPad Mini"
        case .ipadStandard: return "iPad"
        case .ipadAir: return "iPad Air"
        case .ipadPro11: return "iPad Pro 11\""
        case .ipadPro129: return "iPad Pro 12.9\""
        case .unknown: return "Unknown Device"
        }
    }
}

