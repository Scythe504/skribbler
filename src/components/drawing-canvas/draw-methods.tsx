'use client'
import {
    BrushIcon,
    EraserIcon,
    PaintBucket
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DrawingTool } from "@/utils/draw"
import { useAtom } from "jotai"
import { currentTool } from "@/store/atoms/drawTool"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

const MethodObj = {
    paintBucket: {
        tool: DrawingTool.BucketTool,
        icon: <PaintBucket size={30} />
    },
    brushTool: {
        tool: DrawingTool.PaintBrush,
        icon: <BrushIcon size={30} />
    },
    eraseTool: {
        tool: DrawingTool.EraseTool,
        icon: <EraserIcon size={30} />
    },
}

export const DrawMethods = () => {
    const [drawTool, setDrawTool] = useAtom(currentTool)

    const handler = (tool: DrawingTool) => {
        setDrawTool(tool)
    }

    useEffect(() => {
        console.log(drawTool)
    }, [drawTool])
    return <div>
        <div
            className="flex flex-row gap-2 py-2"
        >
            {
                Object.entries(MethodObj).map(([key, { tool, icon }]) => (
                    <Button
                        size={"lg"}
                        key={key}
                        onClick={() => handler(tool)}
                        variant={drawTool === tool ? "secondary" : "outline"}
                        className={cn("p-6")}
                    >
                        {icon}
                    </Button>
                ))
            }
        </div>
    </div>
}