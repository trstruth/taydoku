import type { Cell } from "./cell"

export type Grid = ReadonlyArray<Cell>

export const emptyGrid: Grid = Array(81).fill(null)
