//
//  FirebaseAuthService.swift
//  KadenAdelynnSpaceAdventures
//
//  Firebase Authentication service for Game Center and Sign in with Apple
//

import Foundation
import Combine
import GameKit
import AuthenticationServices
import FirebaseAuth
import FirebaseFunctions

class FirebaseAuthService: ObservableObject {
    static let shared = FirebaseAuthService()
    
    @Published var isAuthenticated: Bool = false
    @Published var currentUser: FirebaseUser?
    @Published var error: Error?
    
    private init() {
        checkAuthState()
    }
    
    // MARK: - Auth State
    
    func checkAuthState() {
        if let user = Auth.auth().currentUser {
            self.currentUser = FirebaseUser(
                uid: user.uid,
                displayName: user.displayName,
                email: user.email
            )
            self.isAuthenticated = true
        } else {
            self.isAuthenticated = false
            self.currentUser = nil
        }
    }
    
    // MARK: - Game Center Authentication
    
    func signInWithGameCenter(completion: @escaping (Bool, Error?) -> Void) {
        guard GameCenterService.shared.isAuthenticated else {
            let error = NSError(domain: "FirebaseAuthService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Game Center not authenticated"])
            completion(false, error)
            return
        }
        
        let playerID = GameCenterService.shared.playerID
        let displayName = GameCenterService.shared.playerName
        
        // Call Cloud Function to generate custom token
        let functions = Functions.functions()
        let function = functions.httpsCallable("generateGameCenterToken")
        
        let data: [String: Any] = [
            "playerID": playerID,
            "displayName": displayName
        ]
        
        function.call(data) { [weak self] result, error in
            if let error = error {
                self?.error = error
                completion(false, error)
                return
            }
            
            guard let result = result,
                  let data = result.data as? [String: Any],
                  let customToken = data["token"] as? String else {
                let error = NSError(domain: "FirebaseAuthService", code: -2, userInfo: [NSLocalizedDescriptionKey: "Failed to get custom token from function"])
                completion(false, error)
                return
            }
            
            // Sign in with the custom token
            Auth.auth().signIn(withCustomToken: customToken) { [weak self] authResult, error in
                if let error = error {
                    self?.error = error
                    completion(false, error)
                    return
                }
                
                guard let user = authResult?.user else {
                    let error = NSError(domain: "FirebaseAuthService", code: -3, userInfo: [NSLocalizedDescriptionKey: "Failed to get Firebase user"])
                    completion(false, error)
                    return
                }
                
                self?.currentUser = FirebaseUser(
                    uid: user.uid,
                    displayName: user.displayName ?? displayName,
                    email: user.email
                )
                self?.isAuthenticated = true
                completion(true, nil)
            }
        }
    }
    
    // MARK: - Sign in with Apple Authentication
    
    func signInWithApple(credential: ASAuthorizationAppleIDCredential, completion: @escaping (Bool, Error?) -> Void) {
        // Note: This method signature matches what LandingView expects
        guard let identityToken = credential.identityToken,
              let idTokenString = String(data: identityToken, encoding: .utf8) else {
            let error = NSError(domain: "FirebaseAuthService", code: -4, userInfo: [NSLocalizedDescriptionKey: "Failed to get Apple ID token"])
            completion(false, error)
            return
        }
        
        // Create Apple credential using OAuthProvider
        // For Apple Sign In with Firebase, we use the ID token directly
        let provider = OAuthProvider(providerID: "apple.com")
        
        // Use getCredentialWith to create the Firebase credential
        // The ID token is passed through the provider's credential flow
        provider.getCredentialWith(nil) { [weak self] authCredential, error in
            guard let self = self else { return }
            
            if let error = error {
                self.error = error
                completion(false, error)
                return
            }
            
            guard let authCredential = authCredential else {
                let error = NSError(domain: "FirebaseAuthService", code: -5, userInfo: [NSLocalizedDescriptionKey: "Failed to get credential"])
                completion(false, error)
                return
            }
            
            // Sign in with the credential
            Auth.auth().signIn(with: authCredential) { [weak self] result, error in
                guard let self = self else { return }
                
                if let error = error {
                    self.error = error
                    completion(false, error)
                    return
                }
                
                guard let user = result?.user else {
                    let error = NSError(domain: "FirebaseAuthService", code: -6, userInfo: [NSLocalizedDescriptionKey: "Failed to get Firebase user"])
                    completion(false, error)
                    return
                }
                
                // Update display name if needed (using the Apple credential from outer scope)
                if let fullName = credential.fullName {
                    let displayName = PersonNameComponentsFormatter().string(from: fullName)
                    if user.displayName == nil || user.displayName?.isEmpty == true {
                        let changeRequest = user.createProfileChangeRequest()
                        changeRequest.displayName = displayName
                        changeRequest.commitChanges { _ in }
                    }
                }
                
                self.currentUser = FirebaseUser(
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email ?? credential.email
                )
                self.isAuthenticated = true
                completion(true, nil)
            }
        }
    }
    
    // MARK: - Sign Out
    
    func signOut() {
        try? Auth.auth().signOut()
        isAuthenticated = false
        currentUser = nil
    }
}

// MARK: - Firebase User Model

struct FirebaseUser {
    let uid: String
    let displayName: String?
    let email: String?
}

