interface Point {
    x: number,
    y: number
}

type HexString = `#${string}`


type Draw = {
    ctx: CanvasRenderingContext2D | null | undefined;
    currentPoint: Point;
    prevPoint: Point | null;
}

type Rgba = {
    r: number,
    g: number,
    b: number,
    a: number
}