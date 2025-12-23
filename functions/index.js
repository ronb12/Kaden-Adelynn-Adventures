const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Generate a custom Firebase token for Game Center authenticated users
 * 
 * This function receives a Game Center player ID and generates a custom token
 * that can be used to authenticate with Firebase Auth.
 * 
 * @param {string} playerID - Game Center player ID
 * @param {string} displayName - Game Center display name (optional)
 * @returns {Promise<string>} Custom Firebase token
 */
exports.generateGameCenterToken = functions.https.onCall(async (data, context) => {
  // Verify the request is authenticated (optional - can be removed for public access)
  // For Game Center, we'll allow unauthenticated calls since Game Center handles auth
  
  const { playerID, displayName } = data;
  
  // Validate input
  if (!playerID || typeof playerID !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'playerID is required and must be a string'
    );
  }
  
  // Create a custom UID based on Game Center player ID
  // This ensures the same Game Center user always gets the same Firebase UID
  const customUID = `gc_${playerID}`;
  
  // Custom claims (optional - add any user-specific data here)
  const customClaims = {
    provider: 'gamecenter',
    gameCenterPlayerID: playerID,
  };
  
  try {
    // Check if user already exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(customUID);
    } catch (error) {
      // User doesn't exist, create it
      if (error.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          uid: customUID,
          displayName: displayName || 'Game Center Player',
        });
      } else {
        throw error;
      }
    }
    
    // Update display name if provided and different
    if (displayName && userRecord.displayName !== displayName) {
      await admin.auth().updateUser(customUID, {
        displayName: displayName,
      });
    }
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(customUID, customClaims);
    
    // Generate custom token
    const customToken = await admin.auth().createCustomToken(customUID, customClaims);
    
    return {
      token: customToken,
      uid: customUID,
    };
  } catch (error) {
    console.error('Error generating Game Center token:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate custom token',
      error.message
    );
  }
});

