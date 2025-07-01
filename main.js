// Version 2.0 - Added missile sounds, enemy shooting, 50 lives, achievements, scoring board, and enhanced weapons
// Game variables - Will be initialized after DOM loads
let canvas, ctx, scoreElement, livesElement, levelElement, gameOverScreen, startScreen, finalScoreElement, restartBtn, startBtn;

// Game state
let gameState = 'start';
let listenersInitialized = false;
let score = 0;
let money = 0; // New currency system
let lives = 50; // Increased to 50 lives
let level = 1;
let gameLoop;
let highScore = localStorage.getItem('spaceAdventuresHighScore') || 0;
let savedMoney = localStorage.getItem('spaceAdventuresMoney') || 0;
money = parseInt(savedMoney);

// Sound system
let audioContext;
let soundEnabled = true;

// Initialize audio context only when needed
function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized successfully');
        } catch (error) {
            console.log('Audio context not supported:', error);
        }
    }
}

// Achievement system
const achievements = {
    firstKill: { name: "First Blood", description: "Destroy your first enemy", earned: false, score: 10 },
    sharpshooter: { name: "Sharpshooter", description: "Score 100 points", earned: false, score: 100 },
    survivor: { name: "Survivor", description: "Reach level 3", earned: false, level: 3 },
    destroyer: { name: "Destroyer", description: "Score 500 points", earned: false, score: 500 },
    veteran: { name: "Veteran", description: "Reach level 5", earned: false, level: 5 },
    master: { name: "Space Master", description: "Score 1000 points", earned: false, score: 1000 },
    legend: { name: "Legend", description: "Score 2000 points", earned: false, score: 2000 }
};

let earnedAchievements = [];

// Character system
let selectedCharacter = localStorage.getItem('spaceAdventuresCharacter') || 'kaden';

const CHARACTERS = {
    kaden: {
        name: "Kaden",
        color: '#4a90e2',
        specialAbility: "Rapid Fire",
        description: "The fearless leader with enhanced firepower",
        speed: 8,
        weaponBonus: 1.2,
        specialCooldown: 0
    },
    adelynn: {
        name: "Adelynn", 
        color: '#ff69b4',
        specialAbility: "Shield Burst",
        description: "The tactical genius with defensive mastery",
        speed: 7,
        shieldBonus: 1.5,
        specialCooldown: 0
    },
    nova: {
        name: "Nova",
        color: '#00ffff',
        specialAbility: "Time Warp",
        description: "The mysterious pilot with reality-bending powers",
        speed: 9,
        timeBonus: 1.3,
        specialCooldown: 0
    },
    blaze: {
        name: "Blaze",
        color: '#ff4500',
        specialAbility: "Inferno Blast",
        description: "The fiery warrior with explosive attacks",
        speed: 6,
        damageBonus: 1.4,
        specialCooldown: 0
    }
};

// Player - Fighter jet design with shield
const player = {
    x: 400, // Will be updated when canvas loads
    y: 550, // Will be updated when canvas loads
    width: 60,
    height: 60,
    speed: 8,
    color: '#4a90e2',
    shield: 100,
    shieldRecharge: 0,
    isShieldActive: false,
    character: selectedCharacter
};

// Arrays for game objects
let bullets = [];
let enemyBullets = []; // New array for enemy bullets
let enemies = [];
let explosions = [];
let powerUps = [];
let wingmen = []; // New array for wingman fighters
let specialEffects = []; // New array for special ability effects

// Input handling
const keys = {};
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;
let lastMouseInput = 0;

// Game settings
const BULLET_SPEED = 12;
const ENEMY_BULLET_SPEED = 6; // Enemy bullets are slower
const ENEMY_SPEED = 4;
const POWERUP_SPEED = 2;
const ENEMY_SPAWN_RATE = 0.03;
const POWERUP_SPAWN_RATE = 0.008;
const ENEMY_SHOOT_RATE = 0.005; // Chance per frame for enemy to shoot

// Wingman system
const WINGMAN_COST = 100; // Cost to purchase a wingman
const MAX_WINGMEN = 4; // Maximum number of wingmen
let wingmanCount = 0; // Current number of wingmen

// Story system
let storyProgress = parseInt(localStorage.getItem('spaceAdventuresStoryProgress')) || 0;
let currentMission = parseInt(localStorage.getItem('spaceAdventuresCurrentMission')) || 1;
let missionProgress = parseInt(localStorage.getItem('spaceAdventuresMissionProgress')) || 0;
let totalEnemiesDestroyed = parseInt(localStorage.getItem('spaceAdventuresTotalEnemies')) || 0;
let totalWingmenPurchased = parseInt(localStorage.getItem('spaceAdventuresTotalWingmen')) || 0;
let playerRank = localStorage.getItem('spaceAdventuresPlayerRank') || 'Cadet';
let storyUnlocked = JSON.parse(localStorage.getItem('spaceAdventuresStoryUnlocked')) || false;

// Story missions
const STORY_MISSIONS = {
    1: {
        title: "The Awakening",
        description: "Cadet, you've been chosen for a critical mission. The Zorath Empire has invaded our galaxy. Your training begins now.",
        objective: "Destroy 10 enemy ships",
        target: 10,
        reward: "Promotion to Ensign + 50 coins",
        enemyType: "Scout",
        background: "Training simulation"
    },
    2: {
        title: "First Contact",
        description: "Real combat awaits. The Zorath have established a blockade around Sector Alpha. Break through and establish a foothold.",
        objective: "Destroy 25 enemy ships",
        target: 25,
        reward: "Promotion to Lieutenant + 100 coins",
        enemyType: "Interceptor",
        background: "Sector Alpha"
    },
    3: {
        title: "The Battle of Nebula Prime",
        description: "A massive Zorath fleet has been spotted near Nebula Prime. This is your chance to prove yourself as a true warrior.",
        objective: "Destroy 50 enemy ships",
        target: 50,
        reward: "Promotion to Captain + 200 coins",
        enemyType: "Destroyer",
        background: "Nebula Prime"
    },
    4: {
        title: "Wingman Initiative",
        description: "The Admiral has approved the Wingman Initiative. Recruit AI pilots to form your squadron. The Zorath won't know what hit them.",
        objective: "Purchase 2 wingmen",
        target: 2,
        reward: "Squadron Leader + 300 coins",
        enemyType: "Battleship",
        background: "Deep Space"
    },
    5: {
        title: "The Siege of Zorath Prime",
        description: "We're taking the fight to their homeworld. The fate of the galaxy rests on your shoulders, Commander.",
        objective: "Destroy 100 enemy ships",
        target: 100,
        reward: "Promotion to Admiral + 500 coins",
        enemyType: "Dreadnought",
        background: "Zorath Prime"
    }
};

// Enhanced weapon system with rapid fire
let weaponLevel = 1;
let lastShotTime = 0;
const SHOT_DELAY = 150;
const RAPID_FIRE_DELAY = 80;

// Shield system
const SHIELD_RECHARGE_RATE = 0.5;
const SHIELD_DRAIN_RATE = 2;
const SHIELD_ACTIVATION_COST = 10;

// Boundary constraints - Increased margin for bigger ships
const PLAYER_MARGIN = 35;

