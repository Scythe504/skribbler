import { PixelTool } from "@/types/pixelArt"
import { PixelDrawingManager } from "@/utils/draw"
import { atom } from "jotai"

export const gameTime = 12 * 1000 * 10
export const wordSelectTime = 30 * 1000 * 10

export const COUNTDOWN_DENOMINATOR = 1000 * 10

export const chosenWord = atom("")

export const pixelManagerAtom = atom<PixelDrawingManager | null>(null)

export const drawingAtom = atom(false); // is currently drawing
export const dragPixelsAtom = atom<Set<string>>(new Set<string>());

export const currentToolAtom = atom<PixelTool>(PixelTool.Pixel);
export const currentColorAtom = atom<string>("000000"); // hex without "#"

// Optional: canvas manager reference atom
export const managerAtom = atom<PixelDrawingManager | null>(null);
