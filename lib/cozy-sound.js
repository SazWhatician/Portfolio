"use client";

/**
 * Serenity Chime Symphony v2 — Ethereal Harp, Handpan & Celestial Web Audio Engine
 * 100% Procedural Web Audio API · Zero External Samples · SSR Safe · Leak-Free GC
 *
 * Acoustic Architecture:
 * - Physical Handpan Tonefield Synth (1f, 2f beating, 3f compound fifth + 0.5f Helmholtz "Gu" cavity + felt tap)
 * - Concert Harp Plucked String Synth (velocity-damped lowpass sweep + spruce body warmth + sympathetic shimmer)
 * - Rotating Wind Chime Modal Synth (delicate Euler-Bernoulli partials + breeze amplitude modulation)
 * - Angelic Glass-Harmonica Pad Halo (slow-bloom formant bed for focus, entry & compass reveals)
 * - 3.8s Procedural Stereo Velvet-Noise Cathedral Reverb + Golden-Ratio (Φ) Cloud Delay + Soft Mastering Limiter
 * - Dual Harmonic Palettes: Sunlit D Lydian (Day/Sunset) & Mystic D Kurd 9 (Night)
 */

const PHI = 1.618033988749895;

// Sunlit Project Constellations (D Lydian / Major 9 — radiant, open horizon)
const PROJECT_CHIME_CONSTELLATIONS = [
  // 0: Dmaj9 (Serene open horizon)
  [293.66, 440.00, 554.37, 659.25, 880.00],
  // 1: Gmaj9/#11 (Lydian wonder)
  [392.00, 493.88, 587.33, 739.99, 987.77],
  // 2: Bm11 (Contemplative crystal depth)
  [246.94, 369.99, 493.88, 587.33, 739.99],
  // 3: F#m7/11 (Warm velvet embers)
  [369.99, 440.00, 554.37, 739.99, 880.00],
  // 4: Amaj9 (Golden morning light)
  [220.00, 440.00, 554.37, 659.25, 830.61],
  // 5: Em9 (Earthy resonant sanctuary)
  [329.63, 392.00, 493.88, 587.33, 739.99],
  // 6: Gmaj9 (Radiant celestial canopy)
  [392.00, 587.33, 659.25, 880.00, 1108.73],
  // 7: Dadd9 (Equilibrium & Resolution)
  [293.66, 369.99, 440.00, 659.25, 880.00],
];

// Nocturnal Constellations (Authentic D Kurd 9 Handpan — mystical, celestial, floating)
const NIGHT_CHIME_CONSTELLATIONS = [
  [293.66, 440.00, 523.25, 659.25, 880.00], // Dm9
  [349.23, 440.00, 587.33, 659.25, 880.00], // Fmaj7/13
  [233.08, 349.23, 440.00, 587.33, 698.46], // Bbmaj7
  [261.63, 392.00, 523.25, 659.25, 783.99], // Cadd9
  [220.00, 329.63, 440.00, 523.25, 659.25], // Am7
  [293.66, 349.23, 440.00, 587.33, 698.46], // Dm
  [392.00, 440.00, 587.33, 698.46, 880.00], // Gm9
  [293.66, 440.00, 587.33, 659.25, 1046.50], // Dsus2/9
];

// Full Extended Harp & Handpan Scales (D3 → D6)
const HARP_SCALE_DAY = [
  146.83, 220.00, 246.94, 277.18, 293.66, 329.63, 369.99,
  440.00, 493.88, 554.37, 587.33, 659.25, 739.99, 880.00,
  987.77, 1108.73, 1174.66,
];

const HARP_SCALE_NIGHT = [
  146.83, 220.00, 233.08, 261.63, 293.66, 329.63, 349.23,
  392.00, 440.00, 523.25, 587.33, 659.25, 698.46, 783.99,
  880.00, 1046.50, 1174.66,
];

class CozyAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.dryGain = null;
    this.reverbSend = null;
    this.cloudDelaySend = null;
    this.noiseBuffer = null;

    this.isMuted = false;
    this.volume = 0.42;
    this.theme = "sunset";
    this.hasUnlocked = false;

    // Rhythmic & generative voice-leading state
    this.lastSnapTime = -1;
    this.lastHoverTime = -1;
    this.lastTickTime = -1;
    this.movementStreak = 0;
    this.lastDirection = 1;
    this.hoverStep = 7;
    this.hoverDir = 1;

    if (typeof window !== "undefined") {
      const autoUnlock = () => this.unlock();
      window.addEventListener("pointerdown", autoUnlock, { once: true, passive: true });
      window.addEventListener("keydown", autoUnlock, { once: true, passive: true });
      window.addEventListener("touchstart", autoUnlock, { once: true, passive: true });
    }
  }

  /* ==========================================================================
     INITIALIZATION & MASTER ACOUSTIC GRAPH
     ========================================================================== */
  init() {
    if (typeof window === "undefined") return;
    if (this.ctx) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      const now = this.ctx.currentTime;

      // 1. Mastering Soft Limiter + Silk Air Lowpass (Zero Harshness / Zero Clipping)
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-16, now);
      compressor.knee.setValueAtTime(22, now);
      compressor.ratio.setValueAtTime(3.5, now);
      compressor.attack.setValueAtTime(0.008, now);
      compressor.release.setValueAtTime(0.24, now);

      const silkFilter = this.ctx.createBiquadFilter();
      silkFilter.type = "lowpass";
      silkFilter.frequency.setValueAtTime(11200, now);
      silkFilter.Q.setValueAtTime(0.45, now);

      // Gentle woody warmth boost around 260Hz (acoustic soundboard resonance)
      const bodyShelf = this.ctx.createBiquadFilter();
      bodyShelf.type = "peaking";
      bodyShelf.frequency.setValueAtTime(260, now);
      bodyShelf.Q.setValueAtTime(0.9, now);
      bodyShelf.gain.setValueAtTime(1.8, now);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, now);

      bodyShelf.connect(silkFilter);
      silkFilter.connect(compressor);
      compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // 2. Dry Direct Bus
      this.dryGain = this.ctx.createGain();
      this.dryGain.gain.setValueAtTime(0.84, now);
      this.dryGain.connect(bodyShelf);

      // 3. 3.8s Velvet-Noise Stereo Cathedral Convolution Reverb
      this.reverbSend = this.ctx.createGain();
      this.reverbSend.gain.setValueAtTime(0.62, now);

      const preDelay = this.ctx.createDelay(0.2);
      preDelay.delayTime.setValueAtTime(0.032, now); // Keeps plucks crisp before bloom

      const convolver = this.ctx.createConvolver();
      convolver.buffer = this._createVelvetCathedralIR(3.8, 2.65);

      const reverbHighpass = this.ctx.createBiquadFilter();
      reverbHighpass.type = "highpass";
      reverbHighpass.frequency.setValueAtTime(170, now); // Prevents low-end mud

      const reverbLowpass = this.ctx.createBiquadFilter();
      reverbLowpass.type = "lowpass";
      reverbLowpass.frequency.setValueAtTime(4200, now);

      const reverbReturn = this.ctx.createGain();
      reverbReturn.gain.setValueAtTime(0.78, now);

      this.reverbSend.connect(preDelay);
      preDelay.connect(convolver);
      convolver.connect(reverbHighpass);
      reverbHighpass.connect(reverbLowpass);
      reverbLowpass.connect(reverbReturn);
      reverbReturn.connect(bodyShelf);

      // 4. Golden-Ratio (Φ) Stereo Ping-Pong Cloud Delay (L: 277ms, R: 448ms)
      this.cloudDelaySend = this.ctx.createGain();
      this.cloudDelaySend.gain.setValueAtTime(0.26, now);

      const delayL = this.ctx.createDelay(1.0);
      const delayR = this.ctx.createDelay(1.0);
      delayL.delayTime.setValueAtTime(0.277, now);
      delayR.delayTime.setValueAtTime(0.277 * PHI, now);

      const dampL = this.ctx.createBiquadFilter();
      dampL.type = "lowpass";
      dampL.frequency.setValueAtTime(2300, now);

      const dampR = this.ctx.createBiquadFilter();
      dampR.type = "lowpass";
      dampR.frequency.setValueAtTime(1950, now);

      const fbL = this.ctx.createGain();
      const fbR = this.ctx.createGain();
      fbL.gain.setValueAtTime(0.32, now);
      fbR.gain.setValueAtTime(0.30, now);

      const panL = this._createPanner(-0.62);
      const panR = this._createPanner(0.62);

      this.cloudDelaySend.connect(delayL);
      this.cloudDelaySend.connect(delayR);

      delayL.connect(dampL);
      dampL.connect(fbL);
      fbL.connect(delayR);

      delayR.connect(dampR);
      dampR.connect(fbR);
      fbR.connect(delayL);

      dampL.connect(panL);
      dampR.connect(panR);
      panL.connect(bodyShelf);
      panR.connect(bodyShelf);
      // Feed ethereal echoes softly into the cathedral tail
      panL.connect(this.reverbSend);
      panR.connect(this.reverbSend);

      // 5. Shared Filtered Noise Buffer for Organic Felt / Pluck Transients
      this.noiseBuffer = this._createNoiseBuffer(0.2);

      window.__cozyAudio = this;
    } catch {
      // Gracefully ignore Web Audio init errors
    }
  }

  _createVelvetCathedralIR(duration = 3.8, decayPower = 2.65) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const buffer = this.ctx.createBuffer(2, length, rate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let lp = 0;
      // Slight L/R air-absorption asymmetry widens the stereo horizon
      const damp = ch === 0 ? 0.83 : 0.86;

      for (let i = 0; i < length; i++) {
        const progress = i / length;
        // Smooth 55ms bloom-in eliminates metallic early slapback
        const swell = Math.min(1, i / (rate * 0.055));
        const env = swell * Math.pow(1 - progress, decayPower);

        // Sparse velvet-style impulse distribution for silky diffusion
        const spark = Math.random() > 0.3 ? (Math.random() * 2 - 1) : 0;
        lp = lp * damp + spark * (1 - damp);
        data[i] = lp * env * 1.65;
      }
    }
    return buffer;
  }

  _createNoiseBuffer(seconds = 0.2) {
    const length = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  _createPanner(panValue) {
    if (this.ctx && typeof this.ctx.createStereoPanner === "function") {
      const p = this.ctx.createStereoPanner();
      p.pan.setValueAtTime(Math.max(-1, Math.min(1, panValue)), this.ctx.currentTime);
      return p;
    }
    return this.ctx.createGain();
  }

  _getConstellations() {
    return this.theme === "night" ? NIGHT_CHIME_CONSTELLATIONS : PROJECT_CHIME_CONSTELLATIONS;
  }

  _getScale() {
    return this.theme === "night" ? HARP_SCALE_NIGHT : HARP_SCALE_DAY;
  }

  _humanize(freq, maxCents = 2.4) {
    const cents = (Math.random() * 2 - 1) * maxCents;
    return freq * Math.pow(2, cents / 1200);
  }

  /* ==========================================================================
     CONTROLS (100% Backwards Compatible + Theme & Volume)
     ========================================================================== */
  unlock() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume().then(() => {
        this.hasUnlocked = true;
      }).catch(() => { });
    } else {
      this.hasUnlocked = true;
    }
  }

  setTheme(theme = "sunset") {
    this.theme = theme;
  }

  setVolume(vol = 0.42) {
    this.volume = Math.max(0, Math.min(1, Number(vol) || 0));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.04);
    }
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime,
        0.04
      );
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /* ==========================================================================
     UPGRADED EXISTING CHIMES (Backwards Compatible Signatures)
     ========================================================================== */

  /**
   * 1. playSnap(index, direction) — Dreamy Handpan + Harp + Crystal Constellation
   * Replaces metallic beam stacking with a warm handpan root, staggered harp fifth,
   * and crystalline wind-chime whisper that blooms into the cathedral cloud space.
   */
  playSnap(index = 0, direction = 1) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.lastSnapTime > 0 && now - this.lastSnapTime < 0.068) return;

    if (this.lastSnapTime > 0 && now - this.lastSnapTime < 0.6) {
      this.movementStreak = Math.min(this.movementStreak + 1, 6);
    } else {
      this.movementStreak = 1;
    }
    this.lastSnapTime = now;
    this.lastDirection = direction || 1;

    const dir = direction >= 0 ? 1 : -1;
    const bank = this._getConstellations();
    const chord = bank[Math.abs(Math.floor(index)) % bank.length];

    // Layer 1: Warm Handpan Tonefield Foundation (Instant, grounded warmth)
    this._synthHandpan({
      freq: chord[0],
      startTime: now,
      pan: -0.18 * dir,
      gain: 0.24,
      decay: 2.1,
    });

    // Layer 2: Plucked Concert Harp Companion (+42ms, opposite stereo bloom)
    const harpFreq = dir > 0 ? chord[1] : chord[2];
    this._synthHarp({
      freq: harpFreq,
      startTime: now + 0.042,
      pan: 0.34 * dir,
      gain: 0.16,
      decay: 2.3,
      brightness: 0.65,
    });

    // Layer 3: Ethereal High Crystal Whisper (+92ms, airy upper halo)
    this._synthCrystalChime({
      freq: chord[3] || chord[2] * 2,
      startTime: now + 0.092,
      pan: -0.42 * dir,
      gain: 0.085,
      decay: 1.9,
      shimmer: true,
      breezeLfo: true,
    });

    // Layer 4: On fluid navigation streaks, add a heavenly high harp crown harmonic!
    if (this.movementStreak >= 2) {
      this._synthHarp({
        freq: chord[4] || chord[0] * 2,
        startTime: now + 0.148,
        pan: 0.55 * dir,
        gain: 0.09,
        decay: 2.6,
        brightness: 0.85,
      });
    }
  }

  /**
   * 2. playHover(index?) — Generative Ethereal Harp & Kalimba Whisper
   * Walks gracefully along the active scale with gentle stereo drift so rapid
   * hovering plays a dreamy floating motif instead of a single repetitive beep.
   */
  playHover(index = null) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.lastHoverTime > 0 && now - this.lastHoverTime < 0.052) return;

    const scale = this._getScale();
    let noteIdx;

    if (typeof index === "number" && Number.isFinite(index)) {
      noteIdx = 6 + (Math.abs(Math.floor(index)) % 8);
    } else {
      // Reset gently to mid-upper harp register after a pause
      if (this.lastHoverTime > 0 && now - this.lastHoverTime > 2.4) {
        this.hoverStep = 7;
        this.hoverDir = 1;
      }
      noteIdx = this.hoverStep;
      const leap = Math.random() > 0.72 ? 2 : 1;
      this.hoverStep += this.hoverDir * leap;
      if (this.hoverStep >= 14) {
        this.hoverStep = 14;
        this.hoverDir = -1;
      } else if (this.hoverStep <= 6) {
        this.hoverStep = 6;
        this.hoverDir = 1;
      }
    }

    this.lastHoverTime = now;

    const freq = scale[Math.max(0, Math.min(scale.length - 1, noteIdx))];
    const pan = ((noteIdx - 10) / 6) * 0.55;

    // Soft silk harp pluck + delicate glassy sparkle
    this._synthHarp({
      freq,
      startTime: now,
      pan,
      gain: 0.075,
      decay: 1.35,
      brightness: 0.48,
      reverbAmt: 0.8,
      delayAmt: 0.35,
    });
  }

  /**
   * 3. playFocus(index?) — Grand Celestial Harp Bloom + Handpan Ding + Angelic Halo
   * Opens a card or modal with a rich 7-string stereo harp arpeggio anchored by
   * a deep handpan Ding and suspended over a shimmering glass-harmonica breath.
   */
  playFocus(index = 0) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const isNight = this.theme === "night";

    // Deep Handpan D3 Ding anchor
    this._synthHandpan({
      freq: 146.83,
      startTime: now,
      pan: 0,
      gain: 0.24,
      decay: 3.4,
    });

    // 7-string ascending celestial harp sweep across 3 octaves
    const notes = isNight
      ? [220.00, 293.66, 349.23, 440.00, 523.25, 659.25, 880.00]
      : [220.00, 293.66, 369.99, 440.00, 554.37, 659.25, 1108.73];

    let offset = 0.035;
    notes.forEach((freq, i) => {
      const pan = -0.68 + (i / (notes.length - 1)) * 1.36;
      this._synthHarp({
        freq,
        startTime: now + offset,
        pan,
        gain: 0.145 / Math.pow(i + 1, 0.28),
        decay: 2.2 + i * 0.22,
        brightness: 0.55 + (i / notes.length) * 0.35,
        reverbAmt: 0.9,
        delayAmt: 0.4,
      });
      // Slight golden-ratio deceleration at the top of the harp arpeggio
      offset += 0.048 * Math.pow(1.06, i);
    });

    // Ethereal Glass-Harmonica Pad Halo blooming underneath
    this._synthAngelPadBloom({
      freqs: [notes[1], notes[3], notes[5]],
      startTime: now + 0.08,
      duration: 2.6,
      gain: 0.042,
    });
  }

  /**
   * 4. playClose() — Warm Descending Handpan & Harp Resolution
   * Settles gracefully from the 5th (A4) back to the tranquil root (D4).
   */
  playClose() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    this._synthHarp({
      freq: 440.00,
      startTime: now,
      pan: 0.24,
      gain: 0.12,
      decay: 1.5,
      brightness: 0.4,
    });

    this._synthHandpan({
      freq: 293.66,
      startTime: now + 0.085,
      pan: -0.2,
      gain: 0.20,
      decay: 2.1,
    });
  }

  /**
   * 5. playEntry() — Dreamy Cloud-Sailing Overture
   * Deep resonant handpan Ding + floating asymmetrical harp & wind-chime cascade
   * + misty heavenly pad swell as the site reveals.
   */
  playEntry() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const isNight = this.theme === "night";

    // Resonant Handpan Ding foundation
    this._synthHandpan({
      freq: 146.83,
      startTime: now + 0.08,
      pan: 0,
      gain: 0.22,
      decay: 4.0,
    });

    // Dreamy harp & bell cascade
    const notes = isNight
      ? [293.66, 440.00, 523.25, 659.25, 880.00, 1046.50]
      : [293.66, 440.00, 554.37, 659.25, 880.00, 1108.73];

    notes.forEach((freq, i) => {
      const t = now + 0.16 + i * 0.115;
      const pan = (i % 2 === 0 ? -1 : 1) * (0.22 + (i / notes.length) * 0.48);

      this._synthHarp({
        freq,
        startTime: t,
        pan,
        gain: 0.12,
        decay: 2.8,
        brightness: 0.62,
      });

      if (i >= 3) {
        this._synthCrystalChime({
          freq: freq * 2,
          startTime: t + 0.055,
          pan: -pan * 0.8,
          gain: 0.036,
          decay: 2.6,
          shimmer: true,
          breezeLfo: true,
        });
      }
    });

    // Soft heavenly choir/glass mist bloom
    this._synthAngelPadBloom({
      freqs: isNight ? [293.66, 440.00, 659.25] : [293.66, 440.00, 554.37],
      startTime: now + 0.15,
      duration: 3.4,
      gain: 0.048,
    });
  }

  /* ==========================================================================
     NEW DREAMY INSTRUMENTS & INTERACTIVE CHIMES
     ========================================================================== */

  /**
   * 6. playHandpan(noteIndex, velocity) — Pure Solo Handpan Tonefield Strike
   */
  playHandpan(noteIndex = 4, velocity = 0.75) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const scale = this._getScale();
    const idx = Math.max(0, Math.min(scale.length - 1, Math.floor(noteIndex)));
    const pan = ((idx / (scale.length - 1)) - 0.5) * 0.7;

    this._synthHandpan({
      freq: scale[idx],
      startTime: this.ctx.currentTime,
      pan,
      gain: 0.26 * Math.max(0.15, Math.min(1, velocity)),
      decay: idx < 4 ? 3.4 : 2.4,
    });
  }

  /**
   * 7. playHarpGlissando(options) — Sweeping Concert Harp Strum Across Stereo Space
   */
  playHarpGlissando({
    direction = 1,
    count = 7,
    startIndex = 4,
    velocity = 0.7,
    spread = 0.048,
  } = {}) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const scale = this._getScale();
    const vel = Math.max(0.15, Math.min(1, velocity));

    for (let i = 0; i < count; i++) {
      const rawIdx = direction >= 0 ? startIndex + i : startIndex + (count - 1 - i);
      const idx = Math.max(0, Math.min(scale.length - 1, rawIdx));
      const pan = (direction >= 0 ? 1 : -1) * (-0.7 + (i / Math.max(1, count - 1)) * 1.4);

      this._synthHarp({
        freq: scale[idx],
        startTime: now + i * spread,
        pan,
        gain: (0.14 * vel) / Math.pow(i + 1, 0.2),
        decay: 2.3 + i * 0.14,
        brightness: 0.55 + (i / count) * 0.35,
        reverbAmt: 0.88,
        delayAmt: 0.42,
      });
    }
  }

  /**
   * 8. playCompassOpen() — Celestial Astrolabe Unfolding Bloom
   * Warm rising handpan fifth + shimmering golden harp flourish + airy halo.
   */
  playCompassOpen() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const scale = this._getScale();

    // Warm handpan open-fifth lift (D3 -> A3)
    this._synthHandpan({ freq: scale[0], startTime: now, pan: -0.2, gain: 0.22, decay: 3.1 });
    this._synthHandpan({ freq: scale[1], startTime: now + 0.07, pan: 0.2, gain: 0.18, decay: 2.8 });

    // Shimmering upward harp arc
    [4, 6, 7, 10, 12, 13].forEach((scaleIdx, i) => {
      this._synthHarp({
        freq: scale[scaleIdx],
        startTime: now + 0.09 + i * 0.044,
        pan: -0.55 + (i / 5) * 1.1,
        gain: 0.11,
        decay: 2.4,
        brightness: 0.72,
      });
    });

    // Whispering glass halo
    this._synthAngelPadBloom({
      freqs: [scale[4], scale[7], scale[11]],
      startTime: now + 0.06,
      duration: 2.2,
      gain: 0.04,
    });
  }

  /**
   * 9. playCompassClose() — Gentle Reverse Harp Sigh into Tranquil Grounding
   */
  playCompassClose() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const scale = this._getScale();

    [11, 8, 6, 4].forEach((scaleIdx, i) => {
      this._synthHarp({
        freq: scale[scaleIdx],
        startTime: now + i * 0.048,
        pan: 0.45 - (i / 3) * 0.9,
        gain: 0.095,
        decay: 1.7,
        brightness: 0.42,
      });
    });

    this._synthHandpan({
      freq: scale[4],
      startTime: now + 0.16,
      pan: 0,
      gain: 0.17,
      decay: 2.2,
    });
  }

  /**
   * 10. playCompassTick(quadrant) — Delicate Horological Harmonic Detent
   * Ideal when sweeping the compass needle across N / E / S / W.
   */
  playCompassTick(quadrant = 0) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.lastTickTime > 0 && now - this.lastTickTime < 0.05) return;
    this.lastTickTime = now;

    const scale = this._getScale();
    const map = [4, 7, 10, 11]; // N=D4, E=A4, S=D5, W=E5
    const freq = scale[map[Math.abs(quadrant) % 4]];
    const pan = (Math.abs(quadrant) % 4 === 1 ? 0.35 : Math.abs(quadrant) % 4 === 3 ? -0.35 : 0);

    this._playFeltTransient(now, 1850, 0.045, 0.012);
    this._synthHandpan({
      freq,
      startTime: now,
      pan,
      gain: 0.11,
      decay: 1.25,
    });
  }

  /**
   * 11. playPortalWarp(index) — Ethereal Route Transition Resonance Bloom
   * Pairs with your 8-Blade Optical Iris or Vellum page transition.
   */
  playPortalWarp(index = 0) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bank = this._getConstellations();
    const chord = bank[Math.abs(Math.floor(index)) % bank.length];

    // Deep resonant handpan ground pulse
    this._synthHandpan({
      freq: chord[0] * 0.5,
      startTime: now,
      pan: 0,
      gain: 0.24,
      decay: 3.4,
    });

    // Twin stereo crystal bells + harp bloom
    chord.slice(0, 4).forEach((freq, i) => {
      this._synthHarp({
        freq,
        startTime: now + 0.04 + i * 0.055,
        pan: (i % 2 === 0 ? -1 : 1) * 0.5,
        gain: 0.12,
        decay: 2.6,
        brightness: 0.78,
      });
    });

    this._synthCrystalChime({
      freq: chord[4] || chord[1] * 2,
      startTime: now + 0.24,
      pan: 0,
      gain: 0.09,
      decay: 3.0,
      shimmer: true,
      breezeLfo: true,
    });

    this._synthAngelPadBloom({
      freqs: [chord[0], chord[1], chord[3]],
      startTime: now + 0.05,
      duration: 2.5,
      gain: 0.052,
    });
  }

  /**
   * 12. playWindChimeBreeze(intensity) — Organic Floating Wind-Chime Gust
   * Randomly clusters 4–6 shimmering high glass/quartz chimes with gentle breeze LFOs.
   */
  playWindChimeBreeze(intensity = 0.65) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const scale = this._getScale();
    const count = 4 + Math.floor(Math.random() * 3);
    const vel = Math.max(0.2, Math.min(1, intensity));

    let t = 0;
    for (let i = 0; i < count; i++) {
      const idx = 9 + Math.floor(Math.random() * (scale.length - 9));
      const pan = (Math.random() * 2 - 1) * 0.78;

      this._synthCrystalChime({
        freq: scale[idx],
        startTime: now + t,
        pan,
        gain: (0.045 + Math.random() * 0.035) * vel,
        decay: 2.0 + Math.random() * 1.4,
        shimmer: true,
        breezeLfo: true,
      });

      t += 0.055 + Math.random() * 0.14;
    }
  }

  /* ==========================================================================
     ACOUSTIC SYNTHESIS KERNELS (Private, Leak-Free Node Cleanup)
     ========================================================================== */

  /**
   * Physical Handpan Tonefield Synthesizer
   * - Harmonic steel partials: 1.0f (body), 2.0018f (warm beating octave), 2.997f (compound fifth sing)
   * - Helmholtz cavity "Gu" resonance at 0.5f for low/mid notes
   * - Micro strike pitch-settle (1.007f -> 1.0f in 26ms) + soft felt knuckle tap
   */
  _synthHandpan({ freq, startTime, pan = 0, gain = 0.22, decay = 2.4 }) {
    if (!this.ctx) return;
    const t0 = Math.max(this.ctx.currentTime, startTime);
    const f0 = this._humanize(freq, 2.0);

    const voiceBus = this.ctx.createGain();
    const panner = this._createPanner(pan);
    const revSend = this.ctx.createGain();
    const delSend = this.ctx.createGain();

    revSend.gain.setValueAtTime(0.82, t0);
    delSend.gain.setValueAtTime(0.25, t0);

    voiceBus.connect(panner);
    panner.connect(this.dryGain);
    panner.connect(revSend);
    revSend.connect(this.reverbSend);
    panner.connect(delSend);
    delSend.connect(this.cloudDelaySend);

    // 1. Fundamental Tonefield (1.0f)
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(f0 * 1.007, t0);
    osc1.frequency.exponentialRampToValueAtTime(f0, t0 + 0.028);

    g1.gain.setValueAtTime(0.0001, t0);
    g1.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    g1.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);

    osc1.connect(g1).connect(voiceBus);
    osc1.start(t0);
    osc1.stop(t0 + decay + 0.06);

    // 2. Octave Harmonic (2.0018f — creates organic handpan acoustic shimmer)
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(f0 * 2.0018, t0);

    const d2 = decay * 0.58;
    g2.gain.setValueAtTime(0.0001, t0);
    g2.gain.linearRampToValueAtTime(gain * 0.42, t0 + 0.014);
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + d2);

    osc2.connect(g2).connect(voiceBus);
    osc2.start(t0);
    osc2.stop(t0 + d2 + 0.05);

    // 3. Compound Fifth Harmonic (2.997f — iconic steel "sing" halo)
    if (f0 * 3 < 9500) {
      const osc3 = this.ctx.createOscillator();
      const g3 = this.ctx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(f0 * 2.997, t0);

      const d3 = decay * 0.3;
      g3.gain.setValueAtTime(0.0001, t0);
      g3.gain.linearRampToValueAtTime(gain * 0.16, t0 + 0.007);
      g3.gain.exponentialRampToValueAtTime(0.0001, t0 + d3);

      osc3.connect(g3).connect(voiceBus);
      osc3.start(t0);
      osc3.stop(t0 + d3 + 0.04);
    }

    // 4. Helmholtz Cavity "Gu" Sub-Bloom (0.5f) for warm chest air resonance
    if (f0 >= 140 && f0 <= 460) {
      const sub = this.ctx.createOscillator();
      const gSub = this.ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(f0 * 0.5, t0);

      const dSub = decay * 0.48;
      gSub.gain.setValueAtTime(0.0001, t0);
      gSub.gain.linearRampToValueAtTime(gain * 0.28, t0 + 0.04);
      gSub.gain.exponentialRampToValueAtTime(0.0001, t0 + dSub);

      sub.connect(gSub).connect(voiceBus);
      sub.start(t0);
      sub.stop(t0 + dSub + 0.05);
    }

    // 5. Soft Felt Knuckle Strike Transient
    this._playFeltTransient(t0, Math.min(2200, f0 * 3.1), gain * 0.22, 0.022, voiceBus);

    // Garbage-collect voice routing nodes cleanly once fundamental finishes
    osc1.onended = () => {
      try {
        voiceBus.disconnect();
        panner.disconnect();
        revSend.disconnect();
        delSend.disconnect();
      } catch { }
    };
  }

  /**
   * Concert Harp Plucked String Synthesizer
   * - Triangle + gently detuned harmonic string body routed through an exponential
   *   lowpass filter sweep (crisp fingertip pluck melting into velvety pure tone)
   * - Delayed-attack sympathetic octave shimmer for that heavenly blooming sustain
   */
  _synthHarp({
    freq,
    startTime,
    pan = 0,
    gain = 0.14,
    decay = 2.4,
    brightness = 0.65,
    reverbAmt = 0.88,
    delayAmt = 0.38,
  }) {
    if (!this.ctx) return;
    const t0 = Math.max(this.ctx.currentTime, startTime);
    const f0 = this._humanize(freq, 2.8);

    const voiceBus = this.ctx.createGain();
    const panner = this._createPanner(pan);
    const revSend = this.ctx.createGain();
    const delSend = this.ctx.createGain();

    revSend.gain.setValueAtTime(reverbAmt, t0);
    delSend.gain.setValueAtTime(delayAmt, t0);

    voiceBus.connect(panner);
    panner.connect(this.dryGain);
    panner.connect(revSend);
    revSend.connect(this.reverbSend);
    panner.connect(delSend);
    delSend.connect(this.cloudDelaySend);

    // Dynamic Pluck Lowpass Filter (simulates natural string harmonic damping)
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    const startCutoff = Math.min(9000, f0 * (3.6 + brightness * 4.4));
    const endCutoff = Math.max(280, f0 * 1.45);
    lp.frequency.setValueAtTime(startCutoff, t0);
    lp.frequency.exponentialRampToValueAtTime(endCutoff, t0 + 0.45);
    lp.Q.setValueAtTime(0.95, t0);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(gain, t0 + 0.005);
    env.gain.exponentialRampToValueAtTime(gain * 0.28, t0 + 0.38);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);

    // Warm Nylon/Gut String Core (Triangle) + Rich Overtones (Subtle Detuned Saw)
    const oscA = this.ctx.createOscillator();
    oscA.type = "triangle";
    oscA.frequency.setValueAtTime(f0, t0);

    const oscB = this.ctx.createOscillator();
    oscB.type = "sawtooth";
    oscB.frequency.setValueAtTime(f0 * 1.0014, t0);
    const oscBGain = this.ctx.createGain();
    oscBGain.gain.setValueAtTime(0.24, t0);

    oscA.connect(lp);
    oscB.connect(oscBGain).connect(lp);
    lp.connect(env).connect(voiceBus);

    oscA.start(t0);
    oscB.start(t0);
    oscA.stop(t0 + decay + 0.06);
    oscB.stop(t0 + decay + 0.06);

    // Heavenly Delayed-Bloom Octave Shimmer (swells in softly after the pluck!)
    if (f0 * 2 < 7500) {
      const shim = this.ctx.createOscillator();
      const shimGain = this.ctx.createGain();
      shim.type = "sine";
      shim.frequency.setValueAtTime(f0 * 2.0, t0);

      shimGain.gain.setValueAtTime(0.0001, t0);
      shimGain.gain.linearRampToValueAtTime(gain * 0.24, t0 + 0.11);
      shimGain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay * 0.85);

      shim.connect(shimGain).connect(voiceBus);
      shim.start(t0);
      shim.stop(t0 + decay * 0.9 + 0.05);
    }

    // Soft fingertip string-release brush
    this._playFeltTransient(t0, Math.min(3600, f0 * 4.2), gain * 0.14, 0.014, voiceBus);

    oscA.onended = () => {
      try {
        voiceBus.disconnect();
        panner.disconnect();
        revSend.disconnect();
        delSend.disconnect();
      } catch { }
    };
  }

  /**
   * Ethereal Crystal & Rotating Wind Chime Synthesizer
   * - Clean fundamental + delicate Euler-Bernoulli 2.756x crystal overtone
   * - Optional gentle LFO amplitude modulation simulating a chime turning in the breeze
   */
  _synthCrystalChime({
    freq,
    startTime,
    pan = 0,
    gain = 0.09,
    decay = 2.1,
    shimmer = true,
    breezeLfo = false,
  }) {
    if (!this.ctx) return;
    const t0 = Math.max(this.ctx.currentTime, startTime);
    const f0 = this._humanize(freq, 1.8);

    const voiceBus = this.ctx.createGain();
    const panner = this._createPanner(pan);
    const revSend = this.ctx.createGain();
    const delSend = this.ctx.createGain();

    revSend.gain.setValueAtTime(0.95, t0);
    delSend.gain.setValueAtTime(0.45, t0);

    voiceBus.connect(panner);
    panner.connect(this.dryGain);
    panner.connect(revSend);
    revSend.connect(this.reverbSend);
    panner.connect(delSend);
    delSend.connect(this.cloudDelaySend);

    // Optional gentle breeze rotation shimmer (3.5–5.5 Hz slow tremolo)
    let modTarget = voiceBus;
    let lfo = null;
    if (breezeLfo) {
      const lfoGainNode = this.ctx.createGain();
      lfoGainNode.gain.setValueAtTime(0.84, t0);

      lfo = this.ctx.createOscillator();
      const lfoDepth = this.ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(3.6 + Math.random() * 1.8, t0);
      lfoDepth.gain.setValueAtTime(0.16, t0);

      lfo.connect(lfoDepth).connect(lfoGainNode.gain);
      lfoGainNode.connect(voiceBus);
      lfo.start(t0);
      lfo.stop(t0 + decay + 0.06);
      modTarget = lfoGainNode;
    }

    // Pure singing crystal fundamental (no pitch droop!)
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(f0, t0);

    g1.gain.setValueAtTime(0.0001, t0);
    g1.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    g1.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);

    osc1.connect(g1).connect(modTarget);
    osc1.start(t0);
    osc1.stop(t0 + decay + 0.05);

    // Delicate Quartz Overtone (2.756x — restrained so it sparkles instead of clanging)
    if (f0 * 2.756 < 11500) {
      const osc2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(f0 * 2.756, t0);

      const d2 = decay * 0.36;
      g2.gain.setValueAtTime(0.0001, t0);
      g2.gain.linearRampToValueAtTime(gain * 0.22, t0 + 0.005);
      g2.gain.exponentialRampToValueAtTime(0.0001, t0 + d2);

      osc2.connect(g2).connect(modTarget);
      osc2.start(t0);
      osc2.stop(t0 + d2 + 0.04);
    }

    // Heavenly Octave Air Halo (2.0x)
    if (shimmer && f0 * 2 < 10500) {
      const osc3 = this.ctx.createOscillator();
      const g3 = this.ctx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(f0 * 2.0, t0);

      const d3 = decay * 0.72;
      g3.gain.setValueAtTime(0.0001, t0);
      g3.gain.linearRampToValueAtTime(gain * 0.18, t0 + 0.045);
      g3.gain.exponentialRampToValueAtTime(0.0001, t0 + d3);

      osc3.connect(g3).connect(modTarget);
      osc3.start(t0);
      osc3.stop(t0 + d3 + 0.04);
    }

    osc1.onended = () => {
      try {
        voiceBus.disconnect();
        panner.disconnect();
        revSend.disconnect();
        delSend.disconnect();
      } catch { }
    };
  }

  /**
   * Angelic Glass-Harmonica / Cloud Pad Swell
   * Slow-attack detuned sine/triangle halo routed predominantly into the cathedral reverb
   */
  _synthAngelPadBloom({ freqs = [293.66, 440.00], startTime, duration = 2.6, gain = 0.042 }) {
    if (!this.ctx || !freqs.length) return;
    const t0 = Math.max(this.ctx.currentTime, startTime);
    const attack = duration * 0.34;
    const perVoiceGain = gain / Math.sqrt(freqs.length);

    freqs.forEach((freq, idx) => {
      const pan = freqs.length === 1 ? 0 : -0.45 + (idx / (freqs.length - 1)) * 0.9;
      const panner = this._createPanner(pan);
      const revSend = this.ctx.createGain();
      revSend.gain.setValueAtTime(1.0, t0);

      panner.connect(this.dryGain);
      panner.connect(revSend);
      revSend.connect(this.reverbSend);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, t0);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.0001, t0);
      env.gain.linearRampToValueAtTime(perVoiceGain, t0 + attack);
      env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      // Pair of gently detuned sine waves creates warm heavenly chorusing
      const oscA = this.ctx.createOscillator();
      const oscB = this.ctx.createOscillator();
      oscA.type = "sine";
      oscB.type = "sine";
      oscA.frequency.setValueAtTime(freq * 0.9985, t0);
      oscB.frequency.setValueAtTime(freq * 1.0015, t0);

      oscA.connect(filter);
      oscB.connect(filter);
      filter.connect(env).connect(panner);

      oscA.start(t0);
      oscB.start(t0);
      oscA.stop(t0 + duration + 0.08);
      oscB.stop(t0 + duration + 0.08);

      oscA.onended = () => {
        try {
          panner.disconnect();
          revSend.disconnect();
        } catch { }
      };
    });
  }

  /**
   * Organic Felt-Mallet / Fingertip Noise Transient
   * Replaces harsh synthetic clicks with warm filtered acoustic contact
   */
  _playFeltTransient(time, centerFreq = 1600, maxGain = 0.06, duration = 0.018, dest = null) {
    if (!this.ctx || !this.noiseBuffer) return;
    const t0 = Math.max(this.ctx.currentTime, time);

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(centerFreq, t0);
    filter.Q.setValueAtTime(2.6, t0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(maxGain, t0 + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    src.connect(filter).connect(gain).connect(dest || this.dryGain);
    src.start(t0);
    src.stop(t0 + duration + 0.01);
  }
}

// Global singleton instance
export const cozyAudio = new CozyAudioEngine();