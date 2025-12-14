import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sfxDir = path.join(__dirname, 'public', 'sfx');
const musicDir = path.join(__dirname, 'public', 'music');

// Create minimal valid MP3 frame (MPEG1 Layer III, 44.1kHz, ~26ms)
const mp3Frame = Buffer.from([
  0xFF, 0xFB, 0x10, 0x00,  // Sync + header
  ...Array(136).fill(0)     // Minimal frame payload
]);

const sfxFiles = [
  'laser.mp3',
  'explosion.mp3',
  'hit.mp3',
  'missile.mp3',
  'powerup.mp3',
  'shield.mp3',
  'achievement.mp3',
  'gameover.mp3',
  'level-complete.mp3'
];

const musicFiles = [
  'gameplay.mp3',
  'boss.mp3',
  'menu.mp3'
];

// Create SFX files
sfxFiles.forEach(file => {
  const filePath = path.join(sfxDir, file);
  let content = Buffer.alloc(0);
  // Create ~100ms of audio data
  for (let i = 0; i < 4; i++) {
    content = Buffer.concat([content, mp3Frame]);
  }
  fs.writeFileSync(filePath, content);
  console.log(`Created ${file}: ${content.length} bytes`);
});

// Create Music files  
musicFiles.forEach(file => {
  const filePath = path.join(musicDir, file);
  let content = Buffer.alloc(0);
  // Create ~1 second of audio data for music
  for (let i = 0; i < 40; i++) {
    content = Buffer.concat([content, mp3Frame]);
  }
  fs.writeFileSync(filePath, content);
  console.log(`Created ${file}: ${content.length} bytes`);
});

console.log('Audio files created successfully!');
