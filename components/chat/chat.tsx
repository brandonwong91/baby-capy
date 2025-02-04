"use client";

import { useState, useEffect } from "react";
import { useThreads } from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react";
import { Composer, Thread } from "@liveblocks/react-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Chat() {
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { threads } = useThreads();

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
    <ClientSideSuspense fallback={<div>Loading chat...</div>}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Chat</h2>
          <div className="text-sm text-gray-600">
            Chatting as: <span className="font-medium">{username}</span>
          </div>
        </div>
        <div className="space-y-2">
          {threads.map((thread) => (
            <Thread
              key={thread.id}
              thread={thread}
              className="thread"
              showComposer={false}
              showReactions={false}
              showActions={false}
            />
          ))}
          <Composer
            className="composer"
            // metadata={{ username }}
          />
        </div>
      </div>
    </ClientSideSuspense>
  );
}
