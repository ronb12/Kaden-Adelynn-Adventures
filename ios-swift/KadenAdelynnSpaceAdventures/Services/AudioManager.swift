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
import AudioToolbox

class AudioManager: ObservableObject {
    static let shared = AudioManager()
    
    private var soundEffects: [String: SKAction] = [:]
    private var backgroundMusic: SKAudioNode?
    private var audioPlayer: AVAudioPlayer?
    private var isMusicEnabled = true
    private var isSoundEnabled = true
    private var musicVolume: Float = 0.5
    private var soundVolume: Float = 1.0
    
    private init() {
        setupAudio()
        loadSettings()
        configureAudioSession()
    }
    
    private func configureAudioSession() {
        do {
            // Use .playback category for game audio so it plays even when device is muted
            // Mix with others allows it to play with other audio if needed
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try AVAudioSession.sharedInstance().setActive(true)
            #if DEBUG
            print("✅ Audio session configured successfully (category: .playback)")
            #endif
        } catch {
            #if DEBUG
            print("❌ Failed to configure audio session: \(error)")
            #endif
            // Try fallback to ambient if playback fails
            do {
                try AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default, options: [.mixWithOthers])
                try AVAudioSession.sharedInstance().setActive(true)
                #if DEBUG
                print("✅ Audio session configured with ambient category")
                #endif
            } catch {
                #if DEBUG
                print("❌ Failed to configure audio session with ambient: \(error)")
                #endif
            }
        }
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
        // Default to true if not set (first launch)
        if UserDefaults.standard.object(forKey: "musicEnabled") == nil {
            isMusicEnabled = true
            UserDefaults.standard.set(true, forKey: "musicEnabled")
        } else {
            isMusicEnabled = UserDefaults.standard.bool(forKey: "musicEnabled")
        }
        
        if UserDefaults.standard.object(forKey: "soundEnabled") == nil {
            isSoundEnabled = true
            UserDefaults.standard.set(true, forKey: "soundEnabled")
        } else {
            isSoundEnabled = UserDefaults.standard.bool(forKey: "soundEnabled")
        }
        
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
        guard isSoundEnabled else { 
            #if DEBUG
            print("🔇 Sound disabled: \(name)")
            #endif
            return 
        }
        
