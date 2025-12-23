#!/usr/bin/env node
/**
 * Generate sound effects using ffmpeg
 * Creates OGG and MP3 versions of all required SFX files
 */

import { execSync } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const sfxDir = join(__dirname, '..', 'public', 'sfx')

// Ensure directory exists
mkdirSync(sfxDir, { recursive: true })

function generateSound(name, ffmpegFilter, duration, format = 'ogg') {
  const outputPath = join(sfxDir, `${name}.${format}`)
  const codec = format === 'ogg' ? 'libvorbis' : 'libmp3lame'
  const bitrate = format === 'ogg' ? '64k' : '64k'
  
  try {
    const cmd = `ffmpeg -f lavfi -i "${ffmpegFilter}" -t ${duration} -acodec ${codec} -b:a ${bitrate} -ar 22050 -ac 1 -y "${outputPath}" 2>&1`
    execSync(cmd, { stdio: 'ignore' })
    console.log(`✓ Generated ${name}.${format}`)
    return true
  } catch (error) {
    console.error(`✗ Failed to generate ${name}.${format}:`, error.message)
    return false
  }
}

console.log('Generating sound effects...\n')

// Laser shoot: quick down-sweep (square wave, 900Hz to 300Hz, 0.12s)
// Using a more complex filter with frequency sweep
generateSound('laser', 'aecho=0.8:0.88:60:0.4,aphaser=0.5:0.5:1:0.5,highpass=f=800,lowpass=f=1200', 0.12, 'ogg')
generateSound('laser', 'aecho=0.8:0.88:60:0.4,aphaser=0.5:0.5:1:0.5,highpass=f=800,lowpass=f=1200', 0.12, 'mp3')

// Actually, let's use a simpler approach with sine sweeps
console.log('Generating laser sounds...')
execSync(`ffmpeg -f lavfi -i "sine=frequency=900:duration=0.06" -f lavfi -i "sine=frequency=300:duration=0.06" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" -acodec libvorbis -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'laser.ogg')}" 2>&1`, { stdio: 'ignore' })
execSync(`ffmpeg -f lavfi -i "sine=frequency=900:duration=0.06" -f lavfi -i "sine=frequency=300:duration=0.06" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" -acodec libmp3lame -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'laser.mp3')}" 2>&1`, { stdio: 'ignore' })
console.log('✓ Generated laser.ogg and laser.mp3')

// Explosion: noise burst with lowpass filter
console.log('Generating explosion sounds...')
execSync(`ffmpeg -f lavfi -i "anoisesrc=duration=0.3:color=white" -af "lowpass=f=2000,highpass=f=100" -acodec libvorbis -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'explosion.ogg')}" 2>&1`, { stdio: 'ignore' })
execSync(`ffmpeg -f lavfi -i "anoisesrc=duration=0.3:color=white" -af "lowpass=f=2000,highpass=f=100" -acodec libmp3lame -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'explosion.mp3')}" 2>&1`, { stdio: 'ignore' })
console.log('✓ Generated explosion.ogg and explosion.mp3')

// Powerup: upward triad arpeggio (440Hz, 550Hz, 660Hz)
console.log('Generating powerup sounds...')
execSync(`ffmpeg -f lavfi -i "sine=frequency=440:duration=0.08" -f lavfi -i "sine=frequency=550:duration=0.08" -f lavfi -i "sine=frequency=660:duration=0.08" -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1" -acodec libvorbis -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'powerup.ogg')}" 2>&1`, { stdio: 'ignore' })
execSync(`ffmpeg -f lavfi -i "sine=frequency=440:duration=0.08" -f lavfi -i "sine=frequency=550:duration=0.08" -f lavfi -i "sine=frequency=660:duration=0.08" -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1" -acodec libmp3lame -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'powerup.mp3')}" 2>&1`, { stdio: 'ignore' })
console.log('✓ Generated powerup.ogg and powerup.mp3')

