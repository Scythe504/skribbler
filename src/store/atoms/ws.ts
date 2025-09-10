// store/store.ts
import { atom } from 'jotai';

// Just store the WebSocket instance
export const wsAtom = atom<WebSocket | null>(null);

// Optional: Store basic game info if needed
export const playerNameAtom = atom<string>("");
export const roomIdAtom = atom<string>("");
export const playerIdAtom = atom<string>("");