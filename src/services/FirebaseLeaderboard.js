/**
 * Firebase Leaderboard Service
 * Handles global leaderboards, player stats, and online features
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, query, orderByChild, limitToLast, push, update, onValue } from 'firebase/database';

// Firebase configuration (from your existing firebase project)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE", // User needs to add their Firebase config
  authDomain: "kaden---adelynn-adventures.firebaseapp.com",
  databaseURL: "https://kaden---adelynn-adventures-default-rtdb.firebaseio.com",
  projectId: "kaden---adelynn-adventures",
  storageBucket: "kaden---adelynn-adventures.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app, database;
try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.warn('Firebase not configured. Leaderboards will work in offline mode.');
  database = null;
}

/**
 * Leaderboard Service
 */
class LeaderboardService {
  constructor() {
    this.database = database;
    this.playerId = this.getOrCreatePlayerId();
    this.playerName = localStorage.getItem('playerName') || 'Anonymous';
    this.listeners = {};
  }

  /**
   * Get or create a unique player ID
   */
  getOrCreatePlayerId() {
    let playerId = localStorage.getItem('playerId');
    if (!playerId) {
      playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('playerId', playerId);
    }
    return playerId;
  }

  /**
   * Set player name
   */
  setPlayerName(name) {
    this.playerName = name;
    localStorage.setItem('playerName', name);
  }

  /**
   * Submit score to leaderboard
   */
  async submitScore(score, gameMode = 'endless', metadata = {}) {
    if (!this.database) {
      console.log('Firebase offline - score saved locally only');
      this.saveLocalScore(score, gameMode, metadata);
      return false;
    }

    try {
      const scoreData = {
        playerId: this.playerId,
        playerName: this.playerName,
        score: score,
        gameMode: gameMode,
        timestamp: Date.now(),
        ship: metadata.ship || 'phoenixWing',
        level: metadata.level || 1,
        kills: metadata.kills || 0,
        accuracy: metadata.accuracy || 0,
        survived: metadata.survived || 0
      };

      // Submit to global leaderboard
      const leaderboardRef = ref(this.database, `leaderboards/${gameMode}`);
      const newScoreRef = push(leaderboardRef);
      await set(newScoreRef, scoreData);

      // Update player's personal best
      const playerRef = ref(this.database, `players/${this.playerId}/scores/${gameMode}`);
      const snapshot = await get(playerRef);
      
      if (!snapshot.exists() || snapshot.val().score < score) {
        await set(playerRef, scoreData);
      }

      // Save locally as well
      this.saveLocalScore(score, gameMode, metadata);

      return true;
    } catch (error) {
      console.error('Error submitting score:', error);
      this.saveLocalScore(score, gameMode, metadata);
      return false;
    }
  }

  /**
   * Save score locally (fallback)
   */
  saveLocalScore(score, gameMode, metadata) {
    const localScores = JSON.parse(localStorage.getItem('localScores') || '{}');
    if (!localScores[gameMode]) {
      localScores[gameMode] = [];
    }

    localScores[gameMode].push({
      score,
      timestamp: Date.now(),
      ...metadata
    });

    // Keep only top 100 local scores
    localScores[gameMode] = localScores[gameMode]
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);

