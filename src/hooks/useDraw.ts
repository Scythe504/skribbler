import { DrawingManager, DrawingTool } from "@/utils/draw";
import { useEffect, useRef, useState } from "react"

type Tool = 'line' | 'fill';

// TODO - Make it so that, i will pass websocketUrl in the useDraw hook
export const useDraw = (
    onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void,
    onFill: ({ ctx, currentPoint }: Draw) => void,
    tool: Tool = 'line',
    websocketUrl: string | null
) => {
    const [mouseDown, setMouseDown] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const prevPoint = useRef<null | Point>(null);
    const drawingManagerRef = useRef<DrawingManager | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !websocketUrl) {
            return;
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) return;

        drawingManagerRef.current = new DrawingManager({ ctx, websocketUrl })

        return () => {
            drawingManagerRef.current = null
        };
    }, [websocketUrl])

    const getCanvasCoordinates = (e: MouseEvent): Point | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        return { x, y };
    };

    const onMouseDown = (e: MouseEvent) => {
        const currentPoint = getCanvasCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');

        if (!ctx || !currentPoint || !drawingManagerRef.current) return;

        if (tool === 'fill') {
            onFill({ ctx, currentPoint, prevPoint: null });
            // Create snapshot using DrawingManager
            drawingManagerRef.current.createSnapshot({
                toolType: (DrawingTool.BucketTool),
                currentPoint,
                prevPoint: null,
                color: ctx.strokeStyle.toString() as HexString,
                lineWidth: ctx.lineWidth
            });
            return;
        }

        setMouseDown(true);
    };

    const mouseUpHandler = () => {
        setMouseDown(false);
        prevPoint.current = null;
    };

    useEffect(() => {
        const mouseMoveHandler = (e: MouseEvent) => {
            if (!mouseDown || tool !== 'line') return;

            const currentPoint = getCanvasCoordinates(e);
            const ctx = canvasRef.current?.getContext('2d');

            if (!ctx || !currentPoint || !drawingManagerRef.current) return;

            onDraw({
                ctx,
                currentPoint,
                prevPoint: prevPoint.current
            });

            // Create snapshot using DrawingManager
            drawingManagerRef.current.createSnapshot({
                toolType: (DrawingTool.PaintBrush),
                currentPoint,
                prevPoint: null,
                color: ctx.strokeStyle.toString() as HexString,
                lineWidth: ctx.lineWidth
            });
            prevPoint.current = currentPoint;
        };

        const mouseDownHandler = (e: MouseEvent) => {
            if (e.button !== 0) return; // Only handle left click
            onMouseDown(e);
        };

        // Add event listeners
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('mousemove', mouseMoveHandler);
            canvas.addEventListener('mousedown', mouseDownHandler);
            window.addEventListener('mouseup', mouseUpHandler);
        }

        // Cleanup
        return () => {
            if (canvas) {
                canvas.removeEventListener('mousemove', mouseMoveHandler);
                canvas.removeEventListener('mousedown', mouseDownHandler);
                window.removeEventListener('mouseup', mouseUpHandler);
            }
        };
    }, [onDraw, onFill, mouseDown, tool]);

    return { canvasRef, onMouseDown: (e: React.MouseEvent) => onMouseDown(e.nativeEvent) };
};