"use client"

import { gameStateAtom } from "@/store/atoms/ws"
import type { Player } from "@/types/ws-model"
import { useAtom } from "jotai"

const DrawerIcon = ({ className }: { className?: string }) => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`${className} animate-pulse`}>
		{/* Pixel-styled pencil/brush icon with drawing animation */}
		<rect x="2" y="2" width="2" height="2" fill="currentColor" className="animate-[wiggle_1s_ease-in-out_infinite]" />
		<rect
			x="4"
			y="4"
			width="2"
			height="2"
			fill="currentColor"
			className="animate-[wiggle_1s_ease-in-out_infinite_0.1s]"
		/>
		<rect
			x="6"
			y="6"
			width="2"
			height="2"
			fill="currentColor"
			className="animate-[wiggle_1s_ease-in-out_infinite_0.2s]"
		/>
		<rect
			x="8"
			y="8"
			width="2"
			height="2"
			fill="currentColor"
			className="animate-[wiggle_1s_ease-in-out_infinite_0.3s]"
		/>
		<rect
			x="10"
			y="10"
			width="2"
			height="2"
			fill="currentColor"
			className="animate-[wiggle_1s_ease-in-out_infinite_0.4s]"
		/>
		<rect
			x="12"
			y="12"
			width="2"
			height="2"
			fill="currentColor"
			className="animate-[wiggle_1s_ease-in-out_infinite_0.5s]"
		/>
		<rect
			x="0"
			y="0"
			width="2"
			height="2"
			fill="currentColor"
			className="animate-[wiggle_1s_ease-in-out_infinite_0.6s]"
		/>
		<rect
			x="1"
			y="1"
			width="2"
			height="2"
			fill="currentColor"
			className="animate-[wiggle_1s_ease-in-out_infinite_0.7s]"
		/>
	</svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
	<svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
		<rect x="2" y="6" width="2" height="2" fill="currentColor" />
		<rect x="4" y="8" width="2" height="2" fill="currentColor" />
		<rect x="6" y="6" width="2" height="2" fill="currentColor" />
		<rect x="8" y="4" width="2" height="2" fill="currentColor" />
		<rect x="10" y="2" width="2" height="2" fill="currentColor" />
	</svg>
)

export const PlayersList = () => {
	const [gameState] = useAtom(gameStateAtom)

	const getPlayerStatus = (player: Player) => {
		if (gameState.currentDrawer?.id === player.id) {
			return {
				status: "DRAWING",
				textColor: "text-foreground",
				bgColor: "bg-chart-1/10 border-chart-1",
				icon: <DrawerIcon className="text-chart-1" />,
			}
		}
		if (player.has_guessed) {
			return {
				status: "GUESSED",
				textColor: "text-foreground",
				bgColor: "bg-chart-2/10 border-chart-2",
				icon: <CheckIcon className="text-chart-2" />,
			}
		}
		if (!player.is_connected) {
			return {
				status: "OFFLINE",
				textColor: "text-muted-foreground",
				bgColor: "",
				icon: null,
			}
		}
		return {
			status: "WAITING",
			textColor: "text-foreground",
			bgColor: "",
			icon: null,
		}
	}

	return (
		<div className="bg-card border-2 border-border rounded-none shadow-[4px_4px_0px_0px] shadow-border/50 font-mono p-4 w-full max-w-sm">
			<div className="space-y-3">
				<div className="text-lg font-mono font-bold text-center text-primary tracking-wider border-b-2 border-border pb-3 mb-4">
					PLAYERS
				</div>

				<div className="space-y-2">
					{gameState.players.length === 0 ? (
						<div className="text-center text-muted-foreground font-mono text-sm py-4">NO PLAYERS</div>
					) : (
						gameState.players.map((player) => {
							const { status, textColor, bgColor, icon } = getPlayerStatus(player)

							return (
								<div
									key={player.id}
									className={`flex items-center justify-between p-3 border-2 border-border rounded-none bg-background/50 transition-all duration-300 hover:bg-background/80 ${bgColor}`}
								>
									<div className="flex items-center gap-3 flex-1 min-w-0">
										<div className="flex items-center gap-2 flex-shrink-0">
											{icon && <div className="w-4 h-4 flex items-center justify-center">{icon}</div>}
											<div
												className={`w-2 h-2 border border-current ${textColor} ${player.is_connected ? "bg-current" : "bg-transparent"
													} transition-colors duration-200`}
										  />
										</div>

										<div className={`font-mono font-medium text-sm ${textColor} truncate flex-1`}>
											{player.username}
										</div>

										{status !== "WAITING" && (
											<div
												className={`text-xs font-mono px-2 py-1 border border-current ${textColor} flex-shrink-0 min-w-[3rem] text-center`}
											>
												{status === "DRAWING" ? "✏" : status === "GUESSED" ? "✓" : status.slice(0, 3)}
											</div>
										)}
									</div>

									<div className="text-sm font-mono font-bold text-primary flex-shrink-0 ml-4 min-w-[2rem] text-right">
										{player.score}
									</div>
								</div>
							)
						})
					)}
				</div>

				{gameState.phase !== "lobby" && (
					<div className="text-center pt-3 mt-4 border-t-2 border-border">
						<div className="text-xs font-mono text-muted-foreground tracking-wider">
							{gameState.phase.toUpperCase()}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
