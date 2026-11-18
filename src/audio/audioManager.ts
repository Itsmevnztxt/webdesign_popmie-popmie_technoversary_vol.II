export type SfxName =
  | 'wake'
  | 'cloud'
  | 'pollinate'
  | 'sort-ok'
  | 'sort-err'
  | 'rain'
  | 'soil'
  | 'water'
  | 'badge'
  | 'click';

export const AUDIO_PATHS = {
  bgm: '/assets/audio/bgm-rimba.mp3',
  sfx: {
    wake: '/assets/audio/sfx-biji-wake.mp3',
    cloud: '/assets/audio/sfx-whoosh.mp3',
    pollinate: '/assets/audio/sfx-pollinate.mp3',
    'sort-ok': '/assets/audio/sfx-correct.mp3',
    'sort-err': '/assets/audio/sfx-gentle-oops.mp3',
    rain: '/assets/audio/sfx-rain.mp3',
    soil: '/assets/audio/sfx-soil-dig.mp3',
    water: '/assets/audio/sfx-water-drop.mp3',
    badge: '/assets/audio/sfx-badge-unlock.mp3',
    click: '/assets/audio/sfx-wood-tap.mp3'
  } satisfies Record<SfxName, string>
} as const;

const SOUND_STORAGE_KEY = 'rimbakecil_sound_enabled';

class RimbaAudioManager {
  private enabled = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private missingPaths = new Set<string>();
  private audioCtx: AudioContext | null = null;
  private listeners = new Set<(enabled: boolean) => void>();
  private gestureListenerAttached = false;

  constructor() {
    try {
      const saved = window.localStorage.getItem(SOUND_STORAGE_KEY);
      if (saved === 'true') {
        this.enabled = true;
        this.attachResumeOnGesture();
      }
    } catch {
      // Ignore storage access issues
    }
  }

  private attachResumeOnGesture() {
    if (typeof window === 'undefined' || this.gestureListenerAttached) return;
    this.gestureListenerAttached = true;

    const resume = () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
      this.gestureListenerAttached = false;
      if (this.enabled) {
        this.startBgm();
      }
    };

    window.addEventListener('pointerdown', resume, { once: true, passive: true });
    window.addEventListener('keydown', resume, { once: true, passive: true });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  subscribe(listener: (enabled: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.enabled);
    }
  }

  setEnabled(next: boolean) {
    this.enabled = Boolean(next);
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, String(this.enabled));
    } catch {
      // Ignore storage errors
    }

    if (this.enabled) {
      this.startBgm();
      this.playToneSequence([523.25, 659.25], 0.09, 'sine', 0.05);
    } else {
      this.stopBgm();
    }
    this.notify();
  }

  toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  startBgm() {
    if (!this.enabled || typeof window === 'undefined' || typeof Audio === 'undefined') return;
    if (this.missingPaths.has(AUDIO_PATHS.bgm)) return;

    try {
      if (!this.bgmAudio) {
        const audio = new Audio(AUDIO_PATHS.bgm);
        audio.loop = true;
        audio.volume = 0.28;
        audio.addEventListener('error', () => {
          this.missingPaths.add(AUDIO_PATHS.bgm);
          this.bgmAudio = null;
        });
        this.bgmAudio = audio;
      }
      const playPromise = this.bgmAudio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err: unknown) => {
          const errorName = err instanceof Error ? err.name : '';
          if (errorName === 'NotAllowedError') {
            this.attachResumeOnGesture();
          } else {
            this.missingPaths.add(AUDIO_PATHS.bgm);
            this.bgmAudio = null;
          }
        });
      }
    } catch {
      this.missingPaths.add(AUDIO_PATHS.bgm);
      this.bgmAudio = null;
    }
  }

  stopBgm() {
    if (!this.bgmAudio) return;
    try {
      this.bgmAudio.pause();
    } catch {
      // Ignore
    }
  }

  playSfx(name: SfxName) {
    if (!this.enabled || typeof window === 'undefined') return;

    if (!this.bgmAudio && !this.missingPaths.has(AUDIO_PATHS.bgm)) {
      this.startBgm();
    }

    const src = AUDIO_PATHS.sfx[name];
    if (src && typeof Audio !== 'undefined' && !this.missingPaths.has(src)) {
      try {
        const audio = new Audio(src);
        audio.volume = 0.45;
        let fellBack = false;
        const triggerFallback = (markMissing: boolean) => {
          if (markMissing) {
            this.missingPaths.add(src);
          }
          if (fellBack) return;
          fellBack = true;
          this.playFallbackSfx(name);
        };
        audio.addEventListener('error', () => triggerFallback(true), { once: true });
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err: unknown) => {
            const errorName = err instanceof Error ? err.name : '';
            triggerFallback(errorName !== 'NotAllowedError');
          });
        }
        return;
      } catch {
        this.missingPaths.add(src);
      }
    }

    this.playFallbackSfx(name);
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!this.audioCtx) {
      try {
        this.audioCtx = new Ctx();
      } catch {
        return null;
      }
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private playToneSequence(
    freqs: number[],
    stepDuration: number,
    wave: OscillatorType = 'sine',
    gainLevel = 0.06
  ) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, now + idx * stepDuration);
        gain.gain.setValueAtTime(0.001, now + idx * stepDuration);
        gain.gain.exponentialRampToValueAtTime(gainLevel, now + idx * stepDuration + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx + 1) * stepDuration + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * stepDuration);
        osc.stop(now + (idx + 1) * stepDuration + 0.1);
      });
    } catch {
      // Ignore Web Audio errors in restricted environments
    }
  }

  private playFallbackSfx(name: SfxName) {
    switch (name) {
      case 'wake':
        this.playToneSequence([392, 493.88, 587.33], 0.09, 'triangle', 0.06);
        break;
      case 'cloud':
        this.playToneSequence([329.63, 440], 0.07, 'sine', 0.045);
        break;
      case 'pollinate':
        this.playToneSequence([523.25, 659.25, 783.99], 0.08, 'sine', 0.06);
        break;
      case 'sort-ok':
        this.playToneSequence([587.33, 783.99], 0.08, 'triangle', 0.055);
        break;
      case 'sort-err':
        this.playToneSequence([311.13, 277.18], 0.1, 'sine', 0.05);
        break;
      case 'rain':
        this.playToneSequence([440, 523.25, 659.25], 0.09, 'sine', 0.045);
        break;
      case 'soil':
        this.playToneSequence([220, 261.63], 0.06, 'triangle', 0.05);
        break;
      case 'water':
        this.playToneSequence([493.88, 659.25], 0.07, 'sine', 0.05);
        break;
      case 'badge':
        this.playToneSequence([523.25, 659.25, 783.99, 1046.5], 0.09, 'triangle', 0.07);
        break;
      case 'click':
      default:
        this.playToneSequence([440], 0.05, 'sine', 0.035);
        break;
    }
  }
}

export const audioManager = new RimbaAudioManager();
