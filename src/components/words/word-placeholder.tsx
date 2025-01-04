import { cn } from "@/lib/utils"

export const WordPlaceholder = ({ word }: { word: string }) => {
    // Function to determine if a character should be revealed
    const shouldRevealChar = (char: string, index: number, totalLength: number) => {
        // Always show spaces between words
        if (char === ' ') return true;
        
        // Reveal approximately 1/3 of the characters
        // More likely to reveal characters near the start of the word
        const revealProbability = Math.random() * (totalLength - index) / totalLength;
        return revealProbability > 0.7;
    }

    // Process each word to determine which characters to reveal
    const processWord = (wordPart: string) => {
        const chars = wordPart.split('');
        const totalLength = chars.length;
        
        // Create a consistent pattern of revealed characters
        // Using character position and length to determine reveals
        return chars.map((char, idx) => ({
            char,
            isRevealed: shouldRevealChar(char, idx, totalLength)
        }));
    }

    const words = word.split(" ").map(w => processWord(w));

    return (
        <div>
            <div className="flex flex-row gap-4">
                {words.map((wordChars, wordIdx) => (
                    <div key={wordIdx} className="flex flex-row gap-1">
                        {wordChars.map(({ char, isRevealed }, charIdx) => (
                            <span
                                key={charIdx}
                                className={cn(
                                    "text-2xl w-6 flex justify-center border-b border-zinc-800 dark:border-zinc-300",
                                    !isRevealed && "text-transparent"
                                )}
                            >
                                {char}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