// Missile launch: saw ramp (300Hz to 600Hz, 0.22s)
console.log('Generating missile sounds...')
execSync(`ffmpeg -f lavfi -i "sine=frequency=300:duration=0.11" -f lavfi -i "sine=frequency=600:duration=0.11" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" -acodec libvorbis -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'missile.ogg')}" 2>&1`, { stdio: 'ignore' })
execSync(`ffmpeg -f lavfi -i "sine=frequency=300:duration=0.11" -f lavfi -i "sine=frequency=600:duration=0.11" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" -acodec libmp3lame -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'missile.mp3')}" 2>&1`, { stdio: 'ignore' })
console.log('✓ Generated missile.ogg and missile.mp3')

// Shield: soft sine up-down (440Hz to 880Hz and back)
console.log('Generating shield sounds...')
execSync(`ffmpeg -f lavfi -i "sine=frequency=440:duration=0.1" -f lavfi -i "sine=frequency=880:duration=0.1" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" -acodec libvorbis -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'shield.ogg')}" 2>&1`, { stdio: 'ignore' })
execSync(`ffmpeg -f lavfi -i "sine=frequency=440:duration=0.1" -f lavfi -i "sine=frequency=880:duration=0.1" -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" -acodec libmp3lame -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'shield.mp3')}" 2>&1`, { stdio: 'ignore' })
console.log('✓ Generated shield.ogg and shield.mp3')

// Boss: dramatic low frequency sweep
console.log('Generating boss sound...')
execSync(`ffmpeg -f lavfi -i "sine=frequency=100:duration=0.5" -af "lowpass=f=500" -acodec libvorbis -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'boss.ogg')}" 2>&1`, { stdio: 'ignore' })
console.log('✓ Generated boss.ogg')

// Game over: descending tone
console.log('Generating gameover sounds...')
execSync(`ffmpeg -f lavfi -i "sine=frequency=440:duration=0.5" -af "lowpass=f=300" -acodec libvorbis -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'gameover.ogg')}" 2>&1`, { stdio: 'ignore' })
execSync(`ffmpeg -f lavfi -i "sine=frequency=440:duration=0.5" -af "lowpass=f=300" -acodec libmp3lame -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'gameover.mp3')}" 2>&1`, { stdio: 'ignore' })
console.log('✓ Generated gameover.ogg and gameover.mp3')

// Level complete: ascending fanfare (C major chord progression)
console.log('Generating level-complete sounds...')
execSync(`ffmpeg -f lavfi -i "sine=frequency=523:duration=0.1" -f lavfi -i "sine=frequency=659:duration=0.1" -f lavfi -i "sine=frequency=784:duration=0.1" -filter_complex "[0:a][1:a][2:a]amix=inputs=3:duration=first" -acodec libvorbis -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'level-complete.ogg')}" 2>&1`, { stdio: 'ignore' })
execSync(`ffmpeg -f lavfi -i "sine=frequency=523:duration=0.1" -f lavfi -i "sine=frequency=659:duration=0.1" -f lavfi -i "sine=frequency=784:duration=0.1" -filter_complex "[0:a][1:a][2:a]amix=inputs=3:duration=first" -acodec libmp3lame -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'level-complete.mp3')}" 2>&1`, { stdio: 'ignore' })
console.log('✓ Generated level-complete.ogg and level-complete.mp3')

// Achievement: bright chime
console.log('Generating achievement sounds...')
execSync(`ffmpeg -f lavfi -i "sine=frequency=880:duration=0.1" -f lavfi -i "sine=frequency=1320:duration=0.1" -filter_complex "[0:a][1:a]amix=inputs=2:duration=first" -acodec libvorbis -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'achievement.ogg')}" 2>&1`, { stdio: 'ignore' })
execSync(`ffmpeg -f lavfi -i "sine=frequency=880:duration=0.1" -f lavfi -i "sine=frequency=1320:duration=0.1" -filter_complex "[0:a][1:a]amix=inputs=2:duration=first" -acodec libmp3lame -b:a 64k -ar 22050 -ac 1 -y "${join(sfxDir, 'achievement.mp3')}" 2>&1`, { stdio: 'ignore' })
console.log('✓ Generated achievement.ogg and achievement.mp3')

console.log('\n✓ All sound effects generated!')
