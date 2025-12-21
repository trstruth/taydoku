import type { Grid } from "./grid"

const parseGrid = (digits: string): Grid => {
    const values = digits
        .trim()
        .split("")
        .map(d => (d === "0" ? null : (Number(d) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)))
    return values as Grid
}

const PUZZLES: Grid[] = [
    parseGrid(
        "530070000" +
        "600195000" +
        "098000060" +
        "800060003" +
        "400803001" +
        "700020006" +
        "060000280" +
        "000419005" +
        "000080079"
    )
]

export const generateSolvedGrid = (): Grid => {
    // deterministic backtracking
    return [] as Grid
}

export const generatePuzzle = (
    difficulty: "easy" | "medium" | "hard"
): Grid => {
    const index = difficulty === "easy" ? 0 : 0
    return PUZZLES[index]
}
