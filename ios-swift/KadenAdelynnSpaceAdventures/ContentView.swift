import SwiftUI

struct ContentView: View {
	@EnvironmentObject var gameState: GameStateManager

    var body: some View {
        GeometryReader { geometry in
            Group {
                switch gameState.currentScreen {
				case .mainMenu:
					MainMenuView()
				case .settings:
					SettingsView(gameState: gameState)
				case .privacyPolicy:
					PrivacyPolicyView(gameState: gameState)
				case .signIn:
					SignInView(signInService: AppleSignInService(), gameState: gameState)
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
				}
			}
			.frame(width: geometry.size.width, height: geometry.size.height)
		}
		.ignoresSafeArea()
		.environmentObject(gameState)
    }
}

#if DEBUG
struct ContentView_Previews: PreviewProvider {
	static var previews: some View {
		ContentView().environmentObject(GameStateManager())
	}
}
#endif
