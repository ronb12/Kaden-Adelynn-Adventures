import SwiftUI

struct ContentView: View {
	@EnvironmentObject var gameState: GameStateManager

    var body: some View {
        ZStack {
            // Default background to prevent white screen
            Color.black
                .ignoresSafeArea()
            
            GeometryReader { geometry in
                Group {
                    switch gameState.currentScreen {
                    case .mainMenu:
                        MainMenuView()
                    case .settings:
                        SettingsView(gameState: gameState)
                    case .privacyPolicy:
                        PrivacyPolicyView()
                    case .signIn:
                        LandingView(gameState: gameState)
                    case .characterSelect:
                        CharacterSelectView()
                    case .shipSelect:
                        ShipSelectView()
                    case .story:
                        StoryView()
                    case .playing:
                        GameView()
                    case .gameOver:
                        GameOverView()
                    case .store:
                        StoreView()
                    case .scores:
                        ScoresView()
                    case .termsOfService:
                        TermsOfServiceView()
                    case .statistics:
                        StatisticsDashboardView()
                    case .saveLoad:
                        SaveLoadMenuView()
                    case .weaponUpgrades:
                        WeaponUpgradesView()
                    case .customization:
                        CustomizationView()
                    case .credits:
                        CreditsView()
                    }
                }
                .frame(width: geometry.size.width, height: geometry.size.height)
            }
        }
        .ignoresSafeArea()
        .environmentObject(gameState)
        .task {
            // Check authentication state on appear
            checkAuthenticationState()
        }
    }
    
    private func checkAuthenticationState() {
        // Check if user has signed in before
        let hasSignedInBefore = UserDefaults.standard.bool(forKey: "hasSignedInBefore")
        
        // Check current authentication state
        let gameCenterAuth = GameCenterService.shared.isAuthenticated
        let appleSignInService = AppleSignInService()
        let appleSignInAuth = appleSignInService.isSignedIn
        let firebaseAuth = FirebaseAuthService.shared.isAuthenticated
        
        // If user has signed in before or is currently authenticated, go to main menu
        if hasSignedInBefore || gameCenterAuth || appleSignInAuth || firebaseAuth {
            gameState.currentScreen = .mainMenu
        } else {
            // Show landing page for first-time users
            gameState.currentScreen = .signIn
        }
    }
}

#if DEBUG
struct ContentView_Previews: PreviewProvider {
	static var previews: some View {
		ContentView().environmentObject(GameStateManager())
	}
}
#endif
