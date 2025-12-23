import { createSignal } from "solid-js"
import "./App.css"
import type { Model } from "./app/model"
import type { Msg } from "./app/msg"
import { update } from "./app/update"
import { GridView } from "./ui/GridView"
import { generatePuzzleFromText } from "./domain/generator"
import puzzlesText from "../puzzles.txt?raw"

const createModel = (): Model => {
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
        theme: "dark",
        startedAt: Date.now(),
        elapsedMs: 0
    }
}

export default function App() {
    const [model, setModel] = createSignal(createModel())

    const dispatch = (msg: Msg) =>
        setModel(m => update(m, msg))


    return (
        <div class="app">
            <div class="app-content">
                <GridView model={model()} dispatch={dispatch} />
            </div>
            <footer class="app-footer">
                made with love, for my sweetie 
            </footer>
        </div>
    )
}
