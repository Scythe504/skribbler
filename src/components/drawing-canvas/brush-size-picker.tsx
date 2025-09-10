"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { brushSize, BRUSH_SIZES } from "@/store/atoms/brushSize"
import { useAtom } from "jotai"

export const BrushSizePicker = () => {
  const [currentSize, setCurrentSize] = useAtom(brushSize)

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Brush Size</h3>
      <div className="flex gap-1">
        {BRUSH_SIZES.map((size) => (
          <Button
            key={size}
            onClick={() => setCurrentSize(size)}
            variant={currentSize === size ? "default" : "outline"}
            size="sm"
            className={cn("w-8 h-8 p-0 text-xs", currentSize === size && "bg-blue-500 hover:bg-blue-600")}
          >
            {size}
          </Button>
        ))}
      </div>
    </div>
  )
}
