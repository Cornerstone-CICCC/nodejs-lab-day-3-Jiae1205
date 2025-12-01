import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import chatRouter from "./routes/chat.routes";
import setupChatSocket from "./sockets/chat.socket";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// __dirname 설정 (TS에서 사용하려면 이렇게 해야 함)
const __dirnamePath = path.resolve();

// =============================
// Middlewares
// =============================
app.use(cors());
app.use(express.json());

// =============================
// Serve frontend static files
// =============================

// public 폴더를 정적 파일로 제공
app.use(express.static(path.join(__dirnamePath, "public")));

// GET / 요청 → index.html 반환
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirnamePath, "public", "index.html"));
});

// =============================
// API Routes
// =============================
app.use("/api/chat", chatRouter);

// =============================
// Create HTTP + WebSocket server
// =============================
const server = createServer(app);

// CORS 설정: 프론트엔드 주소
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // Live Server로 테스트할 때
    methods: ["GET", "POST"]
  },
});

// Socket.io 연결 로직 사용
setupChatSocket(io);

// =============================
// MongoDB 연결 + 서버 시작
// =============================
const MONGO_URI = process.env.DATABASE_URL as string;

mongoose
  .connect(MONGO_URI, { dbName: "chatroom" })
  .then(() => {
    console.log("Connected to MongoDB database");

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
