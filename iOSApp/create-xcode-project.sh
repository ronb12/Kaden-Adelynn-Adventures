#!/bin/bash

echo "🚀 Creating Xcode project for TestFlight submission..."

# Create Xcode project using command line
PROJECT_NAME="KadenAdelynnAdventures"
BUNDLE_ID="com.kadenadelynn.adventures"

# Create project directory
mkdir -p $PROJECT_NAME.xcodeproj
mkdir -p $PROJECT_NAME/$PROJECT_NAME

# Copy our Swift files to the project
cp KadenAdelynnAdventures/App/*.swift $PROJECT_NAME/$PROJECT_NAME/
cp KadenAdelynnAdventures/Game/*.swift $PROJECT_NAME/$PROJECT_NAME/
cp KadenAdelynnAdventures/Info.plist $PROJECT_NAME/$PROJECT_NAME/
cp -r KadenAdelynnAdventures/Resources $PROJECT_NAME/$PROJECT_NAME/

# Create project.pbxproj file
cat > $PROJECT_NAME.xcodeproj/project.pbxproj << 'EOF'
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {

/* Begin PBXBuildFile section */
		A1234567890123456789012A /* AppDelegate.swift in Sources */ = {isa = PBXBuildFile; fileRef = A1234567890123456789012B /* AppDelegate.swift */; };
		A1234567890123456789012C /* SceneDelegate.swift in Sources */ = {isa = PBXBuildFile; fileRef = A1234567890123456789012D /* SceneDelegate.swift */; };
		A1234567890123456789012E /* GameViewController.swift in Sources */ = {isa = PBXBuildFile; fileRef = A1234567890123456789012F /* GameViewController.swift */; };
		A1234567890123456789013A /* GameScene.swift in Sources */ = {isa = PBXBuildFile; fileRef = A1234567890123456789013B /* GameScene.swift */; };
		A1234567890123456789015C /* Main.storyboard in Resources */ = {isa = PBXBuildFile; fileRef = A1234567890123456789015D /* Main.storyboard */; };
		A1234567890123456789015E /* Assets.xcassets in Resources */ = {isa = PBXBuildFile; fileRef = A1234567890123456789015F /* Assets.xcassets */; };
		A1234567890123456789016A /* LaunchScreen.storyboard in Resources */ = {isa = PBXBuildFile; fileRef = A1234567890123456789016B /* LaunchScreen.storyboard */; };
		A1234567890123456789016E /* GameKit.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = A1234567890123456789016F /* GameKit.framework */; };
		A1234567890123456789017A /* SpriteKit.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = A1234567890123456789017B /* SpriteKit.framework */; };
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		A1234567890123456789012A /* KadenAdelynnAdventures.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = KadenAdelynnAdventures.app; sourceTree = BUILT_PRODUCTS_DIR; };
		A1234567890123456789012B /* AppDelegate.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = AppDelegate.swift; sourceTree = "<group>"; };
		A1234567890123456789012D /* SceneDelegate.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = SceneDelegate.swift; sourceTree = "<group>"; };
		A1234567890123456789012F /* GameViewController.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = GameViewController.swift; sourceTree = "<group>"; };
		A1234567890123456789013B /* GameScene.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = GameScene.swift; sourceTree = "<group>"; };
		A1234567890123456789015D /* Main.storyboard */ = {isa = PBXFileReference; lastKnownFileType = file.storyboard; path = Main.storyboard; sourceTree = "<group>"; };
		A1234567890123456789015F /* Assets.xcassets */ = {isa = PBXFileReference; lastKnownFileType = folder.assetcatalog; path = Assets.xcassets; sourceTree = "<group>"; };
		A1234567890123456789016B /* LaunchScreen.storyboard */ = {isa = PBXFileReference; lastKnownFileType = file.storyboard; path = LaunchScreen.storyboard; sourceTree = "<group>"; };
		A1234567890123456789016F /* GameKit.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = GameKit.framework; path = System/Library/Frameworks/GameKit.framework; sourceTree = SDKROOT; };
		A1234567890123456789017B /* SpriteKit.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = SpriteKit.framework; path = System/Library/Frameworks/SpriteKit.framework; sourceTree = SDKROOT; };
		A1234567890123456789017C /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		A1234567890123456789018A /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
				A1234567890123456789016E /* GameKit.framework in Frameworks */,
				A1234567890123456789017A /* SpriteKit.framework in Frameworks */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		A1234567890123456789019A = {
			isa = PBXGroup;
			children = (
				A1234567890123456789019B /* KadenAdelynnAdventures */,
				A1234567890123456789019C /* Products */,
				A1234567890123456789019D /* Frameworks */,
			);
			sourceTree = "<group>";
		};
		A1234567890123456789019B /* KadenAdelynnAdventures */ = {
			isa = PBXGroup;
			children = (
				A1234567890123456789019E /* App */,
				A1234567890123456789019F /* Game */,
				A123456789012345678901A0 /* Resources */,
				A1234567890123456789017C /* Info.plist */,
			);
			path = KadenAdelynnAdventures;
			sourceTree = "<group>";
		};
		A1234567890123456789019E /* App */ = {
			isa = PBXGroup;
			children = (
				A1234567890123456789012B /* AppDelegate.swift */,
				A1234567890123456789012D /* SceneDelegate.swift */,
				A1234567890123456789012F /* GameViewController.swift */,
			);
			path = App;
			sourceTree = "<group>";
		};
		A1234567890123456789019F /* Game */ = {
			isa = PBXGroup;
			children = (
				A1234567890123456789013B /* GameScene.swift */,
			);
			path = Game;
			sourceTree = "<group>";
		};
		A123456789012345678901A0 /* Resources */ = {
			isa = PBXGroup;
			children = (
				A1234567890123456789015D /* Main.storyboard */,
				A1234567890123456789015F /* Assets.xcassets */,
				A1234567890123456789016B /* LaunchScreen.storyboard */,
			);
			path = Resources;
			sourceTree = "<group>";
		};
		A1234567890123456789019C /* Products */ = {
			isa = PBXGroup;
			children = (
				A1234567890123456789012A /* KadenAdelynnAdventures.app */,
			);
			name = Products;
			sourceTree = "<group>";
		};
		A1234567890123456789019D /* Frameworks */ = {
			isa = PBXGroup;
			children = (
				A1234567890123456789016F /* GameKit.framework */,
				A1234567890123456789017B /* SpriteKit.framework */,
			);
			name = Frameworks;
			sourceTree = "<group>";
		};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		A123456789012345678901A1 /* KadenAdelynnAdventures */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = A123456789012345678901A2 /* Build configuration list for PBXNativeTarget "KadenAdelynnAdventures" */;
			buildPhases = (
				A123456789012345678901A3 /* Sources */,
				A1234567890123456789018A /* Frameworks */,
				A123456789012345678901A4 /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = KadenAdelynnAdventures;
			productName = KadenAdelynnAdventures;
			productReference = A1234567890123456789012A /* KadenAdelynnAdventures.app */;
			productType = "com.apple.product-type.application";
		};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		A123456789012345678901A5 /* Project object */ = {
			isa = PBXProject;
			attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 1500;
				LastUpgradeCheck = 1500;
				TargetAttributes = {
					A123456789012345678901A1 = {
						CreatedOnToolsVersion = 15.0;
					};
				};
			};
			buildConfigurationList = A123456789012345678901A6 /* Build configuration list for PBXProject "KadenAdelynnAdventures" */;
			compatibilityVersion = "Xcode 14.0";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
				Base,
			);
			mainGroup = A1234567890123456789019A;
			productRefGroup = A1234567890123456789019C /* Products */;
			projectDirPath = "";
			projectRoot = "";
			targets = (
				A123456789012345678901A1 /* KadenAdelynnAdventures */,
			);
		};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		A123456789012345678901A4 /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				A1234567890123456789016A /* LaunchScreen.storyboard in Resources */,
				A1234567890123456789015C /* Main.storyboard in Resources */,
				A1234567890123456789015E /* Assets.xcassets in Resources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
		A123456789012345678901A3 /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				A1234567890123456789012C /* SceneDelegate.swift in Sources */,
				A1234567890123456789012E /* GameViewController.swift in Sources */,
				A1234567890123456789013A /* GameScene.swift in Sources */,
				A1234567890123456789012A /* AppDelegate.swift in Sources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
		A123456789012345678901A7 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_ENABLE_OBJC_WEAK = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_COMMA = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = dwarf;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_TESTABILITY = YES;
				ENABLE_USER_SCRIPT_SANDBOXING = YES;
				GCC_C_LANGUAGE_STANDARD = gnu17;
				GCC_DYNAMIC_NO_PIC = NO;
				GCC_NO_COMMON_FIELDS = YES;
				GCC_OPTIMIZATION_LEVEL = 0;
				GCC_PREPROCESSOR_DEFINITIONS = (
					"DEBUG=1",
					"$(inherited)",
				);
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 17.0;
				LOCALIZATION_PREFERS_STRING_CATALOGS = YES;
				MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;
				MTL_FAST_MATH = YES;
				ONLY_ACTIVE_ARCH = YES;
				SDKROOT = iphoneos;
				SWIFT_ACTIVE_COMPILATION_CONDITIONS = "DEBUG $(inherited)";
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
			};
			name = Debug;
		};
		A123456789012345678901A8 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_ENABLE_OBJC_WEAK = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_COMMA = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
				ENABLE_NS_ASSERTIONS = NO;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_USER_SCRIPT_SANDBOXING = YES;
				GCC_C_LANGUAGE_STANDARD = gnu17;
				GCC_NO_COMMON_FIELDS = YES;
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 17.0;
				LOCALIZATION_PREFERS_STRING_CATALOGS = YES;
				MTL_ENABLE_DEBUG_INFO = NO;
				MTL_FAST_MATH = YES;
				SDKROOT = iphoneos;
				SWIFT_COMPILATION_MODE = wholemodule;
				VALIDATE_PRODUCT = YES;
			};
			name = Release;
		};
		A123456789012345678901A9 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				DEVELOPMENT_TEAM = "";
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_FILE = KadenAdelynnAdventures/Info.plist;
				INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;
				INFOPLIST_KEY_UILaunchStoryboardName = LaunchScreen;
				INFOPLIST_KEY_UIMainStoryboardFile = Main;
				INFOPLIST_KEY_UISupportedInterfaceOrientations = UIInterfaceOrientationPortrait;
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone = "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.kadenadelynn.adventures;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
		A123456789012345678901AA /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				DEVELOPMENT_TEAM = "";
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_FILE = KadenAdelynnAdventures/Info.plist;
				INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;
				INFOPLIST_KEY_UILaunchStoryboardName = LaunchScreen;
				INFOPLIST_KEY_UIMainStoryboardFile = Main;
				INFOPLIST_KEY_UISupportedInterfaceOrientations = UIInterfaceOrientationPortrait;
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone = "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.kadenadelynn.adventures;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Release;
		};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		A123456789012345678901A2 /* Build configuration list for PBXNativeTarget "KadenAdelynnAdventures" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				A123456789012345678901A9 /* Debug */,
				A123456789012345678901AA /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		A123456789012345678901A6 /* Build configuration list for PBXProject "KadenAdelynnAdventures" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				A123456789012345678901A7 /* Debug */,
				A123456789012345678901A8 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
/* End XCConfigurationList section */
	};
	rootObject = A123456789012345678901A5 /* Project object */;
}
EOF

echo "✅ Xcode project created successfully!"
echo ""
echo "📱 Next Steps:"
echo "1. Open KadenAdelynnAdventures.xcodeproj in Xcode"
echo "2. Add your Apple Developer Team ID"
echo "3. Build and test the app"
echo "4. Archive for TestFlight submission"
echo ""
echo "🚀 Ready for TestFlight submission!" 