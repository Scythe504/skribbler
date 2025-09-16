"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CircularTimer } from "@/components/ui/circular-timer"
import { useEffect, useState } from "react"

interface DrawerSelectingModalProps {
  isOpen: boolean
  username: string
  timer: number
  onClose: () => void
}

export const DrawerSelectingModal = ({ isOpen, username, timer, onClose }: DrawerSelectingModalProps) => {
  const [isTimerActive, setIsTimerActive] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsTimerActive(true)
    } else {
      setIsTimerActive(false)
    }
  }, [isOpen])

  const handleTimerComplete = () => {
    setIsTimerActive(false)
    // Auto-close after timer completes
    setTimeout(() => onClose(), 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-8 py-16 max-w-lg bg-card border-4 border-primary rounded-none shadow-[12px_12px_0px_0px] shadow-border font-mono">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-3xl font-mono font-bold text-center text-primary tracking-wider">
            [WORD SELECTION]
          </DialogTitle>
          <DialogDescription className="text-lg text-center text-muted-foreground font-mono tracking-wide">
            &gt; {username || "PLAYER"} IS SELECTING A WORD &lt;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <CircularTimer
              duration={timer}
              isActive={isTimerActive}
              onComplete={handleTimerComplete}
              className="text-primary"
            />

            <div className="text-lg font-mono font-bold text-muted-foreground">[PLEASE WAIT...]</div>
          </div>

          <div className="text-center text-sm text-muted-foreground font-mono tracking-wide">
            &gt; THE DRAWER IS CHOOSING THEIR WORD &lt;
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={onClose}
            variant="outline"
            className="font-mono text-lg px-6 py-3 border-2 border-primary bg-card hover:bg-accent transition-all duration-200 rounded-none shadow-[6px_6px_0px_0px] shadow-border hover:shadow-[3px_3px_0px_0px] hover:shadow-border active:shadow-[1px_1px_0px_0px] active:shadow-border active:translate-x-2 active:translate-y-2"
          >
            [CLOSE]
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
