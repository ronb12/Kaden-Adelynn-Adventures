// Version 3.1 - Added full mobile support with touch controls, iOS optimization, and responsive design!
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
let storyNotificationsEnabled = JSON.parse(localStorage.getItem('spaceAdventuresStoryNotifications')) !== false; // Default to true

// Story missions - 20 exciting missions for kids!
const STORY_MISSIONS = {
    1: { title: "🚀 Training Day", description: "Welcome to the Space Academy! Learn to fly your awesome triangle fighter jet!", objective: "Destroy 5 enemy ships", target: 5, reward: "Cadet Badge + 25 coins", enemyType: "Training Drones", background: "Space Academy", boss: false },
    2: { title: "⚡ First Flight", description: "Time for your first real mission! Show them what you've got!", objective: "Destroy 10 enemy ships", target: 10, reward: "Ensign Rank + 50 coins", enemyType: "Scout Fighters", background: "Sector Alpha", boss: false },
    3: { title: "🎯 Target Practice", description: "The Zorath are invading! Time to defend our space!", objective: "Destroy 15 enemy ships", target: 15, reward: "Lieutenant Rank + 75 coins", enemyType: "Interceptor Squad", background: "Defense Zone", boss: false },
    4: { title: "🔥 Hot Pursuit", description: "Chase down the enemy fighters! Don't let them escape!", objective: "Destroy 20 enemy ships", target: 20, reward: "Captain Rank + 100 coins", enemyType: "Pursuit Fighters", background: "Asteroid Belt", boss: false },
    5: { title: "👾 BOSS BATTLE: Drone Commander", description: "A massive enemy commander has appeared! This is your first boss fight!", objective: "Defeat the Boss", target: 1, reward: "Boss Slayer + 200 coins", enemyType: "Boss Enemy", background: "Boss Arena", boss: true },
    6: { title: "🛩️ Wingman Time!", description: "You've earned your first wingman! Build your squadron!", objective: "Purchase 1 wingman", target: 1, reward: "Squadron Leader + 150 coins", enemyType: "Elite Fighters", background: "Deep Space", boss: false },
    7: { title: "💥 Explosive Action", description: "The enemy is getting tougher! Use your special abilities!", objective: "Destroy 30 enemy ships", target: 30, reward: "Combat Expert + 125 coins", enemyType: "Heavy Fighters", background: "Nebula Zone", boss: false },
    8: { title: "🌟 Star Defender", description: "Protect the star system from invasion!", objective: "Destroy 35 enemy ships", target: 35, reward: "Star Defender + 150 coins", enemyType: "Invasion Force", background: "Star System", boss: false },
    9: { title: "⚔️ BOSS BATTLE: Battle Cruiser", description: "A massive battle cruiser is attacking! Take it down!", objective: "Defeat the Boss", target: 1, reward: "Cruiser Destroyer + 300 coins", enemyType: "Boss Enemy", background: "Boss Arena", boss: true },
    10: { title: "🛸 Fleet Commander", description: "You're leading the fleet now! Show your leadership!", objective: "Purchase 2 wingmen", target: 2, reward: "Fleet Commander + 200 coins", enemyType: "Fleet Attack", background: "Fleet Battle", boss: false },
    11: { title: "🌌 Galactic Hero", description: "You're becoming a legend! The galaxy needs you!", objective: "Destroy 50 enemy ships", target: 50, reward: "Galactic Hero + 250 coins", enemyType: "Elite Squadron", background: "Galactic Core", boss: false },
    12: { title: "🔥 BOSS BATTLE: Fire Lord", description: "The Fire Lord has appeared! This is an epic battle!", objective: "Defeat the Boss", target: 1, reward: "Fire Slayer + 400 coins", enemyType: "Boss Enemy", background: "Fire Realm", boss: true },
    13: { title: "⚡ Speed Demon", description: "Ultra-fast enemies! Can you keep up?", objective: "Destroy 60 enemy ships", target: 60, reward: "Speed Demon + 300 coins", enemyType: "Speed Fighters", background: "Speed Zone", boss: false },
    14: { title: "🛡️ Shield Master", description: "Enemies with shields! Break through their defenses!", objective: "Destroy 70 enemy ships", target: 70, reward: "Shield Master + 350 coins", enemyType: "Shielded Fighters", background: "Shield Zone", boss: false },
    15: { title: "👑 BOSS BATTLE: Space King", description: "The Space King himself! The ultimate challenge!", objective: "Defeat the Boss", target: 1, reward: "King Slayer + 500 coins", enemyType: "Boss Enemy", background: "Royal Arena", boss: true },
    16: { title: "🚀 Ultimate Squadron", description: "Build the ultimate squadron! Maximum firepower!", objective: "Purchase 4 wingmen", target: 4, reward: "Ultimate Commander + 400 coins", enemyType: "Ultimate Force", background: "Ultimate Zone", boss: false },
    17: { title: "💫 Star Legend", description: "You're a legend now! The final challenge awaits!", objective: "Destroy 100 enemy ships", target: 100, reward: "Star Legend + 500 coins", enemyType: "Legendary Force", background: "Legend Zone", boss: false },
    18: { title: "🌠 BOSS BATTLE: Cosmic Emperor", description: "The Cosmic Emperor! The most powerful enemy ever!", objective: "Defeat the Boss", target: 1, reward: "Emperor Slayer + 750 coins", enemyType: "Boss Enemy", background: "Cosmic Arena", boss: true },
    19: { title: "🏆 Championship", description: "The final championship! Prove you're the best!", objective: "Destroy 150 enemy ships", target: 150, reward: "Champion + 1000 coins", enemyType: "Championship Force", background: "Championship Arena", boss: false },
    20: { title: "👑 BOSS BATTLE: Galaxy Master", description: "The final boss! The Galaxy Master awaits! Can you become the ultimate hero?", objective: "Defeat the Final Boss", target: 1, reward: "Galaxy Master + 2000 coins", enemyType: "Final Boss", background: "Final Arena", boss: true }
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
    // Don't show if story notifications are disabled
    if (!storyNotificationsEnabled) return;
    
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
    
    // Shorter display time for less interference
    const displayTime = type === 'legend' ? 4000 : 3000;
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, displayTime);
}

