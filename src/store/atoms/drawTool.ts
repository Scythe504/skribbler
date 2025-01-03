import { DrawingTool } from "@/utils/draw";
import { atom } from "jotai";

export const currentTool = atom<DrawingTool>(DrawingTool.PaintBrush);