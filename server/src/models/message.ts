import mongoose, { Schema, Document } from 'mongoose';
import { IMessage } from '../interfaces/message';

const MessageSchema: Schema = new Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IMessage & Document>('Message', MessageSchema);
