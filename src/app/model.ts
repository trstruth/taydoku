import { Grid } from "../domain/grid"

export type Model = {
    grid: Grid
    givens: ReadonlyArray<boolean>
    notes: ReadonlyArray<ReadonlyArray<Value>>
    inputMode: "value" | "note"
    selected: number | null
    invalid: { target: number; conflicts: number[] } | null
    solved: boolean
}
