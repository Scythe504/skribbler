// hooks/usePixelArt.ts
import { wsAtom, gameStateAtom, playerNameAtom } from "@/store/atoms/ws";
import { GridConfig, PixelTool } from "@/types/pixelArt";
import { PixelDrawingManager } from "@/utils/draw";
import { useAtom } from "jotai";
import React, { useCallback, useEffect, useRef, useMemo } from "react";
import { currentColor } from "@/store/atoms/color";
import { currentTool } from "@/store/atoms/drawTool";
import { dragPixelsAtom, drawingAtom, pixelManagerAtom } from "@/store/atoms/game";

interface UsePixelArtProps {
    gridConfig: GridConfig;
}

export const usePixelArt = ({ gridConfig }: UsePixelArtProps) => {
    const [ws] = useAtom(wsAtom);
    const [gameState] = useAtom(gameStateAtom);
    const [playerName] = useAtom(playerNameAtom);
    const [atomColor] = useAtom(currentColor);
    const [atomTool] = useAtom(currentTool);
    const [pixelManager, setPixelManager] = useAtom(pixelManagerAtom);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const managerRef = useRef<PixelDrawingManager | null>(null);

    const [isDrawing, setIsDrawing] = useAtom(drawingAtom);
    const [_dragPixels, setDragPixels] = useAtom(dragPixelsAtom);

    // Convert hex color from atom (without #) to full hex color (with #)
    const localCurrentColor = `#${atomColor}`;
    const localCurrentTool = atomTool;

    // Check if current player can draw
    const canDraw = useMemo(() => {
        if (!playerName || gameState.players.length === 0) return false;

        const currentPlayer = gameState.players.find(p => p.username === playerName);
        return currentPlayer?.can_draw ?? false;
    }, [gameState.players, playerName]);

    // Check if drawing is allowed in current phase
    const isDrawingPhase = useMemo(() => {
        return gameState.phase === "drawing";
    }, [gameState.phase]);

    // Combined permission check
    const hasDrawingPermission = useMemo(() => {
        return canDraw && isDrawingPhase;
    }, [canDraw, isDrawingPhase]);

    // Initialize canvas and manager
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions
        canvas.width = gridConfig.canvasWidth;
        canvas.height = gridConfig.canvasHeight;

        // Create manager with WebSocket if available
        const manager = new PixelDrawingManager(gridConfig, ctx, ws || undefined);
        managerRef.current = manager;
        setPixelManager(manager);

        return () => {
            if (managerRef.current) {
                managerRef.current.destroy();
                managerRef.current = null;
                setPixelManager(null);
            }
        };
    }, [gridConfig, ws, setPixelManager]);

    const getMousePos = useCallback((e: MouseEvent): { x: number, y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }, []);

    const handleMouseDown = useCallback((e: MouseEvent) => {
        // Prevent action if no drawing permission
        if (!hasDrawingPermission || e.button !== 0 || !managerRef.current) return;

        const mousePos = getMousePos(e);
        const gridPos = managerRef.current.getGridPosition(mousePos.x, mousePos.y);

        if (!gridPos) return;

        if (localCurrentTool === PixelTool.Fill) {
            managerRef.current.fillArea(gridPos.gridX, gridPos.gridY, localCurrentColor);
        } else {
            setIsDrawing(true);
            setDragPixels(new Set()); // clear the drag set

            const pixelKey = `${gridPos.gridX},${gridPos.gridY}`;
            setDragPixels(prev => {
                const newSet = new Set(prev);
                newSet.add(pixelKey);
                return newSet;
            });

            if (localCurrentTool === PixelTool.Pixel) {
                managerRef.current.placePixel(gridPos.gridX, gridPos.gridY, localCurrentColor);
            } else if (localCurrentTool === PixelTool.Eraser) {
                managerRef.current.erasePixelAt(gridPos.gridX, gridPos.gridY);
            }
        }
    }, [hasDrawingPermission, localCurrentColor, localCurrentTool, getMousePos, setIsDrawing, setDragPixels]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!hasDrawingPermission || !isDrawing || !managerRef.current) return;
        if (localCurrentTool === PixelTool.Fill) return;

        const mousePos = getMousePos(e);
        const gridPos = managerRef.current.getGridPosition(mousePos.x, mousePos.y);

        if (!gridPos) return;

        const pixelKey = `${gridPos.gridX},${gridPos.gridY}`;

        setDragPixels(prev => {
            if (prev.has(pixelKey)) return prev; // already drawn this pixel

            const newSet = new Set(prev);
            newSet.add(pixelKey);

            if (localCurrentTool === PixelTool.Pixel) {
                managerRef.current!.placePixel(gridPos.gridX, gridPos.gridY, localCurrentColor);
            } else if (localCurrentTool === PixelTool.Eraser) {
                managerRef.current!.erasePixelAt(gridPos.gridX, gridPos.gridY);
            }

            return newSet;
        });
    }, [hasDrawingPermission, isDrawing, localCurrentTool, localCurrentColor, getMousePos, setDragPixels]);

    const handleMouseUp = useCallback(() => {
        setIsDrawing(false);
        setDragPixels(new Set()); // reset after drag ends
    }, [setIsDrawing, setDragPixels]);

    // Mouse event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const mouseDownHandler = (e: MouseEvent) => {
            e.preventDefault();
            handleMouseDown(e);
        };
        const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e);
        const mouseUpHandler = () => handleMouseUp();
        const contextMenuHandler = (e: MouseEvent) => e.preventDefault();

        canvas.addEventListener('mousedown', mouseDownHandler);
        canvas.addEventListener('mousemove', mouseMoveHandler);
        canvas.addEventListener('contextmenu', contextMenuHandler);

        document.addEventListener('mouseup', mouseUpHandler);
        document.addEventListener('mouseleave', mouseUpHandler);

        return () => {
            canvas.removeEventListener('mousedown', mouseDownHandler);
            canvas.removeEventListener('mousemove', mouseMoveHandler);
            canvas.removeEventListener('contextmenu', contextMenuHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            document.removeEventListener('mouseleave', mouseUpHandler);
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUp]);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        handleMouseDown(e.nativeEvent);
    }, [handleMouseDown]);

    // Clear canvas function with permission check
    const clearCanvas = useCallback(() => {
        if (!hasDrawingPermission || !pixelManager) return false;

        pixelManager.clearPixels();
        return true;
    }, [hasDrawingPermission, pixelManager]);

    return {
        canvasRef,
        onMouseDown,
        isDrawing,
        manager: managerRef.current,
        canDraw: hasDrawingPermission,
        isDrawingPhase,
        clearCanvas
    };
};