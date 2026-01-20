import {ArrayGrid, type Grid} from "./grid";

export type Marble = "Red" | "Blue" | "Yellow" | "Green" | "Pink" | "White" | "Black" | "Purple";
export type HoleState = "None" | Marble;

export let activeRowIndex: number = 5;
export const grid : Grid<HoleState> = new ArrayGrid(4, 9);

export function setActiveRowIndex(index: number) {
  activeRowIndex = index;
}