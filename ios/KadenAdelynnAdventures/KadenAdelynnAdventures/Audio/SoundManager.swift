import Foundation
import AVFoundation

class SoundManager {
    static let shared = SoundManager()
    private var musicPlayer: AVAudioPlayer?
    private var sfxPlayer: AVAudioPlayer?
    
    func playMusic(named name: String, loop: Bool = true) {
        guard let url = Bundle.main.url(forResource: name, withExtension: nil) else { return }
        do {
            musicPlayer = try AVAudioPlayer(contentsOf: url)
            musicPlayer?.numberOfLoops = loop ? -1 : 0
            musicPlayer?.volume = 0.7
            musicPlayer?.play()
        } catch {
            print("[SoundManager] Failed to play music: \(error)")
        }
    }
    
    func stopMusic() {
        musicPlayer?.stop()
    }
    
    func playSFX(named name: String) {
        guard let url = Bundle.main.url(forResource: name, withExtension: nil) else { return }
        do {
            sfxPlayer = try AVAudioPlayer(contentsOf: url)
            sfxPlayer?.volume = 1.0
            sfxPlayer?.play()
        } catch {
            print("[SoundManager] Failed to play SFX: \(error)")
        }
    }
}
