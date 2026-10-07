// Generated background music (no audio files): a mellow lo-fi groove with pads,
// a delayed pluck arpeggio, sub bass and soft drums, plus small UI blips.

const BPM = 88
const STEP = 60 / BPM / 4 // one 16th note in seconds
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12)

// Fmaj9 – Em7 – Am9 – Gadd9 (one bar each)
const CHORDS = [
  { bass: 41, pad: [57, 60, 64, 67], arp: [65, 69, 72, 76, 79, 76, 72, 69] },
  { bass: 40, pad: [55, 59, 62, 64], arp: [64, 67, 71, 74, 76, 74, 71, 67] },
  { bass: 45, pad: [55, 60, 64, 71], arp: [69, 72, 76, 79, 83, 79, 76, 72] },
  { bass: 43, pad: [55, 59, 62, 69], arp: [67, 71, 74, 78, 81, 78, 74, 71] },
]
// 16-step drum patterns (1 = hit)
const KICK = [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0]
const SNARE = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
const HAT = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1]
const ARP = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1]

let ctx = null
let master, music, reverb, delay, noiseBuf
let timer = null
let nextTime = 0
let stepIndex = 0
let playing = false

function makeImpulse(c, seconds, decay) {
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
  }
  return buf
}

function init() {
  if (ctx) return
  const AC = window.AudioContext || window.webkitAudioContext
  ctx = new AC()

  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -18
  comp.ratio.value = 3
  master = ctx.createGain()
  master.gain.value = 0
  master.connect(comp).connect(ctx.destination)

  music = ctx.createGain()
  music.gain.value = 0.9
  music.connect(master)

  reverb = ctx.createConvolver()
  reverb.buffer = makeImpulse(ctx, 2.8, 2.5)
  const revGain = ctx.createGain()
  revGain.gain.value = 0.35
  reverb.connect(revGain).connect(music)

  delay = ctx.createDelay(1)
  delay.delayTime.value = STEP * 3
  const fb = ctx.createGain()
  fb.gain.value = 0.32
  const delayTone = ctx.createBiquadFilter()
  delayTone.type = 'lowpass'
  delayTone.frequency.value = 2400
  delay.connect(delayTone).connect(fb).connect(delay)
  const delayOut = ctx.createGain()
  delayOut.gain.value = 0.4
  delayTone.connect(delayOut).connect(music)

  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const nd = noiseBuf.getChannelData(0)
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
}

function env(gainNode, t, attack, peak, release) {
  const g = gainNode.gain
  g.setValueAtTime(0.0001, t)
  g.linearRampToValueAtTime(peak, t + attack)
  g.exponentialRampToValueAtTime(0.0001, t + attack + release)
}

function pad(notes, t, dur) {
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(700, t)
  filter.frequency.linearRampToValueAtTime(1400, t + dur * 0.5)
  filter.frequency.linearRampToValueAtTime(800, t + dur)
  filter.Q.value = 0.7
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.045, t + 0.8)
  g.gain.setValueAtTime(0.045, t + dur - 0.2)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.9)
  filter.connect(g)
  g.connect(music)
  g.connect(reverb)
  notes.forEach((n) => {
    ;[-7, 7].forEach((det) => {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = midi(n)
      o.detune.value = det
      o.connect(filter)
      o.start(t)
      o.stop(t + dur + 1)
    })
  })
}

function pluck(n, t) {
  const o = ctx.createOscillator()
  const o2 = ctx.createOscillator()
  o.type = 'triangle'
  o2.type = 'sine'
  o.frequency.value = midi(n)
  o2.frequency.value = midi(n + 12)
  const g = ctx.createGain()
  env(g, t, 0.005, 0.07, 0.35)
  const g2 = ctx.createGain()
  g2.gain.value = 0.3
  o.connect(g)
  o2.connect(g2).connect(g)
  g.connect(music)
  g.connect(delay)
  g.connect(reverb)
  o.start(t)
  o2.start(t)
  o.stop(t + 0.5)
  o2.stop(t + 0.5)
}

function bass(n, t, dur) {
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.value = midi(n)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.22, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(music)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function kick(t) {
  const o = ctx.createOscillator()
  o.frequency.setValueAtTime(140, t)
  o.frequency.exponentialRampToValueAtTime(42, t + 0.12)
  const g = ctx.createGain()
  env(g, t, 0.002, 0.5, 0.32)
  o.connect(g).connect(music)
  o.start(t)
  o.stop(t + 0.4)
}

function noiseHit(t, type, freq, peak, release, toReverb) {
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  const g = ctx.createGain()
  env(g, t, 0.002, peak, release)
  src.connect(f).connect(g).connect(music)
  if (toReverb) g.connect(reverb)
  src.start(t, Math.random() * 0.5)
  src.stop(t + release + 0.05)
}

function schedule(i, t) {
  const s = i % 16
  const chord = CHORDS[Math.floor(i / 16) % CHORDS.length]
  if (s === 0) {
    pad(chord.pad, t, STEP * 16)
    bass(chord.bass, t, STEP * 6)
  }
  if (s === 10) bass(chord.bass, t, STEP * 5)
  if (KICK[s]) kick(t)
  if (SNARE[s]) noiseHit(t, 'bandpass', 1900, 0.16, 0.2, true)
  if (HAT[s]) noiseHit(t, 'highpass', 7500, s % 2 ? 0.025 : 0.04, 0.05, false)
  if (ARP[s]) pluck(chord.arp[(i * 3) % chord.arp.length], t)
}

function scheduler() {
  // Light swing on off-beat 16ths for a laid-back feel.
  while (nextTime < ctx.currentTime + 0.15) {
    const swing = stepIndex % 2 ? STEP * 0.12 : 0
    schedule(stepIndex, nextTime + swing)
    nextTime += STEP
    stepIndex++
  }
}

export function startMusic() {
  init()
  ctx.resume()
  if (!playing) {
    playing = true
    nextTime = ctx.currentTime + 0.1
    stepIndex = 0
    timer = setInterval(scheduler, 25)
  }
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
  master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.5)
}

export function stopMusic() {
  if (!ctx || !playing) return
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
  playing = false
  clearInterval(timer)
}

export const isPlaying = () => playing

// Short "tick" for UI interactions, only audible while the music is on.
export function playBlip(freq = 1320) {
  if (!ctx || !playing) return
  const t = ctx.currentTime
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(freq, t)
  o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.06)
  const g = ctx.createGain()
  env(g, t, 0.003, 0.06, 0.12)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + 0.15)
}
