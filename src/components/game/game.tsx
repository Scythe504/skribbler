import { Players } from "@/components/player/players"
import { PixelArtCanvas } from "@/components/drawing-canvas/canvas"
// import { DrawMethods } from "../drawing-canvas/draw-methods"
import { ColorPicker } from "../drawing-canvas/color-picker"
import { WordModal } from "../words/word-modal"

export const Game = () => {
    return <div
        className="flex flex-col w-screen h-screen py-20 gap-2 justify-center"
    >
        <div className="flex w-full flex-row items-center justify-center">
            <WordModal />
        </div>
        <div className="flex flex-row items-start w-full px-8">
            <Players />
            <div>
                <PixelArtCanvas />
                {/* <DrawMethods /> */}
                <ColorPicker />
            </div>
        </div>
        {/* <Players/> */}
    </div>
}