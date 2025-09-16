import { PixelMessage } from "./pixelArt";
import { GameResultData, Player, PlayerGuess } from "./ws-model";

// ===============================
// Mapping Events -> MessageType
// ===============================
export const MessageType = {
    PlayerJoined: "player_joined",
    PlayerLeft: "player_left",
    LobbyUpdate: "lobby_update",
    GameStarted: "game_started",
    LobbyReset: "lobby_reset",
    WaitingPhase: "waiting_phase",
    WordSelection: "word_selection",
    WaitingForWord: "waiting_for_word",
    DrawingPhase: "drawing_phase",
    RoundEnd: "round_end",
    GameEnded: "game_ended",
    TimerUpdate: "timer_update",
    GuessMessage: "guess_message",
    GuessResult: "guess_result",
    CanvasCleared: "canvas_cleared",
    DrawingPermissionUpdated: "drawing_permission_updated",
    GameStateUpdate: "game_state_update",
} as const;

// ===============================
// Mapping MessageType → Data payload
// ===============================
export interface MessagePayloadMap {
    player_joined: PlayerJoinedData;
    player_left: PlayerLeftData;
    lobby_update: LobbyUpdateData;
    game_started: GameStartedData;
    lobby_reset: LobbyResetData;
    waiting_phase: WaitingPhaseData;
    word_selection: WordSelectionData;
    waiting_for_word: WaitingForWordData;
    drawing_phase: DrawingPhaseData;
    round_end: RoundEndData;
    game_ended: GameEndedData;
    timer_update: TimerUpdateData;
    guess_message: GuessMessageData;
    guess_result: GuessResultData;
    canvas_cleared: CanvasClearedData;
    drawing_permission_updated: DrawingPermissionUpdatedData;
    game_state_update: GameStateUpdateData;
}

export type WebSocketResponse = {
    [K in keyof MessagePayloadMap]: Message<K, MessagePayloadMap[K]>
}[keyof MessagePayloadMap]

export const Phase = {
    PhaseWaiting: "waiting",
    PhaseDrawing: "drawing",
    PhaseRevealing: "revealing",
    PhaseEnded: "ending",
    PhaseLobby: "lobby",
} as const;

export type GamePhase = typeof Phase[keyof typeof Phase];

export type MessageType = typeof MessageType[keyof typeof MessageType];

// ===============================
// MessageType: "player_joined"
export interface PlayerJoinedData {
    message: string;
    player_data: Player | null;
}

// ===============================
// MessageType: "player_left"
export interface PlayerLeftData {
    message: string;
    player_id: string;
    username: string;
    players_remaining: string;
}

// ===============================
// MessageType: "lobby_update"
export interface LobbyUpdateData {
    player_id: string;
    username: string;
    is_ready: boolean;
    ready_count: number;
    total_players: number;
}

// ===============================
// MessageType: "game_started"
export interface GameStartedData {
    message: string;
    room_id: string;
    players: Player[] | null;
    players_count: number;
}

// ===============================
// MessageType: "lobby_reset"
export interface LobbyResetData {
    message: string;
    room_id: string;
    timestamp: BigInt;
    players: Player[] | null;
    phase: GamePhase;
    current_drawer: Player;
    round_number: number;
    max_rounds: number;
    correct_guessers: PlayerGuess[];
}

// ===============================
// MessageType: "waiting_phase"
export interface WaitingPhaseData {
    message: string;
    room_id: string;
    current_drawer: {
        id: string;
        username: string;
    }
    phase: GamePhase;
    time_remaining: number;
    round_number: number;
}

// ===============================
// MessageType: "word_selection"
export interface WordSelectionData {
    message: string;
    room_id: string;
    choices: string[];
    time_limit: number;
}

// ===============================
// MessageType: "waiting_for_word"
export interface WaitingForWordData {
    message: string;
    current_drawer: string;
    time_remaining: number;
}

// ===============================
// MessageType: "drawing_phase"
export interface DrawingPhaseData {
    room_id: string;
    masked_word: string;
}

// ===============================
// MessageType: "round_end"
export interface RoundEndData {
    word: string;
    drawer_id: string;
    correct_guessers: PlayerGuess[];
    drawer_username: string;
    next_drawer: Player | null;
    final_scores: Player[] | null;
    is_game_ended: boolean;
}

// ===============================
// MessageType: "game_ended"
export interface GameEndedData {
    leaderboard: GameResultData[];
    mvp: GameResultData | null;
    fastest_guess: GameResultData | null;
    most_accurate: GameResultData | null;
    rounds_played: number;
    total_players: number;
}

// ===============================
// MessageType: "timer_update"
export interface TimerUpdateData {
    time_remaining: BigInt;
    phase: GamePhase;
    is_active: boolean;
}

// ===============================
// MessageType: "guess_message"
export type GuessMessageData = {
    player_guess: PlayerGuess;
    guessed_word: string;
}
// ===============================
// MessageType: "guess_result"
export type GuessResultData = GameResultData

// ===============================
// MessageType: "canvas_cleared"
export interface CanvasClearedData {
    room_id: string;
    player_id: string;
    canvas_state: PixelMessage[];
    timestamp: BigInt;
}

// ===============================
// MessageType: "drawing_permission_updated"
export interface DrawingPermissionUpdatedData {
    room_id: string;
    player_id: string;
    message: string;
}

// ===============================
// MessageType: "game_state_update"
export interface GameStateUpdateData {
    phase: GamePhase;
    round_number: number;
    max_rounds: number;
    current_drawer: Player | null;
    time_remaining: BigInt;
    players: Player[];
    correct_guessers: PlayerGuess[]
    word: string;
}

