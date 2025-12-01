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
const express_1 = require("express");
const chat_model_1 = require("../models/chat.model");
const router = (0, express_1.Router)();
// GET /api/chat/:room → 특정 방의 메시지 받기
router.get("/:room", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = req.params.room;
        const messages = yield chat_model_1.Chat.find({ room }).sort({ createdAt: 1 });
        res.json(messages);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
}));
exports.default = router;
