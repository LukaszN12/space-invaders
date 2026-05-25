import { CANVAS, PLAYER, GAME } from '../constants';
import { InputManager } from '../InputManager';
import { Rect } from '../types';

export class Player {
  x: number;
  y: number;
  alive: boolean;
  deathTimer: number;  // counts down while exploding

  constructor() {
    this.x = CANVAS.WIDTH / 2;
    this.y = PLAYER.START_Y;
    this.alive = true;
    this.deathTimer = 0;
  }

  reset(): void {
    this.x = CANVAS.WIDTH / 2;
    this.alive = true;
    this.deathTimer = 0;
  }

  update(dt: number, input: InputManager): void {
    if (!this.alive) {
      this.deathTimer -= dt;
      return;
    }

    if (input.left) {
      this.x -= PLAYER.SPEED * dt;
    }
    if (input.right) {
      this.x += PLAYER.SPEED * dt;
    }

    // Clamp to canvas
    const half = PLAYER.WIDTH / 2;
    this.x = Math.max(PLAYER.MARGIN + half, Math.min(CANVAS.WIDTH - PLAYER.MARGIN - half, this.x));
  }

  die(): void {
    this.alive = false;
    this.deathTimer = GAME.PLAYER_DEATH_DURATION;
  }

  get isExploding(): boolean {
    return !this.alive && this.deathTimer > 0;
  }

  get isDoneExploding(): boolean {
    return !this.alive && this.deathTimer <= 0;
  }

  getBounds(): Rect {
    return {
      x: this.x - PLAYER.WIDTH / 2,
      y: this.y - PLAYER.HEIGHT / 2,
      w: PLAYER.WIDTH,
      h: PLAYER.HEIGHT,
    };
  }
}
