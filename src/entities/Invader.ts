import { INVADER, POINTS_TABLE, GAME } from '../constants';
import { Rect } from '../types';

export class Invader {
  x: number;
  y: number;
  row: number;
  col: number;
  alive: boolean;
  dying: boolean;
  deathTimer: number;
  points: number;

  constructor(x: number, y: number, row: number, col: number) {
    this.x = x;
    this.y = y;
    this.row = row;
    this.col = col;
    this.alive = true;
    this.dying = false;
    this.deathTimer = 0;
    this.points = POINTS_TABLE.INVADER_ROW[row];
  }

  kill(): void {
    this.alive = false;
    this.dying = true;
    this.deathTimer = GAME.INVADER_DEATH_DURATION;
  }

  updateDeath(dt: number): void {
    if (this.dying) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.dying = false;
      }
    }
  }

  getBounds(): Rect {
    return {
      x: this.x - INVADER.WIDTH / 2,
      y: this.y - INVADER.HEIGHT / 2,
      w: INVADER.WIDTH,
      h: INVADER.HEIGHT,
    };
  }

  /**
   * Returns sprite type: 0 = top row (30pts), 1 = middle rows (20pts), 2 = bottom rows (10pts)
   */
  get spriteType(): 0 | 1 | 2 {
    if (this.row === 0) return 0;
    if (this.row <= 2) return 1;
    return 2;
  }
}
