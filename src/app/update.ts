import type { Model } from "./model"

import type { Msg } from "./msg"
import { generatePuzzle } from "../domain/generator"
import { getConflictIndices, isSolved, isValidMove } from "../domain/rules"

export const update = (model: Model, msg: Msg): Model => {
    switch (msg.type) {
        case "SelectCell":
            return { ...model, selected: msg.index, invalid: null }

        case "EnterValue": {
            if (model.selected === null) return model
            if (model.givens[model.selected]) return model
            if (model.inputMode === "note") {
                const nextNotes = model.notes.slice()
                const existing = nextNotes[model.selected]
                const hasValue = existing.includes(msg.value)
                const updated = hasValue
                    ? existing.filter(v => v !== msg.value)
                    : [...existing, msg.value].sort()
                nextNotes[model.selected] = updated
                return { ...model, notes: nextNotes, invalid: null }
            }
            if (!isValidMove(model.grid, model.selected, msg.value)) {
                const conflicts = getConflictIndices(
                    model.grid,
                    model.selected,
                    msg.value
                )
                return {
                    ...model,
                    invalid: {
                        target: model.selected,
                        conflicts
                    }
                }
            }
            const next = model.grid.slice()
            const nextNotes = model.notes.slice()
            next[model.selected] = msg.value
            nextNotes[model.selected] = []
            return {
                ...model,
                grid: next,
                notes: nextNotes,
                invalid: null,
                solved: isSolved(next)
            }
        }

        case "ClearCell": {
            if (model.selected === null) return model
            if (model.givens[model.selected]) return model
            const next = model.grid.slice()
            const nextNotes = model.notes.slice()
            if (model.inputMode === "note") {
                nextNotes[model.selected] = []
                return { ...model, notes: nextNotes, invalid: null }
            }
            next[model.selected] = null
            return {
                ...model,
                grid: next,
                notes: nextNotes,
                invalid: null,
                solved: false
            }
        }

        case "NewGame":
            const grid = generatePuzzle("easy")
            return {
                grid,
                givens: grid.map(cell => cell !== null),
                notes: Array.from({ length: 81 }, () => []),
                inputMode: "value",
                selected: null,
                invalid: null,
                solved: false
            }

        case "ClearInvalid":
            if (!model.invalid) return model
            return { ...model, invalid: null }

        case "ToggleNoteMode":
            return {
                ...model,
                inputMode: model.inputMode === "note" ? "value" : "note"
            }

        default:
            return model
    }
}
