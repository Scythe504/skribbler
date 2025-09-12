"use client"
import { BrushIcon, EraserIcon, PaintBucket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PixelTool } from "@/types/pixelArt"
import { useAtom } from "jotai"
import { currentTool } from "@/store/atoms/drawTool"
import { cn } from "@/lib/utils"

const MethodObj = {
  paintBucket: {
    tool: PixelTool.Fill,
    icon: <PaintBucket size={20} />,
  },
  brushTool: {
    tool: PixelTool.Pixel,
    icon: <BrushIcon size={20} />,
  },
  eraseTool: {
    tool: PixelTool.Eraser,
    icon: <EraserIcon size={20} />,
  },
}

export const DrawMethods = () => {
  const [drawTool, setDrawTool] = useAtom(currentTool)

  const handler = (tool: PixelTool) => {
    setDrawTool(tool)
  }

  return (
    <div>
      <div className="flex flex-row gap-2 py-2">
        {Object.entries(MethodObj).map(([key, { tool, icon }]) => (
          <Button
            size={"lg"}
            key={key}
            onClick={() => handler(tool)}
            variant={drawTool === tool ? "secondary" : "outline"}
            className={cn("p-4")}
          >
            {icon}
          </Button>
        ))}
      </div>
    </div>
  )
}