function checkMissionProgress() {
    const mission = STORY_MISSIONS[currentMission];
    if (!mission) return;
    
    let missionComplete = false;
    
    if (mission.boss) {
        // Boss mission - check if boss is defeated
        const bossDefeated = !enemies.some(enemy => enemy.isBoss);
        if (bossDefeated && missionProgress >= mission.target) {
            missionComplete = true;
        }
    } else {
        // Regular mission - check target
        if (mission.objective.includes('Destroy')) {
            // Destroy mission
            if (missionProgress >= mission.target) {
                missionComplete = true;
            }
        } else if (mission.objective.includes('Purchase')) {
            // Purchase mission
            if (totalWingmenPurchased >= mission.target) {
                missionComplete = true;
            }
        }
    }
    
    if (missionComplete) {
        completeMission();
    }
}

function completeMission() {
    const mission = STORY_MISSIONS[currentMission];
    if (!mission) return;
    
    // Calculate rewards
    let coinReward = 0;
    if (mission.reward.includes('25 coins')) coinReward = 25;
    else if (mission.reward.includes('50 coins')) coinReward = 50;
    else if (mission.reward.includes('75 coins')) coinReward = 75;
    else if (mission.reward.includes('100 coins')) coinReward = 100;
    else if (mission.reward.includes('125 coins')) coinReward = 125;
    else if (mission.reward.includes('150 coins')) coinReward = 150;
    else if (mission.reward.includes('200 coins')) coinReward = 200;
    else if (mission.reward.includes('250 coins')) coinReward = 250;
    else if (mission.reward.includes('300 coins')) coinReward = 300;
    else if (mission.reward.includes('350 coins')) coinReward = 350;
    else if (mission.reward.includes('400 coins')) coinReward = 400;
    else if (mission.reward.includes('500 coins')) coinReward = 500;
    else if (mission.reward.includes('750 coins')) coinReward = 750;
    else if (mission.reward.includes('1000 coins')) coinReward = 1000;
    else if (mission.reward.includes('2000 coins')) coinReward = 2000;
    
    // Add rewards
    money += coinReward;
    score += coinReward * 10;
    
    // Show completion notification
    const title = mission.boss ? "🎉 BOSS MISSION COMPLETE!" : "🎉 MISSION COMPLETE!";
    const message = `${mission.title}\nReward: ${coinReward} coins`;
    showStoryNotification(title, message, 'achievement');
    
    // Update progress
    currentMission++;
    missionProgress = 0;
    
    // Save progress
    localStorage.setItem('spaceAdventuresCurrentMission', currentMission.toString());
    localStorage.setItem('spaceAdventuresMissionProgress', missionProgress.toString());
    localStorage.setItem('spaceAdventuresMoney', money.toString());
    
    // Check if all missions completed
    if (currentMission > 20) {
        showStoryNotification("🏆 GALAXY MASTER!", "You've completed all missions! You are the ultimate hero!", 'achievement');
        currentMission = 20; // Stay on final mission
    }
    
    // Reset enemies for next mission
    enemies = [];
    enemyBullets = [];
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
        // Toggle story notifications with 'T' key
        if (e.key === 't' || e.key === 'T') {
            storyNotificationsEnabled = !storyNotificationsEnabled;
            showNotification(`Story notifications: ${storyNotificationsEnabled ? 'ON' : 'OFF'}`, 'info');
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
    
    // Show story introduction only if it's the first time playing or mission just started
    const lastMissionShown = localStorage.getItem('spaceAdventuresLastMissionShown') || 0;
    if (currentMission <= 5 && currentMission > parseInt(lastMissionShown)) {
        const mission = STORY_MISSIONS[currentMission];
        setTimeout(() => {
            showStoryNotification(
                `🎖️ ${playerRank} - Mission ${currentMission}: ${mission.title}`,
                mission.description,
                'info'
            );
        }, 1000);
        localStorage.setItem('spaceAdventuresLastMissionShown', currentMission);
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
    const spawnRate = isMobile ? (window.enemySpawnRate || 0.02) : ENEMY_SPAWN_RATE;
    if (Math.random() < spawnRate) {
        const currentMission = STORY_MISSIONS[currentMission] || STORY_MISSIONS[1];
        const isBossMission = currentMission.boss;
        
        // Check if we should spawn a boss
        if (isBossMission && enemies.length === 0 && !enemies.some(e => e.isBoss)) {
            // Spawn boss enemy
            const bossEnemy = {
                x: Math.random() * (canvas.width - 80),
                y: -100,
                width: 120,
                height: 120,
                speed: 2,
                health: 50, // Boss has much more health
                maxHealth: 50,
                isBoss: true,
                bossType: currentMission.title.includes('Drone Commander') ? 'drone' :
                         currentMission.title.includes('Battle Cruiser') ? 'cruiser' :
                         currentMission.title.includes('Fire Lord') ? 'fire' :
                         currentMission.title.includes('Space King') ? 'king' :
                         currentMission.title.includes('Cosmic Emperor') ? 'emperor' :
                         currentMission.title.includes('Galaxy Master') ? 'galaxy' : 'boss',
                color: currentMission.title.includes('Fire Lord') ? '#ff4500' :
                       currentMission.title.includes('Space King') ? '#ffd700' :
                       currentMission.title.includes('Cosmic Emperor') ? '#9400d3' :
                       currentMission.title.includes('Galaxy Master') ? '#ff1493' : '#ff4444',
                shootCooldown: 0,
                lastShot: 0
            };
            enemies.push(bossEnemy);
            showStoryNotification("BOSS ALERT!", `A ${currentMission.title.split(':')[1] || 'Boss'} has appeared!`, 'boss');
            return;
        }
        
        // Spawn regular enemies
        const enemy = {
            x: Math.random() * (canvas.width - 40),
            y: -50,
            width: 40,
            height: 40,
            speed: ENEMY_SPEED + (level * 0.5),
            health: 1,
            maxHealth: 1,
            isBoss: false,
            color: ['#ff4444', '#ff8800', '#ff00ff', '#00ff00', '#0088ff'][Math.floor(Math.random() * 5)],
            shootCooldown: 0,
            lastShot: 0
        };
        enemies.push(enemy);
    }
}

function spawnPowerUp() {
    const spawnRate = isMobile ? (window.powerUpSpawnRate || 0.005) : POWERUP_SPAWN_RATE;
    if (Math.random() < spawnRate) {
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
    // Check bullet-enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], enemies[j])) {
                // Remove bullet
                bullets.splice(i, 1);
                
                // Damage enemy
                enemies[j].health--;
                
                // Check if enemy is destroyed
                if (enemies[j].health <= 0) {
                    const enemy = enemies[j];
                    const isBoss = enemy.isBoss;
                    
                    // Remove enemy
                    enemies.splice(j, 1);
                    
                    // Create explosion
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    
                    // Update score and money
                    if (isBoss) {
                        // Boss gives massive rewards
                        const bossReward = 100 + (level * 50);
                        score += bossReward;
                        money += bossReward;
                        showMoneyNotification(`+${bossReward}`, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        showStoryNotification("BOSS DEFEATED!", `You earned ${bossReward} coins!`, 'achievement');
                        playExplosionSound();
                    } else {
                        // Regular enemy rewards
                        const reward = 5 + Math.floor(Math.random() * 6); // 5-10 coins
                        score += 10;
                        money += reward;
                        showMoneyNotification(`+${reward}`, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        playMissileSound();
                    }
                    
                    // Update mission progress
                    totalEnemiesDestroyed++;
                    missionProgress++;
                    
                    break;
                }
                break;
            }
        }
    }
    
    // Check enemy bullet-player collisions
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        if (checkCollision(enemyBullets[i], player)) {
            enemyBullets.splice(i, 1);
            lives--;
            createExplosion(player.x + player.width / 2, player.y + player.height / 2);
            playExplosionSound();
            
            if (lives <= 0) {
                gameOver();
            }
        }
    }
    
    // Check enemy-player collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (checkCollision(enemies[i], player)) {
            enemies.splice(i, 1);
            lives--;
            createExplosion(player.x + player.width / 2, player.y + player.height / 2);
            playExplosionSound();
            
            if (lives <= 0) {
                gameOver();
            }
        }
    }
    
    // Check powerup collisions
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (checkCollision(powerUps[i], player)) {
            const powerUp = powerUps[i];
            powerUps.splice(i, 1);
            
            // Apply powerup effect
            if (powerUp.type === 'health') {
                lives = Math.min(lives + 5, 50);
                showNotification('Health restored! +5 lives', 'powerup');
            } else if (powerUp.type === 'weapon') {
                weaponLevel = Math.min(weaponLevel + 1, 6);
                showNotification('Weapon upgraded!', 'powerup');
            } else if (powerUp.type === 'shield') {
                player.shield = Math.min(player.shield + 50, 100);
                showNotification('Shield restored!', 'powerup');
            }
            
            playPowerUpSound();
        }
    }
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
    if (!scoreElement || !livesElement || !levelElement) return;
    
    // Update basic stats
    scoreElement.textContent = `Score: ${score}`;
    livesElement.textContent = `Lives: ${lives}`;
    levelElement.textContent = `Level: ${level}`;
    
    // Update money display
    const moneyElement = document.getElementById('money');
    if (moneyElement) {
        moneyElement.textContent = `💰 ${money}`;
    }
    
    // Update weapon level display
    const weaponElement = document.getElementById('weaponLevel');
    if (weaponElement) {
        weaponElement.textContent = `🔫 Weapon: ${weaponLevel}`;
    }
    
    // Update wingman count display
    const wingmanElement = document.getElementById('wingmanCount');
    if (wingmanElement) {
        wingmanElement.textContent = `🛩️ Wingmen: ${wingmanCount}/${MAX_WINGMEN}`;
    }
    
    // Update high score display
    const highScoreElement = document.getElementById('highScore');
    if (highScoreElement) {
        highScoreElement.textContent = `🏆 High Score: ${highScore}`;
    }
    
    // Update sound status
    const soundElement = document.getElementById('soundStatus');
    if (soundElement) {
        soundElement.textContent = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    }
    
    // Update current mission display
    const missionElement = document.getElementById('currentMission');
    if (missionElement) {
        const mission = STORY_MISSIONS[currentMission];
        if (mission) {
            const progress = mission.boss ? 
                (enemies.some(e => e.isBoss) ? 'Boss Active!' : 'Boss Defeated!') :
                `${missionProgress}/${mission.target}`;
            
            missionElement.innerHTML = `
                <div class="mission-info">
                    <div class="mission-title">${mission.title}</div>
                    <div class="mission-objective">${mission.objective}</div>
                    <div class="mission-progress">Progress: ${progress}</div>
                </div>
            `;
        }
    }
    
    // Update character info
    const characterElement = document.getElementById('characterInfo');
    if (characterElement) {
        const character = CHARACTERS[selectedCharacter];
        if (character) {
            characterElement.innerHTML = `
                <div class="character-info">
                    <div class="character-name">${character.name}</div>
                    <div class="character-ability">${character.specialAbility}</div>
                </div>
            `;
        }
    }
    
    // Update shield display
    const shieldElement = document.getElementById('shieldLevel');
    if (shieldElement) {
        shieldElement.textContent = `🛡️ Shield: ${Math.round(player.shield)}%`;
    }
    
    // Update pause status
    const pauseElement = document.getElementById('pauseStatus');
    if (pauseElement) {
        pauseElement.textContent = gameState === 'paused' ? '⏸️ PAUSED' : '';
    }
    
    // Update mobile detection indicator
    const mobileIndicator = document.getElementById('mobileIndicator');
    if (mobileIndicator) {
        if (isMobile) {
            mobileIndicator.textContent = '📱 Mobile Mode';
            mobileIndicator.style.display = 'block';
        } else {
            mobileIndicator.style.display = 'none';
        }
    }
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
    const character = CHARACTERS[player.character];
    
    // Sleek triangle fighter jet design
    ctx.fillStyle = character.color;
    
    // Main triangle body
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 10); // Top point
    ctx.lineTo(x + 10, y + 50); // Bottom left
    ctx.lineTo(x + 50, y + 50); // Bottom right
    ctx.closePath();
    ctx.fill();
    
    // Cockpit (darker shade)
    ctx.fillStyle = "#1a1a2e";
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 15);
    ctx.lineTo(x + 20, y + 35);
    ctx.lineTo(x + 40, y + 35);
    ctx.closePath();
    ctx.fill();
    
    // Wing tips with missile rails
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 5, y + 30, 8, 4);  // Left missile rail
    ctx.fillRect(x + 47, y + 30, 8, 4); // Right missile rail
    
    // Engine exhausts (orange glow)
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(x + 20, y + 45, 6, 8);
    ctx.fillRect(x + 34, y + 45, 6, 8);
    ctx.shadowBlur = 0;
    
    // Side weapon pods
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(x + 8, y + 25, 4, 6);   // Left weapon pod
    ctx.fillRect(x + 48, y + 25, 4, 6);  // Right weapon pod
    
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
    
    // Wingman triangle fighter jet design
    ctx.fillStyle = "#00ff00";
    
    // Main triangle body (smaller than player)
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 8);  // Top point
    ctx.lineTo(x + 8, y + 32);  // Bottom left
    ctx.lineTo(x + 32, y + 32); // Bottom right
    ctx.closePath();
    ctx.fill();
    
    // Cockpit (darker shade)
    ctx.fillStyle = "#1a1a2e";
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 12);
    ctx.lineTo(x + 14, y + 24);
    ctx.lineTo(x + 26, y + 24);
    ctx.closePath();
    ctx.fill();
    
    // Wing tips with missile rails
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 4, y + 20, 6, 3);   // Left missile rail
    ctx.fillRect(x + 30, y + 20, 6, 3);  // Right missile rail
    
    // Engine exhausts (green glow)
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(x + 14, y + 28, 4, 6);
    ctx.fillRect(x + 22, y + 28, 4, 6);
    ctx.shadowBlur = 0;
    
    // Side weapon pods
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(x + 6, y + 16, 3, 4);   // Left weapon pod
    ctx.fillRect(x + 31, y + 16, 3, 4);  // Right weapon pod
    
    // Formation indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(wingman.formation, x + 20, y + 38);
}

