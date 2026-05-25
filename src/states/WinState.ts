import { GameState } from '../constants';
import { GameContext } from '../GameContext';
import { AudioManager } from '../AudioManager';
import { Renderer } from '../Renderer';

export class WinState {
  private readonly game: GameContext;
  private readonly audio: AudioManager;
  private timer: number;
  private readonly NEXT_LEVEL_DELAY = 3.5; // seconds before auto-advancing

  constructor(game: GameContext, audio: AudioManager) {
    this.game = game;
    this.audio = audio;
    this.timer = 0;
  }

  onEnter(): void {
    this.timer = 0;
    this.audio.play('levelUp');
  }

  onExit(): void {
    // Nothing
  }

  update(dt: number): void {
    this.timer += dt;
    if (this.timer >= this.NEXT_LEVEL_DELAY) {
      this.game.nextLevel();
      this.game.changeState(GameState.PLAYING);
    }
  }

  render(renderer: Renderer): void {
    renderer.drawWin(this.game.getLevel());
  }
}
