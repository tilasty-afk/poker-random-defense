export type AttackSound =
  | "high"
  | "pair"
  | "twoPair"
  | "triple"
  | "straight"
  | "flush"
  | "fullHouse"
  | "fourKind"
  | "straightFlush"
  | "royalFlush";

export type GameSound =
  | "hit"
  | "summon"
  | "reroll"
  | "sell"
  | "upgrade"
  | "boss"
  | "saintess"
  | "jackpot";

type AudioContextConstructor = new () => AudioContext;
type ToneOptions = {
  frequency: number;
  endFrequency?: number;
  duration: number;
  volume?: number;
  delay?: number;
  type?: OscillatorType;
};

const ATTACK_GAP_MS = 32;
const EFFECT_GAP_MS: Partial<Record<GameSound, number>> = {
  hit: 24,
  summon: 90,
  reroll: 90,
  sell: 80,
  upgrade: 110,
  boss: 600,
  saintess: 800,
  jackpot: 800,
};

/**
 * 외부 음원 없이 Web Audio로 짧은 게임 효과음을 만드는 관리자입니다.
 * iOS Safari 정책상 첫 터치/클릭 핸들러 안에서 unlock()을 호출해야 합니다.
 */
export class GameAudioController {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private volume = 0.72;
  private activeVoices = 0;
  private readonly maxVoices = 14;
  private readonly lastPlayed = new Map<string, number>();
  private noiseBuffer: AudioBuffer | null = null;

  get isUnlocked() {
    return this.context !== null && this.context.state !== "closed";
  }

  get isMuted() {
    return this.muted;
  }

  /** 사용자 입력 이벤트 안에서 호출해야 모바일 Safari에서도 소리가 열립니다. */
  async unlock(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    try {
      if (!this.context || this.context.state === "closed") {
        const AudioCtor = (window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: AudioContextConstructor })
            .webkitAudioContext) as AudioContextConstructor | undefined;
        if (!AudioCtor) return false;
        this.context = new AudioCtor();
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : this.volume;
        this.master.connect(this.context.destination);
        this.noiseBuffer = null;
      }
      if (this.context.state === "suspended") await this.context.resume();

