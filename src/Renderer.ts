import { CANVAS, COLORS, PLAYER, SHIELD, UFO_CFG, GAME } from './constants';
import type { Invader } from './entities/Invader';
import type { Bullet } from './entities/Bullet';
import type { Shield } from './entities/Shield';
import type { UFO } from './entities/UFO';
import type { Player } from './entities/Player';

// ─── Invader sprite data: 11×8 pixels, 2 frames ───────────────────────────────
// Row 0 = top of sprite. '1' = filled pixel.
// Scale: 2px per logical pixel → sprite renders at 22×16, centered in 32×24 bbox

const SPRITES: Record<0 | 1 | 2, [number[][], number[][]]> = {
  // Type 0: top row (30pts) – squid / cuttlefish
  0: [
    [
      [0,0,0,1,0,0,0,1,0,0,0],
      [0,0,0,0,1,0,1,0,0,0,0],
      [0,0,0,1,1,1,1,1,0,0,0],
      [0,0,1,1,0,1,0,1,1,0,0],
      [1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,0,0,0,0,0,1,0,0],
      [0,0,0,1,0,0,0,1,0,0,0],
    ],
    [
      [0,0,0,1,0,0,0,1,0,0,0],
      [1,0,0,0,1,0,1,0,0,0,1],
      [1,0,0,1,1,1,1,1,0,0,1],
      [1,1,1,1,0,1,0,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,0],
      [0,1,0,0,0,0,0,0,0,1,0],
      [0,0,1,0,0,0,0,0,1,0,0],
    ],
  ],
  // Type 1: middle rows (20pts) – crab
  1: [
    [
      [0,0,1,0,0,0,0,0,1,0,0],
      [0,0,0,1,0,0,0,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,0,0],
      [0,1,1,0,1,1,1,0,1,1,0],
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,0,1,1,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,1,0,1],
      [0,0,0,1,1,0,1,1,0,0,0],
    ],
    [
      [0,0,1,0,0,0,0,0,1,0,0],
      [1,0,0,1,0,0,0,1,0,0,1],
      [1,0,1,1,1,1,1,1,1,0,1],
      [1,1,1,0,1,1,1,0,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,0,0,0,0,0,1,0,0],
      [1,0,0,0,0,0,0,0,0,0,1],
    ],
  ],
  // Type 2: bottom rows (10pts) – octopus
  2: [
    [
      [0,0,0,1,1,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,0,0,1,0,0,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1],
      [0,0,1,1,0,0,0,1,1,0,0],
      [0,1,0,1,0,0,0,1,0,1,0],
      [0,0,1,0,0,0,0,0,1,0,0],
    ],
    [
      [0,0,0,1,1,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,0,0,1,0,0,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,0,0,0,0,0,1,1,0],
      [1,0,0,1,0,0,0,1,0,0,1],
      [0,1,0,0,0,0,0,0,0,1,0],
    ],
  ],
};

