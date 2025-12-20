import SwiftUI

@main
struct KadenAdelynnSpaceAdventuresApp: App {
	@StateObject private var gameState = GameStateManager()

	var body: some Scene {
		WindowGroup {
			ContentView()
				.environmentObject(gameState)
		}
	}
}

