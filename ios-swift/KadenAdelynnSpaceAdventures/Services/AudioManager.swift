//
//  AudioManager.swift
//  KadenAdelynnSpaceAdventures
//
//  Audio system for sound effects and music
//

import Foundation
import AVFoundation
import SpriteKit
import Combine

class AudioManager: ObservableObject {
    static let shared = AudioManager()
    
    private var soundEffects: [String: SKAction] = [:]
    private var backgroundMusic: SKAudioNode?
    private var isMusicEnabled = true
    private var isSoundEnabled = true
    private var musicVolume: Float = 0.5
    private var soundVolume: Float = 1.0
    
    private init() {
        setupAudio()
        loadSettings()
    }
    
    private func setupAudio() {
        // Create sound actions for common effects
        // Note: In a real implementation, you'd load actual audio files
        // For now, we'll use system sounds as placeholders
        
        // These would be replaced with actual audio file loading:
        // soundEffects["laser"] = SKAction.playSoundFileNamed("laser.mp3", waitForCompletion: false)
        // soundEffects["explosion"] = SKAction.playSoundFileNamed("explosion.mp3", waitForCompletion: false)
        // etc.
    }
    
    private func loadSettings() {
        isMusicEnabled = UserDefaults.standard.bool(forKey: "musicEnabled")
        isSoundEnabled = UserDefaults.standard.bool(forKey: "soundEnabled")
        musicVolume = UserDefaults.standard.float(forKey: "musicVolume")
        soundVolume = UserDefaults.standard.float(forKey: "soundVolume")
        
        if musicVolume == 0 {
            musicVolume = 0.5
        }
        if soundVolume == 0 {
            soundVolume = 1.0
        }
    }
    
    func playSound(_ name: String, in scene: SKScene) {
        guard isSoundEnabled else { return }
        
        // Use system sound for now - replace with actual audio files
        if let action = soundEffects[name] {
            scene.run(action)
        } else {
            // Fallback to system sound
            AudioServicesPlaySystemSound(1104) // System beep
        }
    }
    
    func playLaserSound(in scene: SKScene) {
        playSound("laser", in: scene)
    }
    
    func playExplosionSound(in scene: SKScene) {
        playSound("explosion", in: scene)
    }
    
    func playPowerUpSound(in scene: SKScene) {
        playSound("powerup", in: scene)
    }
    
    func playBossSound(in scene: SKScene) {
        playSound("boss", in: scene)
    }
    
    func playGameOverSound(in scene: SKScene) {
        playSound("gameover", in: scene)
    }
    
    func playAchievementSound(in scene: SKScene) {
        playSound("achievement", in: scene)
    }
    
    func startBackgroundMusic(in scene: SKScene) {
        guard isMusicEnabled else { return }
        
        // Stop existing music
        stopBackgroundMusic()
        
        // In real implementation, load actual music file:
        // if let musicURL = Bundle.main.url(forResource: "gameplay", withExtension: "mp3") {
        //     backgroundMusic = SKAudioNode(url: musicURL)
        //     backgroundMusic?.autoplayLooped = true
        //     scene.addChild(backgroundMusic!)
        // }
    }
    
    func startBossMusic(in scene: SKScene) {
        guard isMusicEnabled else { return }
        stopBackgroundMusic()
        // Load boss music
    }
    
    func stopBackgroundMusic() {
        backgroundMusic?.removeFromParent()
        backgroundMusic = nil
    }
    
    func setMusicEnabled(_ enabled: Bool) {
        isMusicEnabled = enabled
        UserDefaults.standard.set(enabled, forKey: "musicEnabled")
        if !enabled {
            stopBackgroundMusic()
        }
    }
    
    func setSoundEnabled(_ enabled: Bool) {
        isSoundEnabled = enabled
        UserDefaults.standard.set(enabled, forKey: "soundEnabled")
    }
    
    func setMusicVolume(_ volume: Float) {
        musicVolume = max(0, min(1, volume))
        UserDefaults.standard.set(musicVolume, forKey: "musicVolume")
        // Volume control would be handled by AVAudioPlayer in real implementation
    }
    
    func setSoundVolume(_ volume: Float) {
        soundVolume = max(0, min(1, volume))
        UserDefaults.standard.set(soundVolume, forKey: "soundVolume")
    }
}

import AudioToolbox

