"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { currentColor, ColorPalletes } from "@/store/atoms/color"
import { useAtom } from "jotai"

export const ColorPicker = () => {
  const [hexColor, setHexColor] = useAtom(currentColor)

  const handleClick = (color: string) => {
    setHexColor(color)
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-1">
        {ColorPalletes.map((hexVal, idx) => (
          <Button
            key={idx}
            onClick={() => handleClick(hexVal)}
            style={{
              backgroundColor: `#${hexVal}`,
            }}
            className={cn(
              `h-8 w-8 flex items-center justify-center`,
              hexColor === hexVal ? ` shadow-md shadow-zinc-800 dark:shadow-zinc-300` : ``,
            )}
          ></Button>
        ))}
      </div>
    </div>
  )
}
