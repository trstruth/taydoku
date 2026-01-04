import type { Model } from "./model"

import type { Msg } from "./msg"
import { generatePuzzleFromText } from "../domain/generator"
import puzzlesText from "../../puzzles.txt?raw"
import { getConflictIndices, isSolved, isValidMove } from "../domain/rules"

const startNewGame = (model: Model): Model => {
    const grid = generatePuzzleFromText(puzzlesText)
    return {
        grid,
        givens: grid.map(cell => cell !== null),
        notes: Array.from({ length: 81 }, () => []),
        inputMode: "value",
        selected: null,
        invalid: null,
        invalidPulse: 0,
        solved: false,
        confirmNewGame: false,
        paused: false,
        theme: model.theme,
        startedAt: Date.now(),
        elapsedMs: 0
    }
}

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
                    },
                    invalidPulse: model.invalidPulse + 1
                }
            }
            const next = model.grid.slice()
            const nextNotes = model.notes.slice()
            next[model.selected] = msg.value
            nextNotes[model.selected] = []
            const solved = isSolved(next)
            return {
                ...model,
                grid: next,
                notes: nextNotes,
                invalid: null,
                solved,
                startedAt: solved ? null : model.startedAt
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
                solved: false,
                startedAt: model.startedAt
            }
        }

        case "RequestNewGame":
            return { ...model, confirmNewGame: true }

        case "CancelNewGame":
            return { ...model, confirmNewGame: false }

        case "ConfirmNewGame":
            return startNewGame(model)

        case "NewGame":
            return startNewGame(model)

        case "ClearInvalid":
            if (!model.invalid) return model
            return { ...model, invalid: null }

        case "ToggleNoteMode":
            return {
                ...model,
                inputMode: model.inputMode === "note" ? "value" : "note"
            }

        case "ToggleTheme":
            return {
                ...model,
                theme: model.theme === "dark" ? "light" : "dark"
            }

        case "Tick":
            if (model.startedAt === null || model.solved || model.paused) return model
            return {
                ...model,
                elapsedMs: Date.now() - model.startedAt
            }

        case "PauseTimer":
            if (model.solved) return model
            if (model.startedAt === null) {
                return { ...model, paused: true }
            }
            return {
                ...model,
                paused: true,
                elapsedMs: Date.now() - model.startedAt,
                startedAt: null
            }

        case "ResumeTimer":
            if (model.solved || !model.paused) return model
            return {
                ...model,
                paused: false,
                startedAt: Date.now() - model.elapsedMs
            }

        case "Solve":
            return {
                ...model,
                solved: true,
                paused: false,
                startedAt: null
            }

        case "DismissSolved":
            return {
                ...model,
                solved: false
            }

        default:
            return model
    }
}
