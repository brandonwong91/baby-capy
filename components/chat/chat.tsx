"use client";

import { useState, useEffect } from "react";
import { usePartySocket } from "partysocket/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PencilIcon } from "lucide-react";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

const StatusIndicator = ({ status }: { status: ConnectionStatus }) => {
  const statusConfig = {
    connecting: { color: "bg-yellow-500", text: "Connecting..." },
    connected: { color: "bg-green-500", text: "Connected" },
    disconnected: { color: "bg-gray-500", text: "Disconnected" },
    error: { color: "bg-red-500", text: "Connection Error" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {config.text}
      </span>
    </div>
  );
};

type Message = {
  id: string;
  text: string;
  username: string;
  timestamp: number;
};

export function Chat() {
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: "chat",
    onOpen() {
      console.log("Connected to chat server");
      setConnectionStatus("connected");
    },
    onClose() {
      console.log("Disconnected from chat server");
      setConnectionStatus("disconnected");
    },
    onError(error) {
      console.error("WebSocket connection error:", error);
      setConnectionStatus("error");
    },
    onMessage(event) {
      try {
        if (typeof event.data !== "string") {
          throw new Error("Invalid message format: expected string data");
        }
        const data = JSON.parse(event.data);
        if (!data || typeof data !== "object") {
          throw new Error("Invalid message format: expected JSON object");
        }
        if (!data.type || typeof data.type !== "string") {
          throw new Error("Invalid message format: missing or invalid type");
        }
        if (data.type === "messages") {
          if (!Array.isArray(data.messages)) {
            throw new Error("Invalid messages format: expected array");
          }
          setMessages(data.messages);
        } else if (data.type === "new_message") {
          if (!data.message || typeof data.message !== "object") {
            throw new Error(
              "Invalid new_message format: missing or invalid message"
            );
          }
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", {
          error: error instanceof Error ? error.message : "Unknown error",
          data: event.data,
        });
      }
    },
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("chatUsername");
    if (storedUsername) {
      setUsername(storedUsername);
      setIsAuthenticated(true);
    }
  }, []);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    localStorage.setItem("chatUsername", username.trim());
    setIsAuthenticated(true);
  };

  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsSubmittingMessage(true);
    socket.send(
      JSON.stringify({
        type: "message",
        text: newMessage.trim(),
        username,
      })
    );
    setNewMessage("");
    setIsSubmittingMessage(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Join Chat</h2>
        <form onSubmit={handleUsernameSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Enter your username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username..."
              className="w-full"
              required
              minLength={3}
              maxLength={20}
            />
          </div>
          <Button type="submit" className="w-full">
            Join Chat
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Chat</h2>
          <StatusIndicator status={connectionStatus} />
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          {isEditingUsername ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  newUsername.trim().length >= 3 &&
                  newUsername.trim().length <= 20
                ) {
                  setUsername(newUsername.trim());
                  localStorage.setItem("chatUsername", newUsername.trim());
                  setIsEditingUsername(false);
                }
              }}
              className="flex items-center gap-2"
            >
              <Input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="New username..."
                className="w-32"
                required
                minLength={3}
                maxLength={20}
                autoFocus
              />
              <Button type="submit" size="sm" variant="outline">
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingUsername(false)}
              >
                Cancel
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full font-medium">
                {username}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNewUsername(username);
                  setIsEditingUsername(true);
                }}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-[400px] overflow-y-auto border rounded-lg p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.username === username
                  ? "bg-blue-100 ml-auto"
                  : "bg-gray-100"
              } max-w-[80%]`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{message.username}</span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleMessageSubmit} className="flex gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            required
          />
          <Button
            type="submit"
            disabled={isSubmittingMessage}
            className={`transition-all duration-200 ${
              isSubmittingMessage ? "opacity-70" : ""
            }`}
          >
            {isSubmittingMessage ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}
