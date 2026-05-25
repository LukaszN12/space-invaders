import { CANVAS } from '../constants';
import { Rect } from '../types';

export class Bullet {
  x: number;
  y: number;
  vy: number;         // velocity y: negative = up, positive = down
  active: boolean;
  isPlayerBullet: boolean;

  private static readonly WIDTH = 3;
  private static readonly HEIGHT = 14;

  constructor(x: number, y: number, speed: number, isPlayerBullet: boolean) {
    this.x = x;
    this.y = y;
    this.vy = isPlayerBullet ? -speed : speed;
    this.active = true;
    this.isPlayerBullet = isPlayerBullet;
  }

  update(dt: number): void {
    this.y += this.vy * dt;
    if (this.y < -20 || this.y > CANVAS.HEIGHT + 20) {
      this.active = false;
    }
  }

  getBounds(): Rect {
    return {
      x: this.x - Bullet.WIDTH / 2,
      y: this.y - Bullet.HEIGHT / 2,
      w: Bullet.WIDTH,
      h: Bullet.HEIGHT,
    };
  }

  get drawX(): number { return this.x; }
  get drawY(): number { return this.y; }
  get drawW(): number { return Bullet.WIDTH; }
  get drawH(): number { return Bullet.HEIGHT; }
}
