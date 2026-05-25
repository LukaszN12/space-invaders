import { GameState, GAME, INVADER, SHIELD } from '../constants';
import { GameContext } from '../GameContext';
import { InputManager } from '../InputManager';
import { AudioManager } from '../AudioManager';
import { Renderer } from '../Renderer';
import { Player } from '../entities/Player';
import { Bullet } from '../entities/Bullet';
import { InvaderGrid } from '../entities/InvaderGrid';
import { Shield } from '../entities/Shield';
import { UFO } from '../entities/UFO';
import { rectOverlap } from '../types';

export class PlayingState {
  private readonly game: GameContext;
  private readonly input: InputManager;
  private readonly audio: AudioManager;

  private player!: Player;
  private playerBullet: Bullet | null = null;
  private grid!: InvaderGrid;
  private shields!: Shield[];
  private ufo!: UFO;
  private paused = false;


  constructor(game: GameContext, input: InputManager, audio: AudioManager) {
    this.game = game;
    this.input = input;
    this.audio = audio;
  }

  onEnter(): void {
    this.player = new Player();
    this.playerBullet = null;
    this.grid = new InvaderGrid(this.game.getLevel(), this.audio);
    this.shields = Shield.shieldPositions().map((cx) => new Shield(cx));
    this.ufo = new UFO(this.audio);
    this.paused = false;
  }

  onExit(): void {
    this.audio.stopUFOHum();
  }

  update(dt: number): void {
    if (this.input.pause) {
      this.paused = !this.paused;
    }
    if (this.paused) return;

    // --- Respawn logic ---
    if (!this.player.alive) {
      this.player.update(dt, this.input); // handles deathTimer countdown
      if (this.player.isDoneExploding) {
        if (this.game.getLives() <= 0) {
          this.game.changeState(GameState.GAME_OVER);
          return;
        }
        // Respawn
        this.player.reset();
        this.playerBullet = null;
        this.grid.clearBullets();
      }
      return; // Don't process game logic while dying
    }

    // --- Normal gameplay ---
    this.handleInput(dt);
    this.player.update(dt, this.input);

    // Player bullet
    this.playerBullet?.update(dt);

    // Invader grid
    this.grid.update(dt);

    // UFO
    this.ufo.update(dt);

    // Collisions
    this.checkCollisions();

    // Win / lose checks
    this.checkBoundaryConditions();
  }

  private handleInput(_dt: number): void {
    // Shoot: only one bullet at a time (classic Space Invaders rule)
    if (this.input.firePressed && (!this.playerBullet || !this.playerBullet.active)) {
      this.playerBullet = new Bullet(
        this.player.x,
        this.player.y - 14,
        420,  // px/sec upward
        true,
      );
      this.audio.play('playerShoot');
    }
  }

  private checkCollisions(): void {
    const pb = this.playerBullet;

    // 1. Player bullet vs invaders
    if (pb?.active) {
      outer: for (let r = 0; r < INVADER.ROWS; r++) {
        for (let c = 0; c < INVADER.COLS; c++) {
          const inv = this.grid.getInvader(r, c);
          if (inv.alive && rectOverlap(pb.getBounds(), inv.getBounds())) {
            inv.kill();
            pb.active = false;
            this.game.addScore(inv.points);
            this.audio.play('invaderKill');
            break outer;
          }
        }
      }
    }

    // 2. Player bullet vs UFO
    if (pb?.active && this.ufo.active) {
      if (rectOverlap(pb.getBounds(), this.ufo.getBounds())) {
        const pts = this.ufo.pointValue;
        this.ufo.hit();
        pb.active = false;
        this.game.addScore(pts);
        this.audio.play('ufoHit');
      }
    }

    // 3. Player bullet vs shields
    if (pb?.active) {
      for (const shield of this.shields) {
        if (pb.active && shield.hitByBullet(pb.x, pb.y)) {
          pb.active = false;
          break;
        }
      }
    }

    // 4. Invader bullets vs player
    for (const ibullet of this.grid.activeBullets) {
      if (!ibullet.active || !this.player.alive) continue;
      if (rectOverlap(ibullet.getBounds(), this.player.getBounds())) {
        ibullet.active = false;
        this.player.die();
        this.audio.play('playerDeath');
        this.game.loseLife();
        break;
      }
    }

    // 5. Invader bullets vs shields
    for (const ibullet of this.grid.activeBullets) {
      if (!ibullet.active) continue;
      for (const shield of this.shields) {
        if (shield.hitByBullet(ibullet.x, ibullet.y)) {
          ibullet.active = false;
          break;
        }
      }
    }

    // 6. Invaders overlapping shields (when marching low)
    for (let r = 0; r < INVADER.ROWS; r++) {
      for (let c = 0; c < INVADER.COLS; c++) {
        const inv = this.grid.getInvader(r, c);
        if (!inv.alive) continue;
        const invRect = inv.getBounds();
        if (invRect.y + invRect.h < SHIELD.Y - 4) continue; // too high
        for (const shield of this.shields) {
          shield.destroyOverlapping(invRect);
        }
      }
    }
  }

  private checkBoundaryConditions(): void {
    // Win: all invaders dead
    if (this.grid.count() === 0) {
      this.game.changeState(GameState.WIN);
      return;
    }

    // Lose: invaders reach the ground line
    if (this.grid.lowestY() + INVADER.HEIGHT / 2 >= GAME.GROUND_Y) {
      this.game.loseLife();
      // Lose all lives immediately (invasion)
      while (this.game.getLives() > 0) {
        this.game.loseLife();
      }
      this.game.changeState(GameState.GAME_OVER);
    }
  }

  render(renderer: Renderer): void {
    renderer.clear();

    // Invaders
    for (let r = 0; r < INVADER.ROWS; r++) {
      for (let c = 0; c < INVADER.COLS; c++) {
        const inv = this.grid.getInvader(r, c);
        if (inv.alive || inv.dying) {
          renderer.drawInvader(inv, this.grid.animFrame);
        }
      }
    }

    // Player bullet
    if (this.playerBullet?.active) {
      renderer.drawBullet(this.playerBullet);
    }

    // Invader bullets
    for (const b of this.grid.activeBullets) {
      if (b.active) renderer.drawBullet(b);
    }

    // Shields
    for (const shield of this.shields) {
      renderer.drawShield(shield);
    }

    // UFO
    renderer.drawUFO(this.ufo);

    // Player
    renderer.drawPlayer(this.player);

    // HUD
    renderer.drawHUD(
      this.game.getScore(),
      this.game.getHighScore(),
      this.game.getLives(),
      this.game.getLevel(),
    );

    // Paused overlay
    if (this.paused) {
      renderer.drawPaused();
    }
  }
}
