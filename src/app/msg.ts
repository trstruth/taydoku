import type { Value } from "../domain/cell"

export type Msg =
    | { type: "SelectCell"; index: number }
    | { type: "EnterValue"; value: Value }
    | { type: "ClearCell" }
    | { type: "RequestNewGame" }
    | { type: "CancelNewGame" }
    | { type: "ConfirmNewGame" }
    | { type: "NewGame" }
    | { type: "ClearInvalid" }
    | { type: "ToggleNoteMode" }
    | { type: "ToggleTheme" }
    | { type: "Tick" }
    | { type: "Solve" }
    | { type: "DismissSolved" }
