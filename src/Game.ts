import { CANVAS, GameState, GAME } from './constants';
import { GameContext } from './GameContext';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { Renderer } from './Renderer';
import { MenuState } from './states/MenuState';
import { PlayingState } from './states/PlayingState';
import { GameOverState } from './states/GameOverState';
import { WinState } from './states/WinState';

type AnyState = MenuState | PlayingState | GameOverState | WinState;

export class Game implements GameContext {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: Renderer;
  private readonly input: InputManager;
  private readonly audio: AudioManager;

  private states!: Map<GameState, AnyState>;
  private currentState!: AnyState;
  private lastTime = 0;

  private score = 0;
  private highScore = 0;
  private lives = GAME.INITIAL_LIVES;
  private level = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Set canvas size
    this.canvas.width = CANVAS.WIDTH;
    this.canvas.height = CANVAS.HEIGHT;

    const ctx = this.canvas.getContext('2d')!;
    this.renderer = new Renderer(ctx);
    this.input = new InputManager();
    this.audio = new AudioManager();
  }

  init(): void {
    // Build all states
    this.states = new Map<GameState, AnyState>([
      [GameState.MENU, new MenuState(this, this.input)],
      [GameState.PLAYING, new PlayingState(this, this.input, this.audio)],
      [GameState.GAME_OVER, new GameOverState(this, this.input)],
      [GameState.WIN, new WinState(this, this.audio)],
    ]);

    // Start in MENU
    this.currentState = this.states.get(GameState.MENU)!;
    this.currentState.onEnter();

    // Kick off the loop
    this.lastTime = performance.now();
    requestAnimationFrame((ts) => this.loop(ts));
  }

  private loop(timestamp: number): void {
    const rawDt = (timestamp - this.lastTime) / 1000;
    const dt = Math.min(rawDt, 0.05); // cap at 50ms to prevent spiral-of-death
    this.lastTime = timestamp;

    this.currentState.update(dt);
    this.renderer.clear();
    this.currentState.render(this.renderer);
    this.input.clearPressed();

    requestAnimationFrame((ts) => this.loop(ts));
  }

  // ── GameContext implementation ────────────────────────────────────────────────

  changeState(state: GameState): void {
    this.currentState.onExit();
    this.currentState = this.states.get(state)!;
    this.currentState.onEnter();
  }

  addScore(pts: number): void {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  loseLife(): void {
    if (this.lives > 0) this.lives--;
  }

  getScore(): number { return this.score; }
  getHighScore(): number { return this.highScore; }
  getLives(): number { return this.lives; }
  getLevel(): number { return this.level; }

  nextLevel(): void {
    this.level++;
  }

  restartGame(): void {
    this.score = 0;
    this.lives = GAME.INITIAL_LIVES;
    this.level = 1;
  }
}
