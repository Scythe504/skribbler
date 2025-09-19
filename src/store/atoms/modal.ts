import { GameEndedData, RoundEndData } from "@/types/ws-resp";
import { atom } from "jotai"

type ModalState =
  | { type: "wordSelect"; props: { words: string[]; timer: number; } }
  | { type: "drawerSelect"; props: { timer: number; username: string; isOpen: boolean; onClose: (()=> void) | null; } }  
  | { type: "gameEnded"; props: GameEndedData }
  | { type: "roundEnded"; props: RoundEndData }
  | null

export const modalAtom = atom<ModalState>(null)