function drawEnemy(enemy) {
    if (!enemy) return;
    
    ctx.save();
    
    if (enemy.isBoss) {
        // Draw boss enemy with epic design
        const centerX = enemy.x + enemy.width / 2;
        const centerY = enemy.y + enemy.height / 2;
        
        // Boss glow effect
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 20;
        ctx.lineWidth = 3;
        
        // Draw boss triangle (larger and more detailed)
        ctx.beginPath();
        ctx.moveTo(centerX, enemy.y + 10);
        ctx.lineTo(enemy.x + 10, enemy.y + enemy.height - 10);
        ctx.lineTo(enemy.x + enemy.width - 10, enemy.y + enemy.height - 10);
        ctx.closePath();
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        
        // Boss weapon pods
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x + 15, enemy.y + enemy.height - 25, 8, 15);
        ctx.fillRect(enemy.x + enemy.width - 23, enemy.y + enemy.height - 25, 8, 15);
        
        // Boss cockpit
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Boss health bar
        const healthBarWidth = enemy.width;
        const healthBarHeight = 8;
        const healthPercentage = enemy.health / enemy.maxHealth;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x, enemy.y - 15, healthBarWidth, healthBarHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x, enemy.y - 15, healthBarWidth * healthPercentage, healthBarHeight);
        
        // Boss label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', centerX, enemy.y - 20);
        
        // Boss special effects
        if (enemy.bossType === 'fire') {
            // Fire effects
            ctx.fillStyle = '#ff6600';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(centerX + (Math.random() - 0.5) * 20, enemy.y + enemy.height + Math.random() * 10, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (enemy.bossType === 'king') {
            // Crown effect
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(centerX - 15, enemy.y - 5, 30, 8);
            ctx.fillRect(centerX - 10, enemy.y - 12, 20, 8);
            ctx.fillRect(centerX - 5, enemy.y - 19, 10, 8);
        }
        
    } else {
        // Draw regular enemy triangle fighter jet
        const centerX = enemy.x + enemy.width / 2;
        const centerY = enemy.y + enemy.height / 2;
        
        // Main triangle body
        ctx.beginPath();
        ctx.moveTo(centerX, enemy.y + 5);
        ctx.lineTo(enemy.x + 5, enemy.y + enemy.height - 5);
        ctx.lineTo(enemy.x + enemy.width - 5, enemy.y + enemy.height - 5);
        ctx.closePath();
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Weapon pods
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x + 8, enemy.y + enemy.height - 15, 6, 10);
        ctx.fillRect(enemy.x + enemy.width - 14, enemy.y + enemy.height - 15, 6, 10);
        
        // Cockpit
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Exhaust trails
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(enemy.x + 12, enemy.y + enemy.height, 4, 8);
        ctx.fillRect(enemy.x + enemy.width - 16, enemy.y + enemy.height, 4, 8);
    }
    
    ctx.restore();
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
    const starCount = isMobile ? (window.maxStars || 25) : 50;
    for (let i = 0; i < starCount; i++) {
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
    
    if (isMobile) {
        ctx.font = '20px Arial';
        ctx.fillText('Tap to Resume', canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '16px Arial';
        ctx.fillText('Double tap for Special Ability', canvas.width / 2, canvas.height / 2 + 50);
    } else {
        ctx.font = '24px Arial';
        ctx.fillText('Press P to Resume', canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '18px Arial';
        ctx.fillText('Press Q for Special Ability', canvas.width / 2, canvas.height / 2 + 60);
    }
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

// Touch controls for mobile devices
let touchControls = {
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isShooting: false,
    shootInterval: null,
    lastTapTime: 0,
    tapCount: 0
};

// Initialize touch controls
function initTouchControls() {
    if (!canvas) return;
    
    // Touch start
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (gameState !== 'playing') return;
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const currentTime = Date.now();
        
        // Check for double tap
        if (currentTime - touchControls.lastTapTime < 300) {
            touchControls.tapCount++;
            if (touchControls.tapCount === 2) {
                // Double tap detected - activate special ability
                activateSpecialAbility();
                touchControls.tapCount = 0;
                return;
            }
        } else {
            touchControls.tapCount = 1;
        }
        touchControls.lastTapTime = currentTime;
        
        touchControls.isActive = true;
        touchControls.startX = touch.clientX - rect.left;
        touchControls.startY = touch.clientY - rect.top;
        touchControls.currentX = touchControls.startX;
        touchControls.currentY = touchControls.startY;
        
        // Start shooting on touch
        if (!touchControls.isShooting) {
            touchControls.isShooting = true;
            touchControls.shootInterval = setInterval(() => {
                if (gameState === 'playing' && touchControls.isShooting) {
                    shoot();
                }
            }, 200); // Shoot every 200ms while touching
        }
    }, { passive: false });
    
    // Touch move
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (gameState !== 'playing' || !touchControls.isActive) return;
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        touchControls.currentX = touch.clientX - rect.left;
        touchControls.currentY = touch.clientY - rect.top;
        
        // Update player position based on touch
        const canvasScaleX = canvas.width / rect.width;
        const canvasScaleY = canvas.height / rect.height;
        
        player.x = (touchControls.currentX * canvasScaleX) - (player.width / 2);
        player.y = (touchControls.currentY * canvasScaleY) - (player.height / 2);
        
        // Keep player within bounds
        player.x = Math.max(PLAYER_MARGIN, Math.min(canvas.width - player.width - PLAYER_MARGIN, player.x));
        player.y = Math.max(PLAYER_MARGIN, Math.min(canvas.height - player.height - PLAYER_MARGIN, player.y));
    }, { passive: false });
    
    // Touch end
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        if (gameState !== 'playing') return;
        
        touchControls.isActive = false;
        touchControls.isShooting = false;
        
        if (touchControls.shootInterval) {
            clearInterval(touchControls.shootInterval);
            touchControls.shootInterval = null;
        }
    }, { passive: false });
    
    // Prevent context menu on long press
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    console.log('Touch controls initialized for mobile devices');
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
    
    // Initialize touch controls for mobile devices
    initTouchControls();
    
    // Set up character selection
    setupCharacterSelection();
    
    // Set up tab navigation
    setupTabNavigation();
    
    console.log('=== GAME INITIALIZATION COMPLETE ===');
    resizeCanvas();
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

