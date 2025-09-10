import { GridConfig } from "@/types/pixelArt";

export class GridUtils {
    private config: GridConfig;

    constructor(config: GridConfig) {
        this.config = config;
    }

    // Convert mouse coordinates to grid position
    mouseToGrid(mouseX: number, mouseY: number): { gridX: number; gridY: number } | null {
        // Make sure we're within bounds
        if (mouseX < 0 || mouseY < 0 || mouseX >= this.config.canvasWidth || mouseY >= this.config.canvasHeight) {
            return null;
        }

        const gridX = Math.floor(mouseX / this.config.gridSize);
        const gridY = Math.floor(mouseY / this.config.gridSize);

        // Double check bounds
        if (gridX < 0 || gridX >= this.config.gridWidth || gridY < 0 || gridY >= this.config.gridHeight) {
            return null;
        }

        return { gridX, gridY };
    }

    // Convert grid position to canvas coordinates
    gridToCanvas(gridX: number, gridY: number): { x: number; y: number } {
        return {
            x: gridX * this.config.gridSize,
            y: gridY * this.config.gridSize
        };
    }

    // Create a unique key for a grid position
    gridKey(gridX: number, gridY: number): string {
        return `${gridX},${gridY}`;
    }

    // Parse a grid key back to coordinates
    parseGridKey(key: string): { gridX: number; gridY: number } {
        const [gridX, gridY] = key.split(',').map(Number);
        return { gridX, gridY };
    }

    // Get neighboring grid positions for flood fill
    getNeighbors(gridX: number, gridY: number): Array<{ gridX: number; gridY: number }> {
        const neighbors = [];
        
        // Check all 4 directions (up, right, down, left)
        const directions = [
            { dx: 0, dy: -1 }, // up
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }  // left
        ];

        for (const { dx, dy } of directions) {
            const newX = gridX + dx;
            const newY = gridY + dy;
            
            // Check if neighbor is within bounds
            if (newX >= 0 && newX < this.config.gridWidth && 
                newY >= 0 && newY < this.config.gridHeight) {
                neighbors.push({ gridX: newX, gridY: newY });
            }
        }

        return neighbors;
    }
}