        // Use system sound for now - replace with actual audio files
        if let action = soundEffects[name] {
            scene.run(action)
            #if DEBUG
            print("🔊 Playing sound effect: \(name)")
            #endif
        } else {
            // Fallback to system sounds - different sounds for different effects
            let systemSoundId: SystemSoundID = {
                switch name {
                case "laser": return 1104  // Short beep
                case "missile", "rocket", "grenade", "explosive": 
                    #if DEBUG
                    print("🚀 Missile-type sound requested: \(name)")
                    #endif
                    return 1054  // Changed to 1054 for better missile/explosive sound
                case "coin", "collect": return 1053  // Coin collection sound (different from powerup)
                case "explosion": return 1054  // Alert sound
                case "powerup": return 1057  // Alert sound
                case "boss": return 1005  // Alert sound
                case "gameover": return 1006  // Alert sound
                case "achievement": return 1052  // Alert sound
                default: return 1104  // Default beep
                }
            }()
            AudioServicesPlaySystemSound(systemSoundId)
            print("🔊 Playing system sound: \(name) (ID: \(systemSoundId))")
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
    
    func playMissileSound(in scene: SKScene) {
        playSound("missile", in: scene)
    }
    
    func playCoinSound(in scene: SKScene) {
        playSound("coin", in: scene)
    }
    
    func startBackgroundMusic(in scene: SKScene) {
        guard isMusicEnabled else { 
            print("🔇 Music disabled, not starting background music")
            return 
        }
        
        // Stop existing music
        stopBackgroundMusic()
        
        // Ensure audio session is active
        do {
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("⚠️ Failed to activate audio session: \(error)")
        }
        
        // Try to load music file from bundle - same as PWA: gameplay.mp3 (prioritize gameplay, then menu)
        let musicFiles = ["gameplay", "menu", "background", "space_music", "game_music"]
        var musicURL: URL?
        
        for fileName in musicFiles {
            if let url = Bundle.main.url(forResource: fileName, withExtension: "mp3") {
                musicURL = url
                print("✅ Found music file: \(fileName).mp3")
                break
            } else if let url = Bundle.main.url(forResource: fileName, withExtension: "m4a") {
                musicURL = url
                print("✅ Found music file: \(fileName).m4a")
                break
            } else if let url = Bundle.main.url(forResource: fileName, withExtension: "wav") {
                musicURL = url
                print("✅ Found music file: \(fileName).wav")
                break
            }
        }
        
        if let url = musicURL {
            // Use AVAudioPlayer for better control
            do {
                audioPlayer = try AVAudioPlayer(contentsOf: url)
                audioPlayer?.numberOfLoops = -1 // Loop indefinitely
                audioPlayer?.volume = musicVolume
                audioPlayer?.prepareToPlay()
                
                // Ensure audio session is active and configured before playing
                do {
                    try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
                    try AVAudioSession.sharedInstance().setActive(true)
                    print("✅ Audio session activated and configured for playback")
                } catch {
                    print("⚠️ Failed to activate audio session: \(error)")
                }
                
                // Play with a small delay to ensure audio session is fully ready
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
                    guard let self = self else { return }
                    let success = self.audioPlayer?.play() ?? false
                    if success {
                        print("✅ Background music started: \(url.lastPathComponent) at volume \(self.musicVolume)")
                        if let fileSize = try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int64 {
                            print("   File size: \(fileSize) bytes")
                        }
                        print("   Audio session category: \(AVAudioSession.sharedInstance().category.rawValue)")
                        print("   Audio session isActive: \(AVAudioSession.sharedInstance().isOtherAudioPlaying)")
                    } else {
                        print("❌ AVAudioPlayer failed to start playback, trying fallback...")
                        print("   Audio session state: \(AVAudioSession.sharedInstance().isOtherAudioPlaying)")
                        // Try again after a brief moment
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
                            guard let self = self else { return }
                            if self.audioPlayer?.play() ?? false {
                                print("✅ Background music started on retry")
                            } else {
                                print("❌ Retry failed, using SKAudioNode fallback")
                                self.fallbackToSKAudioNode(url: url, in: scene)
                            }
                        }
                    }
                }
            } catch {
                print("❌ Failed to play background music: \(error.localizedDescription)")
                print("   Error details: \(error)")
                // Fallback to SKAudioNode
                fallbackToSKAudioNode(url: url, in: scene)
            }
        } else {
            // No music file found - log warning with debug info
            print("⚠️ No music file found in bundle. Sound effects will still work.")
            print("   Expected files: gameplay.mp3, menu.mp3, background.mp3, space_music.mp3, or game_music.mp3")
            // Debug: List all files in bundle
            if let resourcePath = Bundle.main.resourcePath {
                let fileManager = FileManager.default
                do {
                    let files = try fileManager.contentsOfDirectory(atPath: resourcePath)
                    let mp3Files = files.filter { $0.hasSuffix(".mp3") }
                    if !mp3Files.isEmpty {
                        print("   Found .mp3 files in bundle: \(mp3Files.joined(separator: ", "))")
                    } else {
                        print("   No .mp3 files found in bundle resource path: \(resourcePath)")
                    }
                } catch {
                    print("   Could not list bundle contents: \(error)")
                }
            }
        }
    }
    
    private func fallbackToSKAudioNode(url: URL?, in scene: SKScene) {
        if let url = url {
            backgroundMusic = SKAudioNode(url: url)
            backgroundMusic?.autoplayLooped = true
            backgroundMusic?.isPositional = false
            scene.addChild(backgroundMusic!)
        }
    }
    
    func startBossMusic(in scene: SKScene) {
        guard isMusicEnabled else { return }
        stopBackgroundMusic()
        
        // Try to load boss music - same as PWA: boss.mp3
        let bossMusicFiles = ["boss", "boss_music", "boss_battle"]
        var musicURL: URL?
        
        for fileName in bossMusicFiles {
            if let url = Bundle.main.url(forResource: fileName, withExtension: "mp3") {
                musicURL = url
                break
            } else if let url = Bundle.main.url(forResource: fileName, withExtension: "m4a") {
                musicURL = url
                break
            }
        }
        
        if let url = musicURL {
            do {
                audioPlayer = try AVAudioPlayer(contentsOf: url)
                audioPlayer?.numberOfLoops = -1
                audioPlayer?.volume = musicVolume
                audioPlayer?.prepareToPlay()
                audioPlayer?.play()
                print("✅ Boss music started: \(url.lastPathComponent)")
            } catch {
                print("❌ Failed to play boss music: \(error)")
            }
        } else {
            // Fallback to regular background music
            startBackgroundMusic(in: scene)
        }
    }
    
    func startMenuMusic() {
        guard isMusicEnabled else {
            print("🔇 Music disabled, not starting menu music")
            return
        }
        
        // Stop existing music
        stopBackgroundMusic()
        
        // Ensure audio session is active
        do {
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("⚠️ Failed to activate audio session: \(error)")
        }
        
        // Try to load menu music - prioritize menu.mp3 (same as PWA)
        let menuMusicFiles = ["menu", "menu_music", "background", "gameplay"]
        var musicURL: URL?
        
        for fileName in menuMusicFiles {
            if let url = Bundle.main.url(forResource: fileName, withExtension: "mp3") {
                musicURL = url
                print("✅ Found menu music file: \(fileName).mp3")
                break
            } else if let url = Bundle.main.url(forResource: fileName, withExtension: "m4a") {
                musicURL = url
                print("✅ Found menu music file: \(fileName).m4a")
                break
            } else if let url = Bundle.main.url(forResource: fileName, withExtension: "wav") {
                musicURL = url
                print("✅ Found menu music file: \(fileName).wav")
                break
            }
        }
        
        if let url = musicURL {
            do {
                audioPlayer = try AVAudioPlayer(contentsOf: url)
                audioPlayer?.numberOfLoops = -1 // Loop indefinitely
                audioPlayer?.volume = musicVolume
                audioPlayer?.prepareToPlay()
                
                // Ensure audio session is active and configured before playing
                do {
                    try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
                    try AVAudioSession.sharedInstance().setActive(true)
                    print("✅ Audio session activated for menu music")
                } catch {
                    print("⚠️ Failed to activate audio session: \(error)")
                }
                
                // Play with a small delay to ensure audio session is fully ready
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
                    guard let self = self else { return }
                    let success = self.audioPlayer?.play() ?? false
                    if success {
                        print("✅ Menu music started: \(url.lastPathComponent) at volume \(self.musicVolume)")
                    } else {
                        print("❌ AVAudioPlayer failed to start menu music playback")
                    }
                }
            } catch {
                print("❌ Failed to play menu music: \(error.localizedDescription)")
            }
        } else {
            print("⚠️ No menu music file found in bundle.")
        }
    }
    
    func stopBackgroundMusic() {
        audioPlayer?.stop()
        audioPlayer = nil
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
        // Update volume for both audio players
        audioPlayer?.volume = musicVolume
        // SKAudioNode volume is controlled differently, but we can adjust it
    }
    
    func setSoundVolume(_ volume: Float) {
        soundVolume = max(0, min(1, volume))
        UserDefaults.standard.set(soundVolume, forKey: "soundVolume")
    }
}
