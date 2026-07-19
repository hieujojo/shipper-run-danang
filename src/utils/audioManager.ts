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
  private bgm: Howl;

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

    this.bgm = new Howl({
      src: ["/sounds/bgm.wav"],
      loop: true,
      volume: 0.1,
    });
  }

  playBGM(): void {
    if (!this.bgm.playing()) {
      this.bgm.play();
    }
  }

  stopBGM(): void {
    this.bgm.stop();
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