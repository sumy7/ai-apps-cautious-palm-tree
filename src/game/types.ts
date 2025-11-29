// Game types for the cup water sorting puzzle

export type LiquidColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink';

export const LIQUID_COLORS: LiquidColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'];

export const COLOR_HEX: Record<LiquidColor, string> = {
  red: '#e74c3c',
  blue: '#3498db',
  green: '#2ecc71',
  yellow: '#f1c40f',
  purple: '#9b59b6',
  orange: '#e67e22',
  pink: '#fd79a8',
};

export const MAX_LAYERS = 4;
export const NUM_FILLED_CUPS = 7;
export const NUM_EMPTY_CUPS = 2;
export const TOTAL_CUPS = NUM_FILLED_CUPS + NUM_EMPTY_CUPS;

// Number of shuffle power-ups per game
export const INITIAL_SHUFFLE_COUNT = 2;

// A cup is an array of liquid colors, where index 0 is the bottom layer
export type Cup = (LiquidColor | null)[];

export interface GameState {
  cups: Cup[];
  selectedCupIndex: number | null;
  moveHistory: { from: number; to: number; count: number }[];
  gameStatus: 'playing' | 'won' | 'lost';
  shuffleCount: number; // Remaining shuffle power-ups
}
