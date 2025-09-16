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
import { ChatBox } from "@/components/chat-box/chatbox"

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
    const nameFromUrl = searchParams.get("username")
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
      <div className="h-screen w-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading game...</div>
          <div className="text-sm text-gray-400">Extracting player information from URL</div>
          {connectionError && <div className="mt-4 p-3 bg-red-900 text-red-300 rounded">Error: {connectionError}</div>}
        </div>
      </div>
    )
  }

  return (
    <Provider>
      <div className="h-screen w-screen flex flex-col text-white">
        {/* Header */}
        <div className=" p-4 text-center border-b ">
          <h1 className="text-2xl font-bold mb-2">Pixel Art Game</h1>
          <div className="text-sm text-gray-300">
            Player: <span className="font-medium text-white">{playerName}</span> | Room:{" "}
            <span className="font-medium text-white">{roomId}</span>
          </div>

          {/* Connection Status */}
          <div
            className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
            {isConnected ? "Connected" : "Connecting..."}
          </div>

          {connectionError && (
            <div className="mt-2 p-3 bg-red-900 text-red-300 rounded max-w-md mx-auto">
              <strong>Connection Error:</strong> {connectionError}
              <div className="text-xs mt-1">Check if the game server is running on {baseWsUrl}</div>
            </div>
          )}
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex">
          {/* Tools Panel - Left Side */}
          <div className="w-64 p-4 border-r ">
            <Card className="border-gray-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Tools & Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-300">Drawing Tools</h3>
                  <DrawMethods />
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-300">Colors</h3>
                  <ColorPicker />
                </div>
                <div>
                  <BrushSizePicker />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Canvas Area - Center */}
          <div className="flex-1 flex justify-center items-center p-4">
            {wsUrl ? (
              <PixelArtCanvas />
            ) : (
              <div className="text-center p-8 rounded-lg border border-gray-600">
                <div className="text-lg mb-2">Preparing canvas...</div>
                <div className="text-sm text-gray-400">Setting up WebSocket connection</div>
              </div>
            )}
          </div>

          {/* Chat Box - Right Side */}
          <div className="w-80 p-4  border-l ">
            <ChatBox
              messages={[]}
              onSendMessage={(message) => console.log("Send message:", message)}
              currentUsername={playerName}
              placeholder="Type your guess..."
            />
          </div>
        </div>

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === "development" && (
          <div className="p-3  border-t  text-xs text-gray-400">
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
