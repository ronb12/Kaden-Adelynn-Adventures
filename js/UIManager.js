class UIManager {
    constructor() {
        this.elements = {};
        this.isVisible = true;
        this.hudElements = {};
        this.initializeHUD();
    }

    initializeHUD() {
        // Get HUD elements from DOM
        this.hudElements = {
            score: document.getElementById('score'),
            lives: document.getElementById('lives'),
            level: document.getElementById('level'),
            pauseBtn: document.getElementById('pauseBtn'),
            shopBtn: document.getElementById('shopBtn'),
            muteBtn: document.getElementById('muteBtn')
        };

        // Initialize mobile controls
        this.mobileControls = {
            touchPause: document.getElementById('touchPause'),
            touchShop: document.getElementById('touchShop'),
            touchShoot: document.getElementById('touchShoot')
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Pause button
        if (this.hudElements.pauseBtn) {
            this.hudElements.pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }

        // Shop button
        if (this.hudElements.shopBtn) {
            this.hudElements.shopBtn.addEventListener('click', () => {
                this.openShop();
            });
        }

        // Mute button
        if (this.hudElements.muteBtn) {
            this.hudElements.muteBtn.addEventListener('click', () => {
                this.toggleMute();
            });
        }

        // Mobile controls
        if (this.mobileControls.touchPause) {
            this.mobileControls.touchPause.addEventListener('click', () => {
                this.togglePause();
            });
        }

        if (this.mobileControls.touchShop) {
            this.mobileControls.touchShop.addEventListener('click', () => {
                this.openShop();
            });
        }

        if (this.mobileControls.touchShoot) {
            this.mobileControls.touchShoot.addEventListener('click', () => {
                this.triggerShoot();
            });
        }
    }

    update() {
        // Update HUD with current game state
        if (window.levelManager) {
            this.updateHUD();
        }
    }

    updateHUD() {
        const levelManager = window.levelManager;
        
        if (this.hudElements.score) {
            this.hudElements.score.textContent = `Score: ${levelManager.getScore()}`;
        }
        
        if (this.hudElements.lives) {
            this.hudElements.lives.textContent = `Lives: ${levelManager.getLives()}`;
        }
        
        if (this.hudElements.level) {
            this.hudElements.level.textContent = `Level: ${levelManager.getCurrentLevel()}`;
        }
    }

    draw(ctx) {
        if (!this.isVisible) return;

        // Draw additional UI elements on canvas if needed
        this.drawGameState(ctx);
    }

    drawGameState(ctx) {
        const levelManager = window.levelManager;
        if (!levelManager) return;

        const gameState = levelManager.getGameState();
        
        if (gameState === 'paused') {
            this.drawPauseScreen(ctx);
        } else if (gameState === 'gameOver') {
            this.drawGameOverScreen(ctx);
        } else if (gameState === 'levelComplete') {
            this.drawLevelCompleteScreen(ctx);
        }
    }

    drawPauseScreen(ctx) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Pause text
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Press ESC or click Pause to resume', ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
    }

    drawGameOverScreen(ctx) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Game over text
        ctx.fillStyle = '#ff0000';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${window.levelManager.getScore()}`, ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.fillText('Press R to restart', ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
    }

    drawLevelCompleteScreen(ctx) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Level complete text
        ctx.fillStyle = '#00ff00';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE!', ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`Level ${window.levelManager.getCurrentLevel() - 1} Complete!`, ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.fillText('Preparing next level...', ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
    }

    togglePause() {
        if (window.levelManager) {
            const gameState = window.levelManager.getGameState();
            if (gameState === 'playing') {
                window.levelManager.pause();
                if (window.audioManager) {
                    window.audioManager.pauseMusic();
                }
            } else if (gameState === 'paused') {
                window.levelManager.resume();
                if (window.audioManager) {
                    window.audioManager.resumeMusic();
                }
            }
        }
    }

    openShop() {
        // Placeholder for shop functionality
        console.log('Shop opened');
        // TODO: Implement shop system
    }

    toggleMute() {
        if (window.audioManager) {
            window.audioManager.toggleMute();
            this.updateMuteButton();
        }
    }

    updateMuteButton() {
        if (this.hudElements.muteBtn && window.audioManager) {
            const isMuted = window.audioManager.isMuted;
            this.hudElements.muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
        }
    }

    triggerShoot() {
        // Trigger player shooting for mobile controls
        if (window.player && window.player.shoot) {
            window.player.shoot();
        }
    }

    showMessage(message, duration = 3000) {
        // Create temporary message display
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 18px;
            z-index: 1000;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, duration);
    }

    hide() {
        this.isVisible = false;
    }

    show() {
        this.isVisible = true;
    }
} 