// Missile types
const MISSILE_TYPES = {
    BASIC: { color: '#ff4444', width: 4, height: 10, speed: BULLET_SPEED },
    LASER: { color: '#00ffff', width: 3, height: 15, speed: BULLET_SPEED + 2 },
    PLASMA: { color: '#ff00ff', width: 6, height: 8, speed: BULLET_SPEED - 1 },
    MISSILE: { color: '#ffff00', width: 5, height: 12, speed: BULLET_SPEED + 1 },
    HEAVY: { color: '#ff8800', width: 8, height: 16, speed: BULLET_SPEED + 3 },
    SPREAD: { color: '#00ff00', width: 4, height: 12, speed: BULLET_SPEED + 1 }
};

// Sound functions
function playSound(frequency, duration, type = 'sine') {
    if (!soundEnabled) return;
    
    // Initialize audio context if needed
    initAudioContext();
    
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.log('Audio not supported:', error);
    }
}

function playMissileSound() {
    playSound(800, 0.1, 'square');
}

function playEnemyMissileSound() {
    playSound(400, 0.15, 'sawtooth');
}

function playExplosionSound() {
    playSound(200, 0.3, 'triangle');
}

function playPowerUpSound() {
    playSound(1200, 0.2, 'sine');
}

function playAchievementSound() {
    playSound(1500, 0.5, 'sine');
    setTimeout(() => playSound(1800, 0.3, 'sine'), 100);
    setTimeout(() => playSound(2100, 0.2, 'sine'), 200);
}

// Achievement system
function checkAchievements() {
    Object.keys(achievements).forEach(key => {
        const achievement = achievements[key];
        if (!achievement.earned) {
            let earned = false;
            
            if (achievement.score && score >= achievement.score) {
                earned = true;
            } else if (achievement.level && level >= achievement.level) {
                earned = true;
            }
            
            if (earned) {
                achievement.earned = true;
                earnedAchievements.push(achievement);
                playAchievementSound();
                showAchievementNotification(achievement);
            }
        }
    });
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <h3>🏆 ${achievement.name}</h3>
            <p>${achievement.description}</p>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

function showMoneyNotification(amount, x, y) {
    const notification = document.createElement('div');
    notification.className = 'money-notification';
    notification.innerHTML = `
        <div class="money-content">
            <span class="money-icon">💰</span>
            <span class="money-amount">+${amount}</span>
        </div>
    `;
    
    // Position the notification near the explosion
    const canvasRect = canvas.getBoundingClientRect();
    notification.style.left = (canvasRect.left + x) + 'px';
    notification.style.top = (canvasRect.top + y - 30) + 'px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 2000);
}

function showMoneyNotification(amount, x, y) {
    const notification = document.createElement('div');
    notification.className = 'money-notification';
    notification.innerHTML = `
        <div class="money-content">
            <span class="money-icon">💰</span>
            <span class="money-amount">+${amount}</span>
        </div>
    `;
    
    // Position the notification near the explosion
    const canvasRect = canvas.getBoundingClientRect();
    notification.style.left = (canvasRect.left + x) + 'px';
    notification.style.top = (canvasRect.top + y - 30) + 'px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 2000);
}

function purchaseWingman() {
    if (wingmanCount >= MAX_WINGMEN) {
        showNotification('Maximum wingmen reached!', 'warning');
        return;
    }
    
    if (money < WINGMAN_COST) {
        showNotification('Not enough money! Need 100 coins', 'warning');
        return;
    }
    
    money -= WINGMAN_COST;
    wingmanCount++;
    
    // Create new wingman
    const wingman = {
        x: player.x + (wingmanCount * 80) - 160, // Spread them out
        y: player.y + 20,
        width: 50,
        height: 50,
        speed: 8,
        color: '#00ff00',
        lastShot: 0,
        formation: wingmanCount // Position in formation
    };
    
    wingmen.push(wingman);
    totalWingmenPurchased++;
    localStorage.setItem('spaceAdventuresTotalWingmen', totalWingmenPurchased);
    
    showNotification(`Wingman ${wingmanCount} purchased!`, 'success');
    playPowerUpSound();
    
    // Update UI and story progress
    updateUI();
    updateStoryProgress();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `game-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

function showStoryNotification(title, message, type = 'story') {
    const notification = document.createElement('div');
    notification.className = `story-notification ${type}`;
    notification.innerHTML = `
        <div class="story-content">
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 5000);
}

function checkMissionProgress() {
    if (currentMission > 5) return; // All missions completed
    
    const mission = STORY_MISSIONS[currentMission];
    let progress = 0;
    let completed = false;
    
    if (mission.objective.includes('Destroy')) {
        progress = totalEnemiesDestroyed;
        if (progress >= mission.target) {
            completed = true;
        }
    } else if (mission.objective.includes('Purchase')) {
        progress = totalWingmenPurchased;
        if (progress >= mission.target) {
            completed = true;
        }
    }
    
    if (completed) {
        completeMission();
    }
}

function completeMission() {
    const mission = STORY_MISSIONS[currentMission];
    
    // Give rewards
    if (mission.reward.includes('coins')) {
        const coinMatch = mission.reward.match(/(\d+) coins/);
        if (coinMatch) {
            const coins = parseInt(coinMatch[1]);
            money += coins;
            showMoneyNotification(coins, canvas.width / 2, canvas.height / 2);
        }
    }
    
    // Update rank
    if (mission.reward.includes('Promotion')) {
        const rankMatch = mission.reward.match(/Promotion to (\w+)/);
        if (rankMatch) {
            playerRank = rankMatch[1];
            localStorage.setItem('spaceAdventuresPlayerRank', playerRank);
        }
    } else if (mission.reward.includes('Squadron Leader')) {
        playerRank = 'Squadron Leader';
        localStorage.setItem('spaceAdventuresPlayerRank', playerRank);
    } else if (mission.reward.includes('Admiral')) {
        playerRank = 'Admiral';
        localStorage.setItem('spaceAdventuresPlayerRank', playerRank);
    }
    
    // Show completion notification
    showStoryNotification(
        `🎖️ Mission Complete: ${mission.title}`,
        `Congratulations! You've been promoted to ${playerRank}! ${mission.reward}`,
        'success'
    );
    
    // Progress to next mission
    currentMission++;
    missionProgress = 0;
    
    // Save progress
    localStorage.setItem('spaceAdventuresCurrentMission', currentMission);
    localStorage.setItem('spaceAdventuresMissionProgress', missionProgress);
    localStorage.setItem('spaceAdventuresMoney', money);
    
    // Show next mission if available
    if (currentMission <= 5) {
        setTimeout(() => {
            const nextMission = STORY_MISSIONS[currentMission];
            showStoryNotification(
                `📋 New Mission: ${nextMission.title}`,
                nextMission.description,
                'info'
            );
        }, 2000);
    } else {
        setTimeout(() => {
            showStoryNotification(
                '🏆 Galaxy Liberated!',
                'You have successfully defeated the Zorath Empire and liberated the galaxy! You are now a legend among the stars.',
                'legend'
            );
        }, 2000);
    }
}

function updateStoryProgress() {
    // Update total enemies destroyed
    if (totalEnemiesDestroyed !== score / 10) {
        totalEnemiesDestroyed = Math.floor(score / 10);
        localStorage.setItem('spaceAdventuresTotalEnemies', totalEnemiesDestroyed);
    }
    
    // Check mission progress
    checkMissionProgress();
}

