//
// GameSaveData.swift
// KadenAdelynnAdventures
//
// Codable struct for saving/loading game state to CloudKit or UserDefaults
//

import Foundation

struct GameSaveData: Codable {
    var score: Int
    var wave: Int
    var level: Int
    var lives: Int
    var playerX: Float
    var playerY: Float
    var timestamp: Double
    // Add more fields as needed for future save compatibility
}
