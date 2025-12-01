"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const chat_socket_1 = __importDefault(require("./sockets/chat.socket"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// __dirname 설정 (TS에서 사용하려면 이렇게 해야 함)
const __dirnamePath = path_1.default.resolve();
// =============================
// Middlewares
// =============================
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// =============================
// Serve frontend static files
// =============================
// public 폴더를 정적 파일로 제공
app.use(express_1.default.static(path_1.default.join(__dirnamePath, "public")));
// GET / 요청 → index.html 반환
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirnamePath, "public", "index.html"));
});
// =============================
// API Routes
// =============================
app.use("/api/chat", chat_routes_1.default);
// =============================
// Create HTTP + WebSocket server
// =============================
const server = (0, http_1.createServer)(app);
// CORS 설정: 프론트엔드 주소
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500", // Live Server로 테스트할 때
        methods: ["GET", "POST"]
    },
});
// Socket.io 연결 로직 사용
(0, chat_socket_1.default)(io);
// =============================
// MongoDB 연결 + 서버 시작
// =============================
const MONGO_URI = process.env.DATABASE_URL;
mongoose_1.default
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