function pauseGame() {
    gameState = 'paused';
    cancelAnimationFrame(gameLoop);
    showNotification('Game Paused - Press P to Resume', 'info');
}

function resumeGame() {
    gameState = 'playing';
    gameLoop = requestAnimationFrame(update);
    showNotification('Game Resumed!', 'success');
}

function activateSpecialAbility() {
    const character = CHARACTERS[player.character];
    const currentTime = Date.now();
    
    if (currentTime - character.specialCooldown < 10000) { // 10 second cooldown
        const remainingTime = Math.ceil((10000 - (currentTime - character.specialCooldown)) / 1000);
        showNotification(`Special ability recharging: ${remainingTime}s`, 'warning');
        return;
    }
    
    character.specialCooldown = currentTime;
    
    switch (player.character) {
        case 'kaden':
            // Rapid Fire - Triple fire rate for 5 seconds
            activateRapidFire();
            break;
        case 'adelynn':
            // Shield Burst - Full shield + push enemies away
            activateShieldBurst();
            break;
        case 'nova':
            // Time Warp - Slow down enemies for 5 seconds
            activateTimeWarp();
            break;
        case 'blaze':
            // Inferno Blast - Massive explosion damage
            activateInfernoBlast();
            break;
    }
    
    showNotification(`${character.name}'s ${character.specialAbility} activated!`, 'success');
}

function activateRapidFire() {
    const originalDelay = SHOT_DELAY;
    const originalRapidDelay = RAPID_FIRE_DELAY;
    
    // Temporarily increase fire rate
    SHOT_DELAY = 50;
    RAPID_FIRE_DELAY = 30;
    
    // Create rapid fire effect
    specialEffects.push({
        type: 'rapidFire',
        duration: 5000,
        startTime: Date.now(),
        originalDelay: originalDelay,
        originalRapidDelay: originalRapidDelay
    });
}

function activateShieldBurst() {
    player.shield = 100;
    player.isShieldActive = true;
    
    // Push enemies away
    enemies.forEach(enemy => {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200) {
            enemy.x += (dx / distance) * 100;
            enemy.y += (dy / distance) * 100;
        }
    });
    
    // Create shield burst effect
    specialEffects.push({
        type: 'shieldBurst',
        duration: 3000,
        startTime: Date.now()
    });
}

function activateTimeWarp() {
    // Slow down enemies
    enemies.forEach(enemy => {
        enemy.speed *= 0.3;
    });
    
    // Create time warp effect
    specialEffects.push({
        type: 'timeWarp',
        duration: 5000,
        startTime: Date.now()
    });
}

function activateInfernoBlast() {
    // Create massive explosion
    createExplosion(player.x + player.width / 2, player.y + player.height / 2, 100);
    
    // Damage all enemies on screen
    enemies.forEach(enemy => {
        enemy.health = 0; // Instant kill
    });
    
    // Create inferno effect
    specialEffects.push({
        type: 'infernoBlast',
        duration: 2000,
        startTime: Date.now()
    });
}

// Global event listeners (only set up once)
if (!window.gameEventListenersInitialized) {
    window.gameEventListenersInitialized = true;
    
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === ' ' && gameState === 'playing') {
            e.preventDefault();
            shoot();
        }
        // Toggle sound with 'M' key
        if (e.key === 'm' || e.key === 'M') {
            soundEnabled = !soundEnabled;
            console.log('Sound:', soundEnabled ? 'ON' : 'OFF');
        }
        // Keyboard shortcut to start game
        if (e.key === 'Enter' && gameState === 'start') {
            e.preventDefault();
            startGame();
        }
        // Purchase wingman with 'B' key
        if (e.key === 'b' || e.key === 'B') {
            if (gameState === 'playing') {
                purchaseWingman();
            }
        }
        // Pause game with 'P' key
        if (e.key === 'p' || e.key === 'P') {
            if (gameState === 'playing') {
                pauseGame();
            } else if (gameState === 'paused') {
                resumeGame();
            }
        }
        // Special ability with 'Q' key
        if (e.key === 'q' || e.key === 'Q') {
            if (gameState === 'playing') {
                activateSpecialAbility();
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
}

// Canvas event listeners will be set up in initializeGameElements()

// Enhanced button event listeners with multiple fallbacks
function setupButtonListeners() {
    // Prevent multiple initializations
    if (window.buttonListenersInitialized) {
        return;
    }
    window.buttonListenersInitialized = true;
    
    // Start button
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
        startBtn.addEventListener('touchstart', startGame);
        startBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                startGame();
            }
        });
    }
    
    // Restart button
    if (restartBtn) {
        restartBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('touchstart', startGame);
        restartBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                startGame();
            }
        });
    }
    
    // Keyboard shortcut is now handled in the global event listener
}

// Button listeners are now set up in initializeGameElements()

// Game functions
function startGame() {
    console.log('=== START GAME CALLED ===');
    console.log('Start button clicked!');
    console.log('Game state before:', gameState);
    console.log('Canvas available:', !!canvas);
    console.log('Game loop active:', !!gameLoop);
    
    // Prevent multiple starts
    if (gameState === 'playing') {
        console.log('Game already in progress, ignoring start request');
        return;
    }
    
    gameState = 'playing';
    score = 0;
    lives = 50;
    level = 1;
    weaponLevel = 1;
    
    // Reset achievements for new game
    Object.keys(achievements).forEach(key => {
        achievements[key].earned = false;
    });
    earnedAchievements = [];
    
    // Initialize shield system
    player.shield = 100;
    player.isShieldActive = false;
    player.shieldRecharge = 0;
    
    bullets = [];
    enemyBullets = [];
    enemies = [];
    explosions = [];
    powerUps = [];
    wingmen = [];
    wingmanCount = 0;
    specialEffects = [];
    
    // Center player with boundary constraints
    player.x = Math.max(PLAYER_MARGIN, Math.min(canvas.width - player.width - PLAYER_MARGIN, canvas.width / 2));
    player.y = Math.max(PLAYER_MARGIN, Math.min(canvas.height - player.height - PLAYER_MARGIN, canvas.height - 50));
    
    if (startScreen) startScreen.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    
    // Initialize UI
    updateUI();
    
    // Show story introduction if first time or mission available
    if (currentMission <= 5) {
        const mission = STORY_MISSIONS[currentMission];
        setTimeout(() => {
            showStoryNotification(
                `🎖️ ${playerRank} - Mission ${currentMission}: ${mission.title}`,
                mission.description,
                'info'
            );
        }, 1000);
    }
    
    if (gameLoop) cancelAnimationFrame(gameLoop);
    gameLoop = requestAnimationFrame(update);
}

function gameOver() {
    gameState = 'gameOver';
    
    // Check for new high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('spaceAdventuresHighScore', highScore);
    }
    
    // Save money to localStorage
    localStorage.setItem('spaceAdventuresMoney', money);
    
    if (finalScoreElement) finalScoreElement.textContent = score;
    
    // Update final high score display
    const finalHighScoreElement = document.getElementById('finalHighScore');
    if (finalHighScoreElement) finalHighScoreElement.textContent = highScore;
    
    // Show earned achievements
    const achievementsEarnedElement = document.getElementById('achievementsEarned');
    if (achievementsEarnedElement && earnedAchievements.length > 0) {
        achievementsEarnedElement.innerHTML = '<h4>🏆 Achievements Earned:</h4>';
        earnedAchievements.forEach(achievement => {
            achievementsEarnedElement.innerHTML += `<div class="achievement-item">• ${achievement.name}: ${achievement.description}</div>`;
        });
    } else if (achievementsEarnedElement) {
        achievementsEarnedElement.innerHTML = '';
    }
    
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');
    cancelAnimationFrame(gameLoop);
}

