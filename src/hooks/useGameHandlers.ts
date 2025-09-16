import { MessageType, WebSocketResponse, MessagePayloadMap } from "@/types/ws-resp"
import { PixelMessage } from "@/types/pixelArt"
import { Phase } from "@/types/ws-resp"
import { Player } from "@/types/ws-model"
import { useAtom, useSetAtom } from "jotai"
import { chatMessagesAtom, gameStateAtom } from "@/store/atoms/ws"
import { modalAtom } from "@/store/atoms/modal"
import { pixelManagerAtom } from "@/store/atoms/game"

export function useGameHandlers() {
  // ==================================================
  // Top-level atom hooks
  // ==================================================
  const [gameState, setGameState] = useAtom(gameStateAtom)
  const [chatMessages, setChatMessages] = useAtom(chatMessagesAtom)
  const setModalAtom = useSetAtom(modalAtom)
  const [pixelManager] = useAtom(pixelManagerAtom)

  // ==================================================
  // Handlers
  // ==================================================
  const handlers: { [K in keyof MessagePayloadMap]: (data: MessagePayloadMap[K]) => void } = {
    // ==========================
    // Lobby / Player events
    // ==========================
    player_joined: (data) => {
      if (!data.player_data) return

      setGameState(prev => ({
        ...prev,
        players: [...prev.players, data.player_data!]
      }))

      setChatMessages(prev => [
        ...prev,
        { username: "SYSTEM", message: data.message }
      ])
    },

    player_left: (data) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== data.player_id),
        correctGuessers: prev.correctGuessers.filter(p => p.player_id !== data.player_id)
      }))

      setChatMessages(prev => [
        ...prev,
        { username: "SYSTEM", message: data.message }
      ])
    },

    lobby_update: (data) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p =>
          p.id === data.player_id ? { ...p, is_ready: data.is_ready } : p
        )
      }))
    },

    lobby_reset: (data) => {
      setGameState({
        phase: data.phase,
        roundNumber: data.round_number,
        maxRounds: data.max_rounds,
        currentDrawer: data.current_drawer,
        correctGuessers: data.correct_guessers,
        word: "",
        timeRemaining: 0,
        players: data.players || []
      })
      setChatMessages([])

      // Clear canvas if pixel manager exists
      if (pixelManager) {
        pixelManager.clearPixels()
      }
    },

    // ==========================
    // Game lifecycle events
    // ==========================
    game_started: (data) => {
      setGameState({
        phase: Phase.PhaseWaiting,
        roundNumber: 1,
        maxRounds: 3,
        currentDrawer: null,
        timeRemaining: 0,
        players: data.players || [],
        correctGuessers: [],
        word: ""
      })
    },

    waiting_phase: (data) => {
      const drawer = gameState.players.find(p => p.id === data.current_drawer.id) || null
      setGameState(prev => ({
        ...prev,
        phase: Phase.PhaseWaiting,
        currentDrawer: drawer,
        timeRemaining: data.time_remaining,
        correctGuessers: [],
        roundNumber: data.round_number,
        word: ""
      }))

      setChatMessages(prev => [
        ...prev,
        { username: "SYSTEM", message: data.message }
      ])
    },

    word_selection: (data) => {
      setModalAtom({
        type: "wordSelect",
        props: {
          words: data.choices,
          timer: data.time_limit,
        }
      })
    },

    waiting_for_word: (data) => {
      const player = gameState.players.find(p => p.id === data.current_drawer)
      if (!player) return

      setGameState(prev => ({
        ...prev,
        timeRemaining: data.time_remaining,
        currentDrawer: player
      }))

      // Show drawer selection modal
      setModalAtom({
        type: "drawerSelect",
        props: {
          timer: data.time_remaining,
          username: player.username,
          isOpen: true,
          onClose: null
        }
      })
    },

    drawing_phase: (data) => {
      setGameState(prev => ({
        ...prev,
        phase: Phase.PhaseDrawing,
        word: data.masked_word,
        players: prev.players.map((p) => ({
          ...p,
          can_draw: p.id === prev.currentDrawer?.id,
        }))
      }))
    },

    round_end: (data) => {
      setGameState(prev => ({
        ...prev,
        phase: Phase.PhaseRevealing,
        timeRemaining: 0,
        word: data.word,
        players: prev.players.map((p) => ({
          ...p,
          score: data.final_scores?.find((pl) => pl.id === p.id)?.score || p.score
        }))
      }))
    },

    game_ended: (data) => {
      setModalAtom({
        type: "gameEnded",
        props: data
      })

      setGameState(prev => ({
        ...prev,
        phase: Phase.PhaseEnded,
        roundNumber: 1,
        word: "",
        currentDrawer: null,
        players: prev.players.map((p) => ({
          ...p,
          can_draw: false,
        })),
        correctGuessers: []
      }))
    },

    // ==========================
    // Timer
    // ==========================
    timer_update: (data) => {
      setGameState(prev => ({
        ...prev,
        phase: data.phase,
        timeRemaining: Number(data.time_remaining),
      }))
    },

    // ==========================
    // Guessing / Chat
    // ==========================
    guess_message: (data) => {
      setChatMessages(prev => [
        ...prev,
        data.player_guess.is_correct
          ? {
            username: "SYSTEM",
            message: `${data.player_guess.username} has guessed the word correctly!`,
          }
          : {
            username: data.player_guess.username,
            message: data.guessed_word,
          },
      ])
    },

    guess_result: (data) => {
      setGameState(prev => {
        // Update scores
        const updatedPlayers = prev.players.map((p) =>
          p.id === data.player_id ? { ...p, score: data.score } : p
        )

        // Add to correctGuessers if correct and not already added
        let updatedCorrectGuessers = prev.correctGuessers
        if (data.is_correct) {
          const alreadyAdded = updatedCorrectGuessers.some(
            (g) => g.player_id === data.player_id
          )
          if (!alreadyAdded) {
            updatedCorrectGuessers = [
              ...updatedCorrectGuessers,
              {
                player_id: data.player_id,
                username: data.username,
                guess_time: Number(data.time_to_guess_ms),
                is_correct: true,
              },
            ]
          }
        }

        return {
          ...prev,
          players: updatedPlayers,
          correctGuessers: updatedCorrectGuessers,
        }
      })
    },

    // ==========================
    // Drawing / Canvas
    // ==========================
    canvas_cleared: (data) => {
      // Clear the local canvas through pixel manager
      if (pixelManager) {
        pixelManager.clearPixels()
      }
    },

    drawing_permission_updated: (data) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map((p) => ({
          ...p,
          can_draw: p.id === data.player_id
        }))
      }))
    },

    game_state_update: (data) => {
      // Normalize time_remaining (BigInt -> number)
      const normalizedTimeRemaining = Number(data.time_remaining)

      // Replace entire gameState with backend snapshot
      setGameState({
        phase: data.phase,
        roundNumber: data.round_number,
        maxRounds: data.max_rounds,
        currentDrawer: data.current_drawer,
        timeRemaining: normalizedTimeRemaining,
        players: data.players.map((p) => ({
          ...p,
          can_draw: p.can_draw ?? false,
        })),
        correctGuessers: data.correct_guessers.map((g) => ({
          player_id: g.player_id,
          username: g.username,
          guess_time: Number(g.guess_time ?? 0),
          is_correct: g.is_correct,
        })),
        word: data.word,
      })
    }
  }

  // ==================================================
  // Return function to dispatch messages
  // ==================================================
  function handleMessage<T extends keyof MessagePayloadMap>(
    msg: { type: T; data: MessagePayloadMap[T] }
  ) {
    const handler = handlers[msg.type]
    if (handler) {
      handler(msg.data)
    } else {
      console.warn("No handler for message type:", msg.type, msg.data)
    }
  }

  return { handleMessage }
}