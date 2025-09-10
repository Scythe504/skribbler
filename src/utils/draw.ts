import {
    PixelTool,
    PixelData,
    PixelBatch,
    GridConfig,
    GridState,
    PixelMessage
} from "@/types/pixelArt"
import { GridUtils } from "@/utils/gridUtils"

export class PixelDrawingManager {
    private config: GridConfig;
    private gridUtils: GridUtils;
    private state: GridState;
    private ctx: CanvasRenderingContext2D;
    private ws: WebSocket | null = null;

    constructor(config: GridConfig, ctx: CanvasRenderingContext2D, ws?: WebSocket) {
        this.config = config;
        this.gridUtils = new GridUtils(config);
        this.state = { pixels: new Map() };
        this.ctx = ctx;
        this.ws = ws || null

        this.setupCanvas();
    }
    private setupCanvas() {
        this.ctx.imageSmoothingEnabled = false;
        this.clearCanvas();
        this.drawGrid();
    }


    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
    }
    drawGrid() {
        this.ctx.strokeStyle = "#d1d5db"
        this.ctx.lineWidth = 0.5
        this.ctx.globalAlpha = 0.5

        for (let x = 0; x <= this.config.canvasWidth; x += this.config.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + 0.5, 0);
            this.ctx.lineTo(x + 0.5, this.config.canvasHeight);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.config.canvasHeight; y += this.config.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y+0.5);
            this.ctx.lineTo(this.config.canvasWidth, y + 0.5);
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1;
    }

    private drawPixel(gridX: number, gridY: number, color: string) {
        const { x, y } = this.gridUtils.gridToCanvas(gridX, gridY);

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.config.gridSize, this.config.gridSize);

        const key = this.gridUtils.gridKey(gridX, gridY);
        this.state.pixels.set(key, color);
    }

    private erasePixel(gridX: number, gridY: number) {
        const { x, y } = this.gridUtils.gridToCanvas(gridX, gridY);

        // Clear the pixel area
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x, y, this.config.gridSize, this.config.gridSize);

        // Redraw grid lines for this cell
        this.ctx.strokeStyle = "#d1d5db";
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        
        // Draw the borders of this cell
        this.ctx.beginPath();
        // Top border
        this.ctx.moveTo(x + 0.5, y + 0.5);
        this.ctx.lineTo(x + this.config.gridSize + 0.5, y + 0.5);
        // Right border
        this.ctx.moveTo(x + this.config.gridSize + 0.5, y + 0.5);
        this.ctx.lineTo(x + this.config.gridSize + 0.5, y + this.config.gridSize + 0.5);
        // Bottom border
        this.ctx.moveTo(x + this.config.gridSize + 0.5, y + this.config.gridSize + 0.5);
        this.ctx.lineTo(x + 0.5, y + this.config.gridSize + 0.5);
        // Left border
        this.ctx.moveTo(x + 0.5, y + this.config.gridSize + 0.5);
        this.ctx.lineTo(x + 0.5, y + 0.5);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1;

        // Remove from state
        const key = this.gridUtils.gridKey(gridX, gridY);
        this.state.pixels.delete(key);
    }

    private floodFill(startX: number, startY: number, newColor: string) {
        const startKey = this.gridUtils.gridKey(startX, startY);
        const targetColor = this.state.pixels.get(startKey) || 'transparent';

        if (targetColor === newColor) {
            return;
        }

        const pixelsToFill: Array<{ gridX: number, gridY: number }> = [];
        const stack = [{ gridX: startX, gridY: startY }];
        const visited = new Set<string>();

        while (stack.length > 0) {
            const current = stack.pop()!;
            const key = this.gridUtils.gridKey(current.gridX, current.gridY);

            if (visited.has(key)) continue;
            visited.add(key);
            const currentColor = this.state.pixels.get(key) || 'transparent';
            // Check if this pixel should be filled
            if (currentColor !== targetColor) continue;

            pixelsToFill.push(current);

            // Add neighbors to stack
            const neighbors = this.gridUtils.getNeighbors(current.gridX, current.gridY);
            for (const neighbor of neighbors) {
                const neighborKey = this.gridUtils.gridKey(neighbor.gridX, neighbor.gridY);
                if (!visited.has(neighborKey)) {
                    stack.push(neighbor);
                }
            }
        }

        // Fill all pixels at once
        for (const pixel of pixelsToFill) {
            this.drawPixel(pixel.gridX, pixel.gridY, newColor);
        }

        return pixelsToFill;
    }

    public placePixel(gridX: number, gridY: number, color: string, broadcast = true) {
        this.drawPixel(gridX, gridY, color);

        if (broadcast && this.ws && this.ws.readyState === WebSocket.OPEN) {
            const pixelData: PixelData = {
                type: 'place',
                x: gridX,
                y: gridY,
                color,
                timestamp: Date.now()
            };

            const message = {
                type: "pixel_draw",
                data: pixelData
            }

            this.ws.send(JSON.stringify(message));
        }
    }

    public erasePixelAt(gridX: number, gridY: number, broadcast = true) {
        this.erasePixel(gridX, gridY);

        if (broadcast && this.ws && this.ws.readyState === WebSocket.OPEN) {
            const pixelData: PixelData = {
                type: 'erase',
                x: gridX,
                y: gridY,
                color: '',
                timestamp: Date.now()
            };

            // UPDATED: Send with pixel_draw message type
            const message = {
                type: 'pixel_draw',
                data: pixelData
            };

            this.ws.send(JSON.stringify(message));
        }
    }

    public fillArea(gridX: number, gridY: number, color: string, broadcast = true) {
        const filledPixels = this.floodFill(gridX, gridY, color)
        if (broadcast && filledPixels && filledPixels.length > 0 &&
            this.ws && this.ws.readyState === WebSocket.OPEN) {
            const pixelBatch: PixelBatch = {
                type: 'batch_place',
                pixels: filledPixels,
                color,
                timestamp: Date.now(),
            };

            // UPDATED: Send with pixel_draw message type
            const message = {
                type: 'pixel_draw',
                data: pixelBatch
            };

            this.ws.send(JSON.stringify(message));
        }
    }

    public placeBatch(pixels: Array<{gridX: number, gridY: number}>, color: string, broadcast = true){
        for (const pixel of pixels) {
            this.drawPixel(pixel.gridX, pixel.gridY, color);
        }

        if (broadcast && this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message: PixelBatch = {
                type: 'batch_place',
                pixels,
                color,
                timestamp: Date.now(),
            }
            this.ws.send(JSON.stringify(message));
        }
    }

    clearPixels() {
        // Clear the canvas completely
        this.clearCanvas();
        // Redraw the grid
        this.drawGrid();
        // Clear the pixel state
        this.state.pixels.clear();
    }

    private handleRemoteMessage(message: PixelMessage) {
        if ('pixels' in message) {
            // batch operation
            for (const pixel of message.pixels) {
                if (message.type === 'batch_place') {
                    this.drawPixel(pixel.gridX, pixel.gridY, message.color);
                } else if (message.type === 'batch_erase'){
                    this.erasePixel(pixel.gridX, pixel.gridY)
                }
            }
        } else {
            if (message.type === 'place') {
                this.drawPixel(message.x, message.y, message.color);
            } else if (message.type === 'erase'){
                this.erasePixel(message.x, message.y);
            }
        }
    }

    public getGridPosition(mouseX: number, mouseY: number) {
        return this.gridUtils.mouseToGrid(mouseX, mouseY);
    }

    public redrawCanvas() {
        this.clearCanvas();
        this.drawGrid();
        
        // Redraw all pixels
        for (const [key, color] of this.state.pixels) {
            const { gridX, gridY } = this.gridUtils.parseGridKey(key);
            this.drawPixel(gridX, gridY, color);
        }
    }

    public destroy() {
        if (this.ws) {
            this.ws.close();
        }
    }
}