    localStorage.setItem('localScores', JSON.stringify(localScores));
  }

  /**
   * Get top scores from leaderboard
   */
  async getTopScores(gameMode = 'endless', limit = 100) {
    if (!this.database) {
      return this.getLocalTopScores(gameMode, limit);
    }

    try {
      const leaderboardRef = ref(this.database, `leaderboards/${gameMode}`);
      const topScoresQuery = query(
        leaderboardRef,
        orderByChild('score'),
        limitToLast(limit)
      );

      const snapshot = await get(topScoresQuery);
      
      if (!snapshot.exists()) {
        return this.getLocalTopScores(gameMode, limit);
      }

      const scores = [];
      snapshot.forEach((childSnapshot) => {
        scores.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      // Sort by score descending
      return scores.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return this.getLocalTopScores(gameMode, limit);
    }
  }

  /**
   * Get local top scores (fallback)
   */
  getLocalTopScores(gameMode, limit = 100) {
    const localScores = JSON.parse(localStorage.getItem('localScores') || '{}');
    return (localScores[gameMode] || []).slice(0, limit);
  }

  /**
   * Get player rank
   */
  async getPlayerRank(gameMode = 'endless') {
    const topScores = await this.getTopScores(gameMode, 1000);
    const playerIndex = topScores.findIndex(s => s.playerId === this.playerId);
    return playerIndex >= 0 ? playerIndex + 1 : null;
  }

  /**
   * Get player stats
   */
  async getPlayerStats() {
    if (!this.database) {
      return this.getLocalPlayerStats();
    }

    try {
      const playerRef = ref(this.database, `players/${this.playerId}`);
      const snapshot = await get(playerRef);
      
      if (!snapshot.exists()) {
        return this.getLocalPlayerStats();
      }

      return snapshot.val();
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return this.getLocalPlayerStats();
    }
  }

  /**
   * Get local player stats
   */
  getLocalPlayerStats() {
    return {
      playerId: this.playerId,
      playerName: this.playerName,
      totalGamesPlayed: parseInt(localStorage.getItem('totalGamesPlayed') || '0'),
      totalKills: parseInt(localStorage.getItem('totalKills') || '0'),
      highestScore: parseInt(localStorage.getItem('highScore') || '0'),
      totalPlayTime: parseInt(localStorage.getItem('totalPlayTime') || '0')
    };
  }

  /**
   * Update player stats
   */
  async updatePlayerStats(stats) {
    // Update local storage
    Object.keys(stats).forEach(key => {
      localStorage.setItem(key, stats[key].toString());
    });

    if (!this.database) {
      return;
    }

    try {
      const playerRef = ref(this.database, `players/${this.playerId}/stats`);
      await update(playerRef, {
        ...stats,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Error updating player stats:', error);
    }
  }

  /**
   * Listen to leaderboard updates in real-time
   */
  subscribeToLeaderboard(gameMode, callback, limit = 10) {
    if (!this.database) {
      callback(this.getLocalTopScores(gameMode, limit));
      return () => {};
    }

    const leaderboardRef = ref(this.database, `leaderboards/${gameMode}`);
    const topScoresQuery = query(
      leaderboardRef,
      orderByChild('score'),
      limitToLast(limit)
    );

    const listenerId = `leaderboard_${gameMode}`;
    this.listeners[listenerId] = onValue(topScoresQuery, (snapshot) => {
      const scores = [];
      snapshot.forEach((childSnapshot) => {
        scores.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(scores.sort((a, b) => b.score - a.score));
    });

    // Return unsubscribe function
    return () => {
      if (this.listeners[listenerId]) {
        this.listeners[listenerId]();
        delete this.listeners[listenerId];
      }
    };
  }

  /**
   * Weekly tournament system
   */
  async submitTournamentScore(score, metadata = {}) {
    const currentWeek = this.getCurrentWeek();
    return this.submitScore(score, `tournament_week_${currentWeek}`, metadata);
  }

  async getTournamentLeaderboard(weekOffset = 0) {
    const currentWeek = this.getCurrentWeek() + weekOffset;
    return this.getTopScores(`tournament_week_${currentWeek}`, 100);
  }

  getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil(days / 7);
  }

  /**
   * Friend challenges
   */
  async challengeFriend(friendId, challengeData) {
    if (!this.database) {
      console.log('Firebase offline - cannot send challenge');
      return false;
    }

    try {
      const challengeRef = ref(this.database, `challenges/${friendId}`);
      await push(challengeRef, {
        from: this.playerId,
        fromName: this.playerName,
        ...challengeData,
        timestamp: Date.now(),
        status: 'pending'
      });
      return true;
    } catch (error) {
      console.error('Error sending challenge:', error);
      return false;
    }
  }

  async getChallenges() {
    if (!this.database) {
      return [];
    }

    try {
      const challengesRef = ref(this.database, `challenges/${this.playerId}`);
      const snapshot = await get(challengesRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const challenges = [];
      snapshot.forEach((childSnapshot) => {
        challenges.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      return challenges.filter(c => c.status === 'pending');
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
  }
}

// Export singleton instance
export const leaderboardService = new LeaderboardService();

export default LeaderboardService;

