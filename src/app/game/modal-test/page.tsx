// ModalTest.tsx
"use client"
import { useAtom } from "jotai";
import { modalAtom } from "@/store/atoms/modal";
import { Button } from "@/components/ui/button";
// Assuming the types are available from a shared location
import type { GameResultData, Player, PlayerGuess } from "@/types/ws-model";
import { RoundEndData } from "@/types/ws-resp";

export default function ModalTest() {
  const [, setModal] = useAtom(modalAtom);

  // You may need to create a mock Player data object if you don't have one already
  // For this example, we'll assume a simplified mock Player object exists.
  const mockPlayers: Player[] = [
    { id: "p1", username: "Alice", score: 120, canvas_height: 500, canvas_width: 500, is_ready: true, has_guessed: true, last_guess_time: new Date(), is_connected: true, joined_at: new Date(), can_draw: false, total_guesses: 10, correct_guesses: 5, times_drawn: 1 },
    { id: "p2", username: "Bob", score: 80, canvas_height: 500, canvas_width: 500, is_ready: true, has_guessed: true, last_guess_time: new Date(), is_connected: true, joined_at: new Date(), can_draw: false, total_guesses: 8, correct_guesses: 3, times_drawn: 1 },
    { id: "p3", username: "Charlie", score: 150, canvas_height: 500, canvas_width: 500, is_ready: true, has_guessed: true, last_guess_time: new Date(), is_connected: true, joined_at: new Date(), can_draw: true, total_guesses: 15, correct_guesses: 8, times_drawn: 2 },
  ];

  // Mock data for PlayerGuess
  const mockPlayerGuesses: PlayerGuess[] = [
    { player_id: "p1", username: "Alice", guess_time: 1250, is_correct: true },
    { player_id: "p2", username: "Bob", guess_time: 2100, is_correct: true },
    { player_id: "p3", username: "Charlie", guess_time: 800, is_correct: true },
  ];

  const mockRoundEndData: RoundEndData = {
    word: "PIXEL",
    drawer_id: "p3",
    drawer_username: "Charlie",
    correct_guessers: mockPlayerGuesses,
    next_drawer: mockPlayers[1], // Bob is the next drawer
    final_scores: mockPlayers, // This would be null for a round that isn't the final one
    is_game_ended: false,
  };

  // Example of mock data for the final round
  const mockFinalRoundEndData: RoundEndData = {
    word: "SKETCH",
    drawer_id: "p1",
    drawer_username: "Alice",
    correct_guessers: [
      { player_id: "p3", username: "Charlie", guess_time: 500, is_correct: true },
      { player_id: "p2", username: "Bob", guess_time: 1100, is_correct: true },
    ],
    next_drawer: null,
    final_scores: mockPlayers, // The game is ended, so final_scores is populated
    is_game_ended: true,
  };
  const mockGameResults: GameResultData[] = [
    {
      player_id: "player_1",
      username: "Player A",
      is_correct: true,
      score: 1500,
      position: 1,
      time_to_guess_ms: 1000,
    },
    {
      player_id: "player_2",
      username: "Player B",
      is_correct: true,
      score: 1200,
      position: 2,
      time_to_guess_ms: 1500,
    },
    {
      player_id: "player_3",
      username: "Player C",
      is_correct: false,
      score: 800,
      position: 3,
      time_to_guess_ms: 0,
    },
  ];

  // Handlers for each button click
  const handlers = {
    openWordSelectModal: () => {
      setModal({
        type: "wordSelect",
        props: { words: ["apple", "banana", "cherry"], timer: 30 }
      });
    },
    openDrawerSelectModal: () => {
      setModal({
        type: "drawerSelect",
        props: { timer: 30, username: "Player A", isOpen: true, onClose: null }
      });
    },
    openGameEndedModal: () => {
      setModal({
        type: "gameEnded",
        props: {
          leaderboard: mockGameResults,
          mvp: mockGameResults[0],
          fastest_guess: mockGameResults[0],
          most_accurate: mockGameResults[0],
          rounds_played: 5,
          total_players: 3,
        }
      });
    },
    // New handler for the RoundEnd modal
    openRoundEndModal: () => {
      setModal({
        type: "roundEnded",
        props: mockRoundEndData
      });
    },
  };

  return (
    <>
      <Button onClick={handlers.openWordSelectModal} className="mr-2">
        Open Word Select
      </Button>
      <Button onClick={handlers.openDrawerSelectModal} className="mr-2">
        Open Drawer Select
      </Button>
      <Button onClick={handlers.openGameEndedModal} className="mr-2">
        Open Game Ended
      </Button>
      <Button onClick={handlers.openRoundEndModal}>Open Round Ended</Button>
    </>
  );
}