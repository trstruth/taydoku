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

export const generatePuzzleFromString = (input: string): Grid => {
    if (input.length !== 81) {
        throw new Error("Puzzle input must be exactly 81 characters long.")
    }

    const cells: Cell[] = Array(81).fill(null)
    for (let i = 0; i < input.length; i++) {
        const ch = input[i]
        if (ch === ".") {
            cells[i] = null
            continue
        }
        if (ch >= "1" && ch <= "9") {
            cells[i] = Number(ch) as Value
            continue
        }
        throw new Error(`Invalid puzzle character at index ${i}: "${ch}".`)
    }

    return cells as Grid
}

export const generatePuzzleFromText = (input: string): Grid => {
    const lines = input
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)

    if (lines.length === 0) {
        throw new Error("Puzzle list is empty.")
    }

    const picked = lines[Math.floor(Math.random() * lines.length)]
    return generatePuzzleFromString(picked)
}
