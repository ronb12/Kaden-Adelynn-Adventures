// Simple Web Audio API synthesizer for background music
let audioContext = null;
let masterGain = null;
let currentOscillators = [];
let isPlaying = false;

const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.15; // Quiet background music
    masterGain.connect(audioContext.destination);
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
};

const stopAll = () => {
  currentOscillators.forEach(({ osc, gain, filter }) => {
    try {
      osc.stop();
      gain.disconnect();
      if (filter) filter.disconnect();
    } catch (e) {}
  });
  currentOscillators = [];
  isPlaying = false;
};

// Menu music - calm, spacey atmosphere
const playMenuMusic = () => {
  initAudio();
  stopAll();
  isPlaying = true;
  
  const notes = [220, 247, 277, 330]; // A3, B3, C#4, E4
  let index = 0;
  
  const playNote = () => {
    if (!isPlaying) return;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = notes[index];
    
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioContext.currentTime + 1.5);
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start();
    osc.stop(audioContext.currentTime + 2);
    
    currentOscillators.push({ osc, gain });
    
    index = (index + 1) % notes.length;
    if (isPlaying) setTimeout(playNote, 2000);
  };
  
  playNote();
};

// Gameplay music - energetic, upbeat
const playGameplayMusic = () => {
  initAudio();
  stopAll();
  isPlaying = true;
  
  const notes = [330, 370, 415, 494, 440, 370]; // E4, F#4, G#4, B4, A4, F#4
  let index = 0;
  
  const playNote = () => {
    if (!isPlaying) return;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.value = notes[index];
    
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, audioContext.currentTime + 0.8);
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start();
    osc.stop(audioContext.currentTime + 1);
    
    currentOscillators.push({ osc, gain });
    
    index = (index + 1) % notes.length;
    if (isPlaying) setTimeout(playNote, 1000);
  };
  
  playNote();
};

// Boss music - intense, dramatic
const playBossMusic = () => {
  initAudio();
  stopAll();
  isPlaying = true;
  
  const notes = [165, 185, 220, 247, 220, 185]; // E3, F#3, A3, B3, A3, F#3
  let index = 0;
  
  const playNote = () => {
    if (!isPlaying) return;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.value = notes[index];
    
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.05);
    gain.gain.setValueAtTime(0.25, audioContext.currentTime + 0.6);
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.8);
    
    currentOscillators.push({ osc, gain, filter });
    
    index = (index + 1) % notes.length;
    if (isPlaying) setTimeout(playNote, 800);
  };
  
  playNote();
};

export const synthMusic = {
  play: (trackName) => {
    switch (trackName) {
      case 'menu':
        playMenuMusic();
        break;
      case 'gameplay':
        playGameplayMusic();
        break;
      case 'boss':
        playBossMusic();
        break;
      default:
        playGameplayMusic();
    }
  },
  stop: stopAll,
  setVolume: (volume) => {
    if (masterGain) {
      masterGain.gain.value = volume * 0.15;
    }
  }
};
