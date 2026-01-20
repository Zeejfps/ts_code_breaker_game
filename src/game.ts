import {ArrayGrid, type Grid} from "./grid";

export type Peg = "None" | "Red" | "Blue" | "Yellow" | "Green" | "Pink" | "White" | "Black" | "Purple";

export let activeRowIndex: number = 5;
export const grid : Grid<Peg> = new ArrayGrid(4, 6);

export function setActiveRowIndex(index: number) {
  activeRowIndex = index;
}
