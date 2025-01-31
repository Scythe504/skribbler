
export enum DrawingTool {
    PaintBrush = "PaintBrushTool",
    BucketTool = "BucketTool",
    EraseTool = "EraseTool",
}
export interface DrawData {
    x: Number;
    y: Number;
    color: String;
    lineWidth: Number;
    isDragging: Boolean;
}

export interface Snapshot {
    toolType: DrawingTool;
    points: {
        current: Point;
        previous: Point | null;
    };
    color: HexString;
    lineWidth: number;
    timestamp: number;
}

interface DrawingState {
    snapshots: Snapshot[];
    currentIndex: number;
}

export class DrawingManager {
    private drawMethods: DrawMethods;
    private state: DrawingState;
    private ws: WebSocket;
    private ctx: CanvasRenderingContext2D;

    constructor({ ctx, websocketUrl }: {
        ctx: CanvasRenderingContext2D,
        websocketUrl: string
    }) {
        this.drawMethods = new DrawMethods('000000')
        this.state = {
            snapshots: [],
            currentIndex: -1,
        }
        this.ws = new WebSocket(websocketUrl)
        this.ctx = ctx

        this.setupWebSocket()
    }

    private setupWebSocket() {
        this.ws.onmessage = (event) => {
            const snapshot = JSON.parse(event.data)
            this.applyRemoteSnapshot(snapshot);
        }
    }

    public createSnapshot({ toolType, currentPoint, prevPoint, color, lineWidth }: {
        toolType: DrawingTool,
        currentPoint: Point,
        prevPoint: Point | null,
        color: HexString,
        lineWidth: number
    }): Snapshot {

        const snapshot: Snapshot = {
            toolType,
            points: {
                current: currentPoint,
                previous: prevPoint,
            },
            color,
            lineWidth,
            timestamp: Date.now()
        }

        this.state.snapshots.push(snapshot);
        this.state.currentIndex++

        this.ws.send(JSON.stringify({
            type: "draw",
            data: snapshot
        }))

        return snapshot
    }

    public applyRemoteSnapshot(snapshot: Snapshot) {
        // TODO - improve color replacing
        const tempDrawMethods = new DrawMethods(snapshot.color.replace('#', ''))
        tempDrawMethods.lineWidth = snapshot.lineWidth

        const drawMethod = tempDrawMethods.getDrawMethod(snapshot.toolType);

        drawMethod({
            ctx: this.ctx,
            currentPoint: snapshot.points.current,
            prevPoint: snapshot.points.previous
        })

        this.state.snapshots.push(snapshot);    
        this.state.currentIndex++
    }

    public replaySnapshots() {
        // Clear canvas first
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Replay all snapshots
        this.state.snapshots.forEach(snapshot => {
            this.drawMethods.lineColor = snapshot.color;
            this.drawMethods.lineWidth = snapshot.lineWidth;

            const drawMethod = this.drawMethods.getDrawMethod(snapshot.toolType);
            drawMethod({
                ctx: this.ctx,
                currentPoint: snapshot.points.current,
                prevPoint: snapshot.points.previous,
            });
        });
    }


    public undo() {
        if (this.state.currentIndex >= 0) {
            this.state.currentIndex--;
            this.replaySnapshots();
        }
    }

    public redo() {
        if (this.state.currentIndex < this.state.snapshots.length - 1) {
            this.state.currentIndex++;
            this.replaySnapshots();
        }
    }

}


export class DrawMethods {
    lineWidth: number;
    lineColor: HexString;

    public constructor(color: string) {
        this.lineWidth = 5;
        this.lineColor = `#${color}`;  // Default to black instead of white for better visibility
    }

    public getDrawMethod = (tool: DrawingTool) => {
        switch (tool) {
            case DrawingTool.PaintBrush:
                return this.drawLine.bind(this);
            case DrawingTool.EraseTool:
                return this.eraseLine.bind(this);
            case DrawingTool.BucketTool:
                return this.fillPaint.bind(this);
            default:
                return this.drawLine.bind(this);
        }
    }

