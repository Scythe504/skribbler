"use client"

import { PixelArtCanvas } from "@/components/drawing-canvas/canvas"
import { ColorPicker } from "@/components/drawing-canvas/color-picker"
import { DrawMethods } from "@/components/drawing-canvas/draw-methods"
import { BrushSizePicker } from "@/components/drawing-canvas/brush-size-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Provider } from "jotai"
import { playerNameAtom, roomIdAtom, wsAtom } from "@/store/atoms/ws"
import { useAtom } from "jotai"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const [playerName, setPlayerName] = useAtom(playerNameAtom)
  const [roomId, setRoomId] = useAtom(roomIdAtom)
  const [ws, setWs] = useAtom(wsAtom)
  const searchParams = useSearchParams()
  const { gameId } = useParams()

const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [wsUrl, setWsUrl] = useState<string | null>(null)

  const baseWsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080"

  // Extract parameters and build WebSocket URL
  useEffect(() => {
    const nameFromUrl = searchParams.get("playerName")
    const roomIdFromUrl = gameId as string

    console.log("URL params:", { nameFromUrl, roomIdFromUrl })

    if (nameFromUrl && roomIdFromUrl) {
      setPlayerName(nameFromUrl)
      setRoomId(roomIdFromUrl)

      // Build the complete WebSocket URL
      const fullWsUrl = `${baseWsUrl}/ws/${roomIdFromUrl}?username=${encodeURIComponent(nameFromUrl)}`
      setWsUrl(fullWsUrl)
      console.log("WebSocket URL set:", fullWsUrl)
    } else {
      console.warn("Missing required parameters:", { nameFromUrl, roomIdFromUrl })
      setConnectionError("Missing player name or room ID in URL")
    }
  }, [searchParams, gameId, setPlayerName, setRoomId, baseWsUrl])

  // Connect WebSocket when URL is ready
  useEffect(() => {
    if (!wsUrl || ws) return // Don't reconnect if already connected

    console.log("Attempting to connect to:", wsUrl)
    setConnectionError(null)

    try {
      const websocket = new WebSocket(wsUrl)

      websocket.onopen = () => {
        console.log("WebSocket connected successfully")
        setIsConnected(true)
        setWs(websocket)
        setConnectionError(null)
      }

      websocket.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason)
        setIsConnected(false)
        setWs(null)

        if (event.code !== 1000) {
          // 1000 = normal closure
          setConnectionError(`Connection closed: ${event.reason || "Unknown reason"}`)
        }
      }

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionError("Failed to connect to game server")
        setIsConnected(false)
      }

      websocket.onmessage = (event) => {
        console.log("WebSocket message received:", event.data)
      }
    } catch (error) {
      console.error("WebSocket creation failed:", error)
      setConnectionError("Failed to create WebSocket connection")
    }
  }, [wsUrl, ws, setWs])

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("Cleaning up WebSocket connection")
        ws.close(1000, "Component unmounting")
      }
    }
  }, [ws])

  // Show loading state
  if (!playerName || !roomId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading game...</div>
          <div className="text-sm text-gray-600">Extracting player information from URL</div>
          {connectionError && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">Error: {connectionError}</div>}
        </div>
      </div>
    )
  }

  return (
    <Provider>
      <div className="h-screen w-screen flex flex-col p-4">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Pixel Art Game</h1>
          <div className="text-sm text-gray-600">
            Player: <span className="font-medium">{playerName}</span> | Room:{" "}
            <span className="font-medium">{roomId}</span>
          </div>

          {/* Connection Status */}
          <div
            className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
            {isConnected ? "Connected" : "Connecting..."}
          </div>

          {connectionError && (
            <div className="mt-2 p-3 bg-red-100 text-red-700 rounded max-w-md mx-auto">
              <strong>Connection Error:</strong> {connectionError}
              <div className="text-xs mt-1">Check if the game server is running on {baseWsUrl}</div>
            </div>
          )}
        </div>

        <div className="flex-1 flex gap-4 max-w-7xl mx-auto w-full">
          {/* Tools Panel */}
          <div className="w-64 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tools & Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Drawing Tools</h3>
                  <DrawMethods />
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Brush Size</h3>
                  <BrushSizePicker />
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Colors</h3>
                  <ColorPicker />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex justify-center items-center">
            {wsUrl ? (
              <PixelArtCanvas websocketUrl={wsUrl} />
            ) : (
              <div className="text-center p-8 bg-gray-100 rounded-lg">
                <div className="text-lg mb-2">Preparing canvas...</div>
                <div className="text-sm text-gray-600">Setting up WebSocket connection</div>
              </div>
            )}
          </div>
        </div>

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600 max-w-2xl mx-auto">
            <strong>Debug Info:</strong>
            <br />
            WebSocket URL: {wsUrl || "Not set"}
            <br />
            Connection State: {ws?.readyState ?? "No WebSocket"}
            <br />
            Base URL: {baseWsUrl}
          </div>
        )}
      </div>
    </Provider>
  )
}
