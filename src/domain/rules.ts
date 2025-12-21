import type { Grid } from "./grid"
import type { Cell } from "./cell"
import type { Value } from "./cell"

export const index = (row: number, col: number) =>
    row * 9 + col

export const getRow = (grid: Grid, row: number) =>
    grid.slice(row * 9, row * 9 + 9)

export const getCol = (grid: Grid, col: number) =>
    grid.filter((_, idx) => idx % 9 === col)

export const getBox = (grid: Grid, row: number, col: number) => {
    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    const box: Cell[] = []

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            box.push(grid[index(startRow + r, startCol + c)])
        }
    }

    return box
}


export const isValidMove = (
    grid: Grid,
    idx: number,
    value: Value
): boolean => {
    return getConflictIndices(grid, idx, value).length === 0
}

export const getConflictIndices = (
    grid: Grid,
    idx: number,
    value: Value
): number[] => {
    const row = Math.floor(idx / 9)
    const col = idx % 9
    const conflicts: number[] = []
    const seen = new Set<number>()

    for (let c = 0; c < 9; c++) {
        const i = index(row, c)
        if (i !== idx && grid[i] === value && !seen.has(i)) {
            conflicts.push(i)
            seen.add(i)
        }
    }

    for (let r = 0; r < 9; r++) {
        const i = index(r, col)
        if (i !== idx && grid[i] === value && !seen.has(i)) {
            conflicts.push(i)
            seen.add(i)
        }
    }

    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const i = index(startRow + r, startCol + c)
            if (i !== idx && grid[i] === value && !seen.has(i)) {
                conflicts.push(i)
                seen.add(i)
            }
        }
    }

    return conflicts
}

export const isSolved = (grid: Grid): boolean => {
    for (let i = 0; i < grid.length; i++) {
        const value = grid[i]
        if (value === null) return false
        if (getConflictIndices(grid, i, value).length > 0) return false
    }
    return true
}