function shoot() {
    const currentTime = Date.now();
    const fireDelay = keys[' '] ? RAPID_FIRE_DELAY : SHOT_DELAY;
    if (currentTime - lastShotTime < fireDelay) return;
    lastShotTime = currentTime;
    
    const centerX = player.x + player.width / 2;
    const centerY = player.y;
    
    // Play missile sound
    playMissileSound();
    
    switch(weaponLevel) {
        case 1: // Single laser shot
            bullets.push({
                x: centerX - MISSILE_TYPES.LASER.width / 2,
                y: centerY,
                width: MISSILE_TYPES.LASER.width,
                height: MISSILE_TYPES.LASER.height,
                speed: MISSILE_TYPES.LASER.speed,
                color: MISSILE_TYPES.LASER.color,
                type: 'laser'
            });
            break;
        case 2: // Double plasma shot
            bullets.push(
                { x: centerX - 8, y: centerY, width: MISSILE_TYPES.PLASMA.width, height: MISSILE_TYPES.PLASMA.height, speed: MISSILE_TYPES.PLASMA.speed, color: MISSILE_TYPES.PLASMA.color, type: 'plasma' },
                { x: centerX + 4, y: centerY, width: MISSILE_TYPES.PLASMA.width, height: MISSILE_TYPES.PLASMA.height, speed: MISSILE_TYPES.PLASMA.speed, color: MISSILE_TYPES.PLASMA.color, type: 'plasma' }
            );
            break;
        case 3: // Triple missile spread
            bullets.push(
                { x: centerX - MISSILE_TYPES.MISSILE.width / 2, y: centerY, width: MISSILE_TYPES.MISSILE.width, height: MISSILE_TYPES.MISSILE.height, speed: MISSILE_TYPES.MISSILE.speed, color: MISSILE_TYPES.MISSILE.color, type: 'missile' },
                { x: centerX - 8, y: centerY + 4, width: MISSILE_TYPES.BASIC.width, height: MISSILE_TYPES.BASIC.height, speed: MISSILE_TYPES.BASIC.speed, color: MISSILE_TYPES.BASIC.color, type: 'basic' },
                { x: centerX + 4, y: centerY + 4, width: MISSILE_TYPES.BASIC.width, height: MISSILE_TYPES.BASIC.height, speed: MISSILE_TYPES.BASIC.speed, color: MISSILE_TYPES.BASIC.color, type: 'basic' }
            );
            break;
        case 4: // Quad laser spread
            bullets.push(
                { x: centerX - MISSILE_TYPES.LASER.width / 2, y: centerY, width: MISSILE_TYPES.LASER.width, height: MISSILE_TYPES.LASER.height, speed: MISSILE_TYPES.LASER.speed, color: MISSILE_TYPES.LASER.color, type: 'laser' },
                { x: centerX - 8, y: centerY + 2, width: MISSILE_TYPES.PLASMA.width, height: MISSILE_TYPES.PLASMA.height, speed: MISSILE_TYPES.PLASMA.speed - 1, color: MISSILE_TYPES.PLASMA.color, type: 'plasma' },
                { x: centerX + 4, y: centerY + 2, width: MISSILE_TYPES.PLASMA.width, height: MISSILE_TYPES.PLASMA.height, speed: MISSILE_TYPES.PLASMA.speed - 1, color: MISSILE_TYPES.PLASMA.color, type: 'plasma' }
            );
            break;
        case 5: // 7-shot spread with heavy missiles
            bullets.push(
                { x: centerX - MISSILE_TYPES.LASER.width / 2, y: centerY, width: MISSILE_TYPES.LASER.width, height: MISSILE_TYPES.LASER.height, speed: MISSILE_TYPES.LASER.speed, color: MISSILE_TYPES.LASER.color, type: 'laser' },
                { x: centerX - 8, y: centerY + 2, width: MISSILE_TYPES.MISSILE.width, height: MISSILE_TYPES.MISSILE.height, speed: MISSILE_TYPES.MISSILE.speed - 1, color: MISSILE_TYPES.MISSILE.color, type: 'missile' },
                { x: centerX + 4, y: centerY + 2, width: MISSILE_TYPES.MISSILE.width, height: MISSILE_TYPES.MISSILE.height, speed: MISSILE_TYPES.MISSILE.speed - 1, color: MISSILE_TYPES.MISSILE.color, type: 'missile' },
                { x: centerX - 12, y: centerY + 4, width: MISSILE_TYPES.PLASMA.width, height: MISSILE_TYPES.PLASMA.height, speed: MISSILE_TYPES.PLASMA.speed - 2, color: MISSILE_TYPES.PLASMA.color, type: 'plasma' },
                { x: centerX + 8, y: centerY + 4, width: MISSILE_TYPES.PLASMA.width, height: MISSILE_TYPES.PLASMA.height, speed: MISSILE_TYPES.PLASMA.speed - 2, color: MISSILE_TYPES.PLASMA.color, type: 'plasma' }
            );
            break;
        default: // Max level - 9 shot ultimate spread
            bullets.push(
                { x: centerX - MISSILE_TYPES.LASER.width / 2, y: centerY, width: MISSILE_TYPES.LASER.width, height: MISSILE_TYPES.LASER.height, speed: MISSILE_TYPES.LASER.speed, color: MISSILE_TYPES.LASER.color, type: 'laser' },
                { x: centerX - 8, y: centerY + 2, width: MISSILE_TYPES.MISSILE.width, height: MISSILE_TYPES.MISSILE.height, speed: MISSILE_TYPES.MISSILE.speed - 1, color: MISSILE_TYPES.MISSILE.color, type: 'missile' },
                { x: centerX + 4, y: centerY + 2, width: MISSILE_TYPES.MISSILE.width, height: MISSILE_TYPES.MISSILE.height, speed: MISSILE_TYPES.MISSILE.speed - 1, color: MISSILE_TYPES.MISSILE.color, type: 'missile' },
                { x: centerX - 12, y: centerY + 4, width: MISSILE_TYPES.PLASMA.width, height: MISSILE_TYPES.PLASMA.height, speed: MISSILE_TYPES.PLASMA.speed - 2, color: MISSILE_TYPES.PLASMA.color, type: 'plasma' },
                { x: centerX + 8, y: centerY + 4, width: MISSILE_TYPES.PLASMA.width, height: MISSILE_TYPES.PLASMA.height, speed: MISSILE_TYPES.PLASMA.speed - 2, color: MISSILE_TYPES.PLASMA.color, type: 'plasma' },
                { x: centerX - 16, y: centerY + 6, width: MISSILE_TYPES.HEAVY.width, height: MISSILE_TYPES.HEAVY.height, speed: MISSILE_TYPES.HEAVY.speed - 3, color: MISSILE_TYPES.HEAVY.color, type: 'heavy' },
                { x: centerX + 12, y: centerY + 6, width: MISSILE_TYPES.HEAVY.width, height: MISSILE_TYPES.HEAVY.height, speed: MISSILE_TYPES.HEAVY.speed - 3, color: MISSILE_TYPES.HEAVY.color, type: 'heavy' },
                { x: centerX - 20, y: centerY + 8, width: MISSILE_TYPES.SPREAD.width, height: MISSILE_TYPES.SPREAD.height, speed: MISSILE_TYPES.SPREAD.speed - 4, color: MISSILE_TYPES.SPREAD.color, type: 'spread' },
                { x: centerX + 16, y: centerY + 8, width: MISSILE_TYPES.SPREAD.width, height: MISSILE_TYPES.SPREAD.height, speed: MISSILE_TYPES.SPREAD.speed - 4, color: MISSILE_TYPES.SPREAD.color, type: 'spread' }
            );
    }
}

