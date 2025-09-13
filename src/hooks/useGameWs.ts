'use client'
import { wsAtom } from "@/store/atoms/ws";
import { MessageType, WebSocketResponse } from "@/types/ws-resp";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";


type Handlers = {
    [K in MessageType]?: (data: any) => void
}
export function useGameWebsocket(wsUrl: string | null, handlers: Handlers) {
    const [ws, setWs] = useAtom(wsAtom)
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)

    useEffect(() => {
        if (!wsUrl) return

        const websocket = new WebSocket(wsUrl)

        websocket.onopen = () => {
            setIsConnected(true)
            setWs(websocket)
        }

        websocket.onclose = (e) => {
            setIsConnected(false)
            setWs(null)
            if (e.code != 1000) {
                setConnectionError(e.reason || "Connection closed unexpectedly")
            }
        }

        // TODO: set onerror → log error + update state
        websocket.onerror = () => {
            setConnectionError("WebSocket error")
            setIsConnected(false)
        }

        // TODO: set onmessage → parse JSON + call handler
        websocket.onmessage = (event) => {
            try {
                const msg: WebSocketResponse = JSON.parse(event.data)
                const handler = handlers[msg.type as MessageType]
                if (handler) handler(msg.data)
            } catch (err) {
                console.error("Bad WS message:", err)
            }
        }

        // TODO: cleanup on unmount
        return () => {
            websocket.close(1000, "Component unmounted")
        }
    }, [wsUrl])

}