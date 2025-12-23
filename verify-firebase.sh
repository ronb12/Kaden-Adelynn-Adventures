#!/bin/bash
# Firebase Verification Script
# Run this after: firebase login

echo "🔥 Firebase Setup Verification"
echo "================================"
echo ""

# Check if logged in
echo "1. Checking Firebase authentication..."
if firebase login:list 2>/dev/null | grep -q "@"; then
    echo "   ✅ Logged in to Firebase"
    firebase login:list
else
    echo "   ❌ Not logged in"
    echo "   Run: firebase login"
    exit 1
fi

echo ""
echo "2. Setting Firebase project..."
firebase use kaden---adelynn-adventures 2>/dev/null || firebase use --add kaden---adelynn-adventures default

echo ""
echo "3. Checking Firestore Database..."
if firebase firestore:databases:list 2>/dev/null | grep -q "DATABASE_ID"; then
    echo "   ✅ Firestore is enabled"
    firebase firestore:databases:list
else
    echo "   ⚠️  Firestore status unclear or not enabled"
fi

echo ""
echo "4. Checking Firestore Security Rules..."
if firebase firestore:rules:get 2>/dev/null > /tmp/firestore-rules.txt; then
    echo "   ✅ Rules retrieved"
    echo "   Rules preview:"
    head -20 /tmp/firestore-rules.txt
    echo ""
    if grep -q "highScores" /tmp/firestore-rules.txt; then
        echo "   ✅ highScores collection found in rules"
    else
        echo "   ⚠️  highScores collection not in rules"
    fi
else
    echo "   ⚠️  Could not retrieve rules"
fi

echo ""
echo "5. Checking registered apps..."
firebase apps:list 2>/dev/null || echo "   ⚠️  Could not list apps"

echo ""
echo "6. Checking iOS apps specifically..."
if firebase apps:list --platform ios 2>/dev/null | grep -q "APP_ID"; then
    echo "   ✅ iOS app is registered"
    firebase apps:list --platform ios
else
    echo "   ⚠️  No iOS app found (may need to register)"
fi

echo ""
echo "7. Project information..."
firebase projects:get kaden---adelynn-adventures 2>/dev/null || echo "   ⚠️  Could not get project info"

echo ""
echo "================================"
echo "Verification complete!"
echo ""
echo "Next steps:"
echo "1. If iOS app not registered, register it in Firebase Console"
echo "2. Download GoogleService-Info.plist"
echo "3. Add Firebase iOS SDK to Xcode"
echo "4. Uncomment Firebase code in FirebaseService.swift"

