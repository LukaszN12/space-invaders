import { GameState } from './constants';

export interface GameContext {
  changeState(state: GameState): void;
  addScore(pts: number): void;
  loseLife(): void;
  getScore(): number;
  getHighScore(): number;
  getLives(): number;
  getLevel(): number;
  nextLevel(): void;
  restartGame(): void;
}
