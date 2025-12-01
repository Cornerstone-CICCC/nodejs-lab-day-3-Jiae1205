import { Server, Socket } from "socket.io";
import { Chat } from "../models/chat.model";

const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    let currentRoom: string | null = null;

    // ------------------------------
    // 1) Join Room
    // ------------------------------
    socket.on("room:join", async (roomName: string) => {
      console.log(`${socket.id} joined room: ${roomName}`);

      // Leave previous room
      if (currentRoom) {
        socket.leave(currentRoom);
        socket.to(currentRoom).emit("system:message", `Someone left the room`);
      }

      currentRoom = roomName;
      socket.join(roomName);

      // Send old messages of this room
      const messages = await Chat.find({ room: roomName })
        .sort({ createdAt: 1 })
        .lean();

      socket.emit("chat:history", messages);

      // Notify others in this room
      socket.to(roomName).emit("system:message", `Someone joined the room`);
    });

    // ------------------------------
    // 2) Leave Room
    // ------------------------------
    socket.on("room:leave", () => {
      if (currentRoom) {
        socket.to(currentRoom).emit("system:message", `Someone left the room`);
        socket.leave(currentRoom);
        currentRoom = null;
      }

      socket.emit("room:left"); // Tell frontend to clear messages
    });

    // ------------------------------
    // 3) Send Message
    // ------------------------------
    socket.on(
      "chat:message",
      async (data: { username: string; message: string }) => {
        if (!currentRoom) return;

        const newChat = await Chat.create({
          username: data.username,
          message: data.message,
          room: currentRoom,
        });

        io.to(currentRoom).emit("chat:message", newChat);
      }
    );

    // ------------------------------
    // 4) On Disconnect
    // ------------------------------
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export default setupChatSocket;
