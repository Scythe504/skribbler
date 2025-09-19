import type { MessagePayloadMap } from "@/types/ws-resp"
import { Phase } from "@/types/ws-resp"
import { useAtom, useSetAtom } from "jotai"
import { chatMessagesAtom, gameStateAtom } from "@/store/atoms/ws"
import { modalAtom } from "@/store/atoms/modal"
import { pixelManagerAtom } from "@/store/atoms/game"

export function useGameHandlers() {
  // ==================================================
  // Top-level atom hooks
  // ==================================================
  const setGameState = useSetAtom(gameStateAtom)
  const [gameState, _setGs] = useAtom(gameStateAtom)
  const setChatMessages = useSetAtom(chatMessagesAtom)
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
      console.log("[v0] Processing player_joined:", data)
      if (!data.player_data) return

      setGameState((prev) => {
        console.log("[v0] Adding player to game state:", data.player_data)
        return {
          ...prev,
          players: [...prev.players, data.player_data!],
        }
      })

      setChatMessages((prev) => {
        console.log("[v0] Adding system message to chat:", data.message)
        return [...prev, { username: "SYSTEM", message: data.message }]
      })
    },

    player_left: (data) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== data.player_id),
        correctGuessers: prev.correct_guessers.filter((p) => p.player_id !== data.player_id),
      }))

      setChatMessages((prev) => [...prev, { username: "SYSTEM", message: data.message }])
    },

    lobby_update: (data) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.id === data.player_id ? { ...p, is_ready: data.is_ready } : p)),
      }))
    },

    lobby_reset: (data) => {
      setGameState({
        phase: data.phase,
        round_number: data.round_number,
        max_rounds: data.max_rounds,
        current_drawer: data.current_drawer,
        correct_guessers: data.correct_guessers,
        word: "",
        time_remaining: 0,
        players: data.players || [],
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
        round_number: 1,
        max_rounds: 3,
        current_drawer: null,
        time_remaining: 0,
        players: data.players || [],
        correct_guessers: [],
        word: "",
      })
    },

    waiting_phase: (data) => {
      const drawer = gameState.players.find((p) => p.id === data.current_drawer.id) || null
      setGameState((prev) => ({
        ...prev,
        phase: Phase.PhaseWaiting,
        current_drawer: drawer,
        time_remaining: data.time_remaining,
        correct_guessers: [],
        round_number: data.round_number,
        word: "",
      }))

      setChatMessages((prev) => [...prev, { username: "SYSTEM", message: data.message }])
    },

    word_selection: (data) => {
      setModalAtom({
        type: "wordSelect",
        props: {
          words: data.choices,
          timer: data.time_limit,
        },
      })
    },

    waiting_for_word: (data) => {
      const player = gameState.players.find((p) => p.id === data.current_drawer)
      if (!player) return

      setGameState((prev) => ({
        ...prev,
        timeRemaining: data.time_remaining,
        currentDrawer: player,
      }))

      // Show drawer selection modal
      setModalAtom({
        type: "drawerSelect",
        props: {
          timer: data.time_remaining,
          username: player.username,
          isOpen: true,
          onClose: null,
        },
      })
    },

    drawing_phase: (data) => {
      setGameState((prev) => ({
        ...prev,
        phase: Phase.PhaseDrawing,
        word: data.masked_word,
        players: prev.players.map((p) => ({
          ...p,
          can_draw: p.id === prev.current_drawer?.id,
        })),
      }))
    },

    round_end: (data) => {
      setGameState((prev) => ({
        ...prev,
        phase: Phase.PhaseRevealing,
        timeRemaining: 0,
        word: data.word,
        players: prev.players.map((p) => ({
          ...p,
          score: data.final_scores?.find((pl) => pl.id === p.id)?.score || p.score,
        })),
      }))
    },

    game_ended: (data) => {
      setModalAtom({
        type: "gameEnded",
        props: data,
      })

      setGameState((prev) => ({
        ...prev,
        phase: Phase.PhaseEnded,
        roundNumber: 1,
        word: "",
        currentDrawer: null,
        players: prev.players.map((p) => ({
          ...p,
          can_draw: false,
        })),
        correctGuessers: [],
      }))
    },

    // ==========================
    // Timer
    // ==========================
    timer_update: (data) => {
      setGameState((prev) => ({
        ...prev,
        phase: data.phase,
        timeRemaining: Number(data.time_remaining),
      }))
    },

    // ==========================
    // Guessing / Chat
    // ==========================
    guess_message: (data) => {
      console.log("[v0] Processing guess_message:", data)
      setChatMessages((prev) => {
        const newMessage = data.player_guess.is_correct
          ? {
            username: "SYSTEM",
            message: `${data.player_guess.username} has guessed the word correctly!`,
          }
          : {
            username: data.player_guess.username,
            message: data.guessed_word,
          }
        console.log("[v0] Adding message to chat:", newMessage)
        return [...prev, newMessage]
      })
    },

    guess_result: (data) => {
      console.log("[v0] Processing guess_result:", data)
      setGameState((prev) => {
        // Update scores
        const updatedPlayers = prev.players.map((p) =>
          p.id === data.player_id ? { ...p, score: data.score, has_guessed: data.is_correct } : p,
        )

        // Add to correctGuessers if correct and not already added
        let updatedCorrectGuessers = prev.correct_guessers
        if (data.is_correct) {
          const alreadyAdded = updatedCorrectGuessers.some((g) => g.player_id === data.player_id)
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

        console.log("[v0] Updated players and guessers:", { updatedPlayers, updatedCorrectGuessers })
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
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) => ({
          ...p,
          can_draw: p.id === data.player_id,
        })),
      }))
    },

    game_state_update: (data) => {
      console.log("[v0] Processing game_state_update:", data)
      // Replace entire gameState with backend snapshot
      setGameState({
        phase: data.phase,
        round_number: data.round_number,
        max_rounds: data.max_rounds,
        current_drawer: data.current_drawer,
        time_remaining: data.time_remaining,
        players: data.players.map((p) => ({
          ...p,
          can_draw: p.can_draw ?? false,
        })),
        correct_guessers: data.correct_guessers.map((g) => ({
          player_id: g.player_id,
          username: g.username,
          guess_time: Number(g.guess_time ?? 0),
          is_correct: g.is_correct,
        })),
        word: data.word,
      })
      console.log("[v0] Game state updated from server")
    },
    // welcome_msg
    welcome_msg(data) {
      setGameState({
        phase: data.game_state.phase,
        round_number: data.game_state.round_number,
        players: data.game_state.players,
        correct_guessers: data.game_state.correct_guessers,
        time_remaining: data.game_state.time_remaining,
        max_rounds: data.game_state.max_rounds,
        word: data.game_state.word,
        current_drawer: data.game_state.current_drawer
      });
      // 2. Restore the canvas
      if (data.canvas_state && data.canvas_state.length > 0) {
        for (const pixelMessage of data.canvas_state) {
          pixelManager?.handleRemoteMessage(pixelMessage)
        }
      }
    },
  }

  // ==================================================
  // Return function to dispatch messages
  // ==================================================
  function handleMessage<T extends keyof MessagePayloadMap>(msg: { type: T; data: MessagePayloadMap[T] }) {
    console.log("[v0] Handling message:", msg.type, msg.data)
    const handler = handlers[msg.type]
    if (handler) {
      handler(msg.data)
    } else {
      console.warn("[v0] No handler for message type:", msg.type, msg.data)
    }
  }

  return { handleMessage }
}
