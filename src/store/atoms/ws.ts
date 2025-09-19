import { atom } from "jotai"
import { Player, PlayerGuess } from "@/types/ws-model"
import { GamePhase, GameStateUpdateData, Phase } from "@/types/ws-resp"

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
export const gameStateAtom = atom<GameStateUpdateData>({
  phase: Phase.PhaseLobby,
  round_number: 0,
  max_rounds: 0,
  current_drawer: null as Player | null,
  time_remaining: 0,
  players: [] as Player[],
  correct_guessers: [] as PlayerGuess[],
  word: "",
})

// ===============================
// TODO: Chat messages atom
// - Local list of chat/guesses
// ===============================
export const chatMessagesAtom = atom<{ username: string; message: string }[]>([])
