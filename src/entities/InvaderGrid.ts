import { INVADER, CANVAS, GAME, POINTS_TABLE } from '../constants';
import { AudioManager } from '../AudioManager';
import { Invader } from './Invader';
import { Bullet } from './Bullet';

export class InvaderGrid {
  readonly grid: Invader[][];
  activeBullets: Bullet[];
  animFrame: 0 | 1;

  private direction: 1 | -1;
  private moveTimer: number;      // accumulated ms
  private baseMoveInterval: number;
  private stepPending: boolean;   // next step should go down
  private marchIndex: number;
  private shootTimer: number;
  private readonly audio: AudioManager;

  constructor(level: number, audio: AudioManager) {
    this.audio = audio;
    this.direction = 1;
    this.moveTimer = 0;
    this.stepPending = false;
    this.marchIndex = 0;
    this.animFrame = 0;
    this.activeBullets = [];
    this.shootTimer = 0;

    // Faster base interval each level (15% faster, min 200ms)
    const reduction = Math.min(0.7, (level - 1) * 0.15);
    this.baseMoveInterval = Math.max(200, INVADER.BASE_INTERVAL * (1 - reduction));

    this.grid = this.buildGrid();
  }

  private buildGrid(): Invader[][] {
    const grid: Invader[][] = [];
    for (let r = 0; r < INVADER.ROWS; r++) {
      grid[r] = [];
      for (let c = 0; c < INVADER.COLS; c++) {
        const x = INVADER.GRID_START_X + c * INVADER.H_SPACING;
        const y = INVADER.GRID_START_Y + r * INVADER.V_SPACING;
        grid[r][c] = new Invader(x, y, r, c);
      }
    }
    return grid;
  }

  count(): number {
    let n = 0;
    for (let r = 0; r < INVADER.ROWS; r++) {
      for (let c = 0; c < INVADER.COLS; c++) {
        if (this.grid[r][c].alive) n++;
      }
    }
    return n;
  }

  /** Lowest y-center among alive invaders */
  lowestY(): number {
    let maxY = 0;
    for (let r = 0; r < INVADER.ROWS; r++) {
      for (let c = 0; c < INVADER.COLS; c++) {
        if (this.grid[r][c].alive) {
          maxY = Math.max(maxY, this.grid[r][c].y);
        }
      }
    }
    return maxY;
  }

  private computeMoveInterval(): number {
    const alive = this.count();
    const total = INVADER.COLS * INVADER.ROWS;
    if (alive === 0) return this.baseMoveInterval;
    const t = 1 - alive / total; // 0=full, 1=empty
    return this.baseMoveInterval - t * (this.baseMoveInterval - INVADER.MIN_INTERVAL);
  }

  update(dt: number): void {
    // --- Update death animations ---
    for (let r = 0; r < INVADER.ROWS; r++) {
      for (let c = 0; c < INVADER.COLS; c++) {
        this.grid[r][c].updateDeath(dt);
      }
    }

    // --- Movement ---
    this.moveTimer += dt * 1000;
    const interval = this.computeMoveInterval();

    while (this.moveTimer >= interval) {
      this.moveTimer -= interval;
      this.step();
    }

    // --- Bullets ---
    for (const b of this.activeBullets) {
      b.update(dt);
    }
    this.activeBullets = this.activeBullets.filter((b) => b.active);

    // --- Shooting ---
    this.shootTimer += dt;
    const shootInterval = 1 / GAME.SHOOT_PROB_PER_SEC; // ~1.67s between shots
    if (this.shootTimer >= shootInterval) {
      this.shootTimer -= shootInterval;
      this.tryShoot();
    }
  }

  private step(): void {
    this.animFrame = this.animFrame === 0 ? 1 : 0;

    if (this.stepPending) {
      // Move all alive invaders down
      for (let r = 0; r < INVADER.ROWS; r++) {
        for (let c = 0; c < INVADER.COLS; c++) {
          if (this.grid[r][c].alive) {
            this.grid[r][c].y += INVADER.STEP_DOWN;
          }
        }
      }
      this.stepPending = false;
    } else {
      // Move horizontally
      for (let r = 0; r < INVADER.ROWS; r++) {
        for (let c = 0; c < INVADER.COLS; c++) {
          if (this.grid[r][c].alive) {
            this.grid[r][c].x += this.direction * INVADER.H_STEP;
          }
        }
      }

      // Check edges
      let minX = Infinity;
      let maxX = -Infinity;
      for (let r = 0; r < INVADER.ROWS; r++) {
        for (let c = 0; c < INVADER.COLS; c++) {
          if (this.grid[r][c].alive) {
            const inv = this.grid[r][c];
            minX = Math.min(minX, inv.x - INVADER.WIDTH / 2);
            maxX = Math.max(maxX, inv.x + INVADER.WIDTH / 2);
          }
        }
      }

      if (
        maxX >= CANVAS.WIDTH - INVADER.EDGE_MARGIN ||
        minX <= INVADER.EDGE_MARGIN
      ) {
        this.direction = this.direction === 1 ? -1 : 1;
        this.stepPending = true;
      }
    }

    // March sound
    this.audio.playMarch(this.marchIndex);
    this.marchIndex = (this.marchIndex + 1) % 4;
  }

  private tryShoot(): void {
    if (this.activeBullets.length >= GAME.INVADER_BULLET_MAX) return;

    // Collect bottom-most alive invader per column
    const shooters: Invader[] = [];
    for (let c = 0; c < INVADER.COLS; c++) {
      for (let r = INVADER.ROWS - 1; r >= 0; r--) {
        if (this.grid[r][c].alive) {
          shooters.push(this.grid[r][c]);
          break;
        }
      }
    }
    if (shooters.length === 0) return;

    const shooter = shooters[Math.floor(Math.random() * shooters.length)];
    const bullet = new Bullet(
      shooter.x,
      shooter.y + INVADER.HEIGHT / 2 + 4,
      INVADER.BULLET_SPEED,
      false,
    );
    this.activeBullets.push(bullet);
  }

  /** Returns row=0..4, col=0..10 invader */
  getInvader(row: number, col: number): Invader {
    return this.grid[row][col];
  }

  /** Score value of a given invader row */
  static rowPoints(row: number): number {
    return POINTS_TABLE.INVADER_ROW[row];
  }

  /** Clear all bullets (called on player respawn) */
  clearBullets(): void {
    this.activeBullets = [];
  }
}
