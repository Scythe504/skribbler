"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CircularTimer } from "@/components/ui/circular-timer"
import { chosenWord } from "@/store/atoms/game"
import { modalAtom } from "@/store/atoms/modal"
import { useAtom } from "jotai"
import { useCallback, useEffect, useState } from "react"
import { wsAtom } from "@/store/atoms/ws"

interface WordModalProps {
  words: string[]
  timer: number
}

export const WordModal = ({ words, timer }: WordModalProps) => {
  const [ws] = useAtom(wsAtom)
  const [_word, setWord] = useAtom(chosenWord)
  const [modal, setModal] = useAtom(modalAtom)
  const [isTimerActive, setIsTimerActive] = useState(false)

  const isOpen = modal?.type === "wordSelect"

  useEffect(() => {
    if (isOpen) {
      setIsTimerActive(true)
    } else {
      setIsTimerActive(false)
    }
  }, [isOpen])

  const onChooseWord = useCallback(
    (selectedWord: string) => {
      setWord(selectedWord)
      if (ws !== null && ws?.readyState) {
        const message: Message<"word_selection", string> = {
          type: "word_selection",
          data: selectedWord
        }
        ws.send(JSON.stringify(message))
      }
      setIsTimerActive(false)
      setModal(null) // Close modal
    },
    [setWord, setModal],
  )

  const handleTimerComplete = () => {
    // Auto-pick first word when timer runs out
    if (words.length > 0) {
      onChooseWord(words[0])
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => { }} // Prevent manual closing - not closable
    >
      <DialogContent className="flex flex-col gap-8 py-16 max-w-2xl bg-card border-4 border-primary rounded-none shadow-[12px_12px_0px_0px] shadow-border [&>button]:hidden">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-4xl font-bold text-center text-primary tracking-wider">
            [CHOOSE YOUR WORD]
          </DialogTitle>
          <DialogDescription className="text-lg text-center text-muted-foreground tracking-wide">
            &gt; YOU WILL DRAW THIS WORD &lt;
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

            <div className="text-lg font-bold text-muted-foreground">[CHOOSE WISELY]</div>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-center">
            {words.map((wordOption) => (
              <Button
                key={wordOption}
                onClick={() => onChooseWord(wordOption)}
                variant="outline"
                className="text-xl px-8 py-4 font-bold transition-all duration-200 transform hover:scale-105 bg-card hover:bg-accent border-2 border-primary rounded-none shadow-[6px_6px_0px_0px] shadow-border hover:shadow-[3px_3px_0px_0px] hover:shadow-border active:shadow-[1px_1px_0px_0px] active:shadow-border active:translate-x-2 active:translate-y-2 tracking-wider text-foreground hover:text-accent-foreground"
                size="lg"
              >
                [{wordOption.toUpperCase()}]
              </Button>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground tracking-wide">
            &gt; TIP: CHOOSE A WORD YOU CAN DRAW WELL &lt;
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
