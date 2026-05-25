export class InputManager {
  private held = new Set<string>();
  private pressed = new Set<string>();

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (!this.held.has(e.code)) {
        this.pressed.add(e.code);
      }
      this.held.add(e.code);

      // Prevent page scrolling for game keys
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.held.delete(e.code);
    });
  }

  isDown(code: string): boolean {
    return this.held.has(code);
  }

  wasPressed(code: string): boolean {
    return this.pressed.has(code);
  }

  clearPressed(): void {
    this.pressed.clear();
  }

  get left(): boolean {
    return this.held.has('ArrowLeft') || this.held.has('KeyA');
  }

  get right(): boolean {
    return this.held.has('ArrowRight') || this.held.has('KeyD');
  }

  get fire(): boolean {
    return this.held.has('Space');
  }

  get firePressed(): boolean {
    return this.pressed.has('Space');
  }

  get start(): boolean {
    return this.pressed.has('Enter') || this.pressed.has('NumpadEnter');
  }

  get pause(): boolean {
    return this.pressed.has('KeyP') || this.pressed.has('Escape');
  }
}
