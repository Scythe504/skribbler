// Updated ChatBox component (chatbox.tsx)
"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { useAtom } from "jotai"
import { chatMessagesAtom } from "@/store/atoms/ws"

interface ChatBoxProps {
  currentUsername: string
  websocket: WebSocket | null // Add WebSocket as prop
  disabled?: boolean
  placeholder?: string
}

export const ChatBox = ({
  currentUsername,
  websocket,
  disabled = false,
  placeholder = "Type your guess...",
}: ChatBoxProps) => {
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useAtom(chatMessagesAtom)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Check if WebSocket is ready using the prop
  const isWsReady = websocket && websocket.readyState === WebSocket.OPEN

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || disabled || !isWsReady) return

    const messageText = inputValue.trim()

    // Send guess to server with correct format
    console.log("[v0] Sending guess message:", messageText)
    websocket!.send(
      JSON.stringify({
        type: "guess_message",
        data: messageText,
      }),
    )

    setInputValue("")
  }

  return (
    <div className="flex flex-col h-full  rounded-lg">  {/* full height */}
      {/* Header */}
      <div className="p-3 border-b rounded-t-lg flex flex-row justify-between items-center">
        <h3 className="font-bold text-[20px] text-white">Chat</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full -translate-y-[2px] ${isWsReady ? "bg-green-400" : "bg-red-400"}`} />
          <span className="text-xs text-gray-400">
            {isWsReady ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Scrollable message list */}
      <ScrollArea className="flex-1 p-3 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="text-sm text-gray-400 italic text-center py-4">
              No messages yet. Start chatting!
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={`${msg.username}-${index}`}
                className={`text-sm ${msg.username === "SYSTEM" ? "text-gray-400 italic" : ""
                  }`}
              >
                {msg.username !== "SYSTEM" && (
                  <span
                    className={`font-medium ${msg.username === currentUsername
                        ? "text-blue-400"
                        : "text-gray-300"
                      }`}
                  >
                    {msg.username}:{" "}
                  </span>
                )}
                <span
                  className={
                    msg.username === "SYSTEM" ? "text-gray-400" : "text-white"
                  }
                >
                  {msg.message}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={!isWsReady ? "Connecting..." : disabled ? "Chat disabled" : placeholder}
            disabled={disabled || !isWsReady}
            className="flex-1 text-white placeholder-gray-400 border-gray-600"
          />
          <Button type="submit" size="sm" disabled={disabled || !inputValue.trim() || !isWsReady}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}