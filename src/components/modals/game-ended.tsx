// components/modals/game-ended.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GameEndedData } from "@/types/ws-resp";
import { Trophy, Zap, Target, Users } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  subValue: string;
  className?: string;
}

const StatCard = ({ icon: Icon, title, value, subValue, className = "" }: StatCardProps) => (
  <div className={clsx("pixel-border p-4 text-center bg-card/50", className)}>
    <Icon className="w-8 h-8 mx-auto mb-2" />
    <h3 className="font-semibold text-sm">{title}</h3>
    <p className="font-bold text-foreground pixel-text">{value}</p>
    <p className="text-xs text-muted-foreground">{subValue}</p>
  </div>
);

const getPositionIcon = (position: number) => {
  switch (position) {
    case 1: return "🥇";
    case 2: return "🥈";
    case 3: return "🥉";
    default: return `#${position}`;
  }
};

interface GameEndedModalProps extends GameEndedData {
  onClose?: () => void;
}

export function GameEndedModal({
  leaderboard,
  mvp,
  fastest_guess,
  most_accurate,
  rounds_played,
  total_players,
  onClose,
}: GameEndedModalProps) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setOpen(false); // close the modal
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const formatTime = (timeMs: number) => `${(Number(timeMs) / 1000).toFixed(2)}s`;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto pixel-border animate-fade-in">
        <div className="space-y-6 p-6">
          <div className="text-center space-y-2">
            <DialogTitle className="text-3xl font-bold text-foreground pixel-text drop-shadow-[4px_4px_0_#000]">
              🎮 Game Over! 🎮
            </DialogTitle>
            <p className="text-muted-foreground pixel-text">
              {rounds_played} rounds • {total_players} players
            </p>
            {open && timeLeft > 0 && (
              <p className="text-sm text-muted-foreground pixel-text">
                Closing in {timeLeft}s...
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mvp && (
              <StatCard
                icon={Trophy}
                title="MVP"
                value={mvp.username}
                subValue={`${mvp.score} points`}
                className="pixel-bg-yellow drop-shadow-[4px_4px_0_#000] animate-pulse"
              />
            )}
            {fastest_guess && (
              <StatCard
                icon={Zap}
                title="Fastest Guess"
                value={fastest_guess.username}
                subValue={formatTime(fastest_guess.time_to_guess_ms)}
                className="pixel-bg-blue drop-shadow-[4px_4px_0_#000]"
              />
            )}
            {most_accurate && (
              <StatCard
                icon={Target}
                title="Most Accurate"
                value={most_accurate.username}
                subValue={`${most_accurate.score} points`}
                className="pixel-bg-green drop-shadow-[4px_4px_0_#000]"
              />
            )}
          </div>

          <div className="space-y-3 pixel-border bg-card/50 p-4 drop-shadow-[4px_4px_0_#000]">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 pixel-text">
              <Users className="w-5 h-5" /> Final Leaderboard
            </h2>
            <div className="space-y-2">
              {leaderboard.map((player) => (
                <div
                  key={player.player_id}
                  className={clsx(
                    "flex items-center justify-between p-3 pixel-border",
                    player.position <= 3 ? "pixel-bg-top3" : "bg-card/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold min-w-[2rem] pixel-text">
                      {getPositionIcon(player.position)}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground pixel-text">{player.username}</p>
                      <p className="text-xs text-muted-foreground pixel-text">
                        {player.is_correct ? "✅ Correct" : "❌ Incorrect"} • {formatTime(player.time_to_guess_ms)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground pixel-text">{player.score}</p>
                    <p className="text-xs text-muted-foreground pixel-text">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!open && onClose && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleClose}
                className="pixel-border drop-shadow-[4px_4px_0_#000]"
                variant="outline"
              >
                Close Results
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
