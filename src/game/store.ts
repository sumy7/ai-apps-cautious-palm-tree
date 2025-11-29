import { create } from 'zustand';
import type { Cup, GameState, LiquidColor } from './types';
import {
  LIQUID_COLORS,
  MAX_LAYERS,
  NUM_FILLED_CUPS,
  TOTAL_CUPS,
} from './types';

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Initialize cups with shuffled liquids distributed across all cups including empty ones
function initializeCups(): Cup[] {
  // Create all liquid units (4 of each color for 7 colors = 28 units)
  const allLiquids: LiquidColor[] = [];
  for (const color of LIQUID_COLORS) {
    for (let i = 0; i < MAX_LAYERS; i++) {
      allLiquids.push(color);
    }
  }

  // Shuffle all liquids
  const shuffledLiquids = shuffleArray(allLiquids);

  // Create all cups (including empty ones) and distribute liquids
  const cups: Cup[] = [];
  const totalCups = TOTAL_CUPS;
  const totalLiquids = shuffledLiquids.length;
  
  // Calculate how many layers per cup on average, and distribute
  // We have 28 liquid units to distribute across 9 cups
  // Each cup can have at most 4 layers
  // We'll distribute evenly: some cups get more, some get less
  
  let liquidIndex = 0;
  for (let i = 0; i < totalCups; i++) {
    const cup: Cup = [];
    // Calculate how many layers this cup should get
    const remainingCups = totalCups - i;
    const remainingLiquids = totalLiquids - liquidIndex;
    const layersForThisCup = Math.min(MAX_LAYERS, Math.ceil(remainingLiquids / remainingCups));
    
    for (let j = 0; j < layersForThisCup && liquidIndex < totalLiquids; j++) {
      cup.push(shuffledLiquids[liquidIndex]);
      liquidIndex++;
    }
    cups.push(cup);
  }

  return cups;
}

// Get the top liquid color of a cup
function getTopLiquid(cup: Cup): LiquidColor | null {
  for (let i = cup.length - 1; i >= 0; i--) {
    if (cup[i] !== null) {
      return cup[i];
    }
  }
  return null;
}

// Get the number of consecutive same-color liquids from the top
function getTopConsecutiveCount(cup: Cup): { color: LiquidColor | null; count: number } {
  const topColor = getTopLiquid(cup);
  if (topColor === null) {
    return { color: null, count: 0 };
  }

  let count = 0;
  for (let i = cup.length - 1; i >= 0; i--) {
    if (cup[i] === topColor) {
      count++;
    } else if (cup[i] !== null) {
      break;
    }
  }
  return { color: topColor, count };
}

// Get actual liquid count in a cup (non-null elements)
function getLiquidCount(cup: Cup): number {
  return cup.filter((l) => l !== null).length;
}

// Check if a pour is valid
function canPour(fromCup: Cup, toCup: Cup): boolean {
  const fromTop = getTopLiquid(fromCup);
  if (fromTop === null) return false; // Source cup is empty

  const toTop = getTopLiquid(toCup);
  const toCount = getLiquidCount(toCup);

  // Can pour if target is empty or top colors match
  if (toCount >= MAX_LAYERS) return false; // Target cup is full

  if (toTop === null) return true; // Target cup is empty
  return toTop === fromTop; // Colors match
}

// Perform a pour operation
function pourLiquid(
  cups: Cup[],
  fromIndex: number,
  toIndex: number
): { newCups: Cup[]; count: number } | null {
  const fromCup = [...cups[fromIndex]];
  const toCup = [...cups[toIndex]];

  if (!canPour(fromCup, toCup)) return null;

  const { color, count: availableCount } = getTopConsecutiveCount(fromCup);
  if (color === null) return null;

  const toSpace = MAX_LAYERS - getLiquidCount(toCup);
  const pourCount = Math.min(availableCount, toSpace);

  // Remove from source
  let removed = 0;
  for (let i = fromCup.length - 1; i >= 0 && removed < pourCount; i--) {
    if (fromCup[i] === color) {
      fromCup[i] = null;
      removed++;
    }
  }

  // Clean up source cup (remove trailing nulls)
  while (fromCup.length > 0 && fromCup[fromCup.length - 1] === null) {
    fromCup.pop();
  }

  // Add to target
  for (let i = 0; i < pourCount; i++) {
    toCup.push(color);
  }

  const newCups = [...cups];
  newCups[fromIndex] = fromCup;
  newCups[toIndex] = toCup;

  return { newCups, count: pourCount };
}

