//
// ControlsSettingsView.swift
// KadenAdelynnAdventures
//
// SwiftUI view for customizing control scheme and sensitivity
//

import SwiftUI

struct ControlsSettingsView: View {
    @AppStorage("controlsSettings") private var controlsData: Data = try! JSONEncoder().encode(ControlsSettings.default)
    @State private var settings: ControlsSettings = ControlsSettings.default
    
    var body: some View {
        Form {
            Section(header: Text("Control Scheme")) {
                Picker("Scheme", selection: $settings.scheme) {
                    ForEach(ControlsSettings.ControlScheme.allCases, id: \ .self) { scheme in
                        Text(scheme.rawValue)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
            }
            Section(header: Text("Sensitivity")) {
                Slider(value: $settings.sensitivity, in: 0.5...2.0, step: 0.05) {
                    Text("Sensitivity")
                }
                Text(String(format: "%.2f", settings.sensitivity))
            }
        }
        .navigationTitle("Controls")
        .onAppear {
            if let loaded = try? JSONDecoder().decode(ControlsSettings.self, from: controlsData) {
                settings = loaded
            }
        }
        .onChange(of: settings) { newValue in
            if let encoded = try? JSONEncoder().encode(newValue) {
                controlsData = encoded
            }
        }
    }
}

#Preview {
    ControlsSettingsView()
}
