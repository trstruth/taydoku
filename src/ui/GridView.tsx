import { For, Show, createEffect, onCleanup, onMount } from "solid-js"
import type { Model } from "../app/model"
import type { Msg } from "../app/msg"

export function GridView(props: {
    model: Model
    dispatch: (msg: Msg) => void
}) {
    let rootRef: HTMLDivElement | undefined
    const confettiPieces = Array.from({ length: 24 }, (_, i) => i)

    onMount(() => {
        rootRef?.focus()
    })

    const onKeyDown = (event: KeyboardEvent) => {
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

    return (
        <div
            class="game"
            ref={el => (rootRef = el)}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onClick={() => rootRef?.focus()}
        >
            <Show when={props.model.solved}>
                <div class="confetti" aria-hidden="true">
                    <For each={confettiPieces}>
                        {(i) => (
                            <span
                                class="confetti-piece"
                                style={{
                                    "--x": `${(i * 37) % 100}%`,
                                    "--delay": `${(i % 6) * 0.08}s`,
                                    "--dur": `${1.6 + (i % 5) * 0.2}s`,
                                    "--hue": `${(i * 29) % 360}`
                                }}
                            />
                        )}
                    </For>
                </div>
            </Show>
            <div class="grid" classList={{ invalid: !!props.model.invalid }}>
                <For each={props.model.grid}>
                    {(cell, i) => {
                        const row = Math.floor(i() / 9)
                        const col = i() % 9
                        const invalidTarget = props.model.invalid?.target === i()
                        const conflict = props.model.invalid?.conflicts.includes(i()) ?? false
                        const flash = !!props.model.invalid && (invalidTarget || conflict)
                        const notes = () => props.model.notes[i()]
                        return (
                            <div
                                class="cell"
                                classList={{
                                    selected: props.model.selected === i(),
                                    given: props.model.givens[i()],
                                    "invalid-target": invalidTarget,
                                    conflict,
                                    flash,
                                    "box-right": col === 2 || col === 5,
                                    "box-bottom": row === 2 || row === 5
                                }}
                                onClick={() =>
                                    props.dispatch({ type: "SelectCell", index: i() })
                                }
                            >
                                <Show when={cell !== null}>
                                    {cell}
                                </Show>
                                <Show when={cell === null && notes().length > 0}>
                                    <div class="notes">
                                        <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9]}>
                                            {(value) => (
                                                <span class="note">
                                                    {notes().includes(value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) ? value : ""}
                                                </span>
                                            )}
                                        </For>
                                    </div>
                                </Show>
                            </div>
                        )
                    }}
                </For>
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
                <button class="key secondary" onClick={() => props.dispatch({ type: "NewGame" })}>
                    New
                </button>
            </div>
        </div>
    )
}
