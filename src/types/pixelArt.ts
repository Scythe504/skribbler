export interface GridPosition {
    gridX: number;
    gridY: number;
}

export interface PixelData {
    type: 'place' | 'erase' | 'fill';
    x: number;
    y: number;
    color: string;
    timestamp: number;
}

export interface PixelBatch {
    type: 'batch_place' | 'batch_erase';
    pixels: GridPosition[];
    color: string;
    timestamp: number;
}

export interface GridConfig {
    gridSize: number;
    gridWidth: number;
    gridHeight: number;
    canvasWidth: number;
    canvasHeight: number;
}

export enum PixelTool {
    Pixel = "PixelTool",
    Eraser = "EraserTool",
    Fill = "FillTool",
}

export interface GridState {
    pixels: Map<string, string>;
}

export type PixelMessage = PixelData | PixelBatch;