// Mobile device detection and optimization
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// Optimize for mobile devices
if (isMobile) {
    console.log('Mobile device detected, optimizing game...');
    
    // Reduce particle effects for better performance
    const MOBILE_OPTIMIZATIONS = {
        maxStars: 25, // Reduced from 50
        maxExplosions: 5, // Reduced from 10
        bulletSpeed: 10, // Slightly reduced
        enemySpawnRate: 0.02, // Reduced from 0.03
        powerUpSpawnRate: 0.005 // Reduced from 0.008
    };
    
    // Apply mobile optimizations
    Object.assign(window, MOBILE_OPTIMIZATIONS);
}

if (isIOS) {
    console.log('iOS device detected, applying iOS-specific optimizations...');
    
    // iOS-specific optimizations
    document.addEventListener('touchstart', function(e) {
        // Prevent zoom on double tap
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent pull-to-refresh
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
} 

// Dynamic canvas resizing for responsive game
function resizeCanvas() {
    if (!canvas) return;
    if (window.innerWidth < 1000) {
        canvas.width = window.innerWidth;
        canvas.height = Math.max(window.innerHeight * 0.7, 250); // 70% of height, min 250px
    } else {
        canvas.width = 800;
        canvas.height = 600;
    }
    // Optionally, re-render or adjust game elements here
    render();
}

// Listen for resize and orientation changes
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

document.addEventListener('DOMContentLoaded', () => {
    // Wait for canvas to be available
    setTimeout(resizeCanvas, 100);
});

// Also call after initializing game elements
// (add this at the end of initializeGameElements)
// resizeCanvas();