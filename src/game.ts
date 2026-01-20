import {ArrayGrid, type Grid} from "./grid";

export type Peg = "None" | "Red" | "Blue" | "Yellow" | "Green" | "Pink" | "White" | "Black" | "Purple";

export const grid : Grid<Peg> = new ArrayGrid(4, 6);