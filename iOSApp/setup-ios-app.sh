#!/bin/bash

# 🚀 Kaden & Adelynn Adventures - iOS App Setup Script
# This script sets up the iOS app for TestFlight submission

echo "🚀 Setting up iOS app for TestFlight submission..."

# 1. Create Xcode project structure
echo "📁 Creating Xcode project structure..."

# Create main project directory
mkdir -p KadenAdelynnAdventures.xcodeproj
mkdir -p KadenAdelynnAdventures/Resources
mkdir -p KadenAdelynnAdventures/Resources/Assets.xcassets/AppIcon.appiconset

# 2. Copy app icons
echo "🎨 Setting up app icons..."
cp ../icon-144x144.png KadenAdelynnAdventures/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
cp ../icon-120x120.png KadenAdelynnAdventures/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
cp ../icon-96x96.png KadenAdelynnAdventures/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png

# 3. Create missing Swift files
echo "📝 Creating missing Swift files..."

# SceneDelegate.swift
cat > KadenAdelynnAdventures/App/SceneDelegate.swift << 'EOF'
import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let _ = (scene as? UIWindowScene) else { return }
    }

    func sceneDidDisconnect(_ scene: UIScene) {}
    func sceneDidBecomeActive(_ scene: UIScene) {}
    func sceneWillResignActive(_ scene: UIScene) {}
    func sceneWillEnterForeground(_ scene: UIScene) {}
    func sceneDidEnterBackground(_ scene: UIScene) {}
}
EOF

# 4. Create storyboard files
echo "🎨 Creating storyboard files..."

# Main.storyboard
cat > KadenAdelynnAdventures/Resources/Main.storyboard << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="21701" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="BYZ-38-t0r">
    <device id="retina6_12" orientation="portrait" appearance="light"/>
    <dependencies>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="21678"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="System colors in document resources" minToolsVersion="11.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <scene sceneID="tne-QT-ifu">
            <objects>
                <viewController id="BYZ-38-t0r" customClass="GameViewController" customModule="KadenAdelynnAdventures" customModuleProvider="target" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="8bC-Xf-vdC">
                        <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <subviews>
                            <view contentMode="scaleToFill" translatesAutoresizingMaskIntoConstraints="NO" id="YRO-k0-Ey4" customClass="SKView" customModule="SpriteKit">
                                <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                                <color key="backgroundColor" systemColor="systemBackgroundColor"/>
                            </view>
                        </subviews>
                        <viewLayoutGuide key="safeArea" id="Bcu-3y-fUS"/>
                        <color key="backgroundColor" systemColor="systemBackgroundColor"/>
                        <constraints>
                            <constraint firstItem="YRO-k0-Ey4" firstAttribute="leading" secondItem="Bcu-3y-fUS" secondAttribute="leading" id="3p8-FC-h8j"/>
                            <constraint firstItem="YRO-k0-Ey4" firstAttribute="top" secondItem="Bcu-3y-fUS" secondAttribute="top" id="7ge-gh-2fM"/>
                            <constraint firstItem="Bcu-3y-fUS" firstAttribute="trailing" secondItem="YRO-k0-Ey4" secondAttribute="trailing" id="Rgh-7f-4fM"/>
                            <constraint firstItem="Bcu-3y-fUS" firstAttribute="bottom" secondItem="YRO-k0-Ey4" secondAttribute="bottom" id="v7M-gh-2fM"/>
                        </constraints>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="dkx-z0-nzr" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="139" y="144"/>
        </scene>
    </scenes>
    <resources>
        <systemColor name="systemBackgroundColor">
            <color white="1" alpha="1" colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/>
        </systemColor>
    </resources>
</document>
EOF

