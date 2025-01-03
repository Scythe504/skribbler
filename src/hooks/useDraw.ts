import { useEffect, useRef, useState } from "react"

export const useDraw = (onDraw: ({
    ctx, 
    currentPoint, 
    prevPoint
}: Draw)=> void) => {
    const [mouseDown, setMouseDown] = useState<boolean>(false)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const prevPoint = useRef<null | Point>(null)

    const onMouseDown = ()=> setMouseDown(true)
    const mouseUpHandler = ()=> {
        setMouseDown(false)
        prevPoint.current = null
    }
    
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!mouseDown) return

            const currentPoint = canvasCoordinates(e)
            console.log(currentPoint?.x, currentPoint?.y)

            const ctx = canvasRef.current?.getContext('2d')
            if (!ctx || !currentPoint) {
                return
            }

            onDraw({
                ctx, 
                currentPoint, 
                prevPoint: prevPoint.current as Point
            })

            prevPoint.current = currentPoint;
        }

        const canvasCoordinates = (e: MouseEvent)=> {
            const canvas = canvasRef.current
            if (!canvas) {
                return
            }

            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            return { x, y }
        }
        canvasRef.current?.addEventListener('mousemove', handler)
        window?.addEventListener('mouseup', mouseUpHandler)

        return () => {
            canvasRef.current?.removeEventListener('mousemove', handler)
            window?.addEventListener('mouseup', mouseUpHandler)
        }

    }, [onDraw])

    return { canvasRef, onMouseDown }
}