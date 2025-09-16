import { GameEndedData } from "@/types/ws-resp";
import { atom } from "jotai"

export type ModalType = "wordSelect" | "confirmation" | "settings"

type ModalState =
  | { type: "wordSelect"; props: { words: string[]; timer: number; } }
  | { type: "drawerSelect"; props: { timer: number; username: string; isOpen: boolean; onClose: (()=> void) | null; } }  
  | { type: "gameEnded"; props: GameEndedData }
  | null

export const modalAtom = atom<ModalState>(null)
