import SwiftUI

struct MainMenuView: View {
    @State private var selectedCharacter: String = "Kaden"
    @State private var selectedShip: String = "Falcon"
    @State private var showGame: Bool = false
    
    let characters = ["Kaden", "Adelynn"]
    let ships = ["Falcon", "Comet", "Nova"]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 32) {
                Text("Kaden & Adelynn Adventures")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .padding(.top, 40)
                
                VStack(spacing: 16) {
                    Text("Select Character")
                        .font(.headline)
                    Picker("Character", selection: $selectedCharacter) {
                        ForEach(characters, id: \.self) { char in
                            Text(char)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                VStack(spacing: 16) {
                    Text("Select Ship")
                        .font(.headline)
                    Picker("Ship", selection: $selectedShip) {
                        ForEach(ships, id: \.self) { ship in
                            Text(ship)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Button(action: { showGame = true }) {
                    Text("Start Game")
                        .font(.title2)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .padding(.horizontal)
                
                Spacer()
            }
            .navigationBarHidden(true)
            .background(
                NavigationLink(destination: GameViewWrapper(character: selectedCharacter, ship: selectedShip), isActive: $showGame) { EmptyView() }
            )
        }
    }
}



struct MainMenuView_Previews: PreviewProvider {
    static var previews: some View {
        MainMenuView()
    }
}
