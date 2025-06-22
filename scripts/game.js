        // Game variables
        let player = document.getElementById('player');
        let gameContainer = document.getElementById('gameContainer');
        let scoreElement = document.getElementById('score');
        let timerElement = document.getElementById('timer');
        let gameOverScreen = document.getElementById('gameOver');
        let startScreen = document.getElementById('startScreen');
        let finalScoreElement = document.getElementById('finalScore');
        
        let score = 0;
        let timeLeft = 60;
        let gameRunning = false;
        let playerX = 370;
        let coins = [];
        let sharks = [];
        let missiles = [];
        let gameInterval;
        let coinInterval;
        let sharkInterval;
        let missileInterval;
        let timerInterval;
        let selectedCharacter = 'spaceship';
        let achievements = [];
        let gamePaused = false;
        let savedGame = null;
        
        // Audio system
        let audioContext;
        let sounds = {};
        let backgroundMusic;
        let soundEnabled = true;
        
        // Power-ups system
        let powerUps = [];
        let activePowerUps = {
            speedBoost: false,
            shield: false,
            multiShot: false,
            timeFreeze: false,
            autoAim: false
        };
        let powerUpTimers = {};
        
        // Game constants
        const PLAYER_SPEED = 35;
        const COIN_SPEED = 3;
        const SHARK_SPEED = 4;
        const MISSILE_SPEED = 8;
        const POWERUP_SPEED = 2;
        let GAME_WIDTH = 800;
        let GAME_HEIGHT = 600;
        const PLAYER_WIDTH = 60;
        const COIN_WIDTH = 40;
        const SHARK_WIDTH = 40;
        const MISSILE_WIDTH = 8;
        const MISSILE_HEIGHT = 20;
        const POWERUP_WIDTH = 40;
        
        // Update game dimensions based on actual container size
        function updateGameDimensions() {
            const container = document.getElementById('gameContainer');
            GAME_WIDTH = container.offsetWidth;
            GAME_HEIGHT = container.offsetHeight;
        }
        
        // Initialize audio system
        function initAudio() {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                createSounds();
            } catch (e) {
                console.log('Audio not supported');
                soundEnabled = false;
            }
        }
        
        // Create sound effects
        function createSounds() {
            // Coin collection sound
            sounds.coin = createTone(800, 0.1, 'sine');
            
            // Missile firing sound
            sounds.missile = createTone(400, 0.05, 'square');
            
            // Explosion sound
            sounds.explosion = createTone(200, 0.2, 'sawtooth');
            
            // Power-up sound
            sounds.powerup = createTone(600, 0.15, 'triangle');
            
            // Achievement sound
            sounds.achievement = createTone(1000, 0.3, 'sine');
            
            // Shark bite sound
            sounds.sharkBite = createTone(150, 0.4, 'sawtooth');
        }
        
        // Create a simple tone
        function createTone(frequency, duration, type) {
            return function() {
                if (!soundEnabled || !audioContext) return;
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            };
        }
        
        // Play sound effect
        function playSound(soundName) {
            if (sounds[soundName]) {
                sounds[soundName]();
            }
        }
        
        // Achievement definitions
        const ACHIEVEMENTS = [
            { coins: 5, title: "Coin Collector", emoji: "🪙", message: "You collected 5 coins!" },
            { coins: 10, title: "Coin Master", emoji: "💰", message: "You collected 10 coins!" },
            { coins: 20, title: "Coin Champion", emoji: "🏆", message: "You collected 20 coins!" },
            { coins: 30, title: "Coin Legend", emoji: "👑", message: "You collected 30 coins!" },
            { coins: 50, title: "Coin God", emoji: "⭐", message: "You collected 50 coins!" }
        ];
        
        // Power-up definitions
        const POWERUP_TYPES = [
            { type: 'speed', name: 'Speed Boost', duration: 10000, emoji: '⚡' },
            { type: 'shield', name: 'Shield', duration: 8000, emoji: '🛡️' },
            { type: 'multishot', name: 'Multi-Shot', duration: 12000, emoji: '🎯' },
            { type: 'timefreeze', name: 'Time Freeze', duration: 6000, emoji: '⏰' },
            { type: 'autoaim', name: 'Auto-Aim', duration: 15000, emoji: '🎯' }
        ];
        
        // Save game data to localStorage
        function saveGame() {
            const gameData = {
                score: score,
                timeLeft: timeLeft,
                playerX: playerX,
                selectedCharacter: selectedCharacter,
                achievements: achievements,
                timestamp: Date.now()
            };
            
            localStorage.setItem('kaydenAdelynnCoinCatcher', JSON.stringify(gameData));
            
            // Show save confirmation
            const saveBtn = document.getElementById('saveBtn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '✅ Saved!';
            saveBtn.style.background = '#4CAF50';
            
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = '#4ECDC4';
            }, 2000);
        }
        
        // Load saved game data
        function loadSavedGame() {
            const saved = localStorage.getItem('kaydenAdelynnCoinCatcher');
            if (saved) {
                try {
                    savedGame = JSON.parse(saved);
                    return true;
                } catch (e) {
                    console.error('Error loading saved game:', e);
                }
            }
            return false;
        }
        
        // Check if there's a saved game
        function hasSavedGame() {
            return loadSavedGame();
        }
        
        // Initialize game
        function initGame() {
            score = 0;
            timeLeft = 60;
            playerX = 370;
            coins = [];
            sharks = [];
            missiles = [];
            powerUps = [];
            achievements = [];
            gamePaused = false;
            
            // Reset power-ups
            Object.keys(activePowerUps).forEach(key => {
                activePowerUps[key] = false;
                if (powerUpTimers[key]) {
                    clearTimeout(powerUpTimers[key]);
                    delete powerUpTimers[key];
                }
            });
            
            // Load saved game if available
            if (savedGame) {
                score = savedGame.score;
                timeLeft = savedGame.timeLeft;
                playerX = savedGame.playerX;
                selectedCharacter = savedGame.selectedCharacter;
                achievements = savedGame.achievements;
                savedGame = null; // Clear saved game after loading
            }
            
            updateGameDimensions();
            
            document.querySelectorAll('.coin').forEach(coin => coin.remove());
            document.querySelectorAll('.shark').forEach(shark => shark.remove());
            document.querySelectorAll('.missile').forEach(missile => missile.remove());
            document.querySelectorAll('.powerup').forEach(powerup => powerup.remove());
            
            scoreElement.textContent = `Score: ${score}`;
            timerElement.textContent = `Time: ${timeLeft}`;
            
            updatePlayerCharacter();
            updatePowerupIndicator();
            
            player.style.left = playerX + 'px';
            
            gameOverScreen.style.display = 'none';
            startScreen.style.display = 'none';
            document.getElementById('pauseMenu').style.display = 'none';
            
            gameRunning = true;
        }
        
        // Update player character appearance
        function updatePlayerCharacter() {
            let characterEmoji, backgroundColor, borderColor;
            
            switch(selectedCharacter) {
                case 'boy':
                    characterEmoji = '👦';
                    backgroundColor = '#FF6B6B';
                    borderColor = '#FF4757';
                    break;
                case 'girl':
                    characterEmoji = '👧';
                    backgroundColor = '#FF69B4';
                    borderColor = '#FF1493';
                    break;
                case 'car':
                    characterEmoji = '🚗';
                    backgroundColor = '#FF4500';
                    borderColor = '#FF6347';
                    break;
                case 'spaceship':
                    characterEmoji = '🚀';
                    backgroundColor = '#4169E1';
                    borderColor = '#1E90FF';
                    break;
                case 'army':
                    characterEmoji = '🪖';
                    backgroundColor = '#228B22';
                    borderColor = '#32CD32';
                    break;
                case 'barbie':
                    characterEmoji = '👸';
                    backgroundColor = '#FFB6C1';
                    borderColor = '#FF69B4';
                    break;
                default:
                    characterEmoji = '👦';
                    backgroundColor = '#FF6B6B';
                    borderColor = '#FF4757';
            }
            
            player.style.setProperty('--character-emoji', `"${characterEmoji}"`);
            player.style.backgroundColor = backgroundColor;
            player.style.borderColor = borderColor;
            player.setAttribute('data-character', selectedCharacter);
        }
        
        // Start game
        function startGame() {
            initGame();
            initAudio();
            
            gameInterval = setInterval(gameLoop, 16);
            coinInterval = setInterval(spawnCoin, 1000);
            sharkInterval = setInterval(spawnShark, 3000);
            setInterval(spawnPowerup, 8000); // Spawn power-ups every 8 seconds
            timerInterval = setInterval(updateTimer, 1000);
        }
        
        // Game loop
        function gameLoop() {
            if (!gameRunning) return;
            
            updateCoins();
            updateSharks();
            updateMissiles();
            updatePowerups();
            checkCollisions();
        }
        
        // Spawn a new coin
        function spawnCoin() {
            if (!gameRunning) return;
            
            const coin = document.createElement('div');
            coin.className = 'coin';
            coin.style.left = Math.random() * (GAME_WIDTH - COIN_WIDTH) + 'px';
            coin.style.top = '-40px';
            gameContainer.appendChild(coin);
            
            coins.push({
                element: coin,
                x: parseInt(coin.style.left),
                y: -40
            });
        }
        
        // Spawn a new shark
        function spawnShark() {
            if (!gameRunning) return;
            
            const shark = document.createElement('div');
            shark.className = 'shark';
            shark.style.left = Math.random() * (GAME_WIDTH - SHARK_WIDTH) + 'px';
            shark.style.top = '-40px';
            gameContainer.appendChild(shark);
            
            sharks.push({
                element: shark,
                x: parseInt(shark.style.left),
                y: -40
            });
        }
        
        // Fire missile
        function fireMissile() {
            if (!gameRunning || gamePaused) return;
            
            playSound('missile');
            
            // Multi-shot power-up
            if (activePowerUps.multishot) {
                // Fire 3 missiles in a spread pattern
                for (let i = -1; i <= 1; i++) {
                    createMissile(playerX + PLAYER_WIDTH/2 + (i * 10), GAME_HEIGHT - 80, i * 0.3);
                }
            } else {
                createMissile(playerX + PLAYER_WIDTH/2, GAME_HEIGHT - 80, 0);
            }
        }
        
        // Create missile
        function createMissile(x, y, angleOffset = 0) {
            const missile = document.createElement('div');
            missile.className = 'missile';
            missile.style.left = x + 'px';
            missile.style.top = y + 'px';
            gameContainer.appendChild(missile);
            
            missiles.push({
                element: missile,
                x: x,
                y: y,
                angleOffset: angleOffset
            });
        }
        
        // Update missile positions
        function updateMissiles() {
            for (let i = missiles.length - 1; i >= 0; i--) {
                const missile = missiles[i];
                
                // Auto-aim power-up: missiles track nearest shark
                if (activePowerUps.autoaim && sharks.length > 0) {
                    const nearestShark = findNearestShark(missile.x, missile.y);
                    if (nearestShark) {
                        const dx = nearestShark.x - missile.x;
                        const dy = nearestShark.y - missile.y;
                        const angle = Math.atan2(dy, dx);
                        missile.x += Math.cos(angle) * MISSILE_SPEED;
                        missile.y += Math.sin(angle) * MISSILE_SPEED;
                    } else {
                        missile.y -= MISSILE_SPEED;
                    }
                } else {
                    // Normal missile movement with angle offset
                    missile.x += missile.angleOffset * MISSILE_SPEED;
                    missile.y -= MISSILE_SPEED;
                }
                
                missile.element.style.left = missile.x + 'px';
                missile.element.style.top = missile.y + 'px';
                
                if (missile.y < -MISSILE_HEIGHT || missile.x < -MISSILE_WIDTH || missile.x > GAME_WIDTH) {
                    missile.element.remove();
                    missiles.splice(i, 1);
                }
            }
        }
        
        // Find nearest shark for auto-aim
        function findNearestShark(missileX, missileY) {
            let nearest = null;
            let minDistance = Infinity;
            
            sharks.forEach(shark => {
                const distance = Math.sqrt((shark.x - missileX) ** 2 + (shark.y - missileY) ** 2);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = shark;
                }
            });
            
            return nearest;
        }
        
        // Update coin positions
        function updateCoins() {
            for (let i = coins.length - 1; i >= 0; i--) {
                const coin = coins[i];
                coin.y += COIN_SPEED;
                coin.element.style.top = coin.y + 'px';
                
                if (coin.y > GAME_HEIGHT) {
                    coin.element.remove();
                    coins.splice(i, 1);
                }
            }
        }
        
        // Update shark positions
        function updateSharks() {
            for (let i = sharks.length - 1; i >= 0; i--) {
                const shark = sharks[i];
                shark.y += SHARK_SPEED;
                shark.element.style.top = shark.y + 'px';
                
                if (shark.y > GAME_HEIGHT) {
                    shark.element.remove();
                    sharks.splice(i, 1);
                }
            }
        }
        
        // Check collisions
        function checkCollisions() {
            const playerRect = player.getBoundingClientRect();
            
            // Check coin collisions
            for (let i = coins.length - 1; i >= 0; i--) {
                const coin = coins[i];
                const coinRect = coin.element.getBoundingClientRect();
                
                if (playerRect.left < coinRect.right && 
                    playerRect.right > coinRect.left && 
                    playerRect.top < coinRect.bottom && 
                    playerRect.bottom > coinRect.top) {
                    
                    coin.element.remove();
                    coins.splice(i, 1);
                    score += 10;
                    scoreElement.textContent = `Score: ${score}`;
                    playSound('coin');
                    checkAchievements();
                }
            }
            
            // Check power-up collisions
            for (let i = powerUps.length - 1; i >= 0; i--) {
                const powerup = powerUps[i];
                const powerupRect = powerup.element.getBoundingClientRect();
                
                if (playerRect.left < powerupRect.right && 
                    playerRect.right > powerupRect.left && 
                    playerRect.top < powerupRect.bottom && 
                    playerRect.bottom > powerupRect.top) {
                    
                    powerup.element.remove();
                    powerUps.splice(i, 1);
                    activatePowerup(powerup);
                }
            }
            
            // Check shark collisions (unless shield is active)
            if (!activePowerUps.shield) {
                for (let i = sharks.length - 1; i >= 0; i--) {
                    const shark = sharks[i];
                    const sharkRect = shark.element.getBoundingClientRect();
                    
                    if (playerRect.left < sharkRect.right && 
                        playerRect.right > sharkRect.left && 
                        playerRect.top < sharkRect.bottom && 
                        playerRect.bottom > sharkRect.top) {
                        
                        playSound('sharkBite');
                        gameOver();
                        return;
                    }
                }
            }
            
            // Check missile collisions with sharks
            for (let i = missiles.length - 1; i >= 0; i--) {
                const missile = missiles[i];
                const missileRect = missile.element.getBoundingClientRect();
                
                for (let j = sharks.length - 1; j >= 0; j--) {
                    const shark = sharks[j];
                    const sharkRect = shark.element.getBoundingClientRect();
                    
                    if (missileRect.left < sharkRect.right && 
                        missileRect.right > sharkRect.left && 
                        missileRect.top < sharkRect.bottom && 
                        missileRect.bottom > sharkRect.top) {
                        
                        // Remove missile and shark
                        missile.element.remove();
                        missiles.splice(i, 1);
                        shark.element.remove();
                        sharks.splice(j, 1);
                        
                        playSound('explosion');
                        addExplosion(shark.x, shark.y);
                        score += 20;
                        scoreElement.textContent = `Score: ${score}`;
                        break;
                    }
                }
            }
        }
        
        // Add sparkle effect when coin is collected
        function addSparkle(x, y) {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'absolute';
            sparkle.style.left = x + 'px';
            sparkle.style.top = y + 'px';
            sparkle.style.fontSize = '30px';
            sparkle.style.color = '#FFD700';
            sparkle.style.zIndex = '8';
            sparkle.textContent = '✨';
            sparkle.style.animation = 'sparkle 0.5s ease-out forwards';
            gameContainer.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 500);
        }
        
        // Add shark bite effect when player hits shark
        function addSharkBite(x, y) {
            const bite = document.createElement('div');
            bite.style.position = 'absolute';
            bite.style.left = x + 'px';
            bite.style.top = y + 'px';
            bite.style.fontSize = '40px';
            bite.style.color = '#FF0000';
            bite.style.zIndex = '8';
            bite.textContent = '🦈';
            bite.style.animation = 'sharkBite 1s ease-out forwards';
            gameContainer.appendChild(bite);
            
            setTimeout(() => bite.remove(), 1000);
        }
        
        // Create particle explosion effect
        function createExplosion(x, y, color = '#FFD700') {
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.background = color;
                particle.style.transform = `translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px)`;
                gameContainer.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 1000);
            }
        }
        
        // Enhanced explosion effect
        function addExplosion(x, y) {
            createExplosion(x, y, '#FF6B6B');
        }
        
        // Check for achievements
        function checkAchievements() {
            ACHIEVEMENTS.forEach(achievement => {
                if (score >= achievement.coins * 10 && !achievements.includes(achievement.title)) {
                    achievements.push(achievement.title);
                    showAchievement(achievement);
                    playSound('achievement');
                }
            });
        }
        
        // Show achievement notification
        function showAchievement(achievement) {
            const achievementElement = document.getElementById('achievement');
            const achievementEmoji = achievementElement.querySelector('.achievementEmoji');
            const achievementText = document.getElementById('achievementText');
            
            achievementEmoji.textContent = achievement.emoji;
            achievementText.textContent = achievement.message;
            
            achievementElement.style.display = 'block';
            
            setTimeout(() => {
                achievementElement.style.display = 'none';
            }, 2000);
        }
        
        // Update timer
        function updateTimer() {
            if (!gameRunning || gamePaused) return;
            
            // Time freeze power-up stops the timer
            if (!activePowerUps.timefreeze) {
                timeLeft--;
                timerElement.textContent = `Time: ${timeLeft}`;
                
                if (timeLeft <= 0) {
                    gameOver();
                }
            }
        }
        
        // End game
        function endGame() {
            gameRunning = false;
            clearInterval(gameInterval);
            clearInterval(coinInterval);
            clearInterval(sharkInterval);
            clearInterval(timerInterval);
            
            finalScoreElement.textContent = score;
            gameOverScreen.style.display = 'block';
        }
        
        // Resume game
        function resumeGame() {
            gamePaused = false;
            document.getElementById('pauseMenu').style.display = 'none';
            
            gameInterval = setInterval(gameLoop, 16);
            coinInterval = setInterval(spawnCoin, 1000);
            sharkInterval = setInterval(spawnShark, 3000);
            timerInterval = setInterval(updateTimer, 1000);
        }
        
        // Pause game
        function pauseGame() {
            if (!gameRunning) return;
            
            gamePaused = true;
            gameRunning = false;
            clearInterval(gameInterval);
            clearInterval(coinInterval);
            clearInterval(sharkInterval);
            clearInterval(timerInterval);
            
            // Update pause menu info
            document.getElementById('pauseScore').textContent = score;
            document.getElementById('pauseTime').textContent = timeLeft;
            
            document.getElementById('pauseMenu').style.display = 'block';
        }
        
        // Quit game
        function quitGame() {
            gameRunning = false;
            gamePaused = false;
            clearInterval(gameInterval);
            clearInterval(coinInterval);
            clearInterval(sharkInterval);
            clearInterval(timerInterval);
            
            // Clear saved game
            localStorage.removeItem('kaydenAdelynnCoinCatcher');
            
            gameOverScreen.style.display = 'none';
            startScreen.style.display = 'block';
            document.getElementById('pauseMenu').style.display = 'none';
            
            // Reset game state
            score = 0;
            timeLeft = 60;
            playerX = 370;
            coins = [];
            sharks = [];
            missiles = [];
            achievements = [];
            
            scoreElement.textContent = `Score: ${score}`;
            timerElement.textContent = `Time: ${timeLeft}`;
            player.style.left = playerX + 'px';
            
            // Clear coins, sharks, and missiles
            document.querySelectorAll('.coin').forEach(coin => coin.remove());
            document.querySelectorAll('.shark').forEach(shark => shark.remove());
            document.querySelectorAll('.missile').forEach(missile => missile.remove());
        }
        
        // Handle keyboard input
        document.addEventListener('keydown', (e) => {
            if (!gameRunning) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    playerX = Math.max(0, playerX - PLAYER_SPEED);
                    player.style.left = playerX + 'px';
                    break;
                case 'ArrowRight':
                    playerX = Math.min(GAME_WIDTH - PLAYER_WIDTH, playerX + PLAYER_SPEED);
                    player.style.left = playerX + 'px';
                    break;
                case 'Space':
                    fireMissile();
                    break;
            }
        });
        
        // Touch/mouse controls for mobile
        let isDragging = false;
        
        gameContainer.addEventListener('mousedown', (e) => {
            if (!gameRunning) return;
            isDragging = true;
            handleTouch(e);
        });
        
        gameContainer.addEventListener('mousemove', (e) => {
            if (!gameRunning || !isDragging) return;
            handleTouch(e);
        });
        
        gameContainer.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        gameContainer.addEventListener('touchstart', (e) => {
            if (!gameRunning) return;
            e.preventDefault();
            handleTouch(e.touches[0]);
        });
        
        gameContainer.addEventListener('touchmove', (e) => {
            if (!gameRunning) return;
            e.preventDefault();
            handleTouch(e.touches[0]);
        });
        
        function handleTouch(e) {
            const rect = gameContainer.getBoundingClientRect();
            const touchX = e.clientX - rect.left;
            playerX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, touchX - PLAYER_WIDTH/2));
            player.style.left = playerX + 'px';
        }
        
        // Character selection
        document.querySelectorAll('.character').forEach(char => {
            char.addEventListener('click', function() {
                document.querySelectorAll('.character').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedCharacter = this.getAttribute('data-char');
            });
        });
        
        // Initialize with spaceship character selected
        document.querySelector('.character[data-char="spaceship"]').classList.add('selected');
        document.getElementById('startBtn').disabled = false;
        
        // Button event listeners
        document.getElementById('startBtn').addEventListener('click', startGame);
        document.getElementById('restartBtn').addEventListener('click', startGame);
        
        // Pause button event listener
        document.getElementById('pauseBtn').addEventListener('click', togglePause);
        
        // Sound toggle event listener
        document.getElementById('soundToggle').addEventListener('click', toggleSound);
        
        // Pause menu event listeners
        document.getElementById('resumeBtn').addEventListener('click', togglePause);
        document.getElementById('saveBtn').addEventListener('click', saveGame);
        document.getElementById('quitBtn').addEventListener('click', quitGame);
        
        // Load saved game button
        document.getElementById('loadSavedGame').addEventListener('click', () => {
            if (hasSavedGame()) {
                loadSavedGame();
                startGame();
            }
        });
        
        // Check for saved game on page load
        function checkForSavedGame() {
            if (hasSavedGame()) {
                document.getElementById('loadSavedGame').style.display = 'inline-block';
                document.getElementById('savedGameInfo').style.display = 'block';
                document.getElementById('savedScore').textContent = savedGame.score;
                document.getElementById('savedTime').textContent = savedGame.timeLeft;
            }
        }
        
        // Initialize saved game check
        checkForSavedGame();
        
        // Prevent context menu on right click
        gameContainer.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Add sparkle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes sparkle {
                0% { transform: scale(0) rotate(0deg); opacity: 1; }
                50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
                100% { transform: scale(2) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Spawn a power-up
        function spawnPowerup() {
            if (!gameRunning) return;
            
            const powerupType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
            const powerup = document.createElement('div');
            powerup.className = `powerup ${powerupType.type}`;
            powerup.style.left = Math.random() * (GAME_WIDTH - POWERUP_WIDTH) + 'px';
            powerup.style.top = '-40px';
            gameContainer.appendChild(powerup);
            
            powerUps.push({
                element: powerup,
                x: parseInt(powerup.style.left),
                y: -40,
                type: powerupType.type,
                name: powerupType.name,
                duration: powerupType.duration,
                emoji: powerupType.emoji
            });
        }
        
        // Update power-up positions
        function updatePowerups() {
            for (let i = powerUps.length - 1; i >= 0; i--) {
                const powerup = powerUps[i];
                powerup.y += POWERUP_SPEED;
                powerup.element.style.top = powerup.y + 'px';
                
                if (powerup.y > GAME_HEIGHT) {
                    powerup.element.remove();
                    powerUps.splice(i, 1);
                }
            }
        }
        
        // Activate power-up
        function activatePowerup(powerup) {
            const type = powerup.type;
            const duration = powerup.duration;
            
            activePowerUps[type] = true;
            powerUpTimers[type] = setTimeout(() => {
                deactivatePowerup(type);
            }, duration);
            
            playSound('powerup');
            updatePowerupIndicator();
            
            // Visual effect for shield
            if (type === 'shield') {
                player.style.boxShadow = '0 0 20px #4169E1';
            }
        }
        
        // Deactivate power-up
        function deactivatePowerup(type) {
            activePowerUps[type] = false;
            delete powerUpTimers[type];
            
            if (type === 'shield') {
                player.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            }
            
            updatePowerupIndicator();
        }
        
        // Update power-up indicator
        function updatePowerupIndicator() {
            const indicator = document.getElementById('powerupIndicator');
            const list = document.getElementById('powerupList');
            
            const activeList = Object.keys(activePowerUps).filter(key => activePowerUps[key]);
            
            if (activeList.length > 0) {
                indicator.classList.add('active');
                list.innerHTML = activeList.map(type => {
                    const powerup = POWERUP_TYPES.find(p => p.type === type);
                    return `<div class="powerupItem">${powerup.emoji} ${powerup.name}</div>`;
                }).join('');
            } else {
                indicator.classList.remove('active');
            }
        }

        // Toggle sound
        function toggleSound() {
            soundEnabled = !soundEnabled;
            const soundToggle = document.getElementById('soundToggle');
            soundToggle.textContent = soundEnabled ? '🔊 Sound' : '🔇 Sound';
        }
        
        // Game over
        function gameOver() {
            gameRunning = false;
            clearInterval(gameInterval);
            clearInterval(coinInterval);
            clearInterval(sharkInterval);
            clearInterval(timerInterval);
            
            // Clear all power-up timers
            Object.keys(powerUpTimers).forEach(key => {
                clearTimeout(powerUpTimers[key]);
            });
            
            playSound('sharkBite');
            
            document.getElementById('finalScore').textContent = score;
            gameOverScreen.style.display = 'flex';
        }

        // Pause/Resume game
        function togglePause() {
            if (!gameRunning) return;
            
            gamePaused = !gamePaused;
            const pauseBtn = document.getElementById('pauseBtn');
            const pauseMenu = document.getElementById('pauseMenu');
            
            if (gamePaused) {
                pauseBtn.textContent = '▶️ Resume';
                pauseMenu.style.display = 'flex';
            } else {
                pauseBtn.textContent = '⏸️ Pause';
                pauseMenu.style.display = 'none';
            }
        }