// Check if the game is won (all filled cups have same color)
function checkWin(cups: Cup[]): boolean {
  let completedCups = 0;
  for (const cup of cups) {
    const liquidCount = getLiquidCount(cup);
    if (liquidCount === 0) continue;
    if (liquidCount !== MAX_LAYERS) return false;

    const firstColor = cup[0];
    if (cup.some((l) => l !== null && l !== firstColor)) return false;
    completedCups++;
  }
  return completedCups === NUM_FILLED_CUPS;
}

// Check if there are any valid moves
function hasValidMoves(cups: Cup[]): boolean {
  for (let i = 0; i < cups.length; i++) {
    for (let j = 0; j < cups.length; j++) {
      if (i !== j && canPour(cups[i], cups[j])) {
        // Additional check: don't count moving to empty cup if source only has one color
        // (this would be pointless if we're moving an already-complete cup)
        const fromCount = getLiquidCount(cups[i]);
        const toCount = getLiquidCount(cups[j]);

        // If moving to empty cup
        if (toCount === 0) {
          // Only valid if source isn't already complete/single color
          const { count } = getTopConsecutiveCount(cups[i]);
          if (count === fromCount && fromCount === MAX_LAYERS) {
            continue; // Skip, this would just move a completed cup
          }
        }

        return true;
      }
    }
  }
  return false;
}

interface GameStore extends GameState {
  selectCup: (index: number) => void;
  reset: () => void;
  undo: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  cups: initializeCups(),
  selectedCupIndex: null,
  moveHistory: [],
  gameStatus: 'playing',

  selectCup: (index: number) => {
    const state = get();
    if (state.gameStatus !== 'playing') return;

    const { cups, selectedCupIndex } = state;

    // If no cup is selected, select this one (if it has liquid)
    if (selectedCupIndex === null) {
      if (getLiquidCount(cups[index]) > 0) {
        set({ selectedCupIndex: index });
      }
      return;
    }

    // If clicking the same cup, deselect
    if (selectedCupIndex === index) {
      set({ selectedCupIndex: null });
      return;
    }

    // Try to pour
    const result = pourLiquid(cups, selectedCupIndex, index);
    if (result) {
      const { newCups, count } = result;
      const newHistory = [...state.moveHistory, { from: selectedCupIndex, to: index, count }];

      // Check game status
      let gameStatus: 'playing' | 'won' | 'lost' = 'playing';
      if (checkWin(newCups)) {
        gameStatus = 'won';
      } else if (!hasValidMoves(newCups)) {
        gameStatus = 'lost';
      }

      set({
        cups: newCups,
        selectedCupIndex: null,
        moveHistory: newHistory,
        gameStatus,
      });
    } else {
      // If pour failed and target has liquid, try selecting it instead
      if (getLiquidCount(cups[index]) > 0) {
        set({ selectedCupIndex: index });
      } else {
        set({ selectedCupIndex: null });
      }
    }
  },

  reset: () => {
    set({
      cups: initializeCups(),
      selectedCupIndex: null,
      moveHistory: [],
      gameStatus: 'playing',
    });
  },

  undo: () => {
    const state = get();
    if (state.moveHistory.length === 0) return;

    const history = [...state.moveHistory];
    const lastMove = history.pop();
    if (!lastMove) return; // Defensive check
    
    const cups = [...state.cups];

    // Reverse the pour
    const fromCup = [...cups[lastMove.from]];
    const toCup = [...cups[lastMove.to]];

    // Get the color that was poured (top of target cup)
    const color = getTopLiquid(toCup);
    if (color === null) return;

    // Remove from target
    for (let i = 0; i < lastMove.count; i++) {
      toCup.pop();
    }

    // Add back to source
    for (let i = 0; i < lastMove.count; i++) {
      fromCup.push(color);
    }

    cups[lastMove.from] = fromCup;
    cups[lastMove.to] = toCup;

    set({
      cups,
      selectedCupIndex: null,
      moveHistory: history,
      gameStatus: 'playing',
    });
  },
}));
