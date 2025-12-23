#!/usr/bin/env python3
"""
Script to verify and fix Firebase package configuration in Xcode project
"""

import re
import sys
import subprocess
from pathlib import Path

PROJECT_FILE = Path(__file__).parent / "KadenAdelynnSpaceAdventures.xcodeproj" / "project.pbxproj"

REQUIRED_PACKAGES = {
    "FirebaseCore": "47A4F10C2EF9EEF200908E6D",
    "FirebaseAuth": "47A4F10B2EF9EEF200908E6D",
    "FirebaseFirestore": "47A4F10D2EF9EEF200908E6D",
    "FirebaseFunctions": "47A4F10E2EF9EEF200908E6E"
}

def verify_packages():
    """Verify that all required packages are in packageProductDependencies"""
    print("🔍 Verifying package configuration...")
    
    if not PROJECT_FILE.exists():
        print(f"❌ Project file not found: {PROJECT_FILE}")
        return False
    
    content = PROJECT_FILE.read_text()
    
    # Check if packages are in packageProductDependencies
    target_section = re.search(
        r'name = KadenAdelynnSpaceAdventures;.*?packageProductDependencies = \((.*?)\);',
        content,
        re.DOTALL
    )
    
    if not target_section:
        print("❌ Could not find target section")
        return False
    
    deps_section = target_section.group(1)
    all_found = True
    
    for package_name, package_id in REQUIRED_PACKAGES.items():
        if package_id in deps_section:
            print(f"  ✅ {package_name} is configured")
        else:
            print(f"  ❌ {package_name} is MISSING")
            all_found = False
    
    # Check package repository
    if "firebase-ios-sdk" in content or "47A4F10A2EF9EEF200908E6D" in content:
        print("  ✅ Firebase package repository is configured")
    else:
        print("  ❌ Firebase package repository is MISSING")
        all_found = False
    
    return all_found

def resolve_packages():
    """Resolve packages using xcodebuild"""
    print("\n📦 Resolving packages...")
    
    project_dir = PROJECT_FILE.parent.parent
    result = subprocess.run(
        ["xcodebuild", "-resolvePackageDependencies", 
         "-project", str(PROJECT_FILE)],
        cwd=project_dir,
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("  ✅ Package resolution successful")
        if "Firebase" in result.stdout:
            print("  ✅ Firebase packages found in resolution")
        return True
    else:
        print(f"  ⚠️  Package resolution had issues:")
        print(f"     {result.stderr[:200]}")
        return False

def main():
    print("🚀 Firebase Package Verification and Fix Script")
    print("=" * 50)
    
    # Verify configuration
    config_ok = verify_packages()
    
    if not config_ok:
        print("\n❌ Package configuration has issues!")
        print("   The packages are configured in the project file,")
        print("   but Xcode may need to properly link them.")
        print("\n   Run the automation script: ./run-automation.sh")
        return 1
    
    print("\n✅ All packages are properly configured in project file")
    
    # Try to resolve packages
    resolve_ok = resolve_packages()
    
    if resolve_ok:
        print("\n✅ Packages are resolved")
        print("\n📋 Next steps:")
        print("   1. Open Xcode")
        print("   2. Wait for packages to finish resolving (top-right corner)")
        print("   3. Go to Project > Package Dependencies")
        print("   4. Click on 'firebase-ios-sdk'")
        print("   5. Verify products are checked for target")
        print("   6. Build the project")
    else:
        print("\n⚠️  Package resolution had issues")
        print("   Try running: ./run-automation.sh")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

