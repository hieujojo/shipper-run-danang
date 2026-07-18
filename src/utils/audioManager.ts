import { Howl, Howler } from "howler";

interface IAudioManager {
  playEngine(): void;
  stopEngine(): void;
  playCrash(): void;
  playCoin(): void;
  setMasterVolume(volume: number): void;
}

class AudioManager implements IAudioManager {
  private engine: Howl;
  private crash: Howl;
  private coin: Howl;

  constructor() {
    this.engine = new Howl({
      src: ["/sounds/engine.wav"],
      loop: true,
      volume: 1,
    });

    this.crash = new Howl({
      src: ["/sounds/crash.mp3"],
      volume: 0.08,
    });

    this.coin = new Howl({
      src: ["/sounds/coin.wav"],
      volume: 1,
    });
  }

  playEngine(): void {
    if (!this.engine.playing()) {
      this.engine.play();
    }
  }

  stopEngine(): void {
    this.engine.stop();
  }

  playCrash(): void {
    this.crash.play();
  }

  playCoin(): void {
    this.coin.play();
  }

  setMasterVolume(volume: number): void {
    Howler.volume(volume);
  }
}

export const audioManager = new AudioManager();