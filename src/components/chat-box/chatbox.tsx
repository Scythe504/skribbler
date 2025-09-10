"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"

export interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: Date
  isSystem?: boolean
}

interface ChatBoxProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  currentUsername: string
  disabled?: boolean
  placeholder?: string
}

export const ChatBox = ({
  messages,
  onSendMessage,
  currentUsername,
  disabled = false,
  placeholder = "Type your guess...",
}: ChatBoxProps) => {
  const [inputValue, setInputValue] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim())
      setInputValue("")
    }
  }

  return (
    <div className="flex flex-col h-96 border rounded-lg bg-white">
      <div className="p-3 border-b bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-sm">Chat</h3>
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`text-sm ${msg.isSystem ? "text-gray-500 italic" : ""}`}>
              {!msg.isSystem && (
                <span className={`font-medium ${msg.username === currentUsername ? "text-blue-600" : "text-gray-700"}`}>
                  {msg.username}:{" "}
                </span>
              )}
              <span className={msg.isSystem ? "text-gray-500" : "text-gray-900"}>{msg.message}</span>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-3 border-t bg-gray-50 rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={disabled || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
