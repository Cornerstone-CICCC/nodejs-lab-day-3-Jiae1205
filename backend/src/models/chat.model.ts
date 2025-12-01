import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  username: string;
  message: string;
  room: string;
  createdAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    username: { type: String, required: true },
    message: { type: String, required: true },
    room: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
