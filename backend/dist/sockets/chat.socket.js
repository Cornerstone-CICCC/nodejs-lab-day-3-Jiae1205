"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_model_1 = require("../models/chat.model");
const setupChatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        let currentRoom = null;
        // ------------------------------
        // 1) Join Room
        // ------------------------------
        socket.on("room:join", (roomName) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`${socket.id} joined room: ${roomName}`);
            // Leave previous room
            if (currentRoom) {
                socket.leave(currentRoom);
                socket.to(currentRoom).emit("system:message", `Someone left the room`);
            }
            currentRoom = roomName;
            socket.join(roomName);
            // Send old messages of this room
            const messages = yield chat_model_1.Chat.find({ room: roomName })
                .sort({ createdAt: 1 })
                .lean();
            socket.emit("chat:history", messages);
            // Notify others in this room
            socket.to(roomName).emit("system:message", `Someone joined the room`);
        }));
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
        socket.on("chat:message", (data) => __awaiter(void 0, void 0, void 0, function* () {
            if (!currentRoom)
                return;
            const newChat = yield chat_model_1.Chat.create({
                username: data.username,
                message: data.message,
                room: currentRoom,
            });
            io.to(currentRoom).emit("chat:message", newChat);
        }));
        // ------------------------------
        // 4) On Disconnect
        // ------------------------------
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};
exports.default = setupChatSocket;
