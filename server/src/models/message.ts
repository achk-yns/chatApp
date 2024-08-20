import mongoose, { Document, Schema } from 'mongoose';
import { IMessage } from '../interfaces/message';


const MessageSchema = new Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messsage: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});


const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
