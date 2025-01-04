'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { chosenWord, COUNTDOWN_DENOMINATOR, wordSelectTime } from "@/store/atoms/game"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { WordPlaceholder } from "./word-placeholder"

export const WordModal = () => {
    const [clock, setClock] = useState<number>(wordSelectTime / COUNTDOWN_DENOMINATOR)
    const [timerStart, setTimerStart] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [word, setWord] = useAtom(chosenWord)
    const words = ["Fountain", "Saturn", "Mickey Mouse"]

    const handleClick = () => {
        setTimerStart(true)
        setShowModal(true)
        setClock(wordSelectTime / COUNTDOWN_DENOMINATOR)
    }

    const onChooseWord = (selectedWord: string) => {
        setWord(selectedWord)
        setShowModal(false)
        setTimerStart(false)
    }

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (timerStart && clock > 0) {
            timer = setInterval(() => {
                setClock(prevClock => prevClock - 1);
            }, 1000);
        }

        if (clock === 0) {
            setWord(words[0])
            setShowModal(false)
            setTimerStart(false)
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [clock, timerStart])


    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
                {
                    word === '' ?
                        <Button
                            variant="outline"
                            onClick={handleClick}
                        >
                            Pick a word
                        </Button> : 
                        <WordPlaceholder
                            word={word}
                        />

                }
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-8 py-16">
                <DialogHeader>
                    <DialogTitle className="text-4xl text-center">Choose Your Word</DialogTitle>
                    <DialogDescription className="text-xl text-center">
                        You will have to draw the word you choose
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <div className="text-center text-[32px] pb-8">
                        {clock}s Remaining
                    </div>
                    <div className="flex flex-row gap-2 items-center justify-center">
                        {words.map((wordOption) => (
                            <Button
                                key={wordOption}
                                onClick={() => onChooseWord(wordOption)}
                                variant="outline"
                                className="text-xl"
                                size="lg"
                            >
                                {wordOption}
                            </Button>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default WordModal