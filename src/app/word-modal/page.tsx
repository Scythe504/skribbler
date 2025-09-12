'use client'
import WordModal from "@/components/words/word-modal";
import { WordPlaceholder } from "@/components/words/word-placeholder";
import { chosenWord, wordSelectTime } from "@/store/atoms/game";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function WordModalDisplay () {
    const [word, setWord] = useAtom(chosenWord)
    const [words, setWords] = useState<Array<string>>([])
    const selectTime = wordSelectTime
    useEffect(()=> {

    },[])

    return <div>
        <WordPlaceholder word={word}/>
        <WordModal words={words}/>
    </div>
}