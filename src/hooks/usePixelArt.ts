import { wsAtom } from "@/store/atoms/ws";
import { GridConfig, PixelTool } from "@/types/pixelArt";
import { PixelDrawingManager } from "@/utils/draw";
import { useAtom } from "jotai";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { currentColor } from "@/store/atoms/color";
import { currentTool } from "@/store/atoms/drawTool";

interface UsePixelArtProps {
    gridConfig: GridConfig;
    websocketUrl?: string;
}

export const usePixelArt = ({ gridConfig, websocketUrl }: UsePixelArtProps) => {
    const [ws] = useAtom(wsAtom)
    const [atomColor] = useAtom(currentColor)
    const [atomTool] = useAtom(currentTool)

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const managerRef = useRef<PixelDrawingManager | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const dragPixels = useRef<Set<string>>(new Set());

    // Convert hex color from atom (without #) to full hex color (with #)
    const localCurrentColor = `#${atomColor}`;
    const localCurrentTool = atomTool;

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions
        canvas.width = gridConfig.canvasWidth;
        canvas.height = gridConfig.canvasHeight;

        managerRef.current = new PixelDrawingManager(gridConfig, ctx, ws!);

        return () => {
            if (managerRef.current) {
                managerRef.current.destroy();
                managerRef.current = null;
            }
        };
    }, [gridConfig, websocketUrl])

    const getMousePos = useCallback((e: MouseEvent): { x: number, y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }, [])

    const handleMouseDown = useCallback((e: MouseEvent) => {
        if (e.button !== 0 || !managerRef.current) return;

        const mousePos = getMousePos(e);
        const gridPos = managerRef.current.getGridPosition(mousePos.x, mousePos.y)

        if (!gridPos) return;

        if (localCurrentTool === PixelTool.Fill) {
            managerRef.current.fillArea(gridPos.gridX, gridPos.gridY, localCurrentColor)
        } else {
            setIsDrawing(true);
            dragPixels.current.clear();

            const pixelKey = `${gridPos.gridX},${gridPos.gridY}`;
            dragPixels.current.add(pixelKey);

            if (localCurrentTool === PixelTool.Pixel) {
                managerRef.current.placePixel(gridPos.gridX, gridPos.gridY, localCurrentColor);
            } else if (localCurrentTool === PixelTool.Eraser) {
                managerRef.current.erasePixelAt(gridPos.gridX, gridPos.gridY)
            }
        }
    }, [localCurrentColor, localCurrentTool, getMousePos])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDrawing || !managerRef.current) return;
        if (localCurrentTool === PixelTool.Fill) return;

        const mousePos = getMousePos(e);
        const gridPos = managerRef.current.getGridPosition(mousePos.x, mousePos.y);

        if (!gridPos) return;

        const pixelKey = `${gridPos.gridX},${gridPos.gridY}`;

        // Only draw if we havent drawn this pixel yet in this drag
        if (!dragPixels.current.has(pixelKey)) {
            dragPixels.current.add(pixelKey);

            if (localCurrentTool === PixelTool.Pixel) {
                managerRef.current.placePixel(gridPos.gridX, gridPos.gridY, localCurrentColor);
            } else if (localCurrentTool === PixelTool.Eraser) {
                managerRef.current.erasePixelAt(gridPos.gridX, gridPos.gridY)
            }
        }
    }, [isDrawing, localCurrentTool, localCurrentColor, getMousePos]);

    const handleMouseUp = useCallback(() => {
        setIsDrawing(false);
        dragPixels.current.clear();
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const mouseDownHandler = (e: MouseEvent) => {
            e.preventDefault();
            handleMouseDown(e);
        }
        const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e)
        const mouseUpHandler = () => handleMouseUp()

        // Prevent context menu on right click
        const contextMenuHandler = (e: MouseEvent) => e.preventDefault();

        canvas.addEventListener('mousedown', mouseDownHandler)
        canvas.addEventListener('mousemove', mouseMoveHandler)
        canvas.addEventListener('contextmenu', contextMenuHandler)

        document.addEventListener('mouseup', mouseUpHandler)
        document.addEventListener('mouseleave', mouseUpHandler)

        return () => {
            canvas.removeEventListener('mousedown', mouseDownHandler);
            canvas.removeEventListener('mousemove', mouseMoveHandler);
            canvas.removeEventListener('contextmenu', contextMenuHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            document.removeEventListener('mouseleave', mouseUpHandler);
        }
    }, [handleMouseDown, handleMouseMove, handleMouseUp])

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        handleMouseDown(e.nativeEvent);
    }, [handleMouseDown])

    return {
        canvasRef,
        onMouseDown,
        isDrawing,
        manager: managerRef.current
    }
}