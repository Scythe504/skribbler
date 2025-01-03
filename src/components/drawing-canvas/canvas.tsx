'use client'
import { useDraw } from "@/hooks/useDraw"
import { currentTool } from "@/store/atoms/drawTool";
import { DrawMethods } from "@/utils/draw";
import { useAtom } from "jotai";
import { useCallback, useMemo } from "react";

export const DrawingCanvas = () => {
    const drawMethod = useMemo(() => new DrawMethods(), [])
    const [drawTool] = useAtom(currentTool)
    const { canvasRef, onMouseDown } = useDraw(
        drawMethod.getDrawMethod(drawTool)
    )
    
    return <div>
        <canvas
            className="border border-zinc-800"
            height={500}
            width={700}
            ref={canvasRef}
            onMouseDown={onMouseDown}
        >
        </canvas>
    </div>
}