function enemyShoot(enemy) {
    if (Math.random() < ENEMY_SHOOT_RATE) {
        playEnemyMissileSound();
        enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            width: 4,
            height: 8,
            speed: ENEMY_BULLET_SPEED,
            color: '#ff4444',
            type: 'enemy'
        });
    }
}

function wingmanShoot(wingman) {
    const currentTime = Date.now();
    if (currentTime - wingman.lastShot < 500) return; // Wingmen shoot every 500ms
    
    wingman.lastShot = currentTime;
    
    // Wingmen have maximum weapon capacity (level 6)
    const centerX = wingman.x + wingman.width / 2;
    const centerY = wingman.y;
    
    // Create maximum firepower spread for wingmen
    bullets.push(
        // Center laser
        { x: centerX - MISSILE_TYPES.LASER.width / 2, y: centerY, width: MISSILE_TYPES.LASER.width, height: MISSILE_TYPES.LASER.height, speed: MISSILE_TYPES.LASER.speed, color: MISSILE_TYPES.LASER.color, type: 'laser' },
        // Side missiles
        { x: centerX - 8, y: centerY + 2, width: MISSILE_TYPES.MISSILE.width, height: MISSILE_TYPES.MISSILE.height, speed: MISSILE_TYPES.MISSILE.speed - 1, color: MISSILE_TYPES.MISSILE.color, type: 'missile' },
        { x: centerX + 4, y: centerY + 2, width: MISSILE_TYPES.MISSILE.width, height: MISSILE_TYPES.MISSILE.height, speed: MISSILE_TYPES.MISSILE.speed - 1, color: MISSILE_TYPES.MISSILE.color, type: 'missile' },
        // Outer plasma
        { x: centerX - 12, y: centerY + 4, width: MISSILE_TYPES.PLASMA.width, height: MISSILE_TYPES.PLASMA.height, speed: MISSILE_TYPES.PLASMA.speed - 2, color: MISSILE_TYPES.PLASMA.color, type: 'plasma' },
        { x: centerX + 8, y: centerY + 4, width: MISSILE_TYPES.PLASMA.width, height: MISSILE_TYPES.PLASMA.height, speed: MISSILE_TYPES.PLASMA.speed - 2, color: MISSILE_TYPES.PLASMA.color, type: 'plasma' },
        // Heavy missiles
        { x: centerX - 16, y: centerY + 6, width: MISSILE_TYPES.HEAVY.width, height: MISSILE_TYPES.HEAVY.height, speed: MISSILE_TYPES.HEAVY.speed - 3, color: MISSILE_TYPES.HEAVY.color, type: 'heavy' },
        { x: centerX + 12, y: centerY + 6, width: MISSILE_TYPES.HEAVY.width, height: MISSILE_TYPES.HEAVY.height, speed: MISSILE_TYPES.HEAVY.speed - 3, color: MISSILE_TYPES.HEAVY.color, type: 'heavy' },
        // Spread shots
        { x: centerX - 20, y: centerY + 8, width: MISSILE_TYPES.SPREAD.width, height: MISSILE_TYPES.SPREAD.height, speed: MISSILE_TYPES.SPREAD.speed - 4, color: MISSILE_TYPES.SPREAD.color, type: 'spread' },
        { x: centerX + 16, y: centerY + 8, width: MISSILE_TYPES.SPREAD.width, height: MISSILE_TYPES.SPREAD.height, speed: MISSILE_TYPES.SPREAD.speed - 4, color: MISSILE_TYPES.SPREAD.color, type: 'spread' }
    );
    
    // Play wingman missile sound (slightly different pitch)
    playSound(800, 50, 'square');
}

function spawnEnemy() {
    if (Math.random() < ENEMY_SPAWN_RATE) {
        enemies.push({
            x: Math.random() * (canvas.width - 50),
            y: -50,
            width: 50,
            height: 50,
            speed: ENEMY_SPEED + level * 0.8,
            color: '#ff6666',
            health: 1,
            lastShot: 0 // Track when enemy last shot
        });
    }
}

function spawnPowerUp() {
    if (Math.random() < POWERUP_SPAWN_RATE) {
        const type = Math.random() < 0.5 ? 'health' : 'weapon';
        powerUps.push({
            x: Math.random() * (canvas.width - 20),
            y: -20,
            width: 20,
            height: 20,
            speed: POWERUP_SPEED,
            color: type === 'health' ? '#00ff00' : '#ffff00',
            type: type
        });
    }
}

function createExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        radius: 20,
        maxRadius: 30,
        alpha: 1,
        decay: 0.02
    });
}

function updatePlayer() {
    // Calculate boundary constraints with extra safety margin
    const minX = PLAYER_MARGIN;
    const maxX = canvas.width - player.width - PLAYER_MARGIN;
    const minY = PLAYER_MARGIN;
    const maxY = canvas.height - player.height - PLAYER_MARGIN;
    
    // Store current position for validation
    const currentX = player.x;
    const currentY = player.y;
    
    // Check if keyboard input is active
    const hasKeyboardInput = keys['ArrowLeft'] || keys['a'] || keys['A'] || 
                            keys['ArrowRight'] || keys['d'] || keys['D'] || 
                            keys['ArrowUp'] || keys['w'] || keys['W'] || 
                            keys['ArrowDown'] || keys['s'] || keys['S'];
    
    // Handle keyboard movement with immediate boundary checking
    if (hasKeyboardInput) {
        let newX = currentX;
        let newY = currentY;
        
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            newX = Math.max(minX, currentX - player.speed);
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            newX = Math.min(maxX, currentX + player.speed);
        }
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            newY = Math.max(minY, currentY - player.speed);
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            newY = Math.min(maxY, currentY + player.speed);
        }
        
        // Apply new position with validation
        player.x = Math.max(minX, Math.min(maxX, newX));
        player.y = Math.max(minY, Math.min(maxY, newY));
    }
    // Handle mouse movement only if no keyboard input and mouse is active
    else if (mouseX > 0 && mouseY > 0 && (Date.now() - lastMouseInput) < 1000) {
        const targetX = mouseX - player.width / 2;
        const targetY = mouseY - player.height / 2;
        
        // Smooth mouse movement with strict boundary constraints
        player.x = Math.max(minX, Math.min(maxX, targetX));
        player.y = Math.max(minY, Math.min(maxY, targetY));
    }
    
    // Final safety check - ensure player never goes off-screen
    player.x = Math.max(minX, Math.min(maxX, player.x));
    player.y = Math.max(minY, Math.min(maxY, player.y));
    
    // Shield system
    // Shield activation with Shift key
    if (keys['Shift'] && player.shield >= SHIELD_ACTIVATION_COST && !player.isShieldActive) {
        player.isShieldActive = true;
        player.shield -= SHIELD_ACTIVATION_COST;
    }
    
    // Shield deactivation when Shift is released
    if (!keys['Shift'] && player.isShieldActive) {
        player.isShieldActive = false;
    }
    
    // Shield drain when active
    if (player.isShieldActive && player.shield > 0) {
        player.shield = Math.max(0, player.shield - SHIELD_DRAIN_RATE);
        if (player.shield <= 0) {
            player.isShieldActive = false;
        }
    }
    
    // Shield recharge when not active
    if (!player.isShieldActive && player.shield < 100) {
        player.shield = Math.min(100, player.shield + SHIELD_RECHARGE_RATE);
    }
    
    // Auto-shoot if mouse is held down or spacebar is pressed
    if ((isMouseDown || keys[' ']) && gameState === 'playing') {
        shoot();
    }
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > -bullet.height;
    });
}

