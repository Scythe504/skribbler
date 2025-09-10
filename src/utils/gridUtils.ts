import {
    GridPosition, 
    GridConfig, 
    GridState
} from '@/types/pixelArt';

export class GridUtils {
    private config: GridConfig;

    constructor(config: GridConfig) {
        this.config = config;
    }

    // Convert mouse coordinates to grid coordinates
    mouseToGrid(mouseX: number, mouseY: number): GridPosition | null {
        const gridX = Math.floor(mouseX / this.config.gridSize)
        const gridY = Math.floor(mouseY / this.config.gridSize) 

        if (gridX < 0 || gridX >= this.config.gridHeight ||
            gridY < 0 || gridY >= this.config.gridWidth) {
            return null       
        }

        return { gridX, gridY }
    }

    // Convert grid coordinates to canvas coordinates (top-left of grid cell)
    gridToCanvas(gridX: number, gridY: number): { x: number; y: number } {
        return {
            x: gridX * this.config.gridSize,
            y: gridY * this.config.gridSize
        };
    }

    // Create Key for grid position
    gridKey(gridX: number, gridY: number): string {
        return `${gridX},${gridY}`
    }

    // Parse GridKey to coordinates
    parseGridKey(key: string): { gridX: number, gridY: number } {
        const [x, y] = key.split(',').map(k => Number(k))
        return { gridX: x, gridY: y }
    }


    // Get neighbors for flood fill algorithm (4-Directionals)
    getNeighbors(gridX: number, gridY: number): GridPosition[] {
        const neighbors: GridPosition[] = []
        const directions = [
            {dx: 0, dy: -1}, // up
            {dx: 0, dy: 1 }, // down
            {dx: 1, dy: 0 }, // right
            {dx: -1, dy: 0}, // left
        ]

        for (const {dx, dy} of directions) {
            const newX = gridX + dx;
            const newY = gridY + dy;

            if (newX >= 0 && newX < this.config.gridWidth &&
                newY >= 0 && newY < this.config.gridWidth
            ) {
                neighbors.push({ gridX: newX, gridY: newY })
            }
        }

        return neighbors
    }

    // Bersenhams Line Algorithm
    getGridLine(x0: number, y0: number, x1: number, y1: number): GridPosition[] {
        const positions: GridPosition[] = []
        const dx = Math.abs(x1 - x0)
        const dy = Math.abs(y1 - y0)
        const sx = x0 < x1 ? 1 : -1
        const sy = y0 < y1 ? 1 : -1
        let err = dx - dy;

        let x = x0, y = y1

        while (true) {
            positions.push({ gridX: x, gridY: y })

            if (x === x1 && y === y1) break

            const e2 = 2 * err

            if (e2 > -dy) {
                err -= dy
                x += sx
            }
            if (e2 < dx) {
                err += dx
                y += sy
            }
        }

        return positions
    }

}