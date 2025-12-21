import { createSignal } from "solid-js"
import "./App.css"
import type { Model } from "./app/model"
import type { Msg } from "./app/msg"
import { update } from "./app/update"
import { GridView } from "./ui/GridView"
import { generatePuzzle } from "./domain/generator"

const createModel = (): Model => {
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
}

export default function App() {
    const [model, setModel] = createSignal(createModel())

    const dispatch = (msg: Msg) =>
        setModel(m => update(m, msg))


    return (
        <GridView model={model()} dispatch={dispatch} />
    )
}
