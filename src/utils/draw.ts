type HexString = `#${string}`

export enum DrawingTool {
    PaintBrush = "PaintBrushTool",
    BucketTool = "BucketTool",
    EraseTool = "EraseTool",
}

export class DrawMethods {
    lineWidth: number;
    lineColor: HexString;
    public constructor() {
        this.lineWidth = 5
        this.lineColor = "#FFF"
    };

    public getDrawMethod = (tool: DrawingTool) => {
        switch (tool) {
            case DrawingTool.PaintBrush:
                return this.drawLine.bind(this)
            case DrawingTool.EraseTool:
                return this.eraseLine.bind(this)
            case DrawingTool.BucketTool:
                return this.drawLine.bind(this)
            default:
                return this.drawLine.bind(this)
        }
    }

    public drawLine = ({ ctx, currentPoint, prevPoint }: Draw) => {
        const {
            x: currX,
            y: currY
        } = currentPoint;

        let startPoint = prevPoint ?? currentPoint;
        if (!ctx || ctx === undefined) {
            return;
        }
        ctx.beginPath()
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.lineColor;
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(currX, currY)
        ctx.stroke()

        ctx.fillStyle = this.lineColor;
        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI)
        ctx.fill()
    }

    public eraseLine = ({ ctx, currentPoint, prevPoint }: Draw) => {
        // Get current coordinates
        const { x: currX, y: currY } = currentPoint;

        // If no previous point, use current point
        let startPoint = prevPoint ?? currentPoint;

        // Guard clause for context
        if (!ctx) return;

        // Save the current context state
        ctx.save();

        // Set composite operation to 'destination-out' to create eraser effect
        ctx.globalCompositeOperation = 'destination-out';

        // Begin drawing
        ctx.beginPath();

        // Set line properties
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';    // Round line ends for smoother erasing
        ctx.lineJoin = 'round';   // Round line joins for smoother erasing

        // Draw the line
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currX, currY);
        ctx.stroke();

        // Draw circle at start point for continuous erasing
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, this.lineWidth / 2, 0, 2 * Math.PI);
        ctx.fill();

        // Restore the context state
        ctx.restore();
    }
}