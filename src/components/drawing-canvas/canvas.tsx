'use client'
import { useDraw } from "@/hooks/useDraw"
import { currentColor } from "@/store/atoms/color";
import { currentTool } from "@/store/atoms/drawTool";
import { DrawingTool, DrawMethods } from "@/utils/draw";
import { useAtom } from "jotai";
import { useMemo } from "react";

export const DrawingCanvas = () => {
    const [color] = useAtom(currentColor)
    const drawMethod = useMemo(() => new DrawMethods(color), [color])
    const [drawTool] = useAtom(currentTool)
    const { canvasRef, onMouseDown } = useDraw(
        drawMethod.getDrawMethod(drawTool),
        drawMethod.getDrawMethod(drawTool),
        drawTool === DrawingTool.BucketTool ? 'fill' : 'line',
        "http://localhost:8080/ws/wes432"
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