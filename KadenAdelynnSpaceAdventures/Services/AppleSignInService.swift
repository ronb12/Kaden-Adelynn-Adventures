//
//  AppleSignInService.swift
//  KadenAdelynnSpaceAdventures
//
//  Sign in with Apple service
//

import Foundation
import AuthenticationServices
import Combine

class AppleSignInService: NSObject, ObservableObject {
    @Published var isSignedIn: Bool = false
    @Published var userIdentifier: String?
    @Published var userEmail: String?
    @Published var userName: String?
    
    private let userDefaults = UserDefaults.standard
    private let userIdentifierKey = "appleSignInUserIdentifier"
    private let userEmailKey = "appleSignInUserEmail"
    private let userNameKey = "appleSignInUserName"
    
    override init() {
        super.init()
        loadSavedUser()
    }
    
    func loadSavedUser() {
        if let identifier = userDefaults.string(forKey: userIdentifierKey) {
            userIdentifier = identifier
            userEmail = userDefaults.string(forKey: userEmailKey)
            userName = userDefaults.string(forKey: userNameKey)
            isSignedIn = true
        }
    }
    
    func signIn() {
        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]
        
        let authorizationController = ASAuthorizationController(authorizationRequests: [request])
        authorizationController.delegate = self
        authorizationController.presentationContextProvider = self
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let _ = windowScene.windows.first {
            authorizationController.presentationContextProvider = self
        }
        
        authorizationController.performRequests()
    }
    
    func signOut() {
        userIdentifier = nil
        userEmail = nil
        userName = nil
        isSignedIn = false
        
        userDefaults.removeObject(forKey: userIdentifierKey)
        userDefaults.removeObject(forKey: userEmailKey)
        userDefaults.removeObject(forKey: userNameKey)
    }
    
    func checkAuthorizationStatus() {
        guard let userIdentifier = userIdentifier else {
            isSignedIn = false
            return
        }
        
        let provider = ASAuthorizationAppleIDProvider()
        provider.getCredentialState(forUserID: userIdentifier) { [weak self] state, error in
            DispatchQueue.main.async {
                switch state {
                case .authorized:
                    self?.isSignedIn = true
                case .revoked, .notFound:
                    self?.isSignedIn = false
                    self?.signOut()
                default:
                    break
                }
            }
        }
    }
}

extension AppleSignInService: ASAuthorizationControllerDelegate {
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
            let userIdentifier = appleIDCredential.user
            let email = appleIDCredential.email
            let fullName = appleIDCredential.fullName
            
            // Save user identifier
            self.userIdentifier = userIdentifier
            userDefaults.set(userIdentifier, forKey: userIdentifierKey)
            
            // Save email if provided (only on first sign in)
            if let email = email {
                self.userEmail = email
                userDefaults.set(email, forKey: userEmailKey)
            } else {
                // Load saved email if available
                self.userEmail = userDefaults.string(forKey: userEmailKey)
            }
            
            // Save name if provided (only on first sign in)
            if let fullName = fullName {
                let name = PersonNameComponentsFormatter().string(from: fullName)
                self.userName = name
                userDefaults.set(name, forKey: userNameKey)
            } else {
                // Load saved name if available
                self.userName = userDefaults.string(forKey: userNameKey)
            }
            
            isSignedIn = true
            
            // Notify that sign in completed
            NotificationCenter.default.post(name: NSNotification.Name("AppleSignInCompleted"), object: nil)
        }
    }
    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        print("Apple Sign In error: \(error.localizedDescription)")
    }
}

extension AppleSignInService: ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        // Return the key window for presentation
        if let window = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .flatMap({ $0.windows })
            .first(where: { $0.isKeyWindow }) {
            return window
        }
        // Fallback to a new UIWindow if no key window is found
        return UIWindow()
    }
}
