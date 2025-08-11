// Firebase configuration and integration
const firebaseConfig = {
    apiKey: "AIzaSyC1b-JWvBRGti5LFKk7LqSS8p1QFbP_D88",
    authDomain: "kaden---adelynn-adventures.firebaseapp.com",
    projectId: "kaden---adelynn-adventures",
    storageBucket: "kaden---adelynn-adventures.firebasestorage.app",
    messagingSenderId: "265116401918",
    appId: "1:265116401918:web:e1511695b92aeb05e0e5af",
    measurementId: "G-W4Q02R318L"
};

// Initialize Firebase
let app, analytics, db;
try {
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        analytics = firebase.analytics();
        db = firebase.firestore();
        console.log('✅ Firebase initialized successfully');
    } else {
        console.log('⚠️ Firebase SDK not loaded');
    }
} catch (error) {
    console.log('⚠️ Firebase initialization error:', error);
    // Continue without Firebase
}

// Firebase utility functions
const firebaseUtils = {
    // Check if Firebase is available
    isAvailable() {
        return !!(db && analytics);
    },
    
    // Save game data
    async saveGameData(gameData) {
        if (!this.isAvailable()) {
            console.log('⚠️ Firebase not available, skipping save');
            return;
        }
        
        try {
            await db.collection('gameData').add({
                ...gameData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Game data saved to Firebase');
        } catch (error) {
            console.error('❌ Error saving game data:', error);
        }
    },
    
    // Load high scores
    async loadHighScores() {
        if (!this.isAvailable()) {
            console.log('⚠️ Firebase not available, returning empty scores');
            return [];
        }
        
        try {
            const snapshot = await db.collection('highScores')
                .orderBy('score', 'desc')
                .limit(10)
                .get();
            
            const highScores = [];
            snapshot.forEach(doc => {
                highScores.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ Loaded ${highScores.length} high scores from Firebase`);
            return highScores;
        } catch (error) {
            console.error('❌ Error loading high scores:', error);
            return [];
        }
    },
    
    // Save high score
    async saveHighScore(scoreData) {
        if (!this.isAvailable()) {
            console.log('⚠️ Firebase not available, skipping score save');
            return;
        }
        
        try {
            const docRef = await db.collection('highScores').add({
                ...scoreData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ High score saved to Firebase with ID:', docRef.id);
        } catch (error) {
            console.error('❌ Error saving high score:', error);
        }
    },
    
    // Track game event
    trackEvent(eventName, eventData = {}) {
        if (!this.isAvailable()) {
            console.log('⚠️ Firebase not available, skipping event tracking');
            return;
        }
        
        try {
            analytics.logEvent(eventName, eventData);
            console.log('✅ Event tracked:', eventName, eventData);
        } catch (error) {
            console.error('❌ Error tracking event:', error);
        }
    }
};

// Export for use in other modules
window.firebaseUtils = firebaseUtils;
