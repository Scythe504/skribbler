import { atom } from "jotai"
import { Player, PlayerGuess } from "@/types/ws-model"
import { GamePhase } from "@/types/ws-resp"

// ===============================
// TODO: WebSocket connection atom
// - Holds raw WebSocket instance
// - Useful for sending messages
// ===============================
export const wsAtom = atom<WebSocket | null>(null)

// ===============================
// TODO: Basic identifiers
// - player name
// - room id
// ===============================
export const playerNameAtom = atom<string>("")
export const roomIdAtom = atom<string>("")

// ===============================
// TODO: Game state atom
// - Phase, round, drawer, players
// ===============================
export const gameStateAtom = atom({
  phase: "lobby" as GamePhase,
  roundNumber: 0,
  maxRounds: 0,
  currentDrawer: null as Player | null,
  timeRemaining: 0,
  players: [] as Player[],
  correctGuessers: [] as PlayerGuess[],
  word: "",
})

// ===============================
// TODO: Chat messages atom
// - Local list of chat/guesses
// ===============================
export const chatMessagesAtom = atom<{ username: string; message: string }[]>([])
