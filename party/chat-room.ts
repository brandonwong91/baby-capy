import type * as Party from "partykit/server";

type Message = {
  id: string;
  text: string;
  username: string;
  timestamp: number;
};

export default class ChatRoom implements Party.Server {
  messages: Message[] = [];

  constructor(readonly party: Party.Party) {}

  async onConnect(conn: Party.Connection) {
    try {
      // Send existing messages to new connections
      conn.send(JSON.stringify({ type: "messages", messages: this.messages }));
    } catch (error) {
      console.error("Error sending messages to new connection:", error);
      conn.send(
        JSON.stringify({ type: "error", message: "Failed to send messages" })
      );
    }
  }

  async onMessage(message: string) {
    const data = JSON.parse(message);

    if (data.type === "message") {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        text: data.text,
        username: data.username,
        timestamp: Date.now(),
      };

      this.messages.push(newMessage);
      // Broadcast the message to all connected clients
      this.party.broadcast(
        JSON.stringify({ type: "new_message", message: newMessage })
      );
    }
  }
}

ChatRoom satisfies Party.Worker;
