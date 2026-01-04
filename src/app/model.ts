import type { Grid } from "../domain/grid"
import type { Value } from "../domain/cell"

export type Model = {
    grid: Grid
    givens: ReadonlyArray<boolean>
    notes: ReadonlyArray<ReadonlyArray<Value>>
    inputMode: "value" | "note"
    selected: number | null
    invalid: { target: number; conflicts: number[] } | null
    invalidPulse: number
    solved: boolean
    confirmNewGame: boolean
    paused: boolean
    theme: "dark" | "light"
    startedAt: number | null
    elapsedMs: number
}