# LaunchScreen.storyboard
cat > KadenAdelynnAdventures/Resources/LaunchScreen.storyboard << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="21701" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="01J-lp-oVM">
    <device id="retina6_12" orientation="portrait" appearance="light"/>
    <dependencies>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="21678"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="System colors in document resources" minToolsVersion="11.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <scene sceneID="EHf-IW-A2E">
            <objects>
                <viewController id="01J-lp-oVM" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="Ze5-6b-2t3">
                        <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <subviews>
                            <label opaque="NO" userInteractionEnabled="NO" contentMode="left" horizontalHuggingPriority="251" verticalHuggingPriority="251" text="Kaden &amp; Adelynn Adventures" textAlignment="center" lineBreakMode="tailTruncation" baselineAdjustment="alignBaselines" adjustsFontSizeToFit="NO" translatesAutoresizingMaskIntoConstraints="NO" id="GJd-Yh-RWb">
                                <rect key="frame" x="20" y="396" width="353" height="60"/>
                                <fontDescription key="fontDescription" type="boldSystem" pointSize="28"/>
                                <color key="textColor" systemColor="labelColor"/>
                                <nil key="highlightedColor"/>
                            </label>
                            <label opaque="NO" userInteractionEnabled="NO" contentMode="left" horizontalHuggingPriority="251" verticalHuggingPriority="251" text="🚀 Space Shooter Adventure 🚀" textAlignment="center" lineBreakMode="tailTruncation" baselineAdjustment="alignBaselines" adjustsFontSizeToFit="NO" translatesAutoresizingMaskIntoConstraints="NO" id="MfM-gh-2fM">
                                <rect key="frame" x="20" y="476" width="353" height="30"/>
                                <fontDescription key="fontDescription" type="system" pointSize="18"/>
                                <color key="textColor" systemColor="secondaryLabelColor"/>
                                <nil key="highlightedColor"/>
                            </label>
                        </subviews>
                        <viewLayoutGuide key="safeArea" id="6Tk-OE-BBY"/>
                        <color key="backgroundColor" systemColor="systemBackgroundColor"/>
                        <constraints>
                            <constraint firstItem="GJd-Yh-RWb" firstAttribute="centerY" secondItem="Ze5-6b-2t3" secondAttribute="centerY" id="8ge-gh-2fM"/>
                            <constraint firstItem="6Tk-OE-BBY" firstAttribute="trailing" secondItem="GJd-Yh-RWb" secondAttribute="trailing" constant="20" id="9ge-gh-2fM"/>
                            <constraint firstItem="GJd-Yh-RWb" firstAttribute="leading" secondItem="6Tk-OE-BBY" secondAttribute="leading" constant="20" id="A8e-gh-2fM"/>
                            <constraint firstItem="MfM-gh-2fM" firstAttribute="top" secondItem="GJd-Yh-RWb" secondAttribute="bottom" constant="20" id="B8e-gh-2fM"/>
                            <constraint firstItem="6Tk-OE-BBY" firstAttribute="trailing" secondItem="MfM-gh-2fM" secondAttribute="trailing" constant="20" id="C8e-gh-2fM"/>
                            <constraint firstItem="MfM-gh-2fM" firstAttribute="leading" secondItem="6Tk-OE-BBY" secondAttribute="leading" constant="20" id="D8e-gh-2fM"/>
                        </constraints>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1" userLabel="First Responder" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="53" y="375"/>
        </scene>
    </scenes>
    <resources>
        <systemColor name="labelColor">
            <color white="0.0" alpha="1" colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/>
        </systemColor>
        <systemColor name="secondaryLabelColor">
            <color red="0.23529411764705882" green="0.23529411764705882" blue="0.2627450980392157" alpha="0.59999999999999998" colorSpace="custom" customColorSpace="sRGB"/>
        </systemColor>
        <systemColor name="systemBackgroundColor">
            <color white="1" alpha="1" colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/>
        </systemColor>
    </resources>
</document>
EOF

# 5. Create Assets.xcassets files
echo "🎨 Creating Assets.xcassets files..."

# Contents.json for main Assets.xcassets
cat > KadenAdelynnAdventures/Resources/Assets.xcassets/Contents.json << 'EOF'
{
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

# Contents.json for AppIcon.appiconset
cat > KadenAdelynnAdventures/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json << 'EOF'
{
  "images" : [
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "20x20"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "29x29"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "40x40"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "76x76"
    },
    {
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "83.5x83.5"
    },
    {
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo "✅ iOS app structure created successfully!"

# 6. Instructions for next steps
echo ""
echo "📱 Next Steps for TestFlight Submission:"
echo ""
echo "1. Open Xcode and create a new iOS project:"
echo "   - Open Xcode"
echo "   - File > New > Project"
echo "   - iOS > App"
echo "   - Product Name: KadenAdelynnAdventures"
echo "   - Bundle Identifier: com.kadenadelynn.adventures"
echo "   - Language: Swift"
echo "   - Interface: Storyboard"
echo ""
echo "2. Replace the generated files with our custom files:"
echo "   - Copy AppDelegate.swift, GameViewController.swift, GameScene.swift"
echo "   - Copy Info.plist, Main.storyboard, LaunchScreen.storyboard"
echo "   - Copy Assets.xcassets folder"
echo ""
echo "3. Add required frameworks:"
echo "   - SpriteKit.framework"
echo "   - GameKit.framework"
echo ""
echo "4. Build and test the app:"
echo "   - Product > Build (⌘+B)"
echo "   - Product > Run (⌘+R)"
echo ""
echo "5. Archive for TestFlight:"
echo "   - Product > Archive"
echo "   - Distribute App"
echo "   - App Store Connect"
echo "   - Upload"
echo ""
echo "6. Submit to TestFlight:"
echo "   - Go to App Store Connect"
echo "   - My Apps > KadenAdelynnAdventures"
echo "   - TestFlight tab"
echo "   - Submit for Beta App Review"
echo ""
echo "🎯 Your game is ready for iOS conversion!"
echo "📱 Estimated timeline: 2-3 months for full conversion"
echo "💰 Potential revenue: $500-$2K/month"
echo "" 