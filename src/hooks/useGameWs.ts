'use client'
import { wsAtom } from "@/store/atoms/ws";
import { WebSocketResponse, MessagePayloadMap } from "@/types/ws-resp";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

type MessageHandler = <T extends keyof MessagePayloadMap>(msg: {
    type: T
    data: MessagePayloadMap[T]
}) => void
export function useGameWebsocket(wsUrl: string | null, handleMessage: MessageHandler) {
    const [, setWs] = useAtom(wsAtom) // only set, don't read
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)

    const messageHandlerRef = useRef<MessageHandler>(handleMessage)
    useEffect(() => {
        messageHandlerRef.current = handleMessage
    }, [handleMessage])

    useEffect(() => {
        if (!wsUrl) return

        console.log("[useGameWebsocket] Connecting to:", wsUrl)
        setConnectionError(null)

        const websocket = new WebSocket(wsUrl)

        websocket.onopen = () => {
            console.log("[useGameWebsocket] Connected")
            setIsConnected(true)
            setWs(websocket) // publish globally
        }

        websocket.onclose = (event) => {
            console.log("[useGameWebsocket] Closed:", event.code, event.reason)
            setIsConnected(false)
            setWs(null)
            if (event.code !== 1000) {
                setConnectionError(event.reason || "Unknown reason")
            }
        }

        websocket.onerror = (err) => {
            console.error("[useGameWebsocket] Error:", err)
            setConnectionError("Failed to connect")
            setIsConnected(false)
        }

        websocket.onmessage = (event) => {
            try {
                const message: WebSocketResponse = JSON.parse(event.data)
                messageHandlerRef.current(message)
            } catch (e) {
                console.error("Failed to parse WebSocket message:", e)
            }
        }

        return () => {
            console.log("[useGameWebsocket] Cleaning up WebSocket")
            websocket.close(1000, "Component unmounting")
        }
    }, [wsUrl, setWs]) // notice: no `ws` here

    return { isConnected, connectionError }
}
