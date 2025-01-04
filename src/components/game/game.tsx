import { Players } from "@/components/player/players"
import { DrawingCanvas } from "@/components/drawing-canvas/canvas"
import { DrawMethods } from "../drawing-canvas/draw-methods"
import { ColorPicker } from "../drawing-canvas/color-picker"

export const Game = () => {
    return <div
        className="flex w-screen h-screen py-20 gap-2 justify-center"
    >
        <Players />
        <div>
            <DrawingCanvas />
            <DrawMethods/>
            <ColorPicker/>
        </div>
        {/* <Players/> */}
    </div>
}