    public drawLine = ({ ctx, currentPoint, prevPoint }: Draw) => {
        const { x: currX, y: currY } = currentPoint;
        let startPoint = prevPoint ?? currentPoint;

        if (!ctx) return;

        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.lineColor;
        ctx.lineCap = 'round';    // Add round line caps for smoother lines
        ctx.lineJoin = 'round';   // Add round line joins for smoother lines

        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currX, currY);
        ctx.stroke();

        // Draw end cap
        ctx.fillStyle = this.lineColor;
        ctx.beginPath();
        ctx.arc(currX, currY, this.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    public eraseLine = ({ ctx, currentPoint, prevPoint }: Draw) => {
        const { x: currX, y: currY } = currentPoint;
        let startPoint = prevPoint ?? currentPoint;

        if (!ctx) return;

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';

        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currX, currY);
        ctx.stroke();

        // Draw end cap for eraser
        ctx.beginPath();
        ctx.arc(currX, currY, this.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    public fillPaint = ({ ctx, currentPoint }: Draw) => {
        try {
            if (!ctx) return;

            const { x, y } = currentPoint;
            const roundedX = Math.floor(x);
            const roundedY = Math.floor(y);

            const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            const pixels = imageData.data;

            const targetColor = this.getPixel({
                pixels,
                x: roundedX,
                y: roundedY,
                width: ctx.canvas.width
            });

            const fillColor = this.hexToRgba(this.lineColor);

            // Don't fill if clicking on the same color
            if (this.compareColors({
                color_one: fillColor,
                color_two: targetColor
            })) return;

            const pixelsToCheck: Point[] = [{ x: roundedX, y: roundedY }];
            const visited = new Set<string>();

            while (pixelsToCheck.length > 0) {
                const currentPixel = pixelsToCheck.pop()!;
                const px = currentPixel.x;
                const py = currentPixel.y;

                if (px < 0 || px >= ctx.canvas.width || py < 0 || py >= ctx.canvas.height) {
                    continue;
                }

                const key = `${px},${py}`;
                if (visited.has(key)) continue;
                visited.add(key);

                const currentColor = this.getPixel({
                    pixels,
                    x: px,
                    y: py,
                    width: ctx.canvas.width
                });

                // Modified fill condition to better handle transparency
                const isTargetTransparent = targetColor.a < 10;
                const isCurrentTransparent = currentColor.a < 10;
                const shouldFill = isTargetTransparent
                    ? isCurrentTransparent
                    : this.compareColors({ color_one: currentColor, color_two: targetColor });

                if (!shouldFill) continue;

                this.setPixel({
                    pixels,
                    x: px,
                    y: py,
                    color: fillColor,
                    width: ctx.canvas.width
                });

                // Add neighbors in all 4 directions
                pixelsToCheck.push(
                    { x: px + 1, y: py },
                    { x: px - 1, y: py },
                    { x: px, y: py + 1 },
                    { x: px, y: py - 1 }
                );
            }

            ctx.putImageData(imageData, 0, 0);
        } catch (e) {
            console.error('Error in fillPaint:', e);
        }
    }

    private getPixel({ pixels, x, y, width }: {
        pixels: Uint8ClampedArray,
        x: number,
        y: number,
        width: number
    }): Rgba {
        const index = (y * width + x) * 4;
        return {
            r: pixels[index] || 0,
            g: pixels[index + 1] || 0,
            b: pixels[index + 2] || 0,
            a: pixels[index + 3] || 0
        };
    }

    private setPixel({ pixels, x, y, color, width }: {
        pixels: Uint8ClampedArray,
        x: number,
        y: number,
        color: Rgba,
        width: number
    }) {
        const index = (y * width + x) * 4;
        pixels[index] = color.r;
        pixels[index + 1] = color.g;
        pixels[index + 2] = color.b;
        pixels[index + 3] = color.a;
    }

    private compareColors({ color_one, color_two }: {
        color_one: Rgba,
        color_two: Rgba
    }): boolean {
        const tolerance = 5;
        return Math.abs(color_one.r - color_two.r) <= tolerance &&
            Math.abs(color_one.g - color_two.g) <= tolerance &&
            Math.abs(color_one.b - color_two.b) <= tolerance &&
            Math.abs(color_one.a - color_two.a) <= tolerance;
    }

    private hexToRgba(hex: string): Rgba {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: 255
        } : { r: 0, g: 0, b: 0, a: 255 };
    }
}