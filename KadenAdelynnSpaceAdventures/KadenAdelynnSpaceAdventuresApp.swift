import SwiftUI
import FirebaseCore

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        FirebaseApp.configure()
        return true
    }
}

@main
struct KadenAdelynnSpaceAdventuresApp: App {
	@StateObject private var gameState = GameStateManager()
	@StateObject private var themeManager = ThemeManager.shared
	@Environment(\.colorScheme) var systemColorScheme
	@UIApplicationDelegateAdaptor(AppDelegate.self) var delegate

	var body: some Scene {
		WindowGroup {
			ContentView()
				.environmentObject(gameState)
				.environmentObject(themeManager)
				.preferredColorScheme(themeManager.currentTheme.colorScheme)
		}
	}
}

