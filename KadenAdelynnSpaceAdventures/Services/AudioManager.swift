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
    private var currentMusicKey: String?
    private var isMusicEnabled = true
    private var isSoundEnabled = true
    private var musicVolume: Float = 0.5
    private var soundVolume: Float = 1.0
    
    private init() {
        setupAudio()
        loadSettings()
        // Delay audio session configuration to avoid Core Audio factory warnings
        // This warning is harmless but we can avoid it by configuring after app launch
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            self.configureAudioSession()
        }
    }
    
    private func configureAudioSession() {
        // Ensure we're on the main thread for audio session configuration
        guard Thread.isMainThread else {
            DispatchQueue.main.async {
                self.configureAudioSession()
            }
            return
        }
        
        do {
            let audioSession = AVAudioSession.sharedInstance()
            
            // First, deactivate if already active to avoid conflicts
            if audioSession.isOtherAudioPlaying {
                try audioSession.setActive(false, options: .notifyOthersOnDeactivation)
            }
            
            // Use .playback category for game audio so it plays even when device is muted
            // Mix with others allows it to play with other audio if needed
            try audioSession.setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
            
            #if DEBUG
            print("✅ Audio session configured successfully (category: .playback)")
            #endif
        } catch {
            #if DEBUG
            print("❌ Failed to configure audio session: \(error.localizedDescription)")
            #endif
            // Try fallback to ambient if playback fails
            do {
                let audioSession = AVAudioSession.sharedInstance()
                if audioSession.isOtherAudioPlaying {
                    try audioSession.setActive(false, options: .notifyOthersOnDeactivation)
                }
                try audioSession.setCategory(.ambient, mode: .default, options: [.mixWithOthers])
                try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
                #if DEBUG
                print("✅ Audio session configured with ambient category")
                #endif
            } catch {
                #if DEBUG
                print("❌ Failed to configure audio session with ambient: \(error.localizedDescription)")
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
        playMusic(
            key: "gameplay",
            candidates: ["gameplay", "gameplay_starfield", "background", "space_music", "game_music", "menu"],
            scene: scene
        )
    }

    func startGameplayMusic(for mode: GameMode, stageName: String, in scene: SKScene) {
        updateGameplayMusic(for: mode, stageName: stageName, bossActive: false, in: scene)
    }

    func updateGameplayMusic(for mode: GameMode, stageName: String, bossActive: Bool, in scene: SKScene) {
        guard isMusicEnabled else { return }

        if bossActive || mode == .bossRush {
            playMusic(key: "boss", candidates: ["boss", "boss_music", "boss_battle", "gameplay"], scene: scene)
            return
        }

        let profile: (key: String, candidates: [String], rate: Float)
        switch mode {
        case .training:
            profile = ("training", ["gameplay_training", "training", "menu", "gameplay"], 0.92)
        case .timeAttack:
            profile = ("time_attack", ["gameplay_time_attack", "time_attack", "gameplay", "boss"], 1.08)
        case .survival:
            profile = ("survival", ["gameplay_survival", "survival", "gameplay", "boss"], 1.04)
        case .dailyChallenge:
            profile = ("daily", ["gameplay_daily", "daily_challenge", "gameplay", "menu"], 1.03)
        case .coOp:
            profile = ("coop", ["gameplay_coop", "coop", "gameplay", "menu"], 0.98)
        default:
            switch stageName {
            case "Asteroid Belt":
                profile = ("asteroid", ["gameplay_asteroid", "asteroid_belt", "gameplay", "boss"], 1.04)
            case "Nebula Clouds":
                profile = ("nebula", ["gameplay_nebula", "nebula", "menu", "gameplay"], 0.96)
            case "Laser Gate":
                profile = ("laser_gate", ["gameplay_laser_gate", "laser_gate", "gameplay", "boss"], 1.06)
            default:
                profile = ("starfield", ["gameplay_starfield", "gameplay", "menu"], 1.0)
            }
        }

        playMusic(key: profile.key, candidates: profile.candidates, scene: scene, rate: profile.rate)
    }

    private func playMusic(key: String, candidates: [String], scene: SKScene, rate: Float = 1.0) {
        guard isMusicEnabled else { 
            print("🔇 Music disabled, not starting \(key) music")
            return 
        }

        guard currentMusicKey != key || audioPlayer?.isPlaying != true else {
            return
        }

        guard let url = firstAvailableMusicURL(from: candidates) else {
            print("⚠️ No music file found for \(key). Expected one of: \(candidates.joined(separator: ", "))")
            return
        }

        currentMusicKey = key
        audioPlayer?.stop()
        audioPlayer = nil
        backgroundMusic?.removeFromParent()
        backgroundMusic = nil

        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("⚠️ Failed to activate audio session: \(error)")
        }

        do {
            audioPlayer = try AVAudioPlayer(contentsOf: url)
            audioPlayer?.numberOfLoops = -1
            audioPlayer?.enableRate = true
            audioPlayer?.rate = rate
            audioPlayer?.volume = musicVolume
            audioPlayer?.prepareToPlay()

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.08) { [weak self] in
                guard let self = self else { return }
                if self.audioPlayer?.play() == true {
                    print("✅ Music started [\(key)]: \(url.lastPathComponent), rate \(rate)")
                } else {
                    print("❌ AVAudioPlayer failed for \(url.lastPathComponent), using SKAudioNode fallback")
                    self.fallbackToSKAudioNode(url: url, in: scene)
                }
            }
        } catch {
            print("❌ Failed to play \(key) music: \(error.localizedDescription)")
            fallbackToSKAudioNode(url: url, in: scene)
        }
    }

    private func firstAvailableMusicURL(from candidates: [String]) -> URL? {
        for fileName in candidates {
            for fileExtension in ["mp3", "m4a", "wav", "ogg"] {
                if let url = Bundle.main.url(forResource: fileName, withExtension: fileExtension) {
                    return url
                }
            }
        }
        return nil
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
        playMusic(key: "boss", candidates: ["boss", "boss_music", "boss_battle", "gameplay"], scene: scene)
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
        currentMusicKey = nil
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
