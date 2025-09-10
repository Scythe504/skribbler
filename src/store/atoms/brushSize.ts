import { atom } from "jotai"

export const brushSize = atom<number>(1)

export const BRUSH_SIZES = [1, 2, 3, 4] as const
export type BrushSize = (typeof BRUSH_SIZES)[number]
