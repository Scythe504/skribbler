// PixelArtCanvas.tsx
"use client";
import { usePixelArt } from "@/hooks/usePixelArt";
import type { GridConfig } from "@/types/pixelArt";
import { Button } from "../ui/button";
import { useAtom } from "jotai";
import { currentColor } from "@/store/atoms/color";
import { currentTool } from "@/store/atoms/drawTool";
import { gameStateAtom, playerNameAtom } from "@/store/atoms/ws";
import { useMemo } from "react";

const GRID_CONFIG: GridConfig = {
  gridSize: 20, // Each "pixel" is 20x20 canvas pixels
  gridWidth: 35, // 35 grid cells wide
  gridHeight: 25, // 25 grid cells tall
  canvasWidth: 700, // 35 * 20 = 700
  canvasHeight: 500, // 25 * 20 = 500
};

export const PixelArtCanvas = () => {
  const [atomColor] = useAtom(currentColor);
  const [atomTool] = useAtom(currentTool);
  const [gameState] = useAtom(gameStateAtom);
  const [playerName] = useAtom(playerNameAtom);

  const {
    canvasRef,
    onMouseDown,
    isDrawing,
    manager,
    canDraw,
    isDrawingPhase,
    clearCanvas
  } = usePixelArt({
    gridConfig: GRID_CONFIG,
  });

  // Get current drawer info
  const currentDrawer = useMemo(() => {
    return gameState.currentDrawer;
  }, [gameState.currentDrawer]);

  // Get drawing status message
  const drawingStatusMessage = useMemo(() => {
    if (!isDrawingPhase) {
      return `Phase: ${gameState.phase}`;
    }
    
    if (!currentDrawer) {
      return "No drawer selected";
    }
    
    if (currentDrawer.username === playerName) {
      return "Your turn to draw!";
    }
    
    return `${currentDrawer.username} is drawing`;
  }, [isDrawingPhase, currentDrawer, playerName, gameState.phase]);

  const handleClearCanvas = () => {
    const success = clearCanvas();
    if (!success) {
      console.log("Cannot clear canvas - no drawing permission");
    }
  };

  // Determine cursor style based on permissions
  const cursorStyle = canDraw ? "cursor-crosshair" : "cursor-not-allowed";
  const canvasOpacity = canDraw ? "opacity-100" : "opacity-75";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Game Status */}
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-800">
          {drawingStatusMessage}
        </div>
        {gameState.timeRemaining > 0 && (
          <div className="text-sm text-gray-600">
            Time remaining: {Math.ceil(gameState.timeRemaining / 1000)}s
          </div>
        )}
      </div>

      {/* Tool and Color Info */}
      <div className="text-sm text-gray-600 mb-2">
        Current Tool: <span className="font-medium">{atomTool}</span> |
        Current Color: <span
          className="inline-block w-4 h-4 rounded ml-1 mr-1 border"
          style={{ backgroundColor: `#${atomColor}` }}
        ></span>
        #{atomColor}
        {!canDraw && isDrawingPhase && (
          <span className="ml-2 text-red-500 font-medium">
            (Spectator mode)
          </span>
        )}
      </div>

      {/* Drawing Permission Warning */}
      {!canDraw && isDrawingPhase && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm">
          Only the current drawer can modify the canvas
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={GRID_CONFIG.canvasWidth}
        height={GRID_CONFIG.canvasHeight}
        onMouseDown={onMouseDown}
        className={`border-2 border-gray-300 bg-white ${cursorStyle} ${canvasOpacity}`}
        style={{ imageRendering: "pixelated" }}
      />

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          onClick={handleClearCanvas}
          variant="destructive"
          disabled={!canDraw}
          title={!canDraw ? "Only the current drawer can clear the canvas" : "Clear all pixels"}
        >
          Clear Pixels
        </Button>
      </div>

      {/* Drawing indicator */}
      {isDrawing && canDraw && (
        <div className="text-xs text-green-600 font-medium">
          Drawing...
        </div>
      )}
    </div>
  );
};