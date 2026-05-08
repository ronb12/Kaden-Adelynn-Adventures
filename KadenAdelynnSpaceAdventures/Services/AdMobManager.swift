//
//  AdMobManager.swift
//  KadenAdelynnSpaceAdventures
//
//  Opt-in rewarded ads for earning stars.
//

import Foundation
import GoogleMobileAds
import UIKit

final class AdMobManager: NSObject, ObservableObject {
    static let shared = AdMobManager()

    @Published private(set) var isSDKStarted = false
    @Published private(set) var isRewardedAdReady = false
    @Published private(set) var isLoadingRewardedAd = false
    @Published private(set) var lastMessage: String?

    private var rewardedAd: RewardedAd?
    private var rewardHandler: (() -> Void)?
    private var didStartSDK = false

    private let defaultRewardedAdUnitID = "ca-app-pub-3565666509316178/2602414196"

    var rewardedAdUnitID: String {
        Bundle.main.object(forInfoDictionaryKey: "AdMobRewardedAdUnitID") as? String ?? defaultRewardedAdUnitID
    }

    func configureAndStart() {
        guard !didStartSDK else { return }
        didStartSDK = true

        let configuration = MobileAds.shared.requestConfiguration
        configuration.maxAdContentRating = GADMaxAdContentRating.general
        configuration.tagForChildDirectedTreatment = NSNumber(value: true)
        configuration.tagForUnderAgeOfConsent = NSNumber(value: true)
        configuration.setPublisherFirstPartyIDEnabled(false)

        MobileAds.shared.start { [weak self] _ in
            DispatchQueue.main.async {
                self?.isSDKStarted = true
                self?.loadRewardedAd()
            }
        }
    }

    func loadRewardedAd() {
        guard isSDKStarted, !isLoadingRewardedAd else { return }

        isLoadingRewardedAd = true
        isRewardedAdReady = false
        lastMessage = nil

        RewardedAd.load(with: rewardedAdUnitID, request: makeKidSafeRequest()) { [weak self] ad, error in
            DispatchQueue.main.async {
                guard let self else { return }
                self.isLoadingRewardedAd = false

                if let error {
                    self.rewardedAd = nil
                    self.isRewardedAdReady = false
                    self.lastMessage = "Ad not ready: \(error.localizedDescription)"
                    return
                }

                self.rewardedAd = ad
                self.rewardedAd?.fullScreenContentDelegate = self
                self.isRewardedAdReady = true
            }
        }
    }

    func showRewardedAd(onReward: @escaping () -> Void) {
        guard let rewardedAd else {
            lastMessage = "Ad is still loading."
            loadRewardedAd()
            return
        }

        guard let viewController = UIApplication.shared.activeRootViewController else {
            lastMessage = "Unable to show ad right now."
            return
        }

        rewardHandler = onReward
        isRewardedAdReady = false

        rewardedAd.present(from: viewController) { [weak self] in
            DispatchQueue.main.async {
                self?.rewardHandler?()
                self?.rewardHandler = nil
            }
        }
    }

    private func makeKidSafeRequest() -> Request {
        let request = Request()
        request.keywords = [
            "family friendly",
            "kids",
            "space game"
        ]

        let extras = Extras()
        extras.additionalParameters = [
            "npa": "1",
            "max_ad_content_rating": "G"
        ]
        request.register(extras)

        return request
    }
}

extension AdMobManager: FullScreenContentDelegate {
    func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) {
        rewardedAd = nil
        loadRewardedAd()
    }

    func ad(_ ad: FullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
        rewardedAd = nil
        isRewardedAdReady = false
        lastMessage = "Ad failed to show: \(error.localizedDescription)"
        loadRewardedAd()
    }
}

private extension UIApplication {
    var activeRootViewController: UIViewController? {
        connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first { $0.isKeyWindow }?
            .rootViewController?
            .topMostPresentedViewController
    }
}

private extension UIViewController {
    var topMostPresentedViewController: UIViewController {
        presentedViewController?.topMostPresentedViewController ?? self
    }
}