function updateEnemyBullets() {
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        
        // Check collision with player
        if (checkCollision(bullet, player)) {
            // Shield absorbs damage if active
            if (player.isShieldActive && player.shield > 0) {
                player.shield = Math.max(0, player.shield - 10);
                if (player.shield <= 0) {
                    player.isShieldActive = false;
                }
            } else {
                // No shield, player takes damage
                lives--;
                if (lives <= 0) {
                    gameOver();
                }
            }
            return false;
        }
        
        return bullet.y < canvas.height;
    });
}

function updateEnemies() {
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;
        
        // Enemy shooting
        enemyShoot(enemy);
        
        if (checkCollision(enemy, player)) {
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            playExplosionSound();
            
            // Shield absorbs damage if active
            if (player.isShieldActive && player.shield > 0) {
                // Shield absorbs the hit, but drains faster
                player.shield = Math.max(0, player.shield - 20);
                if (player.shield <= 0) {
                    player.isShieldActive = false;
                }
                // Enemy is destroyed but player takes no damage
                return false;
            } else {
                // No shield, player takes damage
                lives--;
                if (lives <= 0) {
                    gameOver();
                    return false;
                }
                return false;
            }
        }
        
        return enemy.y < canvas.height;
    });
}

function updatePowerUps() {
    powerUps = powerUps.filter(powerUp => {
        powerUp.y += powerUp.speed;
        
        if (checkCollision(powerUp, player)) {
            playPowerUpSound();
            if (powerUp.type === 'health') {
                lives = Math.min(lives + 1, 50);
            } else if (powerUp.type === 'weapon') {
                weaponLevel = Math.min(weaponLevel + 1, 6); // Increased max weapon level
            }
            return false;
        }
        
        return powerUp.y < canvas.height;
    });
}

function updateWingmen() {
    for (let i = wingmen.length - 1; i >= 0; i--) {
        const wingman = wingmen[i];
        
        // Update wingman position to follow player in formation
        const targetX = player.x + (wingman.formation * 80) - 160;
        const targetY = player.y + 20;
        
        // Smooth movement towards formation position
        wingman.x += (targetX - wingman.x) * 0.1;
        wingman.y += (targetY - wingman.y) * 0.1;
        
        // Keep wingmen within canvas bounds
        wingman.x = Math.max(0, Math.min(canvas.width - wingman.width, wingman.x));
        wingman.y = Math.max(0, Math.min(canvas.height - wingman.height, wingman.y));
        
        // Wingmen shoot automatically
        wingmanShoot(wingman);
    }
}

function updateExplosions() {
    explosions = explosions.filter(explosion => {
        explosion.radius += 1;
        explosion.alpha -= explosion.decay;
        return explosion.alpha > 0;
    });
}

function updateSpecialEffects() {
    const currentTime = Date.now();
    
    specialEffects = specialEffects.filter(effect => {
        const elapsed = currentTime - effect.startTime;
        
        if (elapsed >= effect.duration) {
            // Effect expired, restore normal state
            switch (effect.type) {
                case 'rapidFire':
                    SHOT_DELAY = effect.originalDelay;
                    RAPID_FIRE_DELAY = effect.originalRapidDelay;
                    break;
                case 'timeWarp':
                    // Restore enemy speeds
                    enemies.forEach(enemy => {
                        enemy.speed = ENEMY_SPEED + level * 0.8;
                    });
                    break;
            }
            return false;
        }
        return true;
    });
}

function checkCollisions() {
    bullets = bullets.filter(bullet => {
        let bulletHit = false;
        enemies = enemies.filter(enemy => {
            if (checkCollision(bullet, enemy)) {
                enemy.health--;
                bulletHit = true;
                if (enemy.health <= 0) {
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    playExplosionSound();
                    score += 10;
                    // Earn money from destroying enemy ships
                    const moneyEarned = Math.floor(Math.random() * 5) + 5; // 5-10 coins per ship
                    money += moneyEarned;
                    showMoneyNotification(moneyEarned, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    
                    // Update story progress
                    updateStoryProgress();
                    
                    return false;
                }
            }
            return true;
        });
        return !bulletHit;
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function updateLevel() {
    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel > level) {
        level = newLevel;
    }
}

function updateUI() {
    if (scoreElement) scoreElement.textContent = score;
    if (livesElement) livesElement.textContent = lives;
    if (levelElement) levelElement.textContent = level;
    
    // Update money display
    const moneyElement = document.getElementById('money');
    if (moneyElement) moneyElement.textContent = money;
    
    // Update high score display
    const highScoreElement = document.getElementById('highScore');
    if (highScoreElement) highScoreElement.textContent = highScore;
    
    // Update weapon level display
    const weaponElement = document.getElementById('weapon');
    if (weaponElement) weaponElement.textContent = weaponLevel;
    
    // Update sound status display
    const soundElement = document.getElementById('sound');
    if (soundElement) soundElement.textContent = soundEnabled ? 'ON' : 'OFF';
    
    // Update wingman count display
    const wingmenElement = document.getElementById('wingmen');
    if (wingmenElement) wingmenElement.textContent = wingmanCount;
    
    // Update rank display
    const rankElement = document.getElementById('rank');
    if (rankElement) rankElement.textContent = playerRank;
    
    // Update mission display
    const missionElement = document.getElementById('mission');
    if (missionElement) missionElement.textContent = currentMission;
    
    // Update character display
    const characterElement = document.getElementById('character');
    if (characterElement) {
        const character = CHARACTERS[player.character];
        characterElement.textContent = character.name;
    }
    
    // Update special ability display
    const specialElement = document.getElementById('special');
    if (specialElement) {
        const character = CHARACTERS[player.character];
        const currentTime = Date.now();
        const cooldownRemaining = Math.max(0, 10000 - (currentTime - character.specialCooldown));
        
        if (cooldownRemaining > 0) {
            const seconds = Math.ceil(cooldownRemaining / 1000);
            specialElement.textContent = `${seconds}s`;
            specialElement.style.color = '#ff8800';
        } else {
            specialElement.textContent = 'Ready';
            specialElement.style.color = '#00ff00';
        }
    }
    
    // Update shield display if shield element exists
    const shieldElement = document.getElementById('shield');
    if (shieldElement) {
        shieldElement.textContent = Math.round(player.shield);
        // Change color based on shield status
        if (player.isShieldActive) {
            shieldElement.style.color = '#00ffff';
        } else if (player.shield > 50) {
            shieldElement.style.color = '#00ff00';
        } else if (player.shield > 25) {
            shieldElement.style.color = '#ffff00';
        } else {
            shieldElement.style.color = '#ff4444';
        }
    }
    
    // Check achievements
    checkAchievements();
}

function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawStars();
    drawPlayer();
    
    // Draw wingmen
    wingmen.forEach(wingman => {
        drawWingman(wingman);
    });
    
    bullets.forEach(bullet => {
        drawBullet(bullet);
    });
    
    enemyBullets.forEach(bullet => {
        drawEnemyBullet(bullet);
    });
    
    enemies.forEach(enemy => {
        drawEnemy(enemy);
    });
    
    powerUps.forEach(powerUp => {
        drawPowerUp(powerUp);
    });
    
    explosions.forEach(explosion => {
        drawExplosion(explosion);
    });
    
    // Draw special effects
    drawSpecialEffects();
    
    // Draw pause overlay
    if (gameState === 'paused') {
        drawPauseOverlay();
    }
}

function drawBullet(bullet) {
    const x = bullet.x;
    const y = bullet.y;
    const w = bullet.width;
    const h = bullet.height;
    
    switch(bullet.type) {
        case 'laser':
            // Laser beam with glow effect
            ctx.shadowColor = bullet.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = bullet.color;
            ctx.fillRect(x, y, w, h);
            ctx.shadowBlur = 0;
            break;
            
        case 'plasma':
            // Plasma ball with gradient
            const gradient = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w/2);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.5, bullet.color);
            gradient.addColorStop(1, '#800080');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, w, h);
            break;
            
        case 'missile':
            // Missile with trail effect
            ctx.fillStyle = bullet.color;
            ctx.fillRect(x, y, w, h);
            // Trail effect
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.fillRect(x + w/2 - 1, y + h, 2, 6);
            break;
            
        case 'heavy':
            // Heavy missile with explosion effect
            ctx.shadowColor = bullet.color;
            ctx.shadowBlur = 12;
            ctx.fillStyle = bullet.color;
            ctx.fillRect(x, y, w, h);
            ctx.shadowBlur = 0;
            // Explosion trail
            ctx.fillStyle = 'rgba(255, 136, 0, 0.6)';
            ctx.fillRect(x + w/2 - 2, y + h, 4, 8);
            break;
            
        case 'spread':
            // Spread missile with multiple trails
            ctx.fillStyle = bullet.color;
            ctx.fillRect(x, y, w, h);
            // Multiple trails
            ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
            ctx.fillRect(x + w/2 - 1, y + h, 2, 4);
            ctx.fillRect(x + w/2 - 3, y + h + 2, 2, 4);
            ctx.fillRect(x + w/2 + 1, y + h + 2, 2, 4);
            break;
            
        default: // basic
            // Basic bullet with simple glow
            ctx.shadowColor = bullet.color;
            ctx.shadowBlur = 4;
            ctx.fillStyle = bullet.color;
            ctx.fillRect(x, y, w, h);
            ctx.shadowBlur = 0;
            break;
    }
}

