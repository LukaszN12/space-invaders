import { GameState } from '../constants';
import { GameContext } from '../GameContext';
import { InputManager } from '../InputManager';
import { Renderer } from '../Renderer';

export class MenuState {
  private readonly game: GameContext;
  private readonly input: InputManager;

  constructor(game: GameContext, input: InputManager) {
    this.game = game;
    this.input = input;
  }

  onEnter(): void {
    // Nothing to init
  }

  onExit(): void {
    // Nothing to clean up
  }

  update(_dt: number): void {
    if (this.input.start) {
      this.game.restartGame();
      this.game.changeState(GameState.PLAYING);
    }
  }

  render(renderer: Renderer): void {
    renderer.drawMenu(this.game.getHighScore());
  }
}
