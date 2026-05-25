import { GameState } from '../constants';
import { GameContext } from '../GameContext';
import { InputManager } from '../InputManager';
import { Renderer } from '../Renderer';

export class GameOverState {
  private readonly game: GameContext;
  private readonly input: InputManager;
  private timer: number;

  constructor(game: GameContext, input: InputManager) {
    this.game = game;
    this.input = input;
    this.timer = 0;
  }

  onEnter(): void {
    this.timer = 0;
  }

  onExit(): void {
    // Nothing
  }

  update(dt: number): void {
    this.timer += dt;
    // Only allow restart after 1.5s to prevent accidental key presses
    if (this.timer > 1.5 && this.input.start) {
      this.game.changeState(GameState.MENU);
    }
  }

  render(renderer: Renderer): void {
    renderer.drawGameOver(this.game.getScore(), this.game.getHighScore());
  }
}
