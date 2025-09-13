export interface PlayerGuess {
    player_id: string;
    username: string;
    guess_time: number;
    is_correct: boolean;
}

export interface Player {
    id: string;
    username: string;
    score: number;
    canvas_height: number;
    canvas_width: number;
    is_ready: boolean;
    has_guessed: boolean;
    last_guess_time: Date;
    is_connected: boolean;
    joined_at: Date;
    can_draw: boolean;
    total_guesses: number;
    correct_guesses: number;
    times_drawn: number;
}

export interface GameResultData {
    player_id: string;
    username: string;
    is_correct: boolean;
    score: number;
    position: number;
    time_to_guess_ms: BigInt;
} 