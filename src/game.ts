import {ArrayGrid, type Grid} from "./grid";

export type Marble = "Red" | "Blue" | "Yellow" | "Green" | "Pink" | "White" | "Black" | "Purple";
export type HoleState = "None" | Marble;

export const availableColors: Marble[] = ['Red', 'Blue', 'Yellow', 'Green', 'Pink', 'White', 'Black', 'Purple']
export let activeRowIndex: number = 5;
export let solution: Marble[] = []

export const grid : Grid<HoleState> = new ArrayGrid(4, 9);

export function setActiveRowIndex(index: number) {
  activeRowIndex = index;
}

export function generateSolution(): Marble[] {
  // Generate solution: pick grid.width random colors, each appearing once
  const shuffledColors = shuffleArray(availableColors)
  return shuffledColors.slice(0, grid.width)
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}