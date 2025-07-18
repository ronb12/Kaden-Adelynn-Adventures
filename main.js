// main.js
// Modular Gradius-style shooter: main loop and state manager

// --- Imports (stubs, to be implemented) ---
// import { Player } from './player.js';
// import { EnemyManager } from './enemy.js';
// import { LevelManager } from './levelManager.js';
// import { PowerupManager } from './powerup.js';
// import { AudioManager } from './audio.js';
// import { UIManager } from './ui.js';
// import { saveProgress, loadProgress } from './save.js';

// --- Canvas Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game States ---
const STATE_MENU = 'menu';
const STATE_PLAYING = 'playing';
const STATE_BOSS = 'boss';
const STATE_MISSION_COMPLETE = 'mission_complete';
const STATE_GAMEOVER = 'gameover';
let gameState = STATE_MENU;

// --- State Data ---
let currentLevel = 1;
let maxLevel = 50;
let player = null;
let enemies = [];
let boss = null;
let powerups = [];
let score = 0;
let credits = 0;
let highScore = 0;
let killStreak = 0;
let achievements = [];

// --- Input State ---
let keys = {};
let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let touchX = 0, touchY = 0, isTouching = false;

// --- Main Game Loop ---
function gameLoop() {
  switch (gameState) {
    case STATE_MENU:
      drawMenu();
      break;
    case STATE_PLAYING:
      updateGame();
      drawGame();
      break;
    case STATE_BOSS:
      updateBoss();
      drawGame();
      break;
    case STATE_MISSION_COMPLETE:
      drawMissionComplete();
      break;
    case STATE_GAMEOVER:
      drawGameOver();
      break;
  }
  requestAnimationFrame(gameLoop);
}

// --- State Transition Functions ---
function startGame() {
  currentLevel = 1;
  score = 0;
  credits = 0;
  killStreak = 0;
  player = null; // To be created by Player module
  enemies = [];
  boss = null;
  powerups = [];
  gameState = STATE_PLAYING;
}

function startBossBattle() {
  gameState = STATE_BOSS;
  // boss = ... (to be created by Boss module)
}

function completeMission() {
  gameState = STATE_MISSION_COMPLETE;
  // Save progress, show transition
}

function gameOver() {
  gameState = STATE_GAMEOVER;
  // Save high score, show game over screen
}

// --- Input Handlers (stubs) ---
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });
canvas.addEventListener('touchstart', e => { isTouching = true; /* ... */ });
canvas.addEventListener('touchmove', e => { /* ... */ });
canvas.addEventListener('touchend', e => { isTouching = false; });

// --- Drawing Functions (stubs) ---
function drawMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00fff7';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Kaden & Adelynn Adventures', canvas.width/2, canvas.height/2 - 60);
  ctx.font = '24px Arial';
  ctx.fillText('Press Space or Tap to Start', canvas.width/2, canvas.height/2 + 20);
}
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // TODO: draw background, player, enemies, powerups, HUD
}
function drawMissionComplete() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00fff7';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Mission Complete!', canvas.width/2, canvas.height/2);
  ctx.font = '24px Arial';
  ctx.fillText('Tap or Press Space for Next Mission', canvas.width/2, canvas.height/2 + 40);
}
function drawGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ff3366';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width/2, canvas.height/2);
  ctx.font = '24px Arial';
  ctx.fillText('Tap or Press Space to Restart', canvas.width/2, canvas.height/2 + 40);
}

// --- Update Functions (stubs) ---
function updateGame() {
  // TODO: update player, enemies, powerups, collisions, level progress
}
function updateBoss() {
  // TODO: update boss logic
}

// --- Bootstrap ---
window.onload = () => {
  gameLoop();
};
