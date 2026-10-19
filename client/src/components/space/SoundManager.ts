// Web Audio API ambient cosmic soundscape synthesizer
class SoundManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private ambientGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];

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

    // Master ambient gain
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 3);
    masterGain.connect(this.ctx.destination);
    this.ambientGain = masterGain;

    // Deep cosmic low chord (F-sharp minor pentatonic drone)
    const frequencies = [92.5, 138.59, 185.0, 277.18]; // F#2, C#3, F#3, C#4

    this.oscillators = frequencies.map((freq, i) => {
      if (!this.ctx) throw new Error('No ctx');
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Low pass filter for soft ethereal warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(masterGain);
      osc.start();
      return osc;
    });
  }

  public stopAmbient() {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (_) {}
        });
        this.oscillators = [];
        this.ambientGain?.disconnect();
        this.ambientGain = null;
      }, 1000);
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

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }
}

export const soundManager = new SoundManager();
