import type { Cell, Value } from "./cell"
import type { Grid } from "./grid"
import { isValidMove } from "./rules"

const values: Value[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const shuffled = <T,>(items: T[]): T[] => {
    const copy = items.slice()
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = copy[i]
        copy[i] = copy[j]
        copy[j] = temp
    }
    return copy
}

export const generateSolvedGrid = (): Grid => {
    const grid: Cell[] = Array(81).fill(null)

    const fill = (idx: number): boolean => {
        if (idx >= grid.length) return true
        if (grid[idx] !== null) return fill(idx + 1)
        for (const value of shuffled(values)) {
            if (isValidMove(grid as Grid, idx, value)) {
                grid[idx] = value
                if (fill(idx + 1)) return true
                grid[idx] = null
            }
        }
        return false
    }

    fill(0)
    return grid as Grid
}

const countSolutions = (grid: Cell[], limit: number): number => {
    const nextEmpty = grid.findIndex(cell => cell === null)
    if (nextEmpty === -1) return 1

    let count = 0
    for (const value of values) {
        if (isValidMove(grid as Grid, nextEmpty, value)) {
            grid[nextEmpty] = value
            count += countSolutions(grid, limit)
            grid[nextEmpty] = null
            if (count >= limit) return count
        }
    }

    return count
}

export const generatePuzzle = (
    difficulty: "easy" | "medium" | "hard"
): Grid => {
    const targetGivens =
        difficulty === "easy" ? 38 : difficulty === "medium" ? 32 : 30

    for (let attempt = 0; attempt < 8; attempt++) {
        const solved = generateSolvedGrid()
        const puzzle: Cell[] = solved.slice()
        let givens = 81

        for (const idx of shuffled([...Array(81).keys()])) {
            if (givens <= targetGivens) break
            if (puzzle[idx] === null) continue
            const backup = puzzle[idx]
            puzzle[idx] = null

            const solutions = countSolutions(puzzle.slice(), 2)
            if (solutions === 1) {
                givens -= 1
            } else {
                puzzle[idx] = backup
            }
        }

        if (givens <= targetGivens) return puzzle as Grid
    }

    return generateSolvedGrid()
}