      // iOS에서 출력 경로를 실제로 활성화하기 위한 무음 버퍼입니다.
      const source = this.context.createBufferSource();
      source.buffer = this.context.createBuffer(1, 1, this.context.sampleRate);
      source.connect(this.master!);
      source.start();
      return this.context.state === "running";
    } catch {
      return false;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(muted ? 0 : this.volume, now, 0.012);
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (!this.muted && this.context && this.master) {
      this.master.gain.setTargetAtTime(this.volume, this.context.currentTime, 0.012);
    }
  }

  playAttack(category: AttackSound, intensity = 1): boolean {
    if (!this.canPlay(`attack:${category}`, ATTACK_GAP_MS)) return false;
    const gain = Math.max(0.45, Math.min(1.35, intensity));
    switch (category) {
      case "high":
        this.tone({ frequency: 205, endFrequency: 150, duration: 0.055, volume: 0.055 * gain, type: "square" });
        break;
      case "pair":
        this.tone({ frequency: 290, endFrequency: 210, duration: 0.045, volume: 0.048 * gain, type: "square" });
        this.tone({ frequency: 350, endFrequency: 245, duration: 0.04, delay: 0.035, volume: 0.04 * gain, type: "square" });
        break;
      case "twoPair":
        this.noise(0.075, 0.075 * gain, 620);
        this.tone({ frequency: 145, endFrequency: 88, duration: 0.1, volume: 0.07 * gain, type: "sawtooth" });
        break;
      case "triple":
        this.tone({ frequency: 260, endFrequency: 95, duration: 0.16, volume: 0.07 * gain, type: "sine" });
        this.noise(0.12, 0.055 * gain, 980, 0.035);
        break;
      case "straight":
        this.tone({ frequency: 780, endFrequency: 360, duration: 0.08, volume: 0.045 * gain, type: "triangle" });
        this.noise(0.045, 0.025 * gain, 1700);
        break;
      case "flush":
        this.tone({ frequency: 315, endFrequency: 175, duration: 0.18, volume: 0.05 * gain, type: "sine" });
        this.tone({ frequency: 472, endFrequency: 220, duration: 0.15, delay: 0.025, volume: 0.03 * gain, type: "triangle" });
        this.noise(0.16, 0.025 * gain, 500);
        break;
      case "fullHouse":
        [523, 659, 784].forEach((frequency, index) =>
          this.tone({ frequency, duration: 0.16, delay: index * 0.025, volume: 0.026 * gain, type: "sine" }),
        );
        break;
      case "fourKind":
        this.noise(0.1, 0.08 * gain, 1450);
        this.tone({ frequency: 230, endFrequency: 82, duration: 0.18, volume: 0.09 * gain, type: "sawtooth" });
        this.tone({ frequency: 520, endFrequency: 180, duration: 0.11, volume: 0.045 * gain, type: "triangle" });
        break;
      case "straightFlush":
        this.tone({ frequency: 920, endFrequency: 175, duration: 0.2, volume: 0.065 * gain, type: "sawtooth" });
        this.noise(0.16, 0.06 * gain, 1900, 0.025);
        break;
      case "royalFlush":
        this.tone({ frequency: 92, endFrequency: 55, duration: 0.38, volume: 0.11 * gain, type: "sawtooth" });
        this.tone({ frequency: 370, endFrequency: 110, duration: 0.32, volume: 0.055 * gain, type: "triangle" });
        this.noise(0.3, 0.075 * gain, 850, 0.035);
        break;
    }
    return true;
  }

  play(sound: GameSound): boolean {
    if (!this.canPlay(sound, EFFECT_GAP_MS[sound] ?? 60)) return false;
    switch (sound) {
      case "hit":
        this.noise(0.035, 0.035, 1100);
        this.tone({ frequency: 125, endFrequency: 80, duration: 0.04, volume: 0.03, type: "square" });
        break;
      case "summon":
        [330, 440, 660].forEach((frequency, index) =>
          this.tone({ frequency, duration: 0.12, delay: index * 0.055, volume: 0.045, type: "triangle" }),
        );
        break;
      case "reroll":
        [440, 330, 520].forEach((frequency, index) =>
          this.tone({ frequency, duration: 0.065, delay: index * 0.04, volume: 0.04, type: "square" }),
        );
        break;
      case "sell":
        this.tone({ frequency: 740, endFrequency: 980, duration: 0.08, volume: 0.045, type: "sine" });
        this.tone({ frequency: 1100, duration: 0.055, delay: 0.055, volume: 0.035, type: "triangle" });
        break;
      case "upgrade":
        [392, 523, 659, 784].forEach((frequency, index) =>
          this.tone({ frequency, duration: 0.11, delay: index * 0.045, volume: 0.04, type: "triangle" }),
        );
        break;
      case "boss":
        this.tone({ frequency: 73, endFrequency: 48, duration: 0.65, volume: 0.13, type: "sawtooth" });
        this.noise(0.48, 0.08, 380, 0.05);
        this.tone({ frequency: 146, endFrequency: 62, duration: 0.42, delay: 0.18, volume: 0.08, type: "square" });
        break;
      case "saintess":
        [523, 659, 784, 1047, 1319].forEach((frequency, index) =>
          this.tone({ frequency, duration: 0.4, delay: index * 0.07, volume: 0.038, type: "sine" }),
        );
        this.noise(0.5, 0.035, 2400, 0.18);
        break;
      case "jackpot":
        [659, 784, 988, 1319, 1568, 1976].forEach((frequency, index) =>
          this.tone({ frequency, duration: 0.18, delay: index * 0.07, volume: 0.042, type: "square" }),
        );
        this.tone({ frequency: 2637, duration: 0.38, delay: 0.42, volume: 0.035, type: "sine" });
        break;
    }
    return true;
  }

  async dispose() {
    const context = this.context;
    this.context = null;
    this.master = null;
    this.noiseBuffer = null;
    this.activeVoices = 0;
    this.lastPlayed.clear();
    if (context && context.state !== "closed") await context.close();
  }

  private canPlay(key: string, gapMs: number) {
    if (this.muted || !this.context || !this.master || this.context.state !== "running") return false;
    if (this.activeVoices >= this.maxVoices) return false;
    const now = performance.now();
    const last = this.lastPlayed.get(key) ?? -Infinity;
    if (now - last < gapMs) return false;
    this.lastPlayed.set(key, now);
    return true;
  }

  private tone(options: ToneOptions) {
    const context = this.context;
    const master = this.master;
    if (!context || !master || this.activeVoices >= this.maxVoices) return;
    const start = context.currentTime + (options.delay ?? 0);
    const end = start + options.duration;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = options.type ?? "square";
    oscillator.frequency.setValueAtTime(Math.max(20, options.frequency), start);
    if (options.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, options.endFrequency), end);
    }
    const peak = Math.max(0.0001, options.volume ?? 0.05);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + Math.min(0.012, options.duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(master);
    this.trackVoice(oscillator);
    oscillator.start(start);
    oscillator.stop(end + 0.01);
  }

  private noise(duration: number, volume: number, cutoff = 1200, delay = 0) {
    const context = this.context;
    const master = this.master;
    if (!context || !master || this.activeVoices >= this.maxVoices) return;
    if (!this.noiseBuffer) {
      const length = Math.ceil(context.sampleRate * 0.75);
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < length; index++) channel[index] = Math.random() * 2 - 1;
      this.noiseBuffer = buffer;
    }
    const start = context.currentTime + delay;
    const end = start + duration;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + Math.min(0.008, duration * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    this.trackVoice(source);
    source.start(start);
    source.stop(end + 0.01);
  }

  private trackVoice(source: AudioScheduledSourceNode) {
    this.activeVoices += 1;
    source.addEventListener(
      "ended",
      () => {
        this.activeVoices = Math.max(0, this.activeVoices - 1);
        source.disconnect();
      },
      { once: true },
    );
  }
}

export function createGameAudio() {
  return new GameAudioController();
}

