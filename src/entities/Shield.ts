import { SHIELD, CANVAS } from '../constants';
import { Rect } from '../types';

// Arch shape: 1 = solid, 0 = empty
const ARCH_TEMPLATE = [
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
] as const;

export class Shield {
  readonly x: number;   // top-left x
  readonly y: number;   // top-left y
  blocks: boolean[][];  // [row][col]

  constructor(centerX: number) {
    this.x = centerX - SHIELD.WIDTH / 2;
    this.y = SHIELD.Y;
    this.blocks = ARCH_TEMPLATE.map((row) => row.map((v) => v === 1));
  }

  /** Try to damage the shield at the bullet's position. Returns true if a block was hit. */
  hitByBullet(bx: number, by: number): boolean {
    const localX = bx - this.x;
    const localY = by - this.y;

    if (localX < 0 || localX >= SHIELD.WIDTH || localY < 0 || localY >= SHIELD.HEIGHT) {
      return false;
    }

    const baseCol = Math.floor(localX / SHIELD.BLOCK_SIZE);
    const baseRow = Math.floor(localY / SHIELD.BLOCK_SIZE);

    // Search a 3x3 area around hit point for a solid block
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = baseRow + dr;
        const c = baseCol + dc;
        if (r < 0 || r >= SHIELD.ROWS_COUNT || c < 0 || c >= SHIELD.COLS) continue;
        if (this.blocks[r][c]) {
          this.blastArea(r, c);
          return true;
        }
      }
    }
    return false;
  }

  private blastArea(centerRow: number, centerCol: number): void {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = centerRow + dr;
        const c = centerCol + dc;
        if (r >= 0 && r < SHIELD.ROWS_COUNT && c >= 0 && c < SHIELD.COLS) {
          this.blocks[r][c] = false;
        }
      }
    }
  }

  /** Remove all blocks that overlap with an invader rect (when invaders march over) */
  destroyOverlapping(invaderRect: Rect): void {
    const left = invaderRect.x;
    const right = invaderRect.x + invaderRect.w;
    const top = invaderRect.y;
    const bottom = invaderRect.y + invaderRect.h;

    // Convert to local
    const colStart = Math.max(0, Math.floor((left - this.x) / SHIELD.BLOCK_SIZE));
    const colEnd = Math.min(SHIELD.COLS - 1, Math.floor((right - this.x) / SHIELD.BLOCK_SIZE));
    const rowStart = Math.max(0, Math.floor((top - this.y) / SHIELD.BLOCK_SIZE));
    const rowEnd = Math.min(SHIELD.ROWS_COUNT - 1, Math.floor((bottom - this.y) / SHIELD.BLOCK_SIZE));

    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        this.blocks[r][c] = false;
      }
    }
  }

  getBounds(): Rect {
    return { x: this.x, y: this.y, w: SHIELD.WIDTH, h: SHIELD.HEIGHT };
  }

  /** Compute evenly spaced shield center X values */
  static shieldPositions(): number[] {
    const total = SHIELD.COUNT * SHIELD.WIDTH;
    const gap = (CANVAS.WIDTH - total) / (SHIELD.COUNT + 1);
    return Array.from({ length: SHIELD.COUNT }, (_, i) =>
      gap * (i + 1) + SHIELD.WIDTH * i + SHIELD.WIDTH / 2,
    );
  }
}
