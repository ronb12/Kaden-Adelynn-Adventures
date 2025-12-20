
import SwiftUI

// Wrapper to pass selection to GameViewController
struct GameViewWrapper: UIViewControllerRepresentable {
    let character: String
    let ship: String
    
    func makeUIViewController(context: Context) -> GameViewController {
        let vc = GameViewController()
        vc.selectedCharacter = character
        vc.selectedShip = ship
        return vc
    }
    
    func updateUIViewController(_ uiViewController: GameViewController, context: Context) {}
}
