import { For, Index, Show, createEffect, onCleanup, onMount } from "solid-js"
import confetti from "canvas-confetti"
import type { Model } from "../app/model"
import type { Msg } from "../app/msg"

export function GridView(props: {
    model: Model
    dispatch: (msg: Msg) => void
}) {
    let rootRef: HTMLDivElement | undefined
    let wasSolved = false

    const formatElapsed = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }

    const confirmNewGame = () => {
        props.dispatch({ type: "RequestNewGame" })
    }

    onMount(() => {
        rootRef?.focus()
    })

    const onKeyDown = (event: KeyboardEvent) => {
        if (props.model.confirmNewGame) {
            if (event.key === "Escape") {
                props.dispatch({ type: "CancelNewGame" })
            }
            return
        }
        const key = event.key
        if (key >= "1" && key <= "9") {
            props.dispatch({ type: "EnterValue", value: Number(key) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 })
            return
        }

        if (key === "n" || key === "N") {
            props.dispatch({ type: "ToggleNoteMode" })
            return
        }

        if (key === "Backspace" || key === "Delete" || key === "0") {
            props.dispatch({ type: "ClearCell" })
        }
    }

    createEffect(() => {
        if (!props.model.invalid) return
        const timeout = setTimeout(() => {
            props.dispatch({ type: "ClearInvalid" })
        }, 450)
        onCleanup(() => clearTimeout(timeout))
    })

    createEffect(() => {
        if (props.model.solved && !wasSolved) {
            const colors = ["#f9d65c", "#ef476f", "#48a9a6", "#8ecae6", "#c99700"]
            const defaults = {
                startVelocity: 34,
                spread: 110,
                ticks: 180,
                gravity: 0.9,
                scalar: 0.85,
                zIndex: 4,
                colors,
                disableForReducedMotion: true
            }
            confetti({
                ...defaults,
                particleCount: 32,
                angle: 90,
                origin: { x: 0.5, y: 0.55 }
            })
        }
        wasSolved = props.model.solved
    })

    createEffect(() => {
        document.documentElement.dataset.theme = props.model.theme
    })

    createEffect(() => {
        if (props.model.startedAt === null) return
        const interval = setInterval(() => {
            props.dispatch({ type: "Tick" })
        }, 250)
        onCleanup(() => clearInterval(interval))
    })

    return (
        <div
            class="game"
            ref={el => (rootRef = el)}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onClick={() => rootRef?.focus()}
        >
            <Show when={props.model.solved}>
                <div class="modal-backdrop" />
                <div class="modal" role="dialog" aria-live="polite">
                    <div class="modal-card">
                        <div class="modal-title">Puzzle solved</div>
                        <div class="modal-time">
                            {formatElapsed(props.model.elapsedMs)}
                        </div>
                        <div class="modal-subtitle">
                            good job bebe!!!
                        </div>
                        <div class="modal-actions">
                            <button
                                class="key secondary"
                                onClick={() => props.dispatch({ type: "DismissSolved" })}
                            >
                                Close
                            </button>
                            <button
                                class="key secondary"
                                onClick={confirmNewGame}
                            >
                                New Puzzle
                            </button>
                        </div>
                    </div>
                </div>
            </Show>
            <Show when={props.model.confirmNewGame}>
                <div class="modal-backdrop confirm" />
                <div class="modal confirm" role="dialog" aria-live="polite">
                    <div class="modal-card">
                        <div class="modal-title">Are you sure?</div>
                        <div class="modal-subtitle">
                            Your current progress will be lost.
                        </div>
                        <div class="modal-actions">
                            <button
                                class="key secondary"
                                onClick={() => props.dispatch({ type: "CancelNewGame" })}
                            >
                                Cancel
                            </button>
                            <button
                                class="key secondary"
                                onClick={() => props.dispatch({ type: "ConfirmNewGame" })}
                            >
                                New Puzzle
                            </button>
                        </div>
                    </div>
                </div>
            </Show>
            <div class="toolbar">
                <div class="timer">
                    {formatElapsed(props.model.elapsedMs)}
                </div>
                <div class="toolbar-actions">
                    <button
                        class="key secondary"
                        onClick={() => props.dispatch({ type: "ToggleTheme" })}
                    >
                        {props.model.theme === "dark" ? "Dark" : "Light"}
                    </button>
                </div>
            </div>
            <div
                class="grid"
                classList={{ invalid: !!props.model.invalid }}
                style={{
                    "animation-name": props.model.invalid
                        ? props.model.invalidPulse % 2 === 0
                            ? "invalid-flash"
                            : "invalid-flash-alt"
                        : "none"
                }}
            >
                <Index each={props.model.grid}>
                    {(cell, i) => {
                        const row = Math.floor(i / 9)
                        const col = i % 9
                        const invalidTarget = props.model.invalid?.target === i
                        const conflict = props.model.invalid?.conflicts.includes(i) ?? false
                        const flash = !!props.model.invalid && (invalidTarget || conflict)
                        const notes = () => props.model.notes[i]
                        return (
                            <div
                                class="cell"
                                classList={{
                                    selected: props.model.selected === i,
                                    given: props.model.givens[i],
                                    "invalid-target": invalidTarget,
                                    conflict,
                                    flash,
                                    "box-right": col === 2 || col === 5,
                                    "box-bottom": row === 2 || row === 5
                                }}
                                onClick={() =>
                                    props.dispatch({ type: "SelectCell", index: i })
                                }
                            >
                                <Show when={cell() !== null}>
                                    {cell()}
                                </Show>
                                <Show when={cell() === null && notes().length > 0}>
                                    <div class="notes">
                                        <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9]}>
                                            {(noteValue) => (
                                                <span class="note">
                                                    {notes().includes(noteValue as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) ? noteValue : ""}
                                                </span>
                                            )}
                                        </For>
                                    </div>
                                </Show>
                            </div>
                        )
                    }}
                </Index>
            </div>
            <div class="keypad">
                <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9]}>
                    {(value) => (
                        <button
                            class="key"
                            onClick={() => props.dispatch({ type: "EnterValue", value: value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 })}
                        >
                            {value}
                        </button>
                    )}
                </For>
                <button class="key secondary" onClick={() => props.dispatch({ type: "ClearCell" })}>
                    Clear
                </button>
                <button
                    class="key secondary"
                    classList={{ active: props.model.inputMode === "note" }}
                    onClick={() => props.dispatch({ type: "ToggleNoteMode" })}
                >
                    Notes {props.model.inputMode === "note" ? "On" : "Off"}
                </button>
                <button class="key secondary" onClick={confirmNewGame}>
                    New
                </button>
            </div>
        </div>
    )
}