function drawEnemyBullet(bullet) {
    const x = bullet.x;
    const y = bullet.y;
    const w = bullet.width;
    const h = bullet.height;
    
    // Enemy bullet with red glow
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = bullet.color;
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
    
    // Trail effect
    ctx.fillStyle = 'rgba(255, 68, 68, 0.4)';
    ctx.fillRect(x + w/2 - 1, y - 4, 2, 4);
}

function drawPlayer() {
    const x = player.x;
    const y = player.y;
    
    // Fighter jet design - Sleek and aerodynamic
    // Main body (blue) - Longer and sleeker
    ctx.fillStyle = "#4a90e2";
    ctx.fillRect(x + 15, y + 20, 30, 20);
    
    // Nose cone (light blue) - Pointed and longer
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(x + 20, y + 15, 20, 10);
    
    // Cockpit (white) - Sleek canopy
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 22, y + 22, 16, 8);
    
    // Wings (darker blue) - Swept back design
    ctx.fillStyle = "#357abd";
    ctx.fillRect(x + 10, y + 25, 8, 10);
    ctx.fillRect(x + 42, y + 25, 8, 10);
    
    // Tail fins (darker blue)
    ctx.fillStyle = "#357abd";
    ctx.fillRect(x + 18, y + 35, 4, 8);
    ctx.fillRect(x + 38, y + 35, 4, 8);
    
    // Engine exhaust (yellow) - Dual engines
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(x + 22, y + 40, 6, 8);
    ctx.fillRect(x + 32, y + 40, 6, 8);
    
    // Wing tips (light blue) - Missile rails
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(x + 8, y + 27, 4, 6);
    ctx.fillRect(x + 48, y + 27, 4, 6);
    
    // Side thrusters (orange)
    ctx.fillStyle = "#ff8800";
    ctx.fillRect(x + 12, y + 38, 5, 6);
    ctx.fillRect(x + 43, y + 38, 5, 6);
    
    // Front details (silver) - Radar and sensors
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(x + 25, y + 17, 10, 3);
    
    // Shield effect if active
    if (player.isShieldActive && player.shield > 0) {
        ctx.save();
        ctx.globalAlpha = player.shield / 100 * 0.6;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + player.width/2, y + player.height/2, player.width/2 + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

function drawWingman(wingman) {
    const x = wingman.x;
    const y = wingman.y;
    
    // Wingman fighter design - smaller, sleeker version of player ship
    // Main body (green)
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(x + 10, y + 10, 30, 20);
    
    // Nose (dark green)
    ctx.fillStyle = "#00cc00";
    ctx.fillRect(x + 15, y + 8, 20, 8);
    
    // Cockpit (black)
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 16, y + 12, 18, 6);
    
    // Wings (lighter green)
    ctx.fillStyle = "#00dd00";
    ctx.fillRect(x + 5, y + 15, 8, 6);
    ctx.fillRect(x + 37, y + 15, 8, 6);
    
    // Engine (bright green)
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(x + 15, y + 25, 20, 4);
    
    // Wing tips (yellow)
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(x + 3, y + 16, 4, 2);
    ctx.fillRect(x + 43, y + 16, 4, 2);
    
    // Side details (cyan)
    ctx.fillStyle = "#00ffff";
    ctx.fillRect(x + 8, y + 20, 3, 4);
    ctx.fillRect(x + 39, y + 20, 3, 4);
    
    // Glow effect for wingman
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 6;
    ctx.fillRect(x + 10, y + 10, 30, 20);
    ctx.shadowBlur = 0;
    
    // Formation indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(wingman.formation, x + 25, y + 35);
}

function drawEnemy(enemy) {
    const x = enemy.x;
    const y = enemy.y;
    
    // Gradius-style enemy ship (Zub-like) - Bigger and more detailed
    // Main body (red) - Bigger
    ctx.fillStyle = "#ff6666";
    ctx.fillRect(x + 15, y + 15, 20, 24);
    
    // Nose (dark red) - Bigger
    ctx.fillStyle = "#cc3333";
    ctx.fillRect(x + 18, y + 12, 14, 12);
    
    // Cockpit (black) - Bigger
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 17, y + 18, 16, 12);
    
    // Wings (darker red) - Bigger
    ctx.fillStyle = "#cc3333";
    ctx.fillRect(x + 9, y + 21, 9, 9);
    ctx.fillRect(x + 32, y + 21, 9, 9);
    
    // Engine (orange) - Bigger
    ctx.fillStyle = "#ff8800";
    ctx.fillRect(x + 18, y + 33, 14, 8);
    
    // Wing tips (light red) - Bigger
    ctx.fillStyle = "#ffaaaa";
    ctx.fillRect(x + 6, y + 24, 6, 3);
    ctx.fillRect(x + 38, y + 24, 6, 3);
    
    // Additional details for bigger enemy ship
    // Side cannons (dark gray)
    ctx.fillStyle = "#666666";
    ctx.fillRect(x + 12, y + 28, 4, 6);
    ctx.fillRect(x + 34, y + 28, 4, 6);
    
    // Front details (silver)
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(x + 22, y + 16, 6, 4);
}

