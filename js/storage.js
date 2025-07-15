class StorageManager {
    constructor() {}
    
    saveProgress(level, score, unlocks) {
        localStorage.setItem('level', level);
        localStorage.setItem('score', score);
        localStorage.setItem('unlocks', JSON.stringify(unlocks));
    }
    
    loadProgress() {
        return {
            level: parseInt(localStorage.getItem('level') || '1'),
            score: parseInt(localStorage.getItem('score') || '0'),
            unlocks: JSON.parse(localStorage.getItem('unlocks') || '[]')
        };
    }
    
    saveHighScore(score) {
        const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        highScores.push({
            score: score,
            date: new Date().toISOString(),
            level: window.gameState ? window.gameState.level : 1
        });
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(10); // Keep only top 10
        localStorage.setItem('highScores', JSON.stringify(highScores));
    }
    
    getHighScores() {
        return JSON.parse(localStorage.getItem('highScores') || '[]');
    }
} 