export type SoundId =
  | 'march0'
  | 'march1'
  | 'march2'
  | 'march3'
  | 'playerShoot'
  | 'invaderKill'
  | 'playerDeath'
  | 'ufoHit'
  | 'levelUp';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private ufoOsc: OscillatorNode | null = null;
  private _muted = false;

  get muted(): boolean {
    return this._muted;
  }

  toggleMute(): void {
    this._muted = !this._muted;
    if (this._muted) {
      this.stopUFOHum();
    }
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  play(id: SoundId): void {
    if (this._muted) return;
    try {
      switch (id) {
        case 'march0': this.tone(160, 'square', 0.07, 0.4); break;
        case 'march1': this.tone(180, 'square', 0.07, 0.4); break;
        case 'march2': this.tone(120, 'square', 0.07, 0.4); break;
        case 'march3': this.tone(100, 'square', 0.07, 0.4); break;
        case 'playerShoot': this.shootSound(); break;
        case 'invaderKill': this.noiseBlast(0.12); break;
        case 'playerDeath': this.deathSound(); break;
        case 'ufoHit': this.noiseBlast(0.35); break;
        case 'levelUp': this.levelUpSound(); break;
      }
    } catch {
      // Audio errors are non-fatal
    }
  }

  playMarch(index: number): void {
    this.play(`march${index % 4}` as SoundId);
  }

  startUFOHum(): void {
    if (this._muted) return;
    if (this.ufoOsc) return; // already humming
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      lfo.frequency.value = 8;
      lfoGain.gain.value = 30;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.type = 'sawtooth';
      osc.frequency.value = 110;
      gain.gain.value = 0.15;

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start();
      osc.start();

      this.ufoOsc = osc;
    } catch {
      // Non-fatal
    }
  }

  stopUFOHum(): void {
    try {
      this.ufoOsc?.stop();
    } catch {
      // already stopped
    }
    this.ufoOsc = null;
  }

  // --- Private sound builders ---

  private tone(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume = 0.3,
  ): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  private shootSound(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  private noiseBlast(duration: number): void {
    const ctx = this.getCtx();
    const sampleRate = ctx.sampleRate;
    const frameCount = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration);
  }

  private deathSound(): void {
    // Descending tone sequence
    const freqs = [300, 220, 160, 110, 80];
    freqs.forEach((freq, i) => {
      setTimeout(() => {
        if (!this._muted) {
          try {
            this.tone(freq, 'sawtooth', 0.18, 0.4);
          } catch {
            // Non-fatal
          }
        }
      }, i * 120);
    });
  }

  private levelUpSound(): void {
    const freqs = [523, 659, 784, 1047];
    freqs.forEach((freq, i) => {
      setTimeout(() => {
        if (!this._muted) {
          try {
            this.tone(freq, 'square', 0.12, 0.25);
          } catch {
            // Non-fatal
          }
        }
      }, i * 100);
    });
  }
}
