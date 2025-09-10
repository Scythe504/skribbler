"use client"

import { usePixelArt } from "@/hooks/usePixelArt"
import type { GridConfig } from "@/types/pixelArt"
import { Button } from "../ui/button"
import { useAtom } from "jotai"
import { currentColor } from "@/store/atoms/color"
import { currentTool } from "@/store/atoms/drawTool"

const GRID_CONFIG: GridConfig = {
    gridSize: 20, // Each "pixel" is 20x20 canvas pixels
    gridWidth: 35, // 35 grid cells wide
    gridHeight: 25, // 25 grid cells tall
    canvasWidth: 700, // 35 * 20 = 700
    canvasHeight: 500, // 25 * 20 = 500
}

interface PixelArtCanvasProps {
    websocketUrl?: string
}

export const PixelArtCanvas = ({ websocketUrl }: PixelArtCanvasProps) => {
    // Use atom-based state instead of hook-based state
    const [atomColor] = useAtom(currentColor)
    const [atomTool] = useAtom(currentTool)
    
    const {
        canvasRef,
        onMouseDown,
        isDrawing,
        manager
    } = usePixelArt({
        gridConfig: GRID_CONFIG,
        websocketUrl: websocketUrl,
    })

    const clearCanvas = () => {
        if (manager) {
            // Clear pixels but keep grid
            manager.clearPixels()
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-sm text-gray-600 mb-2">
                Current Tool: <span className="font-medium">{atomTool}</span> | 
                Current Color: <span 
                    className="inline-block w-4 h-4 rounded ml-1 mr-1 border" 
                    style={{ backgroundColor: `#${atomColor}` }}
                ></span>
                #{atomColor}
            </div>
            <canvas
                ref={canvasRef}
                width={GRID_CONFIG.canvasWidth}
                height={GRID_CONFIG.canvasHeight}
                onMouseDown={onMouseDown}
                className="border-2 border-gray-300 cursor-crosshair bg-white"
                style={{ imageRendering: "pixelated" }}
            />
            <Button
                onClick={clearCanvas}
                variant={"destructive"}
            >
                Clear Pixels
            </Button>
        </div>
    )
}