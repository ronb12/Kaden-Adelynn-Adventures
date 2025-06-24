class AdventureRunner {
    constructor() {
        this.gameArea = document.querySelector('.game-area');
        this.player = document.getElementById('player');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.distanceElement = document.getElementById('distance');
        this.coinsElement = document.getElementById('coins');
        this.comboElement = document.getElementById('combo');
        this.powerUpElement = document.getElementById('powerUpDisplay');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalDistanceElement = document.getElementById('finalDistance');
        this.finalCoinsElement = document.getElementById('finalCoins');
        this.finalComboElement = document.getElementById('finalCombo');
        this.mobileControls = document.getElementById('mobileControls');
        this.achievementPopup = document.getElementById('achievementPopup');
        this.comboPopup = document.getElementById('comboPopup');
        
        this.gameRunning = false;
        this.score = 0;
        this.distance = 0;
        this.coins = 0;
        this.combo = 1;
        this.comboStreak = 0;
        this.highScore = localStorage.getItem('adventureRunnerHighScore') || 0;
        this.totalDistance = localStorage.getItem('adventureRunnerTotalDistance') || 0;
        this.totalCoins = localStorage.getItem('adventureRunnerTotalCoins') || 0;
        this.gamesPlayed = localStorage.getItem('adventureRunnerGamesPlayed') || 0;
        this.gameSpeed = 3;
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        this.animationId = null;
        this.isMobile = this.detectMobile();
        
        this.playerState = 'running'; // running, jumping, sliding
        this.playerLane = 'center'; // left, center, right
        this.playerY = 50;
        this.playerHeight = 60;
        
        // Power-ups
        this.activePowerUps = {
            magnet: false,
            shield: false,
            speedBoost: false
        };
        this.powerUpTimers = {
            magnet: 0,
            shield: 0,
            speedBoost: 0
        };
        
        // Achievements
        this.achievements = {
            firstRun: { name: "First Steps", description: "Complete your first run", earned: false },
            coinCollector: { name: "Coin Collector", description: "Collect 50 coins in one run", earned: false },
            distanceRunner: { name: "Distance Runner", description: "Run 500m in one run", earned: false },
            comboMaster: { name: "Combo Master", description: "Get a 5x combo", earned: false },
            powerUpUser: { name: "Power Player", description: "Use 3 power-ups in one run", earned: false }
        };
        this.achievementsEarned = [];
        this.powerUpsUsed = 0;
        
        this.init();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 850;
    }
    
    init() {
        this.highScoreElement.textContent = this.highScore;
        this.updateStats();
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Mobile touch controls
        if (this.isMobile) {
            this.setupMobileControls();
        }
        
        // Add some fun background elements
        this.createBackgroundElements();
    }
    
    updateStats() {
        document.getElementById('totalDistance').textContent = this.totalDistance;
        document.getElementById('totalCoins').textContent = this.totalCoins;
        document.getElementById('gamesPlayed').textContent = this.gamesPlayed;
    }
    
    setupMobileControls() {
        this.mobileControls.style.display = 'flex';
        
        // Jump button
        document.getElementById('centerArea').addEventListener('click', (e) => {
            if (e.target.classList.contains('jump-btn')) {
                this.jump();
            }
        });
        
        // Slide button
        document.getElementById('centerArea').addEventListener('click', (e) => {
            if (e.target.classList.contains('slide-btn')) {
                this.slide();
            }
        });
        
        // Left button
        document.getElementById('leftArea').addEventListener('click', (e) => {
            if (e.target.classList.contains('left-btn')) {
                this.moveLeft();
            }
        });
        
        // Right button
        document.getElementById('rightArea').addEventListener('click', (e) => {
            if (e.target.classList.contains('right-btn')) {
                this.moveRight();
            }
        });
        
        // Touch controls for game area
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.gameArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.gameArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Determine swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 50) {
                    this.moveRight();
                } else if (deltaX < -50) {
                    this.moveLeft();
                }
            } else {
                // Vertical swipe
                if (deltaY > 50) {
                    this.slide();
                } else if (deltaY < -50) {
                    this.jump();
                } else {
                    // Tap to jump
                    this.jump();
                }
            }
        });
    }
    
    createBackgroundElements() {
        // Add floating temple elements
        for (let i = 0; i < 3; i++) {
            const temple = document.createElement('div');
            temple.innerHTML = '🏛️';
            temple.style.position = 'absolute';
            temple.style.fontSize = '3em';
            temple.style.opacity = '0.3';
            temple.style.top = Math.random() * 150 + 'px';
            temple.style.left = Math.random() * 800 + 'px';
            temple.style.animation = `float ${15 + Math.random() * 10}s linear infinite`;
            temple.style.zIndex = '1';
            this.gameArea.appendChild(temple);
        }
        
        // Add CSS for floating animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0% { transform: translateX(-100px); }
                100% { transform: translateX(900px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.distance = 0;
        this.coins = 0;
        this.combo = 1;
        this.comboStreak = 0;
        this.gameSpeed = 3;
        this.obstacles = [];
        this.collectibles = [];
        this.playerState = 'running';
        this.playerLane = 'center';
        this.playerY = 50;
        this.achievementsEarned = [];
        this.powerUpsUsed = 0;
        
        // Reset power-ups
        this.activePowerUps = { magnet: false, shield: false, speedBoost: false };
        this.powerUpTimers = { magnet: 0, shield: 0, speedBoost: 0 };
        
        // Reset player position and effects
        this.player.classList.remove('left', 'right', 'shield', 'magnet');
        
        this.startScreen.style.display = 'none';
        this.gameOverlay.style.display = 'none';
        
        this.updateScore();
        this.updateDistance();
        this.updateCoins();
        this.updateCombo();
        this.updatePowerUpDisplay();
        this.gameLoop();
        this.spawnObstacles();
        this.spawnCollectibles();
    }
    
    restartGame() {
        this.gameOverScreen.style.display = 'none';
        this.gameOverlay.style.display = 'none';
        this.startGame();
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.jump();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.slide();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.moveLeft();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.moveRight();
                break;
        }
    }
    
    moveLeft() {
        if (this.playerLane === 'center') {
            this.playerLane = 'left';
            this.player.classList.remove('right');
            this.player.classList.add('left');
        } else if (this.playerLane === 'right') {
            this.playerLane = 'center';
            this.player.classList.remove('right', 'left');
        }
    }
    
    moveRight() {
        if (this.playerLane === 'center') {
            this.playerLane = 'right';
            this.player.classList.remove('left');
            this.player.classList.add('right');
        } else if (this.playerLane === 'left') {
            this.playerLane = 'center';
            this.player.classList.remove('right', 'left');
        }
    }
    
    jump() {
        if (this.playerState !== 'running') return;
        
        this.playerState = 'jumping';
        this.player.classList.add('jumping');
        
        // Create jump particles
        this.createParticles(this.player.offsetLeft + 30, this.player.offsetTop + 60, '#FFD700');
        
        setTimeout(() => {
            this.player.classList.remove('jumping');
            this.playerState = 'running';
        }, 600);
    }
    
    slide() {
        if (this.playerState !== 'running') return;
        
        this.playerState = 'sliding';
        this.player.classList.add('sliding');
        
        // Create slide particles
        this.createParticles(this.player.offsetLeft + 30, this.player.offsetTop + 60, '#FF6B6B');
        
        setTimeout(() => {
            this.player.classList.remove('sliding');
            this.playerState = 'running';
        }, 500);
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = color;
            particle.style.transform = `translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px)`;
            
            this.gameArea.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }
    
    spawnObstacles() {
        if (!this.gameRunning) return;
        
        const obstacleTypes = [
            { emoji: '🌳', class: 'tree', height: 60, y: 50, lanes: ['left', 'center', 'right'] },
            { emoji: '🪨', class: 'rock', height: 40, y: 30, lanes: ['left', 'center', 'right'] },
            { emoji: '🦅', class: 'bird', height: 40, y: 150, lanes: ['left', 'center', 'right'] },
            { emoji: '🔥', class: 'fire', height: 30, y: 40, lanes: ['left', 'center', 'right'] },
            { emoji: '🏛️', class: 'pillar', height: 80, y: 30, lanes: ['left', 'right'] }
        ];
        
        const randomObstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const randomLane = randomObstacle.lanes[Math.floor(Math.random() * randomObstacle.lanes.length)];
        
        const obstacle = document.createElement('div');
        obstacle.className = `obstacle ${randomObstacle.class}`;
        obstacle.innerHTML = randomObstacle.emoji;
        obstacle.style.top = '-100px';
        obstacle.style.bottom = 'auto';
        obstacle.dataset.height = randomObstacle.height;
        obstacle.dataset.y = randomObstacle.y;
        obstacle.dataset.lane = randomLane;
        
        // Position based on lane
        if (randomLane === 'left') {
            obstacle.style.left = '200px';
        } else if (randomLane === 'center') {
            obstacle.style.left = '350px';
        } else if (randomLane === 'right') {
            obstacle.style.left = '500px';
        }
        
        this.gameArea.appendChild(obstacle);
        this.obstacles.push(obstacle);
        
        // Random spawn time between 1.5 and 3 seconds
        const spawnTime = 1500 + Math.random() * 1500;
        setTimeout(() => this.spawnObstacles(), spawnTime);
    }
    
    spawnCollectibles() {
        if (!this.gameRunning) return;
        
        const collectibleTypes = [
            { emoji: '🪙', class: 'coin', type: 'coin', value: 1, probability: 0.7 },
            { emoji: '💎', class: 'gem', type: 'gem', value: 5, probability: 0.2 },
            { emoji: '🧲', class: 'magnet', type: 'powerup', powerUp: 'magnet', probability: 0.05 },
            { emoji: '🛡️', class: 'shield', type: 'powerup', powerUp: 'shield', probability: 0.05 }
        ];
        
        // Random chance to spawn collectible
        if (Math.random() < 0.3) {
            const randomCollectible = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
            const randomLane = ['left', 'center', 'right'][Math.floor(Math.random() * 3)];
            
            const collectible = document.createElement('div');
            collectible.className = `collectible ${randomCollectible.class}`;
            collectible.innerHTML = randomCollectible.emoji;
            collectible.style.top = '-100px';
            collectible.dataset.type = randomCollectible.type;
            collectible.dataset.value = randomCollectible.value;
            collectible.dataset.lane = randomLane;
            if (randomCollectible.powerUp) {
                collectible.dataset.powerUp = randomCollectible.powerUp;
            }
            
            // Position based on lane
            if (randomLane === 'left') {
                collectible.style.left = '200px';
            } else if (randomLane === 'center') {
                collectible.style.left = '350px';
            } else if (randomLane === 'right') {
                collectible.style.left = '500px';
            }
            
            this.gameArea.appendChild(collectible);
            this.collectibles.push(collectible);
        }
        
        // Spawn collectibles more frequently
        const spawnTime = 1000 + Math.random() * 2000;
        setTimeout(() => this.spawnCollectibles(), spawnTime);
    }
    
    updateObstacles() {
        this.obstacles.forEach((obstacle, index) => {
            const currentTop = parseFloat(obstacle.style.top);
            const newTop = currentTop + this.gameSpeed;
            
            if (newTop > 500) {
                obstacle.remove();
                this.obstacles.splice(index, 1);
                this.score += 10 * this.combo;
                this.distance += 10;
                this.comboStreak++;
                this.updateScore();
                this.updateDistance();
                this.updateCombo();
            } else {
                obstacle.style.top = newTop + 'px';
            }
        });
    }
    
    updateCollectibles() {
        this.collectibles.forEach((collectible, index) => {
            const currentTop = parseFloat(collectible.style.top);
            const newTop = currentTop + this.gameSpeed;
            
            if (newTop > 500) {
                collectible.remove();
                this.collectibles.splice(index, 1);
            } else {
                collectible.style.top = newTop + 'px';
                
                // Check for collection
                if (this.checkCollection(collectible)) {
                    this.collectItem(collectible);
                    collectible.remove();
                    this.collectibles.splice(index, 1);
                }
            }
        });
    }
    
    checkCollection(collectible) {
        const playerRect = this.player.getBoundingClientRect();
        const collectibleRect = collectible.getBoundingClientRect();
        
        // Check if player is in the same lane or has magnet power-up
        const collectibleLane = collectible.dataset.lane;
        const inSameLane = this.playerLane === collectibleLane;
        const hasMagnet = this.activePowerUps.magnet;
        
        if (inSameLane || hasMagnet) {
            return this.isColliding(playerRect, collectibleRect);
        }
        
        return false;
    }
    
    collectItem(collectible) {
        const type = collectible.dataset.type;
        
        if (type === 'coin') {
            const value = parseInt(collectible.dataset.value);
            this.coins += value;
            this.score += value * 10 * this.combo;
            this.updateCoins();
            this.createParticles(collectible.offsetLeft + 15, collectible.offsetTop + 15, '#FFD700');
        } else if (type === 'gem') {
            const value = parseInt(collectible.dataset.value);
            this.coins += value;
            this.score += value * 20 * this.combo;
            this.updateCoins();
            this.createParticles(collectible.offsetLeft + 15, collectible.offsetTop + 15, '#FF69B4');
        } else if (type === 'powerup') {
            const powerUp = collectible.dataset.powerUp;
            this.activatePowerUp(powerUp);
            this.createParticles(collectible.offsetLeft + 15, collectible.offsetTop + 15, '#4ECDC4');
        }
        
        this.updateScore();
    }
    
    activatePowerUp(powerUp) {
        this.activePowerUps[powerUp] = true;
        this.powerUpTimers[powerUp] = 100; // 100 frames = ~5 seconds
        this.powerUpsUsed++;
        
        if (powerUp === 'magnet') {
            this.player.classList.add('magnet');
        } else if (powerUp === 'shield') {
            this.player.classList.add('shield');
        }
        
        this.updatePowerUpDisplay();
    }
    
    updatePowerUpTimers() {
        Object.keys(this.powerUpTimers).forEach(powerUp => {
            if (this.powerUpTimers[powerUp] > 0) {
                this.powerUpTimers[powerUp]--;
                if (this.powerUpTimers[powerUp] === 0) {
                    this.activePowerUps[powerUp] = false;
                    if (powerUp === 'magnet') {
                        this.player.classList.remove('magnet');
                    } else if (powerUp === 'shield') {
                        this.player.classList.remove('shield');
                    }
                    this.updatePowerUpDisplay();
                }
            }
        });
    }
    
    checkCollisions() {
        const playerRect = this.player.getBoundingClientRect();
        
        for (let obstacle of this.obstacles) {
            const obstacleRect = obstacle.getBoundingClientRect();
            
            if (this.isColliding(playerRect, obstacleRect)) {
                // Check if player is in the same lane as obstacle
                const obstacleLane = obstacle.dataset.lane;
                if (this.playerLane === obstacleLane || 
                    (obstacleLane === 'center' && this.playerLane === 'center') ||
                    (obstacleLane === 'left' && this.playerLane === 'left') ||
                    (obstacleLane === 'right' && this.playerLane === 'right')) {
                    
                    // Check if shield is active
                    if (this.activePowerUps.shield) {
                        obstacle.remove();
                        this.obstacles.splice(this.obstacles.indexOf(obstacle), 1);
                        this.createParticles(obstacle.offsetLeft + 15, obstacle.offsetTop + 15, '#4ECDC4');
                        return;
                    }
                    
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        // Increase game speed every 100 points
        if (this.score > 0 && this.score % 100 === 0) {
            this.gameSpeed += 0.5;
        }
    }
    
    updateDistance() {
        this.distanceElement.textContent = this.distance;
    }
    
    updateCoins() {
        this.coinsElement.textContent = this.coins;
    }
    
    updateCombo() {
        // Update combo based on streak
        if (this.comboStreak >= 10) {
            this.combo = 2;
        } else if (this.comboStreak >= 20) {
            this.combo = 3;
        } else if (this.comboStreak >= 30) {
            this.combo = 4;
        } else if (this.comboStreak >= 40) {
            this.combo = 5;
        } else {
            this.combo = 1;
        }
        
        this.comboElement.textContent = this.combo;
        
        // Show combo popup for high combos
        if (this.combo >= 3) {
            this.showComboPopup();
        }
    }
    
    updatePowerUpDisplay() {
        let powerUpText = '';
        if (this.activePowerUps.magnet) {
            powerUpText += '🧲';
        }
        if (this.activePowerUps.shield) {
            powerUpText += '🛡️';
        }
        if (this.activePowerUps.speedBoost) {
            powerUpText += '⚡';
        }
        this.powerUpElement.textContent = powerUpText;
    }
    
    showComboPopup() {
        this.comboPopup.style.display = 'block';
        setTimeout(() => {
            this.comboPopup.style.display = 'none';
        }, 1000);
    }
    
    checkAchievements() {
        // First run achievement
        if (!this.achievements.firstRun.earned && this.distance > 0) {
            this.earnAchievement('firstRun');
        }
        
        // Coin collector achievement
        if (!this.achievements.coinCollector.earned && this.coins >= 50) {
            this.earnAchievement('coinCollector');
        }
        
        // Distance runner achievement
        if (!this.achievements.distanceRunner.earned && this.distance >= 500) {
            this.earnAchievement('distanceRunner');
        }
        
        // Combo master achievement
        if (!this.achievements.comboMaster.earned && this.combo >= 5) {
            this.earnAchievement('comboMaster');
        }
        
        // Power-up user achievement
        if (!this.achievements.powerUpUser.earned && this.powerUpsUsed >= 3) {
            this.earnAchievement('powerUpUser');
        }
    }
    
    earnAchievement(achievementKey) {
        this.achievements[achievementKey].earned = true;
        this.achievementsEarned.push(this.achievements[achievementKey]);
        
        // Show achievement popup
        const achievementText = this.achievementPopup.querySelector('.achievement-text');
        achievementText.textContent = this.achievements[achievementKey].name;
        this.achievementPopup.style.display = 'block';
        
        setTimeout(() => {
            this.achievementPopup.style.display = 'none';
        }, 2000);
        
        // Save achievements
        localStorage.setItem('adventureRunnerAchievements', JSON.stringify(this.achievements));
    }
    
    gameOver() {
        this.gameRunning = false;
        cancelAnimationFrame(this.animationId);
        
        // Update stats
        this.totalDistance += this.distance;
        this.totalCoins += this.coins;
        this.gamesPlayed++;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        
        // Save stats
        localStorage.setItem('adventureRunnerHighScore', this.highScore);
        localStorage.setItem('adventureRunnerTotalDistance', this.totalDistance);
        localStorage.setItem('adventureRunnerTotalCoins', this.totalCoins);
        localStorage.setItem('adventureRunnerGamesPlayed', this.gamesPlayed);
        
        // Update display
        this.finalScoreElement.textContent = this.score;
        this.finalDistanceElement.textContent = this.distance;
        this.finalCoinsElement.textContent = this.coins;
        this.finalComboElement.textContent = this.combo;
        
        // Show achievements earned
        const achievementList = document.getElementById('achievementList');
        achievementList.innerHTML = '';
        this.achievementsEarned.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.className = 'achievement-item';
            achievementItem.textContent = `${achievement.name}: ${achievement.description}`;
            achievementList.appendChild(achievementItem);
        });
        
        // Show/hide achievements section
        const achievementsEarned = document.getElementById('achievementsEarned');
        if (this.achievementsEarned.length > 0) {
            achievementsEarned.style.display = 'block';
        } else {
            achievementsEarned.style.display = 'none';
        }
        
        this.gameOverScreen.style.display = 'block';
        this.gameOverlay.style.display = 'flex';
        
        // Clear obstacles and collectibles
        this.obstacles.forEach(obstacle => obstacle.remove());
        this.collectibles.forEach(collectible => collectible.remove());
        this.obstacles = [];
        this.collectibles = [];
        
        // Create explosion particles
        this.createParticles(this.player.offsetLeft + 30, this.player.offsetTop + 30, '#FF0000');
        
        // Screen shake effect
        this.gameArea.classList.add('shake');
        setTimeout(() => {
            this.gameArea.classList.remove('shake');
        }, 500);
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.updateObstacles();
        this.updateCollectibles();
        this.updatePowerUpTimers();
        this.checkCollisions();
        this.checkAchievements();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdventureRunner();
}); 