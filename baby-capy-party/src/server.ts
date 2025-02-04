import type * as Party from "partykit/server";

type Message = {
  id: string;
  text: string;
  username: string;
  timestamp: number;
  type: string;
};

export default class Server implements Party.Server {
  messages: Message[] = [];

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`
    );
    // Send existing messages to new connections
    conn.send(JSON.stringify({ type: "messages", messages: this.messages }));
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      // Handle ping messages
      if (message.includes("ping")) {
        sender.send(JSON.stringify({ type: "pong" }));
        return;
      }

      // Parse and validate the message
      const data = JSON.parse(message) as Message;

      if (!data || typeof data !== "object") {
        throw new Error("Invalid message format");
      }

      if (!data.type || typeof data.type !== "string") {
        throw new Error("Message type is required");
      }

      if (data.type === "message") {
        if (!data.text || !data.username) {
          throw new Error("Message text and username are required");
        }

        const newMessage: Message = {
          id: crypto.randomUUID(),
          text: data.text,
          username: data.username,
          timestamp: Date.now(),
          type: "message",
        };

        this.messages.push(newMessage);

        // Broadcast the message to all connections
        this.room.broadcast(
          JSON.stringify({
            type: "new_message",
            message: newMessage,
          })
        );
      }
    } catch (error) {
      console.error("Error processing message:", error);
      sender.send(
        JSON.stringify({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        })
      );
    }
  }
}

Server satisfies Party.Worker;