function drawPowerUp(powerUp) {
    const x = powerUp.x;
    const y = powerUp.y;
    const centerX = x + powerUp.width / 2;
    const centerY = y + powerUp.height / 2;
    
    if (powerUp.type === 'health') {
        // Health power-up - Heart design
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Heart shape
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.bezierCurveTo(-4, -8, -8, -4, -8, 0);
        ctx.bezierCurveTo(-8, 4, -4, 8, 0, 6);
        ctx.bezierCurveTo(4, 8, 8, 4, 8, 0);
        ctx.bezierCurveTo(8, -4, 4, -8, 0, -3);
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = '#ff8888';
        ctx.shadowBlur = 8;
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = '#ffaaaa';
        ctx.beginPath();
        ctx.arc(-2, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Pulsing animation
        const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 1;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(pulse, pulse);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ff6666';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
    } else {
        // Weapon power-up - Star design
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Star shape
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const outerRadius = 8;
            const innerRadius = 4;
            
            const x1 = Math.cos(angle) * outerRadius;
            const y1 = Math.sin(angle) * outerRadius;
            const x2 = Math.cos(angle + Math.PI / 5) * innerRadius;
            const y2 = Math.sin(angle + Math.PI / 5) * innerRadius;
            
            if (i === 0) {
                ctx.moveTo(x1, y1);
            } else {
                ctx.lineTo(x1, y1);
            }
            ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = '#ffff88';
        ctx.shadowBlur = 10;
        ctx.fill();
        
        // Center gem
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Rotating animation
        const rotation = Date.now() * 0.003;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#ffff88';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * 12;
            const y = Math.sin(angle) * 12;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

function drawExplosion(explosion) {
    if (explosion.radius <= 0) return;
    
    ctx.save();
    ctx.globalAlpha = explosion.alpha;
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawStars() {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 73 + Date.now() * 0.01) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
}

function drawSpecialEffects() {
    specialEffects.forEach(effect => {
        switch (effect.type) {
            case 'rapidFire':
                // Draw rapid fire indicator
                ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                break;
            case 'shieldBurst':
                // Draw shield burst effect
                ctx.save();
                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(player.x + player.width/2, player.y + player.height/2, 150, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                break;
            case 'timeWarp':
                // Draw time warp effect
                ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                break;
            case 'infernoBlast':
                // Draw inferno effect
                ctx.fillStyle = 'rgba(255, 69, 0, 0.4)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                break;
        }
    });
}

function drawPauseOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = '24px Arial';
    ctx.fillText('Press P to Resume', canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.font = '18px Arial';
    ctx.fillText('Press Q for Special Ability', canvas.width / 2, canvas.height / 2 + 60);
}

function update() {
    if (gameState !== 'playing') return;
    
    updatePlayer();
    updateBullets();
    updateEnemyBullets();
    updateEnemies();
    updatePowerUps();
    updateWingmen();
    updateExplosions();
    updateSpecialEffects();
    checkCollisions();
    updateLevel();
    updateUI();
    
    spawnEnemy();
    spawnPowerUp();
    
    render();
    
    gameLoop = requestAnimationFrame(update);
}

// Initialize game elements after DOM loads
function initializeGameElements() {
    console.log('=== GAME INITIALIZATION START ===');
    console.log('Document ready state:', document.readyState);
    console.log('Window loaded:', window.loaded);
    
    // Get DOM elements
    canvas = document.getElementById('gameCanvas');
    console.log('Canvas found:', canvas);
    
    if (!canvas) {
        console.error('Canvas not found! DOM not ready yet.');
        return false;
    }
    
    ctx = canvas.getContext('2d');
    console.log('Canvas context created:', ctx);
    
    scoreElement = document.getElementById('score');
    livesElement = document.getElementById('lives');
    levelElement = document.getElementById('level');
    gameOverScreen = document.getElementById('gameOver');
    startScreen = document.getElementById('startScreen');
    finalScoreElement = document.getElementById('finalScore');
    restartBtn = document.getElementById('restartBtn');
    startBtn = document.getElementById('startBtn');
    
    console.log('All elements found:', {
        canvas: !!canvas,
        startBtn: !!startBtn,
        restartBtn: !!restartBtn,
        scoreElement: !!scoreElement,
        livesElement: !!livesElement,
        levelElement: !!levelElement,
        gameOverScreen: !!gameOverScreen,
        startScreen: !!startScreen,
        finalScoreElement: !!finalScoreElement
    });
    
    // Safety check for required elements
    if (!startBtn || !restartBtn || !canvas) {
        console.error('Required game elements not found!');
        console.error('Missing elements:', {
            startBtn: !startBtn,
            restartBtn: !restartBtn,
            canvas: !canvas
        });
        return false;
    }
    
    // Update player position based on canvas size
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    
    console.log('Game elements initialized successfully');
    console.log('Canvas size:', canvas.width, 'x', canvas.height);
    console.log('Player position:', player.x, player.y);
    console.log('=== GAME INITIALIZATION COMPLETE ===');
    
    // Set up canvas event listeners
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        lastMouseInput = Date.now();
    });

    canvas.addEventListener('mousedown', () => {
        isMouseDown = true;
        if (gameState === 'playing') {
            shoot();
        }
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
    
    // Set up character selection
    setupCharacterSelection();
    
    // Set up tab navigation
    setupTabNavigation();
    
    console.log('Canvas event listeners set up');
    
    // Initialize UI
    updateUI();
    
    // Initialize high score display
    const highScoreElement = document.getElementById('highScore');
    if (highScoreElement) highScoreElement.textContent = highScore;
    
    return true;
}

function setupCharacterSelection() {
    const characterCards = document.querySelectorAll('.character-card');
    
    // Set initial selection
    characterCards.forEach(card => {
        if (card.dataset.character === selectedCharacter) {
            card.classList.add('selected');
        }
        
        card.addEventListener('click', () => {
            // Remove previous selection
            characterCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            card.classList.add('selected');
            
            // Update selected character
            selectedCharacter = card.dataset.character;
            player.character = selectedCharacter;
            player.color = CHARACTERS[selectedCharacter].color;
            player.speed = CHARACTERS[selectedCharacter].speed;
            
            // Save selection
            localStorage.setItem('spaceAdventuresCharacter', selectedCharacter);
            
            // Show character info
            const character = CHARACTERS[selectedCharacter];
            showNotification(`Selected ${character.name}: ${character.specialAbility}`, 'info');
        });
    });
}

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            const targetPanel = document.getElementById(`${targetTab}-tab`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (initializeGameElements()) {
            setupButtonListeners();
        }
    });
} else {
    if (initializeGameElements()) {
        setupButtonListeners();
    }
} 