const SPRITE_SCALE = 2;   // logical pixels → canvas pixels
const SPRITE_W = 11 * SPRITE_SCALE;  // 22
const SPRITE_H = 8 * SPRITE_SCALE;   // 16

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.BG;
    this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
  }

  // ── HUD ──────────────────────────────────────────────────────────────────────

  drawHUD(score: number, highScore: number, lives: number, level: number): void {
    const ctx = this.ctx;

    // Score (left)
    ctx.fillStyle = COLORS.HUD;
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE', 16, 20);
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(String(score).padStart(6, '0'), 16, 40);

    // High score (center)
    ctx.fillStyle = COLORS.HUD;
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HI-SCORE', CANVAS.WIDTH / 2, 20);
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(String(highScore).padStart(6, '0'), CANVAS.WIDTH / 2, 40);

    // Level (right)
    ctx.fillStyle = COLORS.HUD;
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('LEVEL', CANVAS.WIDTH - 16, 20);
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(String(level), CANVAS.WIDTH - 16, 40);

    // Lives icons (bottom left)
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.HUD;
    ctx.font = '14px monospace';
    ctx.fillText('LIVES:', 10, CANVAS.HEIGHT - 8);
    for (let i = 0; i < lives; i++) {
      this.drawPlayerIcon(70 + i * 34, CANVAS.HEIGHT - 16);
    }

    // Ground line
    ctx.strokeStyle = COLORS.GROUND;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GAME.GROUND_Y);
    ctx.lineTo(CANVAS.WIDTH, GAME.GROUND_Y);
    ctx.stroke();
  }

  private drawPlayerIcon(cx: number, cy: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.PLAYER;
    // Simple mini ship
    ctx.fillRect(cx - 10, cy, 20, 4);
    ctx.fillRect(cx - 5, cy - 4, 10, 4);
    ctx.fillRect(cx - 2, cy - 7, 4, 3);
  }

  // ── Player ───────────────────────────────────────────────────────────────────

  drawPlayer(player: Player): void {
    const ctx = this.ctx;
    const { x, y } = player;

    if (player.isExploding) {
      // Flashing explosion
      const flash = Math.floor(player.deathTimer * 10) % 2 === 0;
      if (flash) {
        ctx.fillStyle = '#FF8800';
        // Draw explosion as radiating lines
        const r = 20 - player.deathTimer * 5;
        for (let a = 0; a < 8; a++) {
          const angle = (a / 8) * Math.PI * 2;
          ctx.fillRect(
            x + Math.cos(angle) * r - 2,
            y + Math.sin(angle) * r - 2,
            6,
            6,
          );
        }
        ctx.fillRect(x - 8, y - 2, 16, 6);
        ctx.fillRect(x - 2, y - 8, 6, 16);
      }
      return;
    }

    if (!player.alive) return;

    // Draw classic ship shape
    ctx.fillStyle = COLORS.PLAYER;
    const hw = PLAYER.WIDTH / 2;
    const hh = PLAYER.HEIGHT / 2;

    // Base
    ctx.fillRect(x - hw, y - hh + 8, PLAYER.WIDTH, 12);
    // Body
    ctx.fillRect(x - hw + 6, y - hh + 2, PLAYER.WIDTH - 12, 10);
    // Turret
    ctx.fillRect(x - 3, y - hh, 6, 6);
  }

  // ── Invaders ─────────────────────────────────────────────────────────────────

  drawInvader(inv: Invader, frame: 0 | 1): void {
    const ctx = this.ctx;

    if (inv.dying) {
      // Explosion animation
      const t = 1 - inv.deathTimer / 0.25; // 0→1
      const size = 4 + t * 12;
      ctx.fillStyle = COLORS.INVADER_DYING;
      ctx.fillRect(inv.x - size / 2, inv.y - size / 2, size / 2, size / 2);
      ctx.fillRect(inv.x + size / 4, inv.y - size / 2, size / 2, size / 2);
      ctx.fillRect(inv.x - size / 2, inv.y + size / 4, size / 2, size / 2);
      ctx.fillRect(inv.x + size / 4, inv.y + size / 4, size / 2, size / 2);
      return;
    }

    if (!inv.alive) return;

    const type = inv.spriteType;
    const color =
      type === 0 ? COLORS.INVADER_TOP :
      type === 1 ? COLORS.INVADER_MID :
                   COLORS.INVADER_BOT;

    ctx.fillStyle = color;
    const sprite = SPRITES[type][frame];

    // Offset to center the 22×16 sprite in the 32×24 bbox
    const ox = inv.x - SPRITE_W / 2;
    const oy = inv.y - SPRITE_H / 2;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 11; col++) {
        if (sprite[row][col]) {
          ctx.fillRect(
            ox + col * SPRITE_SCALE,
            oy + row * SPRITE_SCALE,
            SPRITE_SCALE,
            SPRITE_SCALE,
          );
        }
      }
    }
  }

  // ── Bullets ──────────────────────────────────────────────────────────────────

  drawBullet(bullet: Bullet): void {
    if (!bullet.active) return;
    const ctx = this.ctx;
    ctx.fillStyle = bullet.isPlayerBullet ? COLORS.BULLET_PLAYER : COLORS.BULLET_INVADER;

    if (bullet.isPlayerBullet) {
      // Straight line
      ctx.fillRect(
        bullet.drawX - bullet.drawW / 2,
        bullet.drawY - bullet.drawH / 2,
        bullet.drawW,
        bullet.drawH,
      );
    } else {
      // Zigzag / squiggly pattern for invader bullets
      const seg = 4;
      const bx = bullet.drawX;
      const by = bullet.drawY - bullet.drawH / 2;
      const segs = Math.ceil(bullet.drawH / seg);
      for (let i = 0; i < segs; i++) {
        const offset = (i % 2 === 0) ? -1 : 1;
        ctx.fillRect(bx + offset - 1, by + i * seg, 3, seg);
      }
    }
  }

  // ── Shields ──────────────────────────────────────────────────────────────────

  drawShield(shield: Shield): void {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.SHIELD;
    for (let r = 0; r < SHIELD.ROWS_COUNT; r++) {
      for (let c = 0; c < SHIELD.COLS; c++) {
        if (shield.blocks[r][c]) {
          ctx.fillRect(
            shield.x + c * SHIELD.BLOCK_SIZE,
            shield.y + r * SHIELD.BLOCK_SIZE,
            SHIELD.BLOCK_SIZE,
            SHIELD.BLOCK_SIZE,
          );
        }
      }
    }
  }

  // ── UFO ──────────────────────────────────────────────────────────────────────

  drawUFO(ufo: UFO): void {
    if (!ufo.active) return;
    const ctx = this.ctx;
    const { x, y } = ufo;
    const hw = UFO_CFG.WIDTH / 2;
    const hh = UFO_CFG.HEIGHT / 2;

    ctx.fillStyle = COLORS.UFO;
    // Body (ellipse base)
    ctx.beginPath();
    ctx.ellipse(x, y + hh * 0.3, hw, hh * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Dome
    ctx.beginPath();
    ctx.ellipse(x, y - hh * 0.1, hw * 0.55, hh * 0.65, 0, Math.PI, 0);
    ctx.fill();
    // Windows
    ctx.fillStyle = '#FFAAAA';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(x + i * 10, y + 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Screens ──────────────────────────────────────────────────────────────────

  drawMenu(highScore: number): void {
    const ctx = this.ctx;
    this.clear();

    // Title
    ctx.fillStyle = COLORS.MENU_TITLE;
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE', CANVAS.WIDTH / 2, 130);
    ctx.fillText('INVADERS', CANVAS.WIDTH / 2, 195);

    // Decorative invader icons
    this.drawMenuInvaderShowcase();

    // Point table
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '13px monospace';
    ctx.fillText('= ? PTS', CANVAS.WIDTH / 2 + 30, 290);
    ctx.fillText('= 30 PTS', CANVAS.WIDTH / 2 + 30, 325);
    ctx.fillText('= 20 PTS', CANVAS.WIDTH / 2 + 30, 360);
    ctx.fillText('= 10 PTS', CANVAS.WIDTH / 2 + 30, 395);

    // UFO icon
    this.drawMenuUFO(CANVAS.WIDTH / 2 - 60, 280);
    // Invader icons for point table
    this.drawMenuInvaderSmall(CANVAS.WIDTH / 2 - 60, 318, 0);
    this.drawMenuInvaderSmall(CANVAS.WIDTH / 2 - 60, 353, 1);
    this.drawMenuInvaderSmall(CANVAS.WIDTH / 2 - 60, 388, 2);

    // Controls
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '13px monospace';
    ctx.fillText('← → / A D = MOVE   SPACE = SHOOT   P = PAUSE', CANVAS.WIDTH / 2, 435);

    // Hi score
    ctx.fillStyle = '#FFFF00';
    ctx.font = '16px monospace';
    ctx.fillText(`HI-SCORE: ${String(highScore).padStart(6, '0')}`, CANVAS.WIDTH / 2, 465);

    // Blink "Press Enter"
    const blink = Math.floor(Date.now() / 500) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#00FF88';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('PRESS ENTER TO PLAY', CANVAS.WIDTH / 2, 510);
    }
  }

  private drawMenuInvaderShowcase(): void {
    // Draw a decorative row of all 3 types
    const types = [2, 1, 0, 1, 2] as const;
    types.forEach((type, i) => {
      const x = CANVAS.WIDTH / 2 - 80 + i * 40;
      this.drawMenuInvaderSmall(x, 235, type);
    });
  }

  private drawMenuInvaderSmall(cx: number, cy: number, type: 0 | 1 | 2): void {
    const scale = 1.5;
    const ctx = this.ctx;
    const color =
      type === 0 ? COLORS.MENU_A :
      type === 1 ? COLORS.MENU_B :
                   COLORS.MENU_C;
    ctx.fillStyle = color;
    const sprite = SPRITES[type][0];
    const sw = 11 * scale;
    const sh = 8 * scale;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 11; c++) {
        if (sprite[r][c]) {
          ctx.fillRect(cx - sw / 2 + c * scale, cy - sh / 2 + r * scale, scale, scale);
        }
      }
    }
  }

  private drawMenuUFO(cx: number, cy: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.UFO;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy - 2, 9, 9, 0, Math.PI, 0);
    ctx.fill();
  }

  drawGameOver(score: number, highScore: number): void {
    const ctx = this.ctx;
    this.clear();

    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 54px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS.WIDTH / 2, 200);

    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`SCORE: ${String(score).padStart(6, '0')}`, CANVAS.WIDTH / 2, 280);

    if (score >= highScore && score > 0) {
      ctx.fillStyle = '#00FF88';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('NEW HIGH SCORE!', CANVAS.WIDTH / 2, 330);
    } else {
      ctx.fillStyle = '#AAAAAA';
      ctx.font = '20px monospace';
      ctx.fillText(`HI-SCORE: ${String(highScore).padStart(6, '0')}`, CANVAS.WIDTH / 2, 330);
    }

    const blink = Math.floor(Date.now() / 600) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('PRESS ENTER TO CONTINUE', CANVAS.WIDTH / 2, 420);
    }
  }

  drawWin(level: number): void {
    const ctx = this.ctx;
    this.clear();

    ctx.fillStyle = '#00FF88';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL CLEAR!', CANVAS.WIDTH / 2, 200);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`LEVEL ${level} COMPLETE`, CANVAS.WIDTH / 2, 270);

    ctx.fillStyle = '#00FFFF';
    ctx.font = '20px monospace';
    ctx.fillText('GET READY FOR LEVEL ' + (level + 1) + '...', CANVAS.WIDTH / 2, 340);

    // Animated dots
    const dots = '.'.repeat(Math.floor(Date.now() / 300) % 4);
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(dots, CANVAS.WIDTH / 2, 390);
  }

  drawPaused(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2);
    ctx.font = '18px monospace';
    ctx.fillStyle = '#AAAAAA';
    ctx.fillText('Press P to resume', CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 44);
  }

  // ── Utility ──────────────────────────────────────────────────────────────────

  drawText(
    text: string,
    x: number,
    y: number,
    size: number,
    color = '#FFFFFF',
    align: CanvasTextAlign = 'center',
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px monospace`;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }
}
