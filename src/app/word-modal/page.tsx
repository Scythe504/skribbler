'use client'
import { WordModal } from "@/components/modals/word-modal";

export default function WordModalDisplay() {

    return <div>
        <WordModal timer={30} words={["house", "cat", "sun"]} />
    </div>
}