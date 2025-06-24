class AdventureRunner {
    constructor() {
        this.gameArea = document.querySelector('.game-area');
        this.player = document.getElementById('player');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.distanceElement = document.getElementById('distance');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalDistanceElement = document.getElementById('finalDistance');
        
        this.gameRunning = false;
        this.score = 0;
        this.distance = 0;
        this.highScore = localStorage.getItem('adventureRunnerHighScore') || 0;
        this.gameSpeed = 5;
        this.obstacles = [];
        this.particles = [];
        this.animationId = null;
        
        this.playerState = 'running'; // running, jumping, sliding
        this.playerLane = 'center'; // left, center, right
        this.playerY = 50;
        this.playerHeight = 60;
        
        this.init();
    }
    
    init() {
        this.highScoreElement.textContent = this.highScore;
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Add some fun background elements
        this.createBackgroundElements();
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
        this.gameSpeed = 5;
        this.obstacles = [];
        this.playerState = 'running';
        this.playerLane = 'center';
        this.playerY = 50;
        
        this.startScreen.style.display = 'none';
        this.gameOverlay.style.display = 'none';
        
        this.updateScore();
        this.updateDistance();
        this.gameLoop();
        this.spawnObstacles();
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
        obstacle.style.left = '800px';
        obstacle.style.bottom = randomObstacle.y + 'px';
        obstacle.dataset.height = randomObstacle.height;
        obstacle.dataset.y = randomObstacle.y;
        obstacle.dataset.lane = randomLane;
        
        // Position based on lane
        if (randomLane === 'left') {
            obstacle.style.left = '650px';
        } else if (randomLane === 'right') {
            obstacle.style.left = '750px';
        }
        
        this.gameArea.appendChild(obstacle);
        this.obstacles.push(obstacle);
        
        // Random spawn time between 1.5 and 3 seconds
        const spawnTime = 1500 + Math.random() * 1500;
        setTimeout(() => this.spawnObstacles(), spawnTime);
    }
    
    updateObstacles() {
        this.obstacles.forEach((obstacle, index) => {
            const currentLeft = parseFloat(obstacle.style.left);
            const newLeft = currentLeft - this.gameSpeed;
            
            if (newLeft < -50) {
                obstacle.remove();
                this.obstacles.splice(index, 1);
                this.score += 10;
                this.distance += 10;
                this.updateScore();
                this.updateDistance();
            } else {
                obstacle.style.left = newLeft + 'px';
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
    
    gameOver() {
        this.gameRunning = false;
        cancelAnimationFrame(this.animationId);
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('adventureRunnerHighScore', this.highScore);
            this.highScoreElement.textContent = this.highScore;
        }
        
        this.finalScoreElement.textContent = this.score;
        this.finalDistanceElement.textContent = this.distance;
        this.gameOverScreen.style.display = 'block';
        this.gameOverlay.style.display = 'flex';
        
        // Clear obstacles
        this.obstacles.forEach(obstacle => obstacle.remove());
        this.obstacles = [];
        
        // Create explosion particles
        this.createParticles(this.player.offsetLeft + 30, this.player.offsetTop + 30, '#FF0000');
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.updateObstacles();
        this.checkCollisions();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdventureRunner();
}); 