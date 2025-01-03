interface Point {
    x: number,
    y: number
}

type Draw = {
    ctx: CanvasRenderingContext2D | null | undefined;
    currentPoint: Point;
    prevPoint: Point;
}