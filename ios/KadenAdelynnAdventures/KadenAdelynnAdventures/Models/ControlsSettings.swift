//
// ControlsSettings.swift
// KadenAdelynnAdventures
//
// Model for customizable control settings
//

import Foundation

struct ControlsSettings: Codable {
    enum ControlScheme: String, Codable, CaseIterable {
        case classic = "Classic"
        case leftHanded = "Left-Handed"
        case tapAnywhere = "Tap Anywhere"
        case custom = "Custom"
    }
    
    var scheme: ControlScheme
    var sensitivity: Float
    // Add more fields as needed (e.g., button positions, sizes)
    
    static let `default` = ControlsSettings(scheme: .classic, sensitivity: 1.0)
}
