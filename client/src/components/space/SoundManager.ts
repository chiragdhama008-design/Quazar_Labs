// Web Audio API ambient cosmic soundscape synthesizer
class SoundManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private ambientGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfoNodes: OscillatorNode[] = [];

  constructor() {
    // Check if previously enabled by user
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quazar_sound_enabled');
      this.isEnabled = saved === 'true';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getStatus(): boolean {
    return this.isEnabled;
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('quazar_sound_enabled', String(this.isEnabled));
    }

    if (this.isEnabled) {
      this.initContext();
      this.startAmbient();
      this.playTelemetryChirp(880, 0.08);
    } else {
      this.stopAmbient();
    }

    return this.isEnabled;
  }

  public startAmbient() {
    if (!this.isEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.ambientGain) return; // Already running

    // Master ambient gain — audible but not overpowering
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 3);
    masterGain.connect(this.ctx.destination);
    this.ambientGain = masterGain;

    // ── Deep cosmic drone chord (F#2 pentatonic) ──
    const droneFrequencies = [92.5, 138.59, 185.0, 277.18];

    this.oscillators = droneFrequencies.map((freq, i) => {
      if (!this.ctx) throw new Error('No ctx');
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Individual oscillator volume
      oscGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      // Low pass filter for soft ethereal warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      filter.connect(masterGain);
      osc.start();
      return osc;
    });

    // ── Slow LFO tremolo for cosmic pulsing feel ──
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime); // Very slow pulse
    lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain); // Modulate the master volume subtly
    lfo.start();
    this.lfoNodes.push(lfo);

    // ── High ethereal shimmer layer ──
    const shimmer = this.ctx.createOscillator();
    const shimmerGain = this.ctx.createGain();
    const shimmerFilter = this.ctx.createBiquadFilter();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(1480, this.ctx.currentTime); // High ethereal tone
    shimmerGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    shimmerGain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 5); // Fade in slowly
    shimmerFilter.type = 'bandpass';
    shimmerFilter.frequency.setValueAtTime(1500, this.ctx.currentTime);
    shimmerFilter.Q.setValueAtTime(8, this.ctx.currentTime);
    shimmer.connect(shimmerFilter);
    shimmerFilter.connect(shimmerGain);
    shimmerGain.connect(masterGain);
    shimmer.start();
    this.oscillators.push(shimmer);

    // ── Sub-bass rumble for deep space feel ──
    const subBass = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subBass.type = 'sine';
    subBass.frequency.setValueAtTime(46.25, this.ctx.currentTime); // Very low sub-bass F#1
    subGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    subGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 4);
    subBass.connect(subGain);
    subGain.connect(masterGain);
    subBass.start();
    this.oscillators.push(subBass);

    // ── Noise-based nebula wind layer ──
    this.createNebulaWind(masterGain);
  }

  private createNebulaWind(destination: GainNode) {
    if (!this.ctx) return;

    // Create filtered noise for a cosmic wind/hiss texture
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Bandpass filter to shape it into a "space wind" texture
    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(300, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    windGain.gain.linearRampToValueAtTime(0.025, this.ctx.currentTime + 6);

    noise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(destination);
    noise.start();

    // Store reference so we can stop it later
    (noise as any)._quazarWind = true;
    this.oscillators.push(noise as any);
  }

  public stopAmbient() {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.5);
      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (_) {}
        });
        this.lfoNodes.forEach(lfo => {
          try {
            lfo.stop();
            lfo.disconnect();
          } catch (_) {}
        });
        this.oscillators = [];
        this.lfoNodes = [];
        this.ambientGain?.disconnect();
        this.ambientGain = null;
      }, 1500);
    }
  }

  public playTelemetryChirp(freq = 640, duration = 0.05) {
    if (!this.isEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);

      // Louder chirp so it's actually audible
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration + 0.05);
    } catch (_) {}
  }
}

export const soundManager = new SoundManager();
