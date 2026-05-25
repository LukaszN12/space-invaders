export const CANVAS = { WIDTH: 800, HEIGHT: 600 } as const;

export const PLAYER = {
  SPEED: 200,       // px/sec
  WIDTH: 40,
  HEIGHT: 20,
  BULLET_SPEED: 420, // px/sec
  START_Y: 535,
  MARGIN: 30,       // min distance from edge
} as const;

export const INVADER = {
  COLS: 11,
  ROWS: 5,
  WIDTH: 32,
  HEIGHT: 24,
  H_SPACING: 48,    // center-to-center horizontal
  V_SPACING: 40,    // center-to-center vertical
  STEP_DOWN: 16,    // pixels to step down when hitting wall
  H_STEP: 8,        // pixels per horizontal step
  BASE_INTERVAL: 800, // ms between steps (full grid)
  MIN_INTERVAL: 50,   // ms between steps (1 invader)
  BULLET_SPEED: 180,  // px/sec downward
  GRID_START_X: 160,  // center x of first invader (col 0)
  GRID_START_Y: 90,   // center y of first row
  EDGE_MARGIN: 12,    // distance from canvas edge to trigger step-down
} as const;

export const POINTS_TABLE = {
  INVADER_ROW: [30, 20, 20, 10, 10] as const,
  UFO_VALUES: [50, 100, 150, 300] as const,
} as const;

export const SHIELD = {
  COUNT: 4,
  WIDTH: 60,         // 15 blocks * 4px
  HEIGHT: 40,        // 10 blocks * 4px
  BLOCK_SIZE: 4,
  COLS: 15,
  ROWS_COUNT: 10,
  Y: 460,            // top-left y of all shields
} as const;

export const UFO_CFG = {
  SPEED: 120,        // px/sec
  Y: 44,
  SPAWN_INTERVAL: 22, // seconds between spawns
  WIDTH: 44,
  HEIGHT: 20,
} as const;

export const GAME = {
  INITIAL_LIVES: 3,
  INVADER_BULLET_MAX: 3,
  PLAYER_DEATH_DURATION: 1.8, // seconds
  INVADER_DEATH_DURATION: 0.25, // seconds
  GROUND_Y: 558,
  SHOOT_PROB_PER_SEC: 0.6,    // probability of a shot per second (for whole grid)
} as const;

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  WIN = 'WIN',
}

export const COLORS = {
  BG: '#000000',
  PLAYER: '#33FF33',
  INVADER_TOP: '#FFFFFF',
  INVADER_MID: '#00FFFF',
  INVADER_BOT: '#66FF66',
  INVADER_DYING: '#FF8800',
  BULLET_PLAYER: '#FFFFFF',
  BULLET_INVADER: '#FF5555',
  SHIELD: '#33FF33',
  UFO: '#FF2222',
  HUD: '#FFFFFF',
  GROUND: '#33FF33',
  MENU_TITLE: '#FFFFFF',
  MENU_UFO: '#FF4444',
  MENU_A: '#FFFFFF',
  MENU_B: '#00FFFF',
  MENU_C: '#66FF66',
} as const;
