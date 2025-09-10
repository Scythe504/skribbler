import { PixelTool } from "@/types/pixelArt";
import { atom } from "jotai";

export const currentTool = atom<PixelTool>(PixelTool.Pixel);