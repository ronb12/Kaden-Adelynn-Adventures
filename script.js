class AdventureRunner {
    constructor() {
        this.gameArea = document.querySelector('.game-area');
        this.player = document.getElementById('player');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.finalScoreElement = document.getElementById('finalScore');
        
        this.gameRunning = false;
        this.score = 0;
        this.highScore = localStorage.getItem('adventureRunnerHighScore') || 0;
        this.gameSpeed = 5;
        this.obstacles = [];
        this.particles = [];
        this.animationId = null;
        
        this.playerState = 'running'; // running, jumping, sliding
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
        // Add floating clouds
        for (let i = 0; i < 5; i++) {
            const cloud = document.createElement('div');
            cloud.innerHTML = '☁️';
            cloud.style.position = 'absolute';
            cloud.style.fontSize = '2em';
            cloud.style.opacity = '0.7';
            cloud.style.top = Math.random() * 200 + 'px';
            cloud.style.left = Math.random() * 800 + 'px';
            cloud.style.animation = `float ${10 + Math.random() * 10}s linear infinite`;
            cloud.style.zIndex = '1';
            this.gameArea.appendChild(cloud);
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
        this.gameSpeed = 5;
        this.obstacles = [];
        this.playerState = 'running';
        this.playerY = 50;
        
        this.startScreen.style.display = 'none';
        this.gameOverlay.style.display = 'none';
        
        this.updateScore();
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
            { emoji: '🌳', class: 'tree', height: 60, y: 50 },
            { emoji: '🪨', class: 'rock', height: 40, y: 30 },
            { emoji: '🦅', class: 'bird', height: 40, y: 150 }
        ];
        
        const randomObstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const obstacle = document.createElement('div');
        obstacle.className = `obstacle ${randomObstacle.class}`;
        obstacle.innerHTML = randomObstacle.emoji;
        obstacle.style.left = '800px';
        obstacle.style.bottom = randomObstacle.y + 'px';
        obstacle.dataset.height = randomObstacle.height;
        obstacle.dataset.y = randomObstacle.y;
        
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
                this.updateScore();
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
                this.gameOver();
                return;
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