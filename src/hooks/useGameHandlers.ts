import { MessageType, WebSocketResponse, MessagePayloadMap } from "@/types/ws-resp"
import { PixelMessage } from "@/types/pixelArt"
import { Phase } from "@/types/ws-resp"
import { Player } from "@/types/ws-model" // assuming Phase enum and Player type exist
import { useAtom } from "jotai"
import { chatMessagesAtom, gameStateAtom } from "@/store/atoms/ws"

export function useGameHandlers() {
    // ==================================================
    // Top-level atom hooks
    // ==================================================
    const [gameState, setGameState] = useAtom(gameStateAtom)
    const [chatMessages, setChatMessages] = useAtom(chatMessagesAtom)

    // ==================================================
    // Handlers
    // ==================================================
    const handlers: { [K in keyof MessagePayloadMap]: (data: MessagePayloadMap[K]) => void } = {
        // ==========================
        // Lobby / Player events
        // ==========================
        player_joined: (data) => {
            // Update player list immutably
            setGameState({
                ...gameState,
                players: [...gameState.players, data.player_data!]
            })
            // Show system message
            setChatMessages([
                ...chatMessages,
                { username: "SYSTEM", message: data.message }
            ])
        },

        player_left: (data) => {
            const newPlayers = gameState.players.filter(p => p.id !== data.player_id)
            const newCorrectGuessers = gameState.correctGuessers.filter(p => p.player_id !== data.player_id)
            setGameState({
                ...gameState,
                players: newPlayers,
                correctGuessers: newCorrectGuessers
            })
            setChatMessages([...chatMessages, { username: "SYSTEM", message: data.message }])
        },

        lobby_update: (data) => {
            // Update player ready state immutably
            const newPlayers = gameState.players.map(p =>
                p.id === data.player_id ? { ...p, is_ready: data.is_ready } : p
            )
            setGameState({ ...gameState, players: newPlayers })
            // TODO: Update lobby UI if needed
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
                players: data.players!
            })
            setChatMessages([])
            // TODO: Clear canvas if needed
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
                players: data.players!,
                correctGuessers: [],
                word: ""
            })
        },

        waiting_phase: (data) => {
            const drawer = gameState.players.find(p => p.id === data.current_drawer.id) || null
            setGameState({
                ...gameState,
                phase: Phase.PhaseWaiting,
                currentDrawer: drawer,
                timeRemaining: data.time_remaining,
                correctGuessers: [],
                roundNumber: data.round_number,
                word: ""
            })
            setChatMessages([...chatMessages, { username: "SYSTEM", message: data.message }])
        },

        word_selection: (data) => {
            // TODO:
            // - If current player is drawer → show word choices modal
            // - If not drawer → set "waiting for drawer to pick a word"
        },
        waiting_for_word: (data) => {
            // TODO:
            // - Update gameStateAtom with drawer info + countdown
            // - UI: "Drawer is picking a word..."
        },
        drawing_phase: (data) => {
            // TODO:
            // - Set phase = "drawing"
            // - Store masked word in gameStateAtom
            // - Allow drawer to draw, disable others
        },
        round_end: (data) => {
            // TODO:
            // - Show round summary (word revealed, scores updated)
            // - Freeze canvas
            // - Prepare for next round or end
        },
        game_ended: (data) => {
            // TODO:
            // - Show final leaderboard (data.leaderboard)
            // - Clear round state
        },

        // ==========================
        // Timer
        // ==========================
        timer_update: (data) => {
            // TODO:
            // - Update gameStateAtom.timerRemaining
            // - Sync countdown timer with backend
        },

        // ==========================
        // Guessing / Chat
        // ==========================
        guess_message: (data) => {
            // TODO:
            // - Push message to chatMessagesAtom
            // - Differentiate correct guess vs normal chat
        },
        guess_result: (data) => {
            // TODO:
            // - Update player’s score in gameStateAtom
            // - Mark player as "guessed" in state
        },

        // ==========================
        // Drawing / Canvas
        // ==========================
        canvas_cleared: (data) => {
            // TODO:
            // - Reset local canvas buffer
            // - Sync with other players
        },
        drawing_permission_updated: (data) => {
            // TODO:
            // - Update gameStateAtom to allow/disallow current player to draw
        },
        game_state_update: (data) => {
            // TODO:
            // - Replace entire gameStateAtom with backend snapshot
            // - Ensure consistency (phase, players, drawer, timer, etc.)
        },
    }

    // ==================================================
    // Return function to dispatch messages
    // ==================================================
    function handleMessage<T extends keyof MessagePayloadMap>(
        msg: Message<T, MessagePayloadMap[T]>
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
