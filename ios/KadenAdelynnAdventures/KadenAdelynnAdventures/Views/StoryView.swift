import SwiftUI

struct StoryView: View {
    @State private var page: Int = 0
    let pages: [String] = [
        "In a distant galaxy, Kaden and Adelynn embark on a quest to save their home from the cosmic threat...",
        "Choose your ship, upgrade your weapons, and prepare for battle!",
        "Face waves of enemies, collect power-ups, and defeat epic bosses!",
        "Are you ready to begin your adventure?"
    ]
    var onContinue: (() -> Void)?
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            Text(pages[page])
                .font(.title2)
                .multilineTextAlignment(.center)
                .padding()
            Spacer()
            Button(action: {
                if page < pages.count - 1 {
                    page += 1
                } else {
                    onContinue?()
                }
            }) {
                Text(page < pages.count - 1 ? "Next" : "Start Game")
                    .font(.title2)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.purple)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .padding(.horizontal)
        }
        .padding()
    }
}
