let sharedAudioContext = null

function getCtx() {
  if (sharedAudioContext) return sharedAudioContext
  const Ctx = window.AudioContext || window.webkitAudioContext
  sharedAudioContext = Ctx ? new Ctx() : null
  return sharedAudioContext
}

function env(ctx, duration = 0.2, attack = 0.005, release = 0.1, peak = 1.0) {
  const gain = ctx.createGain()
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(peak, now + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release)
  return { node: gain, endTime: now + duration + release }
}

function playOsc(type, freq, duration, volume = 0.4) {
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  osc.type = type
  const { node: g, endTime } = env(ctx, duration, 0.005, 0.12, volume)
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start()
  osc.stop(endTime)
}

function playNoise(duration = 0.25, volume = 0.35, lowpass = 1800) {
  const ctx = getCtx()
  if (!ctx) return
  const bufferSize = Math.floor(duration * ctx.sampleRate)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = lowpass
  const { node: g, endTime } = env(ctx, duration, 0.003, 0.15, volume)
  src.connect(filter)
  filter.connect(g)
  g.connect(ctx.destination)
  src.start()
  src.stop(endTime)
}

export function playSynth(name, volume = 0.5) {
  try {
    // Ensure unlocked context (first user gesture should have happened)
    const ctx = getCtx()
    if (!ctx) return
    const v = Math.max(0.05, Math.min(1, volume))

    switch (name) {
      case 'laser-shoot':
      case 'laser': {
        // Quick down-sweep
        const start = 900
        const end = 300
        const dur = 0.12
        const oscType = 'square'
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const { node: g, endTime } = env(ctx, dur, 0.001, 0.08, v)
        osc.type = oscType
        osc.frequency.setValueAtTime(start, now)
        osc.frequency.exponentialRampToValueAtTime(end, now + dur)
        osc.connect(g)
        g.connect(ctx.destination)
        osc.start()
        osc.stop(endTime)
        break
      }
      case 'explosion': {
        // Noise burst with lowpass sweep
        playNoise(0.3, v, 2500)
        break
      }
      case 'powerup':
      case 'powerup-pickup': {
        // Upward triad arpeggio
        const base = 440
        const freqs = [base, base * 1.25, base * 1.5]
        freqs.forEach((f, i) => setTimeout(() => playOsc('triangle', f, 0.08, v), i * 60))
        break
      }
      case 'missile':
      case 'missile-launch': {
        // Saw ramp
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        osc.type = 'sawtooth'
        const { node: g, endTime } = env(ctx, 0.22, 0.002, 0.12, v * 0.8)
        osc.frequency.setValueAtTime(300, now)
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.22)
        osc.connect(g)
        g.connect(ctx.destination)
        osc.start()
        osc.stop(endTime)
        break
      }
      case 'shield':
      case 'shield-up': {
        // Soft sine up-down
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        const { node: g, endTime } = env(ctx, 0.25, 0.002, 0.1, v * 0.7)
        osc.frequency.setValueAtTime(500, now)
        osc.frequency.linearRampToValueAtTime(700, now + 0.12)
        osc.frequency.linearRampToValueAtTime(400, now + 0.25)
        osc.connect(g)
        g.connect(ctx.destination)
        osc.start()
        osc.stop(endTime)
        break
      }
      case 'achievement': {
        // Short celebratory tones
        const base = 523.25 // C5
        const freqs = [base, base * 1.25, base * 1.5, base * 2]
        freqs.forEach((f, i) => setTimeout(() => playOsc('sine', f, 0.07, v), i * 70))
        break
      }
      case 'enemy-destroy': {
        playNoise(0.18, v * 0.8, 2200)
        break
      }
      case 'game-over': {
        // Descending tones
        const freqs = [660, 523, 392]
        freqs.forEach((f, i) => setTimeout(() => playOsc('triangle', f, 0.12, v * 0.7), i * 120))
        break
      }
      default: {
        // Generic click
        playOsc('square', 600, 0.06, v)
      }
    }
  } catch {}
}


