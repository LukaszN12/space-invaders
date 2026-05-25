import { UFO_CFG, CANVAS, POINTS_TABLE } from '../constants';
import { Rect } from '../types';

export class UFO {
  x: number;
  y: number;
  active: boolean;
  direction: 1 | -1;
  pointValue: number;
  private spawnTimer: number;
  private readonly audio: import('../AudioManager').AudioManager;

  constructor(audio: import('../AudioManager').AudioManager) {
    this.audio = audio;
    this.x = 0;
    this.y = UFO_CFG.Y;
    this.active = false;
    this.direction = 1;
    this.pointValue = 0;
    this.spawnTimer = UFO_CFG.SPAWN_INTERVAL * 0.5; // first spawn slightly faster
  }

  update(dt: number): void {
    if (this.active) {
      this.x += this.direction * UFO_CFG.SPEED * dt;
      // Deactivate when off screen
      if (this.x > CANVAS.WIDTH + UFO_CFG.WIDTH || this.x < -UFO_CFG.WIDTH) {
        this.active = false;
        this.audio.stopUFOHum();
        this.spawnTimer = UFO_CFG.SPAWN_INTERVAL;
      }
    } else {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawn();
      }
    }
  }

  private spawn(): void {
    this.active = true;
    this.pointValue =
      POINTS_TABLE.UFO_VALUES[Math.floor(Math.random() * POINTS_TABLE.UFO_VALUES.length)];
    // Alternate directions
    this.direction = Math.random() < 0.5 ? 1 : -1;
    this.x = this.direction === 1 ? -UFO_CFG.WIDTH / 2 : CANVAS.WIDTH + UFO_CFG.WIDTH / 2;
    this.spawnTimer = UFO_CFG.SPAWN_INTERVAL;
    this.audio.startUFOHum();
  }

  hit(): void {
    this.active = false;
    this.audio.stopUFOHum();
    this.spawnTimer = UFO_CFG.SPAWN_INTERVAL;
  }

  getBounds(): Rect {
    return {
      x: this.x - UFO_CFG.WIDTH / 2,
      y: this.y - UFO_CFG.HEIGHT / 2,
      w: UFO_CFG.WIDTH,
      h: UFO_CFG.HEIGHT,
    };
  }
}
