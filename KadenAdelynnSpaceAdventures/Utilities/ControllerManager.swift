//
//  ControllerManager.swift
//  KadenAdelynnSpaceAdventures
//
//  Bluetooth controller support using GameController framework
//

import Foundation
import GameController
import Combine

class ControllerManager: ObservableObject {
    static let shared = ControllerManager()
    
    @Published var isControllerConnected: Bool = false
    @Published var controllerName: String = ""
    @Published var isEnabled: Bool = true
    
    private var currentController: GCController?
    private var controllerConnectedObserver: NSObjectProtocol?
    private var controllerDisconnectedObserver: NSObjectProtocol?
    
    // Controller input state
    @Published var movementDirection: CGPoint = .zero
    @Published var isShooting: Bool = false
    @Published var pausePressed: Bool = false
    
    private init() {
        loadSettings()
        setupControllerObservers()
        checkForControllers()
    }
    
    private func loadSettings() {
        isEnabled = UserDefaults.standard.bool(forKey: "controllerSupportEnabled")
        if !UserDefaults.standard.bool(forKey: "controllerSupportSet") {
            // Default to enabled if not set
            isEnabled = true
            UserDefaults.standard.set(true, forKey: "controllerSupportEnabled")
            UserDefaults.standard.set(true, forKey: "controllerSupportSet")
        }
    }
    
    func setEnabled(_ enabled: Bool) {
        isEnabled = enabled
        UserDefaults.standard.set(enabled, forKey: "controllerSupportEnabled")
        
        if !enabled {
            disconnectController()
        } else {
            checkForControllers()
        }
    }
    
    private func setupControllerObservers() {
        // Observe controller connections
        controllerConnectedObserver = NotificationCenter.default.addObserver(
            forName: .GCControllerDidConnect,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            self?.handleControllerConnected(notification)
        }
        
        // Observe controller disconnections
        controllerDisconnectedObserver = NotificationCenter.default.addObserver(
            forName: .GCControllerDidDisconnect,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            self?.handleControllerDisconnected(notification)
        }
    }
    
    private func checkForControllers() {
        guard isEnabled else {
            disconnectController()
            return
        }
        
        let controllers = GCController.controllers()
        if let controller = controllers.first {
            connectController(controller)
        } else {
            disconnectController()
        }
    }
    
    private func handleControllerConnected(_ notification: Notification) {
        guard isEnabled else { return }
        
        if let controller = notification.object as? GCController {
            connectController(controller)
        }
    }
    
    private func handleControllerDisconnected(_ notification: Notification) {
        if let controller = notification.object as? GCController,
           controller == currentController {
            disconnectController()
        }
    }
    
    private func connectController(_ controller: GCController) {
        guard isEnabled else { return }
        
        currentController = controller
        isControllerConnected = true
        controllerName = controller.vendorName ?? "Controller"
        
        setupControllerInput(controller)
    }
    
    private func disconnectController() {
        currentController = nil
        isControllerConnected = false
        controllerName = ""
        movementDirection = .zero
        isShooting = false
        pausePressed = false
    }
    
    private func setupControllerInput(_ controller: GCController) {
        // Setup extended gamepad (Xbox, PlayStation, MFi)
        if let gamepad = controller.extendedGamepad {
            // D-pad or left thumbstick for movement
            gamepad.leftThumbstick.valueChangedHandler = { [weak self] _, xValue, yValue in
                guard let self = self, self.isEnabled else { return }
                // Invert Y axis (up is negative in controller, but we want up to be positive)
                self.movementDirection = CGPoint(x: CGFloat(xValue), y: -CGFloat(yValue))
            }
            
            gamepad.dpad.valueChangedHandler = { [weak self] _, xValue, yValue in
                guard let self = self, self.isEnabled else { return }
                // If thumbstick is not being used, use D-pad
                if abs(gamepad.leftThumbstick.xAxis.value) < 0.1 && abs(gamepad.leftThumbstick.yAxis.value) < 0.1 {
                    self.movementDirection = CGPoint(x: CGFloat(xValue), y: -CGFloat(yValue))
                }
            }
            
            // A button (Xbox) or X button (PlayStation) for shooting
            gamepad.buttonA.valueChangedHandler = { [weak self] _, value, pressed in
                guard let self = self, self.isEnabled else { return }
                self.isShooting = pressed
            }
            
            // X button (Xbox) or Square button (PlayStation) as alternative shoot
            gamepad.buttonX.valueChangedHandler = { [weak self] _, value, pressed in
                guard let self = self, self.isEnabled else { return }
                if pressed {
                    self.isShooting = true
                }
            }
            
            // Pause button (Menu button) - modern API
            gamepad.buttonMenu.valueChangedHandler = { [weak self] _, value, pressed in
                guard let self = self, self.isEnabled else { return }
                if pressed {
                    self.pausePressed = true
                    // Reset after a short delay
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        self.pausePressed = false
                    }
                }
            }
        }
        // Fallback to micro gamepad (older controllers)
        else if let gamepad = controller.microGamepad {
            gamepad.dpad.valueChangedHandler = { [weak self] _, xValue, yValue in
                guard let self = self, self.isEnabled else { return }
                self.movementDirection = CGPoint(x: CGFloat(xValue), y: -CGFloat(yValue))
            }
            
            gamepad.buttonA.valueChangedHandler = { [weak self] _, value, pressed in
                guard let self = self, self.isEnabled else { return }
                self.isShooting = pressed
            }
            
            // Pause button (Menu button) - modern API
            gamepad.buttonMenu.valueChangedHandler = { [weak self] _, value, pressed in
                guard let self = self, self.isEnabled else { return }
                if pressed {
                    self.pausePressed = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        self.pausePressed = false
                    }
                }
            }
        }
    }
    
    func update() {
        // Reset shooting if not continuously pressed
        // This is handled by the valueChangedHandler, but we can add additional logic here if needed
    }
    
    deinit {
        if let observer = controllerConnectedObserver {
            NotificationCenter.default.removeObserver(observer)
        }
        if let observer = controllerDisconnectedObserver {
            NotificationCenter.default.removeObserver(observer)
        